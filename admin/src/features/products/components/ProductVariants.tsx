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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProductVariantsProps {
	productId: string;
}

export const ProductVariants = ({ productId }: ProductVariantsProps) => {
	const { data: variants = [], isLoading } = useQuery(
		getProductVariants(productId)
	);
	const { data: variantTypes = [] } = useQuery(getVariantTypes());

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
		null
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
							Manage size, color, weight, and other variant options
						</CardDescription>
					</div>
					<Button size="sm" onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-1" />
						Add Variant
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
						<p>No variants configured for this product.</p>
						<p className="text-sm mt-1">
							Add variants to offer different sizes, colors, or weights.
						</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Options</TableHead>
								<TableHead className="text-right">Price</TableHead>
								<TableHead className="text-right">Stock</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{variants.map((variant) => (
								<VariantRow
									key={variant.id}
									variant={variant}
									onEdit={handleEdit}
								/>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>

			<VariantFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				productId={productId}
				variant={editingVariant}
				variantTypes={variantTypes}
			/>
		</Card>
	);
};

// ============================================================
// Variant Row
// ============================================================

function VariantRow({
	variant,
	onEdit,
}: {
	variant: ProductVariant;
	onEdit: (v: ProductVariant) => void;
}) {
	const { mutate: deleteVariant, isPending: isDeleting } =
		useDeleteProductVariant();

	const handleDelete = () => {
		if (!confirm("Delete this variant?")) return;
		deleteVariant(variant.id, {
			onSuccess: () => toast.success("Variant deleted"),
			onError: () => toast.error("Failed to delete variant"),
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
				BDT {Number(variant.price).toFixed(2)}
			</TableCell>
			<TableCell className="text-right">{variant.stock_quantity}</TableCell>
			<TableCell>
				<Badge variant={variant.is_active ? "success" : "secondary"}>
					{variant.is_active ? "Active" : "Inactive"}
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
	variantTypes: { id: string; name: string; options: { id: string; value: string }[] }[];
}

function VariantFormDialog({
	open,
	onOpenChange,
	productId,
	variant,
	variantTypes,
}: VariantFormDialogProps) {
	const isEdit = !!variant;
	const { mutate: createVariant, isPending: isCreating } =
		useCreateProductVariant();
	const { mutate: updateVariant, isPending: isUpdating } =
		useUpdateProductVariant();
	const isPending = isCreating || isUpdating;

	const [formData, setFormData] = useState<CreateProductVariantRequest>({
		sku: "",
		name: "",
		price: "",
		compare_at_price: null,
		cost_price: null,
		stock_quantity: 0,
		low_stock_threshold: 5,
		weight: null,
		is_active: true,
		display_order: 0,
		option_ids: [],
	});

	useEffect(() => {
		if (variant) {
			setFormData({
				sku: variant.sku,
				name: variant.name,
				price: variant.price,
				compare_at_price: variant.compare_at_price || null,
				cost_price: variant.cost_price || null,
				stock_quantity: variant.stock_quantity,
				low_stock_threshold: variant.low_stock_threshold,
				weight: variant.weight || null,
				is_active: variant.is_active,
				display_order: variant.display_order,
				option_ids: variant.options.map((o) => o.id),
			});
		} else {
			setFormData({
				sku: "",
				name: "",
				price: "",
				compare_at_price: null,
				cost_price: null,
				stock_quantity: 0,
				low_stock_threshold: 5,
				weight: null,
				is_active: true,
				display_order: 0,
				option_ids: [],
			});
		}
	}, [variant, open]);

	const handleOptionToggle = (optionId: string) => {
		setFormData((prev) => ({
			...prev,
			option_ids: prev.option_ids?.includes(optionId)
				? prev.option_ids.filter((id) => id !== optionId)
				: [...(prev.option_ids || []), optionId],
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEdit && variant) {
			updateVariant(
				{ variantId: variant.id, data: formData },
				{
					onSuccess: () => {
						toast.success("Variant updated");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to update variant"),
				}
			);
		} else {
			createVariant(
				{ productId, data: formData },
				{
					onSuccess: () => {
						toast.success("Variant created");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to create variant"),
				}
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Variant" : "Add Variant"}
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
								placeholder="Auto-generated from options"
							/>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="variant-price">Price *</Label>
							<Input
								id="variant-price"
								type="number"
								step="0.01"
								value={formData.price}
								onChange={(e) =>
									setFormData((p) => ({ ...p, price: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-compare-price">Compare Price</Label>
							<Input
								id="variant-compare-price"
								type="number"
								step="0.01"
								value={formData.compare_at_price ?? ""}
								onChange={(e) =>
									setFormData((p) => ({
										...p,
										compare_at_price: e.target.value || null,
									}))
								}
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
							<Label>Variant Options</Label>
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
													onClick={() => handleOptionToggle(option.id)}
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
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{isEdit ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
