import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
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
	const t = useT();
	const { locale } = useLocale();
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
		return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const formatCurrency = (value: string | number) =>
		`৳${Number(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const columns: Column<WishlistItem>[] = [
		{
			key: "product",
			header: t("wishlists.list.table.product", "Product"),
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
			header: t("wishlists.list.table.category", "Category"),
			render: (item) => (
				<span className="text-muted-foreground">
					{item.product.category?.name ?? t("wishlists.list.table.empty", "—")}
				</span>
			),
		},
		{
			key: "price",
			header: t("wishlists.list.table.price", "Price"),
			render: (item) => (
				<span className="text-muted-foreground">
					{formatCurrency(item.product.base_price)}
				</span>
			),
		},
		{
			key: "customer",
			header: t("wishlists.list.table.customer", "Customer"),
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
			header: t("wishlists.list.table.addedOn", "Added On"),
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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="wishlists.list.title" defaultMessage="Wishlists" />
					</h1>
					<p className="text-muted-foreground">
						{data
							? t(
									"wishlists.list.countDescription",
									"{count} item(s) wishlisted across all customers",
									{
										count: data.count.toLocaleString(
											locale === "bn" ? "bn-BD" : "en-IN",
										),
									},
								)
							: t(
									"wishlists.list.description",
									"All customers' wishlisted products",
								)}
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t(
						"wishlists.list.searchPlaceholder",
						"Search by product name or customer email...",
					)}
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
					title={t("wishlists.filter.title", "Filters")}
					description={t(
						"wishlists.filter.description",
						"Apply filters to refine the wishlist list",
					)}
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
				emptyMessage={t("wishlists.list.empty", "No wishlist items found")}
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
