import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
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
						{isEditMode
							? <T id="roles.modal.editTitle" defaultMessage="Edit Role" />
							: <T id="roles.modal.createTitle" defaultMessage="Create New Role" />}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? <T id="roles.modal.editDescription" defaultMessage="Update role details and permissions." />
							: (
								<T
									id="roles.modal.createDescription"
									defaultMessage="Create a new role with specific permissions."
								/>
							)}
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
