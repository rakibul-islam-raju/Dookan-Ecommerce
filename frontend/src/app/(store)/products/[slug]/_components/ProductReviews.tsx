"use client";

import type { IProductReview, IReviewSummary } from "@/@types/Review";
import { Separator } from "@/components/ui/separator";
import { useProductReviews } from "@/lib/hooks/useReviews";
import { Loader2 } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "./StarRating";

interface ProductReviewsProps {
	productId: string;
	reviewSummary: IReviewSummary;
}

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
};

const ReviewItem = ({ review }: { review: IProductReview }) => (
	<div className="py-4">
		<div className="flex items-center gap-3 mb-2">
			<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
				{review.user.first_name.charAt(0)}
				{review.user.last_name.charAt(0)}
			</div>
			<div>
				<p className="text-sm font-medium">
					{review.user.first_name} {review.user.last_name}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDate(review.created_at)}
				</p>
			</div>
		</div>
		<StarRating rating={review.rating} size="sm" />
		{review.title && (
			<h4 className="font-medium mt-2">{review.title}</h4>
		)}
		{review.comment && (
			<p className="text-muted-foreground text-sm mt-1 leading-relaxed">
				{review.comment}
			</p>
		)}
	</div>
);

export const ProductReviews = ({
	productId,
	reviewSummary,
}: ProductReviewsProps) => {
	const { data, isLoading } = useProductReviews(productId);
	const reviews = data?.results || [];

	return (
		<div className="mt-12 space-y-6">
			<div className="bg-muted/30 rounded-xl p-6 space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">
						Customer Reviews
					</h3>
					{reviewSummary.review_count > 0 && (
						<div className="flex items-center gap-2">
							<StarRating
								rating={Math.round(
									reviewSummary.average_rating
								)}
								size="sm"
							/>
							<span className="text-sm text-muted-foreground">
								{reviewSummary.average_rating} out of 5 (
								{reviewSummary.review_count}{" "}
								{reviewSummary.review_count === 1
									? "review"
									: "reviews"}
								)
							</span>
						</div>
					)}
				</div>

				<Separator />

				{/* Review List */}
				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : reviews.length > 0 ? (
					<div className="divide-y">
						{reviews.map((review) => (
							<ReviewItem key={review.id} review={review} />
						))}
					</div>
				) : (
					<p className="text-center text-muted-foreground py-6">
						No reviews yet. Be the first to review this product!
					</p>
				)}

				<Separator />

				{/* Review Form */}
				<div>
					<h4 className="font-semibold mb-4">Write a Review</h4>
					<ReviewForm productId={productId} />
				</div>
			</div>
		</div>
	);
};
