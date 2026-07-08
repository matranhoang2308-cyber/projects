import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getAuditLogForAddendum, type AddendumListItem } from "./addendumData";
import { cn } from "./addendumStyles";

interface AddendumHistoryModalProps {
  item: AddendumListItem | null;
  open: boolean;
  onClose: () => void;
}

export function AddendumHistoryModal({ item, open, onClose }: AddendumHistoryModalProps) {
  if (!item) return null;
  const entries = getAuditLogForAddendum(item.id);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0" aria-describedby={undefined}>
        <div className="border-b border-slate-100 px-6 py-4">
          <DialogTitle className="text-slate-900">Nhật ký thay đổi</DialogTitle>
        </div>

        <div className="px-6 py-4">
          <p className="mb-3 text-xs font-semibold text-slate-500">CHI TIẾT NHẬT KÝ PHỤ LỤC</p>
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
              Chưa có nhật ký thay đổi cho phụ lục này
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200">
              <div className="relative space-y-4 p-4">
                <div className="absolute bottom-4 left-[22px] top-4 w-px bg-slate-200" />
                {entries.map((e) => (
                  <div key={e.id} className="relative flex gap-3">
                    <div className="z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white bg-slate-400 ring-1 ring-slate-200" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{e.user}</span>
                        <span className="text-xs text-slate-400">{e.time}</span>
                        <span className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-medium",
                          e.action === "Tạo phụ lục" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        )}>{e.action}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-4 text-slate-500">{e.detail}</p>
                      <span className="text-xs font-medium text-indigo-500">{e.contract}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <Button variant="outline" className="text-sm" onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
