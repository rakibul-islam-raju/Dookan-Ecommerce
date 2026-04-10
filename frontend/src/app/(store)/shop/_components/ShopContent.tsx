/* eslint-disable react-hooks/static-components */
"use client";

import type { ICategory, ICategoryChild } from "@/@types/Category";
import { IConsumerProductListItem } from "@/@types/Product";
import { ProductItem } from "@/components/Product/ProductItem";
import Image from "next/image";
import { QuickViewModal } from "@/components/Product/QuickViewModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProducts } from "@/lib/hooks/useProducts";
import { cn } from "@/lib/utils";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Filter,
	Loader2,
	SlidersHorizontal,
	X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const SORT_OPTIONS = [
	{ value: "-created_at", label: "Newest" },
	{ value: "price", label: "Price: Low to High" },
	{ value: "-price", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function ProductSkeleton() {
	return (
		<div className="rounded-xl border bg-card overflow-hidden animate-pulse">
			<div className="aspect-square bg-muted" />
			<div className="p-4 space-y-3">
				<div className="h-3 bg-muted rounded w-1/3" />
				<div className="h-5 bg-muted rounded w-3/4" />
				<div className="h-4 bg-muted rounded w-1/2" />
			</div>
		</div>
	);
}

function ProductGridSkeleton({ count = 9 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{Array.from({ length: count }).map((_, i) => (
				<ProductSkeleton key={i} />
			))}
		</div>
	);
}

function CategorySkeleton() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
			))}
		</div>
	);
}

function CategoryFilterImage({ category }: { category: ICategory }) {
	return (
		<div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
			{category.image ? (
				<Image
					src={category.image}
					alt={category.name}
					width={24}
					height={24}
					className="object-cover size-full"
				/>
			) : (
				<span className="text-[10px] font-semibold uppercase">
					{category.name.charAt(0)}
				</span>
			)}
		</div>
	);
}

function ChildCategoryFilterImage({ child }: { child: ICategoryChild }) {
	return (
		<div className="size-5 rounded bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
			{child.image ? (
				<Image
					src={child.image}
					alt={child.name}
					width={20}
					height={20}
					className="object-cover size-full"
				/>
			) : (
				<span className="text-[9px] font-semibold uppercase">
					{child.name.charAt(0)}
				</span>
			)}
		</div>
	);
}

export function ShopContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [selectedProduct, setSelectedProduct] =
		useState<IConsumerProductListItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
		new Set(),
	);

	const toggleCategoryExpanded = (id: string) => {
		setExpandedCategoryIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	// Get filters from URL
	const searchQuery = searchParams.get("search") || "";
	const categoryFilter = searchParams.get("category") || "";
	const sortBy = (searchParams.get("sort") as SortValue) || "-created_at";
	const minPrice = searchParams.get("minPrice") || "";
	const maxPrice = searchParams.get("maxPrice") || "";
	const inStockOnly = searchParams.get("inStock") === "true";
	const page = parseInt(searchParams.get("page") || "1", 10);
	const pageSize = 12;

	// Fetch categories
	const { data: categoriesData, isLoading: isCategoriesLoading } =
		useCategories();
	const categories = categoriesData?.results || [];

	// Build API params from URL state
	const apiParams = {
		page,
		limit: pageSize,
		...(searchQuery && { search: searchQuery }),
		...(categoryFilter && { category: categoryFilter }),
		...(sortBy && { ordering: sortBy }),
		...(minPrice && { min_price: parseFloat(minPrice) }),
		...(maxPrice && { max_price: parseFloat(maxPrice) }),
		...(inStockOnly && { is_in_stock: true }),
	};

	// Fetch products
	const {
		data: productsData,
		isLoading: isProductsLoading,
		isFetching,
	} = useProducts(apiParams);

	const products = productsData?.results || [];
	const totalCount = productsData?.count || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	// Update URL with filters
	const updateFilters = useCallback(
		(updates: Record<string, string>) => {
			const params = new URLSearchParams(searchParams.toString());

			Object.entries(updates).forEach(([key, value]) => {
				if (value) {
					params.set(key, value);
				} else {
					params.delete(key);
				}
			});

			// Reset to page 1 when filters change (except for page itself)
			if (!("page" in updates)) {
				params.delete("page");
			}

			router.push(`/shop?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	const clearFilters = useCallback(() => {
		router.push("/shop", { scroll: false });
	}, [router]);

	const handleQuickView = (product: IConsumerProductListItem) => {
		setSelectedProduct(product);
		setIsModalOpen(true);
	};

	const activeFiltersCount = [
		searchQuery,
		categoryFilter,
		minPrice,
		maxPrice,
		inStockOnly,
	].filter(Boolean).length;

	const handlePageChange = (newPage: number) => {
		updateFilters({ page: newPage.toString() });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Separate top-level categories from subcategories
	const topLevelCategories = categories.filter((c) => !c.parent);

	// Helper to find category name by ID (across all levels)
	const findCategoryName = (id: string) => {
		for (const cat of categories) {
			if (cat.id === id) return cat.name;
			if (cat.children) {
				const child = cat.children.find((c) => c.id === id);
				if (child) return child.name;
			}
		}
		return id;
	};

	// Filter sidebar content (shared between desktop and mobile)
	const FilterContent = ({
		onCategorySelect,
	}: {
		onCategorySelect?: () => void;
	}) => (
		<>
			{/* Category Filter */}
			<div className="space-y-2">
				<h3 className="font-medium text-sm">Category</h3>
				{isCategoriesLoading ? (
					<CategorySkeleton />
				) : (
					<div className="space-y-0.5">
						<button
							onClick={() => {
								updateFilters({ category: "" });
								onCategorySelect?.();
							}}
							className={cn(
								"w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
								!categoryFilter
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted",
							)}
						>
							All Categories
						</button>
						{topLevelCategories.map((cat) => {
							const children = cat.children || [];
							const hasChildren = children.length > 0;
							const isExpanded = expandedCategoryIds.has(cat.id);
							const isChildActive = children.some(
								(c) => c.id === categoryFilter,
							);

							return (
								<div key={cat.id}>
									<div className="flex items-center rounded-md overflow-hidden">
										<button
											onClick={() => {
												updateFilters({ category: cat.id });
												onCategorySelect?.();
											}}
											className={cn(
												"flex-1 flex items-center gap-2.5 px-2 py-2 text-sm font-medium transition-colors text-left rounded-md",
												categoryFilter === cat.id
													? "bg-primary text-primary-foreground"
													: isChildActive
														? "text-primary"
														: "hover:bg-muted",
											)}
										>
											<CategoryFilterImage category={cat} />
											<span className="truncate">{cat.name}</span>
										</button>
										{hasChildren && (
											<button
												onClick={() => toggleCategoryExpanded(cat.id)}
												className={cn(
													"px-2 py-2 transition-colors rounded-md ml-0.5",
													categoryFilter === cat.id
														? "text-primary-foreground/70 hover:text-primary-foreground"
														: "text-muted-foreground hover:bg-muted",
												)}
												aria-label={isExpanded ? "Collapse" : "Expand"}
											>
												<ChevronDown
													className={cn(
														"size-3.5 transition-transform duration-200",
														isExpanded || isChildActive ? "rotate-180" : "",
													)}
												/>
											</button>
										)}
									</div>

									{hasChildren && (isExpanded || isChildActive) && (
										<div className="ml-4 mt-0.5 border-l-2 border-primary/20 pl-2 space-y-0.5 pb-1">
											{children.map((child) => (
												<button
													key={child.id}
													onClick={() => {
														updateFilters({ category: child.id });
														onCategorySelect?.();
													}}
													className={cn(
														"w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
														categoryFilter === child.id
															? "bg-primary text-primary-foreground"
															: "text-muted-foreground hover:bg-muted hover:text-foreground",
													)}
												>
													<ChildCategoryFilterImage child={child} />
													<span className="truncate">{child.name}</span>
												</button>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			<Separator />

			{/* Price Range */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Price Range</h3>
				<div className="flex gap-2">
					<input
						type="number"
						placeholder="Min"
						defaultValue={minPrice}
						onBlur={(e) => updateFilters({ minPrice: e.target.value })}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								updateFilters({
									minPrice: (e.target as HTMLInputElement).value,
								});
							}
						}}
						className="w-full px-3 py-2 rounded-md border bg-background text-sm"
					/>
					<input
						type="number"
						placeholder="Max"
						defaultValue={maxPrice}
						onBlur={(e) => updateFilters({ maxPrice: e.target.value })}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								updateFilters({
									maxPrice: (e.target as HTMLInputElement).value,
								});
							}
						}}
						className="w-full px-3 py-2 rounded-md border bg-background text-sm"
					/>
				</div>
			</div>

			<Separator />

			{/* Availability */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Availability</h3>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={inStockOnly}
						onChange={(e) =>
							updateFilters({ inStock: e.target.checked ? "true" : "" })
						}
						className="rounded border-input text-primary focus:ring-primary"
					/>
					<span className="text-sm">In Stock Only</span>
				</label>
			</div>
		</>
	);

	return (
		<div className="container py-6 md:py-8">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold font-serif mb-2">Shop</h1>
				<p className="text-muted-foreground">
					{isProductsLoading ? (
						"Loading products..."
					) : (
						<>
							Browse our collection of {totalCount} organic product
							{totalCount !== 1 ? "s" : ""}
						</>
					)}
				</p>
			</div>

			<div className="grid lg:grid-cols-4 gap-8">
				{/* Sidebar Filters - Desktop */}
				<aside className="hidden lg:block space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-lg flex items-center gap-2">
							<SlidersHorizontal className="size-5" />
							Filters
						</h2>
						{activeFiltersCount > 0 && (
							<Button variant="ghost" size="sm" onClick={clearFilters}>
								Clear All
							</Button>
						)}
					</div>

					<Separator />

					<FilterContent />
				</aside>

				{/* Main Content */}
				<div className="lg:col-span-3 space-y-6">
					{/* Toolbar */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="lg:hidden"
								onClick={() => setShowFilters(true)}
							>
								<Filter className="size-4 mr-2" />
								Filters
								{activeFiltersCount > 0 && (
									<Badge variant="secondary" className="ml-2">
										{activeFiltersCount}
									</Badge>
								)}
							</Button>

							{isFetching && !isProductsLoading && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Loader2 className="size-4 animate-spin" />
									<span className="hidden sm:inline">Updating...</span>
								</div>
							)}
						</div>

						<div className="flex items-center gap-2 w-full sm:w-auto">
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								Sort by:
							</span>
							<select
								value={sortBy}
								onChange={(e) => updateFilters({ sort: e.target.value })}
								className="flex-1 sm:flex-none px-3 py-2 rounded-md border bg-background text-sm"
							>
								{SORT_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Mobile Filters Drawer */}
					<Sheet open={showFilters} onOpenChange={setShowFilters}>
						<SheetContent
							side="left"
							className="w-full sm:max-w-md flex flex-col h-full"
						>
							<SheetHeader>
								<SheetTitle className="flex items-center gap-2">
									<SlidersHorizontal className="size-5" />
									Filters
								</SheetTitle>
							</SheetHeader>

							<div className="flex-1 overflow-y-auto py-6 space-y-6">
								<FilterContent onCategorySelect={() => setShowFilters(false)} />

								{activeFiltersCount > 0 && (
									<>
										<Separator />
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												clearFilters();
												setShowFilters(false);
											}}
											className="w-full"
										>
											Clear All Filters
										</Button>
									</>
								)}
							</div>
						</SheetContent>
					</Sheet>

					{/* Active Filters */}
					{activeFiltersCount > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm text-muted-foreground">
								Active filters:
							</span>
							{searchQuery && (
								<Badge variant="secondary" className="gap-1">
									Search: {searchQuery}
									<button onClick={() => updateFilters({ search: "" })}>
										<X className="size-3" />
									</button>
								</Badge>
							)}
							{categoryFilter && (
								<Badge variant="secondary" className="gap-1">
									{findCategoryName(categoryFilter)}
									<button onClick={() => updateFilters({ category: "" })}>
										<X className="size-3" />
									</button>
								</Badge>
							)}
							{minPrice && (
								<Badge variant="secondary" className="gap-1">
									Min: ৳{minPrice}
									<button onClick={() => updateFilters({ minPrice: "" })}>
										<X className="size-3" />
									</button>
								</Badge>
							)}
							{maxPrice && (
								<Badge variant="secondary" className="gap-1">
									Max: ৳{maxPrice}
									<button onClick={() => updateFilters({ maxPrice: "" })}>
										<X className="size-3" />
									</button>
								</Badge>
							)}
							{inStockOnly && (
								<Badge variant="secondary" className="gap-1">
									In Stock
									<button onClick={() => updateFilters({ inStock: "" })}>
										<X className="size-3" />
									</button>
								</Badge>
							)}
						</div>
					)}

					{/* Products Grid */}
					{isProductsLoading ? (
						<ProductGridSkeleton count={pageSize} />
					) : products.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{products.map((product) => (
									<ProductItem
										key={product.id}
										product={product}
										onQuickView={handleQuickView}
									/>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
									<p className="text-sm text-muted-foreground order-2 sm:order-1">
										Showing {(page - 1) * pageSize + 1} -{" "}
										{Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
										products
									</p>

									<div className="flex items-center gap-2 order-1 sm:order-2">
										<Button
											variant="outline"
											size="sm"
											disabled={page <= 1 || isFetching}
											onClick={() => handlePageChange(page - 1)}
										>
											<ChevronLeft className="size-4 mr-1" />
											Previous
										</Button>

										<div className="hidden sm:flex items-center gap-1">
											{Array.from({ length: totalPages }, (_, i) => i + 1)
												.filter((p) => {
													// Show first, last, and pages around current
													if (p === 1 || p === totalPages) return true;
													if (Math.abs(p - page) <= 1) return true;
													return false;
												})
												.map((p, idx, arr) => {
													// Add ellipsis
													const showEllipsisBefore =
														idx > 0 && arr[idx - 1] !== p - 1;

													return (
														<span key={p} className="flex items-center gap-1">
															{showEllipsisBefore && (
																<span className="px-2 text-muted-foreground">
																	...
																</span>
															)}
															<Button
																variant={page === p ? "default" : "outline"}
																size="sm"
																className="w-9"
																disabled={isFetching}
																onClick={() => handlePageChange(p)}
															>
																{p}
															</Button>
														</span>
													);
												})}
										</div>

										<span className="sm:hidden text-sm text-muted-foreground">
											{page} / {totalPages}
										</span>

										<Button
											variant="outline"
											size="sm"
											disabled={page >= totalPages || isFetching}
											onClick={() => handlePageChange(page + 1)}
										>
											Next
											<ChevronRight className="size-4 ml-1" />
										</Button>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-20">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<Filter className="size-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold mb-2">No products found</h3>
							<p className="text-muted-foreground mb-6">
								Try adjusting your filters to find what you&apos;re looking for.
							</p>
							<Button onClick={clearFilters}>Clear Filters</Button>
						</div>
					)}
				</div>
			</div>

			<QuickViewModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				product={selectedProduct}
			/>
		</div>
	);
}
