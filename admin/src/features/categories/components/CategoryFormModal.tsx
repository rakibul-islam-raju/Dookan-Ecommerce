import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type CategoryListItem } from "@/lib/api/category";
import { CategoryForm } from "./CategoryForm";

interface CategoryFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: CategoryListItem | null;
	mode: "create" | "edit";
}

export function CategoryFormModal({
	open,
	onOpenChange,
	category,
	mode,
}: CategoryFormModalProps) {
	const isEditMode = mode === "edit";

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Category" : "Create New Category"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the category details below. Changes will be saved immediately."
							: "Add a new category to organize your products. Fill in the details below."}
					</DialogDescription>
				</DialogHeader>

				<div>
					<CategoryForm
						handleClose={handleClose}
						category={category}
						mode={mode}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
