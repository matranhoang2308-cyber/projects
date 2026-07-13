import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  Search, Users, Building2, User, FileText,
  DollarSign, MoreHorizontal, CheckCircle2,
  Eye, Pencil, Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { customers as baseCustomers, contracts, getCustomerStats } from "@/data/mockDataHopDong";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";
import { CustomerDetailSheet } from "./CustomerDetailSheet";
import { CustomerCreateDialog } from "./CustomerCreateDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/data/mockDataHopDong";

function fmtVnd(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
  return n.toLocaleString();
}

const typeFilters = [
  { value: "all", label: "Loại khách hàng" },
  { value: "Cá nhân", label: "Cá nhân" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

const activityFilters = [
  { value: "all", label: "Trạng thái hợp đồng" },
  { value: "active", label: "Đang có HĐ" },
  { value: "multi", label: "Nhiều hợp đồng (≥2)" },
  { value: "none", label: "Chưa có HĐ nào" },
];

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";
const customerPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const customerPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const customerPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const customerPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const customerPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";
const customerTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const customerTableCellClass = "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const customerStickyCellClass = "bg-white transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const customerBadgeClass = "inline-flex h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1";
const customerStatusClass = (active: boolean) =>
  active
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 before:mr-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500 before:content-['']"
    : "bg-slate-50 text-slate-600 ring-slate-200 before:mr-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-400 before:content-['']";

const getCustomerGroup = (customer: Customer, contractCount: number) => {
  if (customer.customerGroup) return customer.customerGroup;
  const note = customer.note?.toLowerCase() ?? "";
  if (note.includes("vip")) return "VIP";
  if (customer.type === "Doanh nghiệp" || note.includes("đối tác")) return "Đối tác";
  if (contractCount === 0) return "Khác";
  return "Thông thường";
};

const customerGroupClass: Record<string, string> = {
  VIP: "bg-amber-50 text-amber-700 ring-amber-100",
  "Đối tác": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Nhà đầu tư": "bg-blue-50 text-blue-700 ring-blue-100",
  "An cư": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Tiềm năng": "bg-violet-50 text-violet-700 ring-violet-100",
  "Khách cũ": "bg-slate-100 text-slate-600 ring-slate-200",
  "Khách mới": "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "Thông thường": "bg-slate-100 text-slate-600 ring-slate-200",
  Khác: "bg-violet-50 text-violet-700 ring-violet-100",
};

const customerGroupOptions: string[] = ["VIP", "Đối tác", "Thông thường", "Khác"];

const customerSourceClass: Record<string, string> = {
  Facebook: "bg-blue-50 text-blue-700 ring-blue-200",
  Zalo: "bg-sky-50 text-sky-700 ring-sky-200",
  Website: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Hotline: "bg-slate-50 text-slate-700 ring-slate-200",
  Email: "bg-orange-50 text-orange-700 ring-orange-200",
  Offline: "bg-slate-50 text-slate-700 ring-slate-200",
  "Giới thiệu": "bg-violet-50 text-violet-700 ring-violet-200",
  Referral: "bg-violet-50 text-violet-700 ring-violet-200",
  Khác: "bg-slate-50 text-slate-700 ring-slate-200",
};

const progressBarClass = (pct: number) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 50) return "bg-blue-500";
  return "bg-red-500";
};

export function CustomerPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actFilter, setActFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("default");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(() => new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [pendingGroupChange, setPendingGroupChange] = useState<{ customer: Customer; newGroup: string } | null>(null);
  const [groupLogContent, setGroupLogContent] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [customerList, setCustomerList] = useState<Customer[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("crm_customers");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return baseCustomers;
        }
      }
      localStorage.setItem("crm_customers", JSON.stringify(baseCustomers));
    }
    return baseCustomers;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_customers", JSON.stringify(customerList));
    }
  }, [customerList]);

  useEffect(() => {
    const openCustomerId = searchParams.get("openCustomer");
    if (openCustomerId) {
      const found = customerList.find((c) => c.id === openCustomerId);
      if (found) {
        setSelectedCustomer(found);
        setSheetOpen(true);
        const next = new URLSearchParams(searchParams);
        next.delete("openCustomer");
        setSearchParams(next, { replace: true });
      }
    }
  }, [searchParams, customerList, setSearchParams]);

  // Precompute stats for every customer
  const enriched = useMemo(() => {
    return customerList.map((c) => {
      const stats = getCustomerStats(c.id);
      const ctrs = contracts.filter((ct) => ct.customerId === c.id);
      return { ...c, stats, ctrs };
    });
  }, [customerList]);

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.cccd || "").includes(search);

      const matchType = typeFilter === "all" || c.type === typeFilter;

      // Nhóm khách hàng filter
      let matchGroup = true;
      if (groupFilter !== "all") {
        const group = getCustomerGroup(c, c.stats.count);
        if (groupFilter === "vip") {
          matchGroup = group === "VIP";
        } else if (groupFilter === "partner") {
          matchGroup = group === "Đối tác";
        } else if (groupFilter === "normal") {
          matchGroup = group === "Thông thường";
        } else if (groupFilter === "other") {
          matchGroup = !["VIP", "Đối tác", "Thông thường"].includes(group);
        }
      }

      // Trạng thái khách hàng filter
      let matchCustomerStatus = true;
      if (customerStatusFilter !== "all") {
        const hasActiveContract = c.stats.activeCount > 0;
        if (customerStatusFilter === "active") {
          matchCustomerStatus = hasActiveContract;
        } else if (customerStatusFilter === "disabled") {
          matchCustomerStatus = !hasActiveContract;
        }
      }

      // Trạng thái hợp đồng filter
      let matchAct = true;
      if (actFilter === "active") matchAct = c.stats.activeCount > 0;
      if (actFilter === "multi") matchAct = c.stats.count >= 2;
      if (actFilter === "none") matchAct = c.stats.count === 0;

      return matchSearch && matchType && matchGroup && matchCustomerStatus && matchAct;
    });
  }, [enriched, search, typeFilter, groupFilter, customerStatusFilter, actFilter]);

  // Global summary
  const totalCustomers = customerList.length;
  const individualCount = customerList.filter((c) => c.type === "Cá nhân").length;
  const corporateCount = customerList.filter((c) => c.type === "Doanh nghiệp").length;
  const multiContractCount = enriched.filter((c) => c.stats.count >= 2).length;
  const totalContractValue = contracts.reduce((s, c) => s + c.total, 0);

  const openCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setSheetOpen(true);
  };

  useEffect(() => {
    const openCreateDialog = () => {
      setSheetOpen(false);
      setCustomerToEdit(selectedCustomer);
      setCreateOpen(true);
    };
    window.addEventListener("customer-edit-requested", openCreateDialog);
    return () => window.removeEventListener("customer-edit-requested", openCreateDialog);
  }, [selectedCustomer]);

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setCustomerList((current) => current.filter((c) => c.id !== customerId));
    }
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomerList((current) => current.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCustomer(updated);
  };

  const currentPageSelected = filtered.length > 0 && filtered.every((customer) => selectedCustomerIds.has(customer.id));
  const toggleCurrentPageSelection = () => {
    setSelectedCustomerIds((current) => {
      const next = new Set(current);
      if (currentPageSelected) {
        filtered.forEach((customer) => next.delete(customer.id));
      } else {
        filtered.forEach((customer) => next.add(customer.id));
      }
      return next;
    });
  };
  const toggleSelectedCustomer = (customerId: string) => {
    setSelectedCustomerIds((current) => {
      const next = new Set(current);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-7 text-slate-950">Quản lý khách hàng</h1>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">
            {totalCustomers} khách hàng · {contracts.length} hợp đồng tổng cộng
          </p>
        </div>
        <Button size="sm" onClick={() => { setCustomerToEdit(null); setCreateOpen(true); }} className="h-10 gap-2 self-start bg-slate-950 hover:bg-slate-800 sm:self-auto">
          <Users className="w-4 h-4" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CoreMetricCard
          icon={Users}
          label="Tổng khách hàng"
          value={String(totalCustomers)}
          sub="Đã đăng ký"
          iconClass="bg-blue-50"
        />
        <CoreMetricCard
          icon={User}
          label="Khách hàng cá nhân"
          value={String(individualCount)}
          sub={`${corporateCount} doanh nghiệp`}
          iconClass="bg-blue-50"
        />
        <CoreMetricCard
          icon={FileText}
          label="Khách hàng nhiều HĐ"
          value={String(multiContractCount)}
          sub="Khách ≥ 2 hợp đồng"
          iconClass="bg-orange-50"
        />
        <CoreMetricCard
          icon={DollarSign}
          label="Tổng giá trị"
          value={`${fmtVnd(totalContractValue)} đ`}
          sub="Tất cả hợp đồng"
          iconClass="bg-green-50"
        />
      </div>

      {/* Customer Table */}
      <Card className={customerPanelClass}>
        <div className={customerPanelHeaderClass}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách khách hàng</h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {filtered.length} khách hàng phù hợp · {selectedCustomerIds.size}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={customerPanelMetaClass}>{filtered.length} kết quả</span>
              {selectedCustomerIds.size > 0 && (
                <span className={`${customerPanelMetaClass} border-blue-200 bg-blue-50 text-blue-700`}>
                  {selectedCustomerIds.size} đang chọn
                </span>
              )}
              <span className="hidden text-xs text-slate-500 lg:inline">Bấm vào dòng để xem chi tiết khách hàng</span>
            </div>
          </div>
        </div>

        <div className={customerPanelToolbarClass}>
          <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm khách hàng theo tên, điện thoại hoặc email"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger aria-label="Lọc theo loại khách hàng" className={`${compactFilterTriggerClass} w-36 flex-shrink-0`}>
                <SelectValue placeholder="Loại khách hàng" />
              </SelectTrigger>
              <SelectContent>
                {typeFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger aria-label="Lọc theo nhóm khách hàng" className={`${compactFilterTriggerClass} w-36 flex-shrink-0`}>
                <SelectValue placeholder="Nhóm khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nhóm khách hàng</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="partner">Đối tác</SelectItem>
                <SelectItem value="normal">Thông thường</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
              <SelectTrigger aria-label="Lọc theo trạng thái khách hàng" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                <SelectValue placeholder="Trạng thái khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Trạng thái khách hàng</SelectItem>
                <SelectItem value="active">Đã kích hoạt</SelectItem>
                <SelectItem value="disabled">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actFilter} onValueChange={setActFilter}>
              <SelectTrigger aria-label="Lọc theo trạng thái hợp đồng" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                <SelectValue placeholder="Trạng thái hợp đồng" />
              </SelectTrigger>
              <SelectContent>
                {activityFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className={`${compactFilterTriggerClass} w-28 flex-shrink-0`}>
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-[calc(100dvh-320px)] min-h-[420px] max-w-full overflow-auto bg-white">
          <Table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
            <TableHeader className="sticky top-0 z-20">
              <TableRow>
                <TableHead className="sticky left-0 z-40 w-12 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-2 py-2 text-center text-[11px] text-slate-600 shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>
                  <button
                    type="button"
                    aria-label="Chọn tất cả khách hàng đang hiển thị"
                    aria-pressed={currentPageSelected}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${currentPageSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                    onClick={toggleCurrentPageSelection}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className={`${customerTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Mã KH</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-56`} style={{ fontWeight: 650 }}>Khách hàng</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>CCCD/HC</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-52`} style={{ fontWeight: 650 }}>Liên hệ</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Giới tính</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-40`} style={{ fontWeight: 650 }}>Nghề nghiệp</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Nguồn</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-64`} style={{ fontWeight: 650 }}>Địa chỉ liên hệ</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Hợp đồng</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Tổng giá trị</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-40`} style={{ fontWeight: 650 }}>Tiến độ TT</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Nhóm KH</TableHead>
                <TableHead className={`${customerTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Trạng thái KH</TableHead>
                <TableHead className="sticky right-0 z-40 h-10 w-14 border-b border-l border-[#DDE5F0] bg-[#F6F8FB] px-0 py-2 text-center text-[11px] text-slate-600 shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>...</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, index) => {
                const pct = c.stats.totalValue > 0
                  ? Math.round((c.stats.totalPaid / c.stats.totalValue) * 100)
                  : 0;
                const remainingValue = Math.max(0, c.stats.totalValue - c.stats.totalPaid);
                const customerGroup = getCustomerGroup(c, c.stats.count);
                const hasActiveContract = c.stats.activeCount > 0;
                const customerStatus = c.customerStatus ?? (hasActiveContract ? "Đã kích hoạt" : "Vô hiệu hóa");
                const isSelected = selectedCustomerIds.has(c.id);
                const identityNumber = c.cccd || c.taxCode || "—";

                return (
                  <TableRow
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mở chi tiết khách hàng ${c.name}`}
                    data-state={isSelected ? "selected" : undefined}
                    className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) {
                        return;
                      }
                      openCustomer(c);
                    }}
                    onKeyDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) {
                        return;
                      }
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openCustomer(c);
                      }
                    }}
                  >
                    <TableCell className={`td-select sticky left-0 z-10 h-11 w-12 border-b border-r border-[#E5EAF3] px-2 py-1.5 text-center shadow-[6px_0_12px_-12px_rgba(15,23,42,0.45)] ${customerStickyCellClass}`}>
                      <button
                        type="button"
                        className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                        title="Chọn dòng"
                        aria-label={`Chọn khách hàng ${index + 1}`}
                        aria-pressed={isSelected}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSelectedCustomer(c.id);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-28`}>
                      <p className="truncate text-xs text-slate-700" style={{ fontWeight: 650 }}>{c.id}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-56`}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs text-white"
                          style={{ fontWeight: 700, background: c.type === "Doanh nghiệp" ? "#4f46e5" : "#0f766e" }}
                        >
                          {c.type === "Doanh nghiệp"
                            ? <Building2 className="h-4 w-4" />
                            : c.name.split(" ").slice(-1)[0].charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-slate-800 group-hover:text-indigo-700" style={{ fontWeight: 650 }}>{c.name}</p>
                          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-[11px] text-slate-400">{c.type}</span>
                            {customerGroup !== "Thông thường" && (
                              <Badge variant="outline" className={`${customerBadgeClass} h-5 shrink-0 px-2 ${customerGroupClass[customerGroup]}`} style={{ fontWeight: 650 }}>
                                {customerGroup}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-36`}>
                      <p className={`truncate text-xs ${identityNumber === "—" ? "text-slate-300" : "text-slate-700"}`} title={identityNumber}>{identityNumber}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-52`}>
                      <p className="truncate text-xs text-slate-700" style={{ fontWeight: 600 }}>{c.phone}</p>
                      <p className="truncate text-[11px] text-slate-400">{c.email}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-28`}>
                      <p className={`truncate text-xs ${c.gender ? "text-slate-700" : "text-slate-300"}`} title={c.gender || "Chưa cập nhật"}>{c.gender || "—"}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-40`}>
                      <p className={`truncate text-xs ${c.job ? "text-slate-700" : "text-slate-300"}`} title={c.job || "Chưa cập nhật"}>{c.job || "—"}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-32`}>
                      {c.source ? (
                        <Badge variant="outline" className={`${customerBadgeClass} ${customerSourceClass[c.source] ?? customerSourceClass.Khác}`} style={{ fontWeight: 650 }}>
                          {c.source}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-64`}>
                      <p className={`truncate text-xs ${c.address ? "text-slate-700" : "text-slate-300"}`} title={c.address || "Chưa cập nhật"}>{c.address || "—"}</p>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-32`}>
                      <div className="flex items-center gap-2">
                        {hasActiveContract && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />}
                        <div>
                          <p className="text-xs text-slate-800" style={{ fontWeight: 700 }}>{c.stats.count}</p>
                          <p className="text-[11px] text-slate-400">Hợp đồng</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-36`}>
                      <p className="truncate text-xs text-slate-800" style={{ fontWeight: 700 }}>{c.stats.totalValue > 0 ? fmtVnd(c.stats.totalValue) : "—"}</p>
                      {c.stats.totalValue > 0 && <p className="truncate text-[11px] text-slate-400">Còn {fmtVnd(remainingValue)}</p>}
                    </TableCell>
                    <TableCell className={`${customerTableCellClass} w-40`}>
                      {c.stats.totalValue > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full ${progressBarClass(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs text-slate-500">{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className={`td-status ${customerTableCellClass} w-36`} onClick={(event: React.MouseEvent) => event.stopPropagation()}>
                      <Select
                        value={customerGroup}
                        onValueChange={(val: string) => {
                          setPendingGroupChange({ customer: c, newGroup: val });
                          setGroupLogContent(`Chuyển nhóm khách hàng từ "${customerGroup}" sang "${val}"`);
                        }}
                      >
                        <SelectTrigger className={`h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 w-fit gap-1 shadow-none focus:ring-0 [&_svg]:size-3 ${customerGroupClass[customerGroup]}`} style={{ fontWeight: 650 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                          {customerGroupOptions.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`td-status ${customerTableCellClass} w-36`} onClick={(event: React.MouseEvent) => event.stopPropagation()}>
                      <Select
                        value={customerStatus}
                        onValueChange={(val: string) => handleUpdateCustomer({ ...c, customerStatus: val })}
                      >
                        <SelectTrigger className={`h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 w-fit gap-1 shadow-none focus:ring-0 [&_svg]:size-3 ${customerStatusClass(customerStatus === "Đã kích hoạt")}`} style={{ fontWeight: 650 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                          <SelectItem value="Đã kích hoạt">Đã kích hoạt</SelectItem>
                          <SelectItem value="Vô hiệu hóa">Vô hiệu hóa</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-[#E5EAF3] px-0 py-1.5 text-center shadow-[-6px_0_12px_-12px_rgba(15,23,42,0.45)] ${customerStickyCellClass}`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Mở menu khách hàng ${c.name}`} className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300" onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              openCustomer(c);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCustomerToEdit(c);
                              setCreateOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer focus:bg-red-50 focus:text-red-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteCustomer(c.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={15} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-1">
                      <p className="text-sm font-medium text-slate-700">Không tìm thấy khách hàng phù hợp</p>
                      <p className="text-xs text-slate-400">Thử đổi từ khóa tìm kiếm hoặc điều kiện lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={customerPanelFooterClass}>
          <div>Hiển thị {filtered.length} / {customerList.length} khách hàng</div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filtered.length === 0 ? "0-0" : `1-${filtered.length}`} of {filtered.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      {/* Customer Detail Sheet */}
      <CustomerDetailSheet
        customer={selectedCustomer}
        contracts={selectedCustomer ? contracts.filter((c) => c.customerId === selectedCustomer.id) : []}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdateCustomer={handleUpdateCustomer}
      />
      <CustomerCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customerToEdit={customerToEdit}
        onCreated={(customer) => setCustomerList((current) => {
          const exists = current.some((item) => item.id === customer.id);
          if (exists) {
            return current.map((item) => item.id === customer.id ? customer : item);
          }
          return [customer, ...current];
        })}
      />

      <Dialog open={!!pendingGroupChange} onOpenChange={(open) => { if (!open) setPendingGroupChange(null); }}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-2xl">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-900">Cập nhật nhóm khách hàng</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Nhập ghi chú lý do cập nhật nhóm khách hàng của <strong>{pendingGroupChange?.customer.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-500">Nhóm khách hàng mới:</span>
              <Badge variant="outline" className={`${customerBadgeClass} ${customerGroupClass[pendingGroupChange?.newGroup || "Thông thường"]}`}>
                {pendingGroupChange?.newGroup}
              </Badge>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Nội dung nhật ký</span>
              <Textarea
                autoFocus
                value={groupLogContent}
                onChange={(e) => setGroupLogContent(e.target.value)}
                placeholder="Nhập lý do chuyển nhóm..."
                className="min-h-[100px] text-xs resize-none"
              />
            </label>
          </div>
          <DialogFooter className="border-t border-slate-100 bg-slate-50 px-6 py-4 gap-2">
            <Button variant="outline" onClick={() => setPendingGroupChange(null)} className="h-9 text-xs">
              Hủy
            </Button>
            <Button 
              onClick={() => {
                if (pendingGroupChange) {
                  const now = new Date();
                  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
                  const action = groupLogContent.trim() || `Chuyển nhóm khách hàng sang "${pendingGroupChange.newGroup}"`;
                  
                  const defaultJourney = [
                    { time: "09:12 05/06/2026", action: "Submit Form — Điền form quan tâm qua Landing Page", isManual: false },
                    { time: "14:30 06/06/2026", action: "Follow OA — Theo dõi Zalo OA dự án", isManual: false },
                    { time: "10:05 08/06/2026", action: "Chat OA — Trao đổi lần đầu qua Zalo OA", isManual: false },
                    { time: "11:20 10/06/2026", action: "Tham quan nhà mẫu — Check-in tại showroom", isManual: false },
                    { time: "16:45 12/06/2026", action: "Booking — Đặt chỗ giữ căn hộ tầng 12 block A", isManual: false },
                    { time: "09:15 15/06/2026", action: "Đặt lịch ký HĐMB", isManual: false },
                    { time: "14:40 18/06/2026", action: "Ký HĐMB thành công", isManual: false },
                    { time: "10:30 20/06/2026", action: "Thanh toán đợt 1", isManual: false },
                    { time: "16:00 22/06/2026", action: "Nhận bàn giao căn hộ", isManual: false },
                    { time: "09:45 25/06/2026", action: "Hoàn tất hồ sơ khách hàng", isManual: false }
                  ];

                  const currentJourney = pendingGroupChange.customer.journey || defaultJourney;
                  const updatedJourney = [
                    { time: formattedTime, action: action, isManual: true },
                    ...currentJourney
                  ];

                  const updatedCustomer = {
                    ...pendingGroupChange.customer,
                    customerGroup: pendingGroupChange.newGroup,
                    journey: updatedJourney
                  };

                  handleUpdateCustomer(updatedCustomer);
                  setPendingGroupChange(null);
                  setGroupLogContent("");
                }
              }}
              className="h-9 text-xs bg-slate-950 hover:bg-slate-800 text-white px-4"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
