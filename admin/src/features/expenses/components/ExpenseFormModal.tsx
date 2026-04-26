import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IExpense } from "@/lib/api/expenses";
import { ExpenseForm } from "./ExpenseForm";

interface ExpenseFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	expense?: IExpense | null;
	mode: "create" | "edit";
}

export function ExpenseFormModal({ open, onOpenChange, expense, mode }: ExpenseFormModalProps) {
	const isEditMode = mode === "edit";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Edit Expense" : "Record Expense"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the details of this expense entry."
							: "Record a new business expense. You can optionally link it to a production batch for accurate costing."}
					</DialogDescription>
				</DialogHeader>
				<ExpenseForm
					handleClose={() => onOpenChange(false)}
					expense={expense}
					mode={mode}
				/>
			</DialogContent>
		</Dialog>
	);
}
