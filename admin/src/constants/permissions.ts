import type { Permission } from "@/@types/User.type";

export const PERMISSION_LABELS: Record<Permission, string> = {
	view_dashboard: "View Dashboard",
	manage_products: "Manage Products",
	manage_orders: "Manage Orders",
	manage_customers: "Manage Customers",
	manage_categories: "Manage Categories",
	manage_coupons: "Manage Coupons",
	manage_reviews: "Manage Reviews",
	manage_banners: "Manage Banners",
	manage_announcements: "Manage Announcements",
	manage_settings: "Manage Settings",
	manage_staff: "Manage Staff",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];
