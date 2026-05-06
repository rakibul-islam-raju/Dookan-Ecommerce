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
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

export function SetPassword() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const t = useT();
	const setPasswordSchema = z
		.object({
			email: z.string().email(t("auth.validation.email", "Please enter a valid email address") as string),
			otp_code: z
				.string()
				.length(
					6,
					t("auth.forgotPassword.otpLength", "OTP must be 6 digits") as string
				)
				.regex(
					/^\d+$/,
					t("auth.forgotPassword.otpNumbers", "OTP must contain only numbers") as string
				),
			new_password: z.string().min(
				8,
				t("auth.forgotPassword.passwordMin", "Password must be at least 8 characters") as string
			),
			confirm_password: z.string(),
		})
		.refine((data) => data.new_password === data.confirm_password, {
			message: t("auth.forgotPassword.passwordsMismatch", "Passwords do not match") as string,
			path: ["confirm_password"],
		});

	type SetPasswordValues = z.infer<typeof setPasswordSchema>;

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
			toast.success(t("auth.setPassword.success", "Password set successfully. You can now log in.") as string);
			navigate("/login");
		},
	});

	const { mutate: resendCode, isPending: isResendingCode } = useMutation({
		mutationFn: (email: string) => authApi.requestPasswordReset(email),
		onSuccess: () => {
			toast.success(t("auth.setPassword.resent", "A fresh password setup code has been sent to your email.") as string);
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
				message: t("auth.setPassword.invalidEmail", "Enter a valid email before requesting a new code") as string,
			});
			return;
		}

		resendCode(email);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">
					<T id="auth.setPassword.title" defaultMessage="Set Your Password" />
				</CardTitle>
				<CardDescription>
					{hasInviteLink
						? t("auth.setPassword.description.invite", "Choose a password to finish setting up your admin account.")
						: t("auth.setPassword.description.manual", "Enter the email and code from your invitation, then choose a password.")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={form} onSubmit={setPassword}>
					<div className="grid gap-4">
						<TextField
							name="email"
							label={t("auth.login.email", "Email") as string}
							type="email"
							placeholder="m@example.com"
							required
							disabled={hasInviteLink}
							description={
								hasInviteLink
									? (t("auth.setPassword.emailDescription", "This invite is linked to the email address below.") as string)
									: undefined
							}
						/>
						{!hasInviteLink && (
							<TextField
								name="otp_code"
								label={t("auth.setPassword.invitationCode", "Invitation Code") as string}
								placeholder={t("auth.setPassword.invitationPlaceholder", "Enter 6-digit code") as string}
								required
								description={t("auth.setPassword.invitationHelp", "Use the code from your email if the invite link was not opened directly.") as string}
							/>
						)}
						<PasswordField
							name="new_password"
							label={t("auth.setPassword.newPassword", "New Password") as string}
							placeholder={t("auth.setPassword.newPasswordPlaceholder", "Enter your password") as string}
							required
						/>
						<PasswordField
							name="confirm_password"
							label={t("auth.setPassword.confirmPassword", "Confirm Password") as string}
							placeholder={t("auth.setPassword.confirmPasswordPlaceholder", "Confirm your password") as string}
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isSettingPassword}
							className="w-full"
						>
							<T id="auth.setPassword.submit" defaultMessage="Set Password" />
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
					<T id="auth.setPassword.backToLogin" defaultMessage="Back to login" />
				</Link>
				<Button
					type="button"
					variant="link"
					onClick={handleResendCode}
					disabled={isResendingCode}
					className="text-sm"
				>
					<T id="auth.setPassword.requestNewCode" defaultMessage="Request new code" />
				</Button>
			</CardFooter>
		</Card>
	);
}
