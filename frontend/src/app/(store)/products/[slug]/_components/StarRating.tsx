"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
	rating: number;
	size?: "sm" | "md" | "lg";
	interactive?: boolean;
	onChange?: (rating: number) => void;
}

const sizeClasses = {
	sm: "h-3.5 w-3.5",
	md: "h-5 w-5",
	lg: "h-6 w-6",
};

export const StarRating = ({
	rating,
	size = "md",
	interactive = false,
	onChange,
}: StarRatingProps) => {
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }, (_, i) => (
				<button
					key={i}
					type="button"
					disabled={!interactive}
					onClick={() => interactive && onChange?.(i + 1)}
					className={cn(
						"p-0 border-0 bg-transparent",
						interactive
							? "cursor-pointer hover:scale-110 transition-transform"
							: "cursor-default"
					)}
				>
					<Star
						className={cn(
							sizeClasses[size],
							i < rating
								? "fill-yellow-400 text-yellow-400"
								: "text-muted-foreground/30"
						)}
					/>
				</button>
			))}
		</div>
	);
};
