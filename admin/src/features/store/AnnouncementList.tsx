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
	getAnnouncements,
	useDeleteAnnouncement,
	type AnnouncementFilter,
	type AnnouncementListItem,
} from "@/lib/api/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { AnnouncementFilterForm } from "./components/AnnouncementFilterForm";
import { AnnouncementFormModal } from "./components/AnnouncementFormModal";

const initialParams: AnnouncementFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function AnnouncementList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedAnnouncement, setSelectedAnnouncement] =
		useState<AnnouncementListItem | null>(null);

	const { data, isLoading, error } = useQuery(
		getAnnouncements({
			...params,
			search: searchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const deleteMutation = useDeleteAnnouncement();

	const handleEdit = (announcement: AnnouncementListItem) => {
		setSelectedAnnouncement(announcement);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (announcement: AnnouncementListItem) => {
		if (!confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(announcement.id);
			toast.success("Announcement deleted successfully");
		} catch (error) {
			toast.error("Failed to delete announcement");
			console.error("Delete error:", error);
		}
	};

	const getStatusBadgeVariant = (isActive: boolean) => {
		return isActive ? "default" : "secondary";
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "MMM d, yyyy h:mm a");
	};

	const columns: Column<AnnouncementListItem>[] = [
		{
			key: "title",
			header: "Title",
			render: (announcement) => (
				<div className="font-medium">{announcement.title}</div>
			),
		},
		{
			key: "description",
			header: "Description",
			render: (announcement) => (
				<span className="text-muted-foreground truncate max-w-xs block">
					{announcement.description.length > 100
						? `${announcement.description.slice(0, 100)}...`
						: announcement.description}
				</span>
			),
		},
		{
			key: "dates",
			header: "Schedule",
			render: (announcement) => (
				<div className="text-sm text-muted-foreground">
					<div>Start: {formatDate(announcement.start_date)}</div>
					<div>End: {formatDate(announcement.end_date)}</div>
				</div>
			),
		},
		{
			key: "is_active",
			header: "Status",
			render: (announcement) => (
				<Badge variant={getStatusBadgeVariant(announcement.is_active)}>
					{announcement.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "actions",
			header: "",
			render: (announcement) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(announcement)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(announcement)}
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

	const handleApplyFilters = (filter: AnnouncementFilter) => {
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
	const announcements = data?.results || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
					<p className="text-muted-foreground">
						Manage your store announcements
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedAnnouncement(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Announcement
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search announcements by title..."
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					<AnnouncementFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			<AppTable
				data={announcements}
				columns={columns}
				emptyMessage={
					isLoading
						? "Loading announcements..."
						: error
							? "Error loading announcements"
							: "No announcements found"
				}
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			<AnnouncementFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				announcement={selectedAnnouncement}
				mode={modalMode}
			/>
		</div>
	);
}
