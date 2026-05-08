import { BaseForm } from "@/components/ui/@form/BaseForm";
import { DateField } from "@/components/ui/@form/DateField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { useCreateReceipt } from "@/lib/api/inventory";
import { getProducts } from "@/lib/api/product";
import { getProductVariants } from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

interface ReceiptFormProps {
	handleClose: () => void;
}

interface ReceiptFormValues {
	product_id: string;
	variant: string;
	supplier_name?: string;
	reference?: string;
	received_at: string;
	quantity: number;
	supplier_unit_cost: number;
	landed_cost: number;
	note?: string;
}

function CostPreview({
	form,
}: {
	form: UseFormReturn<ReceiptFormValues>;
}) {
	const t = useT();
	const { locale } = useLocale();
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
				<span className="text-muted-foreground">
					<T
						id="inventory.receiptForm.calculatedUnitCost"
						defaultMessage="Calculated Unit Cost"
					/>
				</span>
				<span className="font-medium tabular-nums">
					{`৳${calcUnitCost.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
				</span>
			</div>
			<div className="flex justify-between">
				<span className="text-muted-foreground">
					<T id="inventory.receiptForm.totalCost" defaultMessage="Total Cost" />
				</span>
				<span className="font-medium tabular-nums">
					{`৳${totalCost.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
				</span>
			</div>
			{Number(landedCost) > 0 && (
				<p className="text-xs text-muted-foreground pt-1">
					{t(
						"inventory.receiptForm.landedCostNote",
						"Landed cost of ৳{cost} spread across {quantity} units.",
						{
							cost: Number(landedCost).toLocaleString(
								locale === "bn" ? "bn-BD" : "en-IN",
								{
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								},
							),
							quantity: Number(qty).toLocaleString(
								locale === "bn" ? "bn-BD" : "en-IN",
							),
						},
					)}
				</p>
			)}
		</div>
	);
}

export function ReceiptForm({ handleClose }: ReceiptFormProps) {
	const t = useT();
	const { mutate: createReceipt, isPending } = useCreateReceipt();

	const schema = z.object({
		product_id: z.string().min(1, t("inventory.receiptForm.validation.product", "Please select a product")),
		variant: z.string().min(1, t("inventory.receiptForm.validation.variant", "Please select a variant")),
		supplier_name: z.string().max(200).optional().or(z.literal("")),
		reference: z.string().max(100).optional().or(z.literal("")),
		received_at: z.string().min(1, t("inventory.receiptForm.validation.receivedAt", "Received date is required")),
		quantity: z.coerce.number().int().min(1, t("inventory.receiptForm.validation.quantity", "Quantity must be at least 1")),
		supplier_unit_cost: z.coerce
			.number()
			.nonnegative(t("inventory.receiptForm.validation.unitCost", "Cost must be 0 or greater")),
		landed_cost: z.coerce.number().nonnegative().optional().default(0),
		note: z.string().optional().or(z.literal("")),
	});

	type FormData = z.infer<typeof schema>;

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
		createReceipt(
			{
				variant: data.variant,
				received_at: data.received_at,
				quantity: data.quantity,
				supplier_unit_cost: data.supplier_unit_cost,
				supplier_name: data.supplier_name || undefined,
				reference: data.reference || undefined,
				note: data.note || undefined,
				landed_cost: data.landed_cost ?? 0,
			},
			{
				onSuccess: () => {
					handleCancel();
					toast.success(t("inventory.receiptForm.createSuccess", "Receipt recorded. Stock updated."));
				},
				onError: () => toast.error(t("inventory.receiptForm.createFailed", "Failed to record receipt")),
			},
		);
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				{/* Product selector */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						<T id="inventory.receiptForm.product" defaultMessage="Product" />{" "}
						<span className="text-destructive">*</span>
					</label>
					<select
						value={form.watch("product_id")}
						onChange={(e) => {
							form.setValue("product_id", e.target.value);
							form.setValue("variant", "");
						}}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">
							{t("inventory.receiptForm.productPlaceholder", "Select a product...")}
						</option>
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
						<T id="inventory.receiptForm.variant" defaultMessage="Variant" />{" "}
						<span className="text-destructive">*</span>
					</label>
					<select
						value={form.watch("variant")}
						onChange={(e) => form.setValue("variant", e.target.value)}
						disabled={!selectedProductId || variantsLoading}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">
							{!selectedProductId
								? t("inventory.receiptForm.variantPlaceholder.noProduct", "Select a product first")
								: variantsLoading
									? t("inventory.receiptForm.variantPlaceholder.loading", "Loading variants...")
									: t("inventory.receiptForm.variantPlaceholder.ready", "Select a variant...")}
						</option>
						{variantOptions.map((v) => (
							<option key={v.value} value={v.value}>
								{v.label}
							</option>
						))}
					</select>
					<p className="text-xs text-muted-foreground">
						<T
							id="inventory.receiptForm.variantHelp"
							defaultMessage="Stock quantity and cost price will be updated for this variant."
						/>
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
						label={t("inventory.receiptForm.supplierName", "Supplier Name")}
						placeholder={t("inventory.receiptForm.supplierNamePlaceholder", "e.g., ABC Suppliers")}
						helpText={t("inventory.receiptForm.supplierNameHelp", "Optional; name of the supplier.")}
					/>
					<TextField
						name="reference"
						label={t("inventory.receiptForm.reference", "Reference")}
						placeholder={t("inventory.receiptForm.referencePlaceholder", "e.g., INV-2026-001")}
						helpText={t(
							"inventory.receiptForm.referenceHelp",
							"Optional; invoice or delivery note number.",
						)}
					/>
				</div>

				<DateField
					name="received_at"
					label={t("inventory.receiptForm.receivedOn", "Received On")}
					required
					helpText={t(
						"inventory.receiptForm.receivedOnHelp",
						"When the stock was physically received.",
					)}
				/>

				<div className="grid grid-cols-3 gap-4">
					<TextField
						name="quantity"
						label={t("inventory.receiptForm.quantity", "Quantity")}
						type="number"
						placeholder="0"
						required
						helpText={t("inventory.receiptForm.quantityHelp", "Number of units received.")}
					/>
					<TextField
						name="supplier_unit_cost"
						label={t("inventory.receiptForm.unitCost", "Unit Cost (৳)")}
						type="number"
						placeholder="0.00"
						required
						helpText={t("inventory.receiptForm.unitCostHelp", "Cost per unit from supplier.")}
					/>
					<TextField
						name="landed_cost"
						label={t("inventory.receiptForm.landedCost", "Landed Cost (৳)")}
						type="number"
						placeholder="0.00"
						helpText={t(
							"inventory.receiptForm.landedCostHelp",
							"Shipping, customs, handling (total extra cost).",
						)}
					/>
				</div>

				<CostPreview form={form} />

				<TextareaField
					name="note"
					label={t("inventory.receiptForm.note", "Note")}
					placeholder={t("inventory.receiptForm.notePlaceholder", "Any additional details...")}
					rows={2}
					helpText={t("inventory.receiptForm.optional", "Optional")}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					<T id="inventory.receiptForm.submit" defaultMessage="Record Receipt" />
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
