import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "@/components/layout/Layout";

const isVercel = import.meta.env.VITE_IS_VERCEL === "true" || import.meta.env.VITE_IS_VERCEL === true;
const showDebt = !isVercel || import.meta.env.VITE_SHOW_DEBT === "true";
const showAddendum = !isVercel || import.meta.env.VITE_SHOW_ADDENDUM === "true";
const showRealEstate = !isVercel || import.meta.env.VITE_SHOW_REAL_ESTATE === "true";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // Phân hệ Hợp đồng
      {
        index: true,
        lazy: () => import("@/features/dashboard/DashboardPage").then((m) => ({ Component: m.DashboardPage }))
      },
      {
        path: "contracts",
        lazy: () => import("@/features/contracts/ContractListPage").then((m) => ({ Component: m.ContractListPage }))
      },
      {
        path: "contracts/new",
        lazy: () => import("@/features/contracts/ContractCreatePage").then((m) => ({ Component: m.ContractCreatePage }))
      },
      ...(showAddendum ? [
        {
          path: "addendum",
          lazy: () => import("@/features/addendum/AddendumPage").then((m) => ({ Component: m.AddendumPage }))
        }
      ] : []),
      {
        path: "customers",
        lazy: () => import("@/features/customers/CustomerPage").then((m) => ({ Component: m.CustomerPage }))
      },
      {
        path: "leads",
        lazy: () => import("@/features/leads/LeadPage").then((m) => ({ Component: m.LeadPage }))
      },

      // Phân hệ Khách hàng đặt chỗ
      {
        path: "customer-booking",
        element: <Navigate to="/customer-booking/dashboard" replace />
      },
      {
        path: "customer-booking/dashboard",
        lazy: () => import("@/features/customer-booking/pages/DashboardPage").then((m) => ({ Component: m.CustomerBookingDashboardPage }))
      },
      {
        path: "customer-booking/list",
        lazy: () => import("@/features/customer-booking/pages/ListPage").then((m) => ({ Component: m.CustomerBookingListPage }))
      },

      // Phân hệ Quản lý bất động sản
      ...(showRealEstate ? [
        {
          path: "real-estate/ratings",
          lazy: () => import("@/features/real-estate/StarRatingsPage").then((m) => ({ Component: m.StarRatingsPage }))
        },
        {
          path: "real-estate/categories",
          lazy: () => import("@/features/real-estate/CategoriesPage").then((m) => ({ Component: m.CategoriesPage }))
        },
        {
          path: "real-estate/products",
          lazy: () => import("@/features/real-estate/ProductsPage").then((m) => ({ Component: m.ProductsPage }))
        },
      ] : []),

      // Phân hệ Công nợ
      ...(showDebt ? [
        {
          path: "debt",
          lazy: () => import("@/features/debt/DebtDashboard").then((m) => ({ Component: m.DebtDashboard }))
        },
        {
          path: "debt/customer/:customerId",
          lazy: () => import("@/features/debt/CustomerContracts").then((m) => ({ Component: m.CustomerContracts }))
        },
        {
          path: "debt/customer/:customerId/contract/:contractId",
          lazy: () => import("@/features/debt/PaymentDetails").then((m) => ({ Component: m.PaymentDetails }))
        },
        {
          path: "debt/customer/:customerId/contract/:contractId/stage/:stageId/payment/:recordId",
          lazy: () => import("@/features/debt/PaymentRecordDetail").then((m) => ({ Component: m.PaymentRecordDetail }))
        },

        // Backward-compatible routes for the original debt flow.
        // Các màn công nợ cũ đang điều hướng theo /customer/... nên giữ lại alias này.
        {
          path: "customer/:customerId",
          lazy: () => import("@/features/debt/CustomerContracts").then((m) => ({ Component: m.CustomerContracts }))
        },
        {
          path: "customer/:customerId/contract/:contractId",
          lazy: () => import("@/features/debt/PaymentDetails").then((m) => ({ Component: m.PaymentDetails }))
        },
        {
          path: "customer/:customerId/contract/:contractId/stage/:stageId/payment/:recordId",
          lazy: () => import("@/features/debt/PaymentRecordDetail").then((m) => ({ Component: m.PaymentRecordDetail }))
        },
      ] : []),
    ],
  },
], {
  basename: (typeof window !== "undefined" && (window.location.hostname.includes("github.io") || window.location.pathname.startsWith("/projects")))
    ? "/projects"
    : "/"
});

