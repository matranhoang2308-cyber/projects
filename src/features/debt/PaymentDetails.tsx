import { useState } from "react";
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
} from "lucide-react";
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

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  "not-due": {
    label: "Chưa đến hạn",
    className: "border-slate-200 bg-slate-50 text-slate-700",
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
    label: "Thanh toán một phần",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  overpaid: {
    label: "Thanh toán dư",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  overdue: {
    label: "Quá hạn",
    className: "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
  },
  "grace-period": {
    label: "Quá hạn (trong ân hạn)",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "deposit-forfeited": {
    label: "Mất cọc",
    className: "border-red-300 bg-red-100 text-red-800",
  },
  extended: {
    label: "Đã gia hạn",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
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
  let installmentNumber = 0;

  return stages.flatMap((stage) =>
    stage.records.map((record) => {
      installmentNumber += 1;
      const normalized = normalizePaymentRecord(record);
      const paidAmount = normalized.paidAmount;

      return {
        ...stage,
        stageNumber: installmentNumber,
        name: record.label,
        description: stage.description,
        period: `Hạn ${fmtDate(record.dueDate)}`,
        totalAmount: record.baseAmount,
        paidAmount,
        stageStatus: paymentStatusToStageStatus(record.status),
        records: [normalized],
      };
    })
  );
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
  onNavigate,
}: {
  stage: PaymentStage;
  isLast: boolean;
  customerName: string;
  projectName: string;
  unit: string;
  customerId: string;
  contractId: string;
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

  // State for original installment payment confirmation
  const [paymentConfirmTarget, setPaymentConfirmTarget] = useState<PaymentRecord | null>(null);

  // State for debt adjustment dialog
  const [debtAdjustTarget, setDebtAdjustTarget] = useState<PaymentRecord | null>(null);

  // State for audit history dialog
  const [auditHistoryRecord, setAuditHistoryRecord] = useState<PaymentRecord | null>(null);

  // Local audit logs per record (augmented by adjustments made in-session)
  const [localAuditLogs, setLocalAuditLogs] = useState<Map<string, import("../data/mockData").DebtAuditLog[]>>(
    () => {
      const m = new Map<string, import("../data/mockData").DebtAuditLog[]>();
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
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    setLocalExtensions((prev) => {
      const list = prev.get(recordId);
      if (!list || list.length === 0) return prev;
      const activeIdx = list.length - 1;
      const updatedActive: PaymentExtension = {
        ...list[activeIdx],
        installments: list[activeIdx].installments.map((i) =>
          i.id === instId
            ? { ...i, status: "paid" as PaymentStatus, paidDate, invoice }
            : i
        ),
      };
      const newList = [...list];
      newList[activeIdx] = updatedActive;
      return new Map(prev).set(recordId, newList);
    });
    setConfirmPayTarget(null);
  };

  // Handler for debt adjustment confirmation — appends audit log
  const handleDebtAdjustConfirm = (auditLog: import("../data/mockData").DebtAuditLog) => {
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
    // In a real app, this would update the backend and refresh data
    // For now, just log and close dialog
    console.log("Payment confirmed:", { paidAmount, paidDate, invoice });
    alert(`Đã ghi nhận thanh toán ${formatVND(paidAmount)} vào ngày ${paidDate}. Hóa đơn: ${invoice.invoiceNumber}`);
    setPaymentConfirmTarget(null);
    // Optionally: refresh page or update local state
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
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${inst.status === "overdue"
                ? "border-red-200 bg-red-50/50"
                : inst.status === "paid"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-border/60 bg-muted/20"
                }`}
            >
              <span className="text-[11px] text-muted-foreground w-4 text-center shrink-0">
                {iIdx + 1}
              </span>
              {inst.status === "paid" ? (
                <BadgeCheck className="size-3.5 text-emerald-500 shrink-0" />
              ) : inst.status === "overdue" ? (
                <div className="flex items-center justify-center rounded-full bg-red-500 shrink-0 size-3.5">
                  <AlertTriangle className="size-2 text-white stroke-[3px]" />
                </div>
              ) : (
                <Circle className="size-3.5 text-blue-400 shrink-0" />
              )}
              <span className="text-xs text-foreground flex-1 truncate">{inst.label}</span>
              <span
                className={`text-xs shrink-0 ${inst.status === "overdue"
                  ? "text-red-600"
                  : inst.status === "paid"
                    ? "text-emerald-600"
                    : "text-muted-foreground"
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
              <Badge
                className={`text-[10px] px-1.5 h-4 shrink-0 ${statusConfig[inst.status].className}`}
              >
                {statusConfig[inst.status].label}
              </Badge>
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
                        const syntheticRecord: import("../data/mockData").PaymentRecord = {
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
                        const syntheticRecord: import("../data/mockData").PaymentRecord = {
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

  const sl = stageLabelMap[stage.stageStatus];
  const overdueRecords = stage.records.filter((r) => r.status === "overdue");
  const progress =
    stage.totalAmount > 0
      ? Math.round((stage.paidAmount / stage.totalAmount) * 100)
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
          onConfirm={(paidDate, invoice) =>
            handleConfirmInstallmentPayment(
              confirmPayTarget.recordId,
              confirmPayTarget.installment.id,
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
          <StageIcon status={stage.stageStatus} number={stage.stageNumber} />
          {!isLast && (
            <div
              className={`w-px flex-1 mt-2 min-h-6 ${stage.stageStatus === "completed"
                ? "bg-emerald-200"
                : stage.stageStatus === "overdue"
                  ? "bg-red-200"
                  : stage.stageStatus === "in-progress"
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
              className={`h-1 ${stage.stageStatus === "completed"
                ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                : stage.stageStatus === "overdue"
                  ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                  : stage.stageStatus === "in-progress"
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
              {stage.records.map((record, idx) => {
                const extList = getExtList(record.id);
                const activeExt = extList.length > 0 ? extList[extList.length - 1] : undefined;
                const historyExts = extList.slice(0, -1);
                const canAddExtension =
                  record.status === "overdue" || record.status === "upcoming";
                const isHistOpen = historyOpen.has(record.id);

                return (
                  <AccordionItem
                    key={record.id}
                    value={record.id}
                    className={`border-l-4 transition-all duration-200 bg-transparent ${
                      record.status === "overdue"
                        ? "border-l-red-500 data-[state=open]:bg-red-50/10"
                        : record.status === "paid"
                          ? "border-l-emerald-500 data-[state=open]:bg-emerald-50/5"
                          : "border-l-blue-500 data-[state=open]:bg-blue-50/5"
                    } ${idx === 0 ? "border-t-0" : ""}`}
                  >
                    <AccordionTrigger className="group px-4 py-3 hover:no-underline hover:bg-slate-50/60 text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                        <div className="group-data-[state=open]:hidden flex items-center gap-2">
                          {record.status === "paid" ? (
                            <BadgeCheck className="size-4 text-emerald-500 shrink-0" />
                          ) : record.status === "overdue" ? (
                            <div className="flex items-center justify-center rounded-full bg-red-500 shrink-0 size-4">
                              <AlertTriangle className="size-2.5 text-white stroke-[3px]" />
                            </div>
                          ) : (
                            <Circle className="size-4 text-blue-400 shrink-0" />
                          )}
                          <span
                            className={`text-sm truncate ${record.status === "overdue" ? "text-red-700" : "text-foreground"
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

                        <Badge
                          className={`ml-auto shrink-0 text-[10px] px-1.5 py-0 ${statusConfig[record.status].className
                            }`}
                        >
                          {statusConfig[record.status].label}
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="pl-7 space-y-3">
                        {/* Quick actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {record.status !== "paid" && record.status !== "deposit-forfeited" && (
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

                        {/* Payment details grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-border/40 pt-3">
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Ngày đến hạn
                            </p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">
                              {fmtDate(record.dueDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Ngày thanh toán
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${record.paidDate ? "text-emerald-600" : "text-slate-400"}`}>
                              {record.paidDate ? fmtDate(record.paidDate) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Tiền cọc
                            </p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">
                              {formatVND(record.baseAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Tổng đã thu
                            </p>
                            <p className="text-sm font-medium text-emerald-600 mt-0.5">
                              {formatVND(record.paidAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Còn lại
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${record.remainingAmount > 0 ? "text-orange-600" : "text-slate-500"}`}>
                              {formatVND(record.remainingAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              % khách hàng thanh toán
                            </p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">
                              {record.baseAmount > 0
                                ? `${Math.round((record.paidAmount / record.baseAmount) * 100)}%`
                                : "0%"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Dư nợ đợt trước
                            </p>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                              0 VNĐ
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Lãi chậm nộp
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${(record.lateFee ?? 0) > 0 ? "text-red-600" : "text-slate-500"}`}>
                              {formatVND(record.lateFee ?? 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Số ngày chậm nộp
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${(record.daysOverdue ?? 0) > 0 ? "text-red-600" : "text-slate-500"}`}>
                              {record.daysOverdue ?? 0} ngày
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              Tổng phải thu
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${record.status === "overdue" ? "text-red-700" : "text-slate-500"}`}>
                              {formatVND(record.status === "paid" ? 0 : record.remainingAmount + (record.lateFee ?? 0))}
                            </p>
                          </div>
                        </div>

                        {record.status === "overdue" &&
                          record.lateFee != null &&
                          extList.length === 0 && (
                            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                              <p className="text-xs text-red-700">
                                <span className="font-medium">Tổng phải thanh toán:</span>{" "}
                                {formatVND(record.baseAmount + record.lateFee)}
                                <span className="text-red-500 ml-2">(gốc + phạt trễ hạn)</span>
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
    case "overpaid":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">Đã thanh toán</span>;
    case "overdue":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">Quá hạn</span>;
    case "upcoming":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">Sắp tới hạn</span>;
    case "partial":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/50">Một phần</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/50">Chưa tới hạn</span>;
  }
}

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
    paidDate: string,
    invoice: InvoiceFile
  ) => {
    setLocalExtensions((prev) => {
      const list = prev.get(recordId);
      if (!list || list.length === 0) return prev;
      const activeIdx = list.length - 1;
      const updatedActive: PaymentExtension = {
        ...list[activeIdx],
        installments: list[activeIdx].installments.map((i) =>
          i.id === instId
            ? { ...i, status: "paid" as PaymentStatus, paidDate, invoice }
            : i
        ),
      };
      const newList = [...list];
      newList[activeIdx] = updatedActive;
      return new Map(prev).set(recordId, newList);
    });
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
    console.log("Payment confirmed:", { paidAmount, paidDate, invoice });
    alert(`Đã ghi nhận thanh toán ${formatVND(paidAmount)} vào ngày ${paidDate}. Hóa đơn: ${invoice.invoiceNumber}`);
    setPaymentConfirmTarget(null);
  };

  const allRows = useMemo(() => {
    return paymentInstallments.flatMap((stage) =>
      stage.records.map((record) => ({ stage, record }))
    );
  }, [paymentInstallments]);

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
        <table className="w-full min-w-[1880px] border-collapse text-[11px] whitespace-nowrap">
          <thead className="bg-slate-50/75 border-b border-slate-200/60 text-slate-500">
            <tr>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase w-10">STT</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold tracking-wider uppercase min-w-[210px]">Đợt thanh toán</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày cọc</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Số tiền cọc</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Tiền cọc lòng chuyển sang cọc</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Tiền bổ sung cọc mới</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày ký HĐ</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase w-14">% TT</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Số tiền</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày đến hạn</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Dư báo quá hạn</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày dự kiến TT</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày thực tế TT</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Tổng đã thu</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Dư thiếu đợt trước</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Bổ sung</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold tracking-wider uppercase">Còn lại</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày gia hạn</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Ngày thanh toán gia hạn</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Tỷ lệ khách hàng thanh toán</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase">Trạng thái TT</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold tracking-wider uppercase w-14">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {allRows.map(({ stage, record }, index) => {
              const pctTT = Math.round((record.baseAmount / contract.contractValue) * 100);
              const overdueDays = record.status === "overdue" ? (record.daysOverdue || record.daysAfterDue || 0) : 0;
              const hasExtensions = getExtList(record.id).length > 0;
              const activeExt = hasExtensions ? getExtList(record.id)[getExtList(record.id).length - 1] : null;
              
              const isFullyPaid = record.status === "paid" || record.status === "overpaid";
              const percentPaid = isFullyPaid ? "100%" : record.status === "partial" ? "50%" : "—";

              return (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2.5 text-center font-medium text-slate-400">{index + 1}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{record.label}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{depositDate ? fmtDate(depositDate) : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{formatVND(0.05)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{formatVND(0.05)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-400">0 ₫</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{signingDate ? fmtDate(signingDate) : "—"}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-slate-700">{pctTT}%</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-900 tabular-nums">{formatVND(record.baseAmount)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{fmtDate(record.dueDate)}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-red-600">{overdueDays > 0 ? `${overdueDays} ngày` : "0 ngày"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{fmtDate(record.dueDate)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{record.paidDate ? fmtDate(record.paidDate) : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{formatVND(record.paidAmount)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-400">0 ₫</td>
                  <td className="px-3 py-2.5 text-right text-slate-400">0 ₫</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-900 tabular-nums">{formatVND(record.remainingAmount)}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{activeExt ? fmtDate(activeExt.newDueDate) : "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{activeExt && activeExt.installments.some(i => i.status === "paid") ? fmtDate(activeExt.installments.find(i => i.status === "paid")?.paidDate || "") : "—"}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-slate-700">{percentPaid}</td>
                  <td className="px-3 py-2.5 text-center">{renderStatusBadge(record.status)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!isFullyPaid && (
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
          onConfirm={(paidDate, invoice) =>
            handleConfirmInstallmentPayment(
              confirmPayTarget.recordId,
              confirmPayTarget.installment.id,
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

export function PaymentDetails() {
  const { customerId, contractId } = useParams<{
    customerId: string;
    contractId: string;
  }>();
  const [viewMode, setViewMode] = useState<"detail" | "table">("detail");
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
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Building2 className="size-10 opacity-30" />
        <p>Không tìm thấy thông tin hợp đồng</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4 mr-2" />
          Quay lại
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

    const dataRows = allRows.map(({ stage, record }, index) => {
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

      return [
        (index + 1).toString(),
        record.label,
        depositDate ? fmtDate(depositDate) : "—",
        formatVND(0.05),
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
        "0 ₫",
        "0 ₫",
        formatVND(record.remainingAmount),
        activeExt ? fmtDate(activeExt.newDueDate) : "—",
        (activeExt && activeExt.installments.some(i => i.status === "paid")) ? fmtDate(activeExt.installments.find(i => i.status === "paid")?.paidDate || "") : "—",
        percentPaid,
        statusLabel
      ];
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
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="border-b border-border/60 bg-white sticky top-0 z-10 py-3.5 px-4 md:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 mt-1 shrink-0 text-muted-foreground hover:text-foreground border"
              onClick={() => navigate(`/customer/${customer.id}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Chi tiết công nợ</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <h1 className="text-base font-medium text-foreground">
                  Mã hợp đồng: <span className="text-blue-600">{contract.contractCode || contract.id}</span>
                </h1>
                <Badge className={`text-[10px] px-1.5 py-0 ${statusConfig[contract.status].className}`}>
                  {statusConfig[contract.status].label}
                </Badge>
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
              {paymentInstallments.map((stage, idx) => (
                <StageBlock
                  key={stage.records[0]?.id ?? `${stage.id}-${idx}`}
                  stage={stage}
                  isLast={idx === paymentInstallments.length - 1}
                  customerName={customer.name}
                  projectName={contract.projectName}
                  unit={contract.unit}
                  customerId={customerId!}
                  contractId={contractId!}
                  onNavigate={navigate}
                />
              ))}
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
