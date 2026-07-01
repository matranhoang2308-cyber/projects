import { useState } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Wallet,
  Users,
  Eye,
  ArrowUpDown,
  ChevronDown,
  Info,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import {
  customers,
  formatVND,
  getCustomerTotalValue,
  getCustomerTotalPaid,
  getCustomerProgress,
  getCustomerWorstStatus,
  getCustomerNextDue,
  getCustomerTotalLateFee,
  type PaymentStatus,
} from "@/data/mockDataCongNo";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none hover:bg-slate-50";


// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  "not-due": {
    label: "Chưa đến hạn",
    className: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50",
  },
  upcoming: {
    label: "Sắp đến hạn",
    className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  partial: {
    label: "Thanh toán một phần",
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
  overpaid: {
    label: "Thanh toán dư",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50",
  },
  overdue: {
    label: "Quá hạn",
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  },
  "grace-period": {
    label: "Trong thời gian ân hạn",
    className: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
  },
  "deposit-forfeited": {
    label: "Mất cọc",
    className: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50",
  },
  extended: {
    label: "Đã gia hạn",
    className: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50",
  },
};

const progressColorMap: Record<PaymentStatus, string> = {
  "not-due": "[&>[data-slot=progress-indicator]]:bg-slate-400",
  upcoming: "[&>[data-slot=progress-indicator]]:bg-blue-500",
  paid: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
  partial: "[&>[data-slot=progress-indicator]]:bg-amber-500",
  overpaid: "[&>[data-slot=progress-indicator]]:bg-cyan-500",
  overdue: "[&>[data-slot=progress-indicator]]:bg-red-500",
  "grace-period": "[&>[data-slot=progress-indicator]]:bg-orange-500",
  "deposit-forfeited": "[&>[data-slot=progress-indicator]]:bg-rose-500",
  extended: "[&>[data-slot=progress-indicator]]:bg-purple-500",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}



// ─── Multi-Status Badge ───────────────────────────────────────────────────────

/**
 * Hiển thị tất cả trạng thái phân biệt của 1 khách hàng.
 * - 1 trạng thái  → badge đơn (không kèm số lượng)
 * - 2+ trạng thái → mỗi badge kèm số lượng HĐ tương ứng
 */
function StatusBadgeGroup({
  contracts,
}: {
  contracts: { status: PaymentStatus }[];
}) {
  const counts: Record<PaymentStatus, number> = {
    overdue: contracts.filter((c) => c.status === "overdue").length,
    upcoming: contracts.filter((c) => c.status === "upcoming").length,
    paid: contracts.filter((c) => c.status === "paid").length,
  };

  const active = (["overdue", "upcoming", "paid"] as PaymentStatus[]).filter(
    (s) => counts[s] > 0
  );
  const multi = active.length > 1;

  return (
    <div className="flex flex-col gap-1">
      {active.map((s) => (
        <Badge
          key={s}
          className={`text-[10px] px-1.5 py-0 h-5 w-fit whitespace-nowrap ${statusConfig[s].className}`}
        >
          {multi && (
            <span className="mr-0.5 opacity-75">{counts[s]}</span>
          )}
          {statusConfig[s].label}
        </Badge>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DebtDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Derived stats
  const allContracts = customers.flatMap((c) => c.contracts);
  const totalValue = allContracts.reduce((s, ct) => s + ct.contractValue, 0);
  const totalPaid = allContracts.reduce((s, ct) => s + ct.paidAmount, 0);
  const overdueCustomers = customers.filter(
    (c) => getCustomerWorstStatus(c) === "overdue"
  );
  const overdueContracts = allContracts.filter((ct) => ct.status === "overdue");
  const totalLateFee = customers.reduce(
    (s, c) => s + getCustomerTotalLateFee(c),
    0
  );

  // ── Filter
  // Khớp nếu bất kỳ HĐ nào của KH có trạng thái trong filter
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.contracts.some(
        (ct) =>
          ct.projectName.toLowerCase().includes(q) ||
          ct.unit.toLowerCase().includes(q)
      );
    const matchStatus =
      statusFilter === "all" ||
      c.contracts.some((ct) => ct.status === statusFilter);
    return matchSearch && matchStatus;
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-full space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-slate-950" style={{ fontWeight: 750 }}>Quản lý công nợ</h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi tiến độ thanh toán và tình trạng nợ của toàn bộ khách hàng
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="hidden h-10 w-10 border-slate-200 bg-white shadow-sm hover:bg-emerald-50 sm:inline-flex"
              onClick={() => {
                const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
                const headers = ["Khách hàng", "Hợp đồng", "Tổng giá trị", "Đã thu", "Còn phải thu", "Tiến độ thanh toán", "Hạn gần nhất"];
                const rows = [
                  headers,
                  ...filtered.map((c) => {
                    const totalVal = getCustomerTotalValue(c);
                    const totalPd = getCustomerTotalPaid(c);
                    const progress = getCustomerProgress(c);
                    const nextDue = getCustomerNextDue(c);
                    return [
                      c.name,
                      `${c.contracts.length} hợp đồng`,
                      formatVND(totalVal),
                      formatVND(totalPd),
                      formatVND(totalVal - totalPd),
                      `${progress}%`,
                      nextDue ? nextDue.date : "—"
                    ];
                  })
                ];
                const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\n")}`;
                const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
                const link = document.createElement("a");
                link.href = url;
                link.download = "danh-sach-cong-no.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
              aria-label="Xuất Excel"
              title="Xuất Excel"
            >
              <FileSpreadsheet className="size-5 text-emerald-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden h-10 w-10 border-slate-200 bg-white shadow-sm hover:bg-red-50 sm:inline-flex"
              onClick={() => window.print()}
              aria-label="Xuất PDF"
              title="Xuất PDF"
            >
              <FileText className="size-5 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <CoreMetricCard
            icon={Users}
            label="Tổng khách hàng"
            value={`${customers.length} khách`}
            sub={`${allContracts.length} hợp đồng · ${overdueCustomers.length} quá hạn`}
            iconClass="bg-slate-100"
          />
          <CoreMetricCard
            icon={Wallet}
            label="Tổng giá trị hợp đồng"
            value={formatVND(totalValue)}
            sub={`${allContracts.length} hợp đồng`}
            iconClass="bg-blue-50"
          />
          <CoreMetricCard
            icon={TrendingUp}
            label="Đã thu"
            value={formatVND(totalPaid)}
            sub={`${Math.round((totalPaid / totalValue) * 100)}% tổng danh mục`}
            iconClass="bg-emerald-50"
            valueClass="text-emerald-700"
          />
          <CoreMetricCard
            icon={AlertCircle}
            label="Phạt trễ hạn (ước tính)"
            value={formatVND(totalLateFee)}
            sub={`${overdueContracts.length} hợp đồng quá hạn`}
            iconClass="bg-red-50"
            valueClass={totalLateFee > 0 ? "text-red-600" : "text-foreground"}
          />
        </div>

          {/* Customer Table */}
          <Card className="max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900">Danh sách công nợ</h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {filtered.length} khách hàng phù hợp · Bấm vào dòng để xem chi tiết
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50/60 px-3 pb-3 pt-0">
              <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none whitespace-nowrap">
                <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    aria-label="Tìm trong danh sách công nợ"
                    className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger aria-label="Lọc theo trạng thái công nợ" className={`${compactFilterTriggerClass} w-48 flex-shrink-0`}>
                    <SelectValue placeholder="Trạng thái công nợ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="upcoming">Sắp đến hạn</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 sm:hidden">
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-slate-400">Không tìm thấy kết quả</div>
              ) : filtered.map((customer) => {
                const totalVal = getCustomerTotalValue(customer);
                const totalPd = getCustomerTotalPaid(customer);
                const progress = getCustomerProgress(customer);
                const worst = getCustomerWorstStatus(customer);
                return (
                  <button
                    key={customer.id}
                    type="button"
                    className="w-full space-y-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                    onClick={() => navigate(`/debt/customer/${customer.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs text-white ${customer.avatarColor}`} style={{ fontWeight: 700 }}>
                        {customer.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{customer.name}</p>
                        <p className="truncate text-xs text-slate-400">{customer.email}</p>
                      </div>
                      <StatusBadgeGroup contracts={customer.contracts} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-slate-400">Tổng giá trị</p><p className="mt-0.5 font-semibold tabular-nums text-slate-800">{formatVND(totalVal)}</p></div>
                      <div><p className="text-slate-400">Còn phải thu</p><p className="mt-0.5 font-semibold tabular-nums text-slate-800">{formatVND(totalVal - totalPd)}</p></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400"><span>Tiến độ thanh toán</span><span>{progress}%</span></div>
                      <Progress value={progress} className={`h-1.5 ${progressColorMap[worst]}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="hidden max-h-[calc(100dvh-336px)] min-h-[420px] max-w-full overflow-x-auto overflow-y-auto sm:block">
              <Table className="min-w-[1120px] w-full table-fixed border-collapse text-2sm">
                <TableHeader className="sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="h-10 w-52 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left align-middle text-[11px] font-medium text-slate-600">
                      Khách hàng
                    </TableHead>
                    <TableHead className="h-10 w-44 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left align-middle text-[11px] font-medium text-slate-600">
                      Hợp đồng
                    </TableHead>
                    <TableHead className="h-10 w-44 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-right align-middle text-[11px] font-medium text-slate-600">
                      Tổng giá trị
                    </TableHead>
                    <TableHead className="h-10 w-52 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left align-middle text-[11px] font-medium text-slate-600">
                      Tiến độ thanh toán
                    </TableHead>
                    <TableHead className="h-10 w-40 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left align-middle text-[11px] font-medium text-slate-600">
                      Hạn gần nhất
                    </TableHead>
                    <TableHead className="h-10 w-40 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left align-middle text-[11px] font-medium text-slate-600">
                      Trạng thái
                    </TableHead>
                    <TableHead className="sticky right-0 z-40 h-10 w-14 border-b border-l border-slate-200 bg-slate-50 px-0 py-2 text-center text-[11px] font-medium text-slate-600">...</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                        Không tìm thấy kết quả phù hợp bộ lọc
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((customer) => {
                      const totalVal = getCustomerTotalValue(customer);
                      const totalPd = getCustomerTotalPaid(customer);
                      const progress = getCustomerProgress(customer);
                      const worst = getCustomerWorstStatus(customer);
                      const nextDue = getCustomerNextDue(customer);
                      const lateFee = getCustomerTotalLateFee(customer);
                      const overdueContracts = customer.contracts.filter(
                        (ct) => ct.status === "overdue"
                      );
                      const isOverdue = worst === "overdue";
                      const contractCount = customer.contracts.length;

                      return (
                        <TableRow
                          key={customer.id}
                          className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                          onClick={() => navigate(`/debt/customer/${customer.id}`)}
                        >
                          {/* Customer */}
                          <TableCell className="h-11 w-52 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs text-white ${customer.avatarColor}`} style={{ fontWeight: 750 }}>
                                {customer.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-slate-800 group-hover:text-indigo-700">
                                  {customer.name}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contracts */}
                          <TableCell className="h-11 w-44 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                            {contractCount === 1 ? (
                              <>
                                <p className="truncate text-xs font-medium text-slate-700">
                                  {customer.contracts[0].projectName}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                  Căn {customer.contracts[0].unit}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="size-3.5 text-slate-400 shrink-0" />
                                  <span className="text-xs font-medium text-slate-700">
                                    {contractCount} hợp đồng
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                                  {customer.contracts
                                    .map((ct) => ct.projectName.split(" ").slice(-2).join(" "))
                                    .join(" · ")}
                                </p>
                              </>
                            )}
                          </TableCell>

                          {/* Total Value */}
                          <TableCell className="h-11 w-44 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle text-right group-hover:bg-slate-50">
                            <p className="text-xs font-medium text-slate-800">
                              {formatVND(totalVal)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Đã thu: {formatVND(totalPd)}
                            </p>
                          </TableCell>

                          {/* Progress */}
                          <TableCell className="h-11 w-52 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>{progress}%</span>
                                <span>Còn: {formatVND(totalVal - totalPd)}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 relative">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    isOverdue
                                      ? "bg-red-500"
                                      : worst === "upcoming"
                                      ? "bg-blue-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              {isOverdue && lateFee > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help w-fit">
                                      <Info className="size-3 text-red-500 shrink-0" />
                                      <span className="text-[10px] text-red-600">
                                        Phạt trễ: <span className="font-medium">{formatVND(lateFee)}</span>
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="text-xs max-w-56 bg-slate-900 text-white p-2 rounded shadow-md z-50">
                                    <p className="font-medium">
                                      {overdueContracts.length > 1
                                        ? `${overdueContracts.length} hợp đồng quá hạn`
                                        : overdueContracts[0]?.projectName}
                                    </p>
                                    {overdueContracts.map((ct) => (
                                      <p key={ct.id} className="mt-1 text-slate-300">
                                        {ct.projectName}: +{formatVND(ct.lateFee ?? 0)} ({ct.daysOverdue} ngày)
                                      </p>
                                    ))}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>

                          {/* Next Due */}
                          <TableCell className="h-11 w-40 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                            {nextDue ? (
                              <>
                                <p className={`text-xs ${isOverdue ? "font-medium text-red-600" : "font-medium text-slate-700"}`}>
                                  {fmtDate(nextDue.date)}
                                </p>
                                {isOverdue && nextDue.contract.daysOverdue != null && (
                                  <p className="text-[11px] text-red-500">
                                    {overdueContracts.length > 1
                                      ? `${overdueContracts.length} HĐ quá hạn`
                                      : `${nextDue.contract.daysOverdue} ngày trước`}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-slate-300">—</p>
                            )}
                          </TableCell>

                          {/* Status Badge Group */}
                          <TableCell className="h-11 w-40 border-b border-r border-slate-200 bg-white px-3 py-1.5 align-middle group-hover:bg-slate-50">
                            <StatusBadgeGroup contracts={customer.contracts} />
                          </TableCell>

                          {/* Action Button */}
                          <TableCell className="td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-slate-200 bg-white px-0 py-1.5 text-center group-hover:bg-slate-50" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Xem công nợ của ${customer.name}`}
                                  className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100"
                                  onClick={() => navigate(`/debt/customer/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs bg-slate-900 text-white p-1 px-2 rounded shadow-md z-50">
                                Xem hợp đồng khách hàng
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex h-12 items-center justify-between border-t border-slate-200 bg-white px-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div>Hiển thị {filtered.length} / {customers.length} khách hàng</div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">Cập nhật lần cuối: 20/04/2026</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-medium text-slate-600">
                  {filtered.length === 0 ? "0-0" : `1-${filtered.length}`} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
                </div>
              </div>
            </div>
          </Card>
      </div>
    </TooltipProvider>
  );
}
