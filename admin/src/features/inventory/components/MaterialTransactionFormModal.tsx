import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { useCreateMaterialTransaction } from "@/lib/api/inventory";
import { toast } from "react-toastify";
import { z } from "zod";

interface MaterialTransactionFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	materialId: string;
	materialName: string;
	unit: string;
}

export function MaterialTransactionFormModal({
	open,
	onOpenChange,
	materialId,
	materialName,
	unit,
}: MaterialTransactionFormModalProps) {
	const t = useT();
	const { mutate: createTransaction, isPending } = useCreateMaterialTransaction();

	const schema = z.object({
		transaction_type: z.enum(["purchase", "adjustment_in", "adjustment_out"]),
		quantity_change: z.coerce
			.number()
			.positive(
				t(
					"inventory.transactionForm.validation.quantity",
					"Quantity must be greater than 0",
				),
			),
		unit_cost: z.coerce.number().nonnegative().optional().nullable(),
		note: z.string().optional().or(z.literal("")),
	});

	type FormData = z.infer<typeof schema>;

	const transactionTypeOptions = [
		{
			value: "purchase",
			label: t(
				"inventory.transactionForm.type.purchase",
				"Purchase — Record stock received from a supplier",
			),
		},
		{
			value: "adjustment_in",
			label: t(
				"inventory.transactionForm.type.adjustmentIn",
				"Adjustment In — Correct stock upward (e.g. after recount)",
			),
		},
		{
			value: "adjustment_out",
			label: t(
				"inventory.transactionForm.type.adjustmentOut",
				"Adjustment Out — Correct stock downward (e.g. damage or loss)",
			),
		},
	];

	const form = useZodForm(schema, {
		defaultValues: {
			transaction_type: "purchase",
			quantity_change: undefined,
			unit_cost: null,
			note: "",
		},
	});

	const handleClose = () => {
		form.reset();
		onOpenChange(false);
	};

	const onSubmit = (data: FormData) => {
		createTransaction(
			{
				material_id: materialId,
				...data,
				unit_cost: data.unit_cost ?? null,
				note: data.note || undefined,
			},
			{
				onSuccess: () => {
					handleClose();
					toast.success(t("inventory.transactionForm.createSuccess", "Transaction recorded"));
				},
				onError: () => toast.error(t("inventory.transactionForm.createFailed", "Failed to record transaction")),
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>
						<T
							id="inventory.transactionForm.title"
							defaultMessage="Record Transaction"
						/>
					</DialogTitle>
					<DialogDescription>
						{t(
							"inventory.transactionForm.description",
							"Record a stock movement for {materialName}.",
							{ materialName },
						)}
					</DialogDescription>
				</DialogHeader>

				<BaseForm form={form} onSubmit={onSubmit}>
					<div className="grid gap-4 py-4">
						<SelectField
							name="transaction_type"
							label={t("inventory.transactionForm.transactionType", "Transaction Type")}
							required
							options={transactionTypeOptions}
							helpText={t(
								"inventory.transactionForm.transactionTypeHelp",
								"Choose the reason for this stock movement.",
							)}
						/>
						<TextField
							name="quantity_change"
							label={t("inventory.transactionForm.quantity", "Quantity ({unit})", { unit })}
							type="number"
							placeholder="0"
							required
							helpText={t(
								"inventory.transactionForm.quantityHelp",
								"Amount to add or remove. Always enter a positive number; the direction is determined by the transaction type.",
							)}
						/>
						<TextField
							name="unit_cost"
							label={t("inventory.transactionForm.unitCost", "Unit Cost (৳)")}
							type="number"
							placeholder={t("inventory.transactionForm.optional", "Optional")}
							helpText={t(
								"inventory.transactionForm.unitCostHelp",
								"Cost per unit. For purchases, this updates the weighted average cost.",
							)}
						/>
						<TextareaField
							name="note"
							label={t("inventory.transactionForm.note", "Note")}
							placeholder={t(
								"inventory.transactionForm.notePlaceholder",
								"Reason or reference for this adjustment...",
							)}
							rows={2}
							helpText={t(
								"inventory.transactionForm.noteHelp",
								"Optional; useful for audit trail.",
							)}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
							<T id="common.cancel" defaultMessage="Cancel" />
						</Button>
						<LoadingButton type="submit" isLoading={isPending}>
							<T
								id="inventory.transactionForm.submit"
								defaultMessage="Record Transaction"
							/>
						</LoadingButton>
					</div>
				</BaseForm>
			</DialogContent>
		</Dialog>
	);
}
