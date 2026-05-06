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
import { queryKeys } from "@/constants/queryKeys";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api/auth";
import { queryClient } from "@/lib/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import z from "zod";

export function Login() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const intl = useIntl();
	const schema = z.object({
		email: z.email({
			message: intl.formatMessage({
				id: "auth.validation.email",
				defaultMessage: "Please enter a valid email address",
			}),
		}),
		password: z.string().min(
			6,
			intl.formatMessage({
				id: "auth.validation.passwordMin",
				defaultMessage: "Password must be at least 6 characters long",
			})
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
			toast.success(
				intl.formatMessage({
					id: "auth.login.success",
					defaultMessage: "Login successful!",
				})
			);
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
					{intl.formatMessage({
						id: "auth.login.title",
						defaultMessage: "Login",
					})}
				</CardTitle>
				<CardDescription>
					{intl.formatMessage({
						id: "auth.login.description",
						defaultMessage: "Enter your email below to log in to your account",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={form} onSubmit={onSubmit}>
					<div className="space-y-2">
						<TextField<LoginFormValues>
							name="email"
							label={intl.formatMessage({
								id: "auth.login.email",
								defaultMessage: "Email",
							})}
							type="email"
						/>
						<PasswordField<LoginFormValues>
							name="password"
							label={intl.formatMessage({
								id: "auth.login.password",
								defaultMessage: "Password",
							})}
						/>
					</div>
					<LoadingButton className="w-full" type="submit" isLoading={isPending}>
						{intl.formatMessage({
							id: "auth.login.submit",
							defaultMessage: "Sign in",
						})}
					</LoadingButton>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/forgot-password"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					{intl.formatMessage({
						id: "auth.login.forgotPassword",
						defaultMessage: "Forgot Password?",
					})}
				</Link>
			</CardFooter>
		</Card>
	);
}
