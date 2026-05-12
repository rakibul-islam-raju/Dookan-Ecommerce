import { Sheet, SheetContent } from "@/components/ui/sheet";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Permission } from "@/@types/User.type";
import { useState } from "react";
import {
	Boxes,
	ChevronDown,
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
	Tag,
	Users,
	type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarBaseItem {
	labelId: string;
	defaultLabel: string;
	permission?: Permission;
}

interface SidebarLinkItem extends SidebarBaseItem {
	icon: LucideIcon;
	href: string;
	type?: "link";
}

interface SidebarChildItem extends SidebarBaseItem {
	href: string;
}

interface SidebarGroupItem extends SidebarBaseItem {
	type: "group";
	icon: LucideIcon;
	href?: string;
	children: SidebarChildItem[];
}

type SidebarItem = SidebarLinkItem | SidebarGroupItem;

const sidebarItems: SidebarItem[] = [
	{ icon: LayoutDashboard, labelId: "layout.nav.dashboard", defaultLabel: "Dashboard", href: "/", permission: "view_dashboard" },
	{
		type: "group",
		icon: Package,
		labelId: "layout.nav.products",
		defaultLabel: "Products",
		href: "/products",
		permission: "manage_products",
		children: [
			{ labelId: "layout.nav.categories", defaultLabel: "Categories", href: "/categories", permission: "manage_categories" },
			{ labelId: "layout.nav.variantTypes", defaultLabel: "Variant Types", href: "/variant-types", permission: "manage_products" },
		],
	},
	{ icon: ShoppingCart, labelId: "layout.nav.orders", defaultLabel: "Orders", href: "/orders", permission: "manage_orders" },
	{ icon: Users, labelId: "layout.nav.customers", defaultLabel: "Customers", href: "/customers", permission: "manage_customers" },
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

const isGroupItem = (item: SidebarItem): item is SidebarGroupItem =>
	item.type === "group";

const isPathActive = (pathname: string, href?: string) => {
	if (!href) return false;
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
};

const SidebarContent = () => {
	const t = useT();
	const { pathname } = useLocation();
	const { hasPermission, canAccessInventory, canAccessExpenses, canAccessStorefront } = useAuthStore();
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

	const getVisibleChildren = (item: SidebarGroupItem) =>
		item.children.filter((child) => !child.permission || hasPermission(child.permission));

	const getVisibleItems = (items: SidebarItem[]) =>
		items.filter((item) => {
			if (!isGroupItem(item)) {
				return !item.permission || hasPermission(item.permission);
			}

			const hasParentAccess = !item.permission || hasPermission(item.permission);
			return hasParentAccess || getVisibleChildren(item).length > 0;
		});

	const isGroupActive = (item: SidebarGroupItem) =>
		isPathActive(pathname, item.href) ||
		item.children.some((child) => isPathActive(pathname, child.href));

	const visibleSidebarItems = getVisibleItems(sidebarItems);
	const visibleStoreItems = canAccessStorefront()
		? getVisibleItems(storeItems)
		: [];
	const visibleAdminItems = getVisibleItems(adminItems);
	const visibleOperationsItems = operationsItems.filter((item) => {
		if (item.href === "/inventory") return canAccessInventory();
		if (item.href === "/expenses") return canAccessExpenses();
		return false;
	});

	const toggleGroup = (labelId: string) => {
		setExpandedGroups((current) => ({
			...current,
			[labelId]: !current[labelId],
		}));
	};

	const renderNavItems = (items: SidebarItem[]) =>
		items.map((item) => {
			if (!isGroupItem(item)) {
				return (
					<NavLink
						key={item.href}
						to={item.href}
						end={item.href === "/"}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
								isActive ? "bg-muted text-primary" : "text-muted-foreground"
							)
						}
					>
						<item.icon className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">
							<T id={item.labelId} defaultMessage={item.defaultLabel} />
						</span>
					</NavLink>
				);
			}

			const childItems = getVisibleChildren(item);
			const hasParentAccess = !item.permission || hasPermission(item.permission);
			const isActive = isGroupActive(item);
			const isExpanded = expandedGroups[item.labelId] ?? false;

			return (
				<div key={item.labelId} className="space-y-1">
					{hasParentAccess && item.href ? (
						<NavLink
							to={item.href}
							aria-expanded={isExpanded}
							aria-label={t(item.labelId, item.defaultLabel) as string}
							onClick={() => {
								if (childItems.length > 0) {
									toggleGroup(item.labelId);
								}
							}}
							className={cn(
								"flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-all",
								isActive ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<item.icon className="h-4 w-4 shrink-0" />
								<span className="whitespace-nowrap">
									<T id={item.labelId} defaultMessage={item.defaultLabel} />
								</span>
							</div>
							{childItems.length > 0 && (
								<ChevronDown
									className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
								/>
							)}
						</NavLink>
					) : (
						<button
							type="button"
							aria-expanded={isExpanded}
							aria-label={t(item.labelId, item.defaultLabel) as string}
							onClick={() => toggleGroup(item.labelId)}
							className={cn(
								"flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all",
								isActive ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<item.icon className="h-4 w-4 shrink-0" />
								<span className="whitespace-nowrap">
									<T id={item.labelId} defaultMessage={item.defaultLabel} />
								</span>
							</div>
							{childItems.length > 0 && (
								<ChevronDown
									className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
								/>
							)}
						</button>
					)}

					{childItems.length > 0 && isExpanded && (
						<div className="ml-5 grid gap-1 border-l pl-3">
							{childItems.map((child) => (
								<NavLink
									key={child.href}
									to={child.href}
									className={({ isActive }) =>
										cn(
											"rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
											isActive ? "bg-muted text-primary" : "text-muted-foreground"
										)
									}
								>
									<T id={child.labelId} defaultMessage={child.defaultLabel} />
								</NavLink>
							))}
						</div>
					)}
				</div>
			);
		});

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
								t("layout.sidebar.store", "Store") as string
							)}
							{renderNavItems(visibleStoreItems)}
						</>
					)}

					{visibleOperationsItems.length > 0 && (
						<>
							{renderSectionHeader(
								Boxes,
								t("layout.sidebar.operations", "Operations") as string
							)}
							{renderNavItems(visibleOperationsItems)}
						</>
					)}

					{visibleAdminItems.length > 0 && (
						<>
							{renderSectionHeader(
								ShieldCheck,
								t("layout.sidebar.administration", "Administration") as string
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
