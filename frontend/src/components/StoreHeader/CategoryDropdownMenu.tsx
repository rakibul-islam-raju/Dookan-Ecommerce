"use client";

import type { ICategory, ICategoryChild } from "@/@types/Category";
import { Link } from "@/i18n/navigation";
import { useCategories } from "@/lib/hooks/useCategories";
import { ChevronDown, LayoutGrid, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const CategoryImage = ({ category }: { category: ICategory }) => (
	<div className="size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
		{category.image ? (
			<Image
				src={category.image}
				alt={category.name}
				width={32}
				height={32}
				unoptimized
				className="object-cover size-full"
			/>
		) : (
			<span className="text-xs font-semibold uppercase">
				{category.name.charAt(0)}
			</span>
		)}
	</div>
);

const ChildCategoryImage = ({ child }: { child: ICategoryChild }) => (
	<div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
		{child.image ? (
			<Image
				src={child.image}
				alt={child.name}
				width={24}
				height={24}
				unoptimized
				className="object-cover size-full"
			/>
		) : (
			<span className="text-[10px] font-semibold uppercase">
				{child.name.charAt(0)}
			</span>
		)}
	</div>
);

export const CategoryDropdownMenu = () => {
	const t = useTranslations("header");
	const { data: categoriesData, isLoading } = useCategories();

	const topLevelCategories = useMemo(
		() => (categoriesData?.results || []).filter((c) => !c.parent),
		[categoriesData],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="gap-2 font-medium text-muted-foreground hover:text-primary hover:bg-transparent px-2"
				>
					<LayoutGrid className="size-4" />
					<span>{t("categories")}</span>
					<ChevronDown className="size-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60 p-2" align="start">
				<DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
					{t("browseByCategory")}
				</DropdownMenuLabel>
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : topLevelCategories.length > 0 ? (
					<>
						{topLevelCategories.map((category) => {
							const children = category.children || [];
							if (children.length > 0) {
								return (
									<DropdownMenuSub key={category.id}>
										<DropdownMenuSubTrigger className="flex items-center gap-3 p-2 cursor-pointer rounded-md">
											<CategoryImage category={category} />
											<div className="flex flex-col min-w-0">
												<span className="font-medium leading-none truncate">
													{category.name}
												</span>
												<span className="text-[11px] text-muted-foreground mt-0.5">
													{t("subcategories", {
														count: children.length,
													})}
												</span>
											</div>
										</DropdownMenuSubTrigger>
										<DropdownMenuSubContent className="w-56 p-2">
											<DropdownMenuItem asChild>
												<Link
													href={`/shop?category=${category.id}`}
													className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-md"
												>
													<div className="size-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
														<LayoutGrid className="size-3 text-primary" />
													</div>
													<span className="text-sm font-medium">
														{t("allProducts")} {category.name}
													</span>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator className="my-1" />
											{children.map((child) => (
												<DropdownMenuItem key={child.id} asChild>
													<Link
														href={`/shop?category=${child.id}`}
														className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-md"
													>
														<ChildCategoryImage child={child} />
														<span className="text-sm">{child.name}</span>
													</Link>
												</DropdownMenuItem>
											))}
										</DropdownMenuSubContent>
									</DropdownMenuSub>
								);
							}

							return (
								<DropdownMenuItem key={category.id} asChild>
									<Link
										href={`/shop?category=${category.id}`}
										className="flex items-center gap-3 p-2 cursor-pointer rounded-md focus:bg-accent focus:text-accent-foreground"
									>
										<CategoryImage category={category} />
										<div className="flex flex-col min-w-0">
											<span className="font-medium leading-none truncate">
												{category.name}
											</span>
										</div>
									</Link>
								</DropdownMenuItem>
							);
						})}
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuItem asChild>
							<Link
								href="/shop"
								className="w-full text-center font-medium text-primary justify-center"
							>
								{t("viewAllProducts")}
							</Link>
						</DropdownMenuItem>
					</>
				) : (
					<p className="text-sm text-muted-foreground text-center py-4">
						{t("noCategories")}
					</p>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
