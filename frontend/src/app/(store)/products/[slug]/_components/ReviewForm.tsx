"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCreateReview } from "@/lib/hooks/useReviews";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
	productId: string;
}

export const ReviewForm = ({ productId }: ReviewFormProps) => {
	const { isAuthenticated } = useAuthStore();
	const createReview = useCreateReview();

	const [rating, setRating] = useState(0);
	const [title, setTitle] = useState("");
	const [comment, setComment] = useState("");

	if (!isAuthenticated) {
		return (
			<div className="bg-muted/30 rounded-xl p-6 text-center">
				<p className="text-muted-foreground mb-3">
					Please log in to leave a review
				</p>
				<Link href="/login">
					<Button variant="outline" size="sm">
						Log In
					</Button>
				</Link>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (rating === 0) {
			toast.error("Please select a rating");
			return;
		}

		try {
			await createReview.mutateAsync({
				product: productId,
				rating,
				title: title.trim() || undefined,
				comment: comment.trim() || undefined,
			});
			toast.success(
				"Review submitted! It will appear after admin approval."
			);
			setRating(0);
			setTitle("");
			setComment("");
		} catch {
			// Error is handled by the axios interceptor
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="text-sm font-medium block mb-2">
					Your Rating
				</label>
				<StarRating
					rating={rating}
					size="lg"
					interactive
					onChange={setRating}
				/>
			</div>

			<div>
				<label htmlFor="review-title" className="text-sm font-medium block mb-1.5">
					Title (optional)
				</label>
				<input
					id="review-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Summarize your experience"
					maxLength={200}
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div>
				<label htmlFor="review-comment" className="text-sm font-medium block mb-1.5">
					Review (optional)
				</label>
				<textarea
					id="review-comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Share your thoughts about this product..."
					rows={4}
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
				/>
			</div>

			<Button
				type="submit"
				disabled={rating === 0 || createReview.isPending}
			>
				{createReview.isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Submitting...
					</>
				) : (
					"Submit Review"
				)}
			</Button>
		</form>
	);
};
