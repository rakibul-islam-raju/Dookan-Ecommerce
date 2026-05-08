import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import {
	getVariantTypes,
	useCreateVariantType,
	useDeleteVariantType,
	useUpdateVariantType,
	type VariantType,
} from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function VariantTypeList() {
	const { data: variantTypes = [], isLoading } = useQuery(getVariantTypes());
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingType, setEditingType] = useState<VariantType | null>(null);

	const handleAdd = () => {
		setEditingType(null);
		setIsFormOpen(true);
	};

	const handleEdit = (vt: VariantType) => {
		setEditingType(vt);
		setIsFormOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="variantTypes.list.title" defaultMessage="Variant Types" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="variantTypes.list.description"
							defaultMessage="Define reusable variant types (Size, Color, Weight, etc.) and their options"
						/>
					</p>
				</div>
				<Button onClick={handleAdd}>
					<Plus className="h-4 w-4 mr-2" />
					<T id="variantTypes.list.add" defaultMessage="Add Variant Type" />
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : variantTypes.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<p>
							<T
								id="variantTypes.list.empty"
								defaultMessage="No variant types defined yet."
							/>
						</p>
						<p className="text-sm mt-1">
							<T
								id="variantTypes.list.emptyDescription"
								defaultMessage="Create variant types like Size, Color, or Weight to use with product variants."
							/>
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{variantTypes?.map((vt) => (
						<VariantTypeCard key={vt.id} variantType={vt} onEdit={handleEdit} />
					))}
				</div>
			)}

			{isFormOpen && (
				<VariantTypeFormDialog
					key={editingType?.id ?? "new"}
					open={isFormOpen}
					onOpenChange={setIsFormOpen}
					variantType={editingType}
				/>
			)}
		</div>
	);
}

// ============================================================
// Variant Type Card
// ============================================================

function VariantTypeCard({
	variantType,
	onEdit,
}: {
	variantType: VariantType;
	onEdit: (vt: VariantType) => void;
}) {
	const t = useT();
	const { mutate: deleteType, isPending: isDeleting } = useDeleteVariantType();

	const handleDelete = () => {
		if (
			!confirm(
				t(
					"variantTypes.list.deleteConfirm",
					'Delete "{name}" and all its options? This may affect existing product variants.',
					{ name: variantType.name },
				),
			)
		)
			return;
		deleteType(variantType.id, {
			onSuccess: () =>
				toast.success(
					t("variantTypes.list.toast.deleteSuccess", "Variant type deleted"),
				),
			onError: () =>
				toast.error(
					t(
						"variantTypes.list.toast.deleteFailed",
						"Failed to delete. It may be in use by product variants.",
					),
				),
		});
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">{variantType.name}</CardTitle>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => onEdit(variantType)}
						>
							<Edit className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							<Trash className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
				<CardDescription>
					{t(
						"variantTypes.list.optionCount",
						"{count} option(s)",
						{ count: variantType.options.length },
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{variantType.options.map((option) => (
						<Badge key={option.id} variant="secondary">
							{option.value}
						</Badge>
					))}
					{variantType.options.length === 0 && (
						<p className="text-sm text-muted-foreground">
							<T
								id="variantTypes.list.noOptions"
								defaultMessage="No options defined"
							/>
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================
// Variant Type Form Dialog
// ============================================================

interface VariantTypeFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	variantType: VariantType | null;
}

function VariantTypeFormDialog({
	open,
	onOpenChange,
	variantType,
}: VariantTypeFormDialogProps) {
	const t = useT();
	const isEdit = !!variantType;
	const { mutate: createType, isPending: isCreating } = useCreateVariantType();
	const { mutate: updateType, isPending: isUpdating } = useUpdateVariantType();
	const isPending = isCreating || isUpdating;

	// Initialize state from variantType (component re-mounts when variantType changes via key prop)
	const initialName = variantType?.name ?? "";
	const initialOptions =
		variantType?.options.map((o) => ({
			value: o.value,
			display_order: o.display_order,
		})) ?? [];

	const [name, setName] = useState(initialName);
	const [options, setOptions] =
		useState<{ value: string; display_order: number }[]>(initialOptions);
	const [newOption, setNewOption] = useState("");

	const addOption = () => {
		const trimmed = newOption.trim();
		if (!trimmed) return;
		if (options.some((o) => o.value.toLowerCase() === trimmed.toLowerCase()))
			return;
		setOptions([...options, { value: trimmed, display_order: options.length }]);
		setNewOption("");
	};

	const removeOption = (index: number) => {
		setOptions(options.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addOption();
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			toast.error(
				t("variantTypes.form.toast.nameRequired", "Variant type name is required"),
			);
			return;
		}

		const payload = { name: trimmedName, options };

		if (isEdit && variantType) {
			updateType(
				{ id: variantType.id, data: payload },
				{
					onSuccess: () => {
						toast.success(
							t("variantTypes.form.toast.updateSuccess", "Variant type updated"),
						);
						onOpenChange(false);
					},
					onError: () =>
						toast.error(
							t(
								"variantTypes.form.toast.updateFailed",
								"Failed to update variant type",
							),
						),
				},
			);
		} else {
			createType(payload, {
				onSuccess: () => {
					toast.success(
						t("variantTypes.form.toast.createSuccess", "Variant type created"),
					);
					onOpenChange(false);
				},
				onError: () =>
					toast.error(
						t(
							"variantTypes.form.toast.createFailed",
							"Failed to create variant type",
						),
					),
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEdit ? (
							<T
								id="variantTypes.form.editTitle"
								defaultMessage="Edit Variant Type"
							/>
						) : (
							<T
								id="variantTypes.form.createTitle"
								defaultMessage="Create Variant Type"
							/>
						)}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="vt-name">
							{t("variantTypes.form.name", "Name")} *
						</Label>
						<Input
							id="vt-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t(
								"variantTypes.form.namePlaceholder",
								"e.g., Size, Color, Weight",
							)}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<T id="variantTypes.form.options" defaultMessage="Options" />
						</Label>
						<div className="flex gap-2">
							<Input
								value={newOption}
								onChange={(e) => setNewOption(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={t(
									"variantTypes.form.optionPlaceholder",
									"Type an option and press Enter",
								)}
							/>
							<Button type="button" variant="outline" onClick={addOption}>
								<T id="variantTypes.form.addOption" defaultMessage="Add" />
							</Button>
						</div>
						{options.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{options.map((option, index) => (
									<Badge key={index} variant="secondary" className="gap-1 pr-1">
										{option.value}
										<button
											type="button"
											onClick={() => removeOption(index)}
											className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							<T id="common.cancel" defaultMessage="Cancel" />
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{isEdit ? (
								<T id="variantTypes.form.update" defaultMessage="Update" />
							) : (
								<T id="variantTypes.form.create" defaultMessage="Create" />
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
