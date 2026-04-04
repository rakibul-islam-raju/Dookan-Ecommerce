import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

const setPasswordSchema = z
	.object({
		email: z.string().email("Please enter a valid email address"),
		otp_code: z
			.string()
			.length(6, "OTP must be 6 digits")
			.regex(/^\d+$/, "OTP must contain only numbers"),
		new_password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_password: z.string(),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export function SetPassword() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const emailFromQuery = searchParams.get("email") ?? "";
	const otpFromQuery = searchParams.get("otp") ?? "";
	const hasInviteLink = Boolean(emailFromQuery && otpFromQuery);

	const form = useZodForm(setPasswordSchema, {
		defaultValues: {
			email: emailFromQuery,
			otp_code: otpFromQuery,
			new_password: "",
			confirm_password: "",
		},
	});

	useEffect(() => {
		form.reset({
			email: emailFromQuery,
			otp_code: otpFromQuery,
			new_password: "",
			confirm_password: "",
		});
	}, [emailFromQuery, otpFromQuery, form]);

	const { mutate: setPassword, isPending: isSettingPassword } = useMutation({
		mutationFn: (data: SetPasswordValues) =>
			authApi.confirmPasswordReset(
				data.email,
				data.otp_code,
				data.new_password
			),
		onSuccess: () => {
			toast.success("Password set successfully. You can now log in.");
			navigate("/login");
		},
	});

	const { mutate: resendCode, isPending: isResendingCode } = useMutation({
		mutationFn: (email: string) => authApi.requestPasswordReset(email),
		onSuccess: () => {
			toast.success("A fresh password setup code has been sent to your email.");
			if (emailFromQuery || otpFromQuery) {
				setSearchParams({ email: form.getValues("email") });
			}
		},
	});

	const handleResendCode = () => {
		const email = form.getValues("email");
		const parsed = z.string().email().safeParse(email);

		if (!parsed.success) {
			form.setError("email", {
				type: "manual",
				message: "Enter a valid email before requesting a new code",
			});
			return;
		}

		resendCode(email);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Set Your Password</CardTitle>
				<CardDescription>
					{hasInviteLink
						? "Choose a password to finish setting up your admin account."
						: "Enter the email and code from your invitation, then choose a password."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={form} onSubmit={setPassword}>
					<div className="grid gap-4">
						<TextField
							name="email"
							label="Email"
							type="email"
							placeholder="m@example.com"
							required
							disabled={hasInviteLink}
							description={
								hasInviteLink
									? "This invite is linked to the email address below."
									: undefined
							}
						/>
						{!hasInviteLink && (
							<TextField
								name="otp_code"
								label="Invitation Code"
								placeholder="Enter 6-digit code"
								required
								description="Use the code from your email if the invite link was not opened directly."
							/>
						)}
						<PasswordField
							name="new_password"
							label="New Password"
							placeholder="Enter your password"
							required
						/>
						<PasswordField
							name="confirm_password"
							label="Confirm Password"
							placeholder="Confirm your password"
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isSettingPassword}
							className="w-full"
						>
							Set Password
						</LoadingButton>
					</div>
				</BaseForm>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Link
					to="/login"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to login
				</Link>
				<Button
					type="button"
					variant="link"
					onClick={handleResendCode}
					disabled={isResendingCode}
					className="text-sm"
				>
					Request new code
				</Button>
			</CardFooter>
		</Card>
	);
}
