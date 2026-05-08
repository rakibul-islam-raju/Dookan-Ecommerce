import { BaseForm } from "@/components/ui/@form/BaseForm";
import { CheckboxField } from "@/components/ui/@form/CheckboxField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextField } from "@/components/ui/@form/TextField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import {
	useCreateCoupon,
	useUpdateCoupon,
	type CouponListItem,
} from "@/lib/api/coupon";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

type TranslateFn = ReturnType<typeof useT>;

const createCouponSchema = (t: TranslateFn) =>
	z.object({
		code: z
			.string()
			.min(1, t("coupons.form.validation.codeRequired", "Coupon code is required"))
			.max(
				50,
				t("coupons.form.validation.codeMax", "Code must not exceed 50 characters"),
			)
			.transform((val) => val.toUpperCase()),
		description: z
			.string()
			.max(
				500,
				t(
					"coupons.form.validation.descriptionMax",
					"Description must not exceed 500 characters",
				),
			)
			.optional()
			.or(z.literal("")),
		discount_type: z.enum(["percentage", "fixed_amount"]),
		discount_value: z.coerce
			.number()
			.positive(
				t(
					"coupons.form.validation.discountPositive",
					"Discount value must be positive",
				),
			),
		min_order_amount: z.coerce
			.number()
			.min(
				0,
				t(
					"coupons.form.validation.nonNegative",
					"Value must be 0 or greater",
				),
			)
			.default(0),
		max_discount_amount: z.coerce
			.number()
			.positive(
				t("coupons.form.validation.positive", "Must be positive"),
			)
			.optional()
			.or(z.literal(0))
			.or(z.literal("").transform(() => undefined)),
		max_uses: z.coerce
			.number()
			.int()
			.positive(
				t("coupons.form.validation.positive", "Must be positive"),
			)
			.optional()
			.or(z.literal(0).transform(() => undefined))
			.or(z.literal("").transform(() => undefined)),
		max_uses_per_user: z.coerce
			.number()
			.int()
			.positive(
				t("coupons.form.validation.positive", "Must be positive"),
			)
			.optional()
			.or(z.literal(0).transform(() => undefined))
			.or(z.literal("").transform(() => undefined)),
		valid_from: z
			.string()
			.min(1, t("coupons.form.validation.validFrom", "Start date is required")),
		valid_until: z
			.string()
			.min(1, t("coupons.form.validation.validUntil", "End date is required")),
		is_active: z.boolean().default(true),
	});

type CouponFormData = z.infer<ReturnType<typeof createCouponSchema>>;

interface CouponFormProps {
	handleClose: () => void;
	coupon?: CouponListItem | null;
	mode: "create" | "edit";
}

export const CouponForm = ({ handleClose, coupon, mode }: CouponFormProps) => {
	const t = useT();
	const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
	const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

	const isEditMode = mode === "edit";
	const isPending = isCreating || isUpdating;

	const form = useZodForm(createCouponSchema(t), {
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

	const discountTypeOptions = [
		{
			value: "percentage",
			label: t("coupons.form.discountType.percentage", "Percentage (%)"),
		},
		{
			value: "fixed_amount",
			label: t("coupons.form.discountType.fixedAmount", "Fixed Amount (৳)"),
		},
	];

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
						toast.success(
							t("coupons.form.toast.updateSuccess", "Coupon updated successfully"),
						);
					},
				}
			);
		} else {
			createCoupon(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success(
						t("coupons.form.toast.createSuccess", "Coupon created successfully"),
					);
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
						label={t("coupons.form.code", "Coupon Code")}
						placeholder={t("coupons.form.codePlaceholder", "e.g., SAVE20")}
						required
						description={t(
							"coupons.form.codeHelp",
							"Unique code customers will enter",
						)}
					/>
					<SelectField
						name="discount_type"
						label={t("coupons.form.discountType", "Discount Type")}
						options={discountTypeOptions}
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="discount_value"
						label={t("coupons.form.discountValue", "Discount Value")}
						placeholder={t(
							"coupons.form.discountValuePlaceholder",
							"e.g., 20",
						)}
						type="number"
						required
						description={
							form.watch("discount_type") === "percentage"
								? t(
										"coupons.form.discountValueHelpPercentage",
										"Percentage off (0-100)",
									)
								: t(
										"coupons.form.discountValueHelpFixed",
										"Fixed amount in ৳",
									)
						}
					/>
					<TextField
						name="min_order_amount"
						label={t("coupons.form.minOrderAmount", "Min Order Amount")}
						placeholder={t(
							"coupons.form.minOrderAmountPlaceholder",
							"e.g., 500",
						)}
						type="number"
						description={t(
							"coupons.form.minOrderAmountHelp",
							"Minimum subtotal to use coupon",
						)}
					/>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<TextField
						name="max_discount_amount"
						label={t("coupons.form.maxDiscount", "Max Discount")}
						placeholder={t(
							"coupons.form.maxDiscountPlaceholder",
							"e.g., 200",
						)}
						type="number"
						description={t(
							"coupons.form.maxDiscountHelp",
							"Cap on discount (for %)",
						)}
					/>
					<TextField
						name="max_uses"
						label={t("coupons.form.totalUses", "Total Uses")}
						placeholder={t("coupons.form.unlimited", "Unlimited")}
						type="number"
						description={t("coupons.form.totalUsesHelp", "Max total uses")}
					/>
					<TextField
						name="max_uses_per_user"
						label={t("coupons.form.perUser", "Per User")}
						placeholder={t("coupons.form.unlimited", "Unlimited")}
						type="number"
						description={t("coupons.form.perUserHelp", "Max uses per user")}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="valid_from"
						label={t("coupons.form.validFrom", "Valid From")}
						type="datetime-local"
						required
					/>
					<TextField
						name="valid_until"
						label={t("coupons.form.validUntil", "Valid Until")}
						type="datetime-local"
						required
					/>
				</div>

				<TextareaField
					name="description"
					label={t("coupons.form.description", "Description")}
					placeholder={t(
						"coupons.form.descriptionPlaceholder",
						"e.g., 20% off on all orders above ৳500",
					)}
				/>

				<CheckboxField
					name="is_active"
					label={t("coupons.form.active", "Active")}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					<T id="common.cancel" defaultMessage="Cancel" />
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? (
						<T id="coupons.form.update" defaultMessage="Update Coupon" />
					) : (
						<T id="coupons.form.create" defaultMessage="Create Coupon" />
					)}
				</LoadingButton>
			</div>
		</BaseForm>
	);
};
