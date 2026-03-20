import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateCategory,
	useUpdateCategory,
	type CategoryListItem,
} from "@/lib/api/category";
import { toast } from "react-toastify";
import { z } from "zod";
import slugify from "slugify";
import { useEffect } from "react";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";

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

	const form = useZodForm(categorySchema, {
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			display_order: intialOrder,
			is_active: true,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: CategoryFormData) => {
		console.log(data);

		if (isEditMode && category) {
			updateCategory(
				{
					id: category.id,
					updateData: data,
				},
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Category updated successfully");
					},
				},
			);
		} else {
			createCategory(data, {
				onSuccess: () => {
					handleCancel();
					toast.success("Category created successfully");
				},
			});
		}
	};

	const nameValue = form.watch("name");

	useEffect(() => {
		form.setValue("slug", slugify(nameValue, { lower: true }));
	}, [nameValue]);

	useEffect(() => {
		if (category) {
			form.reset(category);
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
