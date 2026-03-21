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

const staffCreateSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email is required"),
	mobile_number: z.string().min(1, "Mobile number is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.string().optional().or(z.literal("")),
});

const staffEditSchema = staffCreateSchema.omit({ password: true });

type StaffCreateFormData = z.infer<typeof staffCreateSchema>;
type StaffEditFormData = z.infer<typeof staffEditSchema>;

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

	const schema = isEditMode ? staffEditSchema : staffCreateSchema;

	const form = useZodForm(schema, {
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			mobile_number: "",
			...(!isEditMode && { password: "" }),
			role: "",
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: StaffCreateFormData | StaffEditFormData) => {
		if (isEditMode && staff) {
			const updateData: StaffUpdateData = {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				mobile_number: data.mobile_number,
				role: data.role || null,
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
				password: (data as StaffCreateFormData).password,
				role: data.role || null,
			};
			createStaff(createData, {
				onSuccess: () => {
					handleCancel();
					toast.success("Staff member created successfully");
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
				role: staff.role || "",
			});
		}
	}, [staff, isEditMode]);

	const roleOptions = [
		{ value: "", label: "No Role" },
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
					<TextField
						name="password"
						label="Password"
						placeholder="Minimum 8 characters"
						type="password"
						required
					/>
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
					{isEditMode ? "Update Staff" : "Create Staff"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
