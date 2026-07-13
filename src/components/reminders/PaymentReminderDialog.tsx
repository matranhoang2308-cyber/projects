import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { createReminder } from "@/services/reminderService";
import { PAYMENT_REMINDER_TYPE } from "@/helpers/reminderType";
import { openMailtoReminder } from "@/helpers/mailto";
import { ReminderFileAttachField } from "./ReminderFileAttachField";
import type { ReminderFile } from "@/types/reminder";

interface PaymentReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  contractId: string;
  paymentId: string;
  customerName: string;
  contractLabel: string;
  installmentLabel: string;
  amountLabel: string;
  dueDateLabel: string;
}

export function PaymentReminderDialog({
  open,
  onOpenChange,
  customerId,
  contractId,
  paymentId,
  customerName,
  contractLabel,
  installmentLabel,
  amountLabel,
  dueDateLabel,
}: PaymentReminderDialogProps) {
  const [files, setFiles] = useState<ReminderFile[]>([]);

  useEffect(() => {
    if (open) setFiles([]);
  }, [open]);

  const body = `Anh/chị vui lòng thanh toán ${installmentLabel}.\nSố tiền: ${amountLabel}.\nNgày đến hạn: ${dueDateLabel}.`;

  const handleConfirm = () => {
    createReminder({
      type: PAYMENT_REMINDER_TYPE,
      context: "payment",
      customerId,
      contractId,
      paymentId,
      files,
    });

    openMailtoReminder(`${PAYMENT_REMINDER_TYPE} — ${installmentLabel}`, body);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Nhắc khách thanh toán</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Xác nhận để mở email nhắc khách hàng. Nội dung được hệ thống tự sinh, không thể chỉnh sửa.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200">
            {[
              { label: "Khách hàng", value: customerName },
              { label: "Hợp đồng", value: contractLabel },
              { label: "Đợt thanh toán", value: installmentLabel },
              { label: "Số tiền", value: amountLabel },
              { label: "Ngày đến hạn", value: dueDateLabel },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-semibold text-slate-800 text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <ReminderFileAttachField files={files} onChange={setFiles} />
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleConfirm} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
