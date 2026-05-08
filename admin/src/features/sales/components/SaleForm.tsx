import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
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

type TranslateFn = ReturnType<typeof useT>;

const createSaleSchema = (t: TranslateFn) =>
	z.object({
		name: z
			.string()
			.min(1, t("sales.form.validation.nameRequired", "Sale name is required"))
			.max(
				200,
				t("sales.form.validation.nameMax", "Sale name must not exceed 200 characters"),
			),
		description: z
			.string()
			.max(
				1000,
				t(
					"sales.form.validation.descriptionMax",
					"Description must not exceed 1000 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		discount_type: z.enum(["percentage", "fixed_amount"]),
		discount_value: z.coerce
			.number()
			.positive(
				t(
					"sales.form.validation.discountPositive",
					"Discount value must be positive",
				),
			),
		applies_to: z.enum(["all_products", "specific_categories", "specific_products"]),
		categories: z.array(z.string()).default([]),
		products: z.array(z.string()).default([]),
		valid_from: z
			.string()
			.min(1, t("sales.form.validation.validFrom", "Start date is required")),
		valid_until: z
			.string()
			.min(1, t("sales.form.validation.validUntil", "End date is required")),
		allow_coupon_stacking: z.boolean().default(true),
		is_active: z.boolean().default(true),
	});

type SaleFormData = z.infer<ReturnType<typeof createSaleSchema>>;

interface SaleFormProps {
	handleClose: () => void;
	sale?: SaleListItem | null;
	mode: "create" | "edit";
}

export const SaleForm = ({ handleClose, sale, mode }: SaleFormProps) => {
	const t = useT();
	const { mutate: createSale, isPending: isCreating } = useCreateSale();
	const { mutate: updateSale, isPending: isUpdating } = useUpdateSale();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(createSaleSchema(t), {
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
	const discountType = form.watch("discount_type");

	const discountTypeOptions = [
		{
			value: "percentage",
			label: t("sales.form.discountType.percentage", "Percentage (%)"),
		},
		{
			value: "fixed_amount",
			label: t("sales.form.discountType.fixedAmount", "Fixed Amount (৳)"),
		},
	];

	const appliesToOptions = [
		{
			value: "all_products",
			label: t("sales.form.appliesTo.allProducts", "All Products"),
		},
		{
			value: "specific_categories",
			label: t(
				"sales.form.appliesTo.specificCategories",
				"Specific Categories",
			),
		},
		{
			value: "specific_products",
			label: t("sales.form.appliesTo.specificProducts", "Specific Products"),
		},
	];

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
						toast.success(
							t("sales.form.toast.updateSuccess", "Sale updated successfully"),
						);
					},
				}
			);
		} else {
			createSale(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success(
						t("sales.form.toast.createSuccess", "Sale created successfully"),
					);
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
					label={t("sales.form.name", "Sale Name")}
					placeholder={t(
						"sales.form.namePlaceholder",
						"e.g., Summer Sale, Eid Special",
					)}
					required
				/>

				<div className="grid grid-cols-2 gap-4">
					<SelectField
						name="discount_type"
						label={t("sales.form.discountType", "Discount Type")}
						options={discountTypeOptions}
						required
					/>
					<TextField
						name="discount_value"
						label={t("sales.form.discountValue", "Discount Value")}
						placeholder={
							discountType === "percentage"
								? t("sales.form.discountValuePlaceholderPercentage", "e.g., 20")
								: t("sales.form.discountValuePlaceholderFixed", "e.g., 100")
						}
						type="number"
						required
						description={
							discountType === "percentage"
								? t(
										"sales.form.discountValueHelpPercentage",
										"Percentage off (0-100)",
									)
								: t("sales.form.discountValueHelpFixed", "Fixed amount in ৳")
						}
					/>
				</div>

				<SelectField
					name="applies_to"
					label={t("sales.form.appliesTo", "Applies To")}
					options={appliesToOptions}
					required
				/>

				{appliesTo === "specific_categories" && (
					<div>
						<label className="text-sm font-medium">
							{t("sales.form.categories", "Categories")}
						</label>
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
								<span className="text-muted-foreground text-sm col-span-2">
									{t("sales.form.noCategories", "No categories found")}
								</span>
							)}
						</div>
					</div>
				)}

				{appliesTo === "specific_products" && (
					<div>
						<label className="text-sm font-medium">
							{t("sales.form.products", "Products")}
						</label>
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
								<span className="text-muted-foreground text-sm">
									{t("sales.form.noProducts", "No products found")}
								</span>
							)}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="valid_from"
						label={t("sales.form.validFrom", "Valid From")}
						type="datetime-local"
						required
					/>
					<TextField
						name="valid_until"
						label={t("sales.form.validUntil", "Valid Until")}
						type="datetime-local"
						required
					/>
				</div>

				<TextareaField
					name="description"
					label={t("sales.form.description", "Description")}
					placeholder={t(
						"sales.form.descriptionPlaceholder",
						"e.g., 20% off on all organic products",
					)}
				/>

				<div className="flex flex-col gap-2">
					<CheckboxField
						name="allow_coupon_stacking"
						label={t(
							"sales.form.allowCouponStacking",
							"Allow coupon codes to be used with this sale",
						)}
					/>
					<CheckboxField
						name="is_active"
						label={t("sales.form.active", "Active")}
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? (
						<T id="sales.form.update" defaultMessage="Update Sale" />
					) : (
						<T id="sales.form.create" defaultMessage="Create Sale" />
					)}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
