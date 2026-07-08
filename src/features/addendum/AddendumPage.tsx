import { useState } from "react";
import { Plus, RefreshCw, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AddendumTable } from "./AddendumTable";
import { AddendumCreateModal } from "./AddendumCreateModal";
import { AddendumDetailDrawer } from "./AddendumDetailDrawer";
import { AddendumHistoryModal } from "./AddendumHistoryModal";
import { addendumDetails } from "./addendumDetailSchema";
import type { AddendumListItem } from "./addendumData";
import { addendumPageShellClass, addendumPageHeaderClass, addendumPrimaryButtonClass } from "./addendumStyles";

export function AddendumPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  const [detailItem, setDetailItem] = useState<AddendumListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [historyItem, setHistoryItem] = useState<AddendumListItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  function openDetail(item: AddendumListItem) {
    setDetailItem(item);
    setDetailOpen(true);
  }

  function openHistory(item: AddendumListItem) {
    setHistoryItem(item);
    setHistoryOpen(true);
    // Keep the detail drawer open underneath so "Đóng" on the history modal
    // returns the user to where they were.
  }

  function handleSuccess() {
    setSuccessAlert(true);
    setTimeout(() => setSuccessAlert(false), 4000);
  }

  return (
    <div className={addendumPageShellClass}>
      {/* Header */}
      <div className={addendumPageHeaderClass}>
        <div>
          <h1 className="text-slate-950" style={{ fontWeight: 750 }}>Quản lý phụ lục</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo, theo dõi và quản lý phụ lục hợp đồng</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <Button size="sm" className={addendumPrimaryButtonClass} onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />Tạo phụ lục
          </Button>
        </div>
      </div>

      {/* Success toast */}
      {successAlert && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800">Phụ lục đã được tạo thành công.</p>
            <p className="mt-0.5 text-xs text-emerald-600">Dữ liệu sẽ tự động đồng bộ sang module Công nợ và Lịch thanh toán.</p>
          </div>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setSuccessAlert(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sync Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-900 text-sm">Đồng bộ tự động</AlertTitle>
        <AlertDescription className="text-blue-800 text-xs mt-0.5">
          <p>
            Mọi thay đổi tại <strong>Phụ lục</strong> được tự động cập nhật đến module{" "}
            <strong>Công nợ</strong> và <strong>Lịch thanh toán</strong>.
          </p>
          <p className="mt-1">Cập nhật lần cuối: <strong>15:03 14/03/2026</strong></p>
        </AlertDescription>
      </Alert>

      {/* Danh sách phụ lục */}
      <AddendumTable onView={openDetail} onHistory={openHistory} />

      {/* Dialogs */}
      <AddendumCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={handleSuccess} />
      <AddendumDetailDrawer
        item={detailItem}
        detail={detailItem ? addendumDetails[detailItem.id] ?? null : null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOpenHistory={openHistory}
      />
      <AddendumHistoryModal item={historyItem} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
