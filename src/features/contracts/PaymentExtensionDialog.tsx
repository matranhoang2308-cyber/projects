import { useState } from "react";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Info,
  User,
  MessageSquare,
  BadgePercent,
  Banknote,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentRecord, PaymentExtension } from "@/data/mockDataHopDong";

// ─── Helpers ──────────────────────────────────────────────────────────────────
type InstStatus = "pending" | "paid" | "overdue";

function formatVND(val: string): string {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("vi-VN");
}

function parseVND(val: string): number {
  return parseInt(val.replace(/\D/g, ""), 10) || 0;
}

// ─── View Panel ───────────────────────────────────────────────────────────────
function ExtensionViewPanel({
  payment,
  extension,
}: {
  payment: PaymentRecord;
  extension: PaymentExtension;
}) {
  const [expanded, setExpanded] = useState(true);
  const paidCount = extension.installments.filter((i) => i.status === "paid").length;

  const instDotBg: Record<InstStatus, string> = {
    pending: "bg-slate-100 border-slate-300 text-slate-600",
    paid:    "bg-emerald-100 border-emerald-300 text-emerald-700",
    overdue: "bg-red-100 border-red-300 text-red-700",
  };
  const instColor: Record<InstStatus, string> = {
    pending: "text-slate-500",
    paid:    "text-emerald-600",
    overdue: "text-red-600",
  };
  const instLabel: Record<InstStatus, string> = {
    pending: "Chờ thanh toán",
    paid:    "Đã thanh toán",
    overdue: "Quá hạn",
  };

  return (
    <div className="space-y-4">
      {/* Header badge */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
          extension.hasPenalty ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
        }`}
      >
        {extension.hasPenalty
          ? <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          : <ShieldCheck  className="w-4 h-4 text-green-600 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs ${extension.hasPenalty ? "text-amber-800" : "text-green-800"}`}
            style={{ fontWeight: 600 }}
          >
            {extension.hasPenalty ? "Gia hạn có tính phí phạt" : "Gia hạn miễn phí phạt"}
          </p>
          <p className={`text-xs ${extension.hasPenalty ? "text-amber-600" : "text-green-600"}`}>
            Mã gia hạn: {extension.id}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
            extension.hasPenalty
              ? "bg-amber-100 border-amber-300 text-amber-700"
              : "bg-green-100 border-green-300 text-green-700"
          }`}
          style={{ fontWeight: 500 }}
        >
          {paidCount}/{extension.installments.length} đợt đã đóng
        </span>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: CalendarClock, label: "Ngày yêu cầu",   value: extension.requestDate  },
          { icon: CalendarClock, label: "Ngày duyệt",     value: extension.approvedDate },
          { icon: User,          label: "NV duyệt",       value: extension.approvedBy   },
          { icon: Banknote,      label: "Số tiền gốc",    value: `${payment.amount} đ`  },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="flex items-center gap-1 mb-0.5">
              <item.icon className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
            <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Penalty info */}
      {extension.hasPenalty && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BadgePercent className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs text-amber-700" style={{ fontWeight: 600 }}>Chi tiết phí phạt</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-amber-600">Lãi suất</p>
              <p className="text-xs text-amber-800" style={{ fontWeight: 600 }}>
                {extension.penaltyRate}%/{extension.penaltyUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Số {extension.penaltyUnit}</p>
              <p className="text-xs text-amber-800" style={{ fontWeight: 600 }}>
                {extension.penaltyDays} {extension.penaltyUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Tổng phạt</p>
              <p className="text-xs text-amber-800" style={{ fontWeight: 600 }}>
                {extension.penaltyAmount} đ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Lý do gia hạn</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">{extension.reason}</p>
      </div>

      {extension.note && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs text-blue-700" style={{ fontWeight: 600 }}>Ghi chú nội bộ</span>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">{extension.note}</p>
        </div>
      )}

      {/* Installment list */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>
              Lịch đóng tiền gia hạn ({extension.installments.length} đợt)
            </span>
          </div>
          {expanded
            ? <ChevronUp   className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </button>

        {expanded && (
          <div className="divide-y divide-slate-100">
            {extension.installments.map((inst) => {
              const s = inst.status as InstStatus;
              return (
                <div
                  key={inst.seq}
                  className={`flex items-center gap-3 px-3.5 py-2.5 ${inst.status === "paid" ? "bg-emerald-50/50" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs border ${instDotBg[s]}`}
                    style={{ fontWeight: 700 }}
                  >
                    {inst.seq}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>
                      {inst.amount} đ
                    </p>
                    <p className="text-xs text-slate-400">Hạn đóng: {inst.dueDate}</p>
                    {inst.paidDate && (
                      <p className="text-xs text-emerald-600">Đã nộp: {inst.paidDate}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${instColor[s]}`} style={{ fontWeight: 500 }}>
                    {s === "paid"    && <CheckCircle2 className="w-3 h-3" />}
                    {s === "pending" && <Clock        className="w-3 h-3" />}
                    {s === "overdue" && <XCircle      className="w-3 h-3" />}
                    {instLabel[s]}
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100">
              <span className="text-xs text-slate-500">Tổng tiền gia hạn</span>
              <span className="text-xs text-slate-800" style={{ fontWeight: 600 }}>
                {extension.installments
                  .reduce((s, i) => s + i.amountNum, 0)
                  .toLocaleString("vi-VN")}{" "}đ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Panel ─────────────────────────────────────────────────────────────
interface InstallmentForm {
  seq: number;
  amount: string;
  dueDate: string;
}

interface ExtensionForm {
  requestDate: string;
  approvedBy: string;
  hasPenalty: boolean;
  penaltyRate: string;
  penaltyUnit: "ngày" | "tháng";
  penaltyDays: string;
  reason: string;
  note: string;
  installments: InstallmentForm[];
}

const emptyForm: ExtensionForm = {
  requestDate: "",
  approvedBy:  "",
  hasPenalty:  false,
  penaltyRate: "",
  penaltyUnit: "ngày",
  penaltyDays: "",
  reason:      "",
  note:        "",
  installments: [{ seq: 1, amount: "", dueDate: "" }],
};

function ExtensionCreatePanel({
  payment,
  onSave,
  onCancel,
}: {
  payment: PaymentRecord;
  onSave: (ext: PaymentExtension) => void;
  onCancel: () => void;
}) {
  const [form, setForm]     = useState<ExtensionForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const originalAmount   = parseVND(payment.amount);
  const totalInstallments = form.installments.reduce((s, i) => s + parseVND(i.amount), 0);
  const isBalanced        = totalInstallments > 0 && totalInstallments === originalAmount;
  const diff              = originalAmount - totalInstallments;

  /* ── Installment helpers ── */
  function addInstallment() {
    setForm((f) => ({
      ...f,
      installments: [
        ...f.installments,
        { seq: f.installments.length + 1, amount: "", dueDate: "" },
      ],
    }));
  }

  function removeInstallment(idx: number) {
    setForm((f) => ({
      ...f,
      installments: f.installments
        .filter((_, i) => i !== idx)
        .map((inst, i) => ({ ...inst, seq: i + 1 })),
    }));
  }

  function updateInstallment(idx: number, field: "amount" | "dueDate", value: string) {
    setForm((f) => {
      const updated = [...f.installments];
      updated[idx] = {
        ...updated[idx],
        [field]: field === "amount" ? formatVND(value) : value,
      };
      return { ...f, installments: updated };
    });
  }

  /* ── Penalty calc ── */
  function calcPenalty(): string {
    if (!form.hasPenalty || !form.penaltyRate || !form.penaltyDays) return "—";
    const penalty = originalAmount * (parseFloat(form.penaltyRate) / 100) * parseInt(form.penaltyDays);
    return isNaN(penalty) ? "—" : penalty.toLocaleString("vi-VN") + " đ";
  }

  /* ── Validation ── */
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.requestDate)      errs.requestDate = "Vui lòng nhập ngày yêu cầu";
    if (!form.approvedBy.trim()) errs.approvedBy  = "Vui lòng nhập tên nhân viên";
    if (!form.reason.trim())    errs.reason      = "Vui lòng nhập lý do gia hạn";
    if (form.hasPenalty && !form.penaltyRate) errs.penaltyRate = "Nhập lãi suất phạt";
    if (form.hasPenalty && !form.penaltyDays) errs.penaltyDays = "Nhập số ngày/tháng";
    form.installments.forEach((inst, i) => {
      if (!inst.amount)  errs[`amt_${i}`] = "Nhập số tiền";
      if (!inst.dueDate) errs[`due_${i}`] = "Nhập ngày hạn";
    });
    if (!isBalanced && totalInstallments > 0) {
      errs.balance = `Chênh lệch ${Math.abs(diff).toLocaleString("vi-VN")} đ`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ── Save ── */
  function handleSave() {
    if (!validate()) return;

    const today = new Date();
    const pad   = (n: number) => String(n).padStart(2, "0");
    const approvedDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

    const penaltyAmtNum =
      form.hasPenalty && form.penaltyRate && form.penaltyDays
        ? originalAmount * (parseFloat(form.penaltyRate) / 100) * parseInt(form.penaltyDays)
        : undefined;

    const newExt: PaymentExtension = {
      id:           `GH-${Date.now().toString().slice(-3)}`,
      requestDate:  form.requestDate,
      approvedDate,
      approvedBy:   form.approvedBy,
      hasPenalty:   form.hasPenalty,
      penaltyRate:  form.hasPenalty ? parseFloat(form.penaltyRate) : undefined,
      penaltyUnit:  form.hasPenalty ? form.penaltyUnit              : undefined,
      penaltyDays:  form.hasPenalty ? parseInt(form.penaltyDays)    : undefined,
      penaltyAmount: penaltyAmtNum ? penaltyAmtNum.toLocaleString("vi-VN") : undefined,
      reason:        form.reason,
      note:          form.note || undefined,
      installments:  form.installments.map((inst) => ({
        seq:       inst.seq,
        amount:    inst.amount,
        amountNum: parseVND(inst.amount),
        dueDate:   inst.dueDate,
        paidDate:  null,
        status:    "pending" as const,
      })),
    };

    onSave(newExt);
  }

  return (
    <div className="space-y-4">
      {/* Overdue alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-red-700" style={{ fontWeight: 600 }}>Đợt thanh toán quá hạn</p>
          <p className="text-xs text-red-600">
            Đợt {payment.seq} · {payment.amount} đ · Hạn gốc: {payment.due}
          </p>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Ngày yêu cầu gia hạn *</Label>
          <Input
            type="date"
            className="h-8 text-xs"
            value={form.requestDate}
            onChange={(e) => setForm((f) => ({ ...f, requestDate: e.target.value }))}
          />
          {errors.requestDate && <p className="text-xs text-red-500">{errors.requestDate}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Nhân viên sale duyệt *</Label>
          <Input
            className="h-8 text-xs"
            placeholder="Nguyễn Thu Hà..."
            value={form.approvedBy}
            onChange={(e) => setForm((f) => ({ ...f, approvedBy: e.target.value }))}
          />
          {errors.approvedBy && <p className="text-xs text-red-500">{errors.approvedBy}</p>}
        </div>
      </div>

      {/* Penalty toggle */}
      <div
        className={`rounded-xl border p-3 space-y-3 transition-colors ${
          form.hasPenalty ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {form.hasPenalty
              ? <ShieldAlert className="w-4 h-4 text-amber-600" />
              : <ShieldCheck  className="w-4 h-4 text-green-600" />
            }
            <div>
              <p
                className={`text-xs ${form.hasPenalty ? "text-amber-800" : "text-green-800"}`}
                style={{ fontWeight: 600 }}
              >
                {form.hasPenalty ? "Tính phí phạt chậm thanh toán" : "Miễn phí phạt chậm thanh toán"}
              </p>
              <p className={`text-xs ${form.hasPenalty ? "text-amber-600" : "text-green-600"}`}>
                {form.hasPenalty
                  ? "Khách hàng phải đóng thêm phí phạt"
                  : "Gia hạn không tính thêm phí phạt"}
              </p>
            </div>
          </div>
          <Switch
            checked={form.hasPenalty}
            onCheckedChange={(v) => setForm((f) => ({ ...f, hasPenalty: v }))}
          />
        </div>

        {form.hasPenalty && (
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200">
            <div className="space-y-1">
              <Label className="text-xs text-amber-700">Lãi suất (%)</Label>
              <Input
                className="h-8 text-xs bg-white border-amber-300"
                placeholder="0.05"
                value={form.penaltyRate}
                onChange={(e) => setForm((f) => ({ ...f, penaltyRate: e.target.value }))}
              />
              {errors.penaltyRate && <p className="text-xs text-red-500">{errors.penaltyRate}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-amber-700">Đơn vị</Label>
              <Select
                value={form.penaltyUnit}
                onValueChange={(v) => setForm((f) => ({ ...f, penaltyUnit: v as "ngày" | "tháng" }))}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-amber-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngày">Ngày</SelectItem>
                  <SelectItem value="tháng">Tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-amber-700">Số {form.penaltyUnit}</Label>
              <Input
                className="h-8 text-xs bg-white border-amber-300"
                placeholder="10"
                value={form.penaltyDays}
                onChange={(e) => setForm((f) => ({ ...f, penaltyDays: e.target.value }))}
              />
              {errors.penaltyDays && <p className="text-xs text-red-500">{errors.penaltyDays}</p>}
            </div>

            {form.penaltyRate && form.penaltyDays && (
              <div className="col-span-3 bg-amber-100 border border-amber-300 rounded-lg px-3 py-1.5 flex items-center justify-between">
                <span className="text-xs text-amber-700">Tổng phí phạt ước tính:</span>
                <span className="text-xs text-amber-900" style={{ fontWeight: 700 }}>{calcPenalty()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reason */}
      <div className="space-y-1">
        <Label className="text-xs text-slate-600">Lý do gia hạn *</Label>
        <Textarea
          className="text-xs resize-none"
          rows={2}
          placeholder="Mô tả lý do khách hàng yêu cầu gia hạn thanh toán..."
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
        />
        {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
      </div>

      {/* Installments */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-slate-700" style={{ fontWeight: 600 }}>
            Lịch đóng tiền gia hạn *
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="h-6 gap-1 text-xs px-2"
            onClick={addInstallment}
          >
            <Plus className="w-3 h-3" />
            Thêm đợt
          </Button>
        </div>

        <div className="space-y-2">
          {form.installments.map((inst, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div
                className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-xs text-indigo-700 mt-1.5 shrink-0"
                style={{ fontWeight: 700 }}
              >
                {inst.seq}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Số tiền (đ)</Label>
                  <Input
                    className="h-7 text-xs"
                    placeholder="540,000,000"
                    value={inst.amount}
                    onChange={(e) => updateInstallment(idx, "amount", e.target.value)}
                  />
                  {errors[`amt_${idx}`] && (
                    <p className="text-xs text-red-500">{errors[`amt_${idx}`]}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Hạn đóng</Label>
                  <Input
                    type="date"
                    className="h-7 text-xs"
                    value={inst.dueDate}
                    onChange={(e) => updateInstallment(idx, "dueDate", e.target.value)}
                  />
                  {errors[`due_${idx}`] && (
                    <p className="text-xs text-red-500">{errors[`due_${idx}`]}</p>
                  )}
                </div>
              </div>
              {form.installments.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 mt-1 text-slate-400 hover:text-red-500"
                  onClick={() => removeInstallment(idx)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Balance check */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
            isBalanced
              ? "bg-emerald-50 border-emerald-200"
              : totalInstallments > 0
              ? "bg-red-50 border-red-200"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <span
            className={
              isBalanced
                ? "text-emerald-700"
                : totalInstallments > 0
                ? "text-red-700"
                : "text-slate-500"
            }
          >
            {isBalanced
              ? "✓ Tổng đợt khớp với số tiền gốc"
              : totalInstallments > 0
              ? `Tổng: ${totalInstallments.toLocaleString("vi-VN")} đ / Gốc: ${originalAmount.toLocaleString("vi-VN")} đ`
              : `Tổng các đợt phải bằng số tiền gốc: ${originalAmount.toLocaleString("vi-VN")} đ`}
          </span>
          {errors.balance && (
            <span className="text-red-600 shrink-0 ml-2" style={{ fontWeight: 500 }}>
              {errors.balance}
            </span>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1">
        <Label className="text-xs text-slate-600">Ghi chú nội bộ</Label>
        <Textarea
          className="text-xs resize-none"
          rows={2}
          placeholder="Ghi chú cho nhân viên nội bộ (không hiển thị với khách)..."
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1 text-xs h-8" onClick={onCancel}>
          Hủy bỏ
        </Button>
        <Button className="flex-1 text-xs h-8 gap-1.5" onClick={handleSave}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Lưu gia hạn
        </Button>
      </div>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
interface PaymentExtensionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentRecord | null;
  existingExtension?: PaymentExtension;
  onSave?: (extension: PaymentExtension) => void;
}

export function PaymentExtensionDialog({
  open,
  onOpenChange,
  payment,
  existingExtension,
  onSave,
}: PaymentExtensionDialogProps) {
  const [mode, setMode] = useState<"view" | "create">("view");

  function handleOpenChange(v: boolean) {
    if (!v) setMode("view");
    onOpenChange(v);
  }

  if (!payment) return null;

  const extension  = existingExtension ?? payment.extension;
  const showCreate = !extension || mode === "create";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="w-4 h-4 text-indigo-600" />
            {showCreate ? "Ghi nhận gia hạn thanh toán" : "Chi tiết gia hạn thanh toán"}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Đợt {payment.seq} · {payment.amount} đ · Hạn gốc: {payment.due}
          </p>
        </DialogHeader>

        {showCreate ? (
          <ExtensionCreatePanel
            payment={payment}
            onSave={(ext) => {
              onSave?.(ext);
              handleOpenChange(false);
            }}
            onCancel={() => {
              if (extension) setMode("view");
              else handleOpenChange(false);
            }}
          />
        ) : (
          <div className="space-y-4">
            <ExtensionViewPanel payment={payment} extension={extension!} />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={() => setMode("create")}
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm gia hạn mới
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
