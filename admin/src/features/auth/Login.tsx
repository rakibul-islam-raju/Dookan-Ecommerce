import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
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
import { queryKeys } from "@/constants/queryKeys";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api/auth";
import { queryClient } from "@/lib/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import z from "zod";

export function Login() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const t = useT();
	const schema = z.object({
		email: z.email({
			message: t("auth.validation.email", "Please enter a valid email address") as string,
		}),
		password: z.string().min(
			6,
			t("auth.validation.passwordMin", "Password must be at least 6 characters long") as string
		),
	});

	type LoginFormValues = z.infer<typeof schema>;

	const form = useZodForm(schema, {
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutate: login, isPending } = useMutation({
		mutationFn: authApi.login,
		onSuccess: (response) => {
			setAuth(response.user, response.access, response.refresh);
			toast.success(t("auth.login.success", "Login successful!") as string);
			navigate("/");
			queryClient.invalidateQueries({ queryKey: [queryKeys.me] });
		},
		onError: (error) => {
			console.error(error);
			// Error toast is handled by axios interceptor
		},
	});

	const onSubmit = (data: LoginFormValues) => {
		login(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">
					<T id="auth.login.title" defaultMessage="Login" />
				</CardTitle>
				<CardDescription>
					<T
						id="auth.login.description"
						defaultMessage="Enter your email below to log in to your account"
					/>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={form} onSubmit={onSubmit}>
					<div className="space-y-2">
						<TextField<LoginFormValues>
							name="email"
							label={t("auth.login.email", "Email") as string}
							type="email"
						/>
						<PasswordField<LoginFormValues>
							name="password"
							label={t("auth.login.password", "Password") as string}
						/>
					</div>
					<LoadingButton className="w-full" type="submit" isLoading={isPending}>
						<T id="auth.login.submit" defaultMessage="Sign in" />
					</LoadingButton>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/forgot-password"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					<T id="auth.login.forgotPassword" defaultMessage="Forgot Password?" />
				</Link>
			</CardFooter>
		</Card>
	);
}
