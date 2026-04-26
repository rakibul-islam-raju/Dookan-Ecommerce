import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateMaterial,
	useUpdateMaterial,
	type IMaterial,
} from "@/lib/api/inventory";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	sku: z.string().min(1, "SKU is required").max(50),
	unit: z.string().min(1, "Unit is required").max(20),
	reorder_level: z.coerce.number().nonnegative("Reorder level must be 0 or greater").optional(),
	is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface MaterialFormProps {
	handleClose: () => void;
	material?: IMaterial | null;
	mode: "create" | "edit";
}

export function MaterialForm({ handleClose, material, mode }: MaterialFormProps) {
	const isEditMode = mode === "edit";
	const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
	const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
	const isPending = isCreating || isUpdating;

	const form = useZodForm(schema, {
		defaultValues: {
			name: "",
			sku: "",
			unit: "unit",
			reorder_level: 0,
			is_active: true,
		},
	});

	useEffect(() => {
		if (material) {
			form.reset({
				name: material.name,
				sku: material.sku,
				unit: material.unit,
				reorder_level: parseFloat(material.reorder_level) || 0,
				is_active: material.is_active,
			});
		} else {
			form.reset({ name: "", sku: "", unit: "unit", reorder_level: 0, is_active: true });
		}
	}, [material]);

	const handleCancel = () => {
		form.reset();
		handleClose();
	};

	const onSubmit = (data: FormData) => {
		if (isEditMode && material) {
			updateMaterial(
				{ id: material.id, data },
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Material updated");
					},
					onError: () => toast.error("Failed to update material"),
				},
			);
		} else {
			createMaterial(data, {
				onSuccess: () => {
					handleCancel();
					toast.success("Material created");
				},
				onError: () => toast.error("Failed to create material"),
			});
		}
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label="Material Name"
					placeholder="e.g., Cotton Fabric"
					required
					helpText="A descriptive name for this raw material."
				/>
				<TextField
					name="sku"
					label="SKU"
					placeholder="e.g., FAB-001"
					required
					disabled={isEditMode}
					helpText={
						isEditMode
							? "SKU cannot be changed after creation."
							: "Unique identifier for this material. Cannot be changed later."
					}
				/>
				<TextField
					name="unit"
					label="Unit"
					placeholder="e.g., kg, meter, piece, litre"
					required
					helpText="The measurement unit used for stock quantities and transactions."
				/>
				<TextField
					name="reorder_level"
					label="Reorder Level"
					type="number"
					placeholder="0"
					helpText="You'll see a low-stock alert when the current quantity falls to or below this level."
				/>

				{isEditMode && material && (
					<div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Current Stock</span>
							<span className="font-medium tabular-nums">
								{parseFloat(material.current_quantity).toLocaleString()} {material.unit}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Avg Unit Cost</span>
							<span className="font-medium tabular-nums">
								৳{parseFloat(material.weighted_average_cost).toFixed(2)}
							</span>
						</div>
					</div>
				)}

				<CheckboxField
					name="is_active"
					label="Active"
					description="Inactive materials won't appear in production batch forms."
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Material" : "Create Material"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
