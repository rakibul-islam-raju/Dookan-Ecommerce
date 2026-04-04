import { BaseForm } from "@/components/ui/@form/BaseForm";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
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

const staffCreateSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email is required"),
	mobile_number: z.string().min(1, "Mobile number is required"),
	role: z.string(),
});

type StaffFormData = z.infer<typeof staffCreateSchema>;

interface StaffFormProps {
	handleClose: () => void;
	staff?: StaffMember | null;
	mode: "create" | "edit";
}

export const StaffForm = ({ handleClose, staff, mode }: StaffFormProps) => {
	const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
	const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff();
	const { data: roles } = useQuery(getRoles());

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
						toast.success("Staff member updated successfully");
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
					toast.success("Staff member created and password setup email sent");
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
	}, [staff, isEditMode]);

	const roleOptions = [
		{ value: NO_ROLE_VALUE, label: "No Role" },
		...(roles?.map((r) => ({ value: r.id, label: r.name })) || []),
	];

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="first_name"
						label="First Name"
						placeholder="John"
						required
					/>
					<TextField
						name="last_name"
						label="Last Name"
						placeholder="Doe"
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="email"
						label="Email"
						placeholder="john@example.com"
						type="email"
						required
					/>
					<TextField
						name="mobile_number"
						label="Mobile Number"
						placeholder="+8801XXXXXXXXX"
						required
					/>
				</div>

				{!isEditMode && (
					<p className="rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
						The staff member will receive an email with a secure link to set
						their password.
					</p>
				)}

				<SelectField
					name="role"
					label="Role"
					options={roleOptions}
					description="Assign a role to define permissions"
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Staff" : "Create Staff & Send Invite"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
