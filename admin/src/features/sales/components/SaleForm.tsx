import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import { getCategories } from "@/lib/api/category";
import { getProducts } from "@/lib/api/product";
import {
	useCreateSale,
	useUpdateSale,
	type SaleListItem,
} from "@/lib/api/sale";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const saleSchema = z.object({
	name: z.string().min(1, "Sale name is required").max(200),
	description: z.string().max(1000).optional().or(z.literal("")),
	discount_type: z.enum(["percentage", "fixed_amount"]),
	discount_value: z.coerce.number().positive("Discount value must be positive"),
	applies_to: z.enum(["all_products", "specific_categories", "specific_products"]),
	categories: z.array(z.string()).default([]),
	products: z.array(z.string()).default([]),
	valid_from: z.string().min(1, "Start date is required"),
	valid_until: z.string().min(1, "End date is required"),
	allow_coupon_stacking: z.boolean().default(true),
	is_active: z.boolean().default(true),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
	handleClose: () => void;
	sale?: SaleListItem | null;
	mode: "create" | "edit";
}

const DISCOUNT_TYPE_OPTIONS = [
	{ value: "percentage", label: "Percentage (%)" },
	{ value: "fixed_amount", label: "Fixed Amount (৳)" },
];

const APPLIES_TO_OPTIONS = [
	{ value: "all_products", label: "All Products" },
	{ value: "specific_categories", label: "Specific Categories" },
	{ value: "specific_products", label: "Specific Products" },
];

export const SaleForm = ({ handleClose, sale, mode }: SaleFormProps) => {
	const { mutate: createSale, isPending: isCreating } = useCreateSale();
	const { mutate: updateSale, isPending: isUpdating } = useUpdateSale();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(saleSchema, {
		defaultValues: {
			name: "",
			description: "",
			discount_type: "percentage",
			discount_value: 0,
			applies_to: "all_products",
			categories: [],
			products: [],
			valid_from: "",
			valid_until: "",
			allow_coupon_stacking: true,
			is_active: true,
		},
	});

	const appliesTo = form.watch("applies_to");

	const { data: categoriesData } = useQuery(
		getCategories({ limit: 200, offset: 0, is_active: true })
	);
	const { data: productsData } = useQuery(
		getProducts({ limit: 200, offset: 0, is_active: true })
	);

	const categoryOptions =
		categoriesData?.results?.map((c) => ({ value: c.id, label: c.name })) ?? [];
	const productOptions =
		productsData?.results?.map((p) => ({ value: p.id, label: p.name })) ?? [];

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: SaleFormData) => {
		const payload = {
			...data,
			categories: appliesTo === "specific_categories" ? data.categories : [],
			products: appliesTo === "specific_products" ? data.products : [],
		};

		if (isEditMode && sale) {
			updateSale(
				{ id: sale.id, updateData: payload },
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Sale updated successfully");
					},
				}
			);
		} else {
			createSale(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success("Sale created successfully");
				},
			});
		}
	};

	useEffect(() => {
		if (sale && isEditMode) {
			const formatDate = (dateStr: string) =>
				new Date(dateStr).toISOString().slice(0, 16);
			form.reset({
				name: sale.name,
				description: sale.description || "",
				discount_type: sale.discount_type,
				discount_value: parseFloat(sale.discount_value),
				applies_to: sale.applies_to,
				categories: [],
				products: [],
				valid_from: formatDate(sale.valid_from),
				valid_until: formatDate(sale.valid_until),
				allow_coupon_stacking: sale.allow_coupon_stacking,
				is_active: sale.is_active,
			});
		}
	}, [sale, isEditMode]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label="Sale Name"
					placeholder="e.g., Summer Sale, Eid Special"
					required
				/>

				<div className="grid grid-cols-2 gap-4">
					<SelectField
						name="discount_type"
						label="Discount Type"
						options={DISCOUNT_TYPE_OPTIONS}
						required
					/>
					<TextField
						name="discount_value"
						label="Discount Value"
						placeholder={
							form.watch("discount_type") === "percentage" ? "e.g., 20" : "e.g., 100"
						}
						type="number"
						required
						description={
							form.watch("discount_type") === "percentage"
								? "Percentage off (0–100)"
								: "Fixed amount in ৳"
						}
					/>
				</div>

				<SelectField
					name="applies_to"
					label="Applies To"
					options={APPLIES_TO_OPTIONS}
					required
				/>

				{appliesTo === "specific_categories" && (
					<div>
						<label className="text-sm font-medium">Categories</label>
						<div className="mt-2 border rounded-md p-3 max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
							{categoryOptions.map((opt) => (
								<label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
									<input
										type="checkbox"
										className="rounded"
										checked={form.watch("categories").includes(opt.value)}
										onChange={(e) => {
											const current = form.getValues("categories");
											form.setValue(
												"categories",
												e.target.checked
													? [...current, opt.value]
													: current.filter((id) => id !== opt.value)
											);
										}}
									/>
									{opt.label}
								</label>
							))}
							{categoryOptions.length === 0 && (
								<span className="text-muted-foreground text-sm col-span-2">No categories found</span>
							)}
						</div>
					</div>
				)}

				{appliesTo === "specific_products" && (
					<div>
						<label className="text-sm font-medium">Products</label>
						<div className="mt-2 border rounded-md p-3 max-h-48 overflow-y-auto grid grid-cols-1 gap-2">
							{productOptions.map((opt) => (
								<label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
									<input
										type="checkbox"
										className="rounded"
										checked={form.watch("products").includes(opt.value)}
										onChange={(e) => {
											const current = form.getValues("products");
											form.setValue(
												"products",
												e.target.checked
													? [...current, opt.value]
													: current.filter((id) => id !== opt.value)
											);
										}}
									/>
									{opt.label}
								</label>
							))}
							{productOptions.length === 0 && (
								<span className="text-muted-foreground text-sm">No products found</span>
							)}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="valid_from"
						label="Valid From"
						type="datetime-local"
						required
					/>
					<TextField
						name="valid_until"
						label="Valid Until"
						type="datetime-local"
						required
					/>
				</div>

				<TextareaField
					name="description"
					label="Description"
					placeholder="e.g., 20% off on all organic products"
				/>

				<div className="flex flex-col gap-2">
					<CheckboxField
						name="allow_coupon_stacking"
						label="Allow coupon codes to be used with this sale"
					/>
					<CheckboxField name="is_active" label="Active" />
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Sale" : "Create Sale"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
