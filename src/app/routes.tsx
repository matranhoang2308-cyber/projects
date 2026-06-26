import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/layout/Layout";

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
      { 
        path: "addendum", 
        lazy: () => import("@/features/addendum/AddendumPage").then((m) => ({ Component: m.AddendumPage })) 
      },
      { 
        path: "customers", 
        lazy: () => import("@/features/customers/CustomerPage").then((m) => ({ Component: m.CustomerPage })) 
      },

      // Phân hệ Công nợ
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
    ],
  },
], { 
  basename: (typeof window !== "undefined" && (window.location.hostname.includes("github.io") || window.location.pathname.startsWith("/projects")))
    ? "/projects"
    : "/"
});

