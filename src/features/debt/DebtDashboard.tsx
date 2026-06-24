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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconClass ?? "bg-slate-100"}`}>
            <Icon className="size-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg text-foreground mt-0.5 truncate">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
  const [statusFilter, setStatusFilter] = useState<Set<PaymentStatus>>(new Set());

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
      statusFilter.size === 0 ||
      c.contracts.some((ct) => statusFilter.has(ct.status));
    return matchSearch && matchStatus;
  });

  const toggleStatusFilter = (s: PaymentStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-full bg-slate-50/80">
        <section aria-labelledby="debt-page-title" className="mx-auto max-w-screen-xl space-y-5 p-4 md:p-6">
          {/* ── Page Title */}
          <div>
            <h1 id="debt-page-title" className="text-foreground">Quản lý Công nợ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi tiến độ thanh toán và tình trạng nợ của toàn bộ khách hàng
            </p>
          </div>

          {/* ── Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <SummaryCard
              icon={Users}
              label="Tổng khách hàng"
              value={`${customers.length} khách`}
              sub={`${allContracts.length} hợp đồng · ${overdueCustomers.length} quá hạn`}
              iconClass="bg-slate-100"
            />
            <SummaryCard
              icon={Wallet}
              label="Tổng giá trị hợp đồng"
              value={formatVND(totalValue)}
              sub={`${allContracts.length} hợp đồng`}
              iconClass="bg-blue-50"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Đã thu"
              value={formatVND(totalPaid)}
              sub={`${Math.round((totalPaid / totalValue) * 100)}% tổng danh mục`}
              iconClass="bg-emerald-50"
            />
            <SummaryCard
              icon={AlertCircle}
              label="Phạt trễ hạn (ước tính)"
              value={formatVND(totalLateFee)}
              sub={`${overdueContracts.length} hợp đồng quá hạn`}
              iconClass="bg-red-50"
            />
          </div>

          {/* ── Table Card */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="rounded-t-xl border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <CardTitle className="text-base text-foreground flex-1">
                  Danh sách công nợ
                </CardTitle>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <div className="relative min-w-0 flex-1 sm:flex-none">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Tìm tên, dự án..."
                      aria-label="Tìm khách hàng hoặc dự án trong danh sách công nợ"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 w-full bg-input-background pl-8 text-sm sm:h-8 sm:w-48 sm:text-xs border-border/60"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-1.5 border-border/60 text-xs sm:h-8"
                      >
                        <Filter className="size-3" />
                        Lọc
                        {statusFilter.size > 0 && (
                          <span className="ml-1 rounded-full bg-primary text-primary-foreground w-4 h-4 text-[10px] flex items-center justify-center">
                            {statusFilter.size}
                          </span>
                        )}
                        <ChevronDown className="size-3 ml-0.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Trạng thái hợp đồng
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(["paid", "upcoming", "overdue"] as PaymentStatus[]).map((s) => (
                        <DropdownMenuCheckboxItem
                          key={s}
                          checked={statusFilter.has(s)}
                          onCheckedChange={() => toggleStatusFilter(s)}
                          className="text-xs"
                        >
                          {statusConfig[s].label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 sm:hidden">
                {filtered.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-muted-foreground">Không tìm thấy kết quả</div>
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
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className={`text-xs ${customer.avatarColor}`}>{customer.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{customer.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                        <StatusBadgeGroup contracts={customer.contracts} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><p className="text-muted-foreground">Tổng giá trị</p><p className="mt-0.5 font-medium tabular-nums text-slate-900">{formatVND(totalVal)}</p></div>
                        <div><p className="text-muted-foreground">Còn phải thu</p><p className="mt-0.5 font-medium tabular-nums text-slate-900">{formatVND(totalVal - totalPd)}</p></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Tiến độ thanh toán</span><span>{progress}%</span></div>
                        <Progress value={progress} className={`h-1.5 ${progressColorMap[worst]}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="px-6 py-3 text-xs font-medium text-muted-foreground w-52">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          Khách hàng
                          <ArrowUpDown className="size-3" />
                        </div>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
                        Hợp đồng
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">
                        Tổng giá trị
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-52">
                        Tiến độ thanh toán
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
                        Hạn gần nhất
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground">
                        Trạng thái
                      </TableHead>
                      <TableHead className="px-4 py-3 w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground text-sm"
                        >
                          Không tìm thấy kết quả
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
                        const pc = progressColorMap[worst];
                        const isOverdue = worst === "overdue";
                        const contractCount = customer.contracts.length;

                        return (
                          <TableRow
                            key={customer.id}
                            className="border-border/40 hover:bg-accent/40 cursor-pointer transition-colors"
                            onClick={() => navigate(`/debt/customer/${customer.id}`)}
                          >
                            {/* Customer */}
                            <TableCell className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 shrink-0">
                                  <AvatarFallback className={`text-xs ${customer.avatarColor}`}>
                                    {customer.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm text-foreground leading-tight">
                                    {customer.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Contracts */}
                            <TableCell className="px-4 py-3.5">
                              {contractCount === 1 ? (
                                <>
                                  <p className="text-sm text-foreground leading-tight">
                                    {customer.contracts[0].projectName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Căn {customer.contracts[0].unit}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="size-3 text-muted-foreground" />
                                    <span className="text-sm text-foreground">
                                      {contractCount} hợp đồng
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
                                    {customer.contracts
                                      .map((ct) => ct.projectName.split(" ").slice(-2).join(" "))
                                      .join(" · ")}
                                  </p>
                                </>
                              )}
                            </TableCell>

                            {/* Total Value */}
                            <TableCell className="px-4 py-3.5 text-right">
                              <p className="text-sm text-foreground tabular-nums">
                                {formatVND(totalVal)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Đã thu: {formatVND(totalPd)}
                              </p>
                            </TableCell>

                            {/* Progress */}
                            <TableCell className="px-4 py-3.5 w-52">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {progress}%
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Còn: {formatVND(totalVal - totalPd)}
                                  </span>
                                </div>
                                <Progress
                                  value={progress}
                                  className={`h-1.5 ${
                                    isOverdue
                                      ? "bg-red-100"
                                      : worst === "upcoming"
                                      ? "bg-blue-100"
                                      : "bg-emerald-100"
                                  } ${pc}`}
                                />
                                {isOverdue && lateFee > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-help w-fit">
                                        <Info className="size-3 text-red-500 shrink-0" />
                                        <span className="text-[11px] text-red-600">
                                          Phạt trễ:{" "}
                                          <span className="font-medium">
                                            {formatVND(lateFee)}
                                          </span>
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs max-w-56">
                                      <p>
                                        {overdueContracts.length > 1
                                          ? `${overdueContracts.length} hợp đồng quá hạn`
                                          : overdueContracts[0]?.projectName}
                                      </p>
                                      {overdueContracts.map((ct) => (
                                        <p key={ct.id} className="mt-1 text-muted-foreground">
                                          {ct.projectName}: +{formatVND(ct.lateFee ?? 0)} ({ct.daysOverdue} ngày)
                                        </p>
                                      ))}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>

                            {/* Next Due */}
                            <TableCell className="px-4 py-3.5">
                              {nextDue ? (
                                <>
                                  <p
                                    className={`text-sm ${
                                      isOverdue ? "text-red-600" : "text-foreground"
                                    }`}
                                  >
                                    {fmtDate(nextDue.date)}
                                  </p>
                                  {isOverdue && nextDue.contract.daysOverdue != null && (
                                    <p className="text-xs text-red-500">
                                      {overdueContracts.length > 1
                                        ? `${overdueContracts.length} HĐ quá hạn`
                                        : `${nextDue.contract.daysOverdue} ngày trước`}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                              )}
                            </TableCell>

                            {/* ── Status: hiển thị TẤT CẢ trạng thái phân biệt ── */}
                            <TableCell className="px-4 py-3.5">
                              <StatusBadgeGroup contracts={customer.contracts} />
                            </TableCell>

                            {/* Action */}
                            <TableCell
                              className="px-4 py-3.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Xem công nợ của ${customer.name}`}
                                    className="size-9 text-muted-foreground hover:text-foreground"
                                    onClick={() => navigate(`/debt/customer/${customer.id}`)}
                                  >
                                    <Eye className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
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

              <div className="flex flex-col gap-1 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-muted-foreground">
                  Hiển thị {filtered.length} / {customers.length} khách hàng
                </p>
                <p className="text-xs text-muted-foreground">
                  Cập nhật lần cuối: 20/04/2026
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </TooltipProvider>
  );
}
