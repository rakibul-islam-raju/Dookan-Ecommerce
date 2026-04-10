import type { CustomerDetails, CustomerListItem } from "@/@types/User.type";
import type { ICommonFilter, IPaginatedResponse } from "@/@types/Common.type";
import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "./axios";

export interface CustomerFilter extends ICommonFilter {
	search?: string;
	is_active?: boolean;
	is_mobile_verified?: boolean;
}

export const customerApi = {
	async list(
		params: CustomerFilter
	): Promise<IPaginatedResponse<CustomerListItem>> {
		const { data } = await clientApi.get<
			IPaginatedResponse<CustomerListItem>
		>("/users/", { params });
		return data;
	},

	async getById(id: string): Promise<CustomerDetails> {
		const { data } = await clientApi.get<CustomerDetails>(`/users/${id}/`);
		return data;
	},

	async updateStatus(
		id: string,
		is_active: boolean
	): Promise<CustomerListItem> {
		const { data } = await clientApi.patch<CustomerListItem>(
			`/users/${id}/status/`,
			{ is_active }
		);
		return data;
	},
};

export const getCustomers = (params: CustomerFilter) =>
	queryOptions({
		queryKey: [queryKeys.customers, { params }],
		queryFn: async () => customerApi.list(params),
	});

export const getCustomerById = (id: string) =>
	queryOptions({
		queryKey: [queryKeys.customers, id],
		queryFn: async () => customerApi.getById(id),
	});

export const useUpdateCustomerStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
			customerApi.updateStatus(id, is_active),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.customers],
			});
		},
	});
};
