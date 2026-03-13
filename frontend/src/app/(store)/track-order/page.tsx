import { store } from "@/config/store";
import { Metadata } from "next";
import { GuestOrderTracking } from "./_components/GuestOrderTracking";

export const metadata: Metadata = {
	title: `Track Order | ${store.title}`,
	description: `${store.title} - Track your guest orders`,
	keywords: ["track order", "guest order", "order tracking", `${store.title}`],
};

export default function TrackOrderPage() {
	return (
		<div className="container mx-auto py-10 px-4 max-w-md">
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
					<p className="text-muted-foreground">
						Enter your email to track your guest orders
					</p>
				</div>
				<GuestOrderTracking />
			</div>
		</div>
	);
}
