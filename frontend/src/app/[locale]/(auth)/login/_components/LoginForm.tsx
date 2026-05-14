"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { queryKeys } from "@/constants/queryKeys";
import { useZodForm } from "@/hooks/useZodForm";
import { useRouter } from "@/i18n/navigation";
import { authApi } from "@/lib/api";
import { LoginResponse } from "@/lib/api/auth";
import { queryClient } from "@/lib/react-query";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { z } from "zod";

export const LoginForm = () => {
	const t = useTranslations("auth");
	const router = useRouter();
	const schema = z.object({
		email: z.email({ message: t("invalidEmail") }),
		password: z.string().min(6, t("passwordMinLength")),
	});

	type LoginFormValues = z.infer<typeof schema>;
	const setAuth = useAuthStore((state) => state.setAuth);
	const setPendingEmail = useEmailVerificationStore(
		(state) => state.setPendingEmail
	);

	const form = useZodForm(schema, {
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutate: login, isPending } = useMutation({
		mutationFn: authApi.login,
		onSuccess: (response: LoginResponse) => {
			setAuth(response.user, response.access, response.refresh);
			toast.success(t("loginSuccess"));
			router.push("/");
			queryClient.invalidateQueries({ queryKey: [queryKeys.me] });
		},
		onError: (error: AxiosError<{ detail?: string; message?: string }>) => {
			const errorMessage =
				error.response?.data?.detail || error.response?.data?.message;

			if (errorMessage === "Please verify your email before logging in.") {
				const email = form.getValues("email");
				setPendingEmail(email);
				router.push("/verify-email");
			}
		},
	});

	const onSubmit = (data: LoginFormValues) => {
		login(data);
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="email"
					label={t("email")}
					placeholder={t("emailPlaceholder")}
					required
					type="email"
				/>
				<PasswordField
					name="password"
					label={t("password")}
					placeholder="••••••••"
					required
				/>
			</div>

			<LoadingButton type="submit" isLoading={isPending} className="w-full">
				{t("login")}
			</LoadingButton>
		</BaseForm>
	);
};
