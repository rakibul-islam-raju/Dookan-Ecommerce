import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pagination } from "@/config";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getProducts,
	type ProductFilter,
	type ProductListItem,
} from "@/lib/api/product";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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

	const { data, isFetching } = useQuery(
		getProducts({
			...params,
			search: debouncedValue,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const columns: Column<ProductListItem>[] = [
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
			header: "Base Price",
			render: (product) => (
				<span className="font-medium">৳ {product.base_price}</span>
			),
			className: "text-right",
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
	const products = data?.results || [];

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
					onChange={(value) => setSearchQuery(value)}
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

			{/* Products Table */}
			<AppTable
				data={products}
				isLoading={isFetching}
				columns={columns}
				emptyMessage="No products found"
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>
		</div>
	);
}
