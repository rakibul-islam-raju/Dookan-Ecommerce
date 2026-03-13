import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { UNIT_OPTIONS } from "@/constants/selectOptions";
import { useZodForm } from "@/hooks/useZodForm";
import { getCategories, type CategoryFilter } from "@/lib/api/category";
import {
	useCreateProduct,
	useUpdateProduct,
	type CreateProductRequest,
	type ProductDetailsResponse,
} from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

const initialCategoryParams: CategoryFilter = {
	limit: 100,
	offset: 0,
	search: "",
	is_active: true,
};

const productSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		slug: z.string().min(1, "Slug is required"),
		sku: z.string().min(1, "SKU is required"),
		description: z.string().optional().nullable(),
		short_description: z
			.string()
			.max(300, "Short description must be at most 300 characters")
			.optional()
			.nullable(),
		category: z.string().min(1, "Category is required"),
		price: z.coerce.number().min(0, "Price is required"),
		compare_at_price: z.coerce.number().optional(),
		cost_price: z.coerce.number().optional(),
		stock_quantity: z.coerce.number().min(0, "Stock quantity is required"),
		low_stock_threshold: z.coerce
			.number()
			.min(0, "Low stock threshold is required"),
		track_inventory: z.boolean().default(false),
		weight: z.coerce.number().optional(),
		unit: z.enum(["kg", "g", "l", "ml", "piece", "pack"]),
		unit_value: z.string().optional(),
		meta_title: z.string().optional().nullable(),
		meta_description: z.string().optional().nullable(),
		is_featured: z.boolean().default(false),
		is_active: z.boolean().default(true),
	})
	.refine(
		(data) => {
			if (!data.compare_at_price) return true;
			return data.price < data.compare_at_price;
		},
		{
			path: ["price"],
			message: "Selling price must be less than original price",
		}
	)
	.refine(
		(data) => {
			if (!data.cost_price) return true;
			return data.price > data.cost_price;
		},
		{
			path: ["price"],
			message: "Selling price must be greater than cost price",
		}
	)
	.refine(
		(data) => {
			if (!data.cost_price || !data.compare_at_price) return true;
			return data.compare_at_price > data.cost_price;
		},
		{
			path: ["compare_at_price"],
			message: "Original price must be greater than cost price",
		}
	);

type ProductFormData = z.infer<typeof productSchema>;

const productDefaultValues: ProductFormData = {
	name: "",
	slug: "",
	sku: "",
	description: "",
	short_description: "",
	category: "",
	compare_at_price: 0,
	price: 0,
	cost_price: 0,
	stock_quantity: 0,
	low_stock_threshold: 0,
	track_inventory: false,
	weight: 0,
	unit: "kg",
	unit_value: "",
	meta_title: "",
	meta_description: "",
	is_featured: false,
	is_active: true,
};

export interface ProductFormProps {
	product?: ProductDetailsResponse;
	mode: "create" | "edit";
	handleClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
	product,
	mode,
	handleClose,
}) => {
	const isEditMode = mode === "edit";
	const navigate = useNavigate();

	const form = useZodForm(productSchema, {
		defaultValues: isEditMode
			? { ...product, category: product?.category.id }
			: productDefaultValues,
		mode: "onChange",
	});

	const { data: categories } = useQuery(getCategories(initialCategoryParams));

	const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
	const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
	const isPending = isCreating || isUpdating;

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const handleCreateProduct = (
		data: ProductFormData,
		createAnother: boolean
	) => {
		const requestData: CreateProductRequest = {
			...data,
			price: data.price.toString(),
			compare_at_price: data.compare_at_price?.toString() ?? null,
			cost_price: data.cost_price?.toString() ?? null,
			weight: data.weight?.toString() ?? null,
		};
		if (isEditMode && product) {
			updateProduct(
				{
					id: product.id,
					updateData: requestData,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Product updated successfully");
						if (createAnother) {
							navigate("/products/create");
						} else {
							navigate("/products");
						}
					},
					onError: (error) => {
						toast.error("Failed to update product");
						console.error(error);
					},
				}
			);
		} else {
			createProduct(requestData, {
				onSuccess: () => {
					handleCancel();
					toast.success("Product created successfully");
					if (createAnother) {
						form.reset(productDefaultValues);
					} else {
						form.reset(productDefaultValues);
						navigate("/products");
					}
				},
			});
		}
	};

	const onSubmit = async (data: ProductFormData) => {
		handleCreateProduct(data, false);
	};

	const handleSaveAndCreateAnother = () => {
		handleCreateProduct(form.getValues(), true);
	};

	const nameValue = form.watch("name");
	const compareAtPriceValue = form.watch("compare_at_price");
	const discountPrice = compareAtPriceValue
		? compareAtPriceValue - form.watch("price")
		: undefined;

	useEffect(() => {
		if (!isEditMode) {
			form.setValue("slug", slugify(nameValue, { lower: true }));
		}
	}, [nameValue, isEditMode, form]);

	return (
		<BaseForm
			form={form}
			onSubmit={onSubmit}
			className="space-y-6 pb-12 mx-auto"
		>
			<Card>
				<CardHeader>
					<CardTitle>Product Information</CardTitle>
					<CardDescription>
						Enter the core details of your product.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="name"
						label="Name"
						required
						placeholder="e.g., Product Name"
						helpText="Product name as displayed on the storefront."
					/>
					<TextField
						name="slug"
						label="Slug"
						required
						placeholder="e.g., product-name"
						helpText="URL-friendly version of the name. Unique identifier for the product page."
					/>
					<TextareaField name="short_description" label="Short Description" />
					<TextareaField
						name="description"
						label="Description"
						placeholder="e.g., Description of the product"
						rows={10}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Pricing</CardTitle>
					<CardDescription>Manage your product pricing.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<TextField
							name="cost_price"
							label="Cost Price"
							type="number"
							placeholder="e.g., 100"
							helpText="Your internal cost for this item. Not visible to customers."
							required
						/>
						<TextField
							name="compare_at_price"
							label="Original Price"
							type="number"
							placeholder="e.g., 100"
							helpText="The original price before discount. Shows a 'Sale' badge if higher than Selling Price."
						/>
						<TextField
							name="price"
							label="Selling Price"
							type="number"
							placeholder="e.g., 100"
							helpText="The actual price customers will pay."
							required
						/>
					</div>

					{discountPrice && discountPrice > 0 && (
						<div className="rounded-lg bg-green-50 border border-green-200 p-3">
							<div className="flex items-center gap-3">
								<div className="flex flex-col">
									<span className="text-base font-medium text-green-700">
										BDT {Number(form.watch("price")).toFixed(2)}
									</span>
								</div>
								<div className="ml-auto flex gap-4 items-center">
									<span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
										{Math.round(
											((Number(form.watch("compare_at_price")) -
												Number(form.watch("price"))) /
												Number(form.watch("compare_at_price"))) *
												100
										) || 0}
										% OFF
									</span>
									<span className="text-xs text-green-700">{`Save: BDT ${(
										Number(form.watch("compare_at_price")) -
										Number(form.watch("price"))
									).toFixed(2)}`}</span>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Inventory & Specifications</CardTitle>
					<CardDescription>
						Track stock and product specifications.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<TextField
							name="sku"
							label="SKU"
							required
							placeholder="e.g., SKU123"
							helpText="Stock Keeping Unit - a unique code for inventory tracking."
						/>
						<TextField
							name="stock_quantity"
							label="Stock Quantity"
							type="number"
							placeholder="e.g., 100"
							helpText="Total number of units currently in stock."
							required
						/>
						<TextField
							name="low_stock_threshold"
							label="Low Stock Threshold"
							type="number"
							helpText="Notify me when inventory reaches this level."
							required
						/>
						<SelectField
							name="unit"
							label="Unit"
							required
							options={UNIT_OPTIONS}
							helpText="Measurement unit for this product (e.g., kg, piece, pack)."
						/>
						<TextField
							name="unit_value"
							label="Unit Value"
							type="number"
							required
							helpText="The numeric value for the selected unit (e.g., if Unit is 'g', enter '500' for 500g)."
						/>
						<TextField
							name="weight"
							label="Weight (in grams)"
							required
							helpText="Product weight in grams. Used for shipping cost calculations."
						/>
						<div className="flex items-end pb-2 col-span-full">
							<CheckboxField
								name="track_inventory"
								label="Track Inventory (helps manage stock levels and low stock alerts.)"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Organization</CardTitle>
					<CardDescription>Category and status.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<SelectField
							name="category"
							label="Category"
							required
							options={
								categories?.results.map((category) => ({
									label: category.name,
									value: category.id,
								})) ?? []
							}
						/>
						<div className="space-y-2 pt-2">
							{isEditMode && (
								<CheckboxField name="is_active" label="Active Product" />
							)}
							<CheckboxField name="is_featured" label="Featured Product" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>SEO</CardTitle>
					<CardDescription>Search Engine Optimization.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="meta_title"
						label="Meta Title"
						helpText="Title tag for search engines. Optimized for click-through rates."
					/>
					<TextareaField
						name="meta_description"
						label="Meta Description"
						helpText="Description meta tag for search engines. Summarize the product page."
					/>
				</CardContent>
			</Card>

			<div className="flex justify-between gap-2 p-4 border rounded-lg shadow-sm">
				<Button type="button" variant="outline" onClick={handleCancel}>
					Cancel
				</Button>
				<div className="flex justify-end gap-2">
					<LoadingButton
						variant="outline"
						type="button"
						onClick={handleSaveAndCreateAnother}
						isLoading={isPending}
					>
						Save & Create Another
					</LoadingButton>
					<LoadingButton type="submit" isLoading={isPending}>
						{isEditMode ? "Update Product" : "Create Product"}
					</LoadingButton>
				</div>
			</div>
		</BaseForm>
	);
};
