import type { Role, Permission } from "@/@types/User.type";
import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "./axios";

export interface RoleCreateData {
	name: string;
	description?: string;
	permissions: Permission[];
}

export type RoleUpdateData = Partial<RoleCreateData>;

export const roleApi = {
	async list(): Promise<Role[]> {
		const { data } = await clientApi.get<Role[]>("/users/roles/");
		return data;
	},

	async get(id: string): Promise<Role> {
		const { data } = await clientApi.get<Role>(`/users/roles/${id}/`);
		return data;
	},

	async create(roleData: RoleCreateData): Promise<Role> {
		const { data } = await clientApi.post<Role>("/users/roles/", roleData);
		return data;
	},

	async update(id: string, updateData: RoleUpdateData): Promise<Role> {
		const { data } = await clientApi.patch<Role>(
			`/users/roles/${id}/`,
			updateData
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/users/roles/${id}/`);
	},
};

export const getRoles = () =>
	queryOptions({
		queryKey: [queryKeys.roles],
		queryFn: async () => roleApi.list(),
	});

export const useCreateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: RoleCreateData) => roleApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.roles] });
		},
	});
};

export const useUpdateRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, updateData }: { id: string; updateData: RoleUpdateData }) =>
			roleApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.roles] });
		},
	});
};

export const useDeleteRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => roleApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.roles] });
		},
	});
};
