"use client";

import type { ICategory } from "@/@types/Category";
import { useCategories } from "@/lib/hooks/useCategories";
import { ChevronDown, LayoutGrid, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
	<div className="size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
		{category.image ? (
			<Image
				src={category.image}
				alt={category.name}
				width={32}
				height={32}
				className="object-cover size-full"
			/>
		) : (
			category.name.charAt(0)
		)}
	</div>
);

export const CategoryDropdownMenu = () => {
	const { data: categoriesData, isLoading } = useCategories();
	const categories = categoriesData?.results || [];

	// Get only top-level categories (no parent)
	const topLevelCategories = useMemo(
		() => categories.filter((c) => !c.parent),
		[categories],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="gap-2 font-medium text-muted-foreground hover:text-primary hover:bg-transparent px-2"
				>
					<LayoutGrid className="size-4" />
					<span>Categories</span>
					<ChevronDown className="size-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 p-2" align="start">
				<DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
					Browse by Category
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
											<span className="font-medium leading-none">
												{category.name}
											</span>
										</DropdownMenuSubTrigger>
										<DropdownMenuSubContent className="w-48 p-1">
											<DropdownMenuItem asChild>
												<Link
													href={`/shop?category=${category.id}`}
													className="flex items-center gap-2 p-2 cursor-pointer"
												>
													All {category.name}
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											{children.map((child) => (
												<DropdownMenuItem key={child.id} asChild>
													<Link
														href={`/shop?category=${child.id}`}
														className="flex items-center gap-2 p-2 cursor-pointer"
													>
														{child.name}
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
										<div className="flex flex-col">
											<span className="font-medium leading-none">
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
								View All Products
							</Link>
						</DropdownMenuItem>
					</>
				) : (
					<p className="text-sm text-muted-foreground text-center py-4">
						No categories available
					</p>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
