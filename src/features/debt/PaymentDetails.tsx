import { useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router";
import type { ElementType } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  TrendingDown,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Printer,
  Hash,
  CreditCard,
  Building,
  Calendar,
  CalendarClock,
  Pencil,
  Plus,
  History,
  ShieldX,
  ShieldCheck,
  User,
  MoreHorizontal,
  LayoutList,
  Table2,
  Bell,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { PaymentReminderDialog } from "@/components/reminders/PaymentReminderDialog";
import {
  customers,
  formatVND,
  calcLateFee,
  getContractTotalLateFee,
  normalizePaymentRecord,
  type InvoiceFile,
  type PaymentRecord,
  type PaymentStage,
  type PaymentStatus,
  type StageStatus,
  type PaymentExtension,
  type ExtensionInstallment,
  type DebtAuditLog,
} from "@/data/mockDataCongNo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ExtensionDialog } from "./ExtensionDialog";
import { ExtensionPaymentConfirmDialog } from "./ExtensionPaymentConfirmDialog";
import { PaymentConfirmDialog } from "./PaymentConfirmDialog";
import { DebtAdjustmentDialog } from "./DebtAdjustmentDialog";
import { AuditHistorySection } from "./AuditHistorySection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuditLogsFromStorage = (recordId: string, initialLogs: any[] = []): any[] => {
  try {
    const saved = localStorage.getItem(`crm-audit-logs-${recordId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const combined = [...initialLogs];
      parsed.forEach((log: any) => {
        if (!combined.some((c) => c.id === log.id)) {
          combined.push(log);
        }
      });
      return combined;
    }
  } catch (e) {
    console.error("Failed to load audit logs", e);
  }
  return initialLogs;
};

const saveAuditLogToStorage = (recordId: string, log: any) => {
  try {
    const saved = localStorage.getItem(`crm-audit-logs-${recordId}`);
    const list = saved ? JSON.parse(saved) : [];
    list.push(log);
    localStorage.setItem(`crm-audit-logs-${recordId}`, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save audit log", e);
  }
};

// Override tạm thời cho 1 đợt sau thanh toán. carryOut: số đẩy xuống đợt kế tiếp (dương = còn thiếu, âm = trả dư).
type RecordOverride = Partial<PaymentRecord> & { carryOut?: number };

// Tính số dư/thiếu mà đợt liền trước đẩy xuống đợt hiện tại (CHỈ 1 bước).
// - Nếu đợt trước đã ghi nhận thanh toán qua dialog → dùng carryOut đã lưu.
// - Nếu chưa (data gốc) → chỉ đợt 'overdue'/'partial' mới có dư nợ chuyển tiếp; đợt chưa đến hạn = 0.
function computeCarryForward(
  prevStage: PaymentStage | undefined,
  overrides: Map<string, RecordOverride>
): number {
  if (!prevStage) return 0;
  return prevStage.records.reduce((sum, r) => {
    const ov = overrides.get(r.id);
    if (ov && typeof ov.carryOut === "number") return sum + ov.carryOut;
    // Đợt trước còn thiếu → dồn nợ (dương)
    if (r.status === "overdue" || r.status === "partial") {
      return sum + (r.remainingAmount ?? Math.max(0, r.baseAmount - (r.paidAmount ?? 0)));
    }
    // Đợt trước trả dư → giảm trừ (âm)
    if (r.status === "overpaid") {
      return sum - Math.max(0, (r.paidAmount ?? 0) - (r.baseAmount + (r.lateInterest ?? 0)));
    }
    return sum;
  }, 0);
}

// Tạo audit log (session) cho một lần ghi nhận thanh toán, để hiển thị trong "Xem lịch sử công nợ".
function buildPaymentAuditLog(
  recordId: string,
  amount: number,
  paidDate: string,
  invoice: InvoiceFile,
  label?: string
): DebtAuditLog {
  return {
    id: `audit-pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    target: "paid-amount",
    targetId: recordId,
    fieldName: "Ghi nhận thanh toán",
    oldValue: "—",
    newValue: formatVND(amount),
    reason: label ? `Thanh toán ${label}` : "Xác nhận thanh toán",
    requestedBy: "Kế toán",
    approvedBy: "Nguyễn Minh Anh",
    createdAt: new Date(paidDate).toISOString(),
    note: invoice.invoiceNumber ? `Hóa đơn ${invoice.invoiceNumber}` : undefined,
  };
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  "not-due": {
    label: "Sắp đến hạn",
    className: "border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm",
  },
  upcoming: {
    label: "Sắp đến hạn",
    className: "border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-sm",
  },
  partial: {
    label: "Quá hạn",
    className: "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
  },
  overpaid: {
    label: "Đã thanh toán",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-sm",
  },
  overdue: {
    label: "Quá hạn",
    className: "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
  },
  "grace-period": {
    label: "Quá hạn",
    className: "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
  },
  "deposit-forfeited": {
    label: "Quá hạn",
    className: "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
  },
  extended: {
    label: "Sắp đến hạn",
    className: "border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm",
  },
};

const renderStatusBadges = (status: PaymentStatus, mlAuto = true) => {
  const marginClass = mlAuto ? "ml-auto" : "";
  if (status === "paid") {
    return (
      <Badge className={`border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-sm text-[10px] px-1.5 py-0 shrink-0 ${marginClass}`}>
        Đã thanh toán
      </Badge>
    );
  }
  if (status === "overpaid") {
    return (
      <div className={`flex items-center gap-1.5 shrink-0 ${marginClass}`}>
        <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700 text-[10px] px-1.5 py-0">
          Thanh toán dư
        </Badge>
        <Badge className="border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-sm text-[10px] px-1.5 py-0">
          Đã thanh toán
        </Badge>
      </div>
    );
  }
  if (status === "overdue" || status === "grace-period" || status === "deposit-forfeited") {
    const label = status === "deposit-forfeited" ? "Mất cọc" : (status === "grace-period" ? "Trong thời gian ân hạn" : "Quá hạn");
    return (
      <Badge className={`border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm text-[10px] px-1.5 py-0 shrink-0 ${marginClass}`}>
        {label}
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <div className={`flex items-center gap-1.5 shrink-0 ${marginClass}`}>
        <Badge className="border-orange-200 bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0">
          Thanh toán một phần
        </Badge>
        <Badge className="border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm text-[10px] px-1.5 py-0">
          Quá hạn
        </Badge>
      </div>
    );
  }
  // not-due, upcoming, extended
  const extraTag = status === "extended" ? (
    <Badge className="border-purple-200 bg-purple-50 text-purple-700 text-[10px] px-1.5 py-0">
      Đã gia hạn
    </Badge>
  ) : null;
  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${marginClass}`}>
      {extraTag}
      <Badge className="border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm text-[10px] px-1.5 py-0">
        Sắp đến hạn
      </Badge>
    </div>
  );
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function paymentStatusToStageStatus(status: PaymentStatus): StageStatus | "overdue" {
  if (status === "paid" || status === "overpaid") return "completed";
  if (status === "not-due") return "pending";
  if (status === "overdue") return "overdue";
  return "in-progress";
}

function buildPaymentInstallmentStages(stages: PaymentStage[]): PaymentStage[] {
  // Gom tất cả record của mọi stage, rồi SẮP XẾP theo ngày đến hạn tăng dần.
  // Khách thanh toán tuần tự theo thời gian → đợt đến hạn sớm nhất là Đợt 1.
  const flattened = stages.flatMap((stage) =>
    stage.records.map((record) => ({ stage, record }))
  );

  flattened.sort(
    (a, b) => new Date(a.record.dueDate).getTime() - new Date(b.record.dueDate).getTime()
  );

  return flattened.map(({ stage, record }, idx) => {
    const normalized = normalizePaymentRecord(record);
    return {
      ...stage,
      stageNumber: idx + 1,
      name: record.label,
      description: stage.description,
      period: `Hạn ${fmtDate(record.dueDate)}`,
      totalAmount: record.baseAmount,
      paidAmount: normalized.paidAmount,
      stageStatus: paymentStatusToStageStatus(record.status),
      records: [normalized],
    };
  });
}

// ─── Invoice Dialog ───────────────────────────────────────────────────────────

function InvoiceDialog({
  open,
  onClose,
  invoice,
  record,
  customerName,
  projectName,
  unit,
}: {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceFile;
  record: PaymentRecord;
  customerName: string;
  projectName: string;
  unit: string;
}) {
  const vndFull = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n * 1_000_000_000);

  const amountInWords = (n: number) => {
    const mil = Math.round(n * 1000);
    if (mil >= 1000) {
      const ty = (mil / 1000).toFixed(3).replace(/\.?0+$/, "");
      return `${ty} tỷ đồng`;
    }
    return `${mil} triệu đồng`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <DialogTitle className="text-sm text-foreground">
              Hoá đơn thanh toán · {invoice.invoiceNumber}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Chi tiết hoá đơn thanh toán bất động sản
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 border-border/60"
              onClick={() => window.print()}
            >
              <Printer className="size-3" />
              In
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 border-border/60"
            >
              <Download className="size-3" />
              Tải PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh]">
          <div className="px-8 py-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Building2 className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{projectName}</p>
                    <p className="text-xs text-muted-foreground">Ban Quản lý Dự án</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {invoice.issuedBy}
                  <br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl text-foreground">HÓA ĐƠN</p>
                <p className="text-xs text-muted-foreground mt-1">THANH TOÁN BĐS</p>
                <div className="mt-3 inline-block rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5">
                  <p className="text-xs text-emerald-700">✓ Đã thanh toán</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Số hoá đơn</p>
                  <div className="flex items-center gap-1.5">
                    <Hash className="size-3 text-muted-foreground" />
                    <p className="text-sm text-foreground">{invoice.invoiceNumber}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Ngày thanh toán</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      {record.paidDate ? fmtDate(record.paidDate) : "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Ngày phát hành hoá đơn</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground" />
                    <p className="text-sm text-foreground">{fmtDate(invoice.uploadDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Khách hàng</p>
                  <p className="text-sm text-foreground">{customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Căn hộ</p>
                  <p className="text-sm text-foreground">{projectName} – Căn {unit}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Mã giao dịch</p>
                  <p className="text-sm text-foreground font-mono tracking-tight">{invoice.transactionRef}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Chi tiết thanh toán</p>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full text-2sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="px-4 py-2.5 text-left text-2sm text-muted-foreground font-semibold">Nội dung</th>
                      <th className="px-4 py-2.5 text-right text-2sm text-muted-foreground font-semibold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="px-4 py-3 text-foreground">
                        {record.label}
                        <p className="text-2xs text-muted-foreground mt-0.5">Đến hạn: {fmtDate(record.dueDate)}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground tabular-nums">
                        {vndFull(record.baseAmount)}
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-2.5 text-2sm text-muted-foreground">VAT (0%)</td>
                      <td className="px-4 py-2.5 text-right text-2sm text-muted-foreground tabular-nums">—</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-slate-50">
                      <td className="px-4 py-3 text-sm text-foreground">Tổng cộng</td>
                      <td className="px-4 py-3 text-right text-foreground tabular-nums">{vndFull(record.baseAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Bằng chữ:{" "}
                <span className="text-foreground not-italic">
                  {amountInWords(record.baseAmount).charAt(0).toUpperCase() +
                    amountInWords(record.baseAmount).slice(1)}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Thông tin ngân hàng</p>
              <div className="flex items-center gap-2">
                <Building className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-28 shrink-0">Ngân hàng</span>
                <span className="text-sm text-foreground">{invoice.bankName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-28 shrink-0">Số tài khoản</span>
                <span className="text-sm text-foreground font-mono tracking-tight">{invoice.bankAccount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-28 shrink-0">Mã giao dịch</span>
                <span className="text-sm text-foreground font-mono tracking-tight">{invoice.transactionRef}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Đại diện Chủ đầu tư</p>
                <div className="mt-8 pt-2 border-t border-dashed border-border/60">
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Khách hàng</p>
                <div className="mt-8 pt-2 border-t border-dashed border-border/60">
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/30 border border-border/40 px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded bg-red-100 shrink-0">
                <FileText className="size-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{invoice.fileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  PDF · {invoice.fileSize} · Tải lên: {fmtDate(invoice.uploadDate)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                <Download className="size-3" />
                Tải về
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stage Icon ───────────────────────────────────────────────────────────────

function StageIcon({ status, number }: { status: StageStatus | "overdue"; number: number }) {
  if (status === "completed")
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
        <CheckCircle2 className="size-4" />
      </div>
    );
  if (status === "overdue")
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white shrink-0 ring-4 ring-red-100">
        <AlertTriangle className="size-4 text-white stroke-[2.5]" />
      </div>
    );
  if (status === "in-progress")
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white shrink-0 ring-4 ring-blue-100">
        <Clock className="size-4" />
      </div>
    );
  return (
    <div className="flex size-8 items-center justify-center rounded-full border-2 border-border text-muted-foreground shrink-0 bg-background text-xs">
      {number}
    </div>
  );
}

// ─── Stage Label ──────────────────────────────────────────────────────────────

const stageLabelMap: Record<StageStatus | "overdue", { label: string; cls: string }> = {
  completed: { label: "Hoàn thành", cls: "text-emerald-600" },
  "in-progress": { label: "Đang tiến hành", cls: "text-blue-600" },
  pending: { label: "Chưa bắt đầu", cls: "text-muted-foreground" },
  overdue: { label: "Quá hạn", cls: "text-red-600 font-semibold" },
};

// ─── Stage Block ──────────────────────────────────────────────────────────────

function StageBlock({
  stage,
  isLast,
  customerName,
  projectName,
  unit,
  customerId,
  contractId,
  nextStageDueDate,
  carryForwardIn = 0,
  isPayable = true,
  recordOverrides,
  setRecordOverrides,
  onNavigate,
}: {
  stage: PaymentStage;
  isLast: boolean;
  customerName: string;
  projectName: string;
  unit: string;
  customerId: string;
  contractId: string;
  nextStageDueDate?: string;
  carryForwardIn?: number;
  isPayable?: boolean;
  recordOverrides: Map<string, RecordOverride>;
  setRecordOverrides: React.Dispatch<React.SetStateAction<Map<string, RecordOverride>>>;
  onNavigate: (path: string) => void;
}) {
  const [activeInvoice, setActiveInvoice] = useState<{
    invoice: InvoiceFile;
    record: PaymentRecord;
  } | null>(null);

  // Extensions stored as array per record (index 0 = oldest, last = active)
  const [localExtensions, setLocalExtensions] = useState<Map<string, PaymentExtension[]>>(
    () => {
      const m = new Map<string, PaymentExtension[]>();
      stage.records.forEach((r) => {
        if (r.extensions && r.extensions.length > 0) m.set(r.id, r.extensions);
      });
      return m;
    }
  );

  // editingIdx=undefined means adding new; editingIdx=number means editing existing
  const [extDialog, setExtDialog] = useState<{
    record: PaymentRecord;
    editingIdx?: number;
  } | null>(null);

  const [historyOpen, setHistoryOpen] = useState<Set<string>>(new Set());

  const [confirmPayTarget, setConfirmPayTarget] = useState<{
    recordId: string;
    installment: ExtensionInstallment;
  } | null>(null);

  // recordOverrides được nâng lên component cha (PaymentDetails) và truyền vào qua props,
  // để các đợt "thấy" thanh toán của nhau (carry-forward dư/thiếu xuyên đợt).

  // State for original installment payment confirmation
  const [paymentConfirmTarget, setPaymentConfirmTarget] = useState<PaymentRecord | null>(null);

  // State for debt adjustment dialog
  const [debtAdjustTarget, setDebtAdjustTarget] = useState<PaymentRecord | null>(null);

  // State for audit history dialog
  const [auditHistoryRecord, setAuditHistoryRecord] = useState<PaymentRecord | null>(null);

  // State for payment reminder dialog
  const [reminderTarget, setReminderTarget] = useState<PaymentRecord | null>(null);

  // Local audit logs per record (augmented by adjustments made in-session)
  const [localAuditLogs, setLocalAuditLogs] = useState<Map<string, import("@/data/mockDataCongNo").DebtAuditLog[]>>(
    () => {
      const m = new Map<string, import("@/data/mockDataCongNo").DebtAuditLog[]>();
      stage.records.forEach((r) => {
        const initial = r.auditLogs || [];
        m.set(r.id, getAuditLogsFromStorage(r.id, initial));
      });
      return m;
    }
  );

  const getExtList = (recordId: string): PaymentExtension[] =>
    localExtensions.get(recordId) ?? [];

  const toggleHistory = (recordId: string) =>
    setHistoryOpen((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });

  const handleSaveExtension = (
    recordId: string,
    ext: PaymentExtension,
    editingIdx?: number
  ) => {
    setLocalExtensions((prev) => {
      const list = [...(prev.get(recordId) ?? [])];
      if (editingIdx !== undefined) {
        list[editingIdx] = ext;
      } else {
        list.push(ext);
      }
      return new Map(prev).set(recordId, list);
    });
    setExtDialog(null);
  };

  const handleConfirmInstallmentPayment = (
    recordId: string,
    instId: string,
    paidAmount: number,
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    let paidInst: ExtensionInstallment | undefined;
    let allPaid = false;
    setLocalExtensions((prev) => {
      const list = prev.get(recordId);
      if (!list || list.length === 0) return prev;
      const activeIdx = list.length - 1;
      const updatedInstallments = list[activeIdx].installments.map((i) =>
        i.id === instId
          ? { ...i, status: (paidAmount >= i.amount - 0.000001 ? "paid" : "partial") as PaymentStatus, paidDate, invoice }
          : i
      );
      paidInst = updatedInstallments.find((i) => i.id === instId);
      // Rule 11: đợt gốc chỉ "Đã thanh toán" khi TẤT CẢ gia hạn con đã thanh toán
      allPaid = updatedInstallments.every((i) => i.status === "paid");
      const updatedActive: PaymentExtension = {
        ...list[activeIdx],
        installments: updatedInstallments,
      };
      const newList = [...list];
      newList[activeIdx] = updatedActive;
      return new Map(prev).set(recordId, newList);
    });

    // Ghi audit log cho lần thanh toán gia hạn này
    if (paidInst) {
      const log = buildPaymentAuditLog(recordId, paidAmount, paidDate, invoice, paidInst.label);
      setLocalAuditLogs((prev) => {
        const existing = prev.get(recordId) ?? [];
        return new Map(prev).set(recordId, [...existing, log]);
      });
    }

    // Rule 11: khi mọi gia hạn con đã TT → đợt gốc chuyển "Đã thanh toán" (session-only)
    if (allPaid) {
      setRecordOverrides((prev) => {
        const next = new Map(prev);
        next.set(recordId, { ...(next.get(recordId) ?? {}), status: "paid" });
        return next;
      });
    }
    setConfirmPayTarget(null);
  };

  // Handler for debt adjustment confirmation — appends audit log
  const handleDebtAdjustConfirm = (auditLog: import("@/data/mockDataCongNo").DebtAuditLog) => {
    if (!debtAdjustTarget) return;
    const recordId = debtAdjustTarget.id;
    saveAuditLogToStorage(recordId, auditLog);
    setLocalAuditLogs((prev) => {
      const existing = prev.get(recordId) ?? [];
      return new Map(prev).set(recordId, [...existing, auditLog]);
    });
    setDebtAdjustTarget(null);
  };

  // Handler for original installment payment confirmation
  const handleOriginalPaymentConfirm = (
    paidAmount: number,
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    if (!paymentConfirmTarget) return;
    const target = paymentConfirmTarget;
    const prevPaid = target.paidAmount ?? 0;
    
    // Principal first, then Interest
    const lateInterest = target.lateInterest ?? 0;
    const principalDue = target.remainingAmount ?? target.baseAmount;
    
    const allocatedToPrincipal = Math.min(paidAmount, principalDue);
    const remainingPaidAmount = Math.max(0, paidAmount - allocatedToPrincipal);
    const allocatedToInterest = Math.min(remainingPaidAmount, lateInterest);
    
    const newPaid = prevPaid + allocatedToPrincipal;
    const remainingPrincipal = Math.max(0, principalDue - allocatedToPrincipal);
    const remainingInterest = Math.max(0, lateInterest - allocatedToInterest);
    
    const newStatus: PaymentStatus = (remainingPrincipal === 0 && remainingInterest === 0) ? "paid" : "partial";
    // Số đẩy xuống đợt kế tiếp: dương = còn thiếu, âm = khách trả dư (tạm ứng)
    const overpaid = Math.max(0, paidAmount - (principalDue + lateInterest));
    const shortfall = remainingPrincipal + remainingInterest;
    const carryOut = overpaid > 0.0005 ? -overpaid : (shortfall > 0.0005 ? shortfall : 0);

    setRecordOverrides((prev) => {
      const next = new Map(prev);
      next.set(target.id, {
        status: newStatus,
        paidAmount: newPaid,
        remainingAmount: remainingPrincipal,
        lateInterest: remainingInterest,
        paidDate,
        invoice,
        carryOut,
      });
      return next;
    });
    // Ghi audit log để hiển thị trong "Xem lịch sử công nợ"
    const payLog = buildPaymentAuditLog(target.id, paidAmount, paidDate, invoice, target.label);
    setLocalAuditLogs((prev) => {
      const existing = prev.get(target.id) ?? [];
      return new Map(prev).set(target.id, [...existing, payLog]);
    });
    setPaymentConfirmTarget(null);
  };

  // ── Render installment rows for one extension ──────────────────────────────
  const renderInstRows = (
    ext: PaymentExtension,
    record: PaymentRecord,
    isActive: boolean
  ) => (
    <div className="px-4 py-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Lịch thanh toán · {ext.installments.length} đợt
      </p>
      {ext.installments.map((inst, iIdx) => {
        const daysFromOrig = Math.max(
          0,
          Math.round(
            (new Date(inst.dueDate).getTime() - new Date(record.dueDate).getTime()) /
            86400000
          )
        );
        const instLateFee =
          ext.type === "with-penalty"
            ? calcLateFee(inst.amount, ext.penaltyRatePercent, daysFromOrig)
            : 0;

        return (
          <div key={inst.id} className="space-y-1.5">
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                (inst.status === "overdue" || inst.status === "grace-period" || inst.status === "deposit-forfeited" || inst.status === "partial")
                  ? "border-red-200 bg-red-50/50"
                  : (inst.status === "paid" || inst.status === "overpaid")
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-blue-200 bg-blue-50/20"
              }`}
            >
              <span className="text-[11px] text-muted-foreground w-4 text-center shrink-0">
                {iIdx + 1}
              </span>
              {(inst.status === "paid" || inst.status === "overpaid") ? (
                <BadgeCheck className="size-3.5 text-emerald-500 shrink-0" />
              ) : (inst.status === "overdue" || inst.status === "grace-period" || inst.status === "deposit-forfeited" || inst.status === "partial") ? (
                <div className="flex items-center justify-center rounded-full bg-red-500 shrink-0 size-3.5">
                  <AlertTriangle className="size-2 text-white stroke-[3px]" />
                </div>
              ) : (
                <Circle className="size-3.5 text-blue-400 shrink-0" />
              )}
              <span className="text-xs text-foreground flex-1 truncate">{inst.label}</span>
              <span
                className={`text-xs shrink-0 ${
                  (inst.status === "overdue" || inst.status === "grace-period" || inst.status === "deposit-forfeited" || inst.status === "partial")
                    ? "text-red-600"
                    : (inst.status === "paid" || inst.status === "overpaid")
                      ? "text-emerald-600"
                      : "text-blue-600 font-semibold"
                }`}
              >
                {inst.status === "paid" && inst.paidDate
                  ? fmtDate(inst.paidDate)
                  : fmtDate(inst.dueDate)}
              </span>
              <span className="text-xs text-foreground shrink-0">
                {formatVND(inst.amount)}
              </span>
              {ext.type === "with-penalty" && instLateFee > 0 && inst.status !== "paid" && (
                <span className="text-[11px] text-orange-600 shrink-0">
                  +{formatVND(instLateFee)} phạt
                </span>
              )}
              {inst.status === "paid" && inst.invoice && (
                <div className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 shrink-0">
                  <FileText className="size-2.5 text-red-500" />
                  <span className="text-[10px] text-red-600">PDF</span>
                </div>
              )}
              {renderStatusBadges(inst.status)}
              {isActive && inst.status === "paid" && inst.invoice ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] px-2 gap-1 border-border/60 shrink-0"
                  onClick={() =>
                    setActiveInvoice({
                      invoice: inst.invoice!,
                      record: {
                        id: inst.id,
                        label: inst.label,
                        dueDate: inst.dueDate,
                        paidDate: inst.paidDate,
                        baseAmount: inst.amount,
                        status: "paid",
                        invoice: inst.invoice,
                      },
                    })
                  }
                >
                  <FileText className="size-2.5" />
                  Xem HĐ
                </Button>
              ) : isActive && inst.status !== "paid" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] px-2 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0"
                  onClick={() =>
                    setConfirmPayTarget({ recordId: record.id, installment: inst })
                  }
                >
                  <CheckCircle2 className="size-2.5" />
                  Xác nhận TT
                </Button>
              ) : null}
              {isActive && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Mở menu thao tác cho ${inst.label}`}
                      title="Thao tác khác"
                      className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal aria-hidden="true" className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs w-52">
                    {inst.status !== "paid" && (
                      <DropdownMenuItem
                        className="text-xs gap-2"
                        onSelect={() =>
                          setConfirmPayTarget({ recordId: record.id, installment: inst })
                        }
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Xác nhận thanh toán
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-xs gap-2"
                      onSelect={() => {
                        const syntheticRecord: import("@/data/mockDataCongNo").PaymentRecord = {
                          ...record,
                          id: inst.id,
                          label: inst.label,
                          dueDate: inst.dueDate,
                          paidDate: inst.paidDate,
                          baseAmount: inst.amount,
                          paidAmount: inst.status === "paid" ? inst.amount : 0,
                          remainingAmount: inst.status === "paid" ? 0 : inst.amount,
                          status: inst.status,
                          debtStatus: "current",
                        };
                        setDebtAdjustTarget(syntheticRecord);
                      }}
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      Điều chỉnh công nợ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs gap-2"
                      onSelect={() => {
                        const syntheticRecord: import("@/data/mockDataCongNo").PaymentRecord = {
                          ...record,
                          id: inst.id,
                          label: inst.label,
                          dueDate: inst.dueDate,
                          baseAmount: inst.amount,
                          paidAmount: inst.status === "paid" ? inst.amount : 0,
                          remainingAmount: inst.status === "paid" ? 0 : inst.amount,
                          status: inst.status,
                          debtStatus: "current",
                          auditLogs: localAuditLogs.get(inst.id) ?? [],
                        };
                        setAuditHistoryRecord(syntheticRecord);
                      }}
                    >
                      <History className="size-3.5 text-muted-foreground" />
                      Xem lịch sử công nợ
                      {(localAuditLogs.get(inst.id)?.length ?? 0) === 0 && (
                        <span className="ml-auto text-[10px] text-muted-foreground">Chưa có</span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {inst.status === "paid" && inst.invoice && (
              <div className="ml-7 rounded-lg border border-emerald-200 bg-emerald-50/30 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 border border-red-200 shrink-0">
                    <FileText className="size-3.5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{inst.invoice.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground">
                        #{inst.invoice.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">
                        {inst.invoice.bankName} · {inst.invoice.transactionRef}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Thanh toán: {inst.paidDate ? fmtDate(inst.paidDate) : "—"} ·{" "}
                      {formatVND(inst.amount)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 border-border/60 shrink-0"
                    onClick={() =>
                      setActiveInvoice({
                        invoice: inst.invoice!,
                        record: {
                          id: inst.id,
                          label: inst.label,
                          dueDate: inst.dueDate,
                          paidDate: inst.paidDate,
                          baseAmount: inst.amount,
                          status: "paid",
                          invoice: inst.invoice,
                        },
                      })
                    }
                  >
                    <FileText className="size-3" />
                    Xem
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <span className="text-[11px] text-muted-foreground">Tổng gia hạn</span>
        <span className="text-xs text-foreground">
          {formatVND(ext.installments.reduce((s, i) => s + i.amount, 0))}
          {ext.type === "with-penalty" && (
            <span className="text-orange-600 ml-1.5">
              +{formatVND(
                ext.installments.reduce((s, i) => {
                  const days = Math.max(
                    0,
                    Math.round(
                      (new Date(i.dueDate).getTime() -
                        new Date(record.dueDate).getTime()) /
                      86400000
                    )
                  );
                  return s + calcLateFee(i.amount, ext.penaltyRatePercent, days);
                }, 0)
              )}{" "}
              phạt
            </span>
          )}
        </span>
      </div>
    </div>
  );

  // ── Render one extension card ───────────────────────────────────────────────
  const renderExtCard = (
    ext: PaymentExtension,
    genIdx: number,
    isActive: boolean,
    record: PaymentRecord,
    totalCount: number
  ) => (
    <div
      key={ext.id}
      className={`rounded-xl border overflow-hidden ${isActive ? "border-border/70" : "border-border/40 opacity-75"
        }`}
    >
      <div
        className={`px-4 py-3 flex items-start justify-between gap-3 ${isActive
          ? ext.type === "with-penalty"
            ? "bg-orange-50 border-b border-orange-100"
            : "bg-emerald-50 border-b border-emerald-100"
          : "bg-muted/30 border-b border-border/40"
          }`}
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <CalendarClock
            className={`size-4 mt-0.5 shrink-0 ${isActive
              ? ext.type === "with-penalty"
                ? "text-orange-500"
                : "text-emerald-500"
              : "text-muted-foreground"
              }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-medium ${isActive
                  ? ext.type === "with-penalty"
                    ? "text-orange-700"
                    : "text-emerald-700"
                  : "text-muted-foreground"
                  }`}
              >
                Gia hạn lần {genIdx + 1}
                {totalCount > 1 ? `/${totalCount}` : ""}
              </span>
              {isActive && (
                <Badge className="text-[10px] px-1.5 h-4 border-blue-200 bg-blue-50 text-blue-700">
                  Hiện tại
                </Badge>
              )}
              <Badge
                className={`text-[10px] px-1.5 h-4 ${ext.type === "with-penalty"
                  ? "border-orange-200 bg-orange-100 text-orange-700"
                  : "border-emerald-200 bg-emerald-100 text-emerald-700"
                  }`}
              >
                {ext.type === "with-penalty" ? (
                  <ShieldX className="size-2.5 mr-0.5 inline" />
                ) : (
                  <ShieldCheck className="size-2.5 mr-0.5 inline" />
                )}
                {ext.type === "with-penalty"
                  ? `Có phí ${ext.penaltyRatePercent}%/năm`
                  : "Miễn phí phạt"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="size-3" />
                {ext.approvedBy}
              </span>
              <span className="text-xs text-muted-foreground">
                Duyệt: {fmtDate(ext.approvedDate)}
              </span>
              <span className="text-xs text-muted-foreground">
                YC: {fmtDate(ext.requestDate)}
              </span>
            </div>
          </div>
        </div>
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setExtDialog({ record, editingIdx: genIdx })}
          >
            <Pencil className="size-3" />
            Sửa
          </Button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-border/40 space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lý do gia hạn</p>
        <p className="text-xs text-foreground leading-relaxed">{ext.reason}</p>
        {ext.notes && (
          <p className="text-[11px] text-muted-foreground italic">Ghi chú: {ext.notes}</p>
        )}
      </div>

      {renderInstRows(ext, record, isActive)}
    </div>
  );

  // Áp override (session) lên cấp stage để icon/progress cũng chuyển "đã thanh toán".
  const hasPaidOverride = stage.records.some(
    (r) => {
      const s = recordOverrides.get(r.id)?.status ?? r.status;
      return s === "paid" || s === "overpaid";
    }
  );
  const hasOverdueOrPartial = stage.records.some(
    (r) => {
      const s = recordOverrides.get(r.id)?.status ?? r.status;
      return s === "overdue" || s === "partial" || s === "grace-period";
    }
  );
  const effectiveStageStatus: StageStatus | "overdue" = (hasPaidOverride && stage.records.every(
    (r) => {
      const s = recordOverrides.get(r.id)?.status ?? r.status;
      return s === "paid" || s === "overpaid";
    }
  ))
    ? "completed"
    : (hasOverdueOrPartial || stage.stageStatus === "overdue" ? "overdue" : stage.stageStatus);

  const effectivePaidAmount = stage.records.reduce(
    (s, r) => s + (recordOverrides.get(r.id)?.paidAmount ?? r.paidAmount ?? 0),
    0
  );
  const sl = stageLabelMap[effectiveStageStatus];
  const overdueRecords = stage.records.filter((r) => {
    const s = recordOverrides.get(r.id)?.status ?? r.status;
    return s === "overdue" || s === "partial" || s === "grace-period";
  });
  const progress =
    stage.totalAmount > 0
      ? Math.round((effectivePaidAmount / stage.totalAmount) * 100)
      : 0;

  return (
    <>
      {activeInvoice && (
        <InvoiceDialog
          open={true}
          onClose={() => setActiveInvoice(null)}
          invoice={activeInvoice.invoice}
          record={activeInvoice.record}
          customerName={customerName}
          projectName={projectName}
          unit={unit}
        />
      )}

      {extDialog && (
        <ExtensionDialog
          open={true}
          onClose={() => setExtDialog(null)}
          record={extDialog.record}
          nextInstallmentDueDate={nextStageDueDate}
          existing={
            extDialog.editingIdx !== undefined
              ? getExtList(extDialog.record.id)[extDialog.editingIdx]
              : undefined
          }
          onSave={(ext) =>
            handleSaveExtension(extDialog.record.id, ext, extDialog.editingIdx)
          }
        />
      )}

      {confirmPayTarget && (
        <ExtensionPaymentConfirmDialog
          open={true}
          onClose={() => setConfirmPayTarget(null)}
          installment={confirmPayTarget.installment}
          contractName={projectName}
          onConfirm={(paidAmount, paidDate, invoice) =>
            handleConfirmInstallmentPayment(
              confirmPayTarget.recordId,
              confirmPayTarget.installment.id,
              paidAmount,
              paidDate,
              invoice
            )
          }
        />
      )}

      {paymentConfirmTarget && (
        <PaymentConfirmDialog
          open={true}
          onClose={() => setPaymentConfirmTarget(null)}
          record={paymentConfirmTarget}
          contractName={projectName}
          onConfirm={handleOriginalPaymentConfirm}
        />
      )}

      {debtAdjustTarget && (
        <DebtAdjustmentDialog
          open={true}
          onClose={() => setDebtAdjustTarget(null)}
          record={debtAdjustTarget}
          contractName={projectName}
          onConfirm={handleDebtAdjustConfirm}
        />
      )}

      {reminderTarget && (
        <PaymentReminderDialog
          open={true}
          onOpenChange={(v: boolean) => !v && setReminderTarget(null)}
          customerId={customerId}
          contractId={contractId}
          paymentId={reminderTarget.id}
          customerName={customerName}
          contractLabel={`${projectName}${unit ? ` · ${unit}` : ""}`}
          installmentLabel={reminderTarget.label}
          amountLabel={formatVND(reminderTarget.remainingAmount ?? reminderTarget.baseAmount)}
          dueDateLabel={fmtDate(reminderTarget.dueDate)}
        />
      )}

      {auditHistoryRecord && (
        <Dialog open={true} onOpenChange={(v) => !v && setAuditHistoryRecord(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <DialogTitle className="text-sm">
                  Lịch sử công nợ · {auditHistoryRecord.label}
                </DialogTitle>
              </div>
              <DialogDescription className="sr-only">
                Lịch sử điều chỉnh công nợ cho đợt thanh toán này
              </DialogDescription>
            </DialogHeader>
            <AuditHistorySection auditLogs={localAuditLogs.get(auditHistoryRecord.id) ?? []} />
          </DialogContent>
        </Dialog>
      )}

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <StageIcon status={effectiveStageStatus} number={stage.stageNumber} />
          {!isLast && (
            <div
              className={`w-px flex-1 mt-2 min-h-6 ${effectiveStageStatus === "completed"
                ? "bg-emerald-200"
                : effectiveStageStatus === "overdue"
                  ? "bg-red-200"
                  : effectiveStageStatus === "in-progress"
                    ? "bg-blue-200"
                    : "bg-border"
                }`}
            />
          )}
        </div>

        <div className="flex-1 pb-8">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm text-foreground">
                  Đợt {stage.stageNumber}: {stage.name}
                </h3>
                <span className={`text-xs ${sl.cls}`}>{sl.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stage.description} · {stage.period}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-foreground">{formatVND(stage.totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Đã thu: {formatVND(stage.paidAmount)}</p>
            </div>
          </div>

          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tiến độ đợt</span>
              <span>{progress}%</span>
            </div>
            <Progress
              value={progress}
              className={`h-1 ${effectiveStageStatus === "completed"
                ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                : effectiveStageStatus === "overdue"
                  ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                  : effectiveStageStatus === "in-progress"
                    ? "bg-blue-100 [&>[data-slot=progress-indicator]]:bg-blue-500"
                    : "bg-muted [&>[data-slot=progress-indicator]]:bg-muted-foreground"
                }`}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
            <Accordion
              type="multiple"
              defaultValue={
                overdueRecords.length > 0 ? overdueRecords.map((r) => r.id) : []
              }
            >
              {stage.records.map((rawRecord, idx) => {
                // Merge session override (nếu vừa ghi nhận thanh toán) — không đụng data gốc.
                const override = recordOverrides.get(rawRecord.id);
                const record = override ? { ...rawRecord, ...override } : rawRecord;
                const customerObj = customers.find((c) => c.id === customerId);
                const contractObj = customerObj?.contracts.find((c) => c.id === contractId);
                const allRecords = contractObj?.stages?.flatMap((s) => s.records) ?? [];
                const currentIdx = allRecords.findIndex((r) => r.id === record.id);
                const prevRecord = currentIdx > 0 ? allRecords[currentIdx - 1] : undefined;

                const prevDaysOverdue = prevRecord?.daysOverdue ?? prevRecord?.daysAfterDue ?? 0;
                const prevLateFee = prevRecord?.lateFee ?? prevRecord?.lateInterest ?? 0;
                const prevTotalDue = (carryForwardIn > 0 ? carryForwardIn : 0) + prevLateFee;

                const extList = getExtList(record.id);
                const activeExt = extList.length > 0 ? extList[extList.length - 1] : undefined;
                const historyExts = extList.slice(0, -1);
                const canAddExtension =
                  record.status === "overdue" || record.status === "upcoming" || record.status === "partial";
                const isHistOpen = historyOpen.has(record.id);

                return (
                  <AccordionItem
                    key={record.id}
                    value={record.id}
                    className={`border-l-4 transition-all duration-200 bg-transparent ${
                      (record.status === "overdue" || record.status === "grace-period" || record.status === "deposit-forfeited" || record.status === "partial")
                        ? "border-l-red-500 data-[state=open]:bg-red-50/10"
                        : (record.status === "paid" || record.status === "overpaid")
                          ? "border-l-emerald-500 data-[state=open]:bg-emerald-50/5"
                          : "border-l-blue-500 data-[state=open]:bg-blue-50/5"
                    } ${idx === 0 ? "border-t-0" : ""}`}
                  >
                    <AccordionTrigger className="group px-4 py-3 hover:no-underline hover:bg-slate-50/60 text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                        <div className="group-data-[state=open]:hidden flex items-center gap-2">
                          {(record.status === "paid" || record.status === "overpaid") ? (
                            <BadgeCheck className="size-4 text-emerald-500 shrink-0" />
                          ) : (record.status === "overdue" || record.status === "grace-period" || record.status === "deposit-forfeited" || record.status === "partial") ? (
                            <div className="flex items-center justify-center rounded-full bg-red-500 shrink-0 size-4">
                              <AlertTriangle className="size-2.5 text-white stroke-[3px]" />
                            </div>
                          ) : (
                            <Circle className="size-4 text-blue-400 shrink-0" />
                          )}
                          <span
                            className={`text-sm truncate ${(record.status === "overdue" || record.status === "grace-period" || record.status === "deposit-forfeited" || record.status === "partial") ? "text-red-700 font-semibold" : "text-foreground"
                              }`}
                          >
                            {record.label}
                          </span>
                        </div>
                        <span className="hidden group-data-[state=open]:inline text-sm font-medium text-foreground">
                          Trạng thái
                        </span>

                        {record.status === "paid" && record.invoice && (
                          <div className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 shrink-0">
                            <FileText className="size-2.5 text-red-500" />
                            <span className="text-[10px] text-red-600">PDF</span>
                          </div>
                        )}

                        {extList.length > 0 && (
                          <div
                            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 shrink-0 ${activeExt?.type === "with-penalty"
                              ? "border-orange-200 bg-orange-50"
                              : "border-emerald-200 bg-emerald-50"
                              }`}
                          >
                            <CalendarClock
                              className={`size-2.5 ${activeExt?.type === "with-penalty"
                                ? "text-orange-500"
                                : "text-emerald-500"
                                }`}
                            />
                            <span
                              className={`text-[10px] ${activeExt?.type === "with-penalty"
                                ? "text-orange-600"
                                : "text-emerald-600"
                                }`}
                            >
                              {extList.length > 1 ? `GH ${extList.length} lần` : "Đã gia hạn"}
                            </span>
                          </div>
                        )}

                        {renderStatusBadges(record.status)}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="pl-7 space-y-3">
                        {/* Quick actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Rule 10: đợt có gia hạn con thì thanh toán qua từng gia hạn, không xác nhận trực tiếp trên đợt gốc */}
                          {record.status !== "paid" && record.status !== "overpaid" && record.status !== "deposit-forfeited" && extList.length === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setPaymentConfirmTarget(normalizePaymentRecord(record))}
                            >
                              <BadgeCheck className="size-3" />
                              Xác nhận thanh toán
                            </Button>
                          )}
                          {record.status !== "paid" && record.status !== "overpaid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => setReminderTarget(normalizePaymentRecord(record))}
                            >
                              <Bell className="size-3" />
                              Nhắc khách
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label={`Mở menu thao tác cho ${record.label}`}
                                title="Thao tác khác"
                                className="size-9 border-border/60 text-muted-foreground hover:text-foreground"
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <MoreHorizontal aria-hidden="true" className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="text-xs w-52">
                              <DropdownMenuItem
                                className="text-xs gap-2"
                                onSelect={() => setDebtAdjustTarget(normalizePaymentRecord(record))}
                              >
                                <Pencil className="size-3.5 text-muted-foreground" />
                                Điều chỉnh công nợ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2"
                                onSelect={() => setAuditHistoryRecord(record)}
                              >
                                <History className="size-3.5 text-muted-foreground" />
                                Xem lịch sử công nợ
                                {(localAuditLogs.get(record.id)?.length ?? 0) === 0 && (
                                  <span className="ml-auto text-[10px] text-muted-foreground">Chưa có</span>
                                )}
                              </DropdownMenuItem>
                              {(record.status === "overdue" ||
                                record.status === "grace-period" ||
                                record.status === "partial" ||
                                record.adjustedLateInterest != null) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-xs gap-2"
                                      onSelect={() =>
                                        onNavigate(
                                          `/customer/${customerId}/contract/${contractId}/stage/${stage.id}/payment/${record.id}`
                                        )
                                      }
                                    >
                                      <FileText className="size-3.5 text-muted-foreground" />
                                      Xem chi tiết tính lãi
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Banner CHỈ khi khách trả dư ở đợt trước → giảm trừ vào đợt này */}
                        {carryForwardIn < 0 && (
                          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 mb-3">
                            <span className="text-sm font-medium text-blue-700">
                              Giảm trừ từ đợt trước:
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-blue-700">
                              - {formatVND(-carryForwardIn)}
                            </span>
                          </div>
                        )}

                        {/* Payment details grid (Left and Right Columns) */}
                        <div className="grid grid-cols-2 gap-x-8 border-t border-border/40 pt-4 mt-1">
                          {/* Cột bên trái: Đợt Hiện tại */}
                          <div className="space-y-3.5">
                            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border/30 pb-1 mb-2">Đợt Hiện tại</h4>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Ngày đến hạn</p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5">{fmtDate(record.dueDate)}</p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Số tiền phải thanh toán</p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5">{formatVND(record.baseAmount)}</p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tổng đã thu</p>
                              <p className="text-sm font-medium text-emerald-600 mt-0.5">{formatVND(record.paidAmount)}</p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">% khách hàng thanh toán</p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5">
                                {record.baseAmount > 0
                                  ? `${Math.round((record.paidAmount / record.baseAmount) * 100)}%`
                                  : "0%"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Số ngày chậm nộp</p>
                              <p className={`text-sm font-medium mt-0.5 ${(record.daysOverdue ?? 0) > 0 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {record.daysOverdue ?? 0} ngày
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lãi chậm nộp</p>
                              <p className={`text-sm font-medium mt-0.5 ${(record.lateFee ?? 0) > 0 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {formatVND(record.lateFee ?? 0)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tổng phải thu (chưa gồm lãi)</p>
                              <p className={`text-sm font-medium mt-0.5 ${record.remainingAmount > 0 ? "text-orange-600 font-semibold" : "text-slate-500"}`}>
                                {formatVND(record.remainingAmount)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tổng phải thu (gồm lãi)</p>
                              <p className={`text-sm font-medium mt-0.5 ${(record.remainingAmount + (record.lateFee ?? 0)) > 0 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {formatVND(record.remainingAmount + (record.lateFee ?? 0))}
                              </p>
                            </div>
                          </div>

                          {/* Cột bên phải: Dư nợ đợt trước chuyển sang */}
                          <div className="space-y-3.5 border-l border-border/40 pl-8">
                            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-border/30 pb-1 mb-2">Nợ cũ đợt trước mang sang</h4>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Ngày thanh toán</p>
                              <p className={`text-sm font-medium mt-0.5 ${record.paidDate ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                                {record.paidDate ? fmtDate(record.paidDate) : "—"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Dư nợ đợt trước</p>
                              <p className={`text-sm font-medium mt-0.5 ${carryForwardIn > 0 ? "text-orange-600 font-semibold" : "text-slate-500"}`}>
                                {formatVND(carryForwardIn > 0 ? carryForwardIn : 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Số ngày chậm nộp (đợt trước)</p>
                              <p className={`text-sm font-medium mt-0.5 ${prevDaysOverdue > 0 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {prevDaysOverdue} ngày
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lãi chậm nộp (đợt trước)</p>
                              <p className={`text-sm font-medium mt-0.5 ${prevLateFee > 0 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {formatVND(prevLateFee)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tổng phải thu nợ đợt trước (gồm lãi)</p>
                              <p className={`text-sm font-medium mt-0.5 ${prevTotalDue > 0 ? "text-red-700 font-semibold" : "text-slate-500"}`}>
                                {formatVND(prevTotalDue)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tổng kết dòng tiền cuối của đợt */}
                        {record.status !== "paid" && record.status !== "overpaid" && (
                          <div className="rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3 mt-4">
                            <p className="text-xs text-slate-700 flex items-center justify-between">
                              <span className="font-semibold text-slate-800">TỔNG CỘNG PHẢI THANH TOÁN ĐỢT NÀY:</span>{" "}
                              <span className="text-sm font-bold text-red-600">
                                {formatVND(Math.max(0, record.remainingAmount + (record.lateFee ?? 0) + carryForwardIn))}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              (Bao gồm: Gốc đợt này còn lại + Lãi phạt đợt này + Dư nợ cũ đợt trước mang sang)
                            </p>
                          </div>
                        )}

                        {record.status === "paid" && record.invoice && (
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                              Hoá đơn đính kèm
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 border border-red-200 shrink-0">
                                <FileText className="size-4 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground truncate">
                                  {record.invoice.fileName}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  PDF · {record.invoice.fileSize} · Phát hành{" "}
                                  {fmtDate(record.invoice.uploadDate)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  #{record.invoice.invoiceNumber}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1.5 border-border/60"
                                  onClick={() =>
                                    setActiveInvoice({ invoice: record.invoice!, record })
                                  }
                                >
                                  <FileText className="size-3" />
                                  Xem
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Download className="size-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Extension history (collapsible) */}
                        {historyExts.length > 0 && (
                          <div>
                            <button
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                              onClick={() => toggleHistory(record.id)}
                            >
                              <History className="size-3.5" />
                              {historyExts.length} lần gia hạn trước
                              <ChevronDown
                                className={`size-3.5 transition-transform ${isHistOpen ? "rotate-180" : ""
                                  }`}
                              />
                            </button>
                            {isHistOpen && (
                              <div className="space-y-2 mt-2 pl-2 border-l-2 border-border/30 ml-1">
                                {historyExts.map((hExt, hIdx) =>
                                  renderExtCard(hExt, hIdx, false, record, extList.length)
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Active extension card */}
                        {activeExt &&
                          renderExtCard(
                            activeExt,
                            extList.length - 1,
                            true,
                            record,
                            extList.length
                          )}

                        {/* Add new extension button — always available while record is active */}
                        {canAddExtension && (
                          <div className="pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                              onClick={() =>
                                setExtDialog({ record, editingIdx: undefined })
                              }
                            >
                              <Plus className="size-3" />
                              {extList.length === 0
                                ? "Thêm gia hạn"
                                : `Gia hạn lần ${extList.length + 1}`}
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  valueClass,
}: {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
  valueClass?: string;
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${iconClass ?? "bg-slate-100"}`}>
            <Icon className="size-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl mt-0.5 ${valueClass ?? "text-foreground"}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useMemo } from "react";

function renderStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          Đã thanh toán
        </span>
      );
    case "overpaid":
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/50">
            Thanh toán dư
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            Đã thanh toán
          </span>
        </div>
      );
    case "overdue":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
          Quá hạn
        </span>
      );
    case "grace-period":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
          Trong thời gian ân hạn
        </span>
      );
    case "deposit-forfeited":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
          Mất cọc
        </span>
      );
    case "partial":
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/50">
            Thanh toán một phần
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
            Quá hạn
          </span>
        </div>
      );
    case "extended":
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/50">
            Đã gia hạn
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
            Sắp đến hạn
          </span>
        </div>
      );
    case "not-due":
    case "upcoming":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
          Sắp đến hạn
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
          Sắp đến hạn
        </span>
      );
  }
}

const paymentDetailTableHeadClass = "border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-[10px] leading-4 text-slate-600";
const paymentDetailTableCellClass = "border-b border-r border-[#E5EAF3] px-3 py-2.5 text-slate-600";

function PaymentTable({
  paymentInstallments,
  customer,
  contract,
  customerId,
  contractId,
  onNavigate,
}: {
  paymentInstallments: PaymentStage[];
  customer: any;
  contract: any;
  customerId: string;
  contractId: string;
  onNavigate: (path: string) => void;
}) {
  const [activeInvoice, setActiveInvoice] = useState<{
    invoice: InvoiceFile;
    record: PaymentRecord;
  } | null>(null);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [localExtensions, setLocalExtensions] = useState<Map<string, PaymentExtension[]>>(() => {
    const m = new Map<string, PaymentExtension[]>();
    paymentInstallments.forEach((stage) => {
      stage.records.forEach((r) => {
        if (r.extensions && r.extensions.length > 0) m.set(r.id, r.extensions);
      });
    });
    return m;
  });

  const [extDialog, setExtDialog] = useState<{
    record: PaymentRecord;
    editingIdx?: number;
  } | null>(null);

  const [confirmPayTarget, setConfirmPayTarget] = useState<{
    recordId: string;
    installment: ExtensionInstallment;
  } | null>(null);

  const [paymentConfirmTarget, setPaymentConfirmTarget] = useState<PaymentRecord | null>(null);
  const [debtAdjustTarget, setDebtAdjustTarget] = useState<PaymentRecord | null>(null);
  const [auditHistoryRecord, setAuditHistoryRecord] = useState<PaymentRecord | null>(null);
  const [reminderTarget, setReminderTarget] = useState<PaymentRecord | null>(null);

  // Session-only override (không lưu localStorage → reload về demo ban đầu)
  const [recordOverrides, setRecordOverrides] = useState<Map<string, Partial<PaymentRecord>>>(new Map());

  const [localAuditLogs, setLocalAuditLogs] = useState<Map<string, any[]>>(() => {
    const m = new Map<string, any[]>();
    paymentInstallments.forEach((stage) => {
      stage.records.forEach((r) => {
        const initial = r.auditLogs || [];
        m.set(r.id, getAuditLogsFromStorage(r.id, initial));
      });
    });
    return m;
  });

  const getExtList = (recordId: string): PaymentExtension[] =>
    localExtensions.get(recordId) ?? [];

  const handleSaveExtension = (
    recordId: string,
    ext: PaymentExtension,
    editingIdx?: number
  ) => {
    setLocalExtensions((prev) => {
      const list = [...(prev.get(recordId) ?? [])];
      if (editingIdx !== undefined) {
        list[editingIdx] = ext;
      } else {
        list.push(ext);
      }
      return new Map(prev).set(recordId, list);
    });
    setExtDialog(null);
  };

  const handleConfirmInstallmentPayment = (
    recordId: string,
    instId: string,
    paidAmount: number,
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    let paidInst: ExtensionInstallment | undefined;
    let allPaid = false;
    setLocalExtensions((prev) => {
      const list = prev.get(recordId);
      if (!list || list.length === 0) return prev;
      const activeIdx = list.length - 1;
      const updatedInstallments = list[activeIdx].installments.map((i) =>
        i.id === instId
          ? { ...i, status: (paidAmount >= i.amount - 0.000001 ? "paid" : "partial") as PaymentStatus, paidDate, invoice }
          : i
      );
      paidInst = updatedInstallments.find((i) => i.id === instId);
      // Rule 11: đợt gốc chỉ "Đã thanh toán" khi TẤT CẢ gia hạn con đã thanh toán
      allPaid = updatedInstallments.every((i) => i.status === "paid");
      const updatedActive: PaymentExtension = {
        ...list[activeIdx],
        installments: updatedInstallments,
      };
      const newList = [...list];
      newList[activeIdx] = updatedActive;
      return new Map(prev).set(recordId, newList);
    });

    // Ghi audit log cho lần thanh toán gia hạn này
    if (paidInst) {
      const log = buildPaymentAuditLog(recordId, paidAmount, paidDate, invoice, paidInst.label);
      setLocalAuditLogs((prev) => {
        const existing = prev.get(recordId) ?? [];
        return new Map(prev).set(recordId, [...existing, log]);
      });
    }

    // Rule 11: khi mọi gia hạn con đã TT → đợt gốc chuyển "Đã thanh toán" (session-only)
    if (allPaid) {
      setRecordOverrides((prev) => {
        const next = new Map(prev);
        next.set(recordId, { ...(next.get(recordId) ?? {}), status: "paid" });
        return next;
      });
    }
    setConfirmPayTarget(null);
  };

  const handleDebtAdjustConfirm = (auditLog: any) => {
    if (!debtAdjustTarget) return;
    const recordId = debtAdjustTarget.id;
    saveAuditLogToStorage(recordId, auditLog);
    setLocalAuditLogs((prev) => {
      const existing = prev.get(recordId) ?? [];
      return new Map(prev).set(recordId, [...existing, auditLog]);
    });
    setDebtAdjustTarget(null);
  };

  const handleOriginalPaymentConfirm = (
    paidAmount: number,
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    if (!paymentConfirmTarget) return;
    const target = paymentConfirmTarget;
    const prevPaid = target.paidAmount ?? 0;
    
    // Principal first, then Interest
    const lateInterest = target.lateInterest ?? 0;
    const principalDue = target.remainingAmount ?? target.baseAmount;
    
    const allocatedToPrincipal = Math.min(paidAmount, principalDue);
    const remainingPaidAmount = Math.max(0, paidAmount - allocatedToPrincipal);
    const allocatedToInterest = Math.min(remainingPaidAmount, lateInterest);
    
    const newPaid = prevPaid + allocatedToPrincipal;
    const remainingPrincipal = Math.max(0, principalDue - allocatedToPrincipal);
    const remainingInterest = Math.max(0, lateInterest - allocatedToInterest);
    
    const newStatus: PaymentStatus = (remainingPrincipal === 0 && remainingInterest === 0) ? "paid" : "partial";
    // Số đẩy xuống đợt kế tiếp: dương = còn thiếu, âm = khách trả dư (tạm ứng)
    const overpaid = Math.max(0, paidAmount - (principalDue + lateInterest));
    const shortfall = remainingPrincipal + remainingInterest;
    const carryOut = overpaid > 0.0005 ? -overpaid : (shortfall > 0.0005 ? shortfall : 0);

    setRecordOverrides((prev) => {
      const next = new Map(prev);
      next.set(target.id, {
        status: newStatus,
        paidAmount: newPaid,
        remainingAmount: remainingPrincipal,
        lateInterest: remainingInterest,
        paidDate,
        invoice,
        carryOut,
      });
      return next;
    });
    // Ghi audit log để hiển thị trong "Xem lịch sử công nợ"
    const payLog = buildPaymentAuditLog(target.id, paidAmount, paidDate, invoice, target.label);
    setLocalAuditLogs((prev) => {
      const existing = prev.get(target.id) ?? [];
      return new Map(prev).set(target.id, [...existing, payLog]);
    });
    setPaymentConfirmTarget(null);
  };

  const allRows = useMemo(() => {
    return paymentInstallments.flatMap((stage) =>
      stage.records.map((rawRecord) => ({
        stage,
        record: recordOverrides.has(rawRecord.id)
          ? { ...rawRecord, ...recordOverrides.get(rawRecord.id) }
          : rawRecord,
      }))
    );
  }, [paymentInstallments, recordOverrides]);

  const depositDate = paymentInstallments[0]?.records[0]?.paidDate || paymentInstallments[0]?.records[0]?.dueDate || "";
  const signingDate = paymentInstallments[0]?.records?.[1]?.paidDate || paymentInstallments[0]?.records?.[1]?.dueDate || "";

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-2sm font-medium text-slate-950">Lộ trình thanh toán (Dạng bảng)</h3>
          <p className="mt-1 text-[11px] text-slate-500">Chi tiết lộ trình dòng tiền công nợ và các đợt thanh toán của căn hộ.</p>
        </div>
        <p className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/50">
          {paymentInstallments.filter((s) => s.stageStatus === "completed").length} /{" "}
          {paymentInstallments.length} đợt hoàn thành
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[2200px] border-separate border-spacing-0 text-[11px] whitespace-nowrap">
          <thead className="text-slate-600">
            <tr>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} w-10 text-center align-middle`} style={{ fontWeight: 650 }}>STT</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} min-w-[210px] text-left align-middle`} style={{ fontWeight: 650 }}>Đợt thanh toán</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Ngày cọc</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-right align-middle`} style={{ fontWeight: 650 }}>Số tiền cọc</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-right align-middle`} style={{ fontWeight: 650 }}>Tiền cọc lòng chuyển sang cọc</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-right align-middle`} style={{ fontWeight: 650 }}>Tiền bổ sung cọc mới</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Ngày ký HĐ</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} w-14 text-center align-middle`} style={{ fontWeight: 650 }}>% TT</th>
              
              {/* Nhóm Đợt Hiện Tại */}
              <th colSpan={7} className="border-b border-r border-[#DDE5F0] bg-[#EFF3F9] px-3 py-1.5 text-center text-[10px] font-bold text-slate-800 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                Đợt thanh toán hiện tại
              </th>

              {/* Nhóm Nợ Cũ Đợt Trước Mang Sang */}
              <th colSpan={5} className="border-b border-r border-[#DDE5F0] bg-[#FDF4E9] px-3 py-1.5 text-center text-[10px] font-bold text-orange-900 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                Nợ cũ đợt trước mang sang
              </th>

              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Ngày gia hạn</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Ngày thanh toán gia hạn</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Tỷ lệ khách hàng thanh toán</th>
              <th rowSpan={2} className={`${paymentDetailTableHeadClass} text-center align-middle`} style={{ fontWeight: 650 }}>Trạng thái TT</th>
              <th rowSpan={2} className="border-b border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-center text-[10px] leading-4 text-slate-600 w-14 align-middle" style={{ fontWeight: 650 }}>Hành động</th>
            </tr>
            <tr>
              {/* Cột con của Đợt Hiện Tại */}
              <th className={`${paymentDetailTableHeadClass} text-right`} style={{ fontWeight: 650 }}>Số tiền</th>
              <th className={`${paymentDetailTableHeadClass} text-center`} style={{ fontWeight: 650 }}>Ngày đến hạn</th>
              <th className={`${paymentDetailTableHeadClass} text-right`} style={{ fontWeight: 650 }}>Tổng đã thu</th>
              <th className={`${paymentDetailTableHeadClass} text-center`} style={{ fontWeight: 650 }}>Dư báo quá hạn</th>
              <th className={`${paymentDetailTableHeadClass} text-right text-red-600`} style={{ fontWeight: 650 }}>Lãi chậm nộp</th>
              <th className={`${paymentDetailTableHeadClass} text-right`} style={{ fontWeight: 650 }}>Tổng phải thu (chưa lãi)</th>
              <th className={`${paymentDetailTableHeadClass} text-right font-semibold text-red-700`} style={{ fontWeight: 650 }}>Tổng phải thu (gồm lãi)</th>

              {/* Cột con của Nợ Cũ */}
              <th className={`${paymentDetailTableHeadClass} text-center`} style={{ fontWeight: 650 }}>Ngày thanh toán</th>
              <th className={`${paymentDetailTableHeadClass} text-right`} style={{ fontWeight: 650 }}>Dư nợ đợt trước</th>
              <th className={`${paymentDetailTableHeadClass} text-center`} style={{ fontWeight: 650 }}>Số ngày trễ</th>
              <th className={`${paymentDetailTableHeadClass} text-right text-red-600`} style={{ fontWeight: 650 }}>Lãi chậm nộp</th>
              <th className={`${paymentDetailTableHeadClass} text-right font-semibold text-red-700`} style={{ fontWeight: 650 }}>Tổng nợ cũ (gồm lãi)</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {allRows.map(({ stage, record }, index) => {
              const pctTT = Math.round((record.baseAmount / contract.contractValue) * 100);
              const overdueDays = record.status === "overdue" ? (record.daysOverdue || record.daysAfterDue || 0) : 0;
              const hasExtensions = getExtList(record.id).length > 0;
              const activeExt = hasExtensions ? getExtList(record.id)[getExtList(record.id).length - 1] : null;
              
              const isFullyPaid = record.status === "paid" || record.status === "overpaid";
              const percentPaid = isFullyPaid ? "100%" : record.status === "partial" ? "50%" : "—";

              // Rule 3/4: dư thiếu đợt trước chuyển sang đợt này
              const prevRow = allRows[index - 1]?.record;
              const prevOv = prevRow ? recordOverrides.get(prevRow.id) : undefined;
              const carryForwardIn = !prevRow
                ? 0
                : (prevOv && typeof prevOv.carryOut === "number")
                  ? prevOv.carryOut
                  : (prevRow.status === "overdue" || prevRow.status === "partial")
                    ? (prevRow.remainingAmount ?? Math.max(0, prevRow.baseAmount - (prevRow.paidAmount ?? 0)))
                    : prevRow.status === "overpaid"
                      ? -Math.max(0, (prevRow.paidAmount ?? 0) - (prevRow.baseAmount + (prevRow.lateInterest ?? 0)))
                      : 0;

              const prevDaysOverdue = prevRow?.daysOverdue ?? prevRow?.daysAfterDue ?? 0;
              const prevLateFee = prevRow?.lateFee ?? prevRow?.lateInterest ?? 0;
              const prevTotalDue = (carryForwardIn > 0 ? carryForwardIn : 0) + prevLateFee;

              return (
                <Fragment key={record.id}>
                  <tr className="transition-colors hover:bg-[#F8FAFC]">
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-400`} style={{ fontWeight: 600 }}>{index + 1}</td>
                    <td className={`${paymentDetailTableCellClass} text-slate-900`} style={{ fontWeight: 600 }}>{record.label}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{index === 0 ? (depositDate ? fmtDate(depositDate) : "—") : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums`}>{index === 0 ? formatVND(record.baseAmount) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums`}>{index === 0 ? formatVND(record.paidAmount) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right text-slate-400`}>0 ₫</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{signingDate ? fmtDate(signingDate) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-700`} style={{ fontWeight: 600 }}>{pctTT}%</td>
                    
                    {/* Cột con của Đợt Hiện Tại */}
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums text-slate-900`} style={{ fontWeight: 600 }}>{formatVND(record.baseAmount)}</td>
                    <td className={`${paymentDetailTableCellClass} text-center`}>{fmtDate(record.dueDate)}</td>
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums`}>{formatVND(record.paidAmount)}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-600`}>{overdueDays > 0 ? `${overdueDays} ngày` : "0 ngày"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right text-red-600 font-medium tabular-nums`}>{formatVND(record.lateFee ?? 0)}</td>
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums text-slate-900`} style={{ fontWeight: 600 }}>{formatVND(record.remainingAmount)}</td>
                    <td className={`${paymentDetailTableCellClass} text-right font-semibold text-red-700 tabular-nums`}>{formatVND((record.status === "paid" || record.status === "overpaid") ? 0 : Math.max(0, record.remainingAmount + (record.lateFee ?? 0)))}</td>

                    {/* Cột con của Nợ Cũ */}
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{record.paidDate ? fmtDate(record.paidDate) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right tabular-nums ${carryForwardIn > 0 ? "text-orange-600 font-semibold" : "text-slate-500"}`}>{formatVND(carryForwardIn > 0 ? carryForwardIn : 0)}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{prevDaysOverdue > 0 ? `${prevDaysOverdue} ngày` : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right text-slate-500 tabular-nums`}>{prevLateFee > 0 ? formatVND(prevLateFee) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-right font-semibold text-red-700 tabular-nums`}>{prevTotalDue > 0 ? formatVND(prevTotalDue) : "—"}</td>

                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{activeExt ? fmtDate(activeExt.newDueDate) : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-500`}>{activeExt && activeExt.installments.some(i => i.status === "paid") ? fmtDate(activeExt.installments.find(i => i.status === "paid")?.paidDate || "") : "—"}</td>
                    <td className={`${paymentDetailTableCellClass} text-center text-slate-700`} style={{ fontWeight: 600 }}>{percentPaid}</td>
                    <td className={`${paymentDetailTableCellClass} text-center`}>{renderStatusBadge(record.status)}</td>
                    <td className="border-b border-[#E5EAF3] px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Rule 10: đợt có gia hạn con thì thanh toán qua từng gia hạn, không xác nhận trực tiếp */}
                        {!isFullyPaid && !hasExtensions && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0"
                            onClick={() => setPaymentConfirmTarget(record)}
                            title="Xác nhận thanh toán"
                          >
                            <BadgeCheck className="size-4" />
                          </Button>
                        )}
                        {!isFullyPaid && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md text-amber-600 hover:text-amber-700 hover:bg-amber-50 shrink-0"
                            onClick={() => setReminderTarget(normalizePaymentRecord(record))}
                            title="Nhắc khách"
                          >
                            <Bell className="size-4" />
                          </Button>
                        )}
                        {hasExtensions && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 shrink-0 ${
                              expandedRows.has(record.id) ? "bg-purple-50" : ""
                            }`}
                            onClick={() => {
                              const next = new Set(expandedRows);
                              if (next.has(record.id)) next.delete(record.id);
                              else next.add(record.id);
                              setExpandedRows(next);
                            }}
                            title={expandedRows.has(record.id) ? "Thu gọn gia hạn" : "Xem chi tiết gia hạn"}
                          >
                            {expandedRows.has(record.id) ? (
                              <MinusCircle className="size-4 text-purple-600" />
                            ) : (
                              <PlusCircle className="size-4 text-purple-600" />
                            )}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 shrink-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs w-52">
                            <DropdownMenuItem
                              className="text-xs gap-2"
                              onSelect={() => setDebtAdjustTarget(normalizePaymentRecord(record))}
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                              Điều chỉnh công nợ
                            </DropdownMenuItem>
                            
                            {(record.status === "overdue" || record.status === "upcoming") && (
                              <DropdownMenuItem
                                className="text-xs gap-2"
                                onSelect={() => setExtDialog({ record, editingIdx: undefined })}
                              >
                                <Plus className="size-3.5 text-muted-foreground" />
                                {getExtList(record.id).length === 0
                                  ? "Gia hạn thanh toán"
                                  : `Gia hạn lần ${getExtList(record.id).length + 1}`}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              className="text-xs gap-2"
                              onSelect={() => setAuditHistoryRecord(record)}
                            >
                              <History className="size-3.5 text-muted-foreground" />
                              Xem lịch sử công nợ
                              {(localAuditLogs.get(record.id)?.length ?? 0) === 0 && (
                                <span className="ml-auto text-[10px] text-muted-foreground">Chưa có</span>
                              )}
                            </DropdownMenuItem>
                            {(record.status === "overdue" ||
                              record.status === "grace-period" ||
                              record.status === "partial" ||
                              record.adjustedLateInterest != null) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-xs gap-2"
                                    onSelect={() =>
                                      onNavigate(
                                        `/customer/${customerId}/contract/${contractId}/stage/${stage.id}/payment/${record.id}`
                                      )
                                    }
                                  >
                                    <FileText className="size-3.5 text-muted-foreground" />
                                    Xem chi tiết tính lãi
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>

                  {/* Sub-table for Extensions */}
                  {hasExtensions && expandedRows.has(record.id) && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={25} className="px-12 py-3.5 border-b border-[#E5EAF3]">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm w-full">
                          <div className="flex items-center gap-2 mb-3">
                            <History className="size-4 text-purple-600" />
                            <h4 className="text-xs font-semibold text-slate-800">
                              Lịch sử gia hạn & các đợt thanh toán con của đợt này
                            </h4>
                          </div>
                          
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                                <th className="py-2 px-3 font-semibold">STT</th>
                                <th className="py-2 px-3 font-semibold">Đợt gia hạn</th>
                                <th className="py-2 px-3 font-semibold">Ngày đến hạn mới</th>
                                <th className="py-2 px-3 font-semibold text-right">Số tiền gốc</th>
                                <th className="py-2 px-3 font-semibold text-right">Phí phạt trễ hạn</th>
                                <th className="py-2 px-3 font-semibold">Loại gia hạn</th>
                                <th className="py-2 px-3 font-semibold">Người duyệt</th>
                                <th className="py-2 px-3 font-semibold text-center">Trạng thái</th>
                                <th className="py-2 px-3 font-semibold text-center">Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getExtList(record.id).flatMap((ext, extIdx) => {
                                const isLatestExt = extIdx === getExtList(record.id).length - 1;
                                return ext.installments.map((inst, instIdx) => {
                                  const instLateFee = ext.type === "with-penalty" ? calcLateFee(inst.amount, ext.penaltyRatePercent, inst.dueDate) : 0;
                                  const isPaid = inst.status === "paid" || inst.status === "overpaid";
                                  return (
                                    <tr key={inst.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                                      <td className="py-2 px-3 text-slate-400">{instIdx + 1}</td>
                                      <td className="py-2 px-3 font-medium text-slate-700">{inst.label} (Gia hạn lần {extIdx + 1})</td>
                                      <td className="py-2 px-3 text-slate-600">{fmtDate(inst.dueDate)}</td>
                                      <td className="py-2 px-3 text-right text-slate-800 font-semibold tabular-nums">{formatVND(inst.amount)}</td>
                                      <td className="py-2 px-3 text-right text-orange-600 font-semibold tabular-nums">
                                        {instLateFee > 0 ? `+${formatVND(instLateFee)}` : "0 ₫"}
                                      </td>
                                      <td className="py-2 px-3">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${
                                          ext.type === "with-penalty" ? "bg-orange-50 text-orange-700 border border-orange-200/50" : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                        }`}>
                                          {ext.type === "with-penalty" ? "Có phạt" : "Miễn phạt"}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-slate-500">{ext.approvedBy}</td>
                                      <td className="py-2 px-3 text-center">
                                        {renderStatusBadge(inst.status)}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          {isLatestExt && !isPaid && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-6 text-[10px] px-2 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0"
                                              onClick={() =>
                                                setConfirmPayTarget({ recordId: record.id, installment: inst })
                                              }
                                            >
                                              <BadgeCheck className="size-3" />
                                              Thanh toán
                                            </Button>
                                          )}
                                          {isPaid && inst.invoice && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 text-[10px] px-2 gap-1 text-blue-600 hover:bg-blue-50 shrink-0"
                                              onClick={() =>
                                                setActiveInvoice({ invoice: inst.invoice!, record })
                                              }
                                            >
                                              <FileText className="size-3" />
                                              Xem HĐ
                                            </Button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                });
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {debtAdjustTarget && (
        <DebtAdjustmentDialog
          open={!!debtAdjustTarget}
          contractName={contract.contractCode || contract.id}
          record={debtAdjustTarget}
          onConfirm={handleDebtAdjustConfirm}
          onClose={() => setDebtAdjustTarget(null)}
        />
      )}

      {reminderTarget && (
        <PaymentReminderDialog
          open={true}
          onOpenChange={(v: boolean) => !v && setReminderTarget(null)}
          customerId={customerId}
          contractId={contractId}
          paymentId={reminderTarget.id}
          customerName={customer.name}
          contractLabel={`${contract.projectName}${contract.unit ? ` · ${contract.unit}` : ""}`}
          installmentLabel={reminderTarget.label}
          amountLabel={formatVND(reminderTarget.remainingAmount ?? reminderTarget.baseAmount)}
          dueDateLabel={fmtDate(reminderTarget.dueDate)}
        />
      )}

      {auditHistoryRecord && (
        <Dialog open={!!auditHistoryRecord} onOpenChange={(open) => !open && setAuditHistoryRecord(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Lịch sử điều chỉnh công nợ</DialogTitle>
              <DialogDescription className="text-xs">
                {auditHistoryRecord.label}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <AuditHistorySection logs={localAuditLogs.get(auditHistoryRecord.id) ?? []} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {paymentConfirmTarget && (
        <PaymentConfirmDialog
          open={!!paymentConfirmTarget}
          contractName={contract.contractCode || contract.id}
          record={paymentConfirmTarget}
          onConfirm={handleOriginalPaymentConfirm}
          onClose={() => setPaymentConfirmTarget(null)}
        />
      )}

      {extDialog && (
        <ExtensionDialog
          open={!!extDialog}
          record={extDialog.record}
          existing={extDialog.editingIdx !== undefined ? getExtList(extDialog.record.id)[extDialog.editingIdx] : undefined}
          onSave={(ext) => handleSaveExtension(extDialog.record.id, ext, extDialog.editingIdx)}
          onClose={() => setExtDialog(null)}
        />
      )}

      {confirmPayTarget && (
        <ExtensionPaymentConfirmDialog
          open={!!confirmPayTarget}
          installment={confirmPayTarget.installment}
          contractName={contract.contractCode || contract.id}
          onConfirm={(paidAmount, paidDate, invoice) =>
            handleConfirmInstallmentPayment(
              confirmPayTarget.recordId,
              confirmPayTarget.installment.id,
              paidAmount,
              paidDate,
              invoice
            )
          }
          onClose={() => setConfirmPayTarget(null)}
        />
      )}
    </Card>
  );
}

type PaymentDetailsProps = {
  customerId?: string;
  contractId?: string;
  mode?: "page" | "sheet";
  onClose?: () => void;
};

export function PaymentDetails({ customerId: customerIdProp, contractId: contractIdProp, mode = "page", onClose }: PaymentDetailsProps = {}) {
  const params = useParams<{
    customerId: string;
    contractId: string;
  }>();
  const customerId = customerIdProp ?? params.customerId;
  const contractId = contractIdProp ?? params.contractId;
  const [viewMode, setViewMode] = useState<"detail" | "table">("detail");
  // Session-only override, nâng lên đây để các đợt thấy thanh toán của nhau (carry-forward xuyên đợt).
  const [recordOverrides, setRecordOverrides] = useState<Map<string, RecordOverride>>(new Map());
  const navigate = useNavigate();

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

  if (!customer || !contract) {
    return (
      <div
        className={`${mode === "sheet" ? "h-full" : "min-h-screen"} flex flex-col items-center justify-center gap-4 text-muted-foreground`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Building2 className="size-10 opacity-30" />
        <p>Không tìm thấy thông tin hợp đồng</p>
        <Button variant="outline" size="sm" onClick={() => (onClose ? onClose() : navigate("/"))}>
          <ArrowLeft className="size-4 mr-2" />
          {onClose ? "Đóng" : "Quay lại"}
        </Button>
      </div>
    );
  }

  const hasStages = contract.stages && contract.stages.length > 0;
  const paymentInstallments = hasStages
    ? buildPaymentInstallmentStages(contract.stages!)
    : [];
  const isOverdue = contract.status === "overdue";
  const remaining = contract.contractValue - contract.paidAmount;
  const totalLateFee = getContractTotalLateFee(contract);

  const overdueRecords = contract.stages
    ? contract.stages.flatMap((s) => s.records.filter((r) => r.status === "overdue"))
    : [];

  const exportExcel = () => {
    const escapeCell = (value: string) => `"${value.toString().replace(/"/g, '""')}"`;
    
    const allRows = paymentInstallments.flatMap((stage) =>
      stage.records.map((record) => ({ stage, record }))
    );
    
    const depositDate = paymentInstallments[0]?.records[0]?.paidDate || paymentInstallments[0]?.records[0]?.dueDate || "";
    const signingDate = paymentInstallments[0]?.records?.[1]?.paidDate || paymentInstallments[0]?.records?.[1]?.dueDate || "";

    const headers = [
      "STT",
      "Đợt thanh toán",
      "Ngày cọc",
      "Số tiền cọc",
      "Tiền cọc lòng chuyển sang cọc",
      "Tiền bổ sung cọc mới",
      "Ngày ký HĐ",
      "% TT",
      "Số tiền",
      "Ngày đến hạn",
      "Dư báo quá hạn",
      "Ngày dự kiến TT",
      "Ngày thực tế TT",
      "Tổng đã thu",
      "Dư thiếu đợt trước",
      "Bổ sung",
      "Còn lại",
      "Ngày gia hạn",
      "Ngày thanh toán gia hạn",
      "Tỷ lệ khách hàng thanh toán",
      "Trạng thái TT"
    ];

    const dataRows: string[][] = [];
    allRows.forEach(({ stage, record }, index) => {
      const pctTT = Math.round((record.baseAmount / contract.contractValue) * 100);
      const overdueDays = record.status === "overdue" ? (record.daysOverdue || record.daysAfterDue || 0) : 0;
      const hasExtensions = (record.extensions && record.extensions.length > 0);
      const activeExt = hasExtensions ? record.extensions![record.extensions!.length - 1] : null;
      
      const isFullyPaid = record.status === "paid" || record.status === "overpaid";
      const percentPaid = isFullyPaid ? "100%" : record.status === "partial" ? "50%" : "—";
      
      const statusLabel = record.status === "paid" || record.status === "overpaid" 
        ? "Đã thanh toán" 
        : record.status === "overdue" 
          ? "Quá hạn" 
          : record.status === "upcoming" 
            ? "Sắp tới hạn" 
            : record.status === "partial" 
              ? "Một phần" 
              : "Chưa tới hạn";

      const prevRow = allRows[index - 1]?.record;
      const prevOv = prevRow ? recordOverrides.get(prevRow.id) : undefined;
      const carryForwardIn = !prevRow
        ? 0
        : (prevOv && typeof prevOv.carryOut === "number")
          ? prevOv.carryOut
          : (prevRow.status === "overdue" || prevRow.status === "partial")
            ? (prevRow.remainingAmount ?? Math.max(0, prevRow.baseAmount - (prevRow.paidAmount ?? 0)))
            : prevRow.status === "overpaid"
              ? -Math.max(0, (prevRow.paidAmount ?? 0) - (prevRow.baseAmount + (prevRow.lateInterest ?? 0)))
              : 0;

      // 1. Dòng cha
      dataRows.push([
        (index + 1).toString(),
        record.label,
        index === 0 ? (depositDate ? fmtDate(depositDate) : "—") : "—",
        index === 0 ? formatVND(0.05) : formatVND(record.baseAmount),
        formatVND(0.05),
        "0 ₫",
        signingDate ? fmtDate(signingDate) : "—",
        `${pctTT}%`,
        formatVND(record.baseAmount),
        fmtDate(record.dueDate),
        overdueDays > 0 ? `${overdueDays} ngày` : "0 ngày",
        fmtDate(record.dueDate),
        record.paidDate ? fmtDate(record.paidDate) : "—",
        formatVND(record.paidAmount),
        formatVND(carryForwardIn),
        "0 ₫",
        formatVND(record.remainingAmount),
        activeExt ? fmtDate(activeExt.newDueDate) : "—",
        (activeExt && activeExt.installments.some(i => i.status === "paid")) ? fmtDate(activeExt.installments.find(i => i.status === "paid")?.paidDate || "") : "—",
        percentPaid,
        statusLabel
      ]);

      // 2. Dòng gia hạn con (Giải pháp 1)
      if (hasExtensions) {
        const extList = record.extensions!;
        extList.forEach((ext, extIdx) => {
          ext.installments.forEach((inst, instIdx) => {
            const instLateFee = ext.type === "with-penalty" ? calcLateFee(inst.amount, ext.penaltyRatePercent, inst.dueDate) : 0;
            const instStatusLabel = inst.status === "paid" ? "Đã thanh toán" : inst.status === "overdue" ? "Quá hạn" : "Sắp tới hạn";
            
            dataRows.push([
              `${index + 1}.${extIdx + 1}.${instIdx + 1}`, // STT con (vd: 4.1.1)
              `   └─ ${inst.label} (Gia hạn lần ${extIdx + 1})`, // Thụt dòng lề trái
              "—", // Ngày cọc
              "—", // Số tiền cọc
              "—", // Tiền cọc lòng
              "—", // Bổ sung cọc
              "—", // Ngày ký HĐ
              "—", // % TT
              formatVND(inst.amount), // Số tiền gia hạn
              fmtDate(inst.dueDate), // Ngày gia hạn mới
              instLateFee > 0 ? `Phạt trễ hạn: ${formatVND(instLateFee)}` : "Miễn phạt", // Lãi phạt
              "—", // Ngày dự kiến
              inst.paidDate ? fmtDate(inst.paidDate) : "—", // Ngày thực tế
              formatVND(inst.status === "paid" ? inst.amount : 0), // Đã thu
              "—", // Dư thiếu
              "—", // Bổ sung
              formatVND(inst.status === "paid" ? 0 : inst.amount), // Còn lại
              "—", // Ngày gia hạn
              "—", // Ngày thanh toán gia hạn
              "—", // Tỷ lệ
              instStatusLabel // Trạng thái con
            ]);
          });
        });
      }
    });

    const csvContent = [headers, ...dataRows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");
      
    const csv = `\uFEFF${csvContent}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chi-tiet-cong-no-${contract.contractCode || contract.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`${mode === "sheet" ? "h-full overflow-y-auto" : "min-h-screen"} bg-slate-50`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="border-b border-border/60 bg-white sticky top-0 z-10 py-3.5 px-4 md:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 mt-1 shrink-0 text-muted-foreground hover:text-foreground border"
              onClick={() => (onClose ? onClose() : navigate(`/customer/${customer.id}`))}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Chi tiết công nợ</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <h1 className="text-base font-medium text-foreground">
                  Mã hợp đồng: <span className="text-blue-600">{contract.contractCode || contract.id}</span>
                </h1>
                {renderStatusBadges(contract.status, false)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Mã căn hộ: <strong className="text-slate-700">{contract.unit}</strong> · Khách hàng chính: <strong className="text-slate-700">{customer.name}</strong> · Dự án: <strong className="text-slate-700">{contract.projectName}</strong> · Nhân viên KD: <strong className="text-slate-700">{contract.salesperson ?? "Nguyễn Hoàng Phúc"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            {/* Export Document Button (Spreadsheet Icon) */}
            <Button variant="outline" size="icon" className="size-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={exportExcel} title="Xuất file công nợ">
              <FileText className="size-4" />
            </Button>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center border border-slate-200 bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("detail")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "detail"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Dạng chi tiết"
              >
                <LayoutList className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Dạng bảng"
              >
                <Table2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {isOverdue && overdueRecords.length > 0 && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertTriangle className="size-4 text-red-600" />
            <AlertTitle className="text-red-800">Cảnh báo: Có khoản thanh toán quá hạn</AlertTitle>
            <AlertDescription className="text-red-700">
              Hợp đồng{" "}
              <strong>
                {contract.projectName} – Căn {contract.unit}
              </strong>{" "}
              đang có{" "}
              <strong>{overdueRecords.length} khoản thanh toán quá hạn</strong>. Tổng phí
              phạt trễ hạn ước tính: <strong>{formatVND(totalLateFee)}</strong> (lãi suất{" "}
              {contract.latePenaltyRate}%/năm). Vui lòng liên hệ khách hàng để xử lý ngay.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={BadgeCheck}
            label="Đã thanh toán"
            value={formatVND(contract.paidAmount)}
            sub={`${contract.paymentProgress}% giá trị hợp đồng`}
            iconClass="bg-emerald-50"
            valueClass="text-emerald-700"
          />
          <MetricCard
            icon={Banknote}
            label="Số dư còn lại"
            value={formatVND(remaining)}
            sub={`Hợp đồng: ${formatVND(contract.contractValue)}`}
            iconClass="bg-blue-50"
            valueClass="text-blue-700"
          />
          <MetricCard
            icon={TrendingDown}
            label="Tổng lãi phạt tích lũy"
            value={totalLateFee > 0 ? formatVND(totalLateFee) : "—"}
            sub={
              totalLateFee > 0
                ? `${contract.latePenaltyRate}%/năm · ${contract.daysOverdue} ngày`
                : "Không có khoản quá hạn"
            }
            iconClass="bg-red-50"
            valueClass={totalLateFee > 0 ? "text-red-600" : "text-muted-foreground"}
          />
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Tiến độ tổng thể</span>
              </div>
              <span className="text-sm text-muted-foreground">{contract.paymentProgress}%</span>
            </div>
            <Progress
              value={contract.paymentProgress}
              className={`h-2 ${isOverdue
                ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                : contract.status === "upcoming"
                  ? "bg-blue-100 [&>[data-slot=progress-indicator]]:bg-blue-500"
                  : "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                }`}
            />
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              {paymentInstallments.length > 0 ? (
                <>
                  <span>
                    Bắt đầu: {fmtDate(paymentInstallments[0]?.records[0]?.dueDate ?? "")}
                  </span>
                  <span>
                    Dự kiến hoàn thành:{" "}
                    {fmtDate(
                      paymentInstallments[paymentInstallments.length - 1]?.records[
                        paymentInstallments[paymentInstallments.length - 1]?.records.length - 1
                      ]?.dueDate ?? ""
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span>Đến hạn: {fmtDate(contract.dueDate)}</span>
                  <span>{contract.paymentProgress}% hoàn thành</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {viewMode === "table" ? (
          <PaymentTable
            paymentInstallments={paymentInstallments}
            customer={customer}
            contract={contract}
            customerId={customerId!}
            contractId={contractId!}
            onNavigate={navigate}
          />
        ) : hasStages ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold">Lộ trình thanh toán 5 năm</h2>
              <p className="text-xs text-muted-foreground">
                {paymentInstallments.filter((s) => s.stageStatus === "completed").length} /{" "}
                {paymentInstallments.length} đợt hoàn thành
              </p>
            </div>
            <div className="space-y-0">
              {(() => {
                // Ràng buộc tuần tự: chỉ đợt CHƯA hoàn thành đầu tiên mới được thanh toán.
                const isPaidStatus = (s: PaymentStage) => {
                  const r = s.records[0];
                  const st = recordOverrides.get(r.id)?.status ?? r.status;
                  return st === "paid" || st === "overpaid";
                };
                const firstPayableIdx = paymentInstallments.findIndex((s) => !isPaidStatus(s));
                return paymentInstallments.map((stage, idx) => (
                  <StageBlock
                    key={stage.records[0]?.id ?? `${stage.id}-${idx}`}
                    stage={stage}
                    isLast={idx === paymentInstallments.length - 1}
                    customerName={customer.name}
                    projectName={contract.projectName}
                    unit={contract.unit}
                    customerId={customerId!}
                    contractId={contractId!}
                    nextStageDueDate={paymentInstallments[idx + 1]?.records[0]?.dueDate}
                    carryForwardIn={computeCarryForward(paymentInstallments[idx - 1], recordOverrides)}
                    isPayable={idx === firstPayableIdx}
                    recordOverrides={recordOverrides}
                    setRecordOverrides={setRecordOverrides}
                    onNavigate={navigate}
                  />
                ));
              })()}
            </div>
          </div>
        ) : (
          <Card className="border-border/60 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Lộ trình thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <CalendarDays className="size-8 opacity-30" />
                <p className="text-sm">
                  Chi tiết lộ trình chưa được cập nhật cho hợp đồng này
                </p>
                <p className="text-xs">
                  Tiến độ hiện tại: {contract.paymentProgress}% ·{" "}
                  {formatVND(contract.paidAmount)} / {formatVND(contract.contractValue)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
