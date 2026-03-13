"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { OTPInput } from "@/components/ui/@form/OTPInput";
import { ResendOTPButton } from "@/components/ui/@form/ResendOTPButton";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { useResendVerification, useVerifyEmail } from "@/lib/hooks/useAuth";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const emailSchema = z.object({
	email: z.email({ message: "Please enter a valid email address" }),
});

const otpSchema = z.object({
	otp_code: z
		.string()
		.length(6, "OTP must be exactly 6 digits")
		.regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type VerifyEmailFormValues = z.infer<typeof otpSchema>;

// Helper to mask email: "john@example.com" -> "j***@example.com"
function maskEmail(email: string): string {
	const [local, domain] = email.split("@");
	if (!domain || local.length <= 1) return email;
	return `${local[0]}${"*".repeat(Math.min(local.length - 1, 3))}@${domain}`;
}

export function EmailVerificationForm() {
	const { pendingEmail, setPendingEmail, clearPendingEmail } =
		useEmailVerificationStore();

	const [email, setEmail] = useState(pendingEmail || "");
	const [isEmailSubmitted, setIsEmailSubmitted] = useState(!!pendingEmail);

	const verifyEmail = useVerifyEmail();
	const resendVerification = useResendVerification();

	const emailForm = useZodForm(emailSchema, {
		defaultValues: {
			email: pendingEmail || "",
		},
	});

	const otpForm = useZodForm(otpSchema, {
		defaultValues: {
			otp_code: "",
		},
	});

	const onEmailSubmit = (data: EmailFormValues) => {
		setEmail(data.email);
		setPendingEmail(data.email);
		setIsEmailSubmitted(true);
		// Automatically resend OTP when email is submitted
		resendVerification.mutate(
			{ email: data.email },
			{
				onSuccess: () => {
					toast.success("Verification code sent to your email");
				},
			}
		);
	};

	const onOtpSubmit = (data: VerifyEmailFormValues) => {
		if (!email) return;

		verifyEmail.mutate(
			{ email, otp_code: data.otp_code },
			{
				onSuccess: () => {
					clearPendingEmail();
				},
			}
		);
	};

	const handleResend = () => {
		if (!email) return;
		resendVerification.mutate({ email });
	};

	const handleBackToEmail = () => {
		setIsEmailSubmitted(false);
	};

	if (!isEmailSubmitted) {
		return (
			<div className="space-y-6">
				<BaseForm form={emailForm} onSubmit={onEmailSubmit}>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground mb-4">
								Enter your email address to receive a verification code.
							</p>
						</div>
						<TextField
							name="email"
							label="Email"
							placeholder="you@example.com"
							required
							type="email"
						/>
						<LoadingButton
							type="submit"
							className="w-full"
							isLoading={resendVerification.isPending}
						>
							Send Verification Code
						</LoadingButton>
					</div>
				</BaseForm>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<p className="text-sm text-muted-foreground">
					Enter the code sent to{" "}
					<span className="font-medium text-foreground">
						{maskEmail(email)}
					</span>
				</p>
			</div>

			<BaseForm form={otpForm} onSubmit={onOtpSubmit}>
				<div className="space-y-6">
					<OTPInput<VerifyEmailFormValues> name="otp_code" />

					<LoadingButton
						type="submit"
						className="w-full"
						isLoading={verifyEmail.isPending}
					>
						Verify Email
					</LoadingButton>

					<div className="text-center">
						<ResendOTPButton
							onResend={handleResend}
							isLoading={resendVerification.isPending}
							cooldownSeconds={60}
						/>
					</div>

					<button
						type="button"
						onClick={handleBackToEmail}
						className="text-sm text-muted-foreground hover:text-primary underline w-full"
					>
						Use a different email
					</button>
				</div>
			</BaseForm>
		</div>
	);
}
