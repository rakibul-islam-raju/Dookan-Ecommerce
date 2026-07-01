"use client";

import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Separator } from "@/components/ui/separator";
import { useZodForm } from "@/hooks/useZodForm";
import { useMe, useUpdateProfile } from "@/lib/hooks/useUser";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { z } from "zod";

const createProfileSchema = (t: (key: string) => string) => z.object({
	first_name: z.string().min(1, t("validation.firstNameRequired")),
	last_name: z.string().min(1, t("validation.lastNameRequired")),
	email: z.string().email(t("validation.invalidEmail")),
	mobile_number: z
		.string()
		.min(1, t("validation.mobileRequired"))
		.regex(/^[0-9]{11}$/, t("validation.mobileDigits")),
});

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

export default function ProfilePage() {
	const t = useTranslations("account");
	const { data: user, isLoading } = useMe();
	const updateProfile = useUpdateProfile();
	const profileSchema = useMemo(() => createProfileSchema(t), [t]);

	const form = useZodForm(profileSchema, {
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			mobile_number: "",
		},
	});

	// Update form data when user data loads
	useEffect(() => {
		if (user) {
			form.reset({
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				email: user.email || "",
				mobile_number: user.mobile_number || "",
			});
		}
	}, [user, form]);

	const handleSubmit = async (data: ProfileFormValues) => {
		await updateProfile.mutateAsync({
			...data,
			mobile_number: data.mobile_number || "",
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold font-serif">{t("profileTitle")}</h2>
					<p className="text-muted-foreground">
						{t("profileDescription")}
					</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">{t("loadingProfile")}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold font-serif">{t("profileTitle")}</h2>
				<p className="text-muted-foreground">
					{t("profileDescription")}
				</p>
			</div>

			<Separator />

			<BaseForm
				form={form}
				onSubmit={handleSubmit}
				className="space-y-8 max-w-xl"
			>
				{/* Personal Info */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">{t("personalInformation")}</h3>
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<label htmlFor="first_name" className="text-sm font-medium">
									{t("firstName")}
								</label>
								<Input
									id="first_name"
									{...form.register("first_name")}
									placeholder={t("firstNamePlaceholder")}
								/>
								{form.formState.errors.first_name && (
									<p className="text-sm text-red-600">
										{form.formState.errors.first_name.message}
									</p>
								)}
							</div>
							<div className="grid gap-2">
								<label htmlFor="last_name" className="text-sm font-medium">
									{t("lastName")}
								</label>
								<Input
									id="last_name"
									{...form.register("last_name")}
									placeholder={t("lastNamePlaceholder")}
								/>
								{form.formState.errors.last_name && (
									<p className="text-sm text-red-600">
										{form.formState.errors.last_name.message}
									</p>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<label htmlFor="email" className="text-sm font-medium">
								{t("email")}
							</label>
							<Input id="email" type="email" {...form.register("email")} />
							{form.formState.errors.email && (
								<p className="text-sm text-red-600">
									{form.formState.errors.email.message}
								</p>
							)}
							<p className="text-[0.8rem] text-muted-foreground">
								{t("emailHelp")}
							</p>
						</div>
						<div className="grid gap-2">
							<label htmlFor="mobile_number" className="text-sm font-medium">
								{t("mobileNumber")}
							</label>
							<Input
								id="mobile_number"
								type="tel"
								{...form.register("mobile_number")}
								placeholder="01XXXXXXXXX"
							/>
							{form.formState.errors.mobile_number && (
								<p className="text-sm text-red-600">
									{form.formState.errors.mobile_number.message}
								</p>
							)}
						</div>
					</div>
				</div>

				<Separator />

				{/* Password Change */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">{t("passwordSecurity")}</h3>
					<div className="flex items-center justify-between p-4 border rounded-lg">
						<div>
							<p className="font-medium">{t("password")}</p>
							<p className="text-sm text-muted-foreground">
								{t("lastUpdatedRecently")}
							</p>
						</div>
						<ChangePasswordModal>
							<Button type="button" variant="outline">
								{t("changePassword")}
							</Button>
						</ChangePasswordModal>
					</div>
				</div>

				<div className="flex justify-end gap-4">
					<Button
						variant="outline"
						type="button"
						onClick={() => window.location.reload()}
					>
						{t("cancel")}
					</Button>
					<LoadingButton
						type="button"
						isLoading={updateProfile.isPending}
						onClick={() => form.handleSubmit(handleSubmit)()}
					>
						{updateProfile.isPending ? t("saving") : t("saveChanges")}
					</LoadingButton>
				</div>
			</BaseForm>
		</div>
	);
}
