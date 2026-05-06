import { BaseForm } from "@/components/ui/@form/BaseForm";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateStaff,
	useUpdateStaff,
	type StaffCreateData,
	type StaffUpdateData,
} from "@/lib/api/staff";
import { getRoles } from "@/lib/api/role";
import type { StaffMember } from "@/@types/User.type";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

/** Radix Select.Item cannot use value=""; map this to null on submit. */
const NO_ROLE_VALUE = "__no_role__";

interface StaffFormProps {
	handleClose: () => void;
	staff?: StaffMember | null;
	mode: "create" | "edit";
}

export const StaffForm = ({ handleClose, staff, mode }: StaffFormProps) => {
	const t = useT();
	const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
	const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff();
	const { data: roles } = useQuery(getRoles());
	const staffCreateSchema = z.object({
		first_name: z.string().min(
			1,
			t("staff.form.validation.firstName", "First name is required") as string
		),
		last_name: z.string().min(
			1,
			t("staff.form.validation.lastName", "Last name is required") as string
		),
		email: z.string().email(t("staff.form.validation.email", "Valid email is required") as string),
		mobile_number: z.string().min(
			1,
			t("staff.form.validation.mobile", "Mobile number is required") as string
		),
		role: z.string(),
	});

	type StaffFormData = z.infer<typeof staffCreateSchema>;

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(staffCreateSchema, {
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			mobile_number: "",
			role: NO_ROLE_VALUE,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: StaffFormData) => {
		if (isEditMode && staff) {
			const updateData: StaffUpdateData = {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				mobile_number: data.mobile_number,
				role: data.role === NO_ROLE_VALUE ? null : data.role,
			};
			updateStaff(
				{ id: staff.id, updateData },
				{
					onSuccess: () => {
						handleCancel();
						toast.success(t("staff.form.updateSuccess", "Staff member updated successfully") as string);
					},
				}
			);
		} else {
			const createData: StaffCreateData = {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				mobile_number: data.mobile_number,
				role: data.role === NO_ROLE_VALUE ? null : data.role,
			};
			createStaff(createData, {
				onSuccess: () => {
					handleCancel();
					toast.success(t("staff.form.createSuccess", "Staff member created and password setup email sent") as string);
				},
			});
		}
	};

	useEffect(() => {
		if (staff && isEditMode) {
			form.reset({
				first_name: staff.first_name,
				last_name: staff.last_name,
				email: staff.email,
				mobile_number: staff.mobile_number,
				role: staff.role || NO_ROLE_VALUE,
			});
		}
	}, [form, staff, isEditMode]);

	const roleOptions = [
		{
			value: NO_ROLE_VALUE,
			label: t("staff.role.none", "No Role") as string,
		},
		...(roles?.map((r) => ({ value: r.id, label: r.name })) || []),
	];

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="first_name"
						label={t("staff.form.firstName", "First Name") as string}
						placeholder={t("staff.form.firstNamePlaceholder", "John") as string}
						required
					/>
					<TextField
						name="last_name"
						label={t("staff.form.lastName", "Last Name") as string}
						placeholder={t("staff.form.lastNamePlaceholder", "Doe") as string}
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="email"
						label={t("staff.table.email", "Email") as string}
						placeholder={t("staff.form.emailPlaceholder", "john@example.com") as string}
						type="email"
						required
					/>
					<TextField
						name="mobile_number"
						label={t("staff.form.mobileNumber", "Mobile Number") as string}
						placeholder={t("staff.form.mobilePlaceholder", "+8801XXXXXXXXX") as string}
						required
					/>
				</div>

				{!isEditMode && (
					<p className="rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
						<T
							id="staff.form.inviteNotice"
							defaultMessage="The staff member will receive an email with a secure link to set their password."
						/>
					</p>
				)}

				<SelectField
					name="role"
					label={t("staff.table.role", "Role") as string}
					options={roleOptions}
					description={t("staff.form.roleDescription", "Assign a role to define permissions") as string}
				/>
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
						? t("staff.form.update", "Update Staff")
						: t("staff.form.create", "Create Staff & Send Invite")}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
