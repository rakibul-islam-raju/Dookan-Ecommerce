import { BaseForm } from "@/components/ui/@form/BaseForm";
import { DateField } from "@/components/ui/@form/DateField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { useCreateReceipt } from "@/lib/api/inventory";
import { getProducts } from "@/lib/api/product";
import { getProductVariants } from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
	product_id: z.string().min(1, "Please select a product"),
	variant: z.string().min(1, "Please select a variant"),
	supplier_name: z.string().max(200).optional().or(z.literal("")),
	reference: z.string().max(100).optional().or(z.literal("")),
	received_at: z.string().min(1, "Received date is required"),
	quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
	supplier_unit_cost: z.coerce.number().nonnegative("Cost must be 0 or greater"),
	landed_cost: z.coerce.number().nonnegative().optional().default(0),
	note: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface ReceiptFormProps {
	handleClose: () => void;
}

function CostPreview({ form }: { form: ReturnType<typeof useZodForm<typeof schema>> }) {
	const qty = useWatch({ control: form.control, name: "quantity" });
	const unitCost = useWatch({ control: form.control, name: "supplier_unit_cost" });
	const landedCost = useWatch({ control: form.control, name: "landed_cost" });

	const calcUnitCost = useMemo(() => {
		const q = Number(qty) || 0;
		const u = Number(unitCost) || 0;
		const l = Number(landedCost) || 0;
		if (q <= 0 || u <= 0) return null;
		return (q * u + l) / q;
	}, [qty, unitCost, landedCost]);

	const totalCost = useMemo(() => {
		const q = Number(qty) || 0;
		const u = Number(unitCost) || 0;
		const l = Number(landedCost) || 0;
		return q * u + l;
	}, [qty, unitCost, landedCost]);

	if (calcUnitCost === null) return null;

	return (
		<div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
			<div className="flex justify-between">
				<span className="text-muted-foreground">Calculated Unit Cost</span>
				<span className="font-medium tabular-nums">৳{calcUnitCost.toFixed(2)}</span>
			</div>
			<div className="flex justify-between">
				<span className="text-muted-foreground">Total Cost</span>
				<span className="font-medium tabular-nums">৳{totalCost.toFixed(2)}</span>
			</div>
			{Number(landedCost) > 0 && (
				<p className="text-xs text-muted-foreground pt-1">
					Landed cost of ৳{Number(landedCost).toFixed(2)} spread across{" "}
					{Number(qty)} units.
				</p>
			)}
		</div>
	);
}

export function ReceiptForm({ handleClose }: ReceiptFormProps) {
	const { mutate: createReceipt, isPending } = useCreateReceipt();

	const form = useZodForm(schema, {
		defaultValues: {
			product_id: "",
			variant: "",
			supplier_name: "",
			reference: "",
			received_at: format(new Date(), "yyyy-MM-dd"),
			quantity: undefined,
			supplier_unit_cost: undefined,
			landed_cost: 0,
			note: "",
		},
	});

	const selectedProductId = useWatch({ control: form.control, name: "product_id" });

	const { data: productsData } = useQuery(getProducts({ limit: 200, offset: 0 }));
	const { data: variants, isLoading: variantsLoading } = useQuery(
		getProductVariants(selectedProductId),
	);

	const productOptions = (productsData?.results || []).map((p) => ({
		value: p.id,
		label: p.name,
	}));

	const variantOptions = (variants || []).map((v) => ({
		value: v.id,
		label: v.name || v.sku,
	}));

	const handleCancel = () => {
		form.reset();
		handleClose();
	};

	const onSubmit = (data: FormData) => {
		const { product_id: _p, ...payload } = data;
		createReceipt(
			{
				...payload,
				supplier_name: data.supplier_name || undefined,
				reference: data.reference || undefined,
				note: data.note || undefined,
				landed_cost: data.landed_cost ?? 0,
			},
			{
				onSuccess: () => {
					handleCancel();
					toast.success("Receipt recorded. Stock updated.");
				},
				onError: () => toast.error("Failed to record receipt"),
			},
		);
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				{/* Product selector */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						Product <span className="text-destructive">*</span>
					</label>
					<select
						value={form.watch("product_id")}
						onChange={(e) => {
							form.setValue("product_id", e.target.value);
							form.setValue("variant", "");
						}}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">Select a product...</option>
						{productOptions.map((p) => (
							<option key={p.value} value={p.value}>
								{p.label}
							</option>
						))}
					</select>
					{form.formState.errors.product_id && (
						<p className="text-xs text-destructive">
							{form.formState.errors.product_id.message}
						</p>
					)}
				</div>

				{/* Variant selector */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						Variant <span className="text-destructive">*</span>
					</label>
					<select
						value={form.watch("variant")}
						onChange={(e) => form.setValue("variant", e.target.value)}
						disabled={!selectedProductId || variantsLoading}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">
							{!selectedProductId
								? "Select a product first"
								: variantsLoading
									? "Loading variants..."
									: "Select a variant..."}
						</option>
						{variantOptions.map((v) => (
							<option key={v.value} value={v.value}>
								{v.label}
							</option>
						))}
					</select>
					<p className="text-xs text-muted-foreground">
						Stock quantity and cost price will be updated for this variant.
					</p>
					{form.formState.errors.variant && (
						<p className="text-xs text-destructive">
							{form.formState.errors.variant.message}
						</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="supplier_name"
						label="Supplier Name"
						placeholder="e.g., ABC Suppliers"
						helpText="Optional — name of the supplier."
					/>
					<TextField
						name="reference"
						label="Reference"
						placeholder="e.g., INV-2026-001"
						helpText="Optional — invoice or delivery note number."
					/>
				</div>

				<DateField
					name="received_at"
					label="Received On"
					required
					helpText="When the stock was physically received."
				/>

				<div className="grid grid-cols-3 gap-4">
					<TextField
						name="quantity"
						label="Quantity"
						type="number"
						placeholder="0"
						required
						helpText="Number of units received."
					/>
					<TextField
						name="supplier_unit_cost"
						label="Unit Cost (৳)"
						type="number"
						placeholder="0.00"
						required
						helpText="Cost per unit from supplier."
					/>
					<TextField
						name="landed_cost"
						label="Landed Cost (৳)"
						type="number"
						placeholder="0.00"
						helpText="Shipping, customs, handling (total extra cost)."
					/>
				</div>

				<CostPreview form={form} />

				<TextareaField
					name="note"
					label="Note"
					placeholder="Any additional details..."
					rows={2}
					helpText="Optional."
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					Record Receipt
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
