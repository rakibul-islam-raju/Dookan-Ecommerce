import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Permission } from "@/@types/User.type";
import {
	Boxes,
	Grid2X2Check,
	Heart,
	Image,
	KeyRound,
	LayoutDashboard,
	Megaphone,
	MessageSquareText,
	Package,
	Percent,
	Receipt,
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
import { useIntl } from "react-intl";

interface SidebarItem {
	icon: LucideIcon;
	labelId: string;
	defaultLabel: string;
	href: string;
	permission?: Permission;
}

const sidebarItems: SidebarItem[] = [
	{ icon: LayoutDashboard, labelId: "layout.nav.dashboard", defaultLabel: "Dashboard", href: "/", permission: "view_dashboard" },
	{ icon: Package, labelId: "layout.nav.products", defaultLabel: "Products", href: "/products", permission: "manage_products" },
	{ icon: ShoppingCart, labelId: "layout.nav.orders", defaultLabel: "Orders", href: "/orders", permission: "manage_orders" },
	{ icon: Users, labelId: "layout.nav.customers", defaultLabel: "Customers", href: "/customers", permission: "manage_customers" },
	{ icon: Grid2X2Check, labelId: "layout.nav.categories", defaultLabel: "Categories", href: "/categories", permission: "manage_categories" },
	{ icon: SwatchBook, labelId: "layout.nav.variantTypes", defaultLabel: "Variant Types", href: "/variant-types", permission: "manage_products" },
	{ icon: Tag, labelId: "layout.nav.coupons", defaultLabel: "Coupons", href: "/coupons", permission: "manage_coupons" },
	{ icon: Percent, labelId: "layout.nav.sales", defaultLabel: "Sales", href: "/sales", permission: "manage_sales" },
];

const storeItems: SidebarItem[] = [
	{ icon: Image, labelId: "layout.nav.banners", defaultLabel: "Banners", href: "/store/banners", permission: "manage_banners" },
	{ icon: Megaphone, labelId: "layout.nav.announcements", defaultLabel: "Announcements", href: "/store/announcements", permission: "manage_announcements" },
	{ icon: MessageSquareText, labelId: "layout.nav.reviews", defaultLabel: "Reviews", href: "/reviews", permission: "manage_reviews" },
	{ icon: Heart, labelId: "layout.nav.wishlists", defaultLabel: "Wishlists", href: "/wishlists", permission: "manage_wishlists" },
	{ icon: Settings, labelId: "layout.nav.siteSettings", defaultLabel: "Site Settings", href: "/store/settings", permission: "manage_settings" },
];

const adminItems: SidebarItem[] = [
	{ icon: ShieldCheck, labelId: "layout.nav.staff", defaultLabel: "Staff", href: "/staff", permission: "manage_staff" },
	{ icon: KeyRound, labelId: "layout.nav.roles", defaultLabel: "Roles", href: "/roles", permission: "manage_staff" },
];

const operationsItems: SidebarItem[] = [
	{ icon: Boxes, labelId: "layout.nav.inventory", defaultLabel: "Inventory", href: "/inventory", permission: "manage_inventory" },
	{ icon: Receipt, labelId: "layout.nav.expenses", defaultLabel: "Expenses", href: "/expenses", permission: "manage_expenses" },
];

const SidebarContent = () => {
	const intl = useIntl();
	const { hasPermission, canAccessInventory, canAccessExpenses, canAccessStorefront } = useAuthStore();

	const visibleSidebarItems = sidebarItems.filter(
		(item) => !item.permission || hasPermission(item.permission)
	);
	const visibleStoreItems = canAccessStorefront()
		? storeItems.filter((item) => !item.permission || hasPermission(item.permission))
		: [];
	const visibleAdminItems = adminItems.filter(
		(item) => !item.permission || hasPermission(item.permission)
	);
	const visibleOperationsItems = operationsItems.filter((item) => {
		if (item.href === "/inventory") return canAccessInventory();
		if (item.href === "/expenses") return canAccessExpenses();
		return false;
	});

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
				<span className="whitespace-nowrap">
					{intl.formatMessage({
						id: item.labelId,
						defaultMessage: item.defaultLabel,
					})}
				</span>
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
							{renderSectionHeader(
								Store,
								intl.formatMessage({
									id: "layout.sidebar.store",
									defaultMessage: "Store",
								})
							)}
							{renderNavItems(visibleStoreItems)}
						</>
					)}

					{visibleOperationsItems.length > 0 && (
						<>
							{renderSectionHeader(
								Boxes,
								intl.formatMessage({
									id: "layout.sidebar.operations",
									defaultMessage: "Operations",
								})
							)}
							{renderNavItems(visibleOperationsItems)}
						</>
					)}

					{visibleAdminItems.length > 0 && (
						<>
							{renderSectionHeader(
								ShieldCheck,
								intl.formatMessage({
									id: "layout.sidebar.administration",
									defaultMessage: "Administration",
								})
							)}
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
