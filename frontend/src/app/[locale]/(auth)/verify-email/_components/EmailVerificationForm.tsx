"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { OTPInput } from "@/components/ui/@form/OTPInput";
import { ResendOTPButton } from "@/components/ui/@form/ResendOTPButton";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { useResendVerification, useVerifyEmail } from "@/lib/hooks/useAuth";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

function maskEmail(email: string): string {
	const [local, domain] = email.split("@");
	if (!domain || local.length <= 1) return email;
	return `${local[0]}${"*".repeat(Math.min(local.length - 1, 3))}@${domain}`;
}

export function EmailVerificationForm() {
	const t = useTranslations("auth");
	const emailSchema = z.object({
		email: z.email({ message: t("invalidEmail") }),
	});
	const otpSchema = z.object({
		otp_code: z
			.string()
			.length(6, t("otpExactLength"))
			.regex(/^\d{6}$/, t("otpNumbersOnly")),
	});

	type EmailFormValues = z.infer<typeof emailSchema>;
	type VerifyEmailFormValues = z.infer<typeof otpSchema>;
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
		resendVerification.mutate({ email: data.email });
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
								{t("verifyEmailDescription")}
							</p>
						</div>
						<TextField
							name="email"
							label={t("email")}
							placeholder={t("emailPlaceholder")}
							required
							type="email"
						/>
						<LoadingButton
							type="submit"
							className="w-full"
							isLoading={resendVerification.isPending}
						>
							{t("sendVerificationCode")}
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
					{t("enterCodeSentTo", { email: maskEmail(email) })}
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
						{t("verifyEmail")}
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
						{t("useDifferentEmail")}
					</button>
				</div>
			</BaseForm>
		</div>
	);
}
