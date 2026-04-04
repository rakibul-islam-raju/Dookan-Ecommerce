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
	useReorderCategories,
	type CategoryFilter,
	type CategoryListItem,
} from "@/lib/api/category";
import { useQuery } from "@tanstack/react-query";
import {
	GripVertical,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
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
	const [orderOverride, setOrderOverride] = useState<{
		sourceKey: string;
		ids: string[];
	} | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const dragStartSnapshotRef = useRef<string[]>([]);

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
	const reorderMutation = useReorderCategories();

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

	const isFilteredView = Boolean(searchQuery || params.is_active !== undefined);
	const canReorder =
		!isFilteredView && !isLoading && !reorderMutation.isPending;
	const pageOffset = (currentPage - 1) * pagination.limit;
	const serverCategories = data?.results || [];
	const sourceKey = serverCategories
		.map((category) => `${category.id}:${category.display_order}`)
		.join("|");

	const syncDisplayOrder = (items: CategoryListItem[]) =>
		items.map((category, index) => ({
			...category,
			display_order: pageOffset + index + 1,
		}));

	let categories = serverCategories;

	if (orderOverride && orderOverride.sourceKey === sourceKey) {
		const categoryMap = new Map(
			serverCategories.map((category) => [category.id, category])
		);
		const reordered = orderOverride.ids
			.map((id) => categoryMap.get(id))
			.filter((category): category is CategoryListItem => Boolean(category));

		if (reordered.length === serverCategories.length) {
			categories = syncDisplayOrder(reordered);
		}
	}

	const handleDragStart = (index: number) => {
		if (!canReorder) return;
		dragStartSnapshotRef.current = categories.map((category) => category.id);
		setDraggedIndex(index);
	};

	const handleDragOver = (
		event: React.DragEvent<HTMLTableRowElement>,
		index: number
	) => {
		event.preventDefault();
		if (!canReorder || draggedIndex === null || draggedIndex === index) return;

		const currentIds =
			orderOverride?.sourceKey === sourceKey
				? [...orderOverride.ids]
				: categories.map((category) => category.id);
		const [draggedItem] = currentIds.splice(draggedIndex, 1);
		currentIds.splice(index, 0, draggedItem);

		setOrderOverride({
			sourceKey,
			ids: currentIds,
		});
		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		if (!canReorder || draggedIndex === null) {
			setDraggedIndex(null);
			return;
		}

		const previous = dragStartSnapshotRef.current;
		const nextIds =
			orderOverride?.sourceKey === sourceKey
				? orderOverride.ids
				: categories.map((category) => category.id);
		const didChange = previous.some((id, index) => id !== nextIds[index]);

		setDraggedIndex(null);

		if (!didChange) return;

		const nextWithOrder = nextIds.map((id, index) => ({
			id,
			display_order: pageOffset + index + 1,
		}));

		reorderMutation.mutate(
			nextWithOrder,
			{
				onSuccess: () => {
					toast.success("Category order updated successfully");
				},
				onError: () => {
					setOrderOverride(null);
				},
			}
		);
	};

	const columns: Column<CategoryListItem>[] = [
		{
			key: "drag",
			header: "",
			render: () => (
				<span
					className={`inline-flex items-center justify-center ${
						canReorder
							? "cursor-grab text-muted-foreground"
							: "cursor-not-allowed text-muted-foreground/40"
					}`}
				>
					<GripVertical className="h-4 w-4" />
				</span>
			),
			className: "w-[44px]",
		},
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
			render: (category) => (
				<div>
					<div className="font-medium">{category.name}</div>
					{category.parent_name && (
						<span className="text-xs text-muted-foreground">
							in {category.parent_name}
						</span>
					)}
				</div>
			),
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

			{isFilteredView && (
				<p className="text-sm text-muted-foreground">
					Drag and drop is available on the default category list. Clear search
					or filters to reorder categories.
				</p>
			)}

			{/* Categories Table */}
			<AppTable
				data={categories}
				columns={columns}
				rowKey={(category) => category.id}
				getRowProps={(_, index) =>
					canReorder
						? {
								draggable: true,
								onDragStart: () => handleDragStart(index),
								onDragOver: (event) => handleDragOver(event, index),
								onDragEnd: handleDragEnd,
								className:
									draggedIndex === index ? "opacity-50" : "cursor-move",
							}
						: {}
				}
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
