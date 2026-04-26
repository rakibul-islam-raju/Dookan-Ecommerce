import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateExpenseCategory,
	useUpdateExpenseCategory,
	type IExpenseCategory,
} from "@/lib/api/expenses";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, "Name is required").max(120, "Name must not exceed 120 characters"),
	description: z.string().max(500, "Description must not exceed 500 characters").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface ExpenseCategoryFormProps {
	handleClose: () => void;
	category?: IExpenseCategory | null;
	mode: "create" | "edit";
}

export function ExpenseCategoryForm({ handleClose, category, mode }: ExpenseCategoryFormProps) {
	const isEditMode = mode === "edit";
	const { mutate: createCategory, isPending: isCreating } = useCreateExpenseCategory();
	const { mutate: updateCategory, isPending: isUpdating } = useUpdateExpenseCategory();
	const isPending = isCreating || isUpdating;

	const form = useZodForm(schema, {
		defaultValues: { name: "", description: "" },
	});

	useEffect(() => {
		if (category) {
			form.reset({ name: category.name, description: category.description || "" });
		} else {
			form.reset({ name: "", description: "" });
		}
	}, [category]);

	const handleCancel = () => {
		form.reset();
		handleClose();
	};

	const onSubmit = (data: FormData) => {
		if (isEditMode && category) {
			updateCategory(
				{ id: category.id, data },
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Category updated successfully");
					},
					onError: () => toast.error("Failed to update category"),
				},
			);
		} else {
			createCategory(data, {
				onSuccess: () => {
					handleCancel();
					toast.success("Category created successfully");
				},
				onError: () => toast.error("Failed to create category"),
			});
		}
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<TextField
					name="name"
					label="Category Name"
					placeholder="e.g., Equipment Maintenance"
					required
					helpText="A short, descriptive name for this expense category."
				/>
				<TextareaField
					name="description"
					label="Description"
					placeholder="e.g., Costs related to equipment repair and upkeep"
					rows={3}
					helpText="Optional — describe what kinds of expenses belong in this category."
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Category" : "Create Category"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
