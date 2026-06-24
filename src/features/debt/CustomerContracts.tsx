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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    label: "Thanh toán dư",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
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

function StatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "paid")
    return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
  if (status === "overdue")
    return <AlertTriangle className="size-4 text-red-500 shrink-0" />;
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

  const customer = customers.find((c) => c.id === customerId);

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
            {/* Quick stats pills */}
            <div className="hidden sm:flex items-center gap-2">
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
          </div>

          {/* Contracts grid */}
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
        </div>
      </section>
    </div>
  );
}
