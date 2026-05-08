import { DateField } from "@/components/ui/@form/DateField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useZodForm } from "@/hooks/useZodForm";
import { getMaterials, useCreateBatch } from "@/lib/api/inventory";
import { getProducts } from "@/lib/api/product";
import { getProductVariants } from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

interface MaterialRow {
	material: string;
	planned_quantity: string;
	actual_quantity: string;
}

interface OutputRow {
	product_id: string;
	variant: string;
	quantity: string;
}

function MaterialRows({
	rows,
	onChange,
	materialOptions,
	texts,
}: {
	rows: MaterialRow[];
	onChange: (rows: MaterialRow[]) => void;
	materialOptions: { value: string; label: string }[];
	texts: {
		description: string;
		selectMaterial: string;
		planned: string;
		actual: string;
		material: string;
		plannedQty: string;
		actualQty: string;
		addMaterial: string;
	};
}) {
	const addRow = () =>
		onChange([...rows, { material: "", planned_quantity: "", actual_quantity: "" }]);

	const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

	const updateRow = (i: number, field: keyof MaterialRow, value: string) => {
		const next = [...rows];
		next[i] = { ...next[i], [field]: value };
		onChange(next);
	};

	return (
		<div className="space-y-3">
			<p className="text-xs text-muted-foreground">{texts.description}</p>
			{rows.map((row, i) => (
				<div key={i} className="flex items-end gap-2">
					<div className="flex-1">
						<select
							value={row.material}
							onChange={(e) => updateRow(i, "material", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">{texts.selectMaterial}</option>
							{materialOptions.map((m) => (
								<option key={m.value} value={m.value}>
									{m.label}
								</option>
							))}
						</select>
					</div>
					<div className="w-28">
						<input
							type="number"
							placeholder={texts.planned}
							value={row.planned_quantity}
							onChange={(e) => updateRow(i, "planned_quantity", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						/>
					</div>
					<div className="w-28">
						<input
							type="number"
							placeholder={texts.actual}
							value={row.actual_quantity}
							onChange={(e) => updateRow(i, "actual_quantity", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						/>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-destructive hover:text-destructive h-9 w-9 p-0"
						onClick={() => removeRow(i)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			))}
			{rows.length > 0 && (
				<div className="flex gap-2 text-xs text-muted-foreground pl-1">
					<span className="flex-1">{texts.material}</span>
					<span className="w-28 text-center">{texts.plannedQty}</span>
					<span className="w-28 text-center">{texts.actualQty}</span>
					<span className="w-9" />
				</div>
			)}
			<Button type="button" variant="outline" size="sm" onClick={addRow}>
				<Plus className="h-4 w-4 mr-1" />
				{texts.addMaterial}
			</Button>
		</div>
	);
}

function OutputRows({
	rows,
	onChange,
	productOptions,
	texts,
}: {
	rows: OutputRow[];
	onChange: (rows: OutputRow[]) => void;
	productOptions: { value: string; label: string }[];
	texts: {
		description: string;
		addOutput: string;
		selectProduct: string;
		selectVariant: string;
		selectProductFirst: string;
		quantity: string;
	};
}) {
	const addRow = () => onChange([...rows, { product_id: "", variant: "", quantity: "" }]);
	const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
	const updateRow = (i: number, field: keyof OutputRow, value: string) => {
		const next = [...rows];
		next[i] = { ...next[i], [field]: value };
		if (field === "product_id") next[i].variant = "";
		onChange(next);
	};

	return (
		<div className="space-y-3">
			<p className="text-xs text-muted-foreground">{texts.description}</p>
			{rows.map((row, i) => (
				<OutputRowItem
					key={i}
					row={row}
					productOptions={productOptions}
					texts={texts}
					onUpdate={(field, value) => updateRow(i, field, value)}
					onRemove={() => removeRow(i)}
				/>
			))}
			<Button type="button" variant="outline" size="sm" onClick={addRow}>
				<Plus className="h-4 w-4 mr-1" />
				{texts.addOutput}
			</Button>
		</div>
	);
}

function OutputRowItem({
	row,
	productOptions,
	texts,
	onUpdate,
	onRemove,
}: {
	row: OutputRow;
	productOptions: { value: string; label: string }[];
	texts: {
		selectProduct: string;
		selectVariant: string;
		selectProductFirst: string;
		quantity: string;
	};
	onUpdate: (field: keyof OutputRow, value: string) => void;
	onRemove: () => void;
}) {
	const { data: variants } = useQuery({
		...getProductVariants(row.product_id),
		enabled: !!row.product_id,
	});

	const variantOptions = (variants || []).map((v) => ({
		value: v.id,
		label: v.name || v.sku,
	}));

	return (
		<div className="flex items-end gap-2">
			<div className="flex-1">
				<select
					value={row.product_id}
					onChange={(e) => onUpdate("product_id", e.target.value)}
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					<option value="">{texts.selectProduct}</option>
					{productOptions.map((p) => (
						<option key={p.value} value={p.value}>
							{p.label}
						</option>
					))}
				</select>
			</div>
			<div className="flex-1">
				<select
					value={row.variant}
					onChange={(e) => onUpdate("variant", e.target.value)}
					disabled={!row.product_id}
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
				>
					<option value="">
						{row.product_id ? texts.selectVariant : texts.selectProductFirst}
					</option>
					{variantOptions.map((v) => (
						<option key={v.value} value={v.value}>
							{v.label}
						</option>
					))}
				</select>
			</div>
			<div className="w-24">
				<input
					type="number"
					placeholder={texts.quantity}
					value={row.quantity}
					onChange={(e) => onUpdate("quantity", e.target.value)}
					className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="text-destructive hover:text-destructive h-9 w-9 p-0"
				onClick={onRemove}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}

export function CreateBatch() {
	const t = useT();
	const navigate = useNavigate();
	const { mutate: createBatch, isPending } = useCreateBatch();

	const schema = z.object({
		code: z.string().min(1, t("inventory.createBatch.validation.code", "Batch code is required")).max(50),
		status: z.enum(["draft", "in_progress"]).default("draft"),
		started_at: z.string().optional(),
		notes: z.string().optional().or(z.literal("")),
	});

	type FormData = z.infer<typeof schema>;

	const [materialRows, setMaterialRows] = useState<MaterialRow[]>([
		{ material: "", planned_quantity: "", actual_quantity: "" },
	]);
	const [outputRows, setOutputRows] = useState<OutputRow[]>([
		{ product_id: "", variant: "", quantity: "" },
	]);

	const { data: materialsData } = useQuery(getMaterials({ limit: 200, offset: 0 }));
	const { data: productsData } = useQuery(getProducts({ limit: 200, offset: 0 }));

	const materialOptions = (materialsData?.results || [])
		.filter((m) => m.is_active)
		.map((m) => ({ value: m.id, label: `${m.name} (${m.unit})` }));

	const productOptions = (productsData?.results || []).map((p) => ({
		value: p.id,
		label: p.name,
	}));

	const statusOptions = [
		{
			value: "draft",
			label: t("inventory.createBatch.status.draft", "Draft — save for later"),
		},
		{
			value: "in_progress",
			label: t(
				"inventory.createBatch.status.inProgress",
				"In Progress — production started",
			),
		},
	];

	const form = useZodForm(schema, {
		defaultValues: {
			code: "",
			status: "draft",
			started_at: "",
			notes: "",
		},
	});

	const onSubmit = (data: FormData) => {
		const materials = materialRows
			.filter((r) => r.material && r.actual_quantity)
			.map((r) => ({
				material: r.material,
				planned_quantity: r.planned_quantity ? parseFloat(r.planned_quantity) : null,
				actual_quantity: parseFloat(r.actual_quantity),
			}));

		const outputs = outputRows
			.filter((r) => r.variant && r.quantity)
			.map((r) => ({
				variant: r.variant,
				quantity: parseInt(r.quantity, 10),
			}));

		if (materials.length === 0) {
			toast.error(t("inventory.createBatch.validation.materials", "Add at least one material"));
			return;
		}
		if (outputs.length === 0) {
			toast.error(t("inventory.createBatch.validation.outputs", "Add at least one output"));
			return;
		}

		createBatch(
			{
				code: data.code,
				status: data.status,
				started_at: data.started_at || null,
				notes: data.notes || undefined,
				materials,
				outputs,
			},
			{
				onSuccess: (batch) => {
					toast.success(t("inventory.createBatch.createSuccess", "Batch created"));
					navigate(`/inventory/batches/${batch.id}`);
				},
				onError: () => toast.error(t("inventory.createBatch.createFailed", "Failed to create batch")),
			},
		);
	};

	return (
		<div className="space-y-6">
			<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/batches")}>
				<ArrowLeft className="h-4 w-4 mr-1" />
				<T id="inventory.batches.title" defaultMessage="Production Batches" />
			</Button>

			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					<T id="inventory.createBatch.title" defaultMessage="New Production Batch" />
				</h1>
				<p className="text-muted-foreground mt-1">
					<T
						id="inventory.createBatch.description"
						defaultMessage="Define the materials consumed and products you expect to produce. You can save as a draft and update quantities before completing."
					/>
				</p>
			</div>

			<BaseForm form={form} onSubmit={onSubmit}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main form */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									<T id="inventory.createBatch.info.title" defaultMessage="Batch Info" />
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="code"
										label={t("inventory.createBatch.info.code", "Batch Code")}
										placeholder={t(
											"inventory.createBatch.info.codePlaceholder",
											"e.g., BATCH-2026-001",
										)}
										required
										helpText={t(
											"inventory.createBatch.info.codeHelp",
											"Unique identifier for this production run.",
										)}
									/>
									<SelectField
										name="status"
										label={t("inventory.createBatch.info.status", "Status")}
										options={statusOptions}
										helpText={t(
											"inventory.createBatch.info.statusHelp",
											"Draft to save for later; In Progress if production has started.",
										)}
									/>
								</div>
								<DateField
									name="started_at"
									label={t("inventory.createBatch.info.startedOn", "Started On")}
									helpText={t(
										"inventory.createBatch.info.startedOnHelp",
										"Optional; when production started.",
									)}
								/>
								<TextareaField
									name="notes"
									label={t("inventory.createBatch.info.notes", "Notes")}
									placeholder={t(
										"inventory.createBatch.info.notesPlaceholder",
										"Any notes about this batch...",
									)}
									rows={2}
									helpText={t("inventory.createBatch.info.optional", "Optional")}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">
										<T id="inventory.createBatch.materials.title" defaultMessage="Materials" />
									</CardTitle>
									<span className="text-xs text-muted-foreground">
										<T
											id="inventory.createBatch.materials.optionalNote"
											defaultMessage="Planned qty is optional"
										/>
									</span>
								</div>
							</CardHeader>
							<CardContent>
								<MaterialRows
									rows={materialRows}
									onChange={setMaterialRows}
									materialOptions={materialOptions}
									texts={{
										description: t(
											"inventory.createBatch.materials.description",
											"Add each raw material consumed in this batch. Planned quantity is optional.",
										),
										selectMaterial: t(
											"inventory.createBatch.materials.selectMaterial",
											"Select material...",
										),
										planned: t("inventory.createBatch.materials.planned", "Planned"),
										actual: t("inventory.createBatch.materials.actual", "Actual *"),
										material: t("inventory.createBatch.materials.header.material", "Material"),
										plannedQty: t(
											"inventory.createBatch.materials.header.plannedQty",
											"Planned qty",
										),
										actualQty: t(
											"inventory.createBatch.materials.header.actualQty",
											"Actual qty",
										),
										addMaterial: t(
											"inventory.createBatch.materials.add",
											"Add Material",
										),
									}}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									<T
										id="inventory.createBatch.outputs.title"
										defaultMessage="Finished Outputs"
									/>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<OutputRows
									rows={outputRows}
									onChange={setOutputRows}
									productOptions={productOptions}
									texts={{
										description: t(
											"inventory.createBatch.outputs.description",
											"Add the products you expect to produce in this batch.",
										),
										addOutput: t("inventory.createBatch.outputs.add", "Add Output"),
										selectProduct: t(
											"inventory.createBatch.outputs.selectProduct",
											"Select product...",
										),
										selectVariant: t(
											"inventory.createBatch.outputs.selectVariant",
											"Select variant...",
										),
										selectProductFirst: t(
											"inventory.createBatch.outputs.selectProductFirst",
											"Select product first",
										),
										quantity: t("inventory.createBatch.outputs.quantity", "Qty *"),
									}}
								/>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar actions */}
					<div>
						<Card>
							<CardContent className="pt-6 space-y-3">
								<LoadingButton
									type="submit"
									isLoading={isPending}
									className="w-full"
								>
									<T
										id="inventory.createBatch.submit"
										defaultMessage="Create Batch"
									/>
								</LoadingButton>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => navigate("/inventory/batches")}
								>
									<T id="common.cancel" defaultMessage="Cancel" />
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</BaseForm>
		</div>
	);
}
