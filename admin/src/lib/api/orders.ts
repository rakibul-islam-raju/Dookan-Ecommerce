/**
 * Orders API Service
 */

import type { ICommonFilter, IPaginatedResponse, IPagination } from "@/@types/Common.type.ts";
import type {
	ICreateOrderRequest,
	IMyOrderListItem,
	IOrderPaymentStatus,
	IOrderResponse,
	IOrderStatus,
	OrderListItem,
} from "@/@types/Order";

export interface OrderFilter extends ICommonFilter {
	search?: string;
	status?: IOrderStatus;
	payment_status?: IOrderPaymentStatus;
	user?: string;
}
import { clientApi } from "./axios";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { queryClient } from "../react-query";
import { queryKeys } from "@/constants/queryKeys";

/**
 * Orders API for Client Components (CSR - requires authentication)
 */
export const orderApi = {
	/**
	 * Get user's orders
	 */
	async getOrders(
		params: OrderFilter = {}
	): Promise<IPaginatedResponse<OrderListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<OrderListItem>>(
			"/orders/",
			{ params }
		);
		return data;
	},

	/**
	 * Get order by ID
	 */
	async getOrderById(orderId: string): Promise<IOrderResponse> {
		const { data } = await clientApi.get<IOrderResponse>(`/orders/${orderId}/`);
		return data;
	},

	/**
	 * Create new order
	 */
	async createOrder(orderData: ICreateOrderRequest): Promise<IOrderResponse> {
		const { data } = await clientApi.post<IOrderResponse>(
			"/orders/create/",
			orderData
		);
		return data;
	},

	/**
	 * Cancel order
	 */
	async cancelOrder(
		orderId: string,
		note?: string
	): Promise<IOrderResponse> {
		const { data } = await clientApi.post<IOrderResponse>(
			`/orders/${orderId}/cancel/`,
			{ note }
		);
		return data;
	},

	/**
	 * Update order status
	 */
	async updateOrderStatus(
		orderId: string,
		status: IOrderStatus,
		note?: string
	): Promise<IOrderResponse> {
		const { data } = await clientApi.patch<IOrderResponse>(
			`/orders/${orderId}/status/`,
			{ status, note }
		);
		return data;
	},

	/**
	 * Update payment status
	 */
	async updatePaymentStatus(
		orderId: string,
		paymentStatus: IOrderPaymentStatus,
		note?: string
	): Promise<IOrderResponse> {
		const { data } = await clientApi.patch<IOrderResponse>(
			`/orders/${orderId}/payment-status/`,
			{ payment_status: paymentStatus, note }
		);
		return data;
	},

	async myOrders(): Promise<IPaginatedResponse<IMyOrderListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<IMyOrderListItem>>(
			"/orders/my-orders/"
		);
		return data;
	},

	/**
	 * Get orders by product ID
	 */
	async getOrdersByProductId(
		productId: string,
		params: IPagination = {}
	): Promise<IPaginatedResponse<OrderListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<OrderListItem>>(
			`/orders/by-product/${productId}/`,
			{ params }
		);
		return data;
	},
};


export const getOrders = (params: OrderFilter) =>
	queryOptions({
		queryKey: [queryKeys.orders, { params }],
		queryFn: async () => orderApi.getOrders(params),
	});


export const getOrderById = (orderId: string) =>
	queryOptions({
		queryKey: [queryKeys.orders, orderId],
		queryFn: async () => orderApi.getOrderById(orderId),
	});

export const getOrdersByProductId = (productId: string, params: IPagination = {}) =>
	queryOptions({
		queryKey: [queryKeys.orders, "product", productId, params],
		queryFn: async () => orderApi.getOrdersByProductId(productId, params),
	});

export const useUpdateOrderStatus = () => {
	return useMutation({
		mutationFn: ({
			orderId,
			status,
			note,
		}: {
			orderId: string;
			status: IOrderStatus;
			note?: string;
		}) => orderApi.updateOrderStatus(orderId, status, note),
		onSuccess: (_, { orderId }) => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders, orderId] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders] });
		},
	});
};

export const useUpdatePaymentStatus = () => {
	return useMutation({
		mutationFn: ({
			orderId,
			paymentStatus,
			note,
		}: {
			orderId: string;
			paymentStatus: IOrderPaymentStatus;
			note?: string;
		}) => orderApi.updatePaymentStatus(orderId, paymentStatus, note),
		onSuccess: (_, { orderId }) => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders, orderId] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders] });
		},
	});
};

export const useCancelOrder = () => {
	return useMutation({
		mutationFn: ({ orderId, note }: { orderId: string; note?: string }) =>
			orderApi.cancelOrder(orderId, note),
		onSuccess: (_, { orderId }) => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders, orderId] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders] });
		},
	});
};

export const useCreateOrder = () => {
	return useMutation({
		mutationFn: (orderData: ICreateOrderRequest) =>
			orderApi.createOrder(orderData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.orders] });
		},
	});
};