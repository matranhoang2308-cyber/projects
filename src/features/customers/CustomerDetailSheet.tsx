import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Eye, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
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
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ContractDetailSheet } from "../contracts/ContractDetailSheet";
import { PaymentDetails } from "../debt/PaymentDetails";
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
  | "contracts"
  | "pointHistory"
  | "bookingHistory"
  | "ticket";

const customerDetailTabs: Array<{ value: CustomerDetailTab; label: string }> = [
  { value: "extraInfo", label: "Thông tin thêm" },
  { value: "interactionHistory", label: "Lịch sử trao đổi" },
  { value: "journey", label: "Hành trình khách hàng" },
  { value: "debt", label: "Công nợ" },
  { value: "contracts", label: "Hợp đồng" },
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
  onOpenDebtDetail: (contract: Contract) => void;
};

export function CustomerDetailSheet({ customer, contracts, open, onOpenChange }: CustomerDetailSheetProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractSheetOpen, setContractSheetOpen] = useState(false);
  const [selectedDebtContract, setSelectedDebtContract] = useState<Contract | null>(null);
  const [debtSheetOpen, setDebtSheetOpen] = useState(false);

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

  const openDebtDetail = (c: Contract) => {
    setSelectedDebtContract(c);
    setDebtSheetOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="top"
          className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1440px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1440px]"
          aria-describedby={undefined}
        >
          <CustomerDetailPage customer={customer} contracts={contracts} stats={{ totalValue, totalPaid, outstanding, activeCount, cancelCount, overallPct }} onOpenContract={openContract} onOpenDebtDetail={openDebtDetail} />
        </SheetContent>
      </Sheet>

      {/* Nested Contract Detail Sheet */}
      <ContractDetailSheet
        contract={selectedContract}
        open={contractSheetOpen}
        onOpenChange={setContractSheetOpen}
      />

      <Sheet open={debtSheetOpen} onOpenChange={setDebtSheetOpen}>
        <SheetContent
          className="w-full p-0 sm:max-w-[1180px]"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Chi tiết công nợ {selectedDebtContract?.id}</SheetTitle>
          {selectedDebtContract && (
            <PaymentDetails
              customerId={customer.id}
              contractId={selectedDebtContract.id}
              mode="sheet"
              onClose={() => setDebtSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CustomerDetailPage({ customer, contracts, stats, onOpenContract, onOpenDebtDetail }: CustomerDetailPageProps) {
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
        onOpenDebtDetail={onOpenDebtDetail}
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
  onOpenDebtDetail,
}: {
  customer: Customer;
  contracts: Contract[];
  stats: CustomerDetailStats;
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
  onOpenDebtDetail: (contract: Contract) => void;
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
          onOpenDebtDetail={onOpenDebtDetail}
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (label: string, value: string) => {
    if (!value || value === empty) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedField(label);
      window.setTimeout(() => setCopiedField((current) => (current === label ? null : current)), 1600);
    } catch {
      setCopiedField(null);
    }
  };

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
                <button
                  type="button"
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    copiedField === row.label
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                  aria-label={`${copiedField === row.label ? "Đã sao chép" : "Sao chép"} ${row.label.toLowerCase()}`}
                  title={`${copiedField === row.label ? "Đã sao chép" : "Sao chép"} ${row.label.toLowerCase()}`}
                  onClick={() => copyToClipboard(row.label, row.value)}
                >
                  {copiedField === row.label ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span aria-hidden="true" className="relative block h-4 w-4">
                      <span className="absolute left-1 top-0 h-3 w-3 rounded-[2px] border border-current bg-white" />
                      <span className="absolute left-0 top-1 h-3 w-3 rounded-[2px] border border-current bg-white" />
                    </span>
                  )}
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
  onOpenDebtDetail,
}: {
  customer: Customer;
  contracts: Contract[];
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
  onOpenDebtDetail: (contract: Contract) => void;
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
          onOpenDebtDetail={onOpenDebtDetail}
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
  onOpenDebtDetail,
}: {
  activeTab: CustomerDetailTab;
  customer: Customer;
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
  onOpenDebtDetail: (contract: Contract) => void;
}) {
  switch (activeTab) {
    case "extraInfo":
      return <CustomerExtraInfoTab customer={customer} />;
    case "debt":
      return <CustomerDebtTab customer={customer} contracts={contracts} onOpenDebtDetail={onOpenDebtDetail} />;
    case "contracts":
      return <CustomerContractsTab contracts={contracts} onOpenContract={onOpenContract} />;
    case "interactionHistory":
      return <CustomerInteractionHistoryTab />;
    case "journey":
      return <CustomerJourneyTab />;
    case "pointHistory":
      return <CustomerPointHistoryTab />;
    case "bookingHistory":
      return <CustomerBookingHistoryTab />;
    case "ticket":
      return <CustomerTicketTab />;
    default:
      return <CustomerExtraInfoTab customer={customer} />;
  }
}

type DebtPaymentFilter = "all" | "on-time" | "upcoming" | "overdue" | "completed" | "unpaid";

const debtFilterOptions: Array<{ value: DebtPaymentFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "on-time", label: "Đúng hạn" },
  { value: "upcoming", label: "Sắp đến hạn" },
  { value: "overdue", label: "Quá hạn" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "unpaid", label: "Chưa thanh toán" },
];

const debtTableHeaderClass = "h-11 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const debtTableCellClass = "h-[58px] border-b border-r border-[#E5EAF3] bg-white px-3 py-2 align-middle text-xs text-slate-700 transition-colors group-hover:bg-[#F8FAFC]";
const debtBadgeClass = "inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1";

function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function parseMoney(value?: string) {
  return Number(value?.replace(/[^\d]/g, "") || 0);
}

function parseVietnameseDate(date: string) {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function getUnitCode(property: string) {
  const normalized = property
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  const codeMatch = normalized.match(/[A-Z]\d(?:[-.]\d{2,4})?|[A-Z]\d-\d{2,4}|[A-Z]-\d{2,4}|[A-Z]\d{1,2}-\d{2}|[A-Z]\d{1,2}-[A-Z]?\d{2,4}/);
  if (codeMatch) return codeMatch[0].replace(".", "-");
  const words = normalized.match(/[A-Z0-9]+/g) ?? [];
  return words.slice(-3).join("-") || property;
}

function getDebtPaymentGroup(contract: Contract): DebtPaymentFilter {
  if (contract.pct >= 100) return "completed";
  if (contract.paid <= 0) return "unpaid";
  if (contract.payments.some((payment) => payment.status === "overdue")) return "overdue";
  if (contract.payments.some((payment) => payment.status === "pending")) return "upcoming";
  return "on-time";
}

function getDebtOverdueMeta(contract: Contract) {
  const overduePayments = contract.payments.filter((payment) => payment.status === "overdue");
  if (contract.pct >= 100) return { label: "Đúng hạn", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", days: 0, penalty: 0 };
  if (overduePayments.length === 0) return { label: "Đúng hạn", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", days: 0, penalty: 0 };

  const today = new Date();
  const maxDays = Math.max(
    ...overduePayments.map((payment) => {
      const dueDate = parseVietnameseDate(payment.due);
      return Math.max(1, Math.floor((today.getTime() - dueDate.getTime()) / 86_400_000));
    }),
  );
  const penalty = overduePayments.reduce((sum, payment) => sum + parseMoney(payment.extension?.penaltyAmount), 0);
  const group = maxDays >= 60 ? 60 : maxDays >= 30 ? 30 : maxDays;

  return {
    label: group >= 30 ? `Quá hạn ${group} ngày` : `Quá hạn ${maxDays} ngày`,
    className: group >= 60 ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-red-50 text-red-700 ring-red-200",
    days: maxDays,
    penalty,
  };
}

function CustomerDebtTab({
  customer,
  contracts,
  onOpenDebtDetail,
}: {
  customer: Customer;
  contracts: Contract[];
  onOpenDebtDetail: (contract: Contract) => void;
}) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<DebtPaymentFilter>("all");
  const [displayFilter, setDisplayFilter] = useState("default");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [page, setPage] = useState(1);

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contracts.filter((contract) => {
      const unitCode = getUnitCode(contract.property);
      const paymentGroup = getDebtPaymentGroup(contract);
      const matchesSearch =
        !query ||
        contract.id.toLowerCase().includes(query) ||
        unitCode.toLowerCase().includes(query) ||
        contract.customer.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query);
      const matchesFilter = paymentFilter === "all" || paymentGroup === paymentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [contracts, customer.name, paymentFilter, search]);

  const perPage = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const visibleContracts = filteredContracts.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-[#E5EAF3] bg-white px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[220px] flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm..."
                  aria-label="Tìm kiếm công nợ theo ID, mã căn, mã hợp đồng hoặc tên khách hàng"
                  className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <Select
                value={paymentFilter}
                onValueChange={(value) => {
                  setPaymentFilter(value as DebtPaymentFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger aria-label="Lọc theo trạng thái thanh toán" className="h-9 w-full rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none sm:w-52">
                  <SelectValue placeholder="Trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  {debtFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className="h-9 w-full rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none sm:w-28">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table className="min-w-[1320px] border-separate border-spacing-0 text-sm">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>ID công nợ</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Mã căn</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Ngày ký</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>NV phụ trách</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36 text-right`} style={{ fontWeight: 650 }}>Tổng giá trị</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36 text-right`} style={{ fontWeight: 650 }}>Đã thanh toán</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36 text-right`} style={{ fontWeight: 650 }}>Còn lại</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Nhóm quá hạn</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-56`} style={{ fontWeight: 650 }}>Tiến độ thanh toán</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Trạng thái HĐ</TableHead>
              <TableHead className="h-11 w-20 border-b border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-center align-middle text-[11px] leading-4 text-slate-600" style={{ fontWeight: 650 }}>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleContracts.map((contract) => {
              const remaining = Math.max(0, contract.total - contract.paid);
              const overdueMeta = getDebtOverdueMeta(contract);
              const hasOverdue = overdueMeta.days > 0;
              return (
                <TableRow
                  key={contract.id}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                  onClick={() => onOpenDebtDetail(contract)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenDebtDetail(contract);
                    }
                  }}
                >
                  <TableCell className={`${debtTableCellClass} font-semibold text-blue-600`} title={contract.id}>{contract.id}</TableCell>
                  <TableCell className={`${debtTableCellClass} font-semibold text-slate-800`} title={contract.property}>{getUnitCode(contract.property)}</TableCell>
                  <TableCell className={debtTableCellClass}>{contract.date}</TableCell>
                  <TableCell className={debtTableCellClass}>{contract.salesperson}</TableCell>
                  <TableCell className={`${debtTableCellClass} text-right font-semibold tabular-nums text-slate-900`}>{formatMoney(contract.total)}</TableCell>
                  <TableCell className={`${debtTableCellClass} text-right font-semibold tabular-nums text-slate-800`}>{formatMoney(contract.paid)}</TableCell>
                  <TableCell className={`${debtTableCellClass} text-right font-semibold tabular-nums text-slate-800`}>{formatMoney(remaining)}</TableCell>
                  <TableCell className={debtTableCellClass}>
                    <Badge variant="outline" className={`${debtBadgeClass} ${overdueMeta.className}`} style={{ fontWeight: 650 }}>
                      {overdueMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className={debtTableCellClass}>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={hasOverdue ? "font-semibold text-red-600" : "font-semibold text-slate-600"}>{contract.pct}%</span>
                        <span className="truncate text-slate-500">Còn lại: {formatMoney(remaining)}</span>
                      </div>
                      <Progress
                        value={contract.pct}
                        className={`h-2 ${hasOverdue ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500" : contract.pct === 100 ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500" : "bg-emerald-50 [&>[data-slot=progress-indicator]]:bg-emerald-500"}`}
                      />
                      {overdueMeta.penalty > 0 && (
                        <p className="text-xs font-medium text-red-600">Phạt: {formatMoney(overdueMeta.penalty)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={debtTableCellClass}>
                    <Badge variant="outline" className={`${debtBadgeClass} ${statusConfig[contract.status]}`} style={{ fontWeight: 650 }}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[58px] border-b border-[#E5EAF3] bg-white px-3 py-2 text-center align-middle transition-colors group-hover:bg-[#F8FAFC]">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Xem công nợ ${contract.id}`}
                      title="Xem công nợ"
                      className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-slate-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenDebtDetail(contract);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {visibleContracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="h-32 border-b border-[#E5EAF3] px-4 py-10 text-center text-sm text-slate-400">
                  {contracts.length === 0 ? "Khách hàng chưa có hợp đồng nào" : "Không tìm thấy công nợ phù hợp"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex min-h-14 flex-col gap-3 border-t border-[#E5EAF3] bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <Select
              value={rowsPerPage}
              onValueChange={(value) => {
                setRowsPerPage(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Chọn số dòng mỗi trang" className="h-8 w-[72px] rounded-[8px] border-[#E5EAF3] bg-white px-2 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>dòng · Tổng {filteredContracts.length} bản ghi</span>
          </div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filteredContracts.length === 0 ? "0-0" : `${startIndex + 1}-${Math.min(startIndex + perPage, filteredContracts.length)}`} of {filteredContracts.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</Button>
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pageNumber === currentPage ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 rounded-[8px] p-0 text-xs ${pageNumber === currentPage ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

const contractStatusFilterOptions = [
  "Đang ký",
  "Đã ký",
  "Công chứng",
  "Đã hủy",
  "Đã cọc",
  "Chờ xác nhận",
  "Đã phát hành",
  "Đã đóng dấu",
  "Chờ trả HĐMB",
  "Đã trả",
  "Bàn giao",
];

function getProductType(property: string) {
  const normalized = property.toLowerCase();
  if (normalized.includes("shophouse")) return "Shophouse";
  if (normalized.includes("penthouse")) return "Penthouse";
  if (normalized.includes("duplex")) return "Duplex";
  if (normalized.includes("sky")) return "Sky Garden";
  if (normalized.includes("biệt thự")) return "Biệt thự";
  if (normalized.includes("liền kề")) return "Liền kề";
  if (normalized.includes("kiot")) return "Kiot";
  if (normalized.includes("văn phòng")) return "Văn phòng";
  if (normalized.includes("kho")) return "Kho xưởng";
  if (normalized.includes("mặt bằng")) return "Mặt bằng";
  return "Căn hộ";
}

function CustomerContractsTab({
  contracts,
  onOpenContract,
}: {
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("default");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [page, setPage] = useState(1);

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contracts.filter((contract) => {
      const unitCode = getUnitCode(contract.property);
      const productType = getProductType(contract.property);
      const matchesSearch =
        !query ||
        contract.id.toLowerCase().includes(query) ||
        unitCode.toLowerCase().includes(query) ||
        productType.toLowerCase().includes(query);
      const matchesStatus = contractStatusFilter === "all" || contract.status === contractStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, contractStatusFilter, search]);

  const perPage = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const visibleContracts = filteredContracts.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-[#E5EAF3] bg-white px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[220px] flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm..."
                  aria-label="Tìm kiếm hợp đồng theo mã HĐMB, mã căn hoặc loại sản phẩm"
                  className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <Select
                value={contractStatusFilter}
                onValueChange={(value) => {
                  setContractStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger aria-label="Lọc theo trạng thái hợp đồng" className="h-9 w-full rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none sm:w-52">
                  <SelectValue placeholder="Trạng thái hợp đồng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {contractStatusFilterOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={displayFilter} onValueChange={setDisplayFilter}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className="h-9 w-full rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none sm:w-28">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Hiển thị</SelectItem>
                <SelectItem value="all">Tất cả cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table className="min-w-[1280px] border-separate border-spacing-0 text-sm">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Mã HĐMB</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Mã căn</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Loại sản phẩm</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Ngày ký</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36 text-right`} style={{ fontWeight: 650 }}>Giá trị HĐ</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36 text-right`} style={{ fontWeight: 650 }}>Công nợ còn lại</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>NV phụ trách</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Trạng thái HĐ</TableHead>
              <TableHead className={`${debtTableHeaderClass} w-44`} style={{ fontWeight: 650 }}>Tiến độ thanh toán</TableHead>
              <TableHead className="h-11 w-20 border-b border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-center align-middle text-[11px] leading-4 text-slate-600" style={{ fontWeight: 650 }}>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleContracts.map((contract) => {
              const remaining = Math.max(0, contract.total - contract.paid);
              return (
                <TableRow
                  key={contract.id}
                  className="group hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                >
                  <TableCell className={`${debtTableCellClass} font-semibold`}>
                    <button
                      type="button"
                      className="text-left text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => onOpenContract(contract)}
                    >
                      {contract.id}
                    </button>
                  </TableCell>
                  <TableCell className={`${debtTableCellClass} font-semibold text-slate-800`} title={contract.property}>{getUnitCode(contract.property)}</TableCell>
                  <TableCell className={debtTableCellClass}>{getProductType(contract.property)}</TableCell>
                  <TableCell className={debtTableCellClass}>{contract.date}</TableCell>
                  <TableCell className={`${debtTableCellClass} text-right font-semibold tabular-nums text-slate-900`}>{formatMoney(contract.total)}</TableCell>
                  <TableCell className={`${debtTableCellClass} text-right font-semibold tabular-nums text-slate-800`}>{formatMoney(remaining)}</TableCell>
                  <TableCell className={debtTableCellClass}>{contract.salesperson}</TableCell>
                  <TableCell className={debtTableCellClass}>
                    <Badge variant="outline" className={`${debtBadgeClass} ${statusConfig[contract.status] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`} style={{ fontWeight: 650 }}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={debtTableCellClass}>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-600">{contract.pct}%</span>
                      <Progress
                        value={contract.pct}
                        className={`h-2 ${contract.pct === 100 ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500" : "bg-blue-50 [&>[data-slot=progress-indicator]]:bg-blue-500"}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="h-[58px] border-b border-[#E5EAF3] bg-white px-3 py-2 text-center align-middle transition-colors group-hover:bg-[#F8FAFC]">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Xem chi tiết hợp đồng ${contract.id}`}
                      title="Xem chi tiết hợp đồng"
                      className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-slate-300"
                      onClick={() => onOpenContract(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {visibleContracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 border-b border-[#E5EAF3] px-4 py-10 text-center text-sm text-slate-400">
                  {contracts.length === 0 ? "Khách hàng chưa có hợp đồng nào" : "Không tìm thấy hợp đồng phù hợp"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex min-h-14 flex-col gap-3 border-t border-[#E5EAF3] bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <Select
              value={rowsPerPage}
              onValueChange={(value) => {
                setRowsPerPage(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Chọn số dòng mỗi trang" className="h-8 w-[72px] rounded-[8px] border-[#E5EAF3] bg-white px-2 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>dòng · Tổng {filteredContracts.length} bản ghi</span>
          </div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filteredContracts.length === 0 ? "0-0" : `${startIndex + 1}-${Math.min(startIndex + perPage, filteredContracts.length)}`} of {filteredContracts.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</Button>
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pageNumber === currentPage ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 rounded-[8px] p-0 text-xs ${pageNumber === currentPage ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
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

function CustomerPointHistoryTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pointsFilter, setPointsFilter] = useState("all");

  const pointsData = [
    { date: "25/06/2026", type: "Tích điểm", amount: "+10,000", balance: "12,500", note: "Ký HĐMB căn B3.08-22 The Sun Avenue" },
    { date: "10/06/2026", type: "Đổi quà", amount: "-2,000", balance: "2,500", note: "Đổi Voucher Buffet 5 sao Lotte Hotel" },
    { date: "08/06/2026", type: "Tích điểm", amount: "+500", balance: "4,500", note: "Tham quan showroom và trải nghiệm căn hộ mẫu" },
    { date: "15/04/2026", type: "Tích điểm", amount: "+4,000", balance: "4,000", note: "Ký HĐ đặt cọc giữ chỗ căn B3.08-22" }
  ];

  const filteredData = useMemo(() => {
    return pointsData.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        if (!item.note.toLowerCase().includes(query) && !item.type.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }
      if (pointsFilter !== "all") {
        const numVal = parseInt(item.amount.replace(/[^0-9]/g, ""), 10);
        if (pointsFilter === "low" && numVal >= 1000) return false;
        if (pointsFilter === "high" && numVal < 1000) return false;
      }
      return true;
    });
  }, [search, typeFilter, pointsFilter]);

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm giao dịch điểm..."
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div className="w-36">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="Tích điểm">Tích điểm</SelectItem>
                  <SelectItem value="Đổi quà">Đổi quà</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <Select value={pointsFilter} onValueChange={setPointsFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Mức điểm" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả mức</SelectItem>
                  <SelectItem value="low">&lt; 1,000 điểm</SelectItem>
                  <SelectItem value="high">&ge; 1,000 điểm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy lịch sử giao dịch điểm phù hợp</div>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Ngày giao dịch</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Loại</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-right align-middle text-xs font-semibold text-slate-600">Số điểm</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-right align-middle text-xs font-semibold text-slate-600">Số dư</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Nội dung chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-medium">{row.date}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.type === "Tích điểm" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className={`h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-right font-semibold ${
                    row.amount.startsWith("+") ? "text-emerald-600" : "text-orange-600"
                  }`}>{row.amount}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-right text-slate-800 font-medium">{row.balance}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-700 font-medium">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CustomerBookingHistoryTab() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const bookingData = [
    { code: "BK-2026-088", project: "The Sun Avenue", unit: "B3.08-22", amount: "50.000.000 VNĐ", date: "12/06/2026", status: "Đã chuyển cọc" },
    { code: "BK-2026-045", project: "Sunrise City", unit: "A1.15-02", amount: "50.000.000 VNĐ", date: "15/04/2026", status: "Đã hoàn cọc" }
  ];

  const filteredData = useMemo(() => {
    return bookingData.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        if (!item.code.toLowerCase().includes(query) && !item.project.toLowerCase().includes(query) && !item.unit.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (projectFilter !== "all" && item.project !== projectFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [search, projectFilter, statusFilter]);

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm booking..."
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div className="w-40">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Dự án" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả dự án</SelectItem>
                  <SelectItem value="The Sun Avenue">The Sun Avenue</SelectItem>
                  <SelectItem value="Sunrise City">Sunrise City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đã chuyển cọc">Đã chuyển cọc</SelectItem>
                  <SelectItem value="Đã hoàn cọc">Đã hoàn cọc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy lịch sử booking phù hợp</div>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Mã Booking</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Dự án</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Căn hộ</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-right align-middle text-xs font-semibold text-slate-600">Tiền giữ chỗ</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Ngày đăng ký</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 font-bold text-indigo-600">{row.code}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-semibold">{row.project}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600">Căn {row.unit}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-right font-medium text-slate-800">{row.amount}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600">{row.date}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      row.status === "Đã chuyển cọc"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CustomerTicketTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const ticketData = [
    { id: "TK-0922", title: "Yêu cầu thay đổi tiến độ đóng tiền đợt 3", category: "Thủ tục HĐ", priority: "Cao", status: "Đang xử lý", date: "24/06/2026" },
    { id: "TK-0811", title: "Hỏi về thời hạn bàn giao căn hộ & phí bảo trì", category: "Giải đáp chính sách", priority: "Trung bình", status: "Đã đóng", date: "18/06/2026" }
  ];

  const filteredData = useMemo(() => {
    return ticketData.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        if (!item.id.toLowerCase().includes(query) && !item.title.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && item.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [search, categoryFilter, statusFilter, priorityFilter]);

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm ticket..."
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div className="w-36">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Chủ đề" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả chủ đề</SelectItem>
                  <SelectItem value="Thủ tục HĐ">Thủ tục HĐ</SelectItem>
                  <SelectItem value="Giải đáp chính sách">Giải đáp chính sách</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Độ ưu tiên" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                  <SelectItem value="Cao">Cao</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đã đóng">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Không tìm thấy ticket yêu cầu phù hợp</div>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Mã Ticket</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Tiêu đề yêu cầu</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Chủ đề</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Độ ưu tiên</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Ngày tạo</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-semibold text-slate-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 font-bold text-slate-500">{row.id}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-semibold">{row.title}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600">{row.category}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2">
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      row.priority === "Cao"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600">{row.date}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      row.status === "Đang xử lý"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
