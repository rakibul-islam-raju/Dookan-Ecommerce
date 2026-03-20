import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateCoupon,
	useUpdateCoupon,
	type CouponListItem,
} from "@/lib/api/coupon";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const couponSchema = z.object({
	code: z
		.string()
		.min(1, "Coupon code is required")
		.max(50, "Code must not exceed 50 characters")
		.transform((val) => val.toUpperCase()),
	description: z.string().max(500).optional().or(z.literal("")),
	discount_type: z.enum(["percentage", "fixed_amount"]),
	discount_value: z.coerce
		.number()
		.positive("Discount value must be positive"),
	min_order_amount: z.coerce.number().min(0).default(0),
	max_discount_amount: z.coerce
		.number()
		.positive("Must be positive")
		.optional()
		.or(z.literal(0))
		.or(z.literal("").transform(() => undefined)),
	max_uses: z.coerce
		.number()
		.int()
		.positive("Must be positive")
		.optional()
		.or(z.literal(0).transform(() => undefined))
		.or(z.literal("").transform(() => undefined)),
	max_uses_per_user: z.coerce
		.number()
		.int()
		.positive("Must be positive")
		.optional()
		.or(z.literal(0).transform(() => undefined))
		.or(z.literal("").transform(() => undefined)),
	valid_from: z.string().min(1, "Start date is required"),
	valid_until: z.string().min(1, "End date is required"),
	is_active: z.boolean().default(true),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
	handleClose: () => void;
	coupon?: CouponListItem | null;
	mode: "create" | "edit";
}

const DISCOUNT_TYPE_OPTIONS = [
	{ value: "percentage", label: "Percentage (%)" },
	{ value: "fixed_amount", label: "Fixed Amount (৳)" },
];

export const CouponForm = ({ handleClose, coupon, mode }: CouponFormProps) => {
	const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
	const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(couponSchema, {
		defaultValues: {
			code: "",
			description: "",
			discount_type: "percentage",
			discount_value: 0,
			min_order_amount: 0,
			max_discount_amount: undefined,
			max_uses: undefined,
			max_uses_per_user: undefined,
			valid_from: "",
			valid_until: "",
			is_active: true,
		},
	});

	const handleCancel = () => {
		handleClose();
		form.reset();
	};

	const onSubmit = async (data: CouponFormData) => {
		const payload = {
			...data,
			max_discount_amount: data.max_discount_amount || null,
			max_uses: data.max_uses || null,
			max_uses_per_user: data.max_uses_per_user || null,
		};

		if (isEditMode && coupon) {
			updateCoupon(
				{ id: coupon.id, updateData: payload },
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Coupon updated successfully");
					},
				}
			);
		} else {
			createCoupon(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success("Coupon created successfully");
				},
			});
		}
	};

	useEffect(() => {
		if (coupon && isEditMode) {
			const formatDate = (dateStr: string) => {
				const d = new Date(dateStr);
				return d.toISOString().slice(0, 16);
			};
			form.reset({
				code: coupon.code,
				description: coupon.description || "",
				discount_type: coupon.discount_type,
				discount_value: parseFloat(coupon.discount_value),
				min_order_amount: parseFloat(coupon.min_order_amount),
				max_discount_amount: coupon.max_discount_amount
					? parseFloat(coupon.max_discount_amount)
					: undefined,
				max_uses: coupon.max_uses ?? undefined,
				max_uses_per_user: coupon.max_uses_per_user ?? undefined,
				valid_from: formatDate(coupon.valid_from),
				valid_until: formatDate(coupon.valid_until),
				is_active: coupon.is_active,
			});
		}
	}, [coupon, isEditMode]);

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="code"
						label="Coupon Code"
						placeholder="e.g., SAVE20"
						required
						description="Unique code customers will enter"
					/>
					<SelectField
						name="discount_type"
						label="Discount Type"
						options={DISCOUNT_TYPE_OPTIONS}
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="discount_value"
						label="Discount Value"
						placeholder="e.g., 20"
						type="number"
						required
						description={
							form.watch("discount_type") === "percentage"
								? "Percentage off (0-100)"
								: "Fixed amount in ৳"
						}
					/>
					<TextField
						name="min_order_amount"
						label="Min Order Amount"
						placeholder="e.g., 500"
						type="number"
						description="Minimum subtotal to use coupon"
					/>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<TextField
						name="max_discount_amount"
						label="Max Discount"
						placeholder="e.g., 200"
						type="number"
						description="Cap on discount (for %)"
					/>
					<TextField
						name="max_uses"
						label="Total Uses"
						placeholder="Unlimited"
						type="number"
						description="Max total uses"
					/>
					<TextField
						name="max_uses_per_user"
						label="Per User"
						placeholder="Unlimited"
						type="number"
						description="Max uses per user"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="valid_from"
						label="Valid From"
						type="datetime-local"
						required
					/>
					<TextField
						name="valid_until"
						label="Valid Until"
						type="datetime-local"
						required
					/>
				</div>

				<TextareaField
					name="description"
					label="Description"
					placeholder="e.g., 20% off on all orders above ৳500"
				/>

				<CheckboxField name="is_active" label="Active" />
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Coupon" : "Create Coupon"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
