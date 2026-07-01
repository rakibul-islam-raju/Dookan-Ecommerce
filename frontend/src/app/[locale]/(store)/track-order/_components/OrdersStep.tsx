"use client";

import { IMyOrderListItem, IOrderStatus } from "@/@types/Order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface OrdersStepProps {
	orders: IMyOrderListItem[];
	email: string;
	otpCode: string;
	onReset: () => void;
}

const statusColors: Record<IOrderStatus, string> = {
	pending: "bg-yellow-100 text-yellow-800",
	processing: "bg-blue-100 text-blue-800",
	shipped: "bg-purple-100 text-purple-800",
	delivered: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	returned: "bg-gray-100 text-gray-800",
};

function formatCurrency(amount: string): string {
	return `৳${parseFloat(amount).toLocaleString()}`;
}

export function OrdersStep({ orders, email, onReset }: OrdersStepProps) {
	const t = useTranslations("trackOrder");
	const locale = useLocale();

	if (orders.length === 0) {
		return (
			<div className="space-y-6 text-center">
				<div className="py-8">
					<Package className="mx-auto h-12 w-12 text-muted-foreground" />
					<h3 className="mt-4 text-lg font-medium">{t("noOrdersFound")}</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						{t("noOrdersFor", { email })}
					</p>
				</div>
				<Button onClick={onReset} variant="outline" className="w-full">
					<RefreshCw className="mr-2 h-4 w-4" />
					{t("tryAnotherEmail")}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<p className="text-sm text-muted-foreground">
					{t("foundOrders", { count: orders.length, email })}
				</p>
			</div>

			<div className="space-y-4">
				{orders.map((order) => (
					<div
						key={order.id}
						className="rounded-lg border p-4 space-y-3 hover:bg-muted/50 transition-colors"
					>
						<div className="flex items-center justify-between">
							<span className="font-semibold text-sm">
								#{order.order_number}
							</span>
							<Badge className={statusColors[order.status]} variant="secondary">
								{t(`status.${order.status}`)}
							</Badge>
						</div>

						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<span className="text-muted-foreground">{t("date")}: </span>
								<span>
									{new Date(order.created_at).toLocaleDateString(locale, {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground">{t("items")}: </span>
								<span>{order.items_count}</span>
							</div>
						</div>

						<div className="flex items-center justify-between pt-2 border-t">
							<span className="text-sm text-muted-foreground">{t("total")}</span>
							<span className="font-semibold">
								{formatCurrency(order.total_amount)}
							</span>
						</div>
					</div>
				))}
			</div>

			<Button onClick={onReset} variant="outline" className="w-full">
				<RefreshCw className="mr-2 h-4 w-4" />
				{t("trackAnother")}
			</Button>
		</div>
	);
}
