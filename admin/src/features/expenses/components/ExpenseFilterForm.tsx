import { DateField } from "@/components/ui/@form/DateField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { Button } from "@/components/ui/button";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { getExpenseCategories, type IExpenseCategory } from "@/lib/api/expenses";
import { useQuery } from "@tanstack/react-query";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { z } from "zod";
import type { IExpenseFilter } from "@/@types/Expense";

const schema = z.object({
	category: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
});

type FilterFormData = z.infer<typeof schema>;

interface ExpenseFilterFormProps {
	initialFilter: IExpenseFilter;
	onFilter: (filter: IExpenseFilter) => void;
	onReset: () => void;
}

export function ExpenseFilterForm({ initialFilter, onFilter, onReset }: ExpenseFilterFormProps) {
	const t = useT();
	const { data: categoriesData } = useQuery(getExpenseCategories());

	const categoryOptions = [
		{ value: "", label: t("expenses.filter.allCategories", "All categories") },
		...(categoriesData?.results || []).map((c: IExpenseCategory) => ({
			value: c.id,
			label: c.name,
		})),
	];

	const form = useZodForm(schema, {
		defaultValues: {
			category: initialFilter.category || "",
			start_date: initialFilter.start_date || "",
			end_date: initialFilter.end_date || "",
		},
	});

	const onSubmit = (data: FilterFormData) => {
		onFilter({
			category: data.category || undefined,
			start_date: data.start_date || undefined,
			end_date: data.end_date || undefined,
		});
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="space-y-4">
				<SelectField
					name="category"
					label={t("expenses.list.table.category", "Category")}
					placeholder={t("expenses.filter.allCategories", "All categories")}
					options={categoryOptions}
				/>
				<DateField
					name="start_date"
					label={t("expenses.filter.dateFrom", "Date From")}
					placeholder={t("expenses.reports.startDate", "Start date")}
				/>
				<DateField
					name="end_date"
					label={t("expenses.filter.dateTo", "Date To")}
					placeholder={t("expenses.reports.endDate", "End date")}
				/>
			</div>

			<div className="flex justify-between mt-6">
				<Button type="button" variant="outline" onClick={onReset}>
					<T id="expenses.filter.reset" defaultMessage="Reset" />
				</Button>
				<Button type="submit">
					<T id="expenses.filter.apply" defaultMessage="Apply Filters" />
				</Button>
			</div>
		</BaseForm>
	);
}
