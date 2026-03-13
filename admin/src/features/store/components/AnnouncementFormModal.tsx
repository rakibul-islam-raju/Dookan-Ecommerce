import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type AnnouncementListItem } from "@/lib/api/store";
import { AnnouncementForm } from "./AnnouncementForm";

interface AnnouncementFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	announcement?: AnnouncementListItem | null;
	mode: "create" | "edit";
}

export function AnnouncementFormModal({
	open,
	onOpenChange,
	announcement,
	mode,
}: AnnouncementFormModalProps) {
	const isEditMode = mode === "edit";

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Announcement" : "Create New Announcement"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the announcement details below. Changes will be saved immediately."
							: "Add a new announcement to display on your store. Fill in the details below."}
					</DialogDescription>
				</DialogHeader>

				<div>
					<AnnouncementForm
						handleClose={handleClose}
						announcement={announcement}
						mode={mode}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
