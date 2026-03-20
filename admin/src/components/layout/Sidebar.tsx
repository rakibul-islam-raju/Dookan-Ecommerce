import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import {
	Grid2X2Check,
	Image,
	LayoutDashboard,
	Megaphone,
	MessageSquareText,
	Package,
	Settings,
	ShoppingCart,
	Store,
	SwatchBook,
	Tag,
	Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const sidebarItems = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/" },
	{ icon: Package, label: "Products", href: "/products" },
	{ icon: ShoppingCart, label: "Orders", href: "/orders" },
	{ icon: Users, label: "Customers", href: "/customers" },
	{ icon: Grid2X2Check, label: "Categories", href: "/categories" },
	{ icon: SwatchBook, label: "Variant Types", href: "/variant-types" },
	{ icon: MessageSquareText, label: "Reviews", href: "/reviews" },
	{ icon: Tag, label: "Coupons", href: "/coupons" },
];

const storeItems = [
	{ icon: Image, label: "Banners", href: "/store/banners" },
	{ icon: Megaphone, label: "Announcements", href: "/store/announcements" },
	{ icon: Settings, label: "Site Settings", href: "/store/settings" },
];

const SidebarContent = () => (
	<div className="flex flex-col h-full">
		<div className="flex-1">
			<nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
				{sidebarItems.map((item) => (
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
				))}

				{/* Store Section */}
				<div className="mt-6 mb-2 px-3">
					<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						<Store className="h-3 w-3" />
						Store
					</div>
				</div>
				{storeItems.map((item) => (
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
				))}
			</nav>
		</div>
	</div>
);

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
