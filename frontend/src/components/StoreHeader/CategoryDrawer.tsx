"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCategories } from "@/lib/hooks/useCategories";
import { Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const CategoryDrawer = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: categoriesData, isLoading } = useCategories();
	const categories = categoriesData?.results || [];

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="lg:hidden">
					<Menu className="h-6 w-6" />
					<span className="sr-only">Open categories</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<SheetHeader>
					<SheetTitle>Categories</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col gap-4 p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : categories.length > 0 ? (
						categories.map((category) => (
							<Link
								key={category.id}
								href={`/shop?category=${category.id}`}
								className="text-lg font-medium hover:text-primary transition-colors py-2 border-b last:border-0"
								onClick={() => setIsOpen(false)}
							>
								{category.name}
							</Link>
						))
					) : (
						<p className="text-sm text-muted-foreground text-center py-4">
							No categories available
						</p>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};
