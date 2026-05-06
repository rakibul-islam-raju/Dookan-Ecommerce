import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	const t = useT();
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
				t(
					"roles.delete.blocked",
					'Cannot delete role "{name}" - it is assigned to {count} staff member(s)',
					{ name: role.name, count: role.user_count }
				)
			);
			return;
		}
		if (
			!confirm(
				t(
					"roles.delete.confirm",
					'Are you sure you want to delete "{name}"?',
					{ name: role.name }
				)
			)
		) {
			return;
		}
		try {
			await deleteMutation.mutateAsync(role.id);
			toast.success(t("roles.delete.success", "Role deleted successfully") as string);
		} catch {
			toast.error(t("roles.delete.failed", "Failed to delete role") as string);
		}
	};

	const columns: Column<Role>[] = [
		{
			key: "name",
			header: t("roles.table.name", "Name") as string,
			render: (role) => (
				<div className="font-medium">{role.name}</div>
			),
		},
		{
			key: "description",
			header: t("roles.table.description", "Description") as string,
			render: (role) => (
				<span className="text-muted-foreground">
					{role.description || "-"}
				</span>
			),
		},
		{
			key: "permissions",
			header: t("roles.table.permissions", "Permissions") as string,
			render: (role) => (
				<Badge variant="secondary">
					{t(
						"roles.table.permissionCount",
						"{count, plural, one {# permission} other {# permissions}}",
						{ count: role.permissions.length }
					)}
				</Badge>
			),
		},
		{
			key: "user_count",
			header: t("roles.table.staff", "Staff") as string,
			render: (role) => (
				<span className="text-muted-foreground">
					{t(
						"roles.table.memberCount",
						"{count, plural, one {# member} other {# members}}",
						{ count: role.user_count }
					)}
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
						<DropdownMenuLabel>
							<T id="roles.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(role)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="roles.actions.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(role)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="roles.actions.delete" defaultMessage="Delete" />
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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="roles.title" defaultMessage="Roles" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="roles.description"
							defaultMessage="Manage roles and their permissions"
						/>
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="h-4 w-4 mr-2" />
					<T id="roles.create" defaultMessage="Create Role" />
				</Button>
			</div>

			<AppTable
				data={roles || []}
				columns={columns}
				isLoading={isFetching}
				emptyMessage={t("roles.empty", "No roles created yet") as string}
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
