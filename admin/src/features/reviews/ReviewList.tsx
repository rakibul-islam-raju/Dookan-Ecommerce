import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
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
	const t = useT();
	const { locale } = useLocale();
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
			toast.success(t("reviews.list.toast.approved", "Review approved"));
		} catch {
			toast.error(t("reviews.list.toast.approveFailed", "Failed to approve review"));
		}
	};

	const handleReject = async (review: ReviewListItem) => {
		try {
			await statusMutation.mutateAsync({
				id: review.id,
				is_approved: false,
			});
			toast.success(t("reviews.list.toast.rejected", "Review rejected"));
		} catch {
			toast.error(t("reviews.list.toast.rejectFailed", "Failed to reject review"));
		}
	};

	const handleDelete = async (review: ReviewListItem) => {
		if (!confirm(t("reviews.list.deleteConfirm", "Are you sure you want to delete this review?")))
			return;
		try {
			await deleteMutation.mutateAsync(review.id);
			toast.success(t("reviews.list.toast.deleted", "Review deleted"));
		} catch {
			toast.error(t("reviews.list.toast.deleteFailed", "Failed to delete review"));
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
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
			header: t("reviews.list.table.product", "Product"),
			render: (review) => (
				<div className="font-medium max-w-[200px] truncate">
					{review.product_name}
				</div>
			),
		},
		{
			key: "user",
			header: t("reviews.list.table.customer", "Customer"),
			render: (review) => (
				<span className="text-muted-foreground">
					{review.user.first_name} {review.user.last_name}
				</span>
			),
		},
		{
			key: "rating",
			header: t("reviews.list.table.rating", "Rating"),
			render: (review) => renderStars(review.rating),
		},
		{
			key: "comment",
			header: t("reviews.list.table.review", "Review"),
			render: (review) => (
				<div className="max-w-[300px]">
					{review.title && (
						<div className="font-medium text-sm truncate">
							{review.title}
						</div>
					)}
					<div className="text-muted-foreground text-sm truncate">
						{review.comment || t("reviews.list.table.empty", "-")}
					</div>
				</div>
			),
		},
		{
			key: "is_approved",
			header: t("reviews.list.table.status", "Status"),
			render: (review) => (
				<Badge
					variant={review.is_approved ? "success" : "warning"}
				>
					{review.is_approved
						? t("reviews.list.status.approved", "Approved")
						: t("reviews.list.status.pending", "Pending")}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: t("reviews.list.table.date", "Date"),
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
						<DropdownMenuLabel>
							<T id="reviews.list.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{!review.is_approved ? (
							<DropdownMenuItem
								onClick={() => handleApprove(review)}
								disabled={statusMutation.isPending}
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								<T id="reviews.list.actions.approve" defaultMessage="Approve" />
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => handleReject(review)}
								disabled={statusMutation.isPending}
							>
								<XCircle className="h-4 w-4 mr-2" />
								<T id="reviews.list.actions.reject" defaultMessage="Reject" />
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => handleDelete(review)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="reviews.list.actions.delete" defaultMessage="Delete" />
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
						<T id="reviews.list.title" defaultMessage="Reviews" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="reviews.list.description"
							defaultMessage="Moderate customer product reviews"
						/>
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t(
						"reviews.list.searchPlaceholder",
						"Search by product, customer, or review content...",
					)}
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
					title={t("reviews.filter.title", "Filters")}
					description={t(
						"reviews.filter.description",
						"Apply filters to refine the review list",
					)}
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
				emptyMessage={t("reviews.list.empty", "No reviews found")}
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
