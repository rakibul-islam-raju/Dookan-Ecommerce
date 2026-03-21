"use client";

import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Heart, Home, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
	{
		title: "Home",
		href: "/",
		icon: Home,
	},
	{
		title: "Profile",
		href: "/profile",
		icon: User,
	},
	{
		title: "Orders",
		href: "/orders",
		icon: Package,
	},
	{
		title: "Wishlist",
		href: "/wishlist",
		icon: Heart,
	},
	{
		title: "Addresses",
		href: "/addresses",
		icon: MapPin,
	},
];

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const user = useAuthStore((state) => state.user);

	return (
		<div className="container py-4 md:py-8 pb-24 md:pb-12">
			<div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12">
				{/* Desktop Sidebar - Hidden on mobile */}
				<aside className="hidden md:block md:w-[240px] lg:w-[280px] shrink-0 space-y-6">
					<div className="flex items-center gap-3 px-2">
						<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							<User className="size-6" />
						</div>
						<div>
							<p className="font-medium">
								{user?.first_name} {user?.last_name}
							</p>
							<p className="text-xs text-muted-foreground">{user?.email}</p>
						</div>
					</div>

					<Separator />

					<nav className="flex flex-col gap-1">
						{sidebarItems.map((item) => {
							const isActive =
								pathname === item.href || pathname.startsWith(`${item.href}/`);
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									)}
								>
									<item.icon className="size-4" />
									{item.title}
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Main Content */}
				<div className="flex-1 min-w-0">
					<div className="bg-background rounded-xl border shadow-sm p-4 md:p-6 lg:p-8 min-h-[500px]">
						{children}
					</div>
				</div>
			</div>

			{/* Mobile Bottom Navigation - Hidden on desktop */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
				<div className="flex items-center justify-around px-2 py-3">
					{sidebarItems.map((item) => {
						const isActive =
							pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors min-w-[60px]",
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<item.icon className="size-5" />
								<span className="text-[10px] font-medium">{item.title}</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
