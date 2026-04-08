import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pagination } from "@/config";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getProducts,
	useBulkUpdateProductStatus,
	type ProductFilter,
	type ProductListItem,
} from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductFilterForm } from "./components/ProductFilterForm";

const initialParams: ProductFilter = {
	limit: pagination.limit,
	offset: 0,
	search: "",
};

export function ProductList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const debouncedValue = useDebouncedValue(searchQuery);

	const [currentPage, setCurrentPage] = useState(1);
	const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

	const { data, isFetching } = useQuery(
		getProducts({
			...params,
			search: debouncedValue,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);
	const bulkStatusMutation = useBulkUpdateProductStatus();
	const products = data?.results || [];
	const pageProductIds = products.map((product) => product.id);
	const selectedOnPageCount = pageProductIds.filter((id) =>
		selectedProductIds.includes(id),
	).length;
	const allOnPageSelected =
		pageProductIds.length > 0 && selectedOnPageCount === pageProductIds.length;
	const someOnPageSelected =
		selectedOnPageCount > 0 && selectedOnPageCount < pageProductIds.length;

	const toggleProductSelection = (productId: string, checked: boolean) => {
		setSelectedProductIds((prev) =>
			checked
				? [...new Set([...prev, productId])]
				: prev.filter((id) => id !== productId),
		);
	};

	const toggleSelectAllOnPage = (checked: boolean) => {
		setSelectedProductIds((prev) => {
			if (checked) {
				return [...new Set([...prev, ...pageProductIds])];
			}
			return prev.filter((id) => !pageProductIds.includes(id));
		});
	};

	const clearSelection = () => {
		setSelectedProductIds([]);
	};

	const handleBulkStatusUpdate = (is_active: boolean) => {
		if (selectedProductIds.length === 0) return;

		bulkStatusMutation.mutate(
			{ ids: selectedProductIds, is_active },
			{
				onSuccess: (response) => {
					toast.success(response.message);
					clearSelection();
				},
			},
		);
	};

	const columns: Column<ProductListItem>[] = [
		{
			key: "select",
			header: "",
			render: (product) => (
				<div
					className="flex items-center justify-center"
					onClick={(event) => event.stopPropagation()}
				>
					<Checkbox
						checked={selectedProductIds.includes(product.id)}
						onCheckedChange={(checked) =>
							toggleProductSelection(product.id, checked === true)
						}
						aria-label={`Select ${product.name}`}
					/>
				</div>
			),
			className: "w-[44px] text-center",
		},
		{
			key: "name",
			header: "Product Name",
			render: (product) => (
				<Link
					to={`/products/${product.id}`}
					className="font-medium hover:underline"
				>
					{product.name}
				</Link>
			),
		},
		{
			key: "sku",
			header: "SKU",
			render: (product) => (
				<span className="text-muted-foreground">{product.sku}</span>
			),
		},
		{
			key: "category",
			header: "Category",
			render: (product) => (
				<span className="text-muted-foreground">{product.category.name}</span>
			),
		},
		{
			key: "base_price",
			header: "Price",
			render: (product) => (
				<div className="flex flex-col gap-0.5">
					{product.sale_price ? (
						<>
							<div className="flex items-center gap-2">
								<span className="font-semibold text-green-600">
									৳ {product.sale_price}
								</span>
								{product.sale_discount_percentage ? (
									<span className="text-xs font-medium text-white bg-red-500 px-1.5 py-0.5 rounded">
										-{product.sale_discount_percentage}%
									</span>
								) : null}
							</div>
							<span className="text-xs text-muted-foreground line-through">
								৳ {product.base_price}
							</span>
							{product.sale_name && (
								<span className="text-xs text-orange-600 font-medium">
									{product.sale_name}
								</span>
							)}
						</>
					) : (
						<span className="font-medium">৳ {product.base_price}</span>
					)}
				</div>
			),
		},

		{
			key: "status",
			header: "Status",
			render: (product) => (
				<Badge variant={product.is_active ? "default" : "secondary"}>
					{product.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
	];

	const handleApplyFilters = (filter: ProductFilter) => {
		// Apply new filter values and reset pagination in a single state update
		handleChangeParams({
			...filter,
			offset: 0,
		});
		clearSelection();
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		resetParams();
		setSearchQuery("");
		clearSelection();
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
					<h1 className="text-3xl font-bold tracking-tight">Products</h1>
					<p className="text-muted-foreground">Manage your product inventory</p>
				</div>
				<Link to="/products/create">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Product
					</Button>
				</Link>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={(value) => {
						setSearchQuery(value);
						clearSelection();
					}}
					placeholder="Search products by name, SKU, or category..."
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					{/* Filter form content will go here */}
					<ProductFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			<div className="flex flex-col gap-3 rounded-lg border bg-muted/20 py-2 px-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Checkbox
						checked={
							allOnPageSelected
								? true
								: someOnPageSelected
									? "indeterminate"
									: false
						}
						onCheckedChange={(checked) =>
							toggleSelectAllOnPage(checked === true)
						}
						aria-label="Select all products on this page"
					/>
					<p className="text-sm text-muted-foreground">
						{selectedProductIds.length > 0
							? `${selectedProductIds.length} product(s) selected`
							: "Select products to apply a bulk status update"}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								disabled={
									selectedProductIds.length === 0 ||
									bulkStatusMutation.isPending
								}
							>
								Bulk actions
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								disabled={
									selectedProductIds.length === 0 ||
									bulkStatusMutation.isPending
								}
								onSelect={() => handleBulkStatusUpdate(true)}
							>
								<Plus className="h-4 w-4" />
								Mark Active
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={
									selectedProductIds.length === 0 ||
									bulkStatusMutation.isPending
								}
								onSelect={() => handleBulkStatusUpdate(false)}
							>
								<Minus className="h-4 w-4" />
								Mark Inactive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Products Table */}
			<AppTable
				data={products}
				isLoading={isFetching}
				columns={columns}
				emptyMessage="No products found"
				pagination={{
					currentPage,
					totalPages,
					onPageChange: (page) => {
						clearSelection();
						setCurrentPage(page);
					},
					pageSize: pagination.limit,
				}}
			/>
		</div>
	);
}
