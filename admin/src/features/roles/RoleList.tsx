import { AppTable, type Column } from "@/components/common/AppTable";
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
import {
	getRoles,
	useDeleteRole,
} from "@/lib/api/role";
import type { Role } from "@/@types/User.type";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { RoleFormModal } from "./components/RoleFormModal";

export function RoleList() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editRole, setEditRole] = useState<Role | null>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");

	const { data: roles, isFetching } = useQuery(getRoles());
	const deleteMutation = useDeleteRole();

	const handleCreate = () => {
		setEditRole(null);
		setModalMode("create");
		setIsModalOpen(true);
	};

	const handleEdit = (role: Role) => {
		setEditRole(role);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (role: Role) => {
		if (role.user_count > 0) {
			toast.error(
				`Cannot delete role "${role.name}" - it is assigned to ${role.user_count} staff member(s)`
			);
			return;
		}
		if (!confirm(`Are you sure you want to delete "${role.name}"?`)) {
			return;
		}
		try {
			await deleteMutation.mutateAsync(role.id);
			toast.success("Role deleted successfully");
		} catch {
			toast.error("Failed to delete role");
		}
	};

	const columns: Column<Role>[] = [
		{
			key: "name",
			header: "Name",
			render: (role) => (
				<div className="font-medium">{role.name}</div>
			),
		},
		{
			key: "description",
			header: "Description",
			render: (role) => (
				<span className="text-muted-foreground">
					{role.description || "-"}
				</span>
			),
		},
		{
			key: "permissions",
			header: "Permissions",
			render: (role) => (
				<Badge variant="secondary">
					{role.permissions.length} permission
					{role.permissions.length !== 1 ? "s" : ""}
				</Badge>
			),
		},
		{
			key: "user_count",
			header: "Staff",
			render: (role) => (
				<span className="text-muted-foreground">
					{role.user_count} member{role.user_count !== 1 ? "s" : ""}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			render: (role) => (
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
						<DropdownMenuItem onClick={() => handleEdit(role)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(role)}
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Roles</h1>
					<p className="text-muted-foreground">
						Manage roles and their permissions
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="h-4 w-4 mr-2" />
					Create Role
				</Button>
			</div>

			<AppTable
				data={roles || []}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No roles created yet"
			/>

			<RoleFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				role={editRole}
				mode={modalMode}
			/>
		</div>
	);
}
