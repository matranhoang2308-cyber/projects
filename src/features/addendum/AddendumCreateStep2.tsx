import { useState } from "react";
import { Upload, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { contractStatusCfg, type AddendumContractOption, type AddendumTemplate } from "./addendumData";
import { addendumInputClass, addendumTextareaClass, addendumBadgeBaseClass, cn } from "./addendumStyles";

export interface NewOwnerFields {
  fullName: string;
  dob: string;
  cccd: string;
  cccdDate: string;
  cccdPlace: string;
  taxCode: string;
  email: string;
  phone: string;
  permanentAddress: string;
  contactAddress: string;
  bankAccount: string;
  bank: string;
  bankAccountName: string;
  reason: string;
}

export const emptyNewOwnerFields: NewOwnerFields = {
  fullName: "", dob: "", cccd: "", cccdDate: "", cccdPlace: "", taxCode: "",
  email: "", phone: "", permanentAddress: "", contactAddress: "",
  bankAccount: "", bank: "", bankAccountName: "", reason: "",
};

// Read-only mock — the record being changed. In production this would come
// from the selected contract's current owner.
const oldOwner = {
  fullName: "Gia Bảo", dob: "24/02/1993", phone: "090-987-6543",
  cccd: "294857392", cccdDate: "24/02/2025", cccdPlace: "CTCCS",
  permanentAddress: "929 Hart St, Brooklyn, NY 11237",
  contactAddress: "929 Hart St, Brooklyn, NY 11237",
  email: "huuhuy.realestate@email.com",
  bankAccount: "103849428550", bank: "Vietcombank", bankAccountName: "Lâm Trà My",
};

function FF({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xs font-medium text-slate-800">{value}</p>
    </div>
  );
}

interface AddendumCreateStep2Props {
  contract?: AddendumContractOption;
  template?: AddendumTemplate;
  effectiveDate: string;
  fields: NewOwnerFields;
  onChange: (key: keyof NewOwnerFields, value: string) => void;
  attachedFile: boolean;
  onAttach: () => void;
}

export function AddendumCreateStep2({
  contract, template, effectiveDate, fields, onChange, attachedFile, onAttach,
}: AddendumCreateStep2Props) {
  const [oldOwnerOpen, setOldOwnerOpen] = useState(true);

  return (
    <div className="space-y-5">
      {/* Ghim tóm tắt HĐ */}
      {contract && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600">{contract.label}</span>
              <Badge variant="outline" className={cn(addendumBadgeBaseClass, "font-semibold", contractStatusCfg[contract.status])}>{contract.status}</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">{contract.customer} · {contract.property}</p>
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600">{contract.value_str}</span>
        </div>
      )}

      {/* Thông tin chủ sở hữu cũ */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setOldOwnerOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-slate-50 px-4 py-2.5 text-left"
        >
          <span className="text-xs font-semibold text-slate-700">Thông tin chủ sở hữu cũ</span>
          {oldOwnerOpen ? <Minus className="h-3.5 w-3.5 text-slate-400" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
        </button>
        {oldOwnerOpen && (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <ReadOnlyField label="Họ và tên" value={oldOwner.fullName} />
            <ReadOnlyField label="Ngày sinh" value={oldOwner.dob} />
            <ReadOnlyField label="Số điện thoại" value={oldOwner.phone} />
            <ReadOnlyField label="CCCD" value={oldOwner.cccd} />
            <ReadOnlyField label="Ngày cấp" value={oldOwner.cccdDate} />
            <ReadOnlyField label="Nơi cấp" value={oldOwner.cccdPlace} />
            <ReadOnlyField label="Địa chỉ thường trú" value={oldOwner.permanentAddress} />
            <ReadOnlyField label="Địa chỉ liên hệ" value={oldOwner.contactAddress} />
            <ReadOnlyField label="Email" value={oldOwner.email} />
            <ReadOnlyField label="Số tài khoản" value={oldOwner.bankAccount} />
            <ReadOnlyField label="Ngân hàng" value={oldOwner.bank} />
            <ReadOnlyField label="Tên tài khoản" value={oldOwner.bankAccountName} />
          </div>
        )}
      </div>

      {/* Thông tin chủ sở hữu mới */}
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-700">Thông tin chủ sở hữu mới</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FF label="Họ và tên" required>
            <Input placeholder="Chọn/nhập chủ sở hữu" value={fields.fullName} onChange={(e) => onChange("fullName", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Ngày sinh" required>
            <Input type="date" value={fields.dob} onChange={(e) => onChange("dob", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="CCCD" required>
            <Input placeholder="Nhập CCCD" value={fields.cccd} onChange={(e) => onChange("cccd", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Ngày cấp" required>
            <Input type="date" value={fields.cccdDate} onChange={(e) => onChange("cccdDate", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Nơi cấp" required>
            <Input placeholder="Nhập nơi cấp" value={fields.cccdPlace} onChange={(e) => onChange("cccdPlace", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Mã số thuế (không bắt buộc)">
            <Input placeholder="Nhập mã số thuế" value={fields.taxCode} onChange={(e) => onChange("taxCode", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Email" required>
            <Input placeholder="Nhập email" value={fields.email} onChange={(e) => onChange("email", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Số điện thoại" required>
            <Input placeholder="Nhập số điện thoại" value={fields.phone} onChange={(e) => onChange("phone", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Địa chỉ thường trú" required>
            <Input placeholder="Nhập địa chỉ thường trú" value={fields.permanentAddress} onChange={(e) => onChange("permanentAddress", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Địa chỉ liên hệ" required>
            <Input placeholder="Nhập địa chỉ liên hệ" value={fields.contactAddress} onChange={(e) => onChange("contactAddress", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="STK" required>
            <Input placeholder="Nhập số tài khoản" value={fields.bankAccount} onChange={(e) => onChange("bankAccount", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Ngân hàng" required>
            <Input placeholder="Nhập ngân hàng" value={fields.bank} onChange={(e) => onChange("bank", e.target.value)} className={addendumInputClass} />
          </FF>
          <FF label="Tên chủ tài khoản" required>
            <Input placeholder="Nhập tên chủ tài khoản" value={fields.bankAccountName} onChange={(e) => onChange("bankAccountName", e.target.value)} className={addendumInputClass} />
          </FF>
        </div>
      </div>

      {/* Lý do thay đổi */}
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-700">Lý do thay đổi</p>
        <Textarea
          placeholder="Nhập lý do thay đổi..."
          value={fields.reason}
          onChange={(e) => onChange("reason", e.target.value)}
          className={addendumTextareaClass}
          rows={3}
        />
      </div>

      {/* Dropzone */}
      <div
        onClick={onAttach}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all",
          attachedFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <Upload className="mx-auto mb-2 h-5 w-5 text-slate-400" />
        <p className="text-sm text-slate-600">Click hoặc kéo file và thả vào vùng này</p>
        <p className="mt-0.5 text-xs text-slate-400">(Yêu cầu định dạng PDF, DOC, DOCX — tối đa 10MB)</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAttach(); }}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          {attachedFile ? "phu-luc-01.pdf (2.4 MB)" : "Chọn File"}
        </button>
      </div>

      {template && (
        <p className="text-center text-xs text-slate-400">Hiệu lực từ ngày {effectiveDate} · Mẫu: {template.name}</p>
      )}
    </div>
  );
}
