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
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { z } from "zod";

export function ForgotPassword() {
	const navigate = useNavigate();
	const [step, setStep] = useState<"email" | "reset">("email");
	const [email, setEmail] = useState("");
	const intl = useIntl();
	const emailSchema = z.object({
		email: z.string().email(
			intl.formatMessage({
				id: "auth.validation.email",
				defaultMessage: "Please enter a valid email address",
			})
		),
	});
	const resetSchema = z
		.object({
			otp_code: z
				.string()
				.length(
					6,
					intl.formatMessage({
						id: "auth.forgotPassword.otpLength",
						defaultMessage: "OTP must be 6 digits",
					})
				)
				.regex(
					/^\d+$/,
					intl.formatMessage({
						id: "auth.forgotPassword.otpNumbers",
						defaultMessage: "OTP must contain only numbers",
					})
				),
			new_password: z.string().min(
				8,
				intl.formatMessage({
					id: "auth.forgotPassword.passwordMin",
					defaultMessage: "Password must be at least 8 characters",
				})
			),
			confirm_password: z.string(),
		})
		.refine((data) => data.new_password === data.confirm_password, {
			message: intl.formatMessage({
				id: "auth.forgotPassword.passwordsMismatch",
				defaultMessage: "Passwords do not match",
			}),
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
			toast.success(
				intl.formatMessage({
					id: "auth.forgotPassword.otpSent",
					defaultMessage: "OTP sent to your email address.",
				})
			);
		},
	});

	const { mutate: confirmReset, isPending: isConfirming } = useMutation({
		mutationFn: (data: ResetFormValues) =>
			authApi.confirmPasswordReset(email, data.otp_code, data.new_password),
		onSuccess: () => {
			toast.success(
				intl.formatMessage({
					id: "auth.forgotPassword.resetSuccess",
					defaultMessage: "Password reset successfully! Please login.",
				})
			);
			navigate("/login");
		},
	});

	const handleResendOTP = async () => {
		await authApi.requestPasswordReset(email);
		toast.success(
			intl.formatMessage({
				id: "auth.forgotPassword.otpResent",
				defaultMessage: "OTP resent to your email.",
			})
		);
	};

	if (step === "reset") {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						{intl.formatMessage({
							id: "auth.forgotPassword.resetTitle",
							defaultMessage: "Reset Password",
						})}
					</CardTitle>
					<CardDescription>
						{intl.formatMessage(
							{
								id: "auth.forgotPassword.resetDescription",
								defaultMessage:
									"Enter the OTP sent to {email} and your new password.",
							},
							{
								email: <span className="font-medium text-foreground">{email}</span>,
							}
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<BaseForm form={resetForm} onSubmit={confirmReset}>
						<div className="grid gap-4">
							<TextField
								name="otp_code"
								label={intl.formatMessage({
									id: "auth.forgotPassword.verificationCode",
									defaultMessage: "Verification Code",
								})}
								placeholder={intl.formatMessage({
									id: "auth.forgotPassword.verificationPlaceholder",
									defaultMessage: "Enter 6-digit OTP",
								})}
								required
								description={intl.formatMessage({
									id: "auth.forgotPassword.verificationHelp",
									defaultMessage: "Check your email for the verification code",
								})}
							/>
							<PasswordField
								name="new_password"
								label={intl.formatMessage({
									id: "auth.forgotPassword.newPassword",
									defaultMessage: "New Password",
								})}
								placeholder={intl.formatMessage({
									id: "auth.forgotPassword.newPasswordPlaceholder",
									defaultMessage: "Enter new password",
								})}
								required
							/>
							<PasswordField
								name="confirm_password"
								label={intl.formatMessage({
									id: "auth.forgotPassword.confirmPassword",
									defaultMessage: "Confirm Password",
								})}
								placeholder={intl.formatMessage({
									id: "auth.forgotPassword.confirmPasswordPlaceholder",
									defaultMessage: "Confirm new password",
								})}
								required
							/>
							<LoadingButton
								type="submit"
								isLoading={isConfirming}
								className="w-full"
							>
								{intl.formatMessage({
									id: "auth.forgotPassword.submit",
									defaultMessage: "Reset Password",
								})}
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
						{intl.formatMessage({
							id: "auth.forgotPassword.changeEmail",
							defaultMessage: "Change email",
						})}
					</button>
					<Button
						type="button"
						variant="link"
						onClick={handleResendOTP}
						className="text-sm"
					>
						{intl.formatMessage({
							id: "auth.forgotPassword.resendOtp",
							defaultMessage: "Resend OTP",
						})}
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">
					{intl.formatMessage({
						id: "auth.forgotPassword.title",
						defaultMessage: "Forgot Password",
					})}
				</CardTitle>
				<CardDescription>
					{intl.formatMessage({
						id: "auth.forgotPassword.description",
						defaultMessage: "Enter your email to receive a password reset OTP",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={emailForm} onSubmit={requestReset}>
					<div className="grid gap-4">
						<TextField
							name="email"
							label={intl.formatMessage({
								id: "auth.login.email",
								defaultMessage: "Email",
							})}
							placeholder="m@example.com"
							type="email"
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isRequesting}
							className="w-full"
						>
							{intl.formatMessage({
								id: "auth.forgotPassword.sendOtp",
								defaultMessage: "Send OTP",
							})}
						</LoadingButton>
					</div>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/login"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					{intl.formatMessage({
						id: "auth.forgotPassword.rememberPassword",
						defaultMessage: "Remember your password? Login",
					})}
				</Link>
			</CardFooter>
		</Card>
	);
}
