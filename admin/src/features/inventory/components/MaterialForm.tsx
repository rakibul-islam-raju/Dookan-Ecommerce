import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateMaterial,
	useUpdateMaterial,
	type IMaterial,
} from "@/lib/api/inventory";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { z } from "zod";

interface MaterialFormProps {
	handleClose: () => void;
	material?: IMaterial | null;
	mode: "create" | "edit";
}

export function MaterialForm({ handleClose, material, mode }: MaterialFormProps) {
	const t = useT();
	const { locale } = useLocale();
	const isEditMode = mode === "edit";
	const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
	const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
	const isPending = isCreating || isUpdating;

	const schema = z.object({
		name: z.string().min(1, t("inventory.materialForm.validation.name", "Name is required")).max(200),
		sku: z.string().min(1, t("inventory.materialForm.validation.sku", "SKU is required")).max(50),
		unit: z.string().min(1, t("inventory.materialForm.validation.unit", "Unit is required")).max(20),
		reorder_level: z.coerce
			.number()
			.nonnegative(
				t(
					"inventory.materialForm.validation.reorderLevel",
					"Reorder level must be 0 or greater",
				),
			)
			.optional(),
		is_active: z.boolean().default(true),
	});

	type FormData = z.infer<typeof schema>;

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
	}, [form, material]);

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
						toast.success(t("inventory.materialForm.updateSuccess", "Material updated"));
					},
					onError: () => toast.error(t("inventory.materialForm.updateFailed", "Failed to update material")),
				},
			);
		} else {
			createMaterial(data, {
				onSuccess: () => {
					handleCancel();
					toast.success(t("inventory.materialForm.createSuccess", "Material created"));
				},
				onError: () => toast.error(t("inventory.materialForm.createFailed", "Failed to create material")),
			});
		}
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label={t("inventory.materialForm.name", "Material Name")}
					placeholder={t("inventory.materialForm.namePlaceholder", "e.g., Cotton Fabric")}
					required
					helpText={t(
						"inventory.materialForm.nameHelp",
						"A descriptive name for this raw material.",
					)}
				/>
				<TextField
					name="sku"
					label={t("inventory.materialForm.sku", "SKU")}
					placeholder={t("inventory.materialForm.skuPlaceholder", "e.g., FAB-001")}
					required
					disabled={isEditMode}
					helpText={
						isEditMode
							? t(
								"inventory.materialForm.skuHelp.edit",
								"SKU cannot be changed after creation.",
							)
							: t(
								"inventory.materialForm.skuHelp.create",
								"Unique identifier for this material. Cannot be changed later.",
							)
					}
				/>
				<TextField
					name="unit"
					label={t("inventory.materialForm.unit", "Unit")}
					placeholder={t("inventory.materialForm.unitPlaceholder", "e.g., kg, meter, piece, litre")}
					required
					helpText={t(
						"inventory.materialForm.unitHelp",
						"The measurement unit used for stock quantities and transactions.",
					)}
				/>
				<TextField
					name="reorder_level"
					label={t("inventory.materialForm.reorderLevel", "Reorder Level")}
					type="number"
					placeholder="0"
					helpText={t(
						"inventory.materialForm.reorderLevelHelp",
						"You'll see a low-stock alert when the current quantity falls to or below this level.",
					)}
				/>

				{isEditMode && material && (
					<div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								<T id="inventory.materialDetail.stats.currentStock" defaultMessage="Current Stock" />
							</span>
							<span className="font-medium tabular-nums">
								{parseFloat(material.current_quantity).toLocaleString(
									locale === "bn" ? "bn-BD" : "en-IN",
								)}{" "}
								{material.unit}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								<T
									id="inventory.materialDetail.stats.avgUnitCost"
									defaultMessage="Avg Unit Cost"
								/>
							</span>
							<span className="font-medium tabular-nums">
								{`৳${parseFloat(material.weighted_average_cost).toLocaleString(
									locale === "bn" ? "bn-BD" : "en-IN",
									{
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									},
								)}`}
							</span>
						</div>
					</div>
				)}

				<CheckboxField
					name="is_active"
					label={t("inventory.materialForm.active", "Active")}
					description={t(
						"inventory.materialForm.activeHelp",
						"Inactive materials won't appear in production batch forms.",
					)}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode
						? t("inventory.materialForm.update", "Update Material")
						: t("inventory.materialForm.create", "Create Material")}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
