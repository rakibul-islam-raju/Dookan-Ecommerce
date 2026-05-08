import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
import { type BannerListItem } from "@/lib/api/store";
import { BannerForm } from "./BannerForm";

interface BannerFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	banner?: BannerListItem | null;
	mode: "create" | "edit";
}

export function BannerFormModal({
	open,
	onOpenChange,
	banner,
	mode,
}: BannerFormModalProps) {
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
								<T id="store.banners.modal.editTitle" defaultMessage="Edit Banner" />
							) : (
								<T
									id="store.banners.modal.createTitle"
									defaultMessage="Create New Banner"
								/>
							)}
						</DialogTitle>
						<DialogDescription>
							{isEditMode ? (
								<T
									id="store.banners.modal.editDescription"
									defaultMessage="Update the banner details below. Changes will be saved immediately."
								/>
							) : (
								<T
									id="store.banners.modal.createDescription"
									defaultMessage="Add a new banner to showcase offers or campaigns. Fill in the details below."
								/>
							)}
						</DialogDescription>
					</DialogHeader>

				<div>
					<BannerForm handleClose={handleClose} banner={banner} mode={mode} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
