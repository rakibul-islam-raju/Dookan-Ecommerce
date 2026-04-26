import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IMaterial } from "@/lib/api/inventory";
import { MaterialForm } from "./MaterialForm";

interface MaterialFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	material?: IMaterial | null;
	mode: "create" | "edit";
}

export function MaterialFormModal({ open, onOpenChange, material, mode }: MaterialFormModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Edit Material" : "Add Raw Material"}
					</DialogTitle>
					<DialogDescription>
						{mode === "edit"
							? "Update the material details. Stock quantity and cost are managed through transactions."
							: "Add a new raw material to track in your production process."}
					</DialogDescription>
				</DialogHeader>
				<MaterialForm
					handleClose={() => onOpenChange(false)}
					material={material}
					mode={mode}
				/>
			</DialogContent>
		</Dialog>
	);
}
