import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateRole,
	useUpdateRole,
} from "@/lib/api/role";
import type { Role, Permission } from "@/@types/User.type";
import { ALL_PERMISSIONS, PERMISSION_LABELS } from "@/constants/permissions";
import { useEffect } from "react";
import { useController } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface RoleFormProps {
	handleClose: () => void;
	role?: Role | null;
	mode: "create" | "edit";
}

type RolePermissionsFormData = {
	permissions: string[];
};

function PermissionCheckboxes() {
	const t = useT();
	const { field } = useController<RolePermissionsFormData, "permissions">({
		name: "permissions",
	});

	const selectedPermissions = (field.value || []) as string[];

	const handleToggle = (permission: Permission) => {
		const current = new Set(selectedPermissions);
		if (current.has(permission)) {
			current.delete(permission);
		} else {
			current.add(permission);
		}
		field.onChange(Array.from(current));
	};

	const handleSelectAll = () => {
		if (selectedPermissions.length === ALL_PERMISSIONS.length) {
			field.onChange([]);
		} else {
			field.onChange([...ALL_PERMISSIONS]);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">
					<T id="roles.form.permissions" defaultMessage="Permissions" />{" "}
					<span className="text-destructive">*</span>
				</Label>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleSelectAll}
				>
					{selectedPermissions.length === ALL_PERMISSIONS.length
						? t("roles.form.deselectAll", "Deselect All")
						: t("roles.form.selectAll", "Select All")}
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
				{ALL_PERMISSIONS.map((permission) => (
					<label
						key={permission}
						className="flex items-center gap-2 cursor-pointer"
					>
						<Checkbox
							checked={selectedPermissions.includes(permission)}
							onCheckedChange={() => handleToggle(permission)}
						/>
						<span className="text-sm">
							<T
								id={`roles.permissions.${permission}`}
								defaultMessage={PERMISSION_LABELS[permission]}
							/>
						</span>
					</label>
				))}
			</div>
		</div>
	);
}

export const RoleForm = ({ handleClose, role, mode }: RoleFormProps) => {
	const t = useT();
	const { mutate: createRole, isPending: isCreating } = useCreateRole();
	const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
	const roleSchema = z.object({
		name: z.string().min(
			1,
			t("roles.form.validation.nameRequired", "Role name is required") as string
		),
		description: z.string().optional().or(z.literal("")),
		permissions: z.array(z.string()).min(
			1,
			t("roles.form.validation.permissionsRequired", "Select at least one permission") as string
		),
	});

	type RoleFormData = z.infer<typeof roleSchema>;

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(roleSchema, {
		defaultValues: {
			name: "",
			description: "",
			permissions: [],
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: RoleFormData) => {
		const payload = {
			name: data.name,
			description: data.description || "",
			permissions: data.permissions as Permission[],
		};

		if (isEditMode && role) {
			updateRole(
				{ id: role.id, updateData: payload },
				{
					onSuccess: () => {
						handleCancel();
						toast.success(t("roles.form.updateSuccess", "Role updated successfully") as string);
					},
				}
			);
		} else {
			createRole(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success(t("roles.form.createSuccess", "Role created successfully") as string);
				},
			});
		}
	};

	useEffect(() => {
		if (role && isEditMode) {
			form.reset({
				name: role.name,
				description: role.description || "",
				permissions: role.permissions,
			});
		}
	}, [form, role, isEditMode]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label={t("roles.form.name", "Role Name") as string}
					placeholder={t("roles.form.namePlaceholder", "e.g., Product Manager") as string}
					required
				/>

				<TextareaField
					name="description"
					label={t("roles.form.description", "Description") as string}
					placeholder={t("roles.form.descriptionPlaceholder", "Brief description of this role...") as string}
				/>

				<PermissionCheckboxes />
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode
						? t("roles.form.update", "Update Role")
						: t("roles.form.create", "Create Role")}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
