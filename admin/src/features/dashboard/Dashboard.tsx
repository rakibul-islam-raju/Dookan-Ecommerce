import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

export function Dashboard() {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$1000</div>
						<p className="text-xs text-muted-foreground">
							+20.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+100</div>
						<p className="text-xs text-muted-foreground">
							+180.1% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+1000</div>
						<p className="text-xs text-muted-foreground">
							+19% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Now</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">+100</div>
						<p className="text-xs text-muted-foreground">
							+201 since last hour
						</p>
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader className="flex flex-row items-center">
						<div className="grid gap-2">
							<CardTitle>Transactions</CardTitle>
							<CardDescription>
								Recent transactions from your store.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-sm">Transaction list placeholder</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recent Sales</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						<div className="flex items-center gap-4">
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									Olivia Martin
								</p>
								<p className="text-sm text-muted-foreground">
									olivia.martin@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$1,999.00</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">Jackson Lee</p>
								<p className="text-sm text-muted-foreground">
									jackson.lee@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$39.00</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
