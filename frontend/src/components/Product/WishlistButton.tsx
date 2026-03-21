"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
	useToggleWishlist,
	useWishlistProductIds,
} from "@/lib/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
	productId: string;
	variant?: "icon" | "icon-outline";
	className?: string;
}

export function WishlistButton({
	productId,
	variant = "icon",
	className,
}: WishlistButtonProps) {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const { data: wishlistIds } = useWishlistProductIds();
	const toggleWishlist = useToggleWishlist();

	const isWishlisted = wishlistIds?.includes(productId) ?? false;

	const handleToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user) {
			router.push("/login");
			return;
		}

		toggleWishlist.mutate(productId);
	};

	if (variant === "icon-outline") {
		return (
			<Button
				size="lg"
				variant="outline"
				className={cn("h-12 w-12 p-0", className)}
				aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
				onClick={handleToggle}
				disabled={toggleWishlist.isPending}
			>
				<Heart
					className={cn(
						"size-5 transition-colors",
						isWishlisted && "fill-red-500 text-red-500"
					)}
				/>
			</Button>
		);
	}

	return (
		<Button
			variant="secondary"
			size="icon"
			className={cn(
				"rounded-full h-10 w-10 bg-white text-foreground hover:bg-white/90 hover:scale-110 transition-all shadow-md",
				isWishlisted && "text-red-500",
				className
			)}
			onClick={handleToggle}
			disabled={toggleWishlist.isPending}
			title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
		>
			<Heart
				className={cn(
					"h-5 w-5 transition-colors",
					isWishlisted && "fill-red-500 text-red-500"
				)}
			/>
		</Button>
	);
}
