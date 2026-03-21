"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { OTPInput } from "@/components/ui/@form/OTPInput";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { ResendOTPButton } from "@/components/ui/@form/ResendOTPButton";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function ForgotPasswordPage() {
	const router = useRouter();
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
			router.push("/login");
		},
	});

	const handleResendOTP = async () => {
		await authApi.requestPasswordReset(email);
		toast.success("OTP resent to your email.");
	};

	if (step === "reset") {
		return (
			<div className="space-y-6">
				<div className="space-y-2 text-center lg:text-left">
					<h1 className="text-3xl font-bold tracking-tight">
						Reset password
					</h1>
					<p className="text-muted-foreground">
						Enter the OTP sent to{" "}
						<span className="font-medium text-foreground">{email}</span> and
						your new password.
					</p>
				</div>
				<BaseForm form={resetForm} onSubmit={confirmReset}>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Verification Code</label>
							<OTPInput name="otp_code" length={6} />
						</div>
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
				<div className="flex items-center justify-between text-sm">
					<button
						type="button"
						onClick={() => setStep("email")}
						className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="size-4" />
						Change email
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
					Forgot password?
				</h1>
				<p className="text-muted-foreground">
					Enter your email address and we&apos;ll send you an OTP to reset your
					password.
				</p>
			</div>
			<BaseForm form={emailForm} onSubmit={requestReset}>
				<div className="space-y-4">
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
			<div className="text-center text-sm text-muted-foreground">
				<Link
					href="/login"
					className="inline-flex items-center justify-center gap-2 font-medium text-primary hover:underline"
				>
					<ArrowLeft className="size-4" />
					Back to login
				</Link>
			</div>
		</div>
	);
}
