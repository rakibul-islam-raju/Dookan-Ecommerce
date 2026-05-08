import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
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
							{isEditMode ? (
								<T
									id="store.announcements.modal.editTitle"
									defaultMessage="Edit Announcement"
								/>
							) : (
								<T
									id="store.announcements.modal.createTitle"
									defaultMessage="Create New Announcement"
								/>
							)}
						</DialogTitle>
						<DialogDescription>
							{isEditMode ? (
								<T
									id="store.announcements.modal.editDescription"
									defaultMessage="Update the announcement details below. Changes will be saved immediately."
								/>
							) : (
								<T
									id="store.announcements.modal.createDescription"
									defaultMessage="Add a new announcement to display on your store. Fill in the details below."
								/>
							)}
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
