import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  ChevronLeft,
  Bell,
  Search,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const isVercel = import.meta.env.VITE_IS_VERCEL === "true" || import.meta.env.VITE_IS_VERCEL === true;
const showDebt = !isVercel || import.meta.env.VITE_SHOW_DEBT === "true";
const showAddendum = !isVercel || import.meta.env.VITE_SHOW_ADDENDUM === "true";

const navItems = [
  {
    group: "Tổng quan",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    group: "Hợp đồng",
    items: [
      { label: "Danh sách hợp đồng", icon: FileText, path: "/contracts" },
    ],
  },
  {
    group: "Khách hàng",
    items: [
      { label: "Danh sách khách hàng", icon: Users, path: "/customers" },
    ],
  },
  ...(showDebt ? [{
    group: "Công nợ",
    items: [
      { label: "Quản lý công nợ", icon: Wallet, path: "/debt" },
    ],
  }] : []),
  ...(showAddendum ? [{
    group: "Tài liệu",
    items: [
      { label: "Quản lý phụ lục", icon: BookOpen, path: "/addendum" },
    ],
  }] : []),
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDebtDetails = /\/customer\/[^/]+\/contract\/[^/]+/.test(location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-slate-200", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>ContractCRM</p>
            <p className="text-xs text-slate-500">Quản lý hợp đồng</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <p className="text-xs text-slate-400 px-2 mb-1 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const active = item.path === "/"
                ? location.pathname === "/"
                : location.pathname === item.path || (
                  item.path !== "/contracts" && location.pathname.startsWith(`${item.path}/`)
                );
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={cn(
                    "w-full flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-slate-200 p-3 space-y-1")}>
        <button aria-label="Mở cài đặt" className={cn(
          "w-full flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
          collapsed && "justify-center"
        )}>
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cài đặt</span>}
        </button>
        <button aria-label="Đăng xuất" className={cn(
          "w-full flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
          collapsed && "justify-center"
        )}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">NV</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm text-slate-900 truncate" style={{ fontWeight: 500 }}>Nguyễn Văn A</p>
              <p className="text-xs text-slate-500 truncate">Sales Manager</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] bg-slate-50 overflow-hidden">
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-slate-950 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Bỏ qua điều hướng
      </a>
      {/* Desktop Sidebar */}
      {!isDebtDetails && (
        <aside className={cn(
          "hidden md:flex flex-col bg-white border-r border-slate-200 transition-[width] duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50" aria-label="Điều hướng chính trên di động">
            <button
              type="button"
              aria-label="Đóng menu"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 shrink-0">
          {!isDebtDetails && (
            <button
              type="button"
              aria-label="Mở menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          )}
          {!isDebtDetails && (
            <button
              type="button"
              aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              className="hidden h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("w-4 h-4 text-slate-600 transition-transform", collapsed && "rotate-180")} />
            </button>
          )}

          <div className="flex-1 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Tìm kiếm hợp đồng..."
                aria-label="Tìm kiếm hợp đồng toàn hệ thống"
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  const query = event.currentTarget.value.trim();
                  navigate(query ? `/contracts?search=${encodeURIComponent(query)}` : "/contracts");
                }}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button type="button" aria-label="Mở thông báo" className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            <Badge variant="outline" className="text-xs hidden sm:flex">
              Q2 / 2026
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
