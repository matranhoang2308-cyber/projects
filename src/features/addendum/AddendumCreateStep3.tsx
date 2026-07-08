import { RefreshCw, FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contractStatusCfg, type AddendumContractOption, type AddendumTemplate } from "./addendumData";
import type { NewOwnerFields } from "./AddendumCreateStep2";
import { cn } from "./addendumStyles";

interface AddendumCreateStep3Props {
  contract?: AddendumContractOption;
  template?: AddendumTemplate;
  effectiveDate: string;
  fields: NewOwnerFields;
  attachedFile: boolean;
}

export function AddendumCreateStep3({ contract, template, effectiveDate, fields, attachedFile }: AddendumCreateStep3Props) {
  const docs = attachedFile
    ? [{ name: "phu-luc-01.pdf", size: "2.4 MB", date: "11/03/2026" }]
    : [];

  return (
    <div className="space-y-5">
      <Alert className="border-blue-200 bg-blue-50 py-3">
        <RefreshCw className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-700">
          <strong>Hoàn tất và xác nhận</strong> — Sau khi được phê duyệt, phụ lục sẽ tự động đồng bộ sang module{" "}
          <strong>Công nợ và Lịch thanh toán</strong>.
        </AlertDescription>
      </Alert>

      {contract && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600">{contract.label}</span>
              <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium", contractStatusCfg[contract.status])}>{contract.status}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">{contract.customer} · {contract.property}</p>
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">{contract.value_str}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="bg-emerald-800 px-4 py-3">
          <p className="text-sm font-semibold text-white">
            {template?.name ?? "Thay đổi thông tin người mua"} – {contract?.label ?? "—"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-2.5 bg-white p-4 text-xs sm:grid-cols-2">
          <div><span className="text-slate-400">Hợp đồng gốc:</span> <span className="font-medium text-slate-800">{contract?.label ?? "—"}</span></div>
          <div><span className="text-slate-400">Chủ sở hữu:</span> <span className="font-medium text-slate-800">{fields.fullName || contract?.customer || "—"}</span></div>
          <div><span className="text-slate-400">Loại sản phẩm:</span> <span className="text-slate-800">{contract?.property ?? "—"}</span></div>
          <div><span className="text-slate-400">Ngày hiệu lực:</span> <span className="text-slate-800">{effectiveDate}</span></div>
          <div><span className="text-slate-400">Loại phụ lục:</span> <span className="text-slate-800">{template?.name ?? "—"}</span></div>
          <div><span className="text-slate-400">Tài liệu:</span> <span className={attachedFile ? "text-emerald-600" : "text-amber-600"}>{attachedFile ? "Đã đính kèm" : "Chưa có"}</span></div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold text-slate-500">TÀI LIỆU ĐÍNH KÈM ({docs.length} file)</p>
        {docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">Chưa có tài liệu đính kèm</div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <FileText className="h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">{doc.name}</p>
                  <p className="text-xs text-slate-400">PDF · {doc.size} · Phát hành {doc.date}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    <Download className="h-3 w-3" />Tải về
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3 w-3" />Xoá
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
