import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { pagination } from "@/config";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilterParams } from "@/hooks/useFilterParams";
import { getWishlists, type WishlistFilter } from "@/lib/api/wishlists";
import type { WishlistItem } from "@/@types/Wishlist";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WishlistFilterForm } from "./components/WishlistFilterForm";

const initialParams: WishlistFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function WishlistList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const debouncedSearchQuery = useDebouncedValue(searchQuery);

	const { data, isFetching } = useQuery(
		getWishlists({
			...params,
			search: debouncedSearchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const columns: Column<WishlistItem>[] = [
		{
			key: "product",
			header: "Product",
			render: (item) => (
				<Link
					to={`/products/${item.product.id}`}
					className="font-medium hover:underline"
				>
					{item.product.name}
				</Link>
			),
		},
		{
			key: "category",
			header: "Category",
			render: (item) => (
				<span className="text-muted-foreground">
					{item.product.category?.name ?? "—"}
				</span>
			),
		},
		{
			key: "price",
			header: "Price",
			render: (item) => (
				<span className="text-muted-foreground">
					৳ {item.product.base_price}
				</span>
			),
		},
		{
			key: "customer",
			header: "Customer",
			render: (item) => (
				<Link
					to={`/customers/${item.user.id}`}
					className="hover:underline"
				>
					{item.user.first_name} {item.user.last_name}
					<span className="block text-xs text-muted-foreground">
						{item.user.email}
					</span>
				</Link>
			),
		},
		{
			key: "created_at",
			header: "Added On",
			render: (item) => (
				<span className="text-muted-foreground">
					{formatDate(item.created_at)}
				</span>
			),
		},
	];

	const handleApplyFilters = (filter: WishlistFilter) => {
		handleChangeParams({ ...filter, offset: 0 });
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		resetParams();
		setSearchQuery("");
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const items = data?.results ?? [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Wishlists</h1>
					<p className="text-muted-foreground">
						{data ? `${data.count} item${data.count !== 1 ? "s" : ""} wishlisted across all customers` : "All customers' wishlisted products"}
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search by product name or customer email..."
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
				>
					<WishlistFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Wishlist Table */}
			<AppTable
				data={items}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No wishlist items found"
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
