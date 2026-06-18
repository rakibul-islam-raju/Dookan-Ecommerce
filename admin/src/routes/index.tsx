import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InventoryGuard } from "@/components/common/InventoryGuard";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { ForgotPassword } from "@/features/auth/ForgotPassword";
import { Login } from "@/features/auth/Login";
import { SetPassword } from "@/features/auth/SetPassword";
import { CategoryList } from "@/features/categories/CategoryList";
import { CouponList } from "@/features/coupons/CouponList";
import { SaleList } from "@/features/sales/SaleList";
import { VariantTypeList } from "@/features/variants/VariantTypeList";
import { CustomerList } from "@/features/customers/CustomerList";
import { CustomerDetails } from "@/features/customers/CustomerDetails";
import { ReviewList } from "@/features/reviews/ReviewList";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { CreateOrder } from "@/features/orders/CreateOrder";
import { OrderDetails } from "@/features/orders/OrderDetails";
import { OrderList } from "@/features/orders/OrderList";
import { CreateProduct } from "@/features/products/CreateProduct";
import { EditProduct } from "@/features/products/EditProduct";
import { ProductDetails } from "@/features/products/ProductDetails";
import { ProductList } from "@/features/products/ProductList";
import { AnnouncementList } from "@/features/store/AnnouncementList";
import { BannerList } from "@/features/store/BannerList";
import { MetaOAuthCallback } from "@/features/store/MetaOAuthCallback";
import { SiteConfig } from "@/features/store/SiteConfig";
import { StaffList } from "@/features/staff/StaffList";
import { RoleList } from "@/features/roles/RoleList";
import { WishlistList } from "@/features/wishlists/WishlistList";
import { InventoryDashboard } from "@/features/inventory/InventoryDashboard";
import { MaterialList } from "@/features/inventory/MaterialList";
import { MaterialDetail } from "@/features/inventory/MaterialDetail";
import { BatchList } from "@/features/inventory/BatchList";
import { CreateBatch } from "@/features/inventory/CreateBatch";
import { BatchDetail } from "@/features/inventory/BatchDetail";
import { ReceiptList } from "@/features/inventory/ReceiptList";
import { ExpenseDashboard } from "@/features/expenses/ExpenseDashboard";
import { ExpenseCategoryList } from "@/features/expenses/ExpenseCategoryList";
import { ExpenseList } from "@/features/expenses/ExpenseList";
import { ExpenseReports } from "@/features/expenses/ExpenseReports";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: (
					<PermissionGuard permission="view_dashboard">
						<Dashboard />
					</PermissionGuard>
				),
			},
			{
				path: "products",
				element: (
					<PermissionGuard permission="manage_products">
						<ProductList />
					</PermissionGuard>
				),
			},
			{
				path: "products/:id",
				element: (
					<PermissionGuard permission="manage_products">
						<ProductDetails />
					</PermissionGuard>
				),
			},
			{
				path: "products/create",
				element: (
					<PermissionGuard permission="manage_products">
						<CreateProduct />
					</PermissionGuard>
				),
			},
			{
				path: "products/edit/:id",
				element: (
					<PermissionGuard permission="manage_products">
						<EditProduct />
					</PermissionGuard>
				),
			},
			{
				path: "orders",
				element: (
					<PermissionGuard permission="manage_orders">
						<OrderList />
					</PermissionGuard>
				),
			},
			{
				path: "orders/create",
				element: (
					<PermissionGuard permission="manage_orders">
						<CreateOrder />
					</PermissionGuard>
				),
			},
			{
				path: "orders/:id",
				element: (
					<PermissionGuard permission="manage_orders">
						<OrderDetails />
					</PermissionGuard>
				),
			},
			{
				path: "customers",
				element: (
					<PermissionGuard permission="manage_customers">
						<CustomerList />
					</PermissionGuard>
				),
			},
			{
				path: "customers/:id",
				element: (
					<PermissionGuard permission="manage_customers">
						<CustomerDetails />
					</PermissionGuard>
				),
			},
			{
				path: "categories",
				element: (
					<PermissionGuard permission="manage_categories">
						<CategoryList />
					</PermissionGuard>
				),
			},
			{
				path: "reviews",
				element: (
					<PermissionGuard permission="manage_reviews">
						<ReviewList />
					</PermissionGuard>
				),
			},
			{
				path: "variant-types",
				element: (
					<PermissionGuard permission="manage_products">
						<VariantTypeList />
					</PermissionGuard>
				),
			},
			{
				path: "coupons",
				element: (
					<PermissionGuard permission="manage_coupons">
						<CouponList />
					</PermissionGuard>
				),
			},
			{
				path: "sales",
				element: (
					<PermissionGuard permission="manage_sales">
						<SaleList />
					</PermissionGuard>
				),
			},
			{
				path: "store/banners",
				element: (
					<PermissionGuard permission="manage_banners">
						<BannerList />
					</PermissionGuard>
				),
			},
			{
				path: "store/announcements",
				element: (
					<PermissionGuard permission="manage_announcements">
						<AnnouncementList />
					</PermissionGuard>
				),
			},
			{
				path: "store/settings",
				element: (
					<PermissionGuard permission="manage_settings">
						<SiteConfig />
					</PermissionGuard>
				),
			},
			{
				path: "store/settings/meta/callback",
				element: (
					<PermissionGuard permission="manage_settings">
						<MetaOAuthCallback />
					</PermissionGuard>
				),
			},
			{
				path: "staff",
				element: (
					<PermissionGuard permission="manage_staff">
						<StaffList />
					</PermissionGuard>
				),
			},
			{
				path: "roles",
				element: (
					<PermissionGuard permission="manage_staff">
						<RoleList />
					</PermissionGuard>
				),
			},
			{
				path: "wishlists",
				element: (
					<PermissionGuard permission="manage_wishlists">
						<WishlistList />
					</PermissionGuard>
				),
			},
			{
				path: "inventory",
				element: (
					<InventoryGuard>
						<InventoryDashboard />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/materials",
				element: (
					<InventoryGuard>
						<MaterialList />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/materials/:id",
				element: (
					<InventoryGuard>
						<MaterialDetail />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/batches",
				element: (
					<InventoryGuard>
						<BatchList />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/batches/create",
				element: (
					<InventoryGuard>
						<CreateBatch />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/batches/:id",
				element: (
					<InventoryGuard>
						<BatchDetail />
					</InventoryGuard>
				),
			},
			{
				path: "inventory/receipts",
				element: (
					<InventoryGuard>
						<ReceiptList />
					</InventoryGuard>
				),
			},
			{
				path: "expenses",
				element: (
					<PermissionGuard permission="manage_expenses">
						<ExpenseDashboard />
					</PermissionGuard>
				),
			},
			{
				path: "expenses/categories",
				element: (
					<PermissionGuard permission="manage_expenses">
						<ExpenseCategoryList />
					</PermissionGuard>
				),
			},
			{
				path: "expenses/entries",
				element: (
					<PermissionGuard permission="manage_expenses">
						<ExpenseList />
					</PermissionGuard>
				),
			},
			{
				path: "expenses/reports",
				element: (
					<PermissionGuard permission="manage_expenses">
						<ExpenseReports />
					</PermissionGuard>
				),
			},
		],
	},
	{
		element: <AuthLayout />,
		children: [
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "forgot-password",
				element: <ForgotPassword />,
			},
			{
				path: "set-password",
				element: <SetPassword />,
			},
		],
	},
]);
