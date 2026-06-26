import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2, XCircle,
  Eye, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ContractDetailSheet } from "../contracts/ContractDetailSheet";
import type { Customer, Contract } from "@/data/mockDataHopDong";

const statusConfig: Record<string, string> = {
  "Đang ký":   "bg-blue-100 text-blue-700 border-blue-200",
  "Đã ký":     "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Công chứng":"bg-indigo-100 text-indigo-700 border-indigo-200",
  "Đã hủy":   "bg-red-100 text-red-700 border-red-200",
};

type CustomerDetailTab =
  | "extraInfo"
  | "interactionHistory"
  | "journey"
  | "debt"
  | "pointHistory"
  | "bookingHistory"
  | "ticket";

const customerDetailTabs: Array<{ value: CustomerDetailTab; label: string }> = [
  { value: "extraInfo", label: "Thông tin thêm" },
  { value: "interactionHistory", label: "Lịch sử trao đổi" },
  { value: "journey", label: "Hành trình khách hàng" },
  { value: "debt", label: "Công nợ" },
  { value: "pointHistory", label: "Lịch sử tích đổi điểm" },
  { value: "bookingHistory", label: "Lịch sử booking" },
  { value: "ticket", label: "Ticket" },
];

interface CustomerDetailSheetProps {
  customer: Customer | null;
  contracts: Contract[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CustomerDetailStats = {
  totalValue: number;
  totalPaid: number;
  outstanding: number;
  activeCount: number;
  cancelCount: number;
  overallPct: number;
};

type CustomerDetailPageProps = {
  customer: Customer;
  contracts: Contract[];
  stats: CustomerDetailStats;
  onOpenContract: (contract: Contract) => void;
};

export function CustomerDetailSheet({ customer, contracts, open, onOpenChange }: CustomerDetailSheetProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractSheetOpen, setContractSheetOpen] = useState(false);

  if (!customer) return null;

  const totalValue   = contracts.reduce((s, c) => s + c.total, 0);
  const totalPaid    = contracts.reduce((s, c) => s + c.paid, 0);
  const outstanding  = totalValue - totalPaid;
  const activeCount  = contracts.filter((c) => c.status !== "Đã hủy").length;
  const cancelCount  = contracts.filter((c) => c.status === "Đã hủy").length;
  const overallPct   = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0;

  const openContract = (c: Contract) => {
    setSelectedContract(c);
    setContractSheetOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="top"
          className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1440px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1440px]"
          aria-describedby={undefined}
        >
          <CustomerDetailPage customer={customer} contracts={contracts} stats={{ totalValue, totalPaid, outstanding, activeCount, cancelCount, overallPct }} onOpenContract={openContract} />
        </SheetContent>
      </Sheet>

      {/* Nested Contract Detail Sheet */}
      <ContractDetailSheet
        contract={selectedContract}
        open={contractSheetOpen}
        onOpenChange={setContractSheetOpen}
      />
    </>
  );
}

function CustomerDetailPage({ customer, contracts, stats, onOpenContract }: CustomerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("extraInfo");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SheetTitle className="sr-only">Hồ sơ khách hàng {customer.name}</SheetTitle>
      <CustomerDetailHeader />
      <CustomerSummaryCard customer={customer} stats={stats} />
      <CustomerDetailBody
        customer={customer}
        contracts={contracts}
        stats={stats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenContract={onOpenContract}
      />
    </div>
  );
}

function CustomerDetailHeader() {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
      <h2 className="text-base text-slate-950" style={{ fontWeight: 700 }}>Chi tiết khách hàng</h2>
    </div>
  );
}

function CustomerSummaryCard({ customer, stats }: { customer: Customer; stats: CustomerDetailStats }) {
  const isVip = customer.customerGroup === "VIP" || customer.note?.toLowerCase().includes("vip");
  const isActive = stats.activeCount > 0;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white">
      <div className="min-w-0 px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[26px] leading-8 text-slate-950" style={{ fontWeight: 750 }}>{customer.name}</h3>
          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />
          <span className="text-sm text-slate-600">{isActive ? "Đang hoạt động" : "Chưa hoạt động"}</span>
          {isVip && (
            <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700" style={{ fontWeight: 650 }}>
              VIP
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>ID khách hàng: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.id}</span></span>
          <span className="text-slate-300">•</span>
          <span>Ngày tham gia: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.joinDate || "Chưa cập nhật"}</span></span>
          <span className="text-slate-300">•</span>
          <span>Cập nhật lần cuối: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.joinDate || "Chưa cập nhật"}</span></span>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailBody({
  customer,
  contracts,
  stats,
  activeTab,
  onTabChange,
  onOpenContract,
}: {
  customer: Customer;
  contracts: Contract[];
  stats: CustomerDetailStats;
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CustomerProfileSidebar customer={customer} stats={stats} />
        <CustomerMainPanel
          customer={customer}
          contracts={contracts}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenContract={onOpenContract}
        />
      </div>
      <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6">
        <SheetClose asChild>
          <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
            Đóng
          </Button>
        </SheetClose>
        <Button
          className="h-9 rounded-lg bg-black px-4 text-sm text-white hover:bg-slate-800"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("customer-edit-requested"));
          }}
        >
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
}

function CustomerProfileSidebar({ customer }: { customer: Customer; stats: CustomerDetailStats }) {
  const empty = "Chưa cập nhật";
  const rows = [
    { label: "Họ và tên", value: customer.name || empty },
    { label: "Email", value: customer.email || empty, copyable: Boolean(customer.email) },
    { label: "Số điện thoại", value: customer.phone || empty, copyable: Boolean(customer.phone) },
    { label: "Ngày sinh", value: customer.dob || empty },
    { label: "Giới tính", value: customer.gender || empty },
    { label: "Quốc gia", value: customer.country || empty, prefix: customer.country ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-yellow-200">★</span> : undefined },
    { label: "CCCD/HC", value: customer.cccd || empty },
    { label: "Địa chỉ", value: customer.address || empty },
    { label: "Nghề nghiệp", value: customer.job || empty },
  ];

  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-5">
      <div className="aspect-[1.04] w-full overflow-hidden rounded-lg bg-slate-100 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80"
          alt={`Ảnh đại diện ${customer.name}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.1fr)] items-center gap-3 py-2.5 text-sm">
            <p className="text-slate-500">{row.label}</p>
            <div className="flex min-w-0 items-center justify-end gap-2">
              {row.prefix}
              <p className={`min-w-0 truncate text-right text-slate-950 ${row.valueClass ?? ""}`} style={{ fontWeight: row.valueClass ? 500 : 400 }}>
                {row.value}
              </p>
              {row.copyable && (
                <button type="button" className="relative h-4 w-4 shrink-0 text-slate-400" aria-label={`Sao chép ${row.label.toLowerCase()}`}>
                  <span className="absolute left-1 top-0 h-3 w-3 rounded-[2px] border border-current bg-white" />
                  <span className="absolute left-0 top-1 h-3 w-3 rounded-[2px] border border-current bg-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function CustomerMainPanel({
  customer,
  contracts,
  activeTab,
  onTabChange,
  onOpenContract,
}: {
  customer: Customer;
  contracts: Contract[];
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <CustomerTabsNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CustomerTabContent
          activeTab={activeTab}
          customer={customer}
          contracts={contracts}
          onOpenContract={onOpenContract}
        />
      </div>
    </div>
  );
}

function CustomerTabsNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex h-10 w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        {customerDetailTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              className={`h-8 shrink-0 rounded-md px-3.5 text-sm transition-colors ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
              style={{ fontWeight: isActive ? 650 : 500 }}
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomerTabContent({
  activeTab,
  customer,
  contracts,
  onOpenContract,
}: {
  activeTab: CustomerDetailTab;
  customer: Customer;
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
}) {
  switch (activeTab) {
    case "extraInfo":
      return <CustomerExtraInfoTab customer={customer} />;
    case "debt":
      return <CustomerDebtTab customer={customer} contracts={contracts} onOpenContract={onOpenContract} />;
    case "interactionHistory":
      return <CustomerInteractionHistoryTab />;
    case "journey":
      return <CustomerJourneyTab />;
    case "pointHistory":
      return <CustomerPlaceholderTab title="Lịch sử tích đổi điểm" />;
    case "bookingHistory":
      return <CustomerPlaceholderTab title="Lịch sử booking" />;
    case "ticket":
      return <CustomerPlaceholderTab title="Ticket" />;
    default:
      return <CustomerExtraInfoTab customer={customer} />;
  }
}

function CustomerDebtTab({
  customer,
  contracts,
  onOpenContract,
}: {
  customer: Customer;
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-3 px-5 py-4">
      {contracts.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Khách hàng chưa có hợp đồng nào
        </div>
      ) : (
        contracts.map((c) => {
          const hasOverdue = c.payments.some((p) => p.status === "overdue");
          return (
            <div
              key={c.id}
              className={`border rounded-xl p-4 transition-all cursor-pointer hover:shadow-sm hover:border-indigo-200 group ${
                hasOverdue ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"
              }`}
              onClick={() => onOpenContract(c)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs text-indigo-600" style={{ fontWeight: 700 }}>{c.id}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs ${statusConfig[c.status]}`} style={{ fontWeight: 500 }}>
                      {c.status}
                    </span>
                    {hasOverdue && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600" style={{ fontWeight: 500 }}>
                        <XCircle className="w-3 h-3" /> Quá hạn TT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 500 }}>{c.property}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.type} · Ký {c.date} · NV: {c.salesperson}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${c.pct === 100 ? "bg-emerald-500" : hasOverdue ? "bg-red-400" : "bg-blue-500"}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0 w-8 text-right">{c.pct}%</span>
                <span className="text-xs text-slate-700 shrink-0" style={{ fontWeight: 600 }}>{c.value} đ</span>
              </div>

              <div className="flex gap-2 mt-2.5 flex-wrap">
                {c.payments.some((p) => p.status === "on-time") && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {c.payments.filter((p) => p.status === "on-time").length} đúng hạn
                  </span>
                )}
                {c.payments.some((p) => p.status === "overdue") && (
                  <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                    <XCircle className="w-3 h-3" />
                    {c.payments.filter((p) => p.status === "overdue").length} quá hạn
                  </span>
                )}
                {c.payments.some((p) => p.status === "pending") && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                    {c.payments.filter((p) => p.status === "pending").length} chờ thanh toán
                  </span>
                )}
                {c.payments.length === 0 && (
                  <span className="text-xs text-slate-400">Không có lịch thanh toán</span>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/debt/customer/${customer.id}/contract/${c.id}`); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem chi tiết HĐ
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CustomerExtraInfoTab({ customer }: { customer: Customer }) {
  const empty = "Chưa cập nhật";
  const rows = [
    { label: "Gu sống", value: customer.lifestyle || empty },
    { label: "Nhóm khách hàng", value: customer.customerGroup || empty },
    { label: "Sở thích", value: customer.hobbies || empty },
    { label: "Wellness / Living Style", value: customer.wellnessStyle || empty },
    { label: "Nhu cầu đầu tư / an cư", value: customer.housingNeed || empty },
    { label: "Ghi chú", value: customer.careNote || customer.note || empty },
  ];

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[minmax(170px,0.38fr)_1fr] gap-7 py-5 first:pt-0 last:pb-0">
              <p className="text-[15px] text-slate-500">{row.label}</p>
              <p className="max-w-[760px] text-[15px] leading-6 text-slate-950" style={{ fontWeight: 650 }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerPlaceholderTab({ title }: { title: string }) {
  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>{title}</p>
        <p className="mt-1 text-xs text-slate-400">Nội dung sẽ được triển khai trong phase riêng.</p>
      </div>
    </div>
  );
}

const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split(" ");
  const dateParts = parts[1].split("/");
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);
  const timeParts = parts[0].split(":");
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  return new Date(year, month, day, hour, minute);
};

function CustomerInteractionHistoryTab() {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("default");
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const data = [
    { time: "09:12 05/06/2026", source: "Facebook", content: "Khách hỏi về dự án Vinhomes Grand Park" },
    { time: "14:30 06/06/2026", source: "Zalo", content: "Khách nhắn theo dõi OA" },
    { time: "10:05 08/06/2026", source: "Website", content: "Khách hỏi tiến độ thanh toán" },
    { time: "11:20 10/06/2026", source: "Zalo", content: "Khách gọi xác nhận lịch tham quan" },
    { time: "16:45 12/06/2026", source: "Facebook", content: "Khách hỏi thêm về tiện ích nội khu" },
    { time: "09:30 13/06/2026", source: "Hotline", content: "Nhân viên tư vấn gọi lại khách hàng" },
    { time: "15:20 15/06/2026", source: "Email", content: "Gửi bảng giá và chính sách bán hàng" },
    { time: "08:50 18/06/2026", source: "Zalo", content: "Khách xác nhận đã nhận tài liệu" },
    { time: "13:10 20/06/2026", source: "Website", content: "Khách yêu cầu liên hệ lại" },
    { time: "17:40 22/06/2026", source: "Facebook", content: "Khách hỏi chương trình ưu đãi mới" }
  ];

  const baselineDate = new Date(2026, 5, 25, 23, 59, 59);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchesSearch =
          item.content.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.time.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      const itemDate = parseDateString(item.time);
      if (timeFilter === "7") {
        const sevenDaysAgo = new Date(baselineDate);
        sevenDaysAgo.setDate(baselineDate.getDate() - 7);
        if (itemDate < sevenDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "30") {
        const thirtyDaysAgo = new Date(baselineDate);
        thirtyDaysAgo.setDate(baselineDate.getDate() - 30);
        if (itemDate < thirtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "60") {
        const sixtyDaysAgo = new Date(baselineDate);
        sixtyDaysAgo.setDate(baselineDate.getDate() - 60);
        if (itemDate < sixtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "custom" && dateRange?.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.to ? new Date(dateRange.to) : new Date(start);
        end.setHours(23, 59, 59, 999);
        if (itemDate < start || itemDate > end) return false;
      }

      if (sourceFilter !== "all" && item.source !== sourceFilter) {
        return false;
      }
      return true;
    });
  }, [search, timeFilter, dateRange, sourceFilter, displayFilter]);

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="grid min-w-0 grid-cols-[1fr_130px_120px_120px] items-center gap-2">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm kiếm lịch sử trao đổi"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Popover open={isCalendarOpen} onOpenChange={(open) => {
              setIsCalendarOpen(open);
              if (!open && timeFilter === "custom" && !dateRange) {
                setTimeFilter("all");
              }
            }}>
              <PopoverTrigger asChild>
                <div className="w-full">
                  <Select
                    value={timeFilter}
                    onValueChange={(val) => {
                      setTimeFilter(val);
                      if (val === "custom") {
                        setTempRange(dateRange);
                        setIsCalendarOpen(true);
                      } else {
                        setDateRange(undefined);
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo thời gian" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full truncate">
                      <SelectValue placeholder="Thời gian">
                        {timeFilter === "7" ? "7 ngày" :
                         timeFilter === "30" ? "30 ngày" :
                         timeFilter === "60" ? "60 ngày" :
                         timeFilter === "custom" && dateRange?.from ? 
                           `${format(dateRange.from, "dd/MM")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM")}` : ""}` :
                           "Thời gian"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Thời gian</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="30">30 ngày</SelectItem>
                      <SelectItem value="60">60 ngày</SelectItem>
                      <SelectItem value="custom">Khoảng thời gian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(2026, 5)}
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-white">
                  <span className="text-xs text-slate-500 font-medium">
                    {tempRange?.from ? format(tempRange.from, "MM/dd/yyyy") : ""}
                    {tempRange?.to ? ` - ${format(tempRange.to, "MM/dd/yyyy")}` : ""}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" className="h-7 text-xs px-2.5" onClick={() => {
                      setIsCalendarOpen(false);
                      if (!dateRange) setTimeFilter("all");
                    }}>Cancel</Button>
                    <Button className="h-7 text-xs px-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium rounded-md" onClick={() => {
                      setDateRange(tempRange);
                      setIsCalendarOpen(false);
                    }}>Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger aria-label="Lọc theo nguồn" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                <SelectValue placeholder="Nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nguồn</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Zalo">Zalo</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Hotline">Hotline</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 w-[260px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Thời gian</th>
                <th className="h-10 w-[220px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Nguồn</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Nội dung</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-medium">{item.time}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-medium">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      item.source === "Facebook" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      item.source === "Zalo" ? "bg-sky-50 text-sky-700 border border-sky-100" :
                      item.source === "Website" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      item.source === "Email" ? "bg-orange-50 text-orange-700 border border-orange-100" :
                      "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}>
                      {item.source}
                    </span>
                  </td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-700">{item.content}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="flex h-12 items-center justify-between border-t border-[#E5EAF3] bg-white px-4 text-xs text-slate-500">
          <div>Hiển thị {filteredData.length} / {data.length} dòng</div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {filteredData.length > 0 ? `1–${filteredData.length}` : "0–0"} of {filteredData.length > 0 ? 52 : 0}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerJourneyTab() {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("default");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const data = [
    { time: "09:12 05/06/2026", action: "Submit Form — Điền form quan tâm qua Landing Page" },
    { time: "14:30 06/06/2026", action: "Follow OA — Theo dõi Zalo OA dự án" },
    { time: "10:05 08/06/2026", action: "Chat OA — Trao đổi lần đầu qua Zalo OA" },
    { time: "11:20 10/06/2026", action: "Tham quan nhà mẫu — Check-in tại showroom" },
    { time: "16:45 12/06/2026", action: "Booking — Đặt chỗ giữ căn hộ tầng 12 block A" },
    { time: "09:15 15/06/2026", action: "Đặt lịch ký HĐMB" },
    { time: "14:40 18/06/2026", action: "Ký HĐMB thành công" },
    { time: "10:30 20/06/2026", action: "Thanh toán đợt 1" },
    { time: "16:00 22/06/2026", action: "Nhận bàn giao căn hộ" },
    { time: "09:45 25/06/2026", action: "Hoàn tất hồ sơ khách hàng" }
  ];

  const baselineDate = new Date(2026, 5, 25, 23, 59, 59);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchesSearch =
          item.action.toLowerCase().includes(query) ||
          item.time.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      const itemDate = parseDateString(item.time);
      if (timeFilter === "7") {
        const sevenDaysAgo = new Date(baselineDate);
        sevenDaysAgo.setDate(baselineDate.getDate() - 7);
        if (itemDate < sevenDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "30") {
        const thirtyDaysAgo = new Date(baselineDate);
        thirtyDaysAgo.setDate(baselineDate.getDate() - 30);
        if (itemDate < thirtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "60") {
        const sixtyDaysAgo = new Date(baselineDate);
        sixtyDaysAgo.setDate(baselineDate.getDate() - 60);
        if (itemDate < sixtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "custom" && dateRange?.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.to ? new Date(dateRange.to) : new Date(start);
        end.setHours(23, 59, 59, 999);
        if (itemDate < start || itemDate > end) return false;
      }

      if (displayFilter !== "default") {
        if (displayFilter === "all") return true;
      }
      return true;
    });
  }, [search, timeFilter, dateRange, displayFilter]);

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="grid min-w-0 grid-cols-[1fr_150px_120px] items-center gap-2">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm kiếm hành trình khách hàng"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Popover open={isCalendarOpen} onOpenChange={(open) => {
              setIsCalendarOpen(open);
              if (!open && timeFilter === "custom" && !dateRange) {
                setTimeFilter("all");
              }
            }}>
              <PopoverTrigger asChild>
                <div className="w-full">
                  <Select
                    value={timeFilter}
                    onValueChange={(val) => {
                      setTimeFilter(val);
                      if (val === "custom") {
                        setTempRange(dateRange);
                        setIsCalendarOpen(true);
                      } else {
                        setDateRange(undefined);
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo thời gian" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full truncate">
                      <SelectValue placeholder="Thời gian">
                        {timeFilter === "7" ? "7 ngày" :
                         timeFilter === "30" ? "30 ngày" :
                         timeFilter === "60" ? "60 ngày" :
                         timeFilter === "custom" && dateRange?.from ? 
                           `${format(dateRange.from, "dd/MM")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM")}` : ""}` :
                           "Thời gian"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Thời gian</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="30">30 ngày</SelectItem>
                      <SelectItem value="60">60 ngày</SelectItem>
                      <SelectItem value="custom">Khoảng thời gian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(2026, 5)}
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-white">
                  <span className="text-xs text-slate-500 font-medium">
                    {tempRange?.from ? format(tempRange.from, "MM/dd/yyyy") : ""}
                    {tempRange?.to ? ` - ${format(tempRange.to, "MM/dd/yyyy")}` : ""}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" className="h-7 text-xs px-2.5" onClick={() => {
                      setIsCalendarOpen(false);
                      if (!dateRange) setTimeFilter("all");
                    }}>Cancel</Button>
                    <Button className="h-7 text-xs px-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium rounded-md" onClick={() => {
                      setDateRange(tempRange);
                      setIsCalendarOpen(false);
                    }}>Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 w-[260px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Thời gian</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-medium">{item.time}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-700">{item.action}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-xs text-slate-400">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="flex h-12 items-center justify-between border-t border-[#E5EAF3] bg-white px-4 text-xs text-slate-500">
          <div>Hiển thị {filteredData.length} / {data.length} dòng</div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {filteredData.length > 0 ? `1–${filteredData.length}` : "0–0"} of {filteredData.length > 0 ? 52 : 0}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
