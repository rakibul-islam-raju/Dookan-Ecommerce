import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IExpenseCategory } from "@/lib/api/expenses";
import { ExpenseCategoryForm } from "./ExpenseCategoryForm";

interface ExpenseCategoryFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: IExpenseCategory | null;
	mode: "create" | "edit";
}

export function ExpenseCategoryFormModal({
	open,
	onOpenChange,
	category,
	mode,
}: ExpenseCategoryFormModalProps) {
	const isEditMode = mode === "edit";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Category" : "New Expense Category"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the category name or description."
							: "Add a custom category to organise your expense entries."}
					</DialogDescription>
				</DialogHeader>
				<ExpenseCategoryForm
					handleClose={() => onOpenChange(false)}
					category={category}
					mode={mode}
				/>
			</DialogContent>
		</Dialog>
	);
}
