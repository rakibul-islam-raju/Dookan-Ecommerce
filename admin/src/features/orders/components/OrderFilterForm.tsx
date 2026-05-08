import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useT } from "@/i18n/use-t";
import type { OrderFilter } from "@/lib/api/orders";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type OrderFilterFormProps = {
	initialFilter: OrderFilter;
	onFilter: (filter: OrderFilter) => void;
	onReset: () => void;
};

export const OrderFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: OrderFilterFormProps) => {
	const t = useT();
	const form = useForm<OrderFilter>({
		defaultValues: initialFilter,
	});

	// Keep form values in sync when parent filter changes
	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: OrderFilter) => {
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
						<RadioField<OrderFilter>
							label={t("orders.filter.status", "Order Status")}
							name="status"
							orientation="vertical"
							options={[
								{
									value: "pending",
									label: t("orders.common.status.pending", "Pending"),
								},
								{
									value: "confirmed",
									label: t("orders.common.status.confirmed", "Confirmed"),
								},
								{
									value: "processing",
									label: t("orders.common.status.processing", "Processing"),
								},
								{
									value: "shipped",
									label: t("orders.common.status.shipped", "Shipped"),
								},
								{
									value: "delivered",
									label: t("orders.common.status.delivered", "Delivered"),
								},
								{
									value: "cancelled",
									label: t("orders.common.status.cancelled", "Cancelled"),
								},
								{
									value: "returned",
									label: t("orders.common.status.returned", "Returned"),
								},
							]}
						/>
						<RadioField<OrderFilter>
							label={t("orders.filter.paymentStatus", "Payment Status")}
							name="payment_status"
							orientation="vertical"
							options={[
								{
									value: "pending",
									label: t("orders.common.payment.pending", "Pending"),
								},
								{
									value: "paid",
									label: t("orders.common.payment.paid", "Paid"),
								},
								{
									value: "failed",
									label: t("orders.common.payment.failed", "Failed"),
								},
								{
									value: "refunded",
									label: t("orders.common.payment.refunded", "Refunded"),
								},
							]}
						/>
					</div>

					{/* action buttons */}
					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							{t("orders.filter.reset", "Reset")}
						</Button>
						<Button type="submit">
							{t("orders.filter.apply", "Apply Filters")}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
