import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { GuestRoute, ProtectedRoute } from "./guards";
import { RoleType } from '@/types';

import { RootLayout } from "../components/layout/RootLayout";
import { DashboardShell } from "../components/layout/DashboardShell";
import AccountShell from "../components/layout/AccountShell";
import { GlobalErrorPage } from "../components/layout/GlobalErrorPage";
import { NotFoundPage } from "../components/layout/NotFoundPage";

const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const SearchPage = lazy(() => import("../features/product/pages/SearchPage"));
const ProductDetailPage = lazy(() => import("../features/product/pages/ProductDetailPage"));
const StoreProfilePage = lazy(() => import("../features/store/pages/StoreProfilePage"));
const CategoryPage = lazy(() => import("../features/product/pages/CategoryPage"));

const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const SwitchRolePage = lazy(() => import("../features/auth/pages/SwitchRolePage"));

const CartPage = lazy(() => import("../features/cart/pages/CartPage"));
const CheckoutPage = lazy(() => import("../features/checkout/pages/CheckoutPage"));
const OrderListPage = lazy(() => import("../features/order/pages/OrderListPage"));
const OrderDetailPage = lazy(() => import("../features/order/pages/OrderDetailPage"));
const WalletPage = lazy(() => import("../features/wallet/pages/WalletPage"));
const AccountPage = lazy(() => import("../features/user/pages/AccountPage"));

const SellerDashboardPage = lazy(() => import("../features/dashboard/seller/pages/SellerDashboardPage"));
const SellerProductsPage = lazy(() => import("../features/dashboard/seller/pages/SellerProductsPage"));
const SellerProductFormPage = lazy(() => import("../features/dashboard/seller/pages/SellerProductFormPage"));
const SellerOrdersPage = lazy(() => import("../features/dashboard/seller/pages/SellerOrdersPage"));
const SellerOrderDetailPage = lazy(() => import("../features/dashboard/seller/pages/SellerOrderDetailPage"));
const StoreSettingsPage = lazy(() => import("../features/dashboard/seller/pages/StoreSettingsPage"));
const VoucherManagePage = lazy(() => import("../features/dashboard/seller/pages/VoucherManagePage"));
const SellerWalletPage = lazy(() => import("../features/dashboard/seller/pages/SellerWalletPage"));

const DriverDashboardPage = lazy(() => import("../features/dashboard/driver/pages/DriverDashboardPage"));
const DriverJobBoardPage = lazy(() => import("../features/dashboard/driver/pages/DriverJobBoardPage"));
const DriverJobDetailPage = lazy(() => import("../features/dashboard/driver/pages/DriverJobDetailPage"));
const DriverEarningsPage = lazy(() => import("../features/dashboard/driver/pages/DriverEarningsPage"));
const DriverMyDeliveriesPage = lazy(() => import("../features/dashboard/driver/pages/DriverMyDeliveriesPage"));
const DriverWalletPage = lazy(() => import("../features/dashboard/driver/pages/DriverWalletPage"));

const AdminDashboardPage = lazy(() => import("../features/dashboard/admin/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../features/dashboard/admin/pages/AdminUsersPage"));
const AdminStoresPage = lazy(() => import("../features/dashboard/admin/pages/AdminStoresPage"));
const AdminCategoriesPage = lazy(() => import("../features/dashboard/admin/pages/AdminCategoriesPage"));
const AdminPromosPage = lazy(() => import("../features/dashboard/admin/pages/AdminPromosPage"));
const AdminAnalyticsPage = lazy(() => import("../features/dashboard/admin/pages/AdminAnalyticsPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/",
    element: <RootLayout />,
    errorElement: <GlobalErrorPage />,
    children: [
      { index: true, element: <S><HomePage /></S> },
      { path: "search", element: <S><SearchPage /></S> },
      { path: "product/:slug", element: <S><ProductDetailPage /></S> },
      { path: "store/:slug", element: <S><StoreProfilePage /></S> },
      { path: "category/:slug", element: <S><CategoryPage /></S> },

      {
        path: "auth",
        element: <GuestRoute />,
        children: [
          { path: "login", element: <S><LoginPage /></S> },
          { path: "register", element: <S><RegisterPage /></S> },
        ],
      },
      { path: "auth/switch-role", element: <S><SwitchRolePage /></S> },

      {
        element: <ProtectedRoute roles={[RoleType.BUYER]} />,
        children: [
          { path: "cart", element: <S><CartPage /></S> },
          { path: "checkout", element: <S><CheckoutPage /></S> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AccountShell />,
            children: [
              { path: "account", element: <S><AccountPage /></S> },
              { path: "wallet", element: <S><WalletPage /></S> },
              {
                element: <ProtectedRoute roles={[RoleType.BUYER]} />,
                children: [
                  { path: "orders", element: <S><OrderListPage /></S> },
                  { path: "orders/:id", element: <S><OrderDetailPage /></S> },
                ],
              },
            ]
          }
        ],
      },
      
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  {
    path: "/seller",
    errorElement: <GlobalErrorPage />,
    element: (
      <ProtectedRoute roles={[RoleType.SELLER]}>
        <DashboardShell role={RoleType.SELLER} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <S><SellerDashboardPage /></S> },
      { path: "products", element: <S><SellerProductsPage /></S> },
      { path: "products/new", element: <S><SellerProductFormPage /></S> },
      { path: "products/:id/edit", element: <S><SellerProductFormPage /></S> },
      { path: "orders", element: <S><SellerOrdersPage /></S> },
      { path: "orders/:id", element: <S><SellerOrderDetailPage /></S> },
      { path: "store/settings", element: <S><StoreSettingsPage /></S> },
      { path: "vouchers", element: <S><VoucherManagePage /></S> },
      { path: "wallet", element: <S><SellerWalletPage /></S> },
    ],
  },

  {
    path: "/driver",
    errorElement: <GlobalErrorPage />,
    element: (
      <ProtectedRoute roles={[RoleType.DRIVER]}>
        <DashboardShell role={RoleType.DRIVER} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <S><DriverDashboardPage /></S> },
      { path: "jobs", element: <S><DriverJobBoardPage /></S> },
      { path: "jobs/:id", element: <S><DriverJobDetailPage /></S> },
      { path: "my-deliveries", element: <S><DriverMyDeliveriesPage /></S> },
      { path: "earnings", element: <S><DriverEarningsPage /></S> },
      { path: "wallet", element: <S><DriverWalletPage /></S> },
    ],
  },

  {
    path: "/admin",
    errorElement: <GlobalErrorPage />,
    element: (
      <ProtectedRoute roles={[RoleType.ADMIN]}>
        <DashboardShell role={RoleType.ADMIN} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <S><AdminDashboardPage /></S> },
      { path: "users", element: <S><AdminUsersPage /></S> },
      { path: "stores", element: <S><AdminStoresPage /></S> },
      { path: "categories", element: <S><AdminCategoriesPage /></S> },
      { path: "promos", element: <S><AdminPromosPage /></S> },
      { path: "analytics", element: <S><AdminAnalyticsPage /></S> },
    ],
  },
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
