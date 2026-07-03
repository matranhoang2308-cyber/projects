import { useState, useEffect } from "react";
import { AlertTriangle, BadgeCheck, FileText, Info, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  formatVND,
  allocatePayment,
  type PaymentRecord,
  type InvoiceFile,
} from "@/data/mockDataCongNo";

interface PaymentConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  record: PaymentRecord;
  contractName: string;
  onConfirm: (paidAmount: number, paidDate: string, invoice: InvoiceFile) => void;
}

const paymentInputClass = "h-10 text-sm";

export function PaymentConfirmDialog({
  open,
  onClose,
  record,
  contractName,
  onConfirm,
}: PaymentConfirmDialogProps) {
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paidDate, setPaidDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [bankName, setBankName] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPaidAmount("");
      setPaidDate(new Date().toISOString().split("T")[0]);
      setBankName("");
      setBankAccount("");
      setTransactionRef("");
    }
  }, [open]);

  // Calculate allocation result (Principal first, then Interest)
  const rawCleanAmount = parseFloat(paidAmount.replace(/\D/g, "")) || 0;
  const paidAmountNum = rawCleanAmount / 1000000000;
  
  const lateInterest = record.lateInterest ?? 0;
  const principalDue = record.remainingAmount;
  
  const allocatedToPrincipal = Math.min(paidAmountNum, principalDue);
  const remainingPaidAmount = Math.max(0, paidAmountNum - allocatedToPrincipal);
  const allocatedToInterest = Math.min(remainingPaidAmount, lateInterest);
  const overpaid = Math.max(0, remainingPaidAmount - lateInterest);
  
  const remainingPrincipal = Math.max(0, principalDue - allocatedToPrincipal);
  const remainingInterest = Math.max(0, lateInterest - allocatedToInterest);
  
  const isExactPayment = paidAmountNum >= principalDue - 0.000001 && paidAmountNum <= (principalDue + lateInterest) + 0.000001;
  const isOverpayment = paidAmountNum > (principalDue + lateInterest) + 0.000001;
  const isUnderpayment = paidAmountNum > 0 && paidAmountNum < principalDue - 0.000001;

  const handleConfirm = () => {
    if (paidAmountNum <= 0) return;

    // Generate mock invoice
    const invoice: InvoiceFile = {
      invoiceNumber: `HD-${record.installmentCode}-${Date.now()}`,
      invoiceDate: paidDate,
      invoiceStatus: "issued",
      fileName: `hoa-don-${record.installmentCode}-${paidDate}.pdf`,
      fileSize: "156 KB",
      uploadDate: paidDate,
      issuedBy: `${contractName} – Phòng Tài chính`,
      bankName: bankName.trim() || "Vietcombank – CN TP.HCM",
      bankAccount: bankAccount.trim() || "0071003920481",
      transactionRef: transactionRef.trim() || `VCB${paidDate.replace(/-/g, "")}-${Math.floor(Math.random() * 90000) + 10000}`,
      principalAmount: allocatedToPrincipal,
      nonInvoiceInterest: allocatedToInterest,
      pendingInvoiceAmount: 0,
    };

    onConfirm(paidAmountNum, paidDate, invoice);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[calc(100vh-40px)] flex flex-col overflow-hidden my-5">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-5 text-emerald-600" />
            <DialogTitle className="text-base text-foreground">
              Xác nhận thanh toán
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {record.label} · {contractName}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Installment info */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Số tiền gốc phải thu
                </p>
                <p className="text-lg text-foreground font-medium">
                  {formatVND(record.baseAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Đã thanh toán
                </p>
                <p className="text-lg text-emerald-600 font-medium">
                  {formatVND(record.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Còn nợ
                </p>
                <p className="text-lg text-foreground font-medium">
                  {formatVND(record.remainingAmount)}
                </p>
              </div>
              {record.lateInterest && record.lateInterest > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Lãi trễ hạn
                  </p>
                  <p className="text-lg text-red-600 font-medium">
                    +{formatVND(record.lateInterest)}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Tổng phải thu (gốc + lãi)
              </p>
              <p className="text-lg font-semibold text-foreground">
                {formatVND(record.remainingAmount + (record.lateInterest ?? 0))}
              </p>
            </div>
          </div>

          {/* Payment input */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="paid-amount">
                Số tiền thanh toán <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="paid-amount"
                  type="text"
                  placeholder="VD: 100.000.000"
                  value={paidAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    setPaidAmount(clean ? parseInt(clean, 10).toLocaleString("vi-VN") : "");
                  }}
                  className={`${paymentInputClass} pr-16`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  VND
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid-date">
                Ngày thanh toán <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paid-date"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className={paymentInputClass}
              />
            </div>

            <div className="pt-2">
              <Separator className="my-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3">
                Thông tin giao dịch chuyển khoản
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">
                  Ngân hàng (Tùy chọn)
                </Label>
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="Mặc định: Vietcombank – CN TP.HCM"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={paymentInputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">
                  Số tài khoản (Tùy chọn)
                </Label>
                <Input
                  id="bank-account"
                  type="text"
                  placeholder="Mặc định: 0071003920481"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className={paymentInputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-ref">
                Mã giao dịch / Tham chiếu (Tùy chọn)
              </Label>
              <Input
                id="transaction-ref"
                type="text"
                placeholder="Mặc định: VCB[Ngày]-[Ngẫu nhiên]"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className={paymentInputClass}
              />
            </div>
          </div>

          {/* Allocation result (show only when amount is entered) */}
          {paidAmountNum > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-blue-500" />
                  <p className="text-sm text-foreground font-medium">Kết quả phân bổ</p>
                </div>

                {/* Exact payment */}
                {isExactPayment && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <BadgeCheck className="size-4 text-emerald-600" />
                    <AlertDescription className="text-sm text-emerald-800">
                      <p className="font-medium mb-1">Thanh toán đúng số tiền gốc</p>
                      <p className="text-xs">
                        Đợt thanh toán này sẽ được đánh dấu là{" "}
                        <strong>Đã thanh toán</strong>.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Overpayment */}
                {isOverpayment && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <TrendingUp className="size-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Thanh toán dư</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Phân bổ cho đợt hiện tại:</span>
                          <span className="font-medium">
                            {formatVND(allocatedToPrincipal + allocatedToInterest)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-blue-600">
                          <span className="flex items-center gap-1">
                            <ArrowRight className="size-3" />
                            Chuyển sang đợt tiếp theo:
                          </span>
                          <span className="font-medium">
                            {formatVND(overpaid)}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Underpayment */}
                {isUnderpayment && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertTriangle className="size-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-800">
                      <p className="font-medium mb-2">Thanh toán thiếu</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Đã thanh toán:</span>
                          <span className="font-medium">
                            {formatVND(allocatedToPrincipal + allocatedToInterest)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-red-600">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="size-3" />
                            Còn nợ:
                          </span>
                          <span className="font-medium">
                            {formatVND(remainingPrincipal + remainingInterest)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs mt-2">
                        Đợt thanh toán sẽ được đánh dấu là{" "}
                        <strong>Thanh toán một phần</strong>.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Invoice info */}
                <div className="rounded-lg border border-border/60 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-slate-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium mb-1">
                        Thông tin hóa đơn & Biên nhận
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Số tiền xuất hóa đơn (Gốc):</span>
                          <span className="text-foreground font-semibold">
                            {formatVND(allocatedToPrincipal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Nội dung hóa đơn:</span>
                          <span className="text-foreground">Thanh toán gốc - {record.label}</span>
                        </div>
                        {allocatedToInterest > 0 && (
                          <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-orange-600">
                            <span className="flex items-center gap-1 font-medium">
                              <Info className="size-3" />
                              Biên nhận thu lãi trễ hạn (không VAT):
                            </span>
                            <span className="font-semibold">{formatVND(allocatedToInterest)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 shrink-0">
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={paidAmountNum <= 0}
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <BadgeCheck className="size-4" />
              Xác nhận thanh toán
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
