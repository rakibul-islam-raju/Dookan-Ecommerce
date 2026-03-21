import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Permission } from "@/@types/User.type";
import {
	Grid2X2Check,
	Image,
	KeyRound,
	LayoutDashboard,
	Megaphone,
	MessageSquareText,
	Package,
	Settings,
	ShieldCheck,
	ShoppingCart,
	Store,
	SwatchBook,
	Tag,
	Users,
	type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItem {
	icon: LucideIcon;
	label: string;
	href: string;
	permission?: Permission;
}

const sidebarItems: SidebarItem[] = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/", permission: "view_dashboard" },
	{ icon: Package, label: "Products", href: "/products", permission: "manage_products" },
	{ icon: ShoppingCart, label: "Orders", href: "/orders", permission: "manage_orders" },
	{ icon: Users, label: "Customers", href: "/customers", permission: "manage_customers" },
	{ icon: Grid2X2Check, label: "Categories", href: "/categories", permission: "manage_categories" },
	{ icon: SwatchBook, label: "Variant Types", href: "/variant-types", permission: "manage_products" },
	{ icon: MessageSquareText, label: "Reviews", href: "/reviews", permission: "manage_reviews" },
	{ icon: Tag, label: "Coupons", href: "/coupons", permission: "manage_coupons" },
];

const storeItems: SidebarItem[] = [
	{ icon: Image, label: "Banners", href: "/store/banners", permission: "manage_banners" },
	{ icon: Megaphone, label: "Announcements", href: "/store/announcements", permission: "manage_announcements" },
	{ icon: Settings, label: "Site Settings", href: "/store/settings", permission: "manage_settings" },
];

const adminItems: SidebarItem[] = [
	{ icon: ShieldCheck, label: "Staff", href: "/staff", permission: "manage_staff" },
	{ icon: KeyRound, label: "Roles", href: "/roles", permission: "manage_staff" },
];

const SidebarContent = () => {
	const { hasPermission } = useAuthStore();

	const visibleSidebarItems = sidebarItems.filter(
		(item) => !item.permission || hasPermission(item.permission)
	);
	const visibleStoreItems = storeItems.filter(
		(item) => !item.permission || hasPermission(item.permission)
	);
	const visibleAdminItems = adminItems.filter(
		(item) => !item.permission || hasPermission(item.permission)
	);

	const renderNavItems = (items: SidebarItem[]) =>
		items.map((item) => (
			<NavLink
				key={item.href}
				to={item.href}
				className={({ isActive }) =>
					cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
						isActive ? "bg-muted text-primary" : "text-muted-foreground"
					)
				}
			>
				<item.icon className="h-4 w-4 shrink-0" />
				<span className="whitespace-nowrap">{item.label}</span>
			</NavLink>
		));

	const renderSectionHeader = (icon: LucideIcon, label: string) => {
		const Icon = icon;
		return (
			<div className="mt-6 mb-2 px-3">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					<Icon className="h-3 w-3" />
					{label}
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1">
				<nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
					{renderNavItems(visibleSidebarItems)}

					{visibleStoreItems.length > 0 && (
						<>
							{renderSectionHeader(Store, "Store")}
							{renderNavItems(visibleStoreItems)}
						</>
					)}

					{visibleAdminItems.length > 0 && (
						<>
							{renderSectionHeader(ShieldCheck, "Administration")}
							{renderNavItems(visibleAdminItems)}
						</>
					)}
				</nav>
			</div>
		</div>
	);
};

export function Sidebar() {
	const { isOpen, close } = useSidebarStore();

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex md:flex-col border-r w-[260px] h-[calc(100vh-60px)] fixed top-[60px] left-0 bg-background">
				<SidebarContent />
			</aside>

			{/* Mobile Sidebar as Sheet */}
			<Sheet open={isOpen} onOpenChange={close}>
				<SheetContent side="left" className="w-full p-0">
					<SidebarContent />
				</SheetContent>
			</Sheet>
		</>
	);
}
