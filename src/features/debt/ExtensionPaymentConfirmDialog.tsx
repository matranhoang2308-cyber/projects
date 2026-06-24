import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Banknote,
  Hash,
  CalendarDays,
  Building2,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  formatVND,
  type ExtensionInstallment,
  type InvoiceFile,
} from "@/data/mockDataCongNo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface PaymentForm {
  paidDate: string;
  bankName: string;
  bankAccount: string;
  transactionRef: string;
  invoiceNumber: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExtensionPaymentConfirmDialog({
  open,
  onClose,
  installment,
  contractName,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  installment: ExtensionInstallment;
  contractName: string;
  onConfirm: (paidDate: string, invoice: InvoiceFile) => void;
}) {
  const [form, setForm] = useState<PaymentForm>({
    paidDate: todayStr(),
    bankName: "",
    bankAccount: "",
    transactionRef: "",
    invoiceNumber: `EXT-${Date.now().toString().slice(-6)}`,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentForm, string>>>({});

  useEffect(() => {
    if (open) {
      setForm({
        paidDate: todayStr(),
        bankName: "",
        bankAccount: "",
        transactionRef: "",
        invoiceNumber: `EXT-${Date.now().toString().slice(-6)}`,
      });
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs: Partial<Record<keyof PaymentForm, string>> = {};
    if (!form.bankName.trim()) errs.bankName = "Bắt buộc";
    if (!form.bankAccount.trim()) errs.bankAccount = "Bắt buộc";
    if (!form.transactionRef.trim()) errs.transactionRef = "Bắt buộc";
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = "Bắt buộc";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const invoice: InvoiceFile = {
      invoiceNumber: form.invoiceNumber.trim(),
      fileName: `hoadon-gahan-${form.invoiceNumber.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      fileSize: "1.2 MB",
      uploadDate: form.paidDate,
      issuedBy: contractName,
      bankName: form.bankName.trim(),
      bankAccount: form.bankAccount.trim(),
      transactionRef: form.transactionRef.trim(),
    };
    onConfirm(form.paidDate, invoice);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* ── Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60">
          <DialogTitle className="text-sm text-foreground flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            Xác nhận thanh toán đợt gia hạn
          </DialogTitle>
          <DialogDescription className="sr-only">
            Nhập thông tin thanh toán để xác nhận đợt gia hạn
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* ── Installment context */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-emerald-600 mb-0.5">
                  Đợt gia hạn
                </p>
                <p className="text-sm text-foreground">{installment.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đến hạn: {fmtDate(installment.dueDate)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">Số tiền</p>
                <p className="text-sm text-emerald-700">
                  {formatVND(installment.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Payment details */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Thông tin thanh toán
            </p>

            {/* Paid date + Invoice number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <CalendarDays className="size-3 text-muted-foreground" />
                  Ngày thanh toán
                </Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={form.paidDate}
                  onChange={(e) => setForm((p) => ({ ...p, paidDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  Số hoá đơn <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="EXT-2026-001"
                  className={`h-8 text-xs ${errors.invoiceNumber ? "border-red-400" : ""}`}
                  value={form.invoiceNumber}
                  onChange={(e) => setForm((p) => ({ ...p, invoiceNumber: e.target.value }))}
                />
                {errors.invoiceNumber && (
                  <p className="text-[10px] text-red-500">{errors.invoiceNumber}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Bank info */}
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Thông tin ngân hàng
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  Ngân hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: Vietcombank, BIDV..."
                  className={`h-8 text-xs ${errors.bankName ? "border-red-400" : ""}`}
                  value={form.bankName}
                  onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                />
                {errors.bankName && (
                  <p className="text-[10px] text-red-500">{errors.bankName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Banknote className="size-3 text-muted-foreground" />
                  Số tài khoản <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: 0123456789"
                  className={`h-8 text-xs ${errors.bankAccount ? "border-red-400" : ""}`}
                  value={form.bankAccount}
                  onChange={(e) => setForm((p) => ({ ...p, bankAccount: e.target.value }))}
                />
                {errors.bankAccount && (
                  <p className="text-[10px] text-red-500">{errors.bankAccount}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Hash className="size-3 text-muted-foreground" />
                Mã tham chiếu giao dịch <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="VD: VCB20260423-123456"
                className={`h-8 text-xs ${errors.transactionRef ? "border-red-400" : ""}`}
                value={form.transactionRef}
                onChange={(e) =>
                  setForm((p) => ({ ...p, transactionRef: e.target.value }))
                }
              />
              {errors.transactionRef && (
                <p className="text-[10px] text-red-500">{errors.transactionRef}</p>
              )}
            </div>
          </div>

          {/* ── Preview summary */}
          <div className="rounded-lg bg-muted/30 border border-border/60 px-3 py-2.5 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Tóm tắt
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Đợt thanh toán</span>
              <span className="text-foreground">{installment.label}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Số tiền</span>
              <span className="text-emerald-600">{formatVND(installment.amount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Ngày TT</span>
              <span className="text-foreground">
                {form.paidDate ? fmtDate(form.paidDate) : "—"}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Trạng thái sau xác nhận</span>
              <Badge className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 px-1.5 h-4">
                <CheckCircle2 className="size-2.5 mr-0.5 inline" />
                Đã thanh toán
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border/60"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleConfirm}
          >
            <CheckCircle2 className="size-3" />
            Xác nhận đã thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
