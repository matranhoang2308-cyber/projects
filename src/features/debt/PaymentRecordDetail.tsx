import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building2,
  Download,
  Send,
  BadgeCheck,
  FileText,
  Info,
  AlertTriangle,
  User,
  CalendarDays,
  Percent,
  Clock,
  Building,
  CreditCard,
  Edit3,
} from "lucide-react";
import {
  customers,
  formatVND,
  calcLateFee,
  calculateDaysAfterDue,
  calculateInterestDays,
  calculateLateInterest,
  type PaymentRecord,
  type PaymentStage,
  type InvoiceFile,
  type DebtAuditLog,
} from "@/data/mockDataCongNo";
import { DebtAdjustmentDialog } from "./DebtAdjustmentDialog";
import { AuditHistorySection } from "./AuditHistorySection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function vndFull(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n * 1_000_000_000)) + " VNĐ";
}

// ─── Interest Calculation Detail ─────────────────────────────────────────────

interface InterestPeriod {
  stt: number;
  startDate: string;
  endDate: string;
  days: number;
  principalStart: number;
  paymentInPeriod: number;
  principalForInterest: number;
  interestRate: number;
  interestAmount: number;
}

/**
 * Calculate interest periods based on actual payment history
 * Rule: Interest only calculated after grace period (10 days by default)
 * Interest calculated from due date, not after grace period
 */
function calculateInterestPeriods(
  record: PaymentRecord,
  interestStartDate: string, // Due date
  currentDate: string,
  dailyRate: number,
  gracePeriodDays: number = 10
): InterestPeriod[] {
  const periods: InterestPeriod[] = [];

  const daysAfterDue = record.daysAfterDue ?? record.daysOverdue ?? 0;

  // If within grace period, no interest
  if (daysAfterDue <= gracePeriodDays) {
    return [];
  }

  // Calculate interest days (from due date, not after grace)
  const interestDays = daysAfterDue;

  // If there was a partial payment, split into periods
  if (record.paidAmount > 0 && record.paidAmount < record.baseAmount && record.paidDate) {
    // Period 1: From due date to paid date
    const daysToPaid = calculateDaysAfterDue(record.dueDate, record.paidDate);
    if (daysToPaid > 0) {
      periods.push({
        stt: 1,
        startDate: fmtDate(record.dueDate),
        endDate: fmtDate(record.paidDate),
        days: daysToPaid,
        principalStart: record.baseAmount,
        paymentInPeriod: record.paidAmount,
        principalForInterest: record.baseAmount,
        interestRate: dailyRate,
        interestAmount: calcLateFee(record.baseAmount, dailyRate * 365, daysToPaid),
      });
    }

    // Period 2: From paid date to current
    const daysAfterPaid = calculateDaysAfterDue(record.paidDate, currentDate);
    if (daysAfterPaid > 0 && record.remainingAmount > 0) {
      periods.push({
        stt: 2,
        startDate: fmtDate(record.paidDate),
        endDate: currentDate,
        days: daysAfterPaid,
        principalStart: record.remainingAmount,
        paymentInPeriod: 0,
        principalForInterest: record.remainingAmount,
        interestRate: dailyRate,
        interestAmount: calcLateFee(record.remainingAmount, dailyRate * 365, daysAfterPaid),
      });
    }
  } else {
    // No partial payment or fully unpaid - single period
    const principalForInterest = record.remainingAmount > 0 ? record.remainingAmount : record.baseAmount;
    periods.push({
      stt: 1,
      startDate: fmtDate(record.dueDate),
      endDate: currentDate,
      days: interestDays,
      principalStart: record.baseAmount,
      paymentInPeriod: record.paidAmount || 0,
      principalForInterest,
      interestRate: dailyRate,
      interestAmount: calcLateFee(principalForInterest, dailyRate * 365, interestDays),
    });
  }

  return periods;
}

// ─── Interest Detail Dialog ──────────────────────────────────────────────────

function InterestDetailDialog({
  open,
  onClose,
  record,
  projectName,
  contractCode,
  periods,
}: {
  open: boolean;
  onClose: () => void;
  record: PaymentRecord;
  projectName: string;
  contractCode: string;
  periods: InterestPeriod[];
}) {
  const totalInterest = periods.reduce((sum, p) => sum + p.interestAmount, 0);
  const principalRemaining = record.baseAmount - (periods[0]?.paymentInPeriod || 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-base text-foreground mb-1">
                Chi tiết cách tính lãi trễ hạn
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {record.label} - {contractCode}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="border-red-200 bg-red-50 text-red-700 text-[10px] px-1.5 h-4">
                  Quá hạn {record.daysOverdue} ngày
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 border-border/60 shrink-0"
            >
              <Download className="size-3" />
              Xuất PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Tổng quan */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border border-border/60 bg-muted/20 p-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Gốc còn nợ
              </p>
              <p className="text-base text-foreground">{formatVND(principalRemaining)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Lãi trễ hạn tạm tính
              </p>
              <p className="text-base text-red-600">{formatVND(totalInterest)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Tổng cần thanh toán
              </p>
              <p className="text-base text-foreground font-medium">
                {formatVND(principalRemaining + totalInterest)}
              </p>
            </div>
          </div>

          {/* Công thức */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs text-foreground mb-2">Công thức tính lãi trễ hạn:</p>
            <p className="text-sm text-foreground font-mono mb-3">
              Lãi = Gốc còn nợ × Lãi suất/ngày × Số ngày quá hạn
            </p>
            <p className="text-xs text-muted-foreground">Ví dụ:</p>
            <p className="text-xs text-foreground font-mono">
              {formatVND(1.0)} × 0,05% × 10 ngày = {formatVND(calcLateFee(1.0, 0.05 * 365, 10))}
            </p>
          </div>

          {/* Bảng chi tiết */}
          <div>
            <h3 className="text-sm text-foreground mb-3">Bảng chi tiết tính lãi</h3>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        STT
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Khoảng thời gian
                      </th>
                      <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Số ngày
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Gốc đầu kỳ
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        TT trong kỳ
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Gốc tính lãi
                      </th>
                      <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Lãi suất
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Lãi phát sinh
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period, idx) => (
                      <tr
                        key={period.stt}
                        className={idx === periods.length - 1 ? "" : "border-b border-border/40"}
                      >
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {period.stt}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {period.startDate} - {period.endDate}
                        </td>
                        <td className="px-3 py-3 text-center text-foreground tabular-nums">
                          {period.days} ngày
                        </td>
                        <td className="px-3 py-3 text-right text-foreground tabular-nums">
                          {formatVND(period.principalStart)}
                        </td>
                        <td className="px-3 py-3 text-right text-foreground tabular-nums">
                          {period.paymentInPeriod > 0
                            ? formatVND(period.paymentInPeriod)
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-foreground tabular-nums font-medium">
                          {formatVND(period.principalForInterest)}
                        </td>
                        <td className="px-3 py-3 text-center text-foreground tabular-nums">
                          {period.interestRate.toFixed(2)}%
                        </td>
                        <td className="px-3 py-3 text-right text-red-600 tabular-nums font-medium">
                          {formatVND(period.interestAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border/60 bg-slate-50">
                      <td colSpan={7} className="px-3 py-3 text-right text-xs text-foreground font-medium">
                        Tổng lãi trễ hạn tạm tính:
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-red-600 tabular-nums font-semibold">
                        {formatVND(totalInterest)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-3 py-2.5 text-right text-xs text-foreground font-medium">
                        Tổng cần thanh toán:
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums font-semibold">
                        {formatVND(principalRemaining + totalInterest)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Lưu ý */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-900 font-medium mb-2">Quy tắc tính lãi:</p>
            <ul className="space-y-1.5 text-xs text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Ân hạn 10 ngày:</strong> Thanh toán trong 10 ngày sau hạn không tính lãi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Không lãi kép:</strong> Lãi chỉ tính trên số gốc, không tính lãi trên lãi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Không xuất hóa đơn lãi:</strong> Lãi trễ hạn không được xuất hóa đơn.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Lãi được tính trên số dư gốc còn nợ thực tế từng khoảng thời gian.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Khoản thanh toán một phần làm giảm dư nợ từ ngày được ghi nhận.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Dữ liệu chính thức được xác nhận theo điều khoản hợp đồng và chứng từ kế toán.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60">
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Đóng
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="size-4" />
              Xuất PDF
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Send className="size-4" />
              Gửi cho khách hàng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentRecordDetail() {
  const { customerId, contractId, stageId, recordId } = useParams<{
    customerId: string;
    contractId: string;
    stageId: string;
    recordId: string;
  }>();
  const navigate = useNavigate();

  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  let targetCustomerId = customerId;
  if (customerId && customerId.startsWith("C")) {
    const num = parseInt(customerId.substring(1), 10);
    if (!isNaN(num) && num >= 1 && num <= 5) {
      targetCustomerId = String(num);
    }
  }

  const customer = customers.find((c) => c.id === targetCustomerId);
  let contract = customer?.contracts.find((ct) => ct.id === contractId);
  if (customer && !contract && contractId) {
    contract = customer.contracts[0];
  }
  const stage = contract?.stages?.find((s) => s.id === stageId);
  const record = stage?.records.find((r) => r.id === recordId);

  if (!customer || !contract || !stage || !record) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Building2 className="size-10 opacity-30" />
        <p>Không tìm thấy thông tin đợt thanh toán</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/debt/customer/${customerId}/contract/${contractId}`)}
        >
          <ArrowLeft className="size-4 mr-2" />
          Quay lại hợp đồng
        </Button>
      </div>
    );
  }

  // Contract info
  const contractCode = `HDMB-${contract.projectName.substring(0, 3).toUpperCase()}-${contract.unit.replace(".", "")}-2026`;
  const salesperson = "Nguyễn Minh Anh"; // Mock data

  // Interest calculation
  const dailyInterestRate = record.dailyInterestRate ?? 0.05; // 0.05%/ngày
  const annualRate = 14; // 14%/năm (để hiển thị)
  const gracePeriodDays = record.gracePeriodDays ?? 10;
  const currentDateObj = new Date();
  const currentDate = fmtDate(currentDateObj.toISOString());

  const interestPeriods = calculateInterestPeriods(
    record,
    fmtDate(record.dueDate), // Interest starts from due date
    currentDate,
    dailyInterestRate,
    gracePeriodDays
  );

  const totalInterest = interestPeriods.reduce((sum, p) => sum + p.interestAmount, 0);
  const principalPaid = record.paidAmount ?? 0;
  const principalRemaining = record.remainingAmount ?? (record.baseAmount - principalPaid);
  const totalDue = principalRemaining + totalInterest;

  const statusConfig: Record<string, { label: string; className: string }> = {
    "not-due": { label: "Chưa đến hạn", className: "border-slate-200 bg-slate-50 text-slate-700" },
    upcoming: { label: "Sắp đến hạn", className: "border-blue-200 bg-blue-50 text-blue-700" },
    paid: { label: "Đã thanh toán", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    partial: { label: "Thanh toán một phần", className: "border-orange-200 bg-orange-50 text-orange-700" },
    overpaid: { label: "Thanh toán dư", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
    overdue: { label: "Quá hạn", className: "border-red-200 bg-red-50 text-red-700" },
    "grace-period": { label: "Quá hạn (trong ân hạn)", className: "border-amber-200 bg-amber-50 text-amber-700" },
    "deposit-forfeited": { label: "Mất cọc", className: "border-red-300 bg-red-100 text-red-800" },
    extended: { label: "Đã gia hạn", className: "border-purple-200 bg-purple-50 text-purple-700" },
  };

  // Mock: payment history
  const paymentHistory = principalPaid > 0 ? [
    {
      date: "11/06/2026",
      description: `Thanh toán một phần ${record.label}`,
      amount: principalPaid,
      toPrincipal: principalPaid,
      toInterestFee: 0,
      transactionCode: "GD-11062026-001",
      confirmedBy: salesperson,
    }
  ] : [];

  // Timeline history
  const daysAfterDue = record.daysAfterDue ?? record.daysOverdue ?? 0;
  const timelineEvents = [
    { date: fmtDate(record.dueDate), event: "Đợt thanh toán đến hạn." },
    ...(daysAfterDue > gracePeriodDays
      ? [{ date: fmtDate(record.dueDate), event: `Bắt đầu tính lãi trễ hạn (sau ${gracePeriodDays} ngày ân hạn).` }]
      : []
    ),
    ...(principalPaid > 0 && record.paidDate
      ? [{ date: fmtDate(record.paidDate), event: `Ghi nhận thanh toán một phần ${formatVND(principalPaid)}.` }]
      : []
    ),
    ...(totalInterest > 0
      ? [{ date: currentDate, event: `Cập nhật lãi trễ hạn tạm tính ${formatVND(totalInterest)}.` }]
      : []
    ),
  ];

  // Handle adjustment confirmation
  const handleAdjustmentConfirm = (auditLog: DebtAuditLog) => {
    // In a real app, this would update the backend and refresh data
    console.log("Adjustment confirmed:", auditLog);
    alert(`Điều chỉnh đã được ghi nhận: ${auditLog.fieldName}\nTừ: ${auditLog.oldValue} → ${auditLog.newValue}`);
    setAdjustmentDialogOpen(false);
    // Optionally: refresh page or update local state
  };

  return (
    <>
      <InterestDetailDialog
        open={interestDialogOpen}
        onClose={() => setInterestDialogOpen(false)}
        record={record}
        projectName={contract.projectName}
        contractCode={contractCode}
        periods={interestPeriods}
      />

      <DebtAdjustmentDialog
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        record={record}
        contractName={contract.projectName}
        onConfirm={handleAdjustmentConfirm}
      />

      <div className="min-h-full bg-slate-50/80">
        <section aria-labelledby="payment-record-title" className="mx-auto max-w-screen-xl space-y-6 p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Quay lại chi tiết công nợ"
                onClick={() => navigate(`/debt/customer/${customerId}/contract/${contractId}`)}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 id="payment-record-title" className="text-lg text-foreground">{record.label}</h1>
                  <Badge className={statusConfig[record.status].className}>
                    {statusConfig[record.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Thuộc hợp đồng {contractCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="size-4" />
                Xuất PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Send className="size-4" />
                Gửi thông báo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setAdjustmentDialogOpen(true)}
              >
                <Edit3 className="size-4" />
                Điều chỉnh công nợ
              </Button>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <BadgeCheck className="size-4" />
                Ghi nhận thanh toán
              </Button>
            </div>
          </div>

          {/* SECTION 1: Thông tin khách hàng và hợp đồng */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">
                Thông tin khách hàng và hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-x-8 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Khách hàng
                </p>
                <p className="text-sm text-foreground">{customer.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Mã hợp đồng
                </p>
                <p className="text-sm text-foreground">{contractCode}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Dự án
                </p>
                <p className="text-sm text-foreground">{contract.projectName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Mã căn
                </p>
                <p className="text-sm text-foreground">{contract.unit}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Loại sản phẩm
                </p>
                <p className="text-sm text-foreground">Sky Garden</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Nhân viên phụ trách
                </p>
                <p className="text-sm text-foreground">{salesperson}</p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: Tổng quan công nợ */}
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Số tiền phải thu</p>
                  <p className="text-xl text-foreground">{formatVND(record.baseAmount)}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Số tiền đã thu</p>
                  <p className="text-xl text-emerald-600">{formatVND(principalPaid)}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Gốc còn nợ</p>
                  <p className="text-xl text-foreground">{formatVND(principalRemaining)}</p>
                </CardContent>
              </Card>
              <Card
                className="border-red-200 shadow-none bg-red-50/50 cursor-pointer hover:bg-red-50 transition-colors"
                onClick={() => setInterestDialogOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-red-700">Lãi trễ hạn tạm tính</p>
                      {record.adjustedLateInterest !== undefined && (
                        <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700">
                          Đã điều chỉnh
                        </Badge>
                      )}
                    </div>
                    <Info className="size-3.5 text-red-500" />
                  </div>
                  {record.adjustedLateInterest !== undefined ? (
                    <div className="space-y-1">
                      <p className="text-sm text-red-500 line-through">
                        {formatVND(totalInterest)}
                      </p>
                      <p className="text-xl text-red-600">{formatVND(record.adjustedLateInterest)}</p>
                      <p className="text-xs text-muted-foreground">
                        Chênh lệch: {formatVND(record.adjustedLateInterest - totalInterest)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl text-red-600">{formatVND(totalInterest)}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {record.status === "overdue" && record.daysOverdue && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="size-4" />
                <AlertDescription className="text-xs text-red-700">
                  Đợt thanh toán đã quá hạn <strong>{record.daysOverdue} ngày</strong>. Lãi trễ
                  hạn được tính trên số dư thực tế còn nợ trong từng khoảng thời gian.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* SECTION 3: Thông tin đợt thanh toán */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Thông tin đợt thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Đợt thanh toán
                </p>
                <p className="text-sm text-foreground">{record.label}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Loại đợt
                </p>
                <p className="text-sm text-foreground">Đợt thanh toán gốc</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Ngày đến hạn gốc
                </p>
                <p className="text-sm text-foreground">{fmtDate(record.dueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Ngày bắt đầu tính lãi
                </p>
                <p className="text-sm text-foreground">
                  {record.interestStartDate
                    ? fmtDate(record.interestStartDate)
                    : daysAfterDue > gracePeriodDays
                    ? fmtDate(record.dueDate)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Ngày chốt lãi gần nhất
                </p>
                <p className="text-sm text-foreground">{currentDate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Số ngày quá hạn
                </p>
                <p className="text-sm text-red-600">
                  {record.daysOverdue} ngày
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Lãi suất áp dụng
                </p>
                <p className="text-sm text-foreground">{dailyInterestRate}%/ngày</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Nguồn áp dụng
                </p>
                <p className="text-sm text-foreground">Điều khoản HĐMB</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Cách tính lãi
                </p>
                <p className="text-sm text-foreground">Tính trên số dư gốc còn nợ thực tế</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Trạng thái gia hạn
                </p>
                <p className="text-sm text-foreground">
                  {record.extensions && record.extensions.length > 0
                    ? `Đã gia hạn ${record.extensions.length} lần`
                    : "Chưa gia hạn"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: Chi tiết tính lãi trễ hạn */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm text-foreground">
                  Chi tiết tính lãi trễ hạn
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Lãi được tính riêng theo từng khoảng thời gian dựa trên số dư gốc thực tế.
                        Khoản thanh toán đã ghi nhận sẽ làm giảm dư nợ cho khoảng thời gian tiếp
                        theo.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/60">
                        <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-12">
                          STT
                        </th>
                        <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Khoảng thời gian
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Số ngày
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Gốc đầu kỳ
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          TT trong kỳ
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Gốc tính lãi
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Lãi suất
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Lãi phát sinh
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {interestPeriods.map((period, idx) => (
                        <tr
                          key={period.stt}
                          className={
                            idx === interestPeriods.length - 1 ? "" : "border-b border-border/40"
                          }
                        >
                          <td className="px-3 py-3 text-center text-muted-foreground">
                            {period.stt}
                          </td>
                          <td className="px-3 py-3 text-foreground">
                            {period.startDate} - {period.endDate}
                          </td>
                          <td className="px-3 py-3 text-center text-foreground tabular-nums">
                            {period.days}
                          </td>
                          <td className="px-3 py-3 text-right text-foreground tabular-nums">
                            {formatVND(period.principalStart)}
                          </td>
                          <td className="px-3 py-3 text-right text-foreground tabular-nums">
                            {period.paymentInPeriod > 0
                              ? formatVND(period.paymentInPeriod)
                              : "—"}
                          </td>
                          <td className="px-3 py-3 text-right text-foreground tabular-nums font-medium">
                            {formatVND(period.principalForInterest)}
                          </td>
                          <td className="px-3 py-3 text-center text-foreground tabular-nums">
                            {period.interestRate}%
                          </td>
                          <td className="px-3 py-3 text-right text-red-600 tabular-nums">
                            {formatVND(period.interestAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border/60 bg-muted/20">
                        <td colSpan={7} className="px-3 py-3 text-right text-xs text-foreground">
                          Tổng lãi trễ hạn tạm tính:
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-red-600 tabular-nums font-medium">
                          {formatVND(totalInterest)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="px-3 py-2.5 text-right text-xs text-foreground font-medium">
                          Tổng cần thanh toán:
                        </td>
                        <td className="px-3 py-2.5 text-right text-sm text-foreground tabular-nums font-semibold">
                          {formatVND(totalDue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setInterestDialogOpen(true)}
                >
                  <Info className="size-3" />
                  Xem cách tính chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5: Công thức áp dụng */}
          <Card className="border-slate-200 bg-slate-100/70 shadow-inner shadow-slate-200/50">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Công thức tính lãi trễ hạn:</p>
              <p className="text-sm text-foreground font-mono mb-3">
                Lãi trễ hạn = Gốc còn nợ × Lãi suất/ngày × Số ngày quá hạn
              </p>
              <div className="rounded-md bg-white border border-border/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Ví dụ:</p>
                <p className="text-sm text-foreground font-mono">
                  {vndFull(1.0)} × 0,05% × 10 ngày = {vndFull(calcLateFee(1.0, 0.05 * 365, 10))}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Một khoản gốc không được tính lãi hai lần trong cùng một khoảng thời gian.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 6: Lịch sử thanh toán */}
          {paymentHistory.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground">Lịch sử thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/60">
                          <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Ngày GD
                          </th>
                          <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Nội dung
                          </th>
                          <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Số tiền
                          </th>
                          <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Phân bổ gốc
                          </th>
                          <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Phân bổ lãi/phí
                          </th>
                          <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Mã GD
                          </th>
                          <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Người XN
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment, idx) => (
                          <tr key={idx} className="border-b border-border/40">
                            <td className="px-3 py-3 text-foreground">{payment.date}</td>
                            <td className="px-3 py-3 text-foreground">{payment.description}</td>
                            <td className="px-3 py-3 text-right text-foreground tabular-nums font-medium">
                              {formatVND(payment.amount)}
                            </td>
                            <td className="px-3 py-3 text-right text-foreground tabular-nums">
                              {formatVND(payment.toPrincipal)}
                            </td>
                            <td className="px-3 py-3 text-right text-foreground tabular-nums">
                              {payment.toInterestFee > 0 ? formatVND(payment.toInterestFee) : "—"}
                            </td>
                            <td className="px-3 py-3 text-foreground font-mono">
                              {payment.transactionCode}
                            </td>
                            <td className="px-3 py-3 text-foreground">{payment.confirmedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 7: Lịch sử điều chỉnh */}
          {record.auditLogs && record.auditLogs.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground">Lịch sử điều chỉnh</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditHistorySection auditLogs={record.auditLogs} />
              </CardContent>
            </Card>
          )}

          {/* SECTION 8: Lịch sử xử lý */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Lịch sử xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`size-2 rounded-full ${
                          idx === timelineEvents.length - 1 ? "bg-blue-500" : "bg-border"
                        }`}
                      />
                      {idx < timelineEvents.length - 1 && (
                        <div className="w-px flex-1 bg-border min-h-4" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                      <p className="text-sm text-foreground mt-0.5">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
