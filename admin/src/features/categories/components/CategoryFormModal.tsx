import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
import { type CategoryListItem } from "@/lib/api/category";
import { CategoryForm } from "./CategoryForm";

interface CategoryFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: CategoryListItem | null;
	mode: "create" | "edit";
	intialOrder: number;
}

export function CategoryFormModal({
	open,
	onOpenChange,
	category,
	mode,
	intialOrder,
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
						{isEditMode ? (
							<T
								id="categories.modal.editTitle"
								defaultMessage="Edit Category"
							/>
						) : (
							<T
								id="categories.modal.createTitle"
								defaultMessage="Create New Category"
							/>
						)}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? (
								<T
									id="categories.modal.editDescription"
									defaultMessage="Update the category details below. Changes will be saved immediately."
								/>
							)
							: (
								<T
									id="categories.modal.createDescription"
									defaultMessage="Add a new category to organize your products. Fill in the details below."
								/>
							)}
					</DialogDescription>
				</DialogHeader>

				<div>
					<CategoryForm
						handleClose={handleClose}
						category={category}
						mode={mode}
						intialOrder={intialOrder}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
