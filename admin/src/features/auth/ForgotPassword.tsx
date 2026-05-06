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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

export function ForgotPassword() {
	const navigate = useNavigate();
	const [step, setStep] = useState<"email" | "reset">("email");
	const [email, setEmail] = useState("");
	const t = useT();
	const emailSchema = z.object({
		email: z.string().email(t("auth.validation.email", "Please enter a valid email address") as string),
	});
	const resetSchema = z
		.object({
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

	type EmailFormValues = z.infer<typeof emailSchema>;
	type ResetFormValues = z.infer<typeof resetSchema>;

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
			toast.success(t("auth.forgotPassword.otpSent", "OTP sent to your email address.") as string);
		},
	});

	const { mutate: confirmReset, isPending: isConfirming } = useMutation({
		mutationFn: (data: ResetFormValues) =>
			authApi.confirmPasswordReset(email, data.otp_code, data.new_password),
		onSuccess: () => {
			toast.success(t("auth.forgotPassword.resetSuccess", "Password reset successfully! Please login.") as string);
			navigate("/login");
		},
	});

	const handleResendOTP = async () => {
		await authApi.requestPasswordReset(email);
		toast.success(t("auth.forgotPassword.otpResent", "OTP resent to your email.") as string);
	};

	if (step === "reset") {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						<T id="auth.forgotPassword.resetTitle" defaultMessage="Reset Password" />
					</CardTitle>
					<CardDescription>
						<T
							id="auth.forgotPassword.resetDescription"
							defaultMessage="Enter the OTP sent to {email} and your new password."
							values={{
								email: <span className="font-medium text-foreground">{email}</span>,
							}}
						/>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<BaseForm form={resetForm} onSubmit={confirmReset}>
						<div className="grid gap-4">
							<TextField
								name="otp_code"
								label={t("auth.forgotPassword.verificationCode", "Verification Code") as string}
								placeholder={t("auth.forgotPassword.verificationPlaceholder", "Enter 6-digit OTP") as string}
								required
								description={t("auth.forgotPassword.verificationHelp", "Check your email for the verification code") as string}
							/>
							<PasswordField
								name="new_password"
								label={t("auth.forgotPassword.newPassword", "New Password") as string}
								placeholder={t("auth.forgotPassword.newPasswordPlaceholder", "Enter new password") as string}
								required
							/>
							<PasswordField
								name="confirm_password"
								label={t("auth.forgotPassword.confirmPassword", "Confirm Password") as string}
								placeholder={t("auth.forgotPassword.confirmPasswordPlaceholder", "Confirm new password") as string}
								required
							/>
							<LoadingButton
								type="submit"
								isLoading={isConfirming}
								className="w-full"
							>
								<T id="auth.forgotPassword.submit" defaultMessage="Reset Password" />
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
						<T id="auth.forgotPassword.changeEmail" defaultMessage="Change email" />
					</button>
					<Button
						type="button"
						variant="link"
						onClick={handleResendOTP}
						className="text-sm"
					>
						<T id="auth.forgotPassword.resendOtp" defaultMessage="Resend OTP" />
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">
					<T id="auth.forgotPassword.title" defaultMessage="Forgot Password" />
				</CardTitle>
				<CardDescription>
					<T
						id="auth.forgotPassword.description"
						defaultMessage="Enter your email to receive a password reset OTP"
					/>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={emailForm} onSubmit={requestReset}>
					<div className="grid gap-4">
						<TextField
							name="email"
							label={t("auth.login.email", "Email") as string}
							placeholder="m@example.com"
							type="email"
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isRequesting}
							className="w-full"
						>
							<T id="auth.forgotPassword.sendOtp" defaultMessage="Send OTP" />
						</LoadingButton>
					</div>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/login"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					<T
						id="auth.forgotPassword.rememberPassword"
						defaultMessage="Remember your password? Login"
					/>
				</Link>
			</CardFooter>
		</Card>
	);
}
