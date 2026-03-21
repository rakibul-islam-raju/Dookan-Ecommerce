import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
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
import { pagination } from "@/config";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getCategories,
	useDeleteCategory,
	type CategoryFilter,
	type CategoryListItem,
} from "@/lib/api/category";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { CategoryFilterForm } from "./components/CategoryFilterForm";
import { CategoryFormModal } from "./components/CategoryFormModal";

const initialParams: CategoryFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function CategoryList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryListItem | null>(null);

	// Fetch categories using TanStack Query
	const { data, isLoading, error } = useQuery(
		getCategories({
			...params,
			search: searchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);

	// Delete mutation
	const deleteMutation = useDeleteCategory();

	const handleEdit = (category: CategoryListItem) => {
		setSelectedCategory(category);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (category: CategoryListItem) => {
		if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(category.id);
			toast.success("Category deleted successfully");
		} catch (error) {
			toast.error("Failed to delete category");
			console.error("Delete error:", error);
		}
	};

	const getStatusBadgeVariant = (isActive: boolean) => {
		return isActive ? "default" : "secondary";
	};

	const columns: Column<CategoryListItem>[] = [
		{
			key: "image",
			header: "Image",
			render: (category) =>
				category.image ? (
					<img
						src={category.image}
						alt={category.name}
						className="h-10 w-10 rounded-md object-cover"
					/>
				) : (
					<div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
						N/A
					</div>
				),
			className: "w-[60px]",
		},
		{
			key: "name",
			header: "Category Name",
			render: (category) => <div className="font-medium">{category.name}</div>,
		},
		{
			key: "slug",
			header: "Slug",
			render: (category) => (
				<span className="text-muted-foreground">{category.slug}</span>
			),
		},
		{
			key: "description",
			header: "Description",
			render: (category) => (
				<span className="text-muted-foreground truncate max-w-xs block">
					{category.description || "-"}
				</span>
			),
		},
		{
			key: "display_order",
			header: "Order",
			render: (category) => <span>{category.display_order}</span>,
			className: "text-center",
		},
		{
			key: "is_active",
			header: "Status",
			render: (category) => (
				<Badge variant={getStatusBadgeVariant(category.is_active)}>
					{category.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			render: (category) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(category)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(category)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const handleApplyFilters = (filter: CategoryFilter) => {
		// Apply new filter values, reset pagination, and close the drawer
		handleChangeParams({
			...filter,
			offset: 0,
		});
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		resetParams();
		setSearchQuery("");
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	// Calculate pagination
	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const categories = data?.results || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Categories</h1>
					<p className="text-muted-foreground">
						Manage your product categories
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

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search categories by name or slug..."
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					<CategoryFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Categories Table */}
			<AppTable
				data={categories}
				columns={columns}
				emptyMessage={
					isLoading
						? "Loading categories..."
						: error
							? "Error loading categories"
							: "No categories found"
				}
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			{/* Category Form Modal (Create/Edit) */}
			<CategoryFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				category={selectedCategory}
				mode={modalMode}
				intialOrder={data?.count ? data.count + 1 : 1}
			/>
		</div>
	);
}
