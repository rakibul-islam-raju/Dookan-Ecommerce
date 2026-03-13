import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

type AppConfirmDialogProps = {
	title: string;
	description: string;
	confirmButtonText: string;
	cancelButtonText: string;
	confirmButtonVariant?: "default" | "destructive" | "outline";
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export const AppConfirmDialog: React.FC<AppConfirmDialogProps> = ({
	title,
	description,
	confirmButtonText,
	cancelButtonText,
	confirmButtonVariant,
	open,
	onConfirm,
	onCancel,
}) => {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-center text-xl font-normal">
						{title}
					</DialogTitle>
					<DialogDescription className="text-center text-lg">
						{description}
					</DialogDescription>
					{/* Buttons */}
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={onCancel}>
							{cancelButtonText}
						</Button>
						<Button
							variant={confirmButtonVariant || "default"}
							onClick={onConfirm}
						>
							{confirmButtonText}
						</Button>
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};
