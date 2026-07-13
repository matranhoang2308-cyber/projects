import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { createReminder } from "@/services/reminderService";
import { getContractReminderType } from "@/helpers/reminderType";
import { openMailtoReminder } from "@/helpers/mailto";
import { ReminderFileAttachField } from "./ReminderFileAttachField";
import type { ReminderFile } from "@/types/reminder";
import type { ContractStatus } from "@/types/contractStatus";

interface ContractReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  contractId: string;
  contractStatus: ContractStatus;
}

export function ContractReminderDialog({
  open,
  onOpenChange,
  customerId,
  contractId,
  contractStatus,
}: ContractReminderDialogProps) {
  const [files, setFiles] = useState<ReminderFile[]>([]);

  useEffect(() => {
    if (open) setFiles([]);
  }, [open]);

  const reminderType = getContractReminderType(contractStatus);

  const handleConfirm = () => {
    createReminder({
      type: reminderType,
      context: "contract",
      customerId,
      contractId,
      files,
    });

    openMailtoReminder(reminderType, `${reminderType} — hợp đồng ${contractId}.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">{reminderType}</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Xác nhận để mở email nhắc khách hàng. Nội dung được hệ thống tự sinh theo trạng thái hợp đồng.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
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
