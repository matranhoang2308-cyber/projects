import { useState } from "react";
import { FileSpreadsheet, LayoutGrid, Table as TableIcon, Download, History } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { addendumStatusCfg } from "./addendumData";
import type { AddendumListItem } from "./addendumData";
import type { AddendumDetail } from "./addendumDetailSchema";
import { AddendumBlockView } from "./AddendumBlockView";
import { AddendumTableView } from "./AddendumTableView";
import { getAuditLogForAddendum } from "./addendumData";
import { addendumBadgeBaseClass, cn } from "./addendumStyles";

type ViewMode = "block" | "table";

function exportExcel(detail: AddendumDetail) {
  const wb = XLSX.utils.book_new();
  const sheetContract = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN HỢP ĐỒNG GỐC", ""],
    ["Mã hợp đồng", detail.contract.code],
    ["Tên chủ sở hữu", detail.contract.ownerName],
    ["Bất động sản", detail.contract.property],
    ["Giá trị hợp đồng", detail.contract.value],
    ["Trạng thái hợp đồng", detail.contract.status],
  ]);
  XLSX.utils.book_append_sheet(wb, sheetContract, "HopDongGoc");

  const sheetOld = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN CHỦ SỞ HỮU CŨ", ""],
    ...detail.oldOwner.map((f) => [f.label, f.value ?? "-"]),
  ]);
  XLSX.utils.book_append_sheet(wb, sheetOld, "ChuSoHuuCu");

  const sheetNew = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN CHỦ SỞ HỮU MỚI", ""],
    ...detail.newOwner.map((f) => [f.label, f.value ?? "-"]),
  ]);
  XLSX.utils.book_append_sheet(wb, sheetNew, "ChuSoHuuMoi");

  XLSX.writeFile(wb, `PhuLuc_${detail.id}.xlsx`);
}

interface AddendumDetailDrawerProps {
  item: AddendumListItem | null;
  detail: AddendumDetail | null;
  open: boolean;
  onClose: () => void;
  onOpenHistory: (item: AddendumListItem) => void;
}

export function AddendumDetailDrawer({ item, detail, open, onClose, onOpenHistory }: AddendumDetailDrawerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("block");

  if (!item || !detail) return null;

  const activity = getAuditLogForAddendum(item.id);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-xl" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Chi tiết phụ lục {detail.id}</SheetTitle>

        {/* ── HEADER ── */}
        <div className="shrink-0 border-b border-slate-200 px-5 pb-4 pt-5">
          <p className="text-xs text-slate-400">Chi tiết phụ lục / Chi tiết hợp đồng</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{detail.title}</h3>
            <span className="text-xs font-semibold text-indigo-600">{detail.code}</span>
            <Badge variant="outline" className={cn(addendumBadgeBaseClass, "font-semibold", addendumStatusCfg[detail.status])}>
              {detail.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Ngày tạo: {detail.createdDate} · Người tạo: {detail.createdBy} · Hiệu lực: {detail.effectiveDate}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">Dạng xem chi tiết thông tin thay đổi</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 w-8 border-emerald-200 p-0 text-emerald-600 hover:bg-emerald-50" aria-label="Xuất Excel" onClick={() => exportExcel(detail)}>
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "block" ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === "block" && "bg-slate-950 hover:bg-slate-800")}
                aria-label="Block view"
                onClick={() => setViewMode("block")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === "table" && "bg-slate-950 hover:bg-slate-800")}
                aria-label="Table view"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {viewMode === "block" ? <AddendumBlockView detail={detail} /> : <AddendumTableView detail={detail} />}

          {/* Tài liệu đính kèm */}
          <div className="mt-4">
            <p className="mb-3 text-xs font-semibold text-slate-500">TÀI LIỆU ĐÍNH KÈM ({detail.docs.length} file)</p>
            <div className="space-y-2">
              {detail.docs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileSpreadsheet className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">{doc.name}</p>
                    <p className="text-xs text-slate-400">PDF · {doc.size} · Phát hành {doc.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Tải xuống ${doc.name}`} className="h-8 w-8 shrink-0 p-0">
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Nhật ký thay đổi (rút gọn) */}
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">NHẬT KÝ THAY ĐỔI</p>
              <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-slate-500" onClick={() => onOpenHistory(item)}>
                <History className="h-3 w-3" />Xem đầy đủ
              </Button>
            </div>
            <div className="relative">
              <div className="absolute bottom-1 left-1.5 top-1 w-px bg-slate-200" />
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="relative flex gap-3 pl-0">
                    <div className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-slate-400" />
                    <div className="flex-1 pb-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800">{a.user}</span>
                        <span className="text-xs text-slate-400">{a.time}</span>
                        <Badge variant="outline" className={cn(
                          addendumBadgeBaseClass,
                          a.action === "Tạo phụ lục" ? "bg-blue-50 text-blue-700 ring-blue-100" : "bg-amber-50 text-amber-700 ring-amber-200"
                        )}>{a.action}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs leading-4 text-slate-500">{a.detail}</p>
                      <span className="text-xs font-medium text-indigo-500">{a.contract}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
          <Button variant="outline" className="text-sm" onClick={onClose}>Đóng</Button>
          <Button className="bg-slate-950 text-sm hover:bg-slate-800">Chỉnh sửa</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
