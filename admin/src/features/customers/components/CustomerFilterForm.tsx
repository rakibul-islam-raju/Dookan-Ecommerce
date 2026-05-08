import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import type { CustomerFilter } from "@/lib/api/customer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type CustomerFilterFormProps = {
	initialFilter: CustomerFilter;
	onFilter: (filter: CustomerFilter) => void;
	onReset: () => void;
};

export const CustomerFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: CustomerFilterFormProps) => {
	const t = useT();
	const form = useForm<CustomerFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: CustomerFilter) => {
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
						<RadioField<CustomerFilter>
							label={t("customers.filter.accountStatus", "Account Status")}
							name="is_active"
							orientation="vertical"
							options={[
								{
									value: "true",
									label: t("customers.list.status.active", "Active"),
								},
								{
									value: "false",
									label: t("customers.list.status.inactive", "Inactive"),
								},
							]}
						/>
						<RadioField<CustomerFilter>
							label={t("customers.filter.mobileVerified", "Mobile Verified")}
							name="is_mobile_verified"
							orientation="vertical"
							options={[
								{
									value: "true",
									label: t("customers.list.verified", "Verified"),
								},
								{
									value: "false",
									label: t("customers.filter.notVerified", "Not Verified"),
								},
							]}
						/>
					</div>

					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button
							type="button"
							onClick={handleResetFilter}
							variant="outline"
						>
							<T id="customers.filter.reset" defaultMessage="Reset" />
						</Button>
						<Button type="submit">
							<T
								id="customers.filter.apply"
								defaultMessage="Apply Filters"
							/>
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
