import { useEffect, useState, useMemo } from "react";
import {
  Search, Users, Building2, User, FileText,
  DollarSign, MoreHorizontal, CheckCircle2,
  Eye, Pencil, Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { customers as baseCustomers, contracts, getCustomerStats } from "@/data/mockDataHopDong";
import { ContractScoreCard } from "@/features/contracts/ContractListPage";
import { CustomerDetailSheet } from "./CustomerDetailSheet";
import { CustomerCreateDialog } from "./CustomerCreateDialog";
import type { Customer } from "@/data/mockDataHopDong";

function fmtVnd(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)} triệu`;
  return n.toLocaleString();
}

const typeFilters = [
  { value: "all",         label: "Loại khách hàng" },
  { value: "Cá nhân",    label: "Cá nhân"       },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

const activityFilters = [
  { value: "all",    label: "Trạng thái hợp đồng" },
  { value: "active", label: "Đang có HĐ"        },
  { value: "multi",  label: "Nhiều hợp đồng (≥2)" },
  { value: "none",   label: "Chưa có HĐ nào"    },
];

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";

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

const progressBarClass = (pct: number) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 50) return "bg-blue-500";
  return "bg-red-500";
};

export function CustomerPage() {
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [actFilter, setActFilter]     = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("default");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(() => new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerList, setCustomerList] = useState<Customer[]>(baseCustomers);

  // Precompute stats for every customer
  const enriched = useMemo(() => {
    return customerList.map((c) => {
      const stats = getCustomerStats(c.id);
      const ctrs  = contracts.filter((ct) => ct.customerId === c.id);
      return { ...c, stats, ctrs };
    });
  }, [customerList]);

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || c.type === typeFilter;
      let matchAct = true;
      if (actFilter === "active") matchAct = c.stats.activeCount > 0;
      if (actFilter === "multi")  matchAct = c.stats.count >= 2;
      if (actFilter === "none")   matchAct = c.stats.count === 0;
      return matchSearch && matchType && matchAct;
    });
  }, [enriched, search, typeFilter, actFilter]);

  // Global summary
  const totalCustomers     = customerList.length;
  const individualCount    = customerList.filter((c) => c.type === "Cá nhân").length;
  const corporateCount     = customerList.filter((c) => c.type === "Doanh nghiệp").length;
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
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900">Quản lý khách hàng</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalCustomers} khách hàng · {contracts.length} hợp đồng tổng cộng
          </p>
        </div>
        <Button size="sm" onClick={() => { setCustomerToEdit(null); setCreateOpen(true); }} className="h-10 gap-2 self-start bg-slate-950 hover:bg-slate-800 sm:self-auto">
          <Users className="w-4 h-4" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <ContractScoreCard
          icon={Users}
          label="Tổng khách hàng"
          value={String(totalCustomers)}
          helper="Đã đăng ký"
          iconClass="bg-blue-50"
        />
        <ContractScoreCard
          icon={User}
          label="Khách hàng cá nhân"
          value={String(individualCount)}
          helper={`${corporateCount} doanh nghiệp`}
          iconClass="bg-blue-50"
        />
        <ContractScoreCard
          icon={FileText}
          label="Khách hàng nhiều HĐ"
          value={String(multiContractCount)}
          helper="Khách ≥ 2 hợp đồng"
          iconClass="bg-orange-50"
        />
        <ContractScoreCard
          icon={DollarSign}
          label="Tổng giá trị"
          value={`${fmtVnd(totalContractValue)} đ`}
          helper="Tất cả hợp đồng"
          iconClass="bg-green-50"
        />
      </div>

      {/* Customer Table */}
      <Card className="max-w-full overflow-visible border-[#E5EAF3] bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="grid min-w-0 grid-cols-[minmax(180px,1fr)_118px_126px_142px_142px_94px] items-center gap-2">
            <div className="relative min-w-0">
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
              <SelectTrigger aria-label="Lọc theo loại khách hàng" className={`${compactFilterTriggerClass} w-full`}>
                <SelectValue placeholder="Loại khách hàng" />
              </SelectTrigger>
              <SelectContent>
                {typeFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger aria-label="Lọc theo nhóm khách hàng" className={`${compactFilterTriggerClass} w-full`}>
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
              <SelectTrigger aria-label="Lọc theo trạng thái khách hàng" className={`${compactFilterTriggerClass} w-full`}>
                <SelectValue placeholder="Trạng thái khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Trạng thái khách hàng</SelectItem>
                <SelectItem value="active">Đã kích hoạt</SelectItem>
                <SelectItem value="disabled">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actFilter} onValueChange={setActFilter}>
              <SelectTrigger aria-label="Lọc theo trạng thái hợp đồng" className={`${compactFilterTriggerClass} w-full`}>
                <SelectValue placeholder="Trạng thái hợp đồng" />
              </SelectTrigger>
              <SelectContent>
                {activityFilters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className={`${compactFilterTriggerClass} w-full`}>
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-[calc(100dvh-336px)] min-h-[420px] max-w-full overflow-auto">
          <table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-40 w-12 border-b border-r border-[#24344f] bg-[#0F2747] px-2 py-2 text-center text-[11px] text-white" style={{ fontWeight: 650 }}>
                  <button
                    type="button"
                    aria-label="Chọn tất cả khách hàng đang hiển thị"
                    aria-pressed={currentPageSelected}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition ${currentPageSelected ? "border-white bg-white text-[#0F2747]" : "border-white/60 bg-white/10 text-transparent"}`}
                    onClick={toggleCurrentPageSelection}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="h-11 w-28 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Mã KH</th>
                <th className="h-11 w-56 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Khách hàng</th>
                <th className="h-11 w-36 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>CCCD/HC</th>
                <th className="h-11 w-52 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Liên hệ</th>
                <th className="h-11 w-32 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Hợp đồng</th>
                <th className="h-11 w-36 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Tổng giá trị</th>
                <th className="h-11 w-40 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Tiến độ TT</th>
                <th className="h-11 w-32 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Nhóm KH</th>
                <th className="h-11 w-36 border-b border-r border-[#24344f] bg-[#0F2747] px-3 py-2 text-left align-middle text-[11px] text-white" style={{ fontWeight: 650 }}>Trạng thái KH</th>
                <th className="sticky right-0 z-40 h-11 w-14 border-b border-l border-[#24344f] bg-[#0F2747] px-0 py-2 text-center text-[11px] text-white" style={{ fontWeight: 650 }}>...</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, index) => {
                const pct = c.stats.totalValue > 0
                  ? Math.round((c.stats.totalPaid / c.stats.totalValue) * 100)
                  : 0;
                const remainingValue = Math.max(0, c.stats.totalValue - c.stats.totalPaid);
                const customerGroup = getCustomerGroup(c, c.stats.count);
                const hasActiveContract = c.stats.activeCount > 0;
                const customerStatus = hasActiveContract ? "Đã kích hoạt" : "Vô hiệu hóa";
                const isSelected = selectedCustomerIds.has(c.id);
                const identityNumber = c.cccd || c.taxCode || "—";

                return (
                  <tr
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mở chi tiết khách hàng ${c.name}`}
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
                    <td className="td-select sticky left-0 z-10 h-11 w-12 border-b border-r border-[#E5EAF3] bg-white px-2 py-1.5 text-center group-hover:bg-slate-50">
                      <button
                        type="button"
                        className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition ${isSelected ? "border-[#0F2747] bg-[#0F2747] text-white" : "border-[#E5EAF3] bg-white text-transparent hover:border-slate-400"}`}
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
                    </td>
                    <td className="h-11 w-28 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <p className="truncate text-xs text-slate-700" style={{ fontWeight: 650 }}>{c.id}</p>
                    </td>
                    <td className="h-11 w-56 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
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
                              <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] ring-1 ${customerGroupClass[customerGroup]}`} style={{ fontWeight: 650 }}>
                                {customerGroup}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="h-11 w-36 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <p className={`truncate text-xs ${identityNumber === "—" ? "text-slate-300" : "text-slate-700"}`} title={identityNumber}>{identityNumber}</p>
                    </td>
                    <td className="h-11 w-52 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <p className="truncate text-xs text-slate-700" style={{ fontWeight: 600 }}>{c.phone}</p>
                      <p className="truncate text-[11px] text-slate-400">{c.email}</p>
                    </td>
                    <td className="h-11 w-32 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        {hasActiveContract && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />}
                        <div>
                          <p className="text-xs text-slate-800" style={{ fontWeight: 700 }}>{c.stats.count}</p>
                          <p className="text-[11px] text-slate-400">Hợp đồng</p>
                        </div>
                      </div>
                    </td>
                    <td className="h-11 w-36 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <p className="truncate text-xs text-slate-800" style={{ fontWeight: 700 }}>{c.stats.totalValue > 0 ? fmtVnd(c.stats.totalValue) : "—"}</p>
                      {c.stats.totalValue > 0 && <p className="truncate text-[11px] text-slate-400">Còn {fmtVnd(remainingValue)}</p>}
                    </td>
                    <td className="h-11 w-40 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
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
                    </td>
                    <td className="h-11 w-32 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ring-1 ${customerGroupClass[customerGroup]}`} style={{ fontWeight: 650 }}>{customerGroup}</span>
                    </td>
                    <td className="h-11 w-36 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ring-1 ${hasActiveContract ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-600 ring-slate-200"}`} style={{ fontWeight: 650 }}>
                        {customerStatus}
                      </span>
                    </td>
                    <td className="td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-[#E5EAF3] bg-white px-0 py-1.5 text-center group-hover:bg-slate-50">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Mở menu khách hàng ${c.name}`} className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100" onClick={(event) => event.stopPropagation()}>
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
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-400">
                    Không tìm thấy khách hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex h-12 items-center justify-between border-t border-[#E5EAF3] bg-white px-4 text-xs text-slate-500">
          <div>Hiển thị {filtered.length} / {customerList.length} khách hàng</div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {filtered.length === 0 ? "0-0" : `1-${filtered.length}`} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Detail Sheet */}
      <CustomerDetailSheet
        customer={selectedCustomer}
        contracts={selectedCustomer ? contracts.filter((c) => c.customerId === selectedCustomer.id) : []}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
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
    </div>
  );
}
