import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { type CategoryFilter } from "@/lib/api/category";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type CategoryFilterFormProps = {
	initialFilter: CategoryFilter;
	onFilter: (filter: CategoryFilter) => void;
	onReset: () => void;
};

export const CategoryFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: CategoryFilterFormProps) => {
	const t = useT();
	const form = useForm<CategoryFilter>({
		defaultValues: initialFilter,
	});

	// Keep form values in sync when parent filter changes
	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: CategoryFilter) => {
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
						<RadioField<CategoryFilter>
							label={t("categories.filter.status", "Status")}
							name="is_active"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("categories.list.status.active", "Active"),
								},
								{
									value: false,
									label: t("categories.list.status.inactive", "Inactive"),
								},
							]}
						/>
					</div>

					{/* action buttons */}
					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							<T id="categories.filter.reset" defaultMessage="Reset" />
						</Button>
						<Button type="submit">
							<T
								id="categories.filter.apply"
								defaultMessage="Apply Filters"
							/>
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
