import { AppTable, type Column } from "@/components/common/AppTable";
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
	getStaff,
	useDeleteStaff,
	useUpdateStaff,
	type StaffFilter,
} from "@/lib/api/staff";
import type { StaffMember } from "@/@types/User.type";
import { useQuery } from "@tanstack/react-query";
import {
	MoreHorizontal,
	Pencil,
	Plus,
	ShieldCheck,
	ShieldOff,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { StaffFormModal } from "./components/StaffFormModal";

const initialParams: StaffFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function StaffList() {
	const { params } = useFilterParams({ initialParams });
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");

	const debouncedSearchQuery = useDebouncedValue(searchQuery);

	const { data, isFetching } = useQuery(
		getStaff({
			...params,
			search: debouncedSearchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const deleteMutation = useDeleteStaff();
	const updateMutation = useUpdateStaff();

	const handleCreate = () => {
		setEditStaff(null);
		setModalMode("create");
		setIsModalOpen(true);
	};

	const handleEdit = (staff: StaffMember) => {
		setEditStaff(staff);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (staff: StaffMember) => {
		if (staff.is_superuser) {
			toast.error("Cannot delete a superuser account");
			return;
		}
		if (
			!confirm(
				`Are you sure you want to delete "${staff.first_name} ${staff.last_name}"?`
			)
		) {
			return;
		}
		try {
			await deleteMutation.mutateAsync(staff.id);
			toast.success("Staff member deleted successfully");
		} catch {
			toast.error("Failed to delete staff member");
		}
	};

	const handleToggleStatus = async (staff: StaffMember) => {
		const newStatus = !staff.is_active;
		const action = newStatus ? "activate" : "deactivate";
		if (
			!confirm(
				`Are you sure you want to ${action} "${staff.first_name} ${staff.last_name}"?`
			)
		) {
			return;
		}
		try {
			await updateMutation.mutateAsync({
				id: staff.id,
				updateData: { is_active: newStatus },
			});
			toast.success(
				`Staff member ${newStatus ? "activated" : "deactivated"} successfully`
			);
		} catch {
			toast.error("Failed to update staff member status");
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

	const columns: Column<StaffMember>[] = [
		{
			key: "name",
			header: "Name",
			render: (staff) => (
				<div className="font-medium">
					{staff.first_name} {staff.last_name}
				</div>
			),
		},
		{
			key: "email",
			header: "Email",
			render: (staff) => (
				<span className="text-muted-foreground">{staff.email}</span>
			),
		},
		{
			key: "role",
			header: "Role",
			render: (staff) => (
				<Badge variant={staff.is_superuser ? "default" : "secondary"}>
					{staff.is_superuser
						? "Superuser"
						: staff.role_name || "No Role"}
				</Badge>
			),
		},
		{
			key: "is_active",
			header: "Status",
			render: (staff) => (
				<Badge
					variant={staff.is_active ? "default" : "destructive"}
				>
					{staff.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: "Added",
			render: (staff) => (
				<span className="text-muted-foreground">
					{formatDate(staff.created_at)}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			render: (staff) => (
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
						<DropdownMenuItem onClick={() => handleEdit(staff)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleToggleStatus(staff)}
							disabled={updateMutation.isPending}
						>
							{staff.is_active ? (
								<>
									<ShieldOff className="h-4 w-4 mr-2" />
									Deactivate
								</>
							) : (
								<>
									<ShieldCheck className="h-4 w-4 mr-2" />
									Activate
								</>
							)}
						</DropdownMenuItem>
						{!staff.is_superuser && (
							<DropdownMenuItem
								onClick={() => handleDelete(staff)}
								className="text-destructive"
								disabled={deleteMutation.isPending}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const staffMembers = data?.results || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Staff</h1>
					<p className="text-muted-foreground">
						Manage staff members and their access
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="h-4 w-4 mr-2" />
					Add Staff
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search by email or name..."
					className="flex-1"
				/>
			</div>

			<AppTable
				data={staffMembers}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No staff members found"
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			<StaffFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				staff={editStaff}
				mode={modalMode}
			/>
		</div>
	);
}
