import { RadioField } from "@/components/ui/@form/RadioField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useT } from "@/i18n/use-t";
import type { ReviewFilter } from "@/lib/api/review";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type ReviewFilterFormProps = {
	initialFilter: ReviewFilter;
	onFilter: (filter: ReviewFilter) => void;
	onReset: () => void;
};

export const ReviewFilterForm = ({
	initialFilter,
	onFilter,
	onReset,
}: ReviewFilterFormProps) => {
	const t = useT();
	const form = useForm<ReviewFilter>({
		defaultValues: initialFilter,
	});

	useEffect(() => {
		form.reset(initialFilter);
	}, [initialFilter, form]);

	const handleUpdateFilter = (data: ReviewFilter) => {
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
						<RadioField<ReviewFilter>
							label={t("reviews.filter.approvalStatus", "Approval Status")}
							name="is_approved"
							orientation="vertical"
							options={[
								{
									value: "true",
									label: t("reviews.list.status.approved", "Approved"),
								},
								{
									value: "false",
									label: t("reviews.list.status.pending", "Pending"),
								},
							]}
						/>
						<RadioField<ReviewFilter>
							label={t("reviews.filter.rating", "Rating")}
							name="rating"
							orientation="vertical"
							options={[
								{ value: "5", label: t("reviews.filter.stars5", "5 Stars") },
								{ value: "4", label: t("reviews.filter.stars4", "4 Stars") },
								{ value: "3", label: t("reviews.filter.stars3", "3 Stars") },
								{ value: "2", label: t("reviews.filter.stars2", "2 Stars") },
								{ value: "1", label: t("reviews.filter.stars1", "1 Star") },
							]}
						/>
					</div>

					<div className="sticky bottom-0 left-0 right-0 flex w-full items-center justify-end gap-4 bg-background">
						<Button
							type="button"
							onClick={handleResetFilter}
							variant="outline"
						>
							{t("reviews.filter.reset", "Reset")}
						</Button>
						<Button type="submit">
							{t("reviews.filter.apply", "Apply Filters")}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
