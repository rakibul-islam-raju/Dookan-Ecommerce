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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { UNIT_OPTIONS } from "@/constants/selectOptions";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { getCategories, type CategoryFilter } from "@/lib/api/category";
import {
	useCreateProduct,
	useUpdateProduct,
	type CreateProductRequest,
	type ProductDetailsResponse,
} from "@/lib/api/product";
import { getVariantTypes, type VariantType } from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const initialCategoryParams: CategoryFilter = {
	limit: 100,
	offset: 0,
	search: "",
	is_active: true,
};

const createVariantRowSchema = (t: TranslateFn) =>
	z
		.object({
			name: z.string().optional(),
			sku: z.string().min(1, t("products.form.validation.sku", "SKU is required")),
			base_price: z.coerce
				.number()
				.min(0.01, t("products.form.validation.price", "Price required")),
			cost_price: z.coerce.number().optional(),
			stock_quantity: z.coerce.number().min(0).optional(),
			low_stock_threshold: z.coerce.number().min(0).optional(),
			weight: z.coerce.number().optional(),
			display_order: z.coerce.number().optional(),
			option_ids: z.array(z.string()).optional().default([]),
		})
		.superRefine((data, ctx) => {
			const hasName = !!data.name?.trim();
			const hasOptions = (data.option_ids?.length ?? 0) > 0;

			if (!hasName && !hasOptions) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["name"],
					message: t(
						"products.form.validation.variantNameOrOptions",
						"Select variant options or enter a variant name",
					),
				});
			}
		});

const createProductSchema = (t: TranslateFn) =>
	z
		.object({
			name: z.string().min(1, t("products.form.validation.name", "Name is required")),
			slug: z.string().min(1, t("products.form.validation.slug", "Slug is required")),
			sku: z.string().min(1, t("products.form.validation.sku", "SKU is required")),
			description: z.string().optional().nullable(),
			short_description: z
				.string()
				.max(
					300,
					t(
						"products.form.validation.shortDescriptionMax",
						"Short description must be at most 300 characters",
					),
				)
				.optional()
				.nullable(),
			category: z
				.string()
				.min(1, t("products.form.validation.category", "Category is required")),
			base_price: z.coerce
				.number()
				.min(
					0.01,
					t("products.form.validation.basePrice", "Base price is required"),
				),
			cost_price: z.coerce.number().optional(),
			is_digital: z.boolean().default(false),
			weight: z.coerce.number().optional(),
			unit: z.enum(["kg", "g", "l", "ml", "piece", "pack"]),
			unit_value: z.string().optional(),
			meta_title: z.string().optional().nullable(),
			meta_description: z.string().optional().nullable(),
			is_featured: z.boolean().default(false),
			is_active: z.boolean().default(true),
			variants: z
				.array(createVariantRowSchema(t))
				.min(
					1,
					t(
						"products.form.validation.variantRequired",
						"At least one variant is required",
					),
				),
		})
		.refine(
			(data) => {
				if (!data.cost_price) return true;
				return data.base_price > data.cost_price;
			},
			{
				path: ["base_price"],
				message: t(
					"products.form.validation.basePriceHigher",
					"Base price must be greater than cost price",
				),
			},
		);

type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>;

const defaultVariant = {
	name: "",
	sku: "",
	base_price: 0,
	cost_price: 0,
	stock_quantity: 0,
	low_stock_threshold: 5,
	weight: 0,
	display_order: 0,
	option_ids: [],
};

const productDefaultValues: ProductFormData = {
	name: "",
	slug: "",
	sku: "",
	description: "",
	short_description: "",
	category: "",
	base_price: 0,
	cost_price: 0,
	is_digital: false,
	weight: 0,
	unit: "kg",
	unit_value: "",
	meta_title: "",
	meta_description: "",
	is_featured: false,
	is_active: true,
	variants: [{ ...defaultVariant }],
};

export interface ProductFormProps {
	product?: ProductDetailsResponse;
	mode: "create" | "edit";
	handleClose: () => void;
}

const getNextOptionIds = (
	currentOptionIds: string[],
	variantTypeId: string,
	optionId: string,
	variantTypes: VariantType[],
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

export const ProductForm: React.FC<ProductFormProps> = ({
	product,
	mode,
	handleClose,
}) => {
	const t = useT();
	const isEditMode = mode === "edit";
	const navigate = useNavigate();

	const form = useZodForm(createProductSchema(t), {
		defaultValues: isEditMode
			? {
				...product,
				category: product?.category.id,
				cost_price: product?.cost_price ? parseFloat(product.cost_price) : 0,
				base_price: parseFloat(product?.base_price ?? "0"),
				variants: [{ ...defaultVariant }],
			}
			: productDefaultValues,
		mode: "onChange",
	});

	const { data: categories } = useQuery(getCategories(initialCategoryParams));
	const { data: variantTypes = [] } = useQuery(getVariantTypes());

	const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
	const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
	const isPending = isCreating || isUpdating;

	const { fields: variantFields, append, remove } = useFieldArray({
		control: form.control,
		name: "variants",
	});

	const isDigital = useWatch({ control: form.control, name: "is_digital" });
	const variantValues = useWatch({ control: form.control, name: "variants" });

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
			base_price: data.base_price.toString(),
			cost_price: data.cost_price?.toString() ?? null,
			weight: data.weight?.toString() ?? null,
			variants: data.variants.map((v) => ({
				name: v.name,
				sku: v.sku,
				base_price: v.base_price.toString(),
				cost_price: v.cost_price?.toString() ?? null,
				stock_quantity: v.stock_quantity ?? 0,
				low_stock_threshold: v.low_stock_threshold ?? 5,
				weight: v.weight?.toString() ?? null,
				display_order: v.display_order ?? 0,
				option_ids: v.option_ids ?? [],
			})),
		};
		if (isEditMode && product) {
			// In edit mode we only update product-level fields (variants managed separately)
			const editData = { ...requestData };
			delete editData.variants;
			updateProduct(
				{
					id: product.id,
					updateData: editData,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success(
							t("products.form.toast.updateSuccess", "Product updated successfully"),
						);
						if (createAnother) {
							navigate("/products/create");
						} else {
							navigate("/products");
						}
					},
					onError: (error) => {
						toast.error(
							t("products.form.toast.updateFailed", "Failed to update product"),
						);
						console.error(error);
					},
				}
			);
		} else {
			createProduct(requestData, {
				onSuccess: () => {
					handleCancel();
					toast.success(
						t("products.form.toast.createSuccess", "Product created successfully"),
					);
					if (createAnother) {
						form.reset(productDefaultValues);
					} else {
						form.reset(productDefaultValues);
						navigate("/products");
					}
				},
				onError: () => {
					toast.error(
						t("products.form.toast.createFailed", "Failed to create product"),
					);
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

	useEffect(() => {
		if (!isEditMode) {
			form.setValue("slug", slugify(nameValue, { lower: true }));
		}
	}, [nameValue, isEditMode, form]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const variantErrors = (form.formState.errors.variants as any) ?? [];

	const handleVariantOptionToggle = (
		index: number,
		variantTypeId: string,
		optionId: string,
	) => {
		const currentOptionIds = form.getValues(`variants.${index}.option_ids`) ?? [];
		form.setValue(
			`variants.${index}.option_ids`,
			getNextOptionIds(currentOptionIds, variantTypeId, optionId, variantTypes),
			{ shouldDirty: true, shouldValidate: true },
		);
	};

	return (
		<BaseForm
			form={form}
			onSubmit={onSubmit}
			className="space-y-6 pb-12 mx-auto"
		>
			<Card>
				<CardHeader>
					<CardTitle>{t("products.form.info.title", "Product Information")}</CardTitle>
					<CardDescription>
						{t(
							"products.form.info.description",
							"Enter the core details of your product.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="name"
						label={t("products.form.info.name", "Name")}
						required
						placeholder={t("products.form.info.namePlaceholder", "e.g., Product Name")}
						helpText={t(
							"products.form.info.nameHelp",
							"Product name as displayed on the storefront.",
						)}
					/>
					<TextField
						name="slug"
						label={t("products.form.info.slug", "Slug")}
						required
						placeholder={t("products.form.info.slugPlaceholder", "e.g., product-name")}
						helpText={t(
							"products.form.info.slugHelp",
							"URL-friendly version of the name. Unique identifier for the product page.",
						)}
					/>
					<TextareaField
						name="short_description"
						label={t("products.form.info.shortDescription", "Short Description")}
					/>
					<TextareaField
						name="description"
						label={t("products.form.info.descriptionLabel", "Description")}
						placeholder={t(
							"products.form.info.descriptionPlaceholder",
							"e.g., Description of the product",
						)}
						rows={10}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("products.form.pricing.title", "Pricing")}</CardTitle>
					<CardDescription>
						{t("products.form.pricing.description", "Manage your product pricing.")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextField
							name="cost_price"
							label={t("products.form.pricing.costPrice", "Cost Price")}
							type="number"
							placeholder={t("products.form.pricing.costPricePlaceholder", "e.g., 100")}
							helpText={t(
								"products.form.pricing.costPriceHelp",
								"Your internal cost for this item. Not visible to customers.",
							)}
						/>
						<TextField
							name="base_price"
							label={t("products.form.pricing.basePrice", "Base Price (MRP)")}
							type="number"
							placeholder={t("products.form.pricing.basePricePlaceholder", "e.g., 250")}
							helpText={t(
								"products.form.pricing.basePriceHelp",
								"The original/MRP price. Variant prices override this per-variant.",
							)}
							required
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						{t(
							"products.form.pricing.saleHelp",
							"To offer a sale discount on this product, create a sale in the",
						)}{" "}
						<a href="/sales" className="underline text-primary">Sales</a> section.
					</p>
				</CardContent>
			</Card>

			{/* ── Variants ─────────────────────────────────────────── */}
			{!isEditMode && (
				<Card>
					<CardHeader>
						<CardTitle>{t("products.form.variants.title", "Variants")}</CardTitle>
						<CardDescription>
							{t(
								"products.form.variants.description",
								"Every product requires at least one sellable variant. Select reusable variant options where applicable, then set SKU, price, and stock for each row.",
							)}
							{isDigital
								? ` ${t(
										"products.form.variants.digitalNote",
										"Stock fields are hidden for digital products.",
									)}`
								: ""}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Column headers */}
						<div className={`hidden md:grid gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 ${isDigital ? "grid-cols-[1fr_1fr_1fr_32px]" : "grid-cols-[1fr_1fr_1fr_80px_80px_32px]"}`}>
							<span>{t("products.form.variants.columns.name", "Variant Name")}</span>
							<span>{t("products.form.variants.columns.sku", "SKU")} <span className="text-red-500">*</span></span>
							<span>{t("products.form.variants.columns.price", "Price")} <span className="text-red-500">*</span></span>
							{!isDigital && <span>{t("products.form.variants.columns.stock", "Stock")}</span>}
							{!isDigital && <span>{t("products.form.variants.columns.lowStock", "Low Stock")}</span>}
							<span />
						</div>

						{variantTypes.length === 0 && (
							<p className="text-sm text-muted-foreground">
								{t(
									"products.form.variants.emptyTypes",
									"No reusable variant types are configured yet. You can still create variants manually by entering a variant name.",
								)}
							</p>
						)}

						{variantFields.map((field, index) => (
							<div
								key={field.id}
								className="space-y-3 rounded-lg border p-4"
							>
								<div className={`grid gap-2 items-start ${isDigital ? "grid-cols-1 md:grid-cols-[1fr_1fr_1fr_32px]" : "grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px_80px_32px]"}`}>
									{/* Name */}
									<div>
										<Label className="md:hidden text-xs mb-1 block">
											{t("products.form.info.name", "Name")}
										</Label>
										<Input
											placeholder={t(
												"products.form.variants.namePlaceholder",
												"Auto from options, or enter custom name",
											)}
											{...form.register(`variants.${index}.name`)}
											className={variantErrors?.[index]?.name ? "border-red-500" : ""}
										/>
										{variantErrors?.[index]?.name && (
											<p className="text-xs text-red-500 mt-0.5">{variantErrors[index].name.message}</p>
										)}
									</div>

									{/* SKU */}
									<div>
										<Label className="md:hidden text-xs mb-1 block">
											{t("products.form.variants.columns.sku", "SKU")} *
										</Label>
										<Input
											placeholder={t(
												"products.form.variants.skuPlaceholder",
												"e.g., PRD-001-500",
											)}
											{...form.register(`variants.${index}.sku`)}
											className={variantErrors?.[index]?.sku ? "border-red-500" : ""}
										/>
										{variantErrors?.[index]?.sku && (
											<p className="text-xs text-red-500 mt-0.5">{variantErrors[index].sku.message}</p>
										)}
									</div>

									{/* Price */}
									<div>
										<Label className="md:hidden text-xs mb-1 block">
											{t("products.form.variants.columns.price", "Price")} *
										</Label>
										<Input
											type="number"
											min={0.01}
											step={0.01}
											placeholder={t("products.form.variants.pricePlaceholder", "0.00")}
											{...form.register(`variants.${index}.base_price`)}
											className={variantErrors?.[index]?.base_price ? "border-red-500" : ""}
										/>
										{variantErrors?.[index]?.base_price && (
											<p className="text-xs text-red-500 mt-0.5">{variantErrors[index].base_price.message}</p>
										)}
									</div>

									{/* Stock — hidden for digital */}
									{!isDigital && (
										<div>
											<Label className="md:hidden text-xs mb-1 block">
												{t("products.form.variants.columns.stock", "Stock")}
											</Label>
											<Input
												type="number"
												min={0}
												placeholder="0"
												{...form.register(`variants.${index}.stock_quantity`)}
											/>
										</div>
									)}

									{/* Low Stock — hidden for digital */}
									{!isDigital && (
										<div>
											<Label className="md:hidden text-xs mb-1 block">
												{t("products.form.variants.columns.lowStock", "Low Stock")}
											</Label>
											<Input
												type="number"
												min={0}
												placeholder="5"
												{...form.register(`variants.${index}.low_stock_threshold`)}
											/>
										</div>
									)}

									{/* Remove */}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-9 w-9 text-muted-foreground hover:text-destructive mt-0 md:mt-0"
										onClick={() => remove(index)}
										disabled={variantFields.length === 1}
										title={t("products.form.variants.remove", "Remove variant")}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								{variantTypes.length > 0 && (
									<div className="space-y-3 rounded-md border bg-muted/20 p-3">
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-sm font-medium">
													{t("products.form.variants.optionsTitle", "Variant Options")}
												</p>
												<p className="text-xs text-muted-foreground">
													{t(
														"products.form.variants.optionsDescription",
														"Choose up to one option from each variant type for this variant.",
													)}
												</p>
											</div>
										</div>
										{variantTypes.map((variantType) => {
											const selectedOptionIds =
												variantValues?.[index]?.option_ids ?? [];
											return (
												<div key={variantType.id} className="space-y-1.5">
													<p className="text-sm text-muted-foreground font-medium">
														{variantType.name}
													</p>
													<div className="flex flex-wrap gap-2">
														{variantType.options.map((option) => {
															const isSelected = selectedOptionIds.includes(option.id);
															return (
																<button
																	key={option.id}
																	type="button"
																	onClick={() =>
																		handleVariantOptionToggle(
																			index,
																			variantType.id,
																			option.id,
																		)
																	}
																	className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
																		isSelected
																			? "bg-primary text-primary-foreground border-primary"
																			: "bg-background text-muted-foreground border-border hover:bg-muted"
																	}`}
																>
																	{option.value}
																</button>
															);
														})}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						))}

						{typeof variantErrors?.message === "string" && (
							<p className="text-sm text-red-500">{variantErrors.message}</p>
						)}
						{typeof variantErrors?.root?.message === "string" && (
							<p className="text-sm text-red-500">{variantErrors.root.message}</p>
						)}

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => append({ ...defaultVariant })}
							className="w-full mt-1"
						>
							<Plus className="h-4 w-4 mr-2" />
							{t("products.form.variants.add", "Add Variant")}
						</Button>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{t("products.form.specs.title", "Specifications")}</CardTitle>
					<CardDescription>
						{t("products.form.specs.description", "Unit and packaging information.")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<TextField
							name="sku"
							label={t("products.form.specs.productSku", "Product SKU")}
							required
							placeholder={t("products.form.specs.productSkuPlaceholder", "e.g., SKU123")}
							helpText={t(
								"products.form.specs.productSkuHelp",
								"Unique identifier for the product (not a variant).",
							)}
						/>
						<SelectField
							name="unit"
							label={t("products.form.specs.unit", "Unit")}
							required
							options={UNIT_OPTIONS}
							placeholder={t("products.form.specs.unitPlaceholder", "Select a unit")}
							helpText={t(
								"products.form.specs.unitHelp",
								"Measurement unit for this product (e.g., kg, piece, pack).",
							)}
						/>
						<TextField
							name="unit_value"
							label={t("products.form.specs.unitValue", "Unit Value")}
							type="number"
							required
							helpText={t(
								"products.form.specs.unitValueHelp",
								"The numeric value for the selected unit (e.g., '500' for 500g).",
							)}
						/>
						<TextField
							name="weight"
							label={t("products.form.specs.weight", "Weight (in grams)")}
							helpText={t(
								"products.form.specs.weightHelp",
								"Product weight in grams. Used for shipping cost calculations.",
							)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("products.form.organization.title", "Organization")}</CardTitle>
					<CardDescription>
						{t("products.form.organization.description", "Category, type, and status.")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<SelectField
							name="category"
							label={t("products.form.organization.category", "Category")}
							required
							placeholder={t(
								"products.form.organization.categoryPlaceholder",
								"Select a category",
							)}
							options={
								categories?.results.map((category) => ({
									label: category.name,
									value: category.id,
								})) ?? []
							}
						/>
						<div className="space-y-2 pt-2">
							<CheckboxField
								name="is_digital"
								label={t(
									"products.form.organization.digital",
									"Digital Product (no stock tracking - e.g., ebook, gift card)",
								)}
							/>
							{isEditMode && (
								<CheckboxField
									name="is_active"
									label={t("products.form.organization.active", "Active Product")}
								/>
							)}
							<CheckboxField
								name="is_featured"
								label={t("products.form.organization.featured", "Featured Product")}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("products.form.seo.title", "SEO")}</CardTitle>
					<CardDescription>
						{t("products.form.seo.description", "Search Engine Optimization.")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<TextField
						name="meta_title"
						label={t("products.form.seo.metaTitle", "Meta Title")}
						helpText={t(
							"products.form.seo.metaTitleHelp",
							"Title tag for search engines. Optimized for click-through rates.",
						)}
					/>
					<TextareaField
						name="meta_description"
						label={t("products.form.seo.metaDescription", "Meta Description")}
						helpText={t(
							"products.form.seo.metaDescriptionHelp",
							"Description meta tag for search engines. Summarize the product page.",
						)}
					/>
				</CardContent>
			</Card>

			<div className="flex justify-between gap-2 p-4 border rounded-lg shadow-sm">
				<Button type="button" variant="outline" onClick={handleCancel}>
					{t("products.form.cancel", "Cancel")}
				</Button>
				<div className="flex justify-end gap-2">
					{!isEditMode && (
						<LoadingButton
							variant="outline"
							type="button"
							onClick={handleSaveAndCreateAnother}
							isLoading={isPending}
						>
							{t("products.form.saveAndCreateAnother", "Save & Create Another")}
						</LoadingButton>
					)}
					<LoadingButton type="submit" isLoading={isPending}>
						{isEditMode
							? t("products.form.submitUpdate", "Update Product")
							: t("products.form.submitCreate", "Create Product")}
					</LoadingButton>
				</div>
			</div>
		</BaseForm>
	);
};
