import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building2,
  AlertTriangle,
  BadgeCheck,
  TrendingDown,
  Banknote,
  FileText,
  CalendarDays,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Circle,
  Eye,
  FileSpreadsheet,
  LayoutList,
  MoreHorizontal,
  Search,
  Table2,
} from "lucide-react";

import {
  customers,
  formatVND,
  getCustomerTotalValue,
  getCustomerTotalPaid,
  getCustomerProgress,
  getCustomerWorstStatus,
  getCustomerTotalLateFee,
  getContractTotalLateFee,
  type PaymentStatus,
  type Contract,
} from "@/data/mockDataCongNo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ViewMode = "block" | "table";

const debtPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const debtPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const debtPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const debtPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const debtPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";
const debtTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const debtTableCellClass = "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const debtStickyCellClass = "bg-white transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";
const debtStatusBadgeBaseClass = "inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1";

const statusConfig: Record<PaymentStatus, { label: string; className: string; dot: string }> = {
  "not-due": {
    label: "Chưa đến hạn",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-400",
  },
  upcoming: {
    label: "Sắp đến hạn",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  partial: {
    label: "Thanh toán một phần",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  overpaid: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  overdue: {
    label: "Quá hạn",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  "grace-period": {
    label: "Trong thời gian ân hạn",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  "deposit-forfeited": {
    label: "Mất cọc",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  extended: {
    label: "Đã gia hạn",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function compactValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

function contractRemaining(contract: Contract) {
  return Number(Math.max(0, contract.contractValue - contract.paidAmount).toFixed(3));
}

function getAllRecords(contract: Contract) {
  return contract.stages?.flatMap((stage) => stage.records) ?? [];
}

function getDepositRecord(contract: Contract) {
  return getAllRecords(contract)[0];
}

function getCurrentStage(contract: Contract) {
  return contract.stages?.find((stage) => stage.stageStatus === "in-progress")
    ?? contract.stages?.find((stage) => stage.stageStatus === "pending")
    ?? contract.stages?.[contract.stages.length - 1];
}

function getDistributionUnit(contract: Contract) {
  if (contract.projectName.includes("Vinhomes")) return "Vinhomes";
  if (contract.projectName.includes("Masteri")) return "Masterise Homes";
  if (contract.projectName.includes("Empire")) return "Empire Group";
  return "-";
}

function getDiscountPercent(contract: Contract) {
  const remainder = Math.max(0, 100 - contract.paymentProgress);
  if (contract.status === "paid") return 0;
  return Number(Math.min(8, Math.max(1.5, remainder / 12)).toFixed(1));
}

function exportContractsExcel(contracts: Contract[]) {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const headers = [
    "Mã sản phẩm",
    "NVTV",
    "TPKD",
    "GD/Sàn SLK",
    "Đơn vị phân phối",
    "Giai đoạn",
    "Hướng",
    "Loại sản phẩm",
    "Đơn giá",
    "Giá bán",
    "Tổng chiết khấu (%)",
    "Tổng chiết khấu (Tiền)",
    "Giá trị HĐ sau chiết khấu",
    "Ngày cọc",
    "Số tiền cọc",
    "Đã thu cọc",
    "Ngày ký hợp đồng",
    "PTTT",
    "Tổng đợt thanh toán",
    "Đợt thanh toán hiện tại",
    "Tổng phải thu",
    "Tỷ lệ đã thu",
    "Tổng đã thu",
    "Tỷ lệ còn lại",
    "Tổng còn lại",
    "Thời gian công chứng dự kiến",
    "Trạng thái",
  ];
  const rows = [
    headers,
    ...contracts.map((contract) => {
      const deposit = getDepositRecord(contract);
      const currentStage = getCurrentStage(contract);
      const discountPct = getDiscountPercent(contract);
      const discountAmount = Number((contract.contractValue * discountPct / 100).toFixed(3));
      return [
        contract.unit,
        compactValue(contract.salesperson),
        "-",
        "-",
        getDistributionUnit(contract),
        compactValue(currentStage?.name),
        "-",
        compactValue(contract.productType),
        formatVND(contract.contractValue),
        formatVND(contract.contractValue),
        `${discountPct}%`,
        formatVND(discountAmount),
        formatVND(Math.max(0, contract.contractValue - discountAmount)),
        deposit ? fmtDate(deposit.dueDate) : "-",
        deposit ? formatVND(deposit.baseAmount) : "-",
        deposit ? formatVND(deposit.paidAmount ?? (deposit.status === "paid" ? deposit.baseAmount : 0)) : "-",
        deposit ? fmtDate(deposit.dueDate) : "-",
        compactValue(contract.paymentMethod),
        String(getAllRecords(contract).length),
        compactValue(currentStage ? `GĐ${currentStage.stageNumber}` : "-"),
        formatVND(contract.contractValue),
        `${contract.paymentProgress}%`,
        formatVND(contract.paidAmount),
        `${Math.max(0, 100 - contract.paymentProgress)}%`,
        formatVND(contractRemaining(contract)),
        fmtDate(contract.dueDate),
        statusConfig[contract.status].label,
      ];
    }),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(",")).join("\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "danh-sach-hop-dong-cong-no.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "paid")
    return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
  if (status === "overdue")
    return (
      <div className="flex items-center justify-center rounded-full bg-red-500 shrink-0 size-4">
        <AlertTriangle className="size-2.5 text-white stroke-[3px]" />
      </div>
    );
  return <Clock className="size-4 text-blue-400 shrink-0" />;
}

// ─── Contract Card ────────────────────────────────────────────────────────────

function ContractCard({
  contract,
  customerId,
}: {
  contract: Contract;
  customerId: string;
}) {
  const navigate = useNavigate();
  const sc = statusConfig[contract.status];
  const isOverdue = contract.status === "overdue";
  const remaining = contract.contractValue - contract.paidAmount;
  const lateFee = getContractTotalLateFee(contract);
  const hasStages = contract.stages && contract.stages.length > 0;
  const paidRecordsCount = contract.stages
    ? contract.stages.flatMap((s) => s.records).filter((r) => r.status === "paid").length
    : 0;
  const totalRecordsCount = contract.stages
    ? contract.stages.flatMap((s) => s.records).length
    : 0;

  return (
    <Card
      className={`border bg-white shadow-sm shadow-slate-200/40 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isOverdue ? "border-red-200 hover:border-red-300" : "border-border/60 hover:border-border"
      }`}
      onClick={() => navigate(`/debt/customer/${customerId}/contract/${contract.id}`)}
    >
      <CardContent className="p-0">
        {/* Card Header */}
        <div
          className={`px-5 pt-5 pb-4 rounded-t-xl ${
            isOverdue ? "bg-red-50/50" : contract.status === "paid" ? "bg-emerald-50/30" : "bg-blue-50/20"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isOverdue
                    ? "bg-red-100"
                    : contract.status === "paid"
                    ? "bg-emerald-100"
                    : "bg-blue-100"
                }`}
              >
                <Building2
                  className={`size-4 ${
                    isOverdue
                      ? "text-red-600"
                      : contract.status === "paid"
                      ? "text-emerald-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground leading-tight truncate">
                  {contract.projectName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Căn {contract.unit}
                </p>
              </div>
            </div>
            <Badge className={`text-[10px] px-1.5 shrink-0 ${sc.className}`}>
              {sc.label}
            </Badge>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Value row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Giá trị hợp đồng
              </p>
              <p className="text-base text-foreground tabular-nums">
                {formatVND(contract.contractValue)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Đã thanh toán
              </p>
              <p className="text-base text-emerald-600 tabular-nums">
                {formatVND(contract.paidAmount)}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span>{contract.paymentProgress}% · Còn {formatVND(remaining)}</span>
            </div>
            <Progress
              value={contract.paymentProgress}
              className={`h-2 ${
                isOverdue
                  ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                  : contract.status === "paid"
                  ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                  : "bg-blue-100 [&>[data-slot=progress-indicator]]:bg-blue-500"
              }`}
            />
          </div>

          {/* Due date + late fee */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
              <span
                className={`text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
              >
                {isOverdue ? (
                  <>
                    Quá hạn {contract.daysOverdue} ngày
                    <span className="text-muted-foreground ml-1">
                      ({fmtDate(contract.dueDate)})
                    </span>
                  </>
                ) : contract.status === "paid" ? (
                  `Hoàn thành ${fmtDate(contract.dueDate)}`
                ) : (
                  `Đến hạn ${fmtDate(contract.dueDate)}`
                )}
              </span>
            </div>
            {hasStages && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <FileText className="size-3" />
                <span>{paidRecordsCount}/{totalRecordsCount} đợt</span>
              </div>
            )}
          </div>

          {/* Overdue warning */}
          {isOverdue && lateFee > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <AlertTriangle className="size-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">
                Phí phạt ước tính:{" "}
                <span className="font-medium">{formatVND(lateFee)}</span>
                <span className="text-red-500 ml-1">
                  ({contract.latePenaltyRate}%/năm)
                </span>
              </p>
            </div>
          )}

          {/* Stages summary */}
          {hasStages && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {contract.stages!.map((stage) => (
                <div
                  key={stage.id}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${
                    stage.stageStatus === "completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : stage.stageStatus === "in-progress"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-muted/40 border-border/60 text-muted-foreground"
                  }`}
                >
                  {stage.stageStatus === "completed" ? (
                    <CheckCircle2 className="size-2.5" />
                  ) : stage.stageStatus === "in-progress" ? (
                    <Clock className="size-2.5" />
                  ) : (
                    <Circle className="size-2.5" />
                  )}
                  GĐ{stage.stageNumber}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {contract.id.toUpperCase()}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>Xem chi tiết</span>
            <ArrowRight className="size-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerContracts() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("block");
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState<string>("all");
  const [tableLotTypeFilter, setTableLotTypeFilter] = useState<string>("all");
  const [tablePaymentMethodFilter, setTablePaymentMethodFilter] = useState<string>("all");
  const [selectedContractIds, setSelectedContractIds] = useState<Set<string>>(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);

  let targetCustomerId = customerId;
  if (customerId && customerId.startsWith("C")) {
    const num = parseInt(customerId.substring(1), 10);
    if (!isNaN(num) && num >= 1 && num <= 5) {
      targetCustomerId = String(num);
    }
  }

  const customer = customers.find((c) => c.id === targetCustomerId);
  const customerContracts = customer?.contracts ?? [];
  const tableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return customerContracts.filter((contract) => {
      const matchesSearch =
        !q ||
        contract.unit.toLowerCase().includes(q) ||
        contract.contractCode.toLowerCase().includes(q) ||
        contract.projectName.toLowerCase().includes(q) ||
        (contract.salesperson ?? "").toLowerCase().includes(q) ||
        (contract.productType ?? "").toLowerCase().includes(q);
      const matchesStatus = tableStatusFilter === "all" || contract.status === tableStatusFilter;
      const matchesLotType = tableLotTypeFilter === "all" || (contract.productType ?? "-") === tableLotTypeFilter;
      const matchesPaymentMethod = tablePaymentMethodFilter === "all" || (contract.paymentMethod ?? "-") === tablePaymentMethodFilter;
      return matchesSearch && matchesStatus && matchesLotType && matchesPaymentMethod;
    });
  }, [customerContracts, tableSearch, tableStatusFilter, tableLotTypeFilter, tablePaymentMethodFilter]);
  const lotTypeOptions = useMemo(
    () => Array.from(new Set(customerContracts.map((contract) => contract.productType).filter(Boolean))).sort() as string[],
    [customerContracts]
  );
  const paymentMethodOptions = useMemo(
    () => Array.from(new Set(customerContracts.map((contract) => contract.paymentMethod).filter(Boolean))).sort() as string[],
    [customerContracts]
  );

  if (!customer) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Building2 className="size-10 opacity-30" />
        <p>Không tìm thấy khách hàng</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const totalValue = getCustomerTotalValue(customer);
  const totalPaid = getCustomerTotalPaid(customer);
  const progress = getCustomerProgress(customer);
  const worst = getCustomerWorstStatus(customer);
  const totalLateFee = getCustomerTotalLateFee(customer);
  const overdueContracts = customer.contracts.filter((ct) => ct.status === "overdue");
  const isOverdue = worst === "overdue";
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, tableRows.length);
  const paginatedContracts = tableRows.slice(pageStartIndex, pageEndIndex);
  const currentPageSelected = paginatedContracts.length > 0 && paginatedContracts.every((contract) => selectedContractIds.has(contract.id));
  const toggleSelectedContract = (contractId: string) => {
    setSelectedContractIds((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  };
  const toggleCurrentPageSelection = () => {
    setSelectedContractIds((prev) => {
      const next = new Set(prev);
      const shouldSelect = !currentPageSelected;
      paginatedContracts.forEach((contract) => {
        if (shouldSelect) next.add(contract.id);
        else next.delete(contract.id);
      });
      return next;
    });
  };

  return (
    <div className="min-h-full bg-slate-50/80">
      <section aria-labelledby="customer-debt-title" className="mx-auto max-w-screen-lg space-y-6 p-6">
        {/* ── Back + Customer Profile */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách công nợ"
            onClick={() => navigate("/debt")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-5">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 shrink-0">
                      <AvatarFallback className={`text-base ${customer.avatarColor}`}>
                        {customer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 id="customer-debt-title" className="text-foreground leading-tight">{customer.name}</h1>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {customer.email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="size-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="size-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-12 hidden sm:block" />

                  {/* Aggregated stats */}
                  <div className="flex flex-wrap gap-6 ml-auto">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Hợp đồng
                      </p>
                      <p className="text-xl text-foreground mt-0.5">
                        {customer.contracts.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Tổng giá trị
                      </p>
                      <p className="text-xl text-foreground mt-0.5 tabular-nums">
                        {formatVND(totalValue)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Đã thanh toán
                      </p>
                      <p className="text-xl text-emerald-600 mt-0.5 tabular-nums">
                        {formatVND(totalPaid)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{progress}%</p>
                    </div>
                    {totalLateFee > 0 && (
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Phí phạt
                        </p>
                        <p className="text-xl text-red-600 mt-0.5 tabular-nums">
                          {formatVND(totalLateFee)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overall progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tiến độ tổng thể ({progress}%)</span>
                    <span>
                      Còn lại: {formatVND(totalValue - totalPaid)} /{" "}
                      {formatVND(totalValue)}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={`h-1.5 ${
                      isOverdue
                        ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                        : worst === "upcoming"
                        ? "bg-blue-100 [&>[data-slot=progress-indicator]]:bg-blue-500"
                        : "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Overdue Alert */}
        {isOverdue && overdueContracts.length > 0 && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 text-red-800"
          >
            <AlertTriangle className="size-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Cảnh báo: {overdueContracts.length} hợp đồng quá hạn thanh toán
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {overdueContracts.map((ct) => (
                <span key={ct.id} className="mr-3">
                  <strong>{ct.projectName}</strong> – căn {ct.unit} quá hạn{" "}
                  {ct.daysOverdue} ngày, phạt ước tính{" "}
                  {formatVND(ct.lateFee ?? 0)}.
                </span>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Contracts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-foreground">
                Danh sách hợp đồng
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customer.contracts.length} hợp đồng bất động sản
                {overdueContracts.length > 0 && (
                  <span className="text-red-500 ml-1">
                    · {overdueContracts.length} quá hạn
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick stats pills */}
              <div className="hidden lg:flex items-center gap-2">
                {(["paid", "upcoming", "overdue"] as PaymentStatus[]).map((s) => {
                  const count = customer.contracts.filter((ct) => ct.status === s).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${statusConfig[s].className}`}
                    >
                      <StatusIcon status={s} />
                      {count} {statusConfig[s].label.toLowerCase()}
                    </div>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => exportContractsExcel(tableRows)}
                aria-label="Xuất Excel"
                title="Xuất Excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <div className="flex items-center border border-slate-200 bg-slate-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("block")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "block"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Xem dạng block"
                  title="Dạng block"
                >
                  <LayoutList className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Xem dạng bảng"
                  title="Dạng bảng"
                >
                  <Table2 className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "block" ? (
            <div
              className={
                customer.contracts.length === 1
                  ? "max-w-xl"
                  : customer.contracts.length === 2
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              }
            >
              {customer.contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  customerId={customer.id}
                />
              ))}
            </div>
          ) : (
            <Card className={debtPanelClass}>
              <div className={debtPanelHeaderClass}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Danh sách hợp đồng công nợ</h3>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {tableRows.length} hợp đồng phù hợp · {selectedContractIds.size} đang chọn
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={debtPanelMetaClass}>{tableRows.length} kết quả</span>
                    <span className={debtPanelMetaClass}>{customer.contracts.length} hợp đồng</span>
                    <span className="hidden text-xs text-slate-500 lg:inline">Bấm vào mã sản phẩm để xem chi tiết</span>
                  </div>
                </div>
              </div>

              <div className={debtPanelToolbarClass}>
                <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
                  <div className="relative min-w-[220px] flex-1 flex-shrink-0 lg:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={tableSearch}
                      onChange={(e) => {
                        setTableSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search"
                      aria-label="Tìm trong danh sách hợp đồng công nợ"
                      className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <Select
                    value={tableStatusFilter}
                    onValueChange={(value) => {
                      setTableStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo trạng thái" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="upcoming">Sắp đến hạn</SelectItem>
                      <SelectItem value="overdue">Quá hạn</SelectItem>
                      <SelectItem value="partial">Thanh toán một phần</SelectItem>
                      <SelectItem value="extended">Đã gia hạn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={tableLotTypeFilter}
                    onValueChange={(value) => {
                      setTableLotTypeFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo loại lô" className={`${compactFilterTriggerClass} w-40 flex-shrink-0`}>
                      <SelectValue placeholder="Loại lô" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại lô</SelectItem>
                      {lotTypeOptions.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={tablePaymentMethodFilter}
                    onValueChange={(value) => {
                      setTablePaymentMethodFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo PTTT" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                      <SelectValue placeholder="PTTT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả PTTT</SelectItem>
                      {paymentMethodOptions.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="max-h-[calc(100dvh-320px)] min-h-[420px] max-w-full overflow-auto bg-white">
                <Table className="min-w-[3600px] table-fixed border-separate border-spacing-0 text-sm">
                  <TableHeader className="sticky top-0 z-20">
                    <TableRow>
                      <TableHead className="sticky left-0 z-40 w-12 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-2 py-2 text-center text-[11px] text-slate-600 shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>
                        <button
                          type="button"
                          aria-label="Chọn tất cả dòng trong trang"
                          aria-pressed={currentPageSelected}
                          className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${currentPageSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-transparent hover:border-slate-500"}`}
                          onClick={toggleCurrentPageSelection}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      </TableHead>
                      {[
                        ["Mã sản phẩm", "w-36"],
                        ["NVTV", "w-36"],
                        ["TPKD", "w-32"],
                        ["GD/Sàn SLK", "w-36"],
                        ["Đơn vị phân phối", "w-44"],
                        ["Giai đoạn", "w-52"],
                        ["Hướng", "w-24"],
                        ["Loại sản phẩm", "w-36"],
                        ["Đơn giá", "w-32 text-right"],
                        ["Giá bán", "w-32 text-right"],
                        ["Tổng chiết khấu (%)", "w-40 text-right"],
                        ["Tổng chiết khấu (Tiền)", "w-44 text-right"],
                        ["Giá trị HĐ sau chiết khấu", "w-48 text-right"],
                        ["Ngày cọc", "w-32"],
                        ["Số tiền cọc", "w-32 text-right"],
                        ["Đã thu cọc", "w-32 text-right"],
                        ["Ngày ký hợp đồng", "w-40"],
                        ["PTTT", "w-44"],
                        ["Tổng đợt thanh toán", "w-40 text-right"],
                        ["Đợt thanh toán hiện tại", "w-44"],
                        ["Tổng phải thu", "w-36 text-right"],
                        ["Tỷ lệ đã thu", "w-32 text-right"],
                        ["Tổng đã thu", "w-36 text-right"],
                        ["Tỷ lệ còn lại", "w-32 text-right"],
                        ["Tổng còn lại", "w-36 text-right"],
                        ["Thời gian công chứng dự kiến", "w-52"],
                        ["Trạng thái", "w-40"],
                      ].map(([label, width]) => (
                        <TableHead key={label} className={`${debtTableHeaderClass} ${width}`} style={{ fontWeight: 650 }}>
                          {label}
                        </TableHead>
                      ))}
                      <TableHead className="sticky right-0 z-40 h-10 w-14 border-b border-l border-[#DDE5F0] bg-[#F6F8FB] px-0 py-2 text-center text-[11px] text-slate-600 shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>...</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={29} className="px-4 py-12 text-center text-sm text-slate-400">
                          Không tìm thấy hợp đồng phù hợp bộ lọc
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedContracts.map((contract) => {
                        const deposit = getDepositRecord(contract);
                        const currentStage = getCurrentStage(contract);
                        const discountPct = getDiscountPercent(contract);
                        const discountAmount = Number((contract.contractValue * discountPct / 100).toFixed(3));
                        const isSelected = selectedContractIds.has(contract.id);
                        const detailPath = `/debt/customer/${customer.id}/contract/${contract.id}`;
                        const paidDeposit = deposit ? (deposit.paidAmount ?? (deposit.status === "paid" ? deposit.baseAmount : 0)) : 0;
                        const dataCells: Array<{ value: string; className?: string; strong?: boolean }> = [
                          { value: compactValue(contract.salesperson), className: "w-36" },
                          { value: "-", className: "w-32" },
                          { value: "-", className: "w-36" },
                          { value: getDistributionUnit(contract), className: "w-44" },
                          { value: compactValue(currentStage?.name), className: "w-52" },
                          { value: "-", className: "w-24" },
                          { value: compactValue(contract.productType), className: "w-36" },
                          { value: formatVND(contract.contractValue), className: "w-32 text-right tabular-nums", strong: true },
                          { value: formatVND(contract.contractValue), className: "w-32 text-right tabular-nums", strong: true },
                          { value: `${discountPct}%`, className: "w-40 text-right tabular-nums" },
                          { value: formatVND(discountAmount), className: "w-44 text-right tabular-nums" },
                          { value: formatVND(Math.max(0, contract.contractValue - discountAmount)), className: "w-48 text-right tabular-nums", strong: true },
                          { value: deposit ? fmtDate(deposit.dueDate) : "-", className: "w-32" },
                          { value: deposit ? formatVND(deposit.baseAmount) : "-", className: "w-32 text-right tabular-nums" },
                          { value: deposit ? formatVND(paidDeposit) : "-", className: "w-32 text-right tabular-nums" },
                          { value: deposit ? fmtDate(deposit.dueDate) : "-", className: "w-40" },
                          { value: compactValue(contract.paymentMethod), className: "w-44" },
                          { value: String(getAllRecords(contract).length), className: "w-40 text-right tabular-nums" },
                          { value: compactValue(currentStage ? `GĐ${currentStage.stageNumber}` : "-"), className: "w-44" },
                          { value: formatVND(contract.contractValue), className: "w-36 text-right tabular-nums", strong: true },
                          { value: `${contract.paymentProgress}%`, className: "w-32 text-right tabular-nums" },
                          { value: formatVND(contract.paidAmount), className: "w-36 text-right tabular-nums text-emerald-700", strong: true },
                          { value: `${Math.max(0, 100 - contract.paymentProgress)}%`, className: "w-32 text-right tabular-nums" },
                          { value: formatVND(contractRemaining(contract)), className: "w-36 text-right tabular-nums", strong: true },
                          { value: fmtDate(contract.dueDate), className: "w-52" },
                        ];

                        return (
                          <TableRow
                            key={contract.id}
                            data-state={isSelected ? "selected" : undefined}
                            className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
                            onClick={(event) => {
                              const target = event.target as HTMLElement;
                              if (target.closest(".td-actions") || target.closest(".td-select")) return;
                              navigate(detailPath);
                            }}
                          >
                            <TableCell className={`td-select sticky left-0 z-10 h-11 w-12 border-b border-r border-[#E5EAF3] px-2 py-1.5 text-center shadow-[6px_0_12px_-12px_rgba(15,23,42,0.45)] ${debtStickyCellClass}`}>
                              <button
                                type="button"
                                className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                                title="Chọn dòng"
                                aria-label={`Chọn hợp đồng ${contract.contractCode}`}
                                aria-pressed={isSelected}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSelectedContract(contract.id);
                                }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </TableCell>
                            <TableCell className={`${debtTableCellClass} w-36`}>
                              <button
                                type="button"
                                className="truncate text-xs leading-5 text-blue-600 hover:text-blue-700 hover:underline"
                                style={{ fontWeight: 650 }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate(detailPath);
                                }}
                              >
                                {contract.unit}
                              </button>
                              <p className="truncate text-[11px] text-slate-400">{contract.contractCode}</p>
                            </TableCell>
                            {dataCells.map((cell, index) => (
                              <TableCell key={`${contract.id}-${index}`} className={`${debtTableCellClass} ${cell.className ?? ""}`}>
                                <p className={`truncate text-xs leading-5 ${cell.strong ? "text-slate-900" : "text-slate-700"}`} style={{ fontWeight: cell.strong ? 600 : 400 }} title={cell.value}>
                                  {cell.value}
                                </p>
                              </TableCell>
                            ))}
                            <TableCell className={`${debtTableCellClass} w-40`}>
                              <Badge className={`${debtStatusBadgeBaseClass} ${statusConfig[contract.status].className}`} style={{ fontWeight: 650 }}>
                                {statusConfig[contract.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className={`td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-[#E5EAF3] px-0 py-1.5 text-center shadow-[-6px_0_12px_-12px_rgba(15,23,42,0.45)] ${debtStickyCellClass}`}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" aria-label={`Mở menu ${contract.contractCode}`} className="h-8 w-8 rounded-md p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300" onClick={(event) => event.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(detailPath);
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className={debtPanelFooterClass}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div>Hiển thị {tableRows.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} / {tableRows.length} hợp đồng</div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400">{selectedContractIds.size} đang chọn</span>
                </div>
                <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <span className="px-2 tabular-nums font-medium text-slate-600">
                        {tableRows.length === 0 ? "0-0" : `${pageStartIndex + 1}-${pageEndIndex}`} / {tableRows.length}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={safeCurrentPage >= pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>›</Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
