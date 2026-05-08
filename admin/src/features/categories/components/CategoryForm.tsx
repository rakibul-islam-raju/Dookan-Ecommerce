import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	getCategories,
	useCreateCategory,
	useUpdateCategory,
	type CategoryListItem,
} from "@/lib/api/category";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { z } from "zod";
import slugify from "slugify";
import { useEffect, useState } from "react";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { X } from "lucide-react";

type TranslateFn = ReturnType<typeof useT>;

const createCategorySchema = (t: TranslateFn) =>
	z.object({
		name: z
			.string()
			.min(
				1,
				t("categories.form.validation.nameRequired", "Category name is required"),
			)
			.min(
				2,
				t(
					"categories.form.validation.nameMin",
					"Category name must be at least 2 characters",
				),
			)
			.max(
				100,
				t(
					"categories.form.validation.nameMax",
					"Category name must not exceed 100 characters",
				),
			),
		slug: z
			.string()
			.min(1, t("categories.form.validation.slugRequired", "Slug is required"))
			.min(
				2,
				t(
					"categories.form.validation.slugMin",
					"Slug must be at least 2 characters",
				),
			)
			.max(
				100,
				t(
					"categories.form.validation.slugMax",
					"Slug must not exceed 100 characters",
				),
			)
			.regex(
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
				t(
					"categories.form.validation.slugPattern",
					"Slug must be lowercase letters, numbers, and hyphens only",
				),
			),
		description: z
			.string()
			.max(
				500,
				t(
					"categories.form.validation.descriptionMax",
					"Description must not exceed 500 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		parent: z.string().nullable().optional(),
		display_order: z.coerce
			.number()
			.int(
				t(
					"categories.form.validation.orderInteger",
					"Order must be a whole number",
				),
			)
			.min(
				0,
				t("categories.form.validation.orderMin", "Order must be 0 or greater"),
			)
			.default(0),
		is_active: z.boolean().default(true),
	});

type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>;

interface CategoryFormProps {
	handleClose: () => void;
	category?: CategoryListItem | null;
	mode: "create" | "edit";
	intialOrder: number;
}

export const CategoryForm = ({
	handleClose,
	category,
	mode,
	intialOrder,
}: CategoryFormProps) => {
	const t = useT();
	const { mutate: createCategory, isPending: isCreating } = useCreateCategory();

	const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	// Fetch categories for parent selector
	const { data: categoriesData } = useQuery(
		getCategories({ limit: 100, offset: 0 }),
	);
	// Filter out the current category (can't be its own parent) and subcategories
	const parentOptions = (categoriesData?.results || []).filter(
		(c) => c.id !== category?.id && !c.parent,
	);

	const form = useZodForm(createCategorySchema(t), {
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			parent: null,
			display_order: intialOrder,
			is_active: true,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
		setImageFile(null);
		setImagePreview(null);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview(null);
	};

	const onSubmit = async (data: CategoryFormData) => {
		const submitData = {
			...data,
			parent: data.parent || null,
			...(imageFile && { image: imageFile }),
		};
		if (isEditMode && category) {
			updateCategory(
				{
					id: category.id,
					updateData: submitData,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success(
							t(
								"categories.form.toast.updateSuccess",
								"Category updated successfully",
							),
						);
					},
				},
			);
		} else {
			createCategory(
				submitData,
				{
					onSuccess: () => {
						handleCancel();
						toast.success(
							t(
								"categories.form.toast.createSuccess",
								"Category created successfully",
							),
						);
					},
				},
			);
		}
	};

	const nameValue = form.watch("name");

	useEffect(() => {
		form.setValue("slug", slugify(nameValue, { lower: true }));
	}, [nameValue]);

	useEffect(() => {
		if (category) {
			form.reset(category);
			if (category.image) {
				setImagePreview(category.image);
			}
		}
	}, [category]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label={t("categories.form.name", "Category Name")}
					placeholder={t(
						"categories.form.namePlaceholder",
						"e.g., Electronics, Clothing, Home & Garden",
					)}
					required
					description={t(
						"categories.form.nameHelp",
						"The display name of the category",
					)}
				/>
				<TextField
					name="slug"
					label={t("categories.form.slug", "Slug")}
					placeholder={t(
						"categories.form.slugPlaceholder",
						"e.g., electronics, clothing, home-garden",
					)}
					required
					description={t(
						"categories.form.slugHelp",
						"The URL-friendly version of the category name",
					)}
				/>
				<TextField
					name="description"
					label={t("categories.form.description", "Description")}
					placeholder={t(
						"categories.form.descriptionPlaceholder",
						"e.g., Electronics, Clothing, Home & Garden",
					)}
					description={t(
						"categories.form.descriptionHelp",
						"Short description about this category",
					)}
				/>

				<div className="space-y-2">
					<Label htmlFor="parent-category">
						{t("categories.form.parent", "Parent Category")}
					</Label>
					<select
						id="parent-category"
						value={form.watch("parent") || ""}
						onChange={(e) =>
							form.setValue("parent", e.target.value || null)
						}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">
							{t(
								"categories.form.parentPlaceholder",
								"None (Top-level category)",
							)}
						</option>
						{parentOptions.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
					<p className="text-sm text-muted-foreground">
						{t(
							"categories.form.parentHelp",
							"Select a parent to make this a subcategory",
						)}
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="category-image">
						{t("categories.form.image", "Category Image")}
					</Label>
					<Input
						id="category-image"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
					/>
					{imagePreview && (
						<div className="relative mt-2 inline-block">
							<img
								src={imagePreview}
								alt={t("categories.form.imagePreview", "Category preview")}
								className="max-h-32 rounded-md object-cover"
							/>
							<button
								type="button"
								onClick={handleRemoveImage}
								className="absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white hover:bg-destructive/90"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						</div>
					)}
					<p className="text-sm text-muted-foreground">
						{isEditMode
							? t(
									"categories.form.imageHelpEdit",
									"Leave empty to keep the current image",
								)
							: t(
									"categories.form.imageHelpCreate",
									"Optional image for the category",
								)}
					</p>
				</div>

				<TextField
					name="display_order"
					label={t("categories.form.displayOrder", "Order")}
					placeholder={t("categories.form.displayOrderPlaceholder", "e.g., 1")}
					description={t(
						"categories.form.displayOrderHelp",
						"The order of the category",
					)}
					type="number"
				/>
				<CheckboxField
					name="is_active"
					label={t("categories.form.isActive", "Is Active")}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? (
						<T id="categories.form.update" defaultMessage="Update Category" />
					) : (
						<T id="categories.form.create" defaultMessage="Create Category" />
					)}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
