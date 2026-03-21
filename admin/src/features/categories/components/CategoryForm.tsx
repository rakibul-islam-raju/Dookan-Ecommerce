import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/LoadingButton";
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

// Zod schema for category form
const categorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.min(2, "Category name must be at least 2 characters")
		.max(100, "Category name must not exceed 100 characters"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.min(2, "Slug must be at least 2 characters")
		.max(100, "Slug must not exceed 100 characters")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug must be lowercase letters, numbers, and hyphens only",
		),
	description: z
		.string()
		.max(500, "Description must not exceed 500 characters")
		.optional()
		.or(z.literal("")),
	parent: z.string().nullable().optional(),
	display_order: z.coerce
		.number()
		.int("Order must be a whole number")
		.min(0, "Order must be 0 or greater")
		.default(0),
	is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

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

	const form = useZodForm(categorySchema, {
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
						toast.success("Category updated successfully");
					},
				},
			);
		} else {
			createCategory(
				submitData,
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Category created successfully");
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
					label="Category Name"
					placeholder="e.g., Electronics, Clothing, Home & Garden"
					required
					description="The display name of the category"
				/>
				<TextField
					name="slug"
					label="Slug"
					placeholder="e.g., electronics, clothing, home-garden"
					required
					description="The URL-friendly version of the category name"
				/>
				<TextField
					name="description"
					label="Description"
					placeholder="e.g., Electronics, Clothing, Home & Garden"
					description="The display name of the category"
				/>

				<div className="space-y-2">
					<Label htmlFor="parent-category">Parent Category</Label>
					<select
						id="parent-category"
						value={form.watch("parent") || ""}
						onChange={(e) =>
							form.setValue("parent", e.target.value || null)
						}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">None (Top-level category)</option>
						{parentOptions.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
					<p className="text-sm text-muted-foreground">
						Select a parent to make this a subcategory
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="category-image">Category Image</Label>
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
								alt="Category preview"
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
							? "Leave empty to keep the current image"
							: "Optional image for the category"}
					</p>
				</div>

				<TextField
					name="display_order"
					label="Order"
					placeholder="e.g., 1"
					description="The order of the category"
					type="number"
				/>
				<CheckboxField name="is_active" label="Is Active" />
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Category" : "Create Category"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
