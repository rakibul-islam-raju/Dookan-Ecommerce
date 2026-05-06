import { DateField } from "@/components/ui/@form/DateField";
import { SelectField } from "@/components/ui/@form/SelectField";
import { TextareaField } from "@/components/ui/@form/TextareaField";
import { TextField } from "@/components/ui/@form/TextField";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/LoadingButton";
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

const schema = z.object({
	code: z.string().min(1, "Batch code is required").max(50),
	status: z.enum(["draft", "in_progress"]).default("draft"),
	started_at: z.string().optional(),
	notes: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

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
}: {
	rows: MaterialRow[];
	onChange: (rows: MaterialRow[]) => void;
	materialOptions: { value: string; label: string }[];
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
			<p className="text-xs text-muted-foreground">
				Add each raw material consumed in this batch. Planned quantity is optional.
			</p>
			{rows.map((row, i) => (
				<div key={i} className="flex items-end gap-2">
					<div className="flex-1">
						<select
							value={row.material}
							onChange={(e) => updateRow(i, "material", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">Select material...</option>
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
							placeholder="Planned"
							value={row.planned_quantity}
							onChange={(e) => updateRow(i, "planned_quantity", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						/>
					</div>
					<div className="w-28">
						<input
							type="number"
							placeholder="Actual *"
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
					<span className="flex-1">Material</span>
					<span className="w-28 text-center">Planned qty</span>
					<span className="w-28 text-center">Actual qty</span>
					<span className="w-9" />
				</div>
			)}
			<Button type="button" variant="outline" size="sm" onClick={addRow}>
				<Plus className="h-4 w-4 mr-1" />
				Add Material
			</Button>
		</div>
	);
}

function OutputRows({
	rows,
	onChange,
	productOptions,
}: {
	rows: OutputRow[];
	onChange: (rows: OutputRow[]) => void;
	productOptions: { value: string; label: string }[];
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
			<p className="text-xs text-muted-foreground">
				Add the products you expect to produce in this batch.
			</p>
			{rows.map((row, i) => (
				<OutputRowItem
					key={i}
					row={row}
					productOptions={productOptions}
					onUpdate={(field, value) => updateRow(i, field, value)}
					onRemove={() => removeRow(i)}
				/>
			))}
			<Button type="button" variant="outline" size="sm" onClick={addRow}>
				<Plus className="h-4 w-4 mr-1" />
				Add Output
			</Button>
		</div>
	);
}

function OutputRowItem({
	row,
	productOptions,
	onUpdate,
	onRemove,
}: {
	row: OutputRow;
	productOptions: { value: string; label: string }[];
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
					<option value="">Select product...</option>
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
						{row.product_id ? "Select variant..." : "Select product first"}
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
					placeholder="Qty *"
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

const statusOptions = [
	{ value: "draft", label: "Draft — save for later" },
	{ value: "in_progress", label: "In Progress — production started" },
];

export function CreateBatch() {
	const navigate = useNavigate();
	const { mutate: createBatch, isPending } = useCreateBatch();

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
			toast.error("Add at least one material");
			return;
		}
		if (outputs.length === 0) {
			toast.error("Add at least one output");
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
					toast.success("Batch created");
					navigate(`/inventory/batches/${batch.id}`);
				},
				onError: () => toast.error("Failed to create batch"),
			},
		);
	};

	return (
		<div className="space-y-6">
			<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/batches")}>
				<ArrowLeft className="h-4 w-4 mr-1" />
				Production Batches
			</Button>

			<div>
				<h1 className="text-3xl font-bold tracking-tight">New Production Batch</h1>
				<p className="text-muted-foreground mt-1">
					Define the materials consumed and products you expect to produce. You can
					save as a draft and update quantities before completing.
				</p>
			</div>

			<BaseForm form={form} onSubmit={onSubmit}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main form */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Batch Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<TextField
										name="code"
										label="Batch Code"
										placeholder="e.g., BATCH-2026-001"
										required
										helpText="Unique identifier for this production run."
									/>
									<SelectField
										name="status"
										label="Status"
										options={statusOptions}
										helpText="Draft to save for later; In Progress if production has started."
									/>
								</div>
								<DateField
									name="started_at"
									label="Started On"
									helpText="Optional — when production started."
								/>
								<TextareaField
									name="notes"
									label="Notes"
									placeholder="Any notes about this batch..."
									rows={2}
									helpText="Optional."
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">Materials</CardTitle>
									<span className="text-xs text-muted-foreground">
										Planned qty is optional
									</span>
								</div>
							</CardHeader>
							<CardContent>
								<MaterialRows
									rows={materialRows}
									onChange={setMaterialRows}
									materialOptions={materialOptions}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">Finished Outputs</CardTitle>
							</CardHeader>
							<CardContent>
								<OutputRows
									rows={outputRows}
									onChange={setOutputRows}
									productOptions={productOptions}
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
									Create Batch
								</LoadingButton>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => navigate("/inventory/batches")}
								>
									Cancel
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</BaseForm>
		</div>
	);
}
