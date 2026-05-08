import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getProductVariants,
	getVariantTypes,
	useCreateProductVariant,
	useDeleteProductVariant,
	useUpdateProductVariant,
	type CreateProductVariantRequest,
	type ProductVariant,
} from "@/lib/api/variant";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductVariantsProps {
	productId: string;
}

const getNextOptionIds = (
	currentOptionIds: string[],
	variantTypeId: string,
	optionId: string,
	variantTypes: {
		id: string;
		options: { id: string; value: string }[];
	}[],
) => {
	const optionIdsForType =
		variantTypes.find((variantType) => variantType.id === variantTypeId)?.options.map(
			(option) => option.id,
		) ?? [];

	if (currentOptionIds.includes(optionId)) {
		return currentOptionIds.filter((id) => id !== optionId);
	}

	return [
		...currentOptionIds.filter((id) => !optionIdsForType.includes(id)),
		optionId,
	];
};

export const ProductVariants = ({ productId }: ProductVariantsProps) => {
	const t = useT();
	const { locale } = useLocale();
	const { data: variants = [], isLoading } = useQuery(
		getProductVariants(productId),
	);
	const { data: variantTypes = [] } = useQuery(getVariantTypes());

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
		null,
	);

	const handleAdd = () => {
		setEditingVariant(null);
		setIsFormOpen(true);
	};

	const handleEdit = (variant: ProductVariant) => {
		setEditingVariant(variant);
		setIsFormOpen(true);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Product Variants</CardTitle>
						<CardDescription>
							{t(
								"products.variants.description",
								"Manage size, color, weight, and other variant options",
							)}
						</CardDescription>
					</div>
					<Button size="sm" onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-1" />
						{t("products.variants.add", "Add Variant")}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : variants.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p>
							<T
								id="products.variants.empty"
								defaultMessage="No variants configured for this product."
							/>
						</p>
						<p className="text-sm mt-1">
							<T
								id="products.variants.emptyDescription"
								defaultMessage="Add variants to offer different sizes, colors, or weights."
							/>
						</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									<T id="products.variants.table.name" defaultMessage="Name" />
								</TableHead>
								<TableHead>
									<T id="products.variants.table.sku" defaultMessage="SKU" />
								</TableHead>
								<TableHead>
									<T id="products.variants.table.options" defaultMessage="Options" />
								</TableHead>
								<TableHead className="text-right">
									<T id="products.variants.table.price" defaultMessage="Price" />
								</TableHead>
								<TableHead className="text-right">
									<T id="products.variants.table.stock" defaultMessage="Stock" />
								</TableHead>
								<TableHead>
									<T id="products.variants.table.status" defaultMessage="Status" />
								</TableHead>
								<TableHead className="text-right">
									<T id="products.variants.table.actions" defaultMessage="Actions" />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{variants.map((variant) => (
								<VariantRow
									key={variant.id}
									variant={variant}
									onEdit={handleEdit}
									t={t}
									locale={locale}
								/>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>

			{isFormOpen && (
				<VariantFormDialog
					key={editingVariant?.id ?? "new"}
					open={isFormOpen}
					onOpenChange={setIsFormOpen}
					productId={productId}
					variant={editingVariant}
					variantTypes={variantTypes}
				/>
			)}
		</Card>
	);
};

// ============================================================
// Variant Row
// ============================================================

function VariantRow({
	variant,
	onEdit,
	t,
	locale,
}: {
	variant: ProductVariant;
	onEdit: (v: ProductVariant) => void;
	t: ReturnType<typeof useT>;
	locale: "en" | "bn";
}) {
	const { mutate: deleteVariant, isPending: isDeleting } =
		useDeleteProductVariant();

	const handleDelete = () => {
		if (!confirm(t("products.variants.deleteConfirm", "Delete this variant?"))) return;
		deleteVariant(variant.id, {
			onSuccess: () =>
				toast.success(t("products.variants.deleteSuccess", "Variant deleted")),
			onError: () =>
				toast.error(
					t("products.variants.deleteFailed", "Failed to delete variant"),
				),
		});
	};

	return (
		<TableRow>
			<TableCell className="font-medium">{variant.name || "—"}</TableCell>
			<TableCell className="text-muted-foreground text-xs">
				{variant.sku}
			</TableCell>
			<TableCell>
				<div className="flex flex-wrap gap-1">
					{variant.options.map((opt) => (
						<Badge key={opt.id} variant="secondary" className="text-xs">
							{opt.variant_type_name}: {opt.value}
						</Badge>
					))}
				</div>
			</TableCell>
			<TableCell className="text-right font-medium">
				{`৳${Number(variant.base_price).toLocaleString(
					locale === "bn" ? "bn-BD" : "en-BD",
					{
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					},
				)}`}
			</TableCell>
			<TableCell className="text-right">{variant.stock_quantity}</TableCell>
			<TableCell>
				<Badge variant={variant.is_active ? "success" : "secondary"}>
					{variant.is_active
						? t("products.common.status.active", "Active")
						: t("products.common.status.inactive", "Inactive")}
				</Badge>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex justify-end gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onEdit(variant)}
					>
						<Edit className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						<Trash className="h-3.5 w-3.5" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

// ============================================================
// Variant Form Dialog
// ============================================================

interface VariantFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productId: string;
	variant: ProductVariant | null;
	variantTypes: {
		id: string;
		name: string;
		options: { id: string; value: string }[];
	}[];
}

function VariantFormDialog({
	open,
	onOpenChange,
	productId,
	variant,
	variantTypes,
}: VariantFormDialogProps) {
	const t = useT();
	const isEdit = !!variant;
	const { mutate: createVariant, isPending: isCreating } =
		useCreateProductVariant();
	const { mutate: updateVariant, isPending: isUpdating } =
		useUpdateProductVariant();
	const isPending = isCreating || isUpdating;

	// Initialize form data from variant (component re-mounts when variant changes via key prop)
	const initialFormData: CreateProductVariantRequest = variant
		? {
				sku: variant.sku,
				name: variant.name,
				base_price: variant.base_price,
				cost_price: variant.cost_price || null,
				stock_quantity: variant.stock_quantity,
				low_stock_threshold: variant.low_stock_threshold,
				weight: variant.weight || null,
				is_active: variant.is_active,
				display_order: variant.display_order,
				option_ids: variant.options.map((o) => o.id),
			}
		: {
				sku: "",
				name: "",
				base_price: "",
				cost_price: null,
				stock_quantity: 0,
				low_stock_threshold: 5,
				weight: null,
				is_active: true,
				display_order: 0,
				option_ids: [],
			};

	const [formData, setFormData] =
		useState<CreateProductVariantRequest>(initialFormData);

	const handleOptionToggle = (variantTypeId: string, optionId: string) => {
		setFormData((prev) => ({
			...prev,
			option_ids: getNextOptionIds(
				prev.option_ids || [],
				variantTypeId,
				optionId,
				variantTypes,
			),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!(formData.name || "").trim() && !(formData.option_ids?.length ?? 0)) {
			toast.error(
				t(
					"products.variants.validation.nameOrOptions",
					"Select variant options or enter a variant name.",
				),
			);
			return;
		}

		if (isEdit && variant) {
			updateVariant(
				{ variantId: variant.id, data: formData },
				{
					onSuccess: () => {
						toast.success(t("products.variants.updateSuccess", "Variant updated"));
						onOpenChange(false);
					},
					onError: () =>
						toast.error(
							t("products.variants.updateFailed", "Failed to update variant"),
						),
				},
			);
		} else {
			createVariant(
				{ productId, data: formData },
				{
					onSuccess: () => {
						toast.success(t("products.variants.createSuccess", "Variant created"));
						onOpenChange(false);
					},
					onError: () =>
						toast.error(
							t("products.variants.createFailed", "Failed to create variant"),
						),
				},
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEdit
							? t("products.variants.dialog.editTitle", "Edit Variant")
							: t("products.variants.dialog.addTitle", "Add Variant")}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="variant-sku">SKU *</Label>
							<Input
								id="variant-sku"
								value={formData.sku}
								onChange={(e) =>
									setFormData((p) => ({ ...p, sku: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-name">Name</Label>
							<Input
								id="variant-name"
								value={formData.name || ""}
								onChange={(e) =>
									setFormData((p) => ({ ...p, name: e.target.value }))
								}
								placeholder={t(
									"products.variants.dialog.namePlaceholder",
									"Auto-generated from options",
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="variant-base-price">Base Price (MRP) *</Label>
							<Input
								id="variant-base-price"
								type="number"
								step="0.01"
								value={formData.base_price}
								onChange={(e) =>
									setFormData((p) => ({ ...p, base_price: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-cost-price">Cost Price</Label>
							<Input
								id="variant-cost-price"
								type="number"
								step="0.01"
								value={formData.cost_price ?? ""}
								onChange={(e) =>
									setFormData((p) => ({
										...p,
										cost_price: e.target.value || null,
									}))
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="variant-stock">Stock Quantity</Label>
							<Input
								id="variant-stock"
								type="number"
								value={formData.stock_quantity}
								onChange={(e) =>
									setFormData((p) => ({
										...p,
										stock_quantity: parseInt(e.target.value) || 0,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-low-stock">Low Stock Threshold</Label>
							<Input
								id="variant-low-stock"
								type="number"
								value={formData.low_stock_threshold}
								onChange={(e) =>
									setFormData((p) => ({
										...p,
										low_stock_threshold: parseInt(e.target.value) || 5,
									}))
								}
							/>
						</div>
					</div>

					{/* Variant Options Selection */}
					{variantTypes.length > 0 && (
						<div className="space-y-3">
							<div>
								<Label>Variant Options</Label>
								<p className="text-xs text-muted-foreground mt-1">
									{t(
										"products.variants.dialog.optionsHelp",
										"Choose up to one option from each variant type. Leave name blank to auto-generate it from the selected options.",
									)}
								</p>
							</div>
							{variantTypes.map((vt) => (
								<div key={vt.id} className="space-y-1.5">
									<p className="text-sm text-muted-foreground font-medium">
										{vt.name}
									</p>
									<div className="flex flex-wrap gap-2">
										{vt.options.map((option) => {
											const isSelected =
												formData.option_ids?.includes(option.id) ?? false;

											return (
												<button
													key={option.id}
													type="button"
													onClick={() => handleOptionToggle(vt.id, option.id)}
													className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
														isSelected
															? "bg-primary text-primary-foreground border-primary"
															: "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
													}`}
												>
													{option.value}
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}

					<div className="flex items-center gap-2">
						<input
							id="variant-active"
							type="checkbox"
							checked={formData.is_active}
							onChange={(e) =>
								setFormData((p) => ({ ...p, is_active: e.target.checked }))
							}
							className="h-4 w-4 rounded border-border"
						/>
						<Label htmlFor="variant-active">Active</Label>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							<T id="common.cancel" defaultMessage="Cancel" />
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{isEdit
								? t("products.variants.dialog.update", "Update")
								: t("products.variants.dialog.create", "Create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
