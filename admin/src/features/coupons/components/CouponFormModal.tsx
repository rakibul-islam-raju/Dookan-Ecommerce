import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/i18n/translate";
import { type CouponListItem } from "@/lib/api/coupon";
import { CouponForm } from "./CouponForm";

interface CouponFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coupon?: CouponListItem | null;
	mode: "create" | "edit";
}

export function CouponFormModal({
	open,
	onOpenChange,
	coupon,
	mode,
}: CouponFormModalProps) {
	const isEditMode = mode === "edit";

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? (
							<T id="coupons.modal.editTitle" defaultMessage="Edit Coupon" />
						) : (
							<T
								id="coupons.modal.createTitle"
								defaultMessage="Create New Coupon"
							/>
						)}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? (
								<T
									id="coupons.modal.editDescription"
									defaultMessage="Update the coupon details below."
								/>
							)
							: (
								<T
									id="coupons.modal.createDescription"
									defaultMessage="Create a new discount coupon for your customers."
								/>
							)}
					</DialogDescription>
				</DialogHeader>

				<div>
					<CouponForm
						handleClose={handleClose}
						coupon={coupon}
						mode={mode}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
