"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { queryKeys } from "@/constants/queryKeys";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api";
import { LoginResponse } from "@/lib/api/auth";
import { queryClient } from "@/lib/react-query";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
	email: z.email({ message: "Please enter a valid email address" }),
	password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof schema>;

export const LoginForm = () => {
	const router = useRouter();

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
			toast.success("Login successful!");
			router.push("/");
			queryClient.invalidateQueries({ queryKey: [queryKeys.me] });
		},
		onError: (error: AxiosError<{ detail?: string; message?: string }>) => {
			const errorMessage =
				error.response?.data?.detail || error.response?.data?.message;

			// Check for unverified email error
			if (errorMessage === "Please verify your email before logging in.") {
				// Store the email for verification
				const email = form.getValues("email");
				setPendingEmail(email);

				// Redirect to verification page
				router.push("/verify-email");
				return;
			}

			// Other errors are handled by axios interceptor
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
					label="Email"
					placeholder="you@example.com"
					required
					type="email"
				/>
				<PasswordField
					name="password"
					label="Password"
					placeholder="••••••••"
					required
				/>
			</div>

			<LoadingButton type="submit" isLoading={isPending} className="w-full">
				Login
			</LoadingButton>
		</BaseForm>
	);
};
