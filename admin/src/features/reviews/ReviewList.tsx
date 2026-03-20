import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pagination } from "@/config";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getReviews,
	useDeleteReview,
	useUpdateReviewStatus,
	type ReviewFilter,
} from "@/lib/api/review";
import type { ReviewListItem } from "@/@types/Review";
import { useQuery } from "@tanstack/react-query";
import {
	CheckCircle,
	MoreHorizontal,
	Star,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { ReviewFilterForm } from "./components/ReviewFilterForm";

const initialParams: ReviewFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function ReviewList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const debouncedSearchQuery = useDebouncedValue(searchQuery);

	const { data, isFetching } = useQuery(
		getReviews({
			...params,
			search: debouncedSearchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const statusMutation = useUpdateReviewStatus();
	const deleteMutation = useDeleteReview();

	const handleApprove = async (review: ReviewListItem) => {
		try {
			await statusMutation.mutateAsync({
				id: review.id,
				is_approved: true,
			});
			toast.success("Review approved");
		} catch {
			toast.error("Failed to approve review");
		}
	};

	const handleReject = async (review: ReviewListItem) => {
		try {
			await statusMutation.mutateAsync({
				id: review.id,
				is_approved: false,
			});
			toast.success("Review rejected");
		} catch {
			toast.error("Failed to reject review");
		}
	};

	const handleDelete = async (review: ReviewListItem) => {
		if (!confirm("Are you sure you want to delete this review?")) return;
		try {
			await deleteMutation.mutateAsync(review.id);
			toast.success("Review deleted");
		} catch {
			toast.error("Failed to delete review");
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const renderStars = (rating: number) => (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={`h-3.5 w-3.5 ${
						i < rating
							? "fill-yellow-400 text-yellow-400"
							: "text-muted-foreground/30"
					}`}
				/>
			))}
		</div>
	);

	const columns: Column<ReviewListItem>[] = [
		{
			key: "product_name",
			header: "Product",
			render: (review) => (
				<div className="font-medium max-w-[200px] truncate">
					{review.product_name}
				</div>
			),
		},
		{
			key: "user",
			header: "Customer",
			render: (review) => (
				<span className="text-muted-foreground">
					{review.user.first_name} {review.user.last_name}
				</span>
			),
		},
		{
			key: "rating",
			header: "Rating",
			render: (review) => renderStars(review.rating),
		},
		{
			key: "comment",
			header: "Review",
			render: (review) => (
				<div className="max-w-[300px]">
					{review.title && (
						<div className="font-medium text-sm truncate">
							{review.title}
						</div>
					)}
					<div className="text-muted-foreground text-sm truncate">
						{review.comment || "-"}
					</div>
				</div>
			),
		},
		{
			key: "is_approved",
			header: "Status",
			render: (review) => (
				<Badge
					variant={review.is_approved ? "success" : "warning"}
				>
					{review.is_approved ? "Approved" : "Pending"}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: "Date",
			render: (review) => (
				<span className="text-muted-foreground">
					{formatDate(review.created_at)}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			render: (review) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{!review.is_approved ? (
							<DropdownMenuItem
								onClick={() => handleApprove(review)}
								disabled={statusMutation.isPending}
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Approve
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => handleReject(review)}
								disabled={statusMutation.isPending}
							>
								<XCircle className="h-4 w-4 mr-2" />
								Reject
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => handleDelete(review)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const handleApplyFilters = (filter: ReviewFilter) => {
		handleChangeParams({
			...filter,
			offset: 0,
		});
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		resetParams();
		setSearchQuery("");
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const reviews = data?.results || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Reviews
					</h1>
					<p className="text-muted-foreground">
						Moderate customer product reviews
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search by product, customer, or review content..."
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
				>
					<ReviewFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Reviews Table */}
			<AppTable
				data={reviews}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No reviews found"
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>
		</div>
	);
}
