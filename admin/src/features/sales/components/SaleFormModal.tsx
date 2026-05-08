import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
import type { SaleListItem } from "@/lib/api/sale";
import { SaleForm } from "./SaleForm";

interface SaleFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sale?: SaleListItem | null;
	mode: "create" | "edit";
}

export function SaleFormModal({
	open,
	onOpenChange,
	sale,
	mode,
}: SaleFormModalProps) {
	const isEditMode = mode === "edit";

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? (
							<T id="sales.modal.editTitle" defaultMessage="Edit Sale" />
						) : (
							<T
								id="sales.modal.createTitle"
								defaultMessage="Create New Sale"
							/>
						)}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? (
								<T
									id="sales.modal.editDescription"
									defaultMessage="Update the sale details below."
								/>
							) : (
								<T
									id="sales.modal.createDescription"
									defaultMessage="Create a new sale or promotion for your store."
								/>
							)}
					</DialogDescription>
				</DialogHeader>
				<SaleForm handleClose={handleClose} sale={sale} mode={mode} />
			</DialogContent>
		</Dialog>
	);
}
