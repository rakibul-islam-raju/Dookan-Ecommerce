"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { siteConfig } from "@/config";
import { useZodForm } from "@/hooks/useZodForm";
import { useRouter } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { z } from "zod";

export const RegisterForm = () => {
	const t = useTranslations("auth");
	const router = useRouter();
	const schema = z
		.object({
			first_name: z.string().min(2, t("firstNameMinLength")),
			last_name: z.string().min(2, t("lastNameMinLength")),
			mobile_number: z
				.string()
				.min(11, {
					message: t("phoneLength"),
				})
				.max(11, {
					message: t("phoneLength"),
				})
				.regex(siteConfig.bangladeshiPhoneNumberRegex, {
					message: t("phoneInvalid"),
				}),
			email: z.email({ message: t("invalidEmail") }),
			password: z.string().min(6, t("passwordMinLength")),
			confirmPassword: z.string().min(6, t("passwordMinLength")),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t("passwordsDoNotMatch"),
			path: ["confirmPassword"],
		});

	type RegisterFormValues = z.infer<typeof schema>;
	const setPendingEmail = useEmailVerificationStore(
		(state) => state.setPendingEmail
	);

	const form = useZodForm(schema, {
		defaultValues: {
			first_name: "",
			last_name: "",
			mobile_number: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const { mutate: register, isPending } = useMutation({
		mutationFn: authApi.register,
		onSuccess: (data) => {
			setPendingEmail(data.email);
			toast.success(t("registerSuccessVerify"));
			router.push("/verify-email");
		},
	});

	const onSubmit = async (data: RegisterFormValues) => {
		register(data);
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TextField<RegisterFormValues>
						name="first_name"
						label={t("firstName")}
					/>
					<TextField<RegisterFormValues>
						name="last_name"
						label={t("lastName")}
					/>
				</div>
				<TextField<RegisterFormValues>
					name="email"
					label={t("email")}
					type="email"
				/>
				<TextField<RegisterFormValues>
					name="mobile_number"
					label={t("phone")}
					type="tel"
				/>
				<PasswordField<RegisterFormValues>
					name="password"
					label={t("password")}
				/>
				<PasswordField<RegisterFormValues>
					name="confirmPassword"
					label={t("confirmPassword")}
				/>
			</div>
			<LoadingButton className="w-full" type="submit" isLoading={isPending}>
				{t("signUp")}
			</LoadingButton>
		</BaseForm>
	);
};
