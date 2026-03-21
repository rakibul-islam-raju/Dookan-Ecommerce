import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Role } from "@/@types/User.type";
import { RoleForm } from "./RoleForm";

interface RoleFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	role?: Role | null;
	mode: "create" | "edit";
}

export function RoleFormModal({
	open,
	onOpenChange,
	role,
	mode,
}: RoleFormModalProps) {
	const isEditMode = mode === "edit";

	return (
		<Dialog open={open} onOpenChange={() => onOpenChange(false)}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Role" : "Create New Role"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update role details and permissions."
							: "Create a new role with specific permissions."}
					</DialogDescription>
				</DialogHeader>

				<div>
					<RoleForm
						handleClose={() => onOpenChange(false)}
						role={role}
						mode={mode}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
