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
import { useMemo, useState } from "react";

export const CategoryDrawer = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: categoriesData, isLoading } = useCategories();
	const categories = categoriesData?.results || [];

	const topLevelCategories = useMemo(
		() => categories.filter((c) => !c.parent),
		[categories],
	);

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
				<div className="flex flex-col gap-2 p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : topLevelCategories.length > 0 ? (
						topLevelCategories.map((category) => (
							<div key={category.id}>
								<Link
									href={`/shop?category=${category.id}`}
									className="text-lg font-medium hover:text-primary transition-colors py-2 block border-b"
									onClick={() => setIsOpen(false)}
								>
									{category.name}
								</Link>
								{category.children && category.children.length > 0 && (
									<div className="pl-4 flex flex-col gap-1 py-1">
										{category.children.map((child) => (
											<Link
												key={child.id}
												href={`/shop?category=${child.id}`}
												className="text-sm text-muted-foreground hover:text-primary transition-colors py-1.5"
												onClick={() => setIsOpen(false)}
											>
												{child.name}
											</Link>
										))}
									</div>
								)}
							</div>
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
