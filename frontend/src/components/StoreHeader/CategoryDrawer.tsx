"use client";

import type { ICategory, ICategoryChild } from "@/@types/Category";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCategories } from "@/lib/hooks/useCategories";
import { ChevronDown, LayoutGrid, Loader2, Menu } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const ParentCategoryImage = ({ category }: { category: ICategory }) => (
	<div className="size-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
		{category.image ? (
			<Image
				src={category.image}
				alt={category.name}
				width={36}
				height={36}
				unoptimized
				className="object-cover size-full"
			/>
		) : (
			<span className="text-sm font-semibold uppercase">
				{category.name.charAt(0)}
			</span>
		)}
	</div>
);

const ChildCategoryImage = ({ child }: { child: ICategoryChild }) => (
	<div className="size-7 rounded bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
		{child.image ? (
			<Image
				src={child.image}
				alt={child.name}
				width={28}
				height={28}
				unoptimized
				className="object-cover size-full"
			/>
		) : (
			<span className="text-xs font-semibold uppercase">
				{child.name.charAt(0)}
			</span>
		)}
	</div>
);

export const CategoryDrawer = () => {
	const t = useTranslations("header");
	const [isOpen, setIsOpen] = useState(false);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const { data: categoriesData, isLoading } = useCategories();

	const topLevelCategories = useMemo(
		() => (categoriesData?.results || []).filter((c) => !c.parent),
		[categoriesData],
	);

	const toggleExpanded = (id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="lg:hidden">
					<Menu className="h-6 w-6" />
					<span className="sr-only">{t("categories")}</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col">
				<SheetHeader className="px-4 pt-5 pb-3 border-b">
					<SheetTitle className="flex items-center gap-2">
						<LayoutGrid className="size-4" />
						{t("categories")}
					</SheetTitle>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : topLevelCategories.length > 0 ? (
						<div className="py-2">
							{topLevelCategories.map((category) => {
								const children = category.children || [];
								const hasChildren = children.length > 0;
								const isExpanded = expandedIds.has(category.id);

								return (
									<div key={category.id} className="border-b last:border-b-0">
										<div className="flex items-center">
											<Link
												href={`/shop?category=${category.id}`}
												className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors"
												onClick={() => setIsOpen(false)}
											>
												<ParentCategoryImage category={category} />
												<div className="flex flex-col min-w-0">
													<span className="font-medium text-sm leading-tight truncate">
														{category.name}
													</span>
													{hasChildren && (
														<span className="text-xs text-muted-foreground mt-0.5">
															{t("subcategories", {
																count: children.length,
															})}
														</span>
													)}
												</div>
											</Link>
											{hasChildren && (
												<button
													type="button"
													onClick={() => toggleExpanded(category.id)}
													className="px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors text-muted-foreground"
													aria-label={isExpanded ? "Collapse" : "Expand"}
												>
													<ChevronDown
														className={`size-4 transition-transform duration-200 ${
															isExpanded ? "rotate-180" : ""
														}`}
													/>
												</button>
											)}
										</div>

										{hasChildren && isExpanded && (
											<div className="bg-muted/30 border-l-2 border-primary/20 mx-4 mb-2 rounded-r-md overflow-hidden">
												<Link
													href={`/shop?category=${category.id}`}
													className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 active:bg-muted transition-colors"
													onClick={() => setIsOpen(false)}
												>
													<div className="size-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
														<LayoutGrid className="size-3.5 text-primary" />
													</div>
													<span className="text-sm font-medium text-primary">
														{t("allProducts")} {category.name}
													</span>
												</Link>
												{children.map((child) => (
													<Link
														key={child.id}
														href={`/shop?category=${child.id}`}
														className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 active:bg-muted transition-colors border-t border-border/50"
														onClick={() => setIsOpen(false)}
													>
														<ChildCategoryImage child={child} />
														<span className="text-sm text-foreground/80">
															{child.name}
														</span>
													</Link>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-sm text-muted-foreground text-center py-8">
							{t("noCategories")}
						</p>
					)}
				</div>

				<div className="p-4 border-t">
					<Link
						href="/shop"
						className="flex items-center justify-center w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
						onClick={() => setIsOpen(false)}
					>
						{t("viewAllProducts")}
					</Link>
				</div>
			</SheetContent>
		</Sheet>
	);
};
