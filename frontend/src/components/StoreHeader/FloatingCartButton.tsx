"use client";

import { useCart } from "@/lib/hooks/useCart";
import { ShoppingCart } from "lucide-react";

interface FloatingCartButtonProps {
	onOpenCart: () => void;
}

export const FloatingCartButton = ({ onOpenCart }: FloatingCartButtonProps) => {
	const { data: cart } = useCart();
	const totalItems = cart?.total_items || 0;

	if (totalItems === 0) return null;

	return (
		<div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
			<div className="relative group">
				<button
					onClick={onOpenCart}
					className="flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
					aria-label={`View shopping cart with ${totalItems} items`}
				>
					<ShoppingCart className="size-5" />
					<span className="font-medium">
						{totalItems} {totalItems === 1 ? "item" : "items"}
					</span>
				</button>
			</div>
		</div>
	);
};
