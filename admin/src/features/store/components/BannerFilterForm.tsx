import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { type BannerFilter } from "@/lib/api/store";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type BannerFilterFormProps = {
	initialFilter: BannerFilter;
	onFilter: (filter: BannerFilter) => void;
	onReset: () => void;
};

export const BannerFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: BannerFilterFormProps) => {
	const form = useForm<BannerFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: BannerFilter) => {
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
						<RadioField<BannerFilter>
							label="Status"
							name="is_active"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: "Active",
								},
								{
									value: false,
									label: "Inactive",
								},
							]}
						/>
					</div>

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
