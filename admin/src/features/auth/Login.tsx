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
import { toast } from "react-toastify";
import z from "zod";

const schema = z.object({
	email: z.email({ message: "Please enter a valid email address" }),
	password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof schema>;

export function Login() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);

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
			toast.success("Login successful!");
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
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BaseForm form={form} onSubmit={onSubmit}>
					<div className="space-y-2">
						<TextField<LoginFormValues>
							name="email"
							label="Email"
							type="email"
						/>
						<PasswordField<LoginFormValues> name="password" label="Password" />
					</div>
					<LoadingButton className="w-full" type="submit" isLoading={isPending}>
						Sign in
					</LoadingButton>
				</BaseForm>
			</CardContent>
			<CardFooter>
				<Link
					to="/forgot-password"
					className="text-sm text-center w-full text-muted-foreground hover:underline"
				>
					Forgot Password?
				</Link>
			</CardFooter>
		</Card>
	);
}
