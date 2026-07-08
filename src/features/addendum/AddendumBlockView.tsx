import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { AddendumDetail, AddendumDetailField } from "./addendumDetailSchema";
import { cn } from "./addendumStyles";

function FieldGrid({ fields }: { fields: AddendumDetailField[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-3">
      {fields.map((f) => (
        <div key={f.id}>
          <p className="text-xs text-slate-400">{f.label}</p>
          <p className="text-xs font-medium text-slate-800">{f.value || "-"}</p>
        </div>
      ))}
    </div>
  );
}

function OwnerBand({ title, tone, fields }: { title: string; tone: "red" | "green"; fields: AddendumDetailField[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold text-white",
          tone === "red" ? "bg-red-600" : "bg-emerald-600"
        )}
      >
        {title}
        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      {open && <FieldGrid fields={fields} />}
    </div>
  );
}

export function AddendumBlockView({ detail }: { detail: AddendumDetail }) {
  return (
    <div className="space-y-4">
      {/* Thông tin hợp đồng gốc */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <p className="text-xs font-semibold text-slate-700">Thông tin hợp đồng gốc</p>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Mã hợp đồng</p>
            <p className="text-xs font-semibold text-indigo-600">{detail.contract.code}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tên chủ sở hữu</p>
            <p className="text-xs font-medium text-slate-800">{detail.contract.ownerName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Bất động sản</p>
            <p className="text-xs font-medium text-slate-800">{detail.contract.property}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Giá trị hợp đồng</p>
            <p className="text-xs font-medium tabular-nums text-slate-800">{detail.contract.value}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Trạng thái hợp đồng</p>
            <span className="inline-flex items-center rounded border border-violet-200 bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700">
              {detail.contract.status}
            </span>
          </div>
        </div>
      </div>

      <OwnerBand title="Thông tin chủ sở hữu cũ" tone="red" fields={detail.oldOwner} />
      <OwnerBand title="Thông tin chủ sở hữu mới" tone="green" fields={detail.newOwner} />

      {/* Lý do thay đổi */}
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="mb-2 text-xs font-semibold text-slate-700">Lý do thay đổi</p>
        <p className="text-xs leading-5 text-slate-600">{detail.reason}</p>
      </div>
    </div>
  );
}
