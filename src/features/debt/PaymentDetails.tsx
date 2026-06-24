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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  "not-due": {
    label: "Chưa đến hạn",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  upcoming: {
    label: "Sắp đến hạn",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
    className: "border-red-200 bg-red-50 text-red-700",
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

function paymentStatusToStageStatus(status: PaymentStatus): StageStatus {
  if (status === "paid" || status === "overpaid") return "completed";
  if (status === "not-due") return "pending";
  return "in-progress";
}

function buildPaymentInstallments(stages: PaymentStage[]): PaymentStage[] {
  let installmentNumber = 0;

  return stages.flatMap((stage) =>
    stage.records.map((record) => {
      installmentNumber += 1;
      const paidAmount =
        record.paidAmount ??
        (record.status === "paid" || record.status === "overpaid"
          ? record.baseAmount
          : 0);

      return {
        ...stage,
        id: stage.id,
        stageNumber: installmentNumber,
        name: record.label
          .replace(/^Đợt\s+\d+\s*[–-]\s*/i, "")
          .replace(/\s*[–-]\s*Đợt\s+\d+\s*/i, " ")
          .trim(),
        period: `Hạn ${fmtDate(record.dueDate)}`,
        totalAmount: record.baseAmount,
        paidAmount,
        stageStatus: paymentStatusToStageStatus(record.status),
        records: [record],
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">Nội dung</th>
                      <th className="px-4 py-2.5 text-right text-xs text-muted-foreground font-medium">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="px-4 py-3 text-foreground">
                        {record.label}
                        <p className="text-xs text-muted-foreground mt-0.5">Đến hạn: {fmtDate(record.dueDate)}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground tabular-nums">
                        {vndFull(record.baseAmount)}
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">VAT (0%)</td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground tabular-nums">—</td>
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

function StageIcon({
  status,
  number,
  isOverdue = false,
}: {
  status: StageStatus;
  number: number;
  isOverdue?: boolean;
}) {
  if (isOverdue)
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-rose-600 text-white shrink-0">
        <AlertTriangle className="size-4" strokeWidth={2.5} />
      </div>
    );
  if (status === "completed")
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
        <CheckCircle2 className="size-4" />
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

const stageLabelMap: Record<StageStatus, { label: string; cls: string }> = {
  completed: { label: "Hoàn thành", cls: "text-emerald-600" },
  "in-progress": { label: "Đang tiến hành", cls: "text-blue-600" },
  pending: { label: "Chưa bắt đầu", cls: "text-muted-foreground" },
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

  const [extensionOpen, setExtensionOpen] = useState<Set<string>>(
    () =>
      new Set(
        stage.records.flatMap((record) => {
          const list = record.extensions ?? [];
          return list.length > 0 ? [list[list.length - 1].id] : [];
        })
      )
  );

  const [installmentOpen, setInstallmentOpen] = useState<Set<string>>(
    () =>
      new Set(
        stage.records.flatMap((record) =>
          (record.extensions ?? []).flatMap((extension) =>
            extension.installments
              .filter((installment) => installment.status !== "upcoming")
              .map((installment) => installment.id)
          )
        )
      )
  );

  const [confirmPayTarget, setConfirmPayTarget] = useState<{
    recordId: string;
    installment: ExtensionInstallment;
  } | null>(null);

  // State for original installment payment confirmation
  const [paymentConfirmTarget, setPaymentConfirmTarget] = useState<PaymentRecord | null>(null);

  const getExtList = (recordId: string): PaymentExtension[] =>
    localExtensions.get(recordId) ?? [];

  const toggleHistory = (recordId: string) =>
    setHistoryOpen((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });

  const toggleExtension = (extensionId: string) =>
    setExtensionOpen((prev) => {
      const next = new Set(prev);
      if (next.has(extensionId)) next.delete(extensionId);
      else next.add(extensionId);
      return next;
    });

  const toggleInstallment = (installmentId: string) =>
    setInstallmentOpen((prev) => {
      const next = new Set(prev);
      if (next.has(installmentId)) next.delete(installmentId);
      else next.add(installmentId);
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
    setExtensionOpen((prev) => new Set(prev).add(ext.id));
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

  const getInstallmentLateFee = (
    ext: PaymentExtension,
    record: PaymentRecord,
    installment: ExtensionInstallment
  ) => {
    if (ext.type !== "with-penalty" || installment.status === "paid") return 0;
    const daysFromOriginalDue = Math.max(
      0,
      Math.round(
        (new Date(installment.dueDate).getTime() -
          new Date(record.dueDate).getTime()) /
          86400000
      )
    );
    return calcLateFee(
      installment.amount,
      ext.penaltyRatePercent,
      daysFromOriginalDue
    );
  };

  const renderInstRows = (
    ext: PaymentExtension,
    record: PaymentRecord,
    isActive: boolean
  ) => {
    const totalAmount = ext.installments.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = ext.installments.reduce(
      (sum, item) => sum + (item.status === "paid" ? item.amount : 0),
      0
    );
    const totalLateFee = ext.installments.reduce(
      (sum, item) => sum + getInstallmentLateFee(ext, record, item),
      0
    );
    const paidPercent =
      totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    return (
      <div className="space-y-3 border-t border-border/50 px-4 py-4">
        <div>
          <p className="text-sm text-foreground">
            Lịch thanh toán {ext.installments.length} đợt
          </p>
          <div className="mt-3 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Tổng tiền phải đóng</p>
                <p className="mt-0.5 text-sm text-foreground">{formatVND(totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng đã thu</p>
                <p className="mt-0.5 text-sm text-foreground">{formatVND(totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng số đợt</p>
                <p className="mt-0.5 text-sm text-foreground">{ext.installments.length} đợt</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Lãi phạt</p>
                <p className={`mt-0.5 text-sm ${totalLateFee > 0 ? "text-red-600" : "text-foreground"}`}>
                  {formatVND(totalLateFee)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">% khách hàng thanh toán</p>
                <p className="mt-0.5 text-sm text-foreground">{paidPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng phải thu</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {formatVND(totalAmount + totalLateFee)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {ext.installments.map((inst, index) => {
            const isOpen = installmentOpen.has(inst.id);
            const lateFee = getInstallmentLateFee(ext, record, inst);
            const paidAmount = inst.status === "paid" ? inst.amount : 0;
            const previousDebt = ext.installments
              .slice(0, index)
              .reduce(
                (sum, item) => sum + (item.status === "paid" ? 0 : item.amount),
                0
              );
            const daysOverdue =
              inst.status === "overdue"
                ? Math.max(
                    0,
                    Math.round(
                      (new Date().getTime() - new Date(inst.dueDate).getTime()) /
                        86400000
                    )
                  )
                : 0;
            const installmentPercent = inst.status === "paid" ? 100 : 0;

            return (
              <div key={inst.id} className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
                  onClick={() => toggleInstallment(inst.id)}
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 text-sm text-foreground">
                    {index + 1}. {inst.label}
                  </span>
                  <Badge className={`text-[10px] ${statusConfig[inst.status].className}`}>
                    {statusConfig[inst.status].label}
                  </Badge>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 px-4 py-4">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày đến hạn</p>
                          <p className="mt-0.5 text-sm text-foreground">{fmtDate(inst.dueDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Lãi phí phạt</p>
                          <p className={`mt-0.5 text-sm ${lateFee > 0 ? "text-red-600" : "text-foreground"}`}>
                            {formatVND(lateFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tổng đã thu</p>
                          <p className="mt-0.5 text-sm text-foreground">{formatVND(paidAmount)}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Ngày thanh toán</p>
                          <p className={`mt-0.5 text-sm ${inst.paidDate ? "text-emerald-600" : "text-foreground"}`}>
                            {inst.paidDate ? fmtDate(inst.paidDate) : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dư nợ đợt trước</p>
                          <p className="mt-0.5 text-sm text-foreground">{formatVND(previousDebt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Số ngày quá hạn</p>
                          <p className={`mt-0.5 text-sm ${daysOverdue > 0 ? "text-red-600" : "text-foreground"}`}>
                            {daysOverdue} ngày
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Tổng tiền thu theo đợt</p>
                          <p className="mt-0.5 text-sm text-foreground">{formatVND(inst.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tổng tiền phải thu</p>
                          <p className="mt-0.5 text-sm text-foreground">{formatVND(inst.amount + lateFee)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">% khách hàng thanh toán</p>
                          <p className={`mt-0.5 text-sm ${installmentPercent === 100 ? "text-emerald-600" : "text-foreground"}`}>
                            {installmentPercent}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      {inst.status === "overdue" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            onNavigate(
                              `/customer/${customerId}/contract/${contractId}/stage/${stage.id}/payment/${record.id}`
                            )
                          }
                        >
                          Xem chi tiết tính lãi
                        </Button>
                      )}
                      {isActive && inst.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 border-emerald-300 text-xs text-emerald-700"
                          onClick={() =>
                            setConfirmPayTarget({ recordId: record.id, installment: inst })
                          }
                        >
                          Xác nhận thanh toán
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExtCard = (
    ext: PaymentExtension,
    genIdx: number,
    isActive: boolean,
    record: PaymentRecord,
    totalCount: number
  ) => {
    const isOpen = extensionOpen.has(ext.id);

    return (
      <div key={ext.id} className="overflow-hidden rounded-xl border border-border/60 bg-background">
        <div className={`${ext.type === "with-penalty" ? "bg-rose-50" : "bg-amber-50"}`}>
          <div className="flex items-start gap-2 px-4 py-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
              onClick={() => toggleExtension(ext.id)}
              aria-expanded={isOpen}
            >
              <CalendarClock className={`mt-0.5 size-4 shrink-0 ${ext.type === "with-penalty" ? "text-rose-500" : "text-amber-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Lịch gia hạn · Lần {genIdx + 1}/{totalCount}
                  </span>
                  <Badge className={`text-[10px] ${ext.type === "with-penalty" ? "border-rose-200 bg-rose-100 text-rose-700" : "border-amber-200 bg-amber-100 text-amber-700"}`}>
                    {ext.type === "with-penalty" ? <ShieldX className="mr-1 size-2.5" /> : <ShieldCheck className="mr-1 size-2.5" />}
                    {ext.type === "with-penalty" ? "Có phí phạt" : "Không mất phí"}
                  </Badge>
                  {isActive && <Badge className="border-blue-200 bg-blue-50 text-[10px] text-blue-700">Hiện tại</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Người duyệt: <strong className="font-medium text-foreground">{ext.approvedBy}</strong></span>
                  <span>·</span>
                  <span>Ngày duyệt: <strong className="font-medium text-foreground">{fmtDate(ext.approvedDate)}</strong></span>
                  <span>·</span>
                  <span>Ngày yêu cầu: <strong className="font-medium text-foreground">{fmtDate(ext.requestDate)}</strong></span>
                </div>
              </div>
              <ChevronDown className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1 text-xs"
                onClick={() => setExtDialog({ record, editingIdx: genIdx })}
              >
                <Pencil className="size-3" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>

        {isOpen && (
          <div>
            <div className="grid grid-cols-1 gap-4 border-t border-border/50 px-4 py-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Lý do gia hạn</p>
                <p className="mt-1 text-sm text-foreground">{ext.reason}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ghi chú</p>
                <p className="mt-1 text-sm text-foreground">{ext.notes || "—"}</p>
              </div>
            </div>
            {renderInstRows(ext, record, isActive)}
          </div>
        )}
      </div>
    );
  };

  const isStageOverdue = stage.records[0]?.status === "overdue";
  const isStageUpcoming = stage.records[0]?.status === "upcoming";
  const sl = isStageOverdue
    ? { label: "Quá hạn", cls: "text-red-600 font-medium" }
    : isStageUpcoming
    ? { label: "Sắp đến hạn", cls: "text-blue-600 font-medium" }
    : stageLabelMap[stage.stageStatus];
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

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <StageIcon
            status={stage.stageStatus}
            number={stage.stageNumber}
            isOverdue={isStageOverdue}
          />
          {!isLast && (
            <div
              className={`w-px flex-1 mt-2 min-h-6 ${
                isStageOverdue
                  ? "bg-red-200"
                  : stage.stageStatus === "completed"
                  ? "bg-emerald-200"
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
              className={`h-1 ${
                isStageOverdue
                  ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                  : stage.stageStatus === "completed"
                  ? "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
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
                const showFinancialDetails =
                  record.status === "paid" || record.status === "overdue";
                const paidAmount =
                  record.paidAmount ?? (record.status === "paid" ? record.baseAmount : 0);
                const remainingAmount =
                  record.remainingAmount ?? Math.max(record.baseAmount - paidAmount, 0);
                const lateAmount =
                  record.adjustedLateInterest ??
                  record.lateInterest ??
                  record.lateFee ??
                  0;
                const paymentPercent =
                  record.baseAmount > 0
                    ? Math.min(100, Math.round((paidAmount / record.baseAmount) * 100))
                    : 0;
                const totalReceivable = remainingAmount + lateAmount;

                return (
                  <AccordionItem
                    key={record.id}
                    value={record.id}
                    className={idx === 0 ? "border-t-0" : ""}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/30 text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                        <span className="text-sm text-foreground">Trạng thái</span>

                        {record.status === "paid" && record.invoice && (
                          <div className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 shrink-0">
                            <FileText className="size-2.5 text-red-500" />
                            <span className="text-[10px] text-red-600">PDF</span>
                          </div>
                        )}

                        {extList.length > 0 && (
                          <div
                            className={`flex items-center gap-1 rounded border px-1.5 py-0.5 shrink-0 ${
                              activeExt?.type === "with-penalty"
                                ? "border-orange-200 bg-orange-50"
                                : "border-emerald-200 bg-emerald-50"
                            }`}
                          >
                            <CalendarClock
                              className={`size-2.5 ${
                                activeExt?.type === "with-penalty"
                                  ? "text-orange-500"
                                  : "text-emerald-500"
                              }`}
                            />
                            <span
                              className={`text-[10px] ${
                                activeExt?.type === "with-penalty"
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {extList.length > 1 ? `GH ${extList.length} lần` : "Đã gia hạn"}
                            </span>
                          </div>
                        )}

                        <Badge
                          className={`ml-auto shrink-0 text-[10px] px-1.5 py-0 ${
                            statusConfig[record.status].className
                          }`}
                        >
                          {statusConfig[record.status].label}
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    {(record.status === "upcoming" ||
                      record.status === "overdue" ||
                      record.status === "partial" ||
                      record.status === "grace-period") && (
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 bg-muted/10 px-4 py-3">
                        {(record.status === "upcoming" ||
                          record.status === "overdue" ||
                          record.status === "partial" ||
                          record.status === "grace-period") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                            onClick={() =>
                              setPaymentConfirmTarget(normalizePaymentRecord(record))
                            }
                          >
                            <BadgeCheck className="size-3.5" />
                            Xác nhận thanh toán
                          </Button>
                        )}
                        {record.status === "overdue" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-border/70"
                            onClick={() =>
                              onNavigate(
                                `/customer/${customerId}/contract/${contractId}/stage/${stage.id}/payment/${record.id}`
                              )
                            }
                          >
                            <FileText className="size-3.5" />
                            Xem chi tiết tính lãi
                          </Button>
                        )}
                      </div>
                    )}

                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="pl-7 space-y-3">
                        {/* Payment details grid */}
                        {showFinancialDetails ? (
                          <div className="grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Ngày đến hạn</p>
                                <p className={`mt-0.5 text-sm ${record.status === "overdue" ? "text-red-600" : "text-foreground"}`}>
                                  {fmtDate(record.dueDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Tiền cọc</p>
                                <p className="mt-0.5 text-sm text-foreground">{formatVND(record.baseAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Còn lại</p>
                                <p className="mt-0.5 text-sm text-foreground">{formatVND(remainingAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Dư nợ đợt trước</p>
                                <p className="mt-0.5 text-sm text-foreground">{formatVND(0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Số ngày chậm nộp</p>
                                <p className={`mt-0.5 text-sm ${(record.daysOverdue ?? record.daysAfterDue ?? 0) > 0 ? "text-red-600" : "text-foreground"}`}>
                                  {record.daysOverdue ?? record.daysAfterDue ?? 0} ngày
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Ngày thanh toán</p>
                                <p className={`mt-0.5 text-sm ${record.paidDate ? "text-emerald-600" : "text-foreground"}`}>
                                  {record.paidDate ? fmtDate(record.paidDate) : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Tổng đã thu</p>
                                <p className="mt-0.5 text-sm text-foreground">{formatVND(paidAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">% khách hàng thanh toán</p>
                                <p className="mt-0.5 text-sm text-foreground">{paymentPercent}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Lãi chậm nộp</p>
                                <p className={`mt-0.5 text-sm ${lateAmount > 0 ? "text-red-600" : "text-foreground"}`}>
                                  {formatVND(lateAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Tổng phải thu</p>
                                <p className="mt-0.5 text-sm font-medium text-foreground">{formatVND(totalReceivable)}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                            <div>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Ngày đến hạn gốc</p>
                              <p className="mt-0.5 text-sm text-foreground">{fmtDate(record.dueDate)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Số tiền gốc</p>
                              <p className="mt-0.5 text-sm text-foreground">{formatVND(record.baseAmount)}</p>
                            </div>
                          </div>
                        )}

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
                                className={`size-3.5 transition-transform ${
                                  isHistOpen ? "rotate-180" : ""
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
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
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

export function PaymentDetails() {
  const { customerId, contractId } = useParams<{
    customerId: string;
    contractId: string;
  }>();
  const navigate = useNavigate();

  const customer = customers.find((c) => c.id === customerId);
  const contract = customer?.contracts.find((ct) => ct.id === contractId);

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
    ? buildPaymentInstallments(contract.stages!)
    : [];
  const isOverdue = contract.status === "overdue";
  const remaining = contract.contractValue - contract.paidAmount;
  const totalLateFee = getContractTotalLateFee(contract);

  const overdueRecords = contract.stages
    ? contract.stages.flatMap((s) => s.records.filter((r) => r.status === "overdue"))
    : [];

  return (
    <div className="min-h-full bg-slate-50/80">
      <section aria-labelledby="payment-details-title" className="mx-auto max-w-screen-lg space-y-6 p-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Quay lại công nợ của ${customer.name}`}
            onClick={() => navigate(`/debt/customer/${customer.id}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1 flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className={`text-sm ${customer.avatarColor}`}>
                  {customer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 id="payment-details-title" className="text-foreground">{customer.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {contract.projectName} · Căn {contract.unit}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge className={`text-xs ${statusConfig[contract.status].className}`}>
                {statusConfig[contract.status].label}
              </Badge>
            </div>
          </div>
        </div>

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

        <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
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
              className={`h-2 ${
                isOverdue
                  ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                  : contract.status === "upcoming"
                  ? "bg-blue-100 [&>[data-slot=progress-indicator]]:bg-blue-500"
                  : "bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500"
              }`}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              {hasStages ? (
                <>
                  <span>
                    Bắt đầu:{" "}
                    {new Date(
                      paymentInstallments[0]?.records[0]?.dueDate ?? ""
                    ).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}
                  </span>
                  <span>
                    Dự kiến hoàn thành:{" "}
                    {(() => {
                      const lastStage = paymentInstallments[paymentInstallments.length - 1];
                      const lastRecord = lastStage.records[0];
                      return new Date(lastRecord?.dueDate ?? "").toLocaleDateString("vi-VN", {
                        month: "2-digit",
                        year: "numeric",
                      });
                    })()}
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

        {hasStages ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">Lộ trình thanh toán</h2>
              <p className="text-xs text-muted-foreground">
                {paymentInstallments.filter((s) => s.stageStatus === "completed").length} /{" "}
                {paymentInstallments.length} đợt hoàn thành
              </p>
            </div>
            <div className="space-y-0">
              {paymentInstallments.map((stage, idx) => (
                <StageBlock
                  key={stage.records[0]?.id ?? stage.id}
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
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
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
      </section>
    </div>
  );
}
