import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptForm } from "./ReceiptForm";

interface ReceiptFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ReceiptFormModal({ open, onOpenChange }: ReceiptFormModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Record Goods Receipt</DialogTitle>
					<DialogDescription>
						Record stock received from a supplier. The variant's available stock and
						cost price will be updated automatically when you save.
					</DialogDescription>
				</DialogHeader>
				<ReceiptForm handleClose={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
