"use client";

import { BaseForm } from "@/components/ui/@form/BaseForm";
import { PasswordField } from "@/components/ui/@form/PasswordField";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { useChangePassword } from "@/lib/hooks/useUser";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { z } from "zod";

const createSchema = (t: (key: string) => string) => z
	.object({
		old_password: z.string().min(1, t("validation.currentPasswordRequired")),
		new_password: z
			.string()
			.min(6, t("validation.newPasswordMin")),
		confirm_password: z
			.string()
			.min(6, t("validation.confirmPasswordMin")),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: t("validation.passwordsDoNotMatch"),
		path: ["confirm_password"],
	});

type ChangePasswordFormValues = z.infer<ReturnType<typeof createSchema>>;

export const ChangePasswordModal = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const t = useTranslations("account");
	const [isOpen, setIsOpen] = useState(false);

	const changePassword = useChangePassword();
	const schema = useMemo(() => createSchema(t), [t]);

	const passForm = useZodForm(schema, {
		defaultValues: {
			old_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const onSubmit = async (
		data: ChangePasswordFormValues,
		e?: React.BaseSyntheticEvent
	) => {
		e?.stopPropagation();
		e?.preventDefault();

		console.log("submit pass form------------>>");

		try {
			await changePassword.mutateAsync({
				old_password: data.old_password,
				new_password: data.new_password,
			});

			// Reset form and close modal
			passForm.reset();
			setIsOpen(false);
		} catch (error) {
			// Error is handled by the mutation
			console.error("Password change failed:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("changePassword")}</DialogTitle>
					<DialogDescription>
						{t("changePasswordDescription")}
					</DialogDescription>
				</DialogHeader>

				<BaseForm form={passForm} onSubmit={onSubmit}>
					<div className="grid gap-4 py-4">
						<PasswordField
							name="old_password"
							label={t("currentPassword")}
							placeholder="••••••••"
							required
						/>
						<PasswordField
							name="new_password"
							label={t("newPassword")}
							placeholder="••••••••"
							required
						/>
						<PasswordField
							name="confirm_password"
							label={t("confirmNewPassword")}
							placeholder="••••••••"
							required
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsOpen(false);
								passForm.reset();
							}}
							disabled={changePassword.isPending}
						>
							{t("cancel")}
						</Button>
						<LoadingButton
							type="button"
							isLoading={changePassword.isPending}
							onClick={() => passForm.handleSubmit(onSubmit)()}
						>
							{changePassword.isPending ? t("changing") : t("changePassword")}
						</LoadingButton>
					</DialogFooter>
				</BaseForm>
			</DialogContent>
		</Dialog>
	);
};
