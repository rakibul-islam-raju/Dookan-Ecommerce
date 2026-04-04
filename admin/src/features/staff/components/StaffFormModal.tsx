import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { StaffMember } from "@/@types/User.type";
import { StaffForm } from "./StaffForm";

interface StaffFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	staff?: StaffMember | null;
	mode: "create" | "edit";
}

export function StaffFormModal({
	open,
	onOpenChange,
	staff,
	mode,
}: StaffFormModalProps) {
	const isEditMode = mode === "edit";

	return (
		<Dialog open={open} onOpenChange={() => onOpenChange(false)}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Staff Member" : "Add Staff Member"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update staff member details and role."
							: "Create a new staff member and send them an email to set their password."}
					</DialogDescription>
				</DialogHeader>

				<div>
					<StaffForm
						handleClose={() => onOpenChange(false)}
						staff={staff}
						mode={mode}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
