import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useT } from "@/i18n/use-t";
import { type AnnouncementFilter } from "@/lib/api/store";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type AnnouncementFilterFormProps = {
	initialFilter: AnnouncementFilter;
	onFilter: (filter: AnnouncementFilter) => void;
	onReset: () => void;
};

export const AnnouncementFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: AnnouncementFilterFormProps) => {
	const t = useT();
	const form = useForm<AnnouncementFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: AnnouncementFilter) => {
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
						<RadioField<AnnouncementFilter>
							label={t("store.common.status.label", "Status")}
							name="is_active"
							orientation="horizontal"
							options={[
								{
									value: true,
									label: t("store.common.status.active", "Active"),
								},
								{
									value: false,
									label: t("store.common.status.inactive", "Inactive"),
								},
							]}
						/>
					</div>

					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button type="button" onClick={handleResetFilter} variant="outline">
							{t("store.common.filter.reset", "Reset")}
						</Button>
						<Button type="submit">
							{t("store.common.filter.apply", "Apply Filters")}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
