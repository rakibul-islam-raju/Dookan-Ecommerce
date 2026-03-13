"use client";

import { useProductSearch } from "@/lib/hooks/useProducts";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface SearchDropdownProps {
	searchQuery: string;
	isOpen: boolean;
	onClose: () => void;
	onNavigate: () => void;
}

export function SearchDropdown({
	searchQuery,
	isOpen,
	onClose,
	onNavigate,
}: SearchDropdownProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch search results with max 10 items and fresh data
	const { data, isLoading } = useProductSearch(searchQuery, {
		page_size: 10,
	});

	const products = data?.results || [];

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen || !searchQuery) {
		return null;
	}

	return (
		<div
			ref={dropdownRef}
			className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50"
		>
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : products.length > 0 ? (
				<>
					<div className="p-2 space-y-1">
						{products.map((product) => (
							<Link
								key={product.id}
								href={`/products/${product.slug}`}
								onClick={() => {
									onClose();
									onNavigate();
								}}
								className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
							>
								<div className="relative size-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
									{product.primary_image ? (
										<Image
											src={product.primary_image}
											alt={product.name}
											fill
											className="object-cover"
											unoptimized
										/>
									) : (
										<div className="size-full flex items-center justify-center">
											<ShoppingBag className="size-6 text-muted-foreground" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{product.name}</p>
									<p className="text-xs text-muted-foreground">
										{product.category.name}
									</p>
								</div>
								<div className="flex-shrink-0">
									<p className="text-sm font-semibold">৳{product.price}</p>
									{product.compare_at_price && (
										<p className="text-xs text-muted-foreground line-through">
											৳{product.compare_at_price}
										</p>
									)}
								</div>
							</Link>
						))}
					</div>
					<div className="border-t p-2">
						<Link
							href={`/shop?search=${encodeURIComponent(searchQuery)}`}
							onClick={() => {
								onClose();
								onNavigate();
							}}
							className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
						>
							<Search className="size-4" />
							View all results for &quot;{searchQuery}&quot;
						</Link>
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center py-8 px-4">
					<div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
						<Search className="size-6 text-muted-foreground" />
					</div>
					<p className="text-sm font-medium mb-1">No products found</p>
					<p className="text-xs text-muted-foreground text-center">
						Try searching with different keywords
					</p>
				</div>
			)}
		</div>
	);
}
