import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ForgotPassword } from "@/features/auth/ForgotPassword";
import { Login } from "@/features/auth/Login";
import { SetPassword } from "@/features/auth/SetPassword";
import { CategoryList } from "@/features/categories/CategoryList";
import { CouponList } from "@/features/coupons/CouponList";
import { VariantTypeList } from "@/features/variants/VariantTypeList";
import { CustomerList } from "@/features/customers/CustomerList";
import { ReviewList } from "@/features/reviews/ReviewList";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { OrderDetails } from "@/features/orders/OrderDetails";
import { OrderList } from "@/features/orders/OrderList";
import { CreateProduct } from "@/features/products/CreateProduct";
import { EditProduct } from "@/features/products/EditProduct";
import { ProductDetails } from "@/features/products/ProductDetails";
import { ProductList } from "@/features/products/ProductList";
import { AnnouncementList } from "@/features/store/AnnouncementList";
import { BannerList } from "@/features/store/BannerList";
import { SiteConfig } from "@/features/store/SiteConfig";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: <Dashboard />,
			},
			{
				path: "products",
				element: <ProductList />,
			},
			{
				path: "products/:id",
				element: <ProductDetails />,
			},
			{
				path: "products/create",
				element: <CreateProduct />,
			},
			{
				path: "products/edit/:id",
				element: <EditProduct />,
			},
			{
				path: "orders",
				element: <OrderList />,
			},
			{
				path: "orders/:id",
				element: <OrderDetails />,
			},
			{
				path: "customers",
				element: <CustomerList />,
			},
			{
				path: "categories",
				element: <CategoryList />,
			},
			{
				path: "reviews",
				element: <ReviewList />,
			},
			{
				path: "variant-types",
				element: <VariantTypeList />,
			},
			{
				path: "coupons",
				element: <CouponList />,
			},
			{
				path: "store/banners",
				element: <BannerList />,
			},
			{
				path: "store/announcements",
				element: <AnnouncementList />,
			},
			{
				path: "store/settings",
				element: <SiteConfig />,
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
