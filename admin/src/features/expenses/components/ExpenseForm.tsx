import { BaseForm } from "@/components/ui/@form/BaseForm";
import { DateField } from "@/components/ui/@form/DateField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Separator } from "@/components/ui/separator";
import { useZodForm } from "@/hooks/useZodForm";
import { useAuthStore } from "@/store/useAuthStore";
import {
	expenseCategoryApi,
	expenseApi,
	useCreateExpense,
	useUpdateExpense,
	type IExpense,
	type IExpenseCategory,
} from "@/lib/api/expenses";
import { getExpenseCategories } from "@/lib/api/expenses";
import { getBatches } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { z } from "zod";
import { format } from "date-fns";

const schema = z.object({
	category: z.string().min(1, "Category is required"),
	amount: z.coerce.number().positive("Amount must be greater than 0"),
	incurred_on: z.string().min(1, "Date is required"),
	reference: z.string().max(100).optional().or(z.literal("")),
	notes: z.string().optional().or(z.literal("")),
	production_batch: z.string().nullable().optional(),
	product_variant: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormProps {
	handleClose: () => void;
	expense?: IExpense | null;
	mode: "create" | "edit";
}

export function ExpenseForm({ handleClose, expense, mode }: ExpenseFormProps) {
	const isEditMode = mode === "edit";
	const { vendorContext } = useAuthStore();
	const isManufacturing = vendorContext?.inventory_mode === "manufacturing";

	const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
	const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
	const isPending = isCreating || isUpdating;

	const { data: categoriesData } = useQuery(getExpenseCategories());
	const { data: batchesData } = useQuery({
		...getBatches({ limit: 200, offset: 0 }),
		enabled: isManufacturing,
	});

	const categoryOptions = (categoriesData?.results || []).map((c: IExpenseCategory) => ({
		value: c.id,
		label: c.name,
	}));

	const batchOptions = (batchesData?.results || [])
		.filter((b) => b.status !== "cancelled")
		.map((b) => ({
			value: b.id,
			label: `${b.code} — ${b.status.replace("_", " ")}`,
		}));

	const form = useZodForm(schema, {
		defaultValues: {
			category: "",
			amount: undefined,
			incurred_on: format(new Date(), "yyyy-MM-dd"),
			reference: "",
			notes: "",
			production_batch: null,
			product_variant: null,
		},
	});

	useEffect(() => {
		if (expense) {
			form.reset({
				category: expense.category,
				amount: parseFloat(expense.amount),
				incurred_on: expense.incurred_on,
				reference: expense.reference || "",
				notes: expense.notes || "",
				production_batch: expense.production_batch || null,
				product_variant: expense.product_variant || null,
			});
		} else {
			form.reset({
				category: "",
				amount: undefined,
				incurred_on: format(new Date(), "yyyy-MM-dd"),
				reference: "",
				notes: "",
				production_batch: null,
				product_variant: null,
			});
		}
	}, [expense]);

	const handleCancel = () => {
		form.reset();
		handleClose();
	};

	const onSubmit = (data: FormData) => {
		const payload = {
			...data,
			production_batch: data.production_batch || null,
			product_variant: data.product_variant || null,
		};

		if (isEditMode && expense) {
			updateExpense(
				{ id: expense.id, data: payload },
				{
					onSuccess: () => {
						handleCancel();
						toast.success("Expense updated successfully");
					},
					onError: () => toast.error("Failed to update expense"),
				},
			);
		} else {
			createExpense(payload, {
				onSuccess: () => {
					handleCancel();
					toast.success("Expense recorded successfully");
				},
				onError: () => toast.error("Failed to record expense"),
			});
		}
	};

	return (
		<BaseForm form={form} onSubmit={onSubmit}>
			<div className="grid gap-4 py-4">
				<SelectField
					name="category"
					label="Category"
					placeholder="Select a category"
					required
					options={categoryOptions}
					helpText="Choose the type of expense."
				/>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						name="amount"
						label="Amount (৳)"
						placeholder="0.00"
						type="number"
						required
						helpText="Total amount for this expense."
					/>
					<DateField
						name="incurred_on"
						label="Date"
						required
						helpText="When this expense was incurred."
					/>
				</div>

				<TextField
					name="reference"
					label="Reference"
					placeholder="e.g., INV-2026-001"
					helpText="Optional — invoice number, receipt ID, or other reference."
				/>

				<TextareaField
					name="notes"
					label="Notes"
					placeholder="Any additional details about this expense..."
					rows={3}
					helpText="Optional — extra context or breakdown for this entry."
				/>

				{(isManufacturing || expense?.production_batch) && (
					<>
						<Separator />
						<div className="space-y-1">
							<p className="text-sm font-medium">Optional Linking</p>
							<p className="text-xs text-muted-foreground">
								Link this expense to a production batch or product variant for
								more accurate cost tracking.
							</p>
						</div>

						{isManufacturing && (
							<SelectField
								name="production_batch"
								label="Production Batch"
								placeholder="None"
								options={[{ value: "", label: "None" }, ...batchOptions]}
								helpText="Batch expenses are included in production cost calculations."
							/>
						)}
					</>
				)}
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
					Cancel
				</Button>
				<LoadingButton type="submit" isLoading={isPending}>
					{isEditMode ? "Update Expense" : "Record Expense"}
				</LoadingButton>
			</div>
		</BaseForm>
	);
}
