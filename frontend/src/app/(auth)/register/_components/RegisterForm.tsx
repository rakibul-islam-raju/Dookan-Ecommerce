"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { TextField } from "@/components/ui/@form/TextField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { siteConfig } from "@/config";
import { useZodForm } from "@/hooks/useZodForm";
import { authApi } from "@/lib/api/auth";
import { useEmailVerificationStore } from "@/lib/store/useEmailVerificationStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z
	.object({
		first_name: z
			.string()
			.min(2, "First name must be at least 2 characters long"),
		last_name: z
			.string()
			.min(2, "Last name must be at least 2 characters long"),
		mobile_number: z
			.string()
			.min(11, {
				message: "Phone must be 11 characters",
			})
			.max(11, {
				message: "Phone must be 11 characters",
			})
			.regex(siteConfig.bangladeshiPhoneNumberRegex, {
				message: "Phone must be a valid Bangladeshi phone number",
			}),
		email: z.email({ message: "Please enter a valid email address" }),
		password: z.string().min(6, "Password must be at least 6 characters long"),
		confirmPassword: z
			.string()
			.min(6, "Password must be at least 6 characters long"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RegisterFormValues = z.infer<typeof schema>;

export const RegisterForm = () => {
	const router = useRouter();
	const setPendingEmail = useEmailVerificationStore(
		(state) => state.setPendingEmail
	);

	const form = useZodForm(schema, {
		defaultValues: {
			first_name: "",
			last_name: "",
			phone: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const { mutate: register, isPending } = useMutation({
		mutationFn: authApi.register,
		onSuccess: (data) => {
			// Store email for verification page
			setPendingEmail(data.email);
			toast.success("Registration successful! Please verify your email.");
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
					<TextField<RegisterFormValues> name="first_name" label="First Name" />
					<TextField<RegisterFormValues> name="last_name" label="Last Name" />
				</div>
				<TextField<RegisterFormValues>
					name="email"
					label="Email"
					type="email"
				/>
				<TextField<RegisterFormValues>
					name="mobile_number"
					label="Phone"
					type="tel"
				/>
				<PasswordField<RegisterFormValues> name="password" label="Password" />
				<PasswordField<RegisterFormValues>
					name="confirmPassword"
					label="Confirm Password"
				/>
			</div>
			<LoadingButton className="w-full" type="submit" isLoading={isPending}>
				Sign up
			</LoadingButton>
		</BaseForm>
	);
};
