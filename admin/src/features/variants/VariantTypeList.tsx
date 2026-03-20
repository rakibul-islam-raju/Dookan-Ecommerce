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
import {
	getVariantTypes,
	useCreateVariantType,
	useDeleteVariantType,
	useUpdateVariantType,
	type VariantType,
} from "@/lib/api/variant";
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
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
					<h1 className="text-3xl font-bold tracking-tight">Variant Types</h1>
					<p className="text-muted-foreground">
						Define reusable variant types (Size, Color, Weight, etc.) and their
						options
					</p>
				</div>
				<Button onClick={handleAdd}>
					<Plus className="h-4 w-4 mr-2" />
					Add Variant Type
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : variantTypes.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						<p>No variant types defined yet.</p>
						<p className="text-sm mt-1">
							Create variant types like Size, Color, or Weight to use with
							product variants.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{variantTypes.map((vt) => (
						<VariantTypeCard key={vt.id} variantType={vt} onEdit={handleEdit} />
					))}
				</div>
			)}

			<VariantTypeFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				variantType={editingType}
			/>
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
	const { mutate: deleteType, isPending: isDeleting } =
		useDeleteVariantType();

	const handleDelete = () => {
		if (
			!confirm(
				`Delete "${variantType.name}" and all its options? This may affect existing product variants.`
			)
		)
			return;
		deleteType(variantType.id, {
			onSuccess: () => toast.success("Variant type deleted"),
			onError: () => toast.error("Failed to delete. It may be in use by product variants."),
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
					{variantType.options.length} option
					{variantType.options.length !== 1 ? "s" : ""}
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
						<p className="text-sm text-muted-foreground">No options defined</p>
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
	const isEdit = !!variantType;
	const { mutate: createType, isPending: isCreating } =
		useCreateVariantType();
	const { mutate: updateType, isPending: isUpdating } =
		useUpdateVariantType();
	const isPending = isCreating || isUpdating;

	const [name, setName] = useState("");
	const [options, setOptions] = useState<{ value: string; display_order: number }[]>(
		[]
	);
	const [newOption, setNewOption] = useState("");

	useEffect(() => {
		if (variantType) {
			setName(variantType.name);
			setOptions(
				variantType.options.map((o) => ({
					value: o.value,
					display_order: o.display_order,
				}))
			);
		} else {
			setName("");
			setOptions([]);
		}
		setNewOption("");
	}, [variantType, open]);

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
		const payload = { name, options };

		if (isEdit && variantType) {
			updateType(
				{ id: variantType.id, data: payload },
				{
					onSuccess: () => {
						toast.success("Variant type updated");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to update variant type"),
				}
			);
		} else {
			createType(payload, {
				onSuccess: () => {
					toast.success("Variant type created");
					onOpenChange(false);
				},
				onError: () => toast.error("Failed to create variant type"),
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Variant Type" : "Create Variant Type"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="vt-name">Name *</Label>
						<Input
							id="vt-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Size, Color, Weight"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label>Options</Label>
						<div className="flex gap-2">
							<Input
								value={newOption}
								onChange={(e) => setNewOption(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Type an option and press Enter"
							/>
							<Button type="button" variant="outline" onClick={addOption}>
								Add
							</Button>
						</div>
						{options.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{options.map((option, index) => (
									<Badge
										key={index}
										variant="secondary"
										className="gap-1 pr-1"
									>
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
							Cancel
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{isEdit ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
