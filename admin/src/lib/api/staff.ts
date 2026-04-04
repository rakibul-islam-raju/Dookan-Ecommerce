import type { StaffMember } from "@/@types/User.type";
import type { ICommonFilter, IPaginatedResponse } from "@/@types/Common.type";
import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "./axios";

export interface StaffFilter extends ICommonFilter {
	search?: string;
}

export interface StaffCreateData {
	first_name: string;
	last_name: string;
	email: string;
	mobile_number: string;
	role?: string | null;
}

export interface StaffUpdateData {
	first_name?: string;
	last_name?: string;
	email?: string;
	mobile_number?: string;
	role?: string | null;
	is_active?: boolean;
}

export const staffApi = {
	async list(params: StaffFilter): Promise<IPaginatedResponse<StaffMember>> {
		const { data } = await clientApi.get<IPaginatedResponse<StaffMember>>(
			"/users/staff/",
			{ params }
		);
		return data;
	},

	async get(id: string): Promise<StaffMember> {
		const { data } = await clientApi.get<StaffMember>(`/users/staff/${id}/`);
		return data;
	},

	async create(staffData: StaffCreateData): Promise<StaffMember> {
		const { data } = await clientApi.post<StaffMember>(
			"/users/staff/",
			staffData
		);
		return data;
	},

	async update(id: string, updateData: StaffUpdateData): Promise<StaffMember> {
		const { data } = await clientApi.patch<StaffMember>(
			`/users/staff/${id}/`,
			updateData
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/users/staff/${id}/`);
	},
};

export const getStaff = (params: StaffFilter) =>
	queryOptions({
		queryKey: [queryKeys.staff, { params }],
		queryFn: async () => staffApi.list(params),
	});

export const useCreateStaff = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: StaffCreateData) => staffApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.staff] });
		},
	});
};

export const useUpdateStaff = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, updateData }: { id: string; updateData: StaffUpdateData }) =>
			staffApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.staff] });
		},
	});
};

export const useDeleteStaff = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => staffApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.staff] });
		},
	});
};
