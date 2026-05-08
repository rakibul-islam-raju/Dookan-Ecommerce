import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { type CouponFilter } from "@/lib/api/coupon";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type CouponFilterFormProps = {
	initialFilter: CouponFilter;
	onFilter: (filter: CouponFilter) => void;
	onReset: () => void;
};

export const CouponFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: CouponFilterFormProps) => {
	const t = useT();
	const form = useForm<CouponFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: CouponFilter) => {
		onFilter({ ...data, offset: 0 });
	};

	const handleResetFilter = () => {
		form.reset(initialFilter);
		onReset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleUpdateFilter)}>
				<div className="flex h-[calc(100vh-130px)] w-full flex-col items-start justify-between gap-4 overflow-y-auto">
					<div className="w-full space-y-6">
						<RadioField<CouponFilter>
							label={t("coupons.filter.status", "Status")}
							name="is_active"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("coupons.list.status.active", "Active"),
								},
								{
									value: false,
									label: t("coupons.list.status.inactive", "Inactive"),
								},
							]}
						/>
						<RadioField<CouponFilter>
							label={t("coupons.filter.discountType", "Discount Type")}
							name="discount_type"
							orientation="horizontal"
							options={[
								{
									value: "percentage",
									label: t("coupons.filter.type.percentage", "Percentage"),
								},
								{
									value: "fixed_amount",
									label: t("coupons.filter.type.fixedAmount", "Fixed Amount"),
								},
							]}
						/>
					</div>

					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							<T id="coupons.filter.reset" defaultMessage="Reset" />
						</Button>
						<Button type="submit">
							<T id="coupons.filter.apply" defaultMessage="Apply Filters" />
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
