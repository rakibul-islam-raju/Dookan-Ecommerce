import { RadioField } from "@/components/ui/@form/RadioField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useT } from "@/i18n/use-t";
import { getCategories } from "@/lib/api/category";
import type { ProductFilter } from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type ProductFilterFormProps = {
	initialFilter: ProductFilter;
	onFilter: (filter: ProductFilter) => void;
	onReset: () => void;
};

export const ProductFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: ProductFilterFormProps) => {
	const t = useT();
	const { data: categories } = useQuery(
		getCategories({
			limit: 100,
			offset: 0,
			search: "",
		})
	);

	const form = useForm<ProductFilter>({
		defaultValues: initialFilter,
	});

	// Keep form values in sync when parent filter changes
	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: ProductFilter) => {
		onFilter({ ...data, offset: 0 });
	};

	const handleResetFilter = () => {
		form.reset(initialFilter);
		onReset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleUpdateFilter)}>
				<div className="flex h-[calc(100vh-130px)] w-full flex-col items-start justify-between gap-4 overflow-y-auto">
					<div className="w-full space-y-6">
						<RadioField<ProductFilter>
							label={t("products.filter.status", "Status")}
							name="is_active"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("products.common.status.active", "Active"),
								},
								{
									value: false,
									label: t("products.common.status.inactive", "Inactive"),
								},
							]}
						/>
						<RadioField<ProductFilter>
							label={t("products.filter.featured", "Featured")}
							name="is_featured"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("products.common.status.featured", "Featured"),
								},
								{
									value: false,
									label: t("products.common.status.notFeatured", "Not Featured"),
								},
							]}
						/>
						<RadioField<ProductFilter>
							label={t("products.filter.inStock", "In Stock")}
							name="is_in_stock"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("products.common.status.inStock", "In Stock"),
								},
								{
									value: false,
									label: t("products.common.status.outOfStock", "Out of Stock"),
								},
							]}
						/>
						<SelectField<ProductFilter>
							label={t("products.filter.category", "Category")}
							name="category"
							placeholder={t("products.filter.categoryPlaceholder", "Select a category")}
							options={
								categories?.results.map((category) => ({
									label: category.name,
									value: category.id,
								})) ?? []
							}
						/>
						<div className="grid grid-cols-2 gap-4">
							<TextField<ProductFilter>
								label={t("products.filter.minPrice", "Minimum Price")}
								name="min_price"
								type="number"
								placeholder={t(
									"products.filter.minPricePlaceholder",
									"Enter minimum price",
								)}
							/>
							<TextField<ProductFilter>
								label={t("products.filter.maxPrice", "Maximum Price")}
								name="max_price"
								type="number"
								placeholder={t(
									"products.filter.maxPricePlaceholder",
									"Enter maximum price",
								)}
							/>
						</div>
					</div>

					{/* action buttons */}
					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							{t("products.filter.reset", "Reset")}
						</Button>
						<Button type="submit">
							{t("products.filter.apply", "Apply Filters")}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
