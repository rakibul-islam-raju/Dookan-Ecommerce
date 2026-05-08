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
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getBanners,
	useDeleteBanner,
	type BannerFilter,
	type BannerListItem,
} from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
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
	const t = useT();
	const { locale } = useLocale();
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
		if (
			!confirm(
				t(
					"store.banners.deleteConfirm",
					'Are you sure you want to delete "{title}"?',
					{ title: banner.title },
				),
			)
		) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(banner.id);
			toast.success(
				t("store.banners.toast.deleteSuccess", "Banner deleted successfully"),
			);
		} catch (error) {
			toast.error(
				t("store.banners.toast.deleteFailed", "Failed to delete banner"),
			);
			console.error("Delete error:", error);
		}
	};

	const getStatusBadgeVariant = (isActive: boolean) => {
		return isActive ? "default" : "secondary";
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return t("store.common.empty", "-");
		return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(new Date(dateString));
	};

	const columns: Column<BannerListItem>[] = [
		{
			key: "image",
			header: t("store.banners.table.image", "Image"),
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
			header: t("store.banners.table.title", "Title"),
			render: (banner) => <div className="font-medium">{banner.title}</div>,
		},
		{
			key: "dates",
			header: t("store.banners.table.schedule", "Schedule"),
			render: (banner) => (
				<div className="text-sm text-muted-foreground">
					<div>
						{t("store.common.start", "Start")}: {formatDate(banner.start_date)}
					</div>
					<div>
						{t("store.common.end", "End")}: {formatDate(banner.end_date)}
					</div>
				</div>
			),
		},
		{
			key: "display_order",
			header: t("store.banners.table.order", "Order"),
			render: (banner) => <span>{banner.display_order}</span>,
			className: "text-center",
		},
		{
			key: "is_active",
			header: t("store.banners.table.status", "Status"),
			render: (banner) => (
				<Badge variant={getStatusBadgeVariant(banner.is_active)}>
					{banner.is_active
						? t("store.common.status.active", "Active")
						: t("store.common.status.inactive", "Inactive")}
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
						<DropdownMenuLabel>
							<T id="store.common.actions" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(banner)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="store.common.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(banner)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="store.common.delete" defaultMessage="Delete" />
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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="store.banners.title" defaultMessage="Banners" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="store.banners.description"
							defaultMessage="Manage your promotional banners"
						/>
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
					<T id="store.banners.add" defaultMessage="Add Banner" />
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t(
						"store.banners.searchPlaceholder",
						"Search banners by title...",
					)}
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
					title={t("store.banners.filter.title", "Filters")}
					description={t(
						"store.banners.filter.description",
						"Apply filters to refine your banner list",
					)}
				>
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
						? t("store.banners.loading", "Loading banners...")
						: error
							? t("store.banners.error", "Error loading banners")
							: t("store.banners.empty", "No banners found")
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
