/**
 * React Query Hooks for Orders
 */

"use client";

import type { IPaginatedResponse, IPagination } from "@/@types/Common";
import type {
	ICreateOrderRequest,
	IMyOrderListItem,
	IOrderResponse,
	OrderListItem,
} from "@/@types/Order";
import {
	GuestOrderOTPRequest,
	GuestOrderTrackingRequest,
	orderClientApi,
} from "@/lib/api/orders";
import { useCartStore } from "@/lib/hooks/useCart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Query Keys for Orders
 */
export const orderKeys = {
	all: ["orders"] as const,
	lists: () => [...orderKeys.all, "list"] as const,
	list: (params: IPagination) => [...orderKeys.lists(), params] as const,
	details: () => [...orderKeys.all, "detail"] as const,
	detail: (id: string) => [...orderKeys.details(), id] as const,
	myOrders: () => [...orderKeys.all, "my-orders"] as const,
	guestOrders: () => [...orderKeys.all, "guest-orders"] as const,
	guestOrder: (orderNumber: string) =>
		[...orderKeys.guestOrders(), orderNumber] as const,
};

/**
 * Hook to fetch user's orders
 */
export function useOrders(params: IPagination = {}) {
	return useQuery<IPaginatedResponse<OrderListItem>>({
		queryKey: orderKeys.list(params),
		queryFn: () => orderClientApi.getOrders(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch order by ID
 */
export function useOrder(orderId: string) {
	return useQuery<IOrderResponse>({
		queryKey: orderKeys.detail(orderId),
		queryFn: () => orderClientApi.getOrderById(orderId),
		enabled: !!orderId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to create new order
 */
export function useCreateOrder() {
	const queryClient = useQueryClient();
	const clearCart = useCartStore((state) => state.clearCart);

	return useMutation({
		mutationFn: (orderData: ICreateOrderRequest) =>
			orderClientApi.createOrder(orderData),
		onSuccess: (newOrder) => {
			// Invalidate orders list to refetch
			queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

			// Clear cart after successful order
			clearCart();

			toast.success(`Order #${newOrder.order_number} created successfully!`);
		},
		onError: (error: Error) => {
			toast.error(error?.message || "Failed to create order");
		},
	});
}

/**
 * Hook to cancel order
 */
export function useCancelOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (orderId: string) => orderClientApi.cancelOrder(orderId),
		onSuccess: (updatedOrder) => {
			// Update the specific order in cache
			queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);

			// Invalidate orders list
			queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

			toast.success("Order cancelled successfully");
		},
		onError: (error: Error) => {
			toast.error(error?.message || "Failed to cancel order");
		},
	});
}

export function useMyOrders() {
	return useQuery<IPaginatedResponse<IMyOrderListItem>>({
		queryKey: orderKeys.myOrders(),
		queryFn: () => orderClientApi.myOrders(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to request OTP for guest order tracking
 */
export function useRequestGuestOrderOTP() {
	return useMutation({
		mutationFn: (data: GuestOrderOTPRequest) =>
			orderClientApi.requestGuestOrderOTP(data),
		onSuccess: () => {
			toast.success("OTP sent to your email.");
		},
	});
}

/**
 * Hook to track guest orders with email and OTP
 */
export function useTrackGuestOrders() {
	return useMutation({
		mutationFn: (data: GuestOrderTrackingRequest) =>
			orderClientApi.trackGuestOrders(data),
	});
}

/**
 * Hook to get single guest order details
 */
export function useGuestOrderDetail() {
	return useMutation({
		mutationFn: ({
			orderNumber,
			data,
		}: {
			orderNumber: string;
			data: GuestOrderTrackingRequest;
		}) => orderClientApi.getGuestOrder(orderNumber, data),
	});
}
