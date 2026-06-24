import { History, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type DebtAuditLog } from "@/data/mockDataCongNo";

interface AuditHistorySectionProps {
  auditLogs: DebtAuditLog[];
}

function fmtDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const targetLabels: Record<string, string> = {
  "original-installment": "Đợt gốc",
  "extension-installment": "Đợt gia hạn",
  "late-interest": "Lãi trễ hạn",
  "extension-fee": "Phí gia hạn",
  "due-date": "Ngày đến hạn",
  "paid-amount": "Số tiền thanh toán",
  "remaining-principal": "Số tiền còn lại",
  status: "Trạng thái",
};

export function AuditHistorySection({ auditLogs }: AuditHistorySectionProps) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-slate-50 p-8 text-center">
        <History className="size-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Chưa có lịch sử điều chỉnh
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="size-4 text-slate-600" />
        <h3 className="text-sm font-medium text-foreground">
          Lịch sử điều chỉnh
        </h3>
        <Badge variant="secondary" className="text-xs">
          {auditLogs.length} điều chỉnh
        </Badge>
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trường
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Giá trị cũ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Giá trị mới
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Người yêu cầu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Người duyệt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-white">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {targetLabels[log.target] || log.target}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">
                    {log.fieldName}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.oldValue}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground font-medium">
                    {log.newValue}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
                    <div className="line-clamp-2">{log.reason}</div>
                    {log.note && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        {log.note}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">
                    {log.requestedBy}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground font-medium">
                    {log.approvedBy}
                  </td>
                  {log.attachmentName && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <FileText className="size-3" />
                        <span className="truncate max-w-[100px]">
                          {log.attachmentName}
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
