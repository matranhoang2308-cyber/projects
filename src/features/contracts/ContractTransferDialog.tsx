import { useState } from "react";
import {
  Check, ChevronRight, ChevronLeft, X, Upload, Plus, Trash2,
  User, AlertTriangle, CheckCircle2, ArrowRight, FileText,
  Info, Shield,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import type { Contract, OwnerProfile, TransferLog } from "@/data/mockDataHopDong";

// ─── Types ────────────────────────────────────────────────────────────────────
type CoOwnerForm = {
  id: string;
  name: string; dob: string; phone: string; email: string;
  cccd: string; contactAddress: string;
};

type NewOwnerForm = {
  name: string; dob: string; phone: string; email: string;
  cccd: string; cccdDate: string; cccdPlace: string;
  permanentAddress: string; contactAddress: string;
  bankAccount: string; bank: string; bankAccountName: string;
};

const emptyOwner: NewOwnerForm = {
  name: "", dob: "", phone: "", email: "", cccd: "", cccdDate: "",
  cccdPlace: "", permanentAddress: "", contactAddress: "",
  bankAccount: "", bank: "", bankAccountName: "",
};

const emptyCoOwner = (): CoOwnerForm => ({
  id: Math.random().toString(36).slice(2),
  name: "", dob: "", phone: "", email: "", cccd: "", contactAddress: "",
});

const STEPS = [
  { id: 1, label: "Kiểm tra thông tin" },
  { id: 2, label: "Nhập thông tin mới" },
  { id: 3, label: "Xác nhận" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function FF({ label, required, children, error }: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{value || "—"}</p>
    </div>
  );
}

function OwnerReadCard({ owner, title }: { owner: OwnerProfile | undefined; title: string }) {
  if (!owner) return (
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>{title}</p>
      <p className="text-xs text-slate-400 italic">Chưa có thông tin</p>
    </div>
  );
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>{title}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <ReadField label="Họ và tên" value={owner.name} />
        <ReadField label="Ngày sinh" value={owner.dob} />
        <ReadField label="Số điện thoại" value={owner.phone} />
        <ReadField label="Email" value={owner.email} />
        <ReadField label="CCCD" value={owner.cccd} />
        <ReadField label="Ngày cấp" value={owner.cccdDate} />
        <ReadField label="Nơi cấp" value={owner.cccdPlace} />
        <ReadField label="Địa chỉ liên hệ" value={owner.contactAddress} />
      </div>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
type CoOwnerAction = "keep" | "replace" | "remove";

interface Props {
  open: boolean;
  onClose: () => void;
  contract: Contract;
  onSuccess: (log: TransferLog) => void;
}

export function ContractTransferDialog({ open, onClose, contract, onSuccess }: Props) {
  const [step, setStep]           = useState(1);
  const [newOwner, setNewOwner]   = useState<NewOwnerForm>(emptyOwner);
  const [coOwners, setCoOwners]   = useState<CoOwnerForm[]>([]);
  const [coOwnerAction, setCoOwnerAction] = useState<CoOwnerAction>("replace");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [file, setFile]           = useState("");
  const [note, setNote]           = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [success, setSuccess]     = useState(false);

  const currentOwner  = contract.owner;
  const currentCoOwners = contract.coOwners ?? [];
  const transferNum   = (contract.transferCount ?? 0) + 1;

  const updateOwner = (k: keyof NewOwnerForm, v: string) =>
    setNewOwner((p) => ({ ...p, [k]: v }));

  const updateCoOwner = (id: string, k: keyof CoOwnerForm, v: string) =>
    setCoOwners((p) => p.map((c) => c.id === id ? { ...c, [k]: v } : c));

  const removeCoOwner = (id: string) =>
    setCoOwners((p) => p.filter((c) => c.id !== id));

  const applyCoOwnerAction = (action: CoOwnerAction) => {
    setCoOwnerAction(action);
    if (action === "keep") {
      setCoOwners(currentCoOwners.map((co) => ({
        id: Math.random().toString(36).slice(2),
        name: co.name, dob: co.dob, phone: co.phone,
        email: co.email, cccd: co.cccd,
        contactAddress: co.contactAddress,
      })));
    } else {
      setCoOwners([]);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!newOwner.name.trim()) errs.name = "Chủ sở hữu mới là bắt buộc";
    if (!newOwner.cccd.trim()) errs.cccd = "CCCD là bắt buộc";
    if (!effectiveDate) errs.effectiveDate = "Ngày hiệu lực là bắt buộc";
    if (!file) errs.file = "File chuyển nhượng là bắt buộc";
    if (newOwner.name.trim() && currentOwner && newOwner.name.trim() === currentOwner.name)
      errs.name = "Chủ sở hữu mới không được trùng với chủ sở hữu hiện tại";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    const log: TransferLog = {
      id: `CN-${String(transferNum).padStart(3, "0")}`,
      seq: transferNum,
      transferDate: effectiveDate
        ? new Date(effectiveDate).toLocaleDateString("vi")
        : new Date().toLocaleDateString("vi"),
      previousOwner: currentOwner ?? {
        name: contract.customer, dob: "", phone: contract.phone,
        email: contract.email, cccd: "", cccdDate: "", cccdPlace: "",
        permanentAddress: "", contactAddress: "",
      },
      newOwner: { ...newOwner },
      previousCoOwners: currentCoOwners,
      newCoOwners: coOwners.map((c) => ({
        name: c.name, dob: c.dob, phone: c.phone, email: c.email,
        cccd: c.cccd, cccdDate: "", cccdPlace: "",
        permanentAddress: "", contactAddress: c.contactAddress,
      })),
      file: file || "hop-dong-chuyen-nhuong.pdf",
      performedBy: "Hệ thống",
      note: note || undefined,
    };
    onSuccess(log);
    setSuccess(true);
  };

  const handleClose = () => {
    setStep(1); setNewOwner(emptyOwner); setCoOwners([]);
    setCoOwnerAction("replace");
    setEffectiveDate(""); setFile(""); setNote(""); setErrors({});
    setSuccess(false);
    onClose();
  };

  // ── Success state ──
  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 overflow-hidden" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Chuyển nhượng thành công</DialogTitle>
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-slate-900 mb-1">Chuyển nhượng hợp đồng thành công</h3>
            <p className="text-xs text-slate-500 mb-6">Lần chuyển nhượng #{transferNum} đã được ghi nhận</p>

            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2.5 mb-6">
              {[
                { label: "Chủ sở hữu cũ",   value: currentOwner?.name ?? contract.customer },
                { label: "Chủ sở hữu mới",  value: newOwner.name },
                { label: "Ngày chuyển nhượng", value: effectiveDate ? new Date(effectiveDate).toLocaleDateString("vi") : "—" },
                { label: "File chuyển nhượng", value: file || "hop-dong-chuyen-nhuong.pdf" },
                { label: "Người thực hiện", value: "Hệ thống" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-slate-400">{r.label}</span>
                  <span className="text-slate-800" style={{ fontWeight: 500 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleClose}>
              Quay lại chi tiết hợp đồng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col"
        aria-describedby={undefined}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-slate-900 mb-0.5">
                Chuyển nhượng hợp đồng
              </DialogTitle>
              <p className="text-xs text-slate-500">
                {contract.id} · Lần chuyển nhượng #{transferNum}
              </p>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 border-2 transition-all",
                    step > s.id  ? "bg-emerald-500 border-emerald-500 text-white" :
                    step === s.id ? "bg-slate-900 border-slate-900 text-white" :
                                    "bg-white border-slate-200 text-slate-400"
                  )} style={{ fontWeight: 700 }}>
                    {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                  </div>
                  <span className={cn("text-xs whitespace-nowrap hidden sm:block",
                    step === s.id ? "text-slate-900" : step > s.id ? "text-emerald-600" : "text-slate-400"
                  )} style={{ fontWeight: 500 }}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px mx-2", step > s.id ? "bg-emerald-300" : "bg-slate-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── STEP 1: Review current info ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Contract summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                  THÔNG TIN HỢP ĐỒNG
                </p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
                  <ReadField label="Mã hợp đồng" value={contract.id} />
                  <ReadField label="Dự án / Căn hộ" value={contract.property} />
                  <ReadField label="Trạng thái HĐ" value={contract.status} />
                  <ReadField label="Giá trị HĐ" value={`${contract.value} đ`} />
                  <ReadField label="Số lần CN" value={String(contract.transferCount ?? 0)} />
                  <ReadField label="Ngày ký" value={contract.date} />
                </div>
              </div>

              {/* Current ownership */}
              <OwnerReadCard owner={currentOwner} title="CHỦ SỞ HỮU HIỆN TẠI" />

              {currentCoOwners.length > 0 ? (
                currentCoOwners.map((co, i) => (
                  <OwnerReadCard key={i} owner={co} title={`ĐỒNG SỞ HỮU ${i + 1}`} />
                ))
              ) : (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>ĐỒNG SỞ HỮU HIỆN TẠI</p>
                  <p className="text-xs text-slate-400 italic">Không có đồng sở hữu</p>
                </div>
              )}

              {/* Info notice */}
              <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Các thông tin <strong>sản phẩm, giá, chiết khấu và tiến độ thanh toán</strong> sẽ được giữ nguyên.
                  Chỉ thông tin <strong>chủ sở hữu và đồng sở hữu</strong> được cập nhật sau khi xác nhận.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Enter new info ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Before / After layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left: read-only before */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-slate-500 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                    TRƯỚC CHUYỂN NHƯỢNG
                  </p>
                  <ReadField label="Chủ sở hữu" value={currentOwner?.name ?? contract.customer} />
                  <ReadField label="CCCD" value={currentOwner?.cccd} />
                  <ReadField label="Số điện thoại" value={currentOwner?.phone ?? contract.phone} />
                  <ReadField label="Email" value={currentOwner?.email ?? contract.email} />
                  <ReadField label="Địa chỉ liên hệ" value={currentOwner?.contactAddress} />
                  {currentCoOwners.length > 0 && (
                    <>
                      <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">Đồng sở hữu</p>
                      {currentCoOwners.map((co, i) => (
                        <ReadField key={i} label={`Đồng sở hữu ${i + 1}`} value={co.name} />
                      ))}
                    </>
                  )}
                </div>

                {/* Right: editable after */}
                <div className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-indigo-700 pb-2 border-b border-indigo-100" style={{ fontWeight: 600 }}>
                    SAU CHUYỂN NHƯỢNG
                  </p>
                  <FF label="Chủ sở hữu mới" required error={errors.name}>
                    <Input value={newOwner.name} onChange={(e) => updateOwner("name", e.target.value)} className="text-sm h-8" placeholder="Họ và tên đầy đủ" />
                  </FF>
                  <FF label="CCCD" required error={errors.cccd}>
                    <Input value={newOwner.cccd} onChange={(e) => updateOwner("cccd", e.target.value)} className="text-sm h-8" placeholder="12 chữ số" />
                  </FF>
                  <div className="grid grid-cols-2 gap-2">
                    <FF label="Ngày sinh">
                      <Input type="date" value={newOwner.dob} onChange={(e) => updateOwner("dob", e.target.value)} className="text-sm h-8" />
                    </FF>
                    <FF label="Ngày cấp CCCD">
                      <Input type="date" value={newOwner.cccdDate} onChange={(e) => updateOwner("cccdDate", e.target.value)} className="text-sm h-8" />
                    </FF>
                  </div>
                  <FF label="Số điện thoại">
                    <Input value={newOwner.phone} onChange={(e) => updateOwner("phone", e.target.value)} className="text-sm h-8" placeholder="09xx xxx xxx" />
                  </FF>
                  <FF label="Email">
                    <Input type="email" value={newOwner.email} onChange={(e) => updateOwner("email", e.target.value)} className="text-sm h-8" placeholder="email@example.com" />
                  </FF>
                  <FF label="Địa chỉ thường trú">
                    <Input value={newOwner.permanentAddress} onChange={(e) => updateOwner("permanentAddress", e.target.value)} className="text-sm h-8" />
                  </FF>
                  <FF label="Địa chỉ liên hệ">
                    <Input value={newOwner.contactAddress} onChange={(e) => updateOwner("contactAddress", e.target.value)} className="text-sm h-8" />
                  </FF>
                  <div className="grid grid-cols-2 gap-2">
                    <FF label="Số tài khoản">
                      <Input value={newOwner.bankAccount} onChange={(e) => updateOwner("bankAccount", e.target.value)} className="text-sm h-8" />
                    </FF>
                    <FF label="Ngân hàng">
                      <Input value={newOwner.bank} onChange={(e) => updateOwner("bank", e.target.value)} className="text-sm h-8" placeholder="Vietcombank" />
                    </FF>
                  </div>
                </div>
              </div>

              {/* Co-owners */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500" style={{ fontWeight: 600 }}>ĐỒNG SỞ HỮU MỚI</p>
                  {coOwnerAction !== "remove" && coOwners.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setCoOwners((p) => [...p, emptyCoOwner()])}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm đồng sở hữu
                    </button>
                  )}
                </div>

                {/* Action selector — only shown when current contract has co-owners */}
                {currentCoOwners.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {(
                      [
                        { id: "keep"    as CoOwnerAction, label: "Giữ nguyên đồng sở hữu cũ" },
                        { id: "replace" as CoOwnerAction, label: "Thay thế đồng sở hữu" },
                        { id: "remove"  as CoOwnerAction, label: "Bỏ đồng sở hữu" },
                      ] as const
                    ).map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => applyCoOwnerAction(id)}
                        className={cn(
                          "flex-1 py-1.5 px-2 rounded-lg border text-xs transition-all",
                          coOwnerAction === id
                            ? id === "remove"
                              ? "bg-red-50 border-red-300 text-red-700"
                              : "bg-indigo-50 border-indigo-300 text-indigo-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        )}
                        style={{ fontWeight: coOwnerAction === id ? 600 : 400 }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* "remove" mode — confirmation notice */}
                {coOwnerAction === "remove" ? (
                  <div className="border-2 border-dashed border-red-200 bg-red-50 rounded-xl py-4 text-center text-xs text-red-500">
                    Tất cả đồng sở hữu cũ sẽ bị xóa sau khi xác nhận chuyển nhượng
                  </div>
                ) : coOwners.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl py-4 text-center text-xs text-slate-400">
                    Không có đồng sở hữu — nhấn "Thêm đồng sở hữu" để bổ sung
                  </div>
                ) : null}

                <div className="space-y-3">
                  {coOwnerAction !== "remove" && coOwners.map((co, idx) => (
                    <div key={co.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Đồng sở hữu {idx + 1}</p>
                        <button onClick={() => removeCoOwner(co.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <FF label="Họ và tên" required>
                          <Input value={co.name} onChange={(e) => updateCoOwner(co.id, "name", e.target.value)} className="text-sm h-8" />
                        </FF>
                        <FF label="CCCD">
                          <Input value={co.cccd} onChange={(e) => updateCoOwner(co.id, "cccd", e.target.value)} className="text-sm h-8" />
                        </FF>
                        <FF label="Ngày sinh">
                          <Input type="date" value={co.dob} onChange={(e) => updateCoOwner(co.id, "dob", e.target.value)} className="text-sm h-8" />
                        </FF>
                        <FF label="Số điện thoại">
                          <Input value={co.phone} onChange={(e) => updateCoOwner(co.id, "phone", e.target.value)} className="text-sm h-8" />
                        </FF>
                        <FF label="Email">
                          <Input value={co.email} onChange={(e) => updateCoOwner(co.id, "email", e.target.value)} className="text-sm h-8" />
                        </FF>
                        <FF label="Địa chỉ liên hệ">
                          <Input value={co.contactAddress} onChange={(e) => updateCoOwner(co.id, "contactAddress", e.target.value)} className="text-sm h-8" />
                        </FF>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer documents */}
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                  HỒ SƠ CHUYỂN NHƯỢNG
                </p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <FF label="Ngày hiệu lực chuyển nhượng" required error={errors.effectiveDate}>
                    <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="text-sm h-8" />
                  </FF>
                  <div />
                </div>

                <FF label="File hợp đồng chuyển nhượng" required error={errors.file}>
                  <div
                    onClick={() => setFile("hop-dong-chuyen-nhuong.pdf")}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                      file
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-700" style={{ fontWeight: 500 }}>{file}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Kéo thả hoặc click để tải lên</p>
                        <p className="text-xs text-slate-400 mt-0.5">PDF, DOCX (tối đa 10MB)</p>
                      </>
                    )}
                  </div>
                </FF>

                <div className="mt-3">
                  <FF label="Ghi chú nội bộ">
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="text-sm resize-none"
                      placeholder="Ghi chú về lý do chuyển nhượng, điều kiện thỏa thuận..."
                    />
                  </FF>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Comparison table */}
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                  SO SÁNH TRƯỚC / SAU CHUYỂN NHƯỢNG
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-2.5 text-slate-500 w-1/4" style={{ fontWeight: 500 }}>Nội dung</th>
                        <th className="text-left px-4 py-2.5 text-slate-500 w-[37.5%]" style={{ fontWeight: 500 }}>Trước chuyển nhượng</th>
                        <th className="text-left px-4 py-2.5 text-slate-500 w-[37.5%]" style={{ fontWeight: 500 }}>Sau chuyển nhượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        {
                          label: "Chủ sở hữu",
                          before: currentOwner?.name ?? contract.customer,
                          after: newOwner.name,
                          changed: true,
                        },
                        {
                          label: "Đồng sở hữu",
                          before: currentCoOwners.length ? currentCoOwners.map((c) => c.name).join(", ") : "Không có",
                          after: coOwnerAction === "remove"
                            ? "Không có (đã xóa)"
                            : coOwners.length
                              ? coOwners.map((c) => c.name || "—").join(", ")
                              : "Không có",
                          changed: coOwnerAction === "keep" && coOwners.length === currentCoOwners.length ? false : true,
                        },
                        {
                          label: "Sản phẩm",
                          before: contract.property,
                          after: contract.property,
                          changed: false,
                        },
                        {
                          label: "Giá / chiết khấu",
                          before: `${contract.value} đ`,
                          after: `${contract.value} đ`,
                          changed: false,
                        },
                        {
                          label: "Tiến độ TT",
                          before: `${contract.payments.length} đợt`,
                          after: `${contract.payments.length} đợt`,
                          changed: false,
                        },
                        {
                          label: "File chuyển nhượng",
                          before: "—",
                          after: file || "hop-dong-chuyen-nhuong.pdf",
                          changed: true,
                        },
                      ].map((row) => (
                        <tr key={row.label} className={row.changed ? "bg-amber-50/40" : ""}>
                          <td className="px-4 py-2.5 text-slate-600" style={{ fontWeight: 500 }}>{row.label}</td>
                          <td className="px-4 py-2.5 text-slate-500">{row.before}</td>
                          <td className="px-4 py-2.5">
                            {row.changed ? (
                              <span className="text-slate-900" style={{ fontWeight: 500 }}>{row.after}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs">
                                <Shield className="w-3 h-3" />
                                Giữ nguyên
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Details summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <ReadField label="Ngày hiệu lực" value={effectiveDate ? new Date(effectiveDate).toLocaleDateString("vi") : "—"} />
                  <ReadField label="File đính kèm" value={file || "—"} />
                </div>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <ReadField label="Ghi chú" value={note || "Không có"} />
                  <ReadField label="Lần chuyển nhượng" value={`#${transferNum}`} />
                </div>
              </div>

              {/* Warning */}
              <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Sau khi xác nhận, <strong>chủ sở hữu mới</strong> sẽ trở thành chủ sở hữu hiện tại của hợp đồng.
                  Lịch sử chuyển nhượng sẽ được lưu lại và <strong>không bị ghi đè</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between shrink-0">
          {step === 1 ? (
            <Button variant="outline" size="sm" onClick={handleClose} className="text-sm">Hủy</Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 text-sm"
              onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Button>
          )}

          {step < 3 ? (
            <Button size="sm" className="gap-2 text-sm"
              onClick={() => {
                if (step === 2 && !validate()) return;
                setStep((s) => s + 1);
              }}>
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm"
              className="gap-2 text-sm bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirm}>
              <Check className="w-4 h-4" />
              Xác nhận chuyển nhượng
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
