import { Paperclip } from "lucide-react";
import type { Reminder } from "@/types/reminder";

function formatRecordedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ReminderActivityListProps {
  reminders: Reminder[];
  emptyLabel?: string;
}

/** Read-only Activity log: recorded time, reminder type, attachments. No create/edit/delete here. */
export function ReminderActivityList({ reminders, emptyLabel = "Chưa có hoạt động nhắc hẹn nào." }: ReminderActivityListProps) {
  if (reminders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="h-10 w-44 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Ngày giờ ghi nhận</th>
              <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Loại nhắc</th>
              <th className="h-10 w-56 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Tệp đính kèm</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{formatRecordedAt(r.recordedAt)}</td>
                <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-bold">{r.type}</td>
                <td className="h-11 border-b border-[#E5EAF3] px-3 py-2">
                  {r.files && r.files.length > 0 ? (
                    <div className="flex flex-col gap-1 max-w-[220px]">
                      {r.files.map((file, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded truncate" title={`${file.name} (${file.size})`}>
                          <Paperclip className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
