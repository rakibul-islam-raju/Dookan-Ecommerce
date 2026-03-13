import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
							label="Order Status"
							name="status"
							orientation="vertical"
							options={[
								{ value: "pending", label: "Pending" },
								{ value: "confirmed", label: "Confirmed" },
								{ value: "processing", label: "Processing" },
								{ value: "shipped", label: "Shipped" },
								{ value: "delivered", label: "Delivered" },
								{ value: "cancelled", label: "Cancelled" },
								{ value: "returned", label: "Returned" },
							]}
						/>
						<RadioField<OrderFilter>
							label="Payment Status"
							name="payment_status"
							orientation="vertical"
							options={[
								{ value: "pending", label: "Pending" },
								{ value: "paid", label: "Paid" },
								{ value: "failed", label: "Failed" },
								{ value: "refunded", label: "Refunded" },
							]}
						/>
					</div>

					{/* action buttons */}
					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							Reset
						</Button>
						<Button type="submit">Apply Filters</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
