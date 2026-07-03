import { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  formatVND,
  type PaymentRecord,
  type DebtAuditLog,
  type AdjustmentTarget,
} from "@/data/mockDataCongNo";

interface DebtAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  record: PaymentRecord;
  contractName: string;
  onConfirm: (auditLog: DebtAuditLog) => void;
}

const adjustmentInputClass = "h-10 text-sm";
const adjustmentSelectTriggerClass = "";
const adjustmentTextareaClass = "resize-none text-sm";

type AdjustmentType =
  | "due-date"
  | "principal-due"
  | "paid-amount"
  | "remaining-principal"
  | "reallocate-payment"
  | "reduce-waive-interest"
  | "adjust-extension-fee"
  | "change-debt-status"
  | "change-extension-status"
  | "reverse-payment"
  | "confirm-deposit-forfeiture";

const adjustmentTypeLabels: Partial<Record<AdjustmentType, string>> = {
  "reduce-waive-interest": "Giảm/miễn lãi trễ hạn",
  "due-date": "Điều chỉnh ngày đến hạn",
  "principal-due": "Điều chỉnh số tiền gốc phải thu",
  "paid-amount": "Điều chỉnh số tiền đã thanh toán",
  "remaining-principal": "Điều chỉnh số tiền gốc còn lại",
  "change-debt-status": "Thay đổi trạng thái công nợ",
  "reverse-payment": "Hoàn/hủy giao dịch thanh toán",
};

export function DebtAdjustmentDialog({
  open,
  onClose,
  record,
  contractName,
  onConfirm,
}: DebtAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | "">("reduce-waive-interest");
  const [newValue, setNewValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [requestedBy, setRequestedBy] = useState<string>("");
  const [approvedBy, setApprovedBy] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setAdjustmentType("reduce-waive-interest");
      setNewValue("");
      setReason("");
      setRequestedBy("");
      setApprovedBy("");
      setNote("");
    }
  }, [open]);

  // Get current value based on adjustment type
  const getCurrentValue = (): string => {
    if (!adjustmentType) return "";

    switch (adjustmentType) {
      case "due-date":
        return record.dueDate;
      case "principal-due":
        return formatVND(record.baseAmount);
      case "paid-amount":
        return formatVND(record.paidAmount);
      case "remaining-principal":
        return formatVND(record.remainingAmount);
      case "reduce-waive-interest":
        return formatVND(record.lateInterest ?? 0);
      case "change-debt-status":
        return record.debtStatus;
      case "change-extension-status":
        return record.status === "extended" ? "Đã gia hạn" : "Chưa gia hạn";
      default:
        return "—";
    }
  };

  // Get field name for audit log
  const getFieldName = (): string => {
    if (!adjustmentType) return "";

    switch (adjustmentType) {
      case "due-date":
        return "Ngày đến hạn";
      case "principal-due":
        return "Số tiền gốc phải thu";
      case "paid-amount":
        return "Số tiền đã thanh toán";
      case "remaining-principal":
        return "Số tiền gốc còn lại";
      case "reduce-waive-interest":
        return "Lãi trễ hạn";
      case "change-debt-status":
        return "Trạng thái công nợ";
      case "change-extension-status":
        return "Trạng thái gia hạn";
      default:
        return adjustmentTypeLabels[adjustmentType as AdjustmentType] || "";
    }
  };

  // Get adjustment target
  const getAdjustmentTarget = (): AdjustmentTarget => {
    if (!adjustmentType) return "original-installment";

    switch (adjustmentType) {
      case "due-date":
        return "due-date";
      case "paid-amount":
        return "paid-amount";
      case "remaining-principal":
        return "remaining-principal";
      case "reduce-waive-interest":
        return "late-interest";
      case "change-debt-status":
      case "change-extension-status":
        return "status";
      default:
        return "original-installment";
    }
  };

  const isAmountField = [
    "principal-due",
    "paid-amount",
    "remaining-principal",
    "reduce-waive-interest",
  ].includes(adjustmentType);

  const isDateField = adjustmentType === "due-date";
  const isStatusField = adjustmentType === "change-debt-status";
  const isReversePayment = adjustmentType === "reverse-payment";

  const handleConfirm = () => {
    if (!adjustmentType || !newValue || !reason || !approvedBy) return;

    const currentValue = getCurrentValue();
    let finalNewValue = newValue;
    if (isAmountField) {
      const rawCleanVal = parseFloat(newValue.replace(/\D/g, "")) || 0;
      const valBillions = rawCleanVal / 1000000000;
      finalNewValue = formatVND(valBillions);
    }

    const auditLog: DebtAuditLog = {
      id: `audit-${Date.now()}`,
      target: getAdjustmentTarget(),
      targetId: record.id,
      fieldName: getFieldName(),
      oldValue: currentValue,
      newValue: finalNewValue,
      reason: reason,
      requestedBy: requestedBy || "System",
      approvedBy: approvedBy,
      createdAt: new Date().toISOString(),
      note: note || undefined,
    };

    onConfirm(auditLog);
  };

  const isValid = adjustmentType && newValue && reason && approvedBy;
  const currentValue = getCurrentValue();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            <DialogTitle className="text-base text-foreground">
              Điều chỉnh công nợ
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {record.label} · {contractName}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Warning alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="size-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              <p className="font-medium mb-1">Lưu ý quan trọng</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside">
                <li>Mọi điều chỉnh đều được ghi nhận vào lịch sử audit</li>
                <li>Lãi/phí không được xuất hóa đơn</li>
                <li>Hóa đơn phải sử dụng quy trình hủy/thay thế riêng</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Installment info */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Mã đợt
                </p>
                <p className="text-sm text-foreground font-medium">
                  {record.installmentCode || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Số tiền gốc
                </p>
                <p className="text-sm text-foreground font-medium">
                  {formatVND(record.baseAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Trạng thái
                </p>
                <Badge variant="outline" className="text-xs">
                  {record.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Adjustment type */}
          <div className="space-y-2">
            <Label htmlFor="adjustment-type">
              Loại điều chỉnh <span className="text-red-500">*</span>
            </Label>
            <Select
              value={adjustmentType}
              onValueChange={(v) => setAdjustmentType(v as AdjustmentType)}
            >
              <SelectTrigger id="adjustment-type" className={adjustmentSelectTriggerClass}>
                <SelectValue placeholder="Chọn loại điều chỉnh" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(adjustmentTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {adjustmentType && (
            <>
              <Separator />

              {/* Current and new values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá trị hiện tại</Label>
                  <div className="rounded-lg border border-border/60 bg-slate-50 px-3 py-2">
                    <p className="text-sm text-foreground font-medium">
                      {currentValue}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-value">
                    Giá trị mới <span className="text-red-500">*</span>
                  </Label>
                  {isDateField ? (
                    <Input
                      id="new-value"
                      type="date"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className={adjustmentInputClass}
                    />
                  ) : isStatusField ? (
                    <select
                      id="new-value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="not-due">Chưa đến hạn</option>
                      <option value="upcoming">Sắp đến hạn</option>
                      <option value="partial">Thanh toán một phần</option>
                      <option value="overdue">Quá hạn</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="extended">Đã gia hạn</option>
                      <option value="grace-period">Trong ân hạn</option>
                    </select>
                  ) : isReversePayment ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Thao tác này sẽ hoàn tác giao dịch thanh toán và điều chỉnh lại số dư. Nhập lý do bên dưới.
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="new-value"
                        placeholder={isAmountField ? "VD: 100.000.000" : "Nhập giá trị mới"}
                        value={newValue}
                        onChange={(e) => {
                          if (isAmountField) {
                            const clean = e.target.value.replace(/\D/g, "");
                            setNewValue(clean ? parseInt(clean, 10).toLocaleString("vi-VN") : "");
                          } else {
                            setNewValue(e.target.value);
                          }
                        }}
                        className={isAmountField ? `${adjustmentInputClass} pr-12` : adjustmentInputClass}
                      />
                      {isAmountField && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                          VND
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do điều chỉnh <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do điều chỉnh..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className={adjustmentTextareaClass}
                />
              </div>

              {/* Requested by and Approved by */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requested-by">Người yêu cầu</Label>
                  <Input
                    id="requested-by"
                    placeholder="Tên người yêu cầu"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className={adjustmentInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approved-by">
                    Người phê duyệt <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="approved-by"
                    placeholder="Tên người phê duyệt"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className={adjustmentInputClass}
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="note"
                  placeholder="Ghi chú bổ sung..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className={adjustmentTextareaClass}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60">
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="size-4" />
              Xác nhận điều chỉnh
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
