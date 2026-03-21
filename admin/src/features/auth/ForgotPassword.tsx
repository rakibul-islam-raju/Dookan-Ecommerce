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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

const emailSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z
	.object({
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

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function ForgotPassword() {
	const navigate = useNavigate();
	const [step, setStep] = useState<"email" | "reset">("email");
	const [email, setEmail] = useState("");

	const emailForm = useZodForm(emailSchema, {
		defaultValues: { email: "" },
	});

	const resetForm = useZodForm(resetSchema, {
		defaultValues: { otp_code: "", new_password: "", confirm_password: "" },
	});

	const { mutate: requestReset, isPending: isRequesting } = useMutation({
		mutationFn: (data: EmailFormValues) =>
			authApi.requestPasswordReset(data.email),
		onSuccess: () => {
			setEmail(emailForm.getValues("email"));
			setStep("reset");
			toast.success("OTP sent to your email address.");
		},
	});

	const { mutate: confirmReset, isPending: isConfirming } = useMutation({
		mutationFn: (data: ResetFormValues) =>
			authApi.confirmPasswordReset(email, data.otp_code, data.new_password),
		onSuccess: () => {
			toast.success("Password reset successfully! Please login.");
			navigate("/login");
		},
	});

	const handleResendOTP = async () => {
		await authApi.requestPasswordReset(email);
		toast.success("OTP resent to your email.");
	};

	if (step === "reset") {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Reset Password</CardTitle>
					<CardDescription>
						Enter the OTP sent to{" "}
						<span className="font-medium text-foreground">{email}</span> and
						your new password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<BaseForm form={resetForm} onSubmit={confirmReset}>
						<div className="grid gap-4">
							<TextField
								name="otp_code"
								label="Verification Code"
								placeholder="Enter 6-digit OTP"
								required
								description="Check your email for the verification code"
							/>
							<PasswordField
								name="new_password"
								label="New Password"
								placeholder="Enter new password"
								required
							/>
							<PasswordField
								name="confirm_password"
								label="Confirm Password"
								placeholder="Confirm new password"
								required
							/>
							<LoadingButton
								type="submit"
								isLoading={isConfirming}
								className="w-full"
							>
								Reset Password
							</LoadingButton>
						</div>
					</BaseForm>
				</CardContent>
				<CardFooter className="flex justify-between">
					<button
						type="button"
						onClick={() => setStep("email")}
						className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-4" />
						Change email
					</button>
					<Button
						type="button"
						variant="link"
						onClick={handleResendOTP}
						className="text-sm"
					>
						Resend OTP
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Forgot Password</CardTitle>
				<CardDescription>
					Enter your email to receive a password reset OTP
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={emailForm} onSubmit={requestReset}>
					<div className="grid gap-4">
						<TextField
							name="email"
							label="Email"
							placeholder="m@example.com"
							type="email"
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isRequesting}
							className="w-full"
						>
							Send OTP
						</LoadingButton>
					</div>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/login"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					Remember your password? Login
				</Link>
			</CardFooter>
		</Card>
	);
}
