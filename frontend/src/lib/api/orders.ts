/**
 * Orders API Service
 */

import type { IPaginatedResponse, IPagination } from "@/@types/Common";
import {
	ICreateOrderRequest,
	IMyOrderListItem,
	IOrderResponse,
	OrderListItem,
} from "@/@types/Order";
import { clientApi } from "./axios";

// Guest Order Tracking Types
export interface GuestOrderOTPRequest {
	email: string;
}

export interface GuestOrderOTPResponse {
	message: string;
}

export interface GuestOrderTrackingRequest {
	email: string;
	otp_code: string;
}

/**
 * Orders API for Client Components (CSR - requires authentication)
 */
export const orderClientApi = {
	/**
	 * Get user's orders
	 */
	async getOrders(
		params: IPagination = {}
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

	async downloadInvoice(orderId: string): Promise<Blob> {
		const { data } = await clientApi.get<Blob>(`/orders/${orderId}/invoice/`, {
			responseType: "blob",
		});
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
	async cancelOrder(orderId: string): Promise<IOrderResponse> {
		const { data } = await clientApi.post<IOrderResponse>(
			`/orders/${orderId}/cancel/`
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
	 * Request OTP for guest order tracking
	 */
	async requestGuestOrderOTP(
		data: GuestOrderOTPRequest
	): Promise<GuestOrderOTPResponse> {
		const { data: response } = await clientApi.post<GuestOrderOTPResponse>(
			"/orders/guest-orders/request-otp/",
			data
		);
		return response;
	},

	/**
	 * Track guest orders with email and OTP
	 */
	async trackGuestOrders(
		data: GuestOrderTrackingRequest
	): Promise<IMyOrderListItem[]> {
		const { data: response } = await clientApi.post<IMyOrderListItem[]>(
			"/orders/guest-orders/track/",
			data
		);
		return response;
	},

	/**
	 * Get single guest order details
	 */
	async getGuestOrder(
		orderNumber: string,
		data: GuestOrderTrackingRequest
	): Promise<IOrderResponse> {
		const { data: response } = await clientApi.post<IOrderResponse>(
			`/orders/guest-orders/${orderNumber}/`,
			data
		);
		return response;
	},
};
