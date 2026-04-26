import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	getExpenseCategories,
	useDeleteExpenseCategory,
	type IExpenseCategory,
} from "@/lib/api/expenses";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { ExpenseCategoryFormModal } from "./components/ExpenseCategoryFormModal";

export function ExpenseCategoryList() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedCategory, setSelectedCategory] = useState<IExpenseCategory | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<IExpenseCategory | null>(null);

	const { data, isLoading, error } = useQuery(getExpenseCategories());
	const deleteMutation = useDeleteExpenseCategory();

	const categories = data?.results || [];

	const handleEdit = (category: IExpenseCategory) => {
		setSelectedCategory(category);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDeleteClick = (category: IExpenseCategory) => {
		setCategoryToDelete(category);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!categoryToDelete) return;
		try {
			await deleteMutation.mutateAsync(categoryToDelete.id);
			toast.success("Category deleted");
		} catch {
			toast.error("Failed to delete category");
		} finally {
			setDeleteDialogOpen(false);
			setCategoryToDelete(null);
		}
	};

	const columns: Column<IExpenseCategory>[] = [
		{
			key: "name",
			header: "Name",
			render: (cat) => <span className="font-medium">{cat.name}</span>,
		},
		{
			key: "description",
			header: "Description",
			render: (cat) => (
				<span className="text-muted-foreground text-sm">
					{cat.description || "—"}
				</span>
			),
		},
		{
			key: "type",
			header: "Type",
			render: (cat) =>
				cat.is_global ? (
					<Badge variant="secondary">Default</Badge>
				) : (
					<Badge variant="outline">Custom</Badge>
				),
		},
		{
			key: "actions",
			header: "",
			render: (cat) =>
				cat.is_global ? (
					<span className="text-xs text-muted-foreground">Read-only</span>
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => handleEdit(cat)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => handleDeleteClick(cat)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			className: "w-[80px]",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Expense Categories</h1>
					<p className="text-muted-foreground mt-1">
						Organise your expenses with categories. Default categories are provided
						— you can also create custom ones specific to your business.
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedCategory(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Category
				</Button>
			</div>

			<AppTable
				data={categories}
				columns={columns}
				isLoading={isLoading}
				rowKey={(cat) => cat.id}
				emptyMessage={
					error ? "Error loading categories" : "No categories found"
				}
			/>

			<ExpenseCategoryFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				category={selectedCategory}
				mode={modalMode}
			/>

			<AppConfirmDialog
				open={deleteDialogOpen}
				title="Delete Category"
				description={`Are you sure you want to delete "${categoryToDelete?.name}"? This cannot be undone.`}
				confirmButtonText="Delete"
				cancelButtonText="Cancel"
				confirmButtonVariant="destructive"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialogOpen(false)}
			/>
		</div>
	);
}
