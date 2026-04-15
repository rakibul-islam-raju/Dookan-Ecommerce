import { clientApi } from "./axios";
import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";

export interface DashboardMetrics {
	revenue: {
		total: string;
		current_month: string;
		last_month: string;
		change_percent: number;
	};
	orders: {
		total: number;
		current_month: number;
		last_month: number;
		change_percent: number;
		by_status: Record<string, number>;
		avg_order_value: string;
	};
	customers: {
		total: number;
		new_this_month: number;
		new_last_month: number;
		change_percent: number;
	};
	products: {
		total: number;
		out_of_stock: number;
		low_stock: Array<{
			id: string;
			sku: string;
			name: string;
			stock_quantity: number;
			low_stock_threshold: number;
			"product__id": string;
			"product__name": string;
			"product__slug": string;
		}>;
	};
	recent_orders: Array<{
		id: string;
		order_number: string;
		customer_name: string;
		customer_email: string;
		status: string;
		payment_status: string;
		total_amount: string;
		created_at: string;
	}>;
}

export const dashboardApi = {
	async getMetrics(): Promise<DashboardMetrics> {
		const { data } = await clientApi.get<DashboardMetrics>(
			"/orders/dashboard/metrics/"
		);
		return data;
	},
};

export const getDashboardMetrics = () =>
	queryOptions({
		queryKey: [queryKeys.dashboard],
		queryFn: () => dashboardApi.getMetrics(),
		staleTime: 60 * 1000, // 1 minute
	});
