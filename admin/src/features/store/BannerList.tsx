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
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getBanners,
	useDeleteBanner,
	type BannerFilter,
	type BannerListItem,
} from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { BannerFilterForm } from "./components/BannerFilterForm";
import { BannerFormModal } from "./components/BannerFormModal";

const initialParams: BannerFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function BannerList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedBanner, setSelectedBanner] = useState<BannerListItem | null>(
		null
	);

	const { data, isLoading, error } = useQuery(
		getBanners({
			...params,
			search: searchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const deleteMutation = useDeleteBanner();

	const handleEdit = (banner: BannerListItem) => {
		setSelectedBanner(banner);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (banner: BannerListItem) => {
		if (!confirm(`Are you sure you want to delete "${banner.title}"?`)) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(banner.id);
			toast.success("Banner deleted successfully");
		} catch (error) {
			toast.error("Failed to delete banner");
			console.error("Delete error:", error);
		}
	};

	const getStatusBadgeVariant = (isActive: boolean) => {
		return isActive ? "default" : "secondary";
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		return format(new Date(dateString), "MMM d, yyyy");
	};

	const columns: Column<BannerListItem>[] = [
		{
			key: "image",
			header: "Image",
			render: (banner) => (
				<img
					src={banner.image}
					alt={banner.title}
					className="h-12 w-20 rounded object-cover"
				/>
			),
			className: "w-[100px]",
		},
		{
			key: "title",
			header: "Title",
			render: (banner) => <div className="font-medium">{banner.title}</div>,
		},
		{
			key: "dates",
			header: "Schedule",
			render: (banner) => (
				<div className="text-sm text-muted-foreground">
					<div>Start: {formatDate(banner.start_date)}</div>
					<div>End: {formatDate(banner.end_date)}</div>
				</div>
			),
		},
		{
			key: "display_order",
			header: "Order",
			render: (banner) => <span>{banner.display_order}</span>,
			className: "text-center",
		},
		{
			key: "is_active",
			header: "Status",
			render: (banner) => (
				<Badge variant={getStatusBadgeVariant(banner.is_active)}>
					{banner.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			render: (banner) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(banner)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(banner)}
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

	const handleApplyFilters = (filter: BannerFilter) => {
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
	const banners = data?.results || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Banners</h1>
					<p className="text-muted-foreground">
						Manage your promotional banners
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedBanner(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Banner
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search banners by title..."
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					<BannerFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			<AppTable
				data={banners}
				columns={columns}
				emptyMessage={
					isLoading
						? "Loading banners..."
						: error
							? "Error loading banners"
							: "No banners found"
				}
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			<BannerFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				banner={selectedBanner}
				mode={modalMode}
			/>
		</div>
	);
}
