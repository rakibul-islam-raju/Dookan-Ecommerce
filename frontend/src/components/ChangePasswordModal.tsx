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
import { useState } from "react";
import { z } from "zod";

const schema = z
	.object({
		old_password: z.string().min(1, "Current password is required"),
		new_password: z
			.string()
			.min(6, "New password must be at least 6 characters long"),
		confirm_password: z
			.string()
			.min(6, "Password confirmation must be at least 6 characters long"),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "New passwords do not match",
		path: ["confirm_password"],
	});

type ChangePasswordFormValues = z.infer<typeof schema>;

export const ChangePasswordModal = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const changePassword = useChangePassword();

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
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Enter your current password and choose a new one. Make sure
						it&apos;s at least 6 characters long.
					</DialogDescription>
				</DialogHeader>

				<BaseForm form={passForm} onSubmit={onSubmit}>
					<div className="grid gap-4 py-4">
						<PasswordField
							name="old_password"
							label="Current Password"
							placeholder="••••••••"
							required
						/>
						<PasswordField
							name="new_password"
							label="New Password"
							placeholder="••••••••"
							required
						/>
						<PasswordField
							name="confirm_password"
							label="Confirm New Password"
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
							Cancel
						</Button>
						<LoadingButton
							type="button"
							isLoading={changePassword.isPending}
							onClick={() => passForm.handleSubmit(onSubmit)()}
						>
							{changePassword.isPending ? "Changing..." : "Change Password"}
						</LoadingButton>
					</DialogFooter>
				</BaseForm>
			</DialogContent>
		</Dialog>
	);
};
