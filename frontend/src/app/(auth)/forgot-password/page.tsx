"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { OTPInput } from "@/components/ui/@form/OTPInput";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { ResendOTPButton } from "@/components/ui/@form/ResendOTPButton";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Link, useRouter } from "@/i18n/navigation";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

export default function ForgotPasswordPage() {
	const t = useTranslations("auth");
	const router = useRouter();
	const [step, setStep] = useState<"email" | "reset">("email");
	const [email, setEmail] = useState("");
	const emailSchema = z.object({
		email: z.string().email(t("invalidEmail")),
	});
	const resetSchema = z
		.object({
			otp_code: z
				.string()
				.length(6, t("otpLength"))
				.regex(/^\d+$/, t("otpNumbersOnly")),
			new_password: z.string().min(8, t("passwordMinLengthReset")),
			confirm_password: z.string(),
		})
		.refine((data) => data.new_password === data.confirm_password, {
			message: t("passwordsDoNotMatch"),
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
			toast.success(t("passwordResetOtpSent"));
		},
	});

	const { mutate: confirmReset, isPending: isConfirming } = useMutation({
		mutationFn: (data: ResetFormValues) =>
			authApi.confirmPasswordReset(email, data.otp_code, data.new_password),
		onSuccess: () => {
			toast.success(t("passwordResetSuccess"));
			router.push("/login");
		},
	});

	const handleResendOTP = async () => {
		await authApi.requestPasswordReset(email);
		toast.success(t("otpResent"));
	};

	if (step === "reset") {
		return (
			<div className="space-y-6">
				<div className="space-y-2 text-center lg:text-left">
					<h1 className="text-3xl font-bold tracking-tight">
						{t("resetPasswordTitle")}
					</h1>
					<p className="text-muted-foreground">
						{t("resetPasswordDescription", { email })}
					</p>
				</div>
				<BaseForm form={resetForm} onSubmit={confirmReset}>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{t("verificationCode")}
							</label>
							<OTPInput name="otp_code" length={6} />
						</div>
						<PasswordField
							name="new_password"
							label={t("newPassword")}
							placeholder={t("newPassword")}
							required
						/>
						<PasswordField
							name="confirm_password"
							label={t("confirmPassword")}
							placeholder={t("confirmPassword")}
							required
						/>
						<LoadingButton
							type="submit"
							isLoading={isConfirming}
							className="w-full"
						>
							{t("resetPassword")}
						</LoadingButton>
					</div>
				</BaseForm>
				<div className="flex items-center justify-between text-sm">
					<button
						type="button"
						onClick={() => setStep("email")}
						className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-4" />
						{t("changeEmail")}
					</button>
					<ResendOTPButton onResend={handleResendOTP} />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center lg:text-left">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("forgotPasswordTitle")}
				</h1>
				<p className="text-muted-foreground">
					{t("forgotPasswordDescription")}
				</p>
			</div>
			<BaseForm form={emailForm} onSubmit={requestReset}>
				<div className="space-y-4">
					<TextField
						name="email"
						label={t("email")}
						placeholder={t("emailPlaceholderAlt")}
						type="email"
						required
					/>
					<LoadingButton
						type="submit"
						isLoading={isRequesting}
						className="w-full"
					>
						{t("sendOtp")}
					</LoadingButton>
				</div>
			</BaseForm>
			<div className="text-center text-sm text-muted-foreground">
				<Link
					href="/login"
					className="inline-flex items-center justify-center gap-2 font-medium text-primary hover:underline"
				>
					<ArrowLeft className="size-4" />
					{t("backToLogin")}
				</Link>
			</div>
		</div>
	);
}
