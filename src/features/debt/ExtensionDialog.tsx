import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  CalendarClock,
  ShieldX,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  formatVND,
  type PaymentRecord,
  type PaymentExtension,
  type ExtensionInstallment,
  type ExtensionType,
} from "@/data/mockDataCongNo";

// ─── Form types ───────────────────────────────────────────────────────────────

interface InstallmentInput {
  id: string;
  dueDate: string;
  amount: string;
}

interface ExtensionForm {
  requestDate: string;
  approvedDate: string;
  approvedBy: string;
  type: ExtensionType;
  penaltyRatePercent: string;
  reason: string;
  notes: string;
  installments: InstallmentInput[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);

function buildDefaultForm(
  record: PaymentRecord,
  existing?: PaymentExtension
): ExtensionForm {
  if (existing) {
    return {
      requestDate: existing.requestDate,
      approvedDate: existing.approvedDate,
      approvedBy: existing.approvedBy,
      type: existing.type,
      penaltyRatePercent: String(existing.penaltyRatePercent),
      reason: existing.reason,
      notes: existing.notes ?? "",
      installments: existing.installments.map((i) => ({
        id: i.id,
        dueDate: i.dueDate,
        amount: Math.round(i.amount * 1000000000).toLocaleString("vi-VN"),
      })),
    };
  }
  return {
    requestDate: todayStr(),
    approvedDate: todayStr(),
    approvedBy: "",
    type: "with-penalty",
    penaltyRatePercent: "14",
    reason: "",
    notes: "",
    installments: [
      { id: `inst-${Date.now()}`, dueDate: "", amount: Math.round(record.baseAmount * 1000000000).toLocaleString("vi-VN") },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExtensionDialog({
  open,
  onClose,
  record,
  existing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  record: PaymentRecord;
  existing?: PaymentExtension;
  onSave: (ext: PaymentExtension) => void;
}) {
  const [form, setForm] = useState<ExtensionForm>(() =>
    buildDefaultForm(record, existing)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-initialize when dialog reopens or record changes
  useEffect(() => {
    if (open) {
      setForm(buildDefaultForm(record, existing));
      setErrors({});
    }
  }, [open, record.id]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const total = form.installments.reduce(
    (s, i) => {
      const cleanVal = parseFloat(i.amount.replace(/\D/g, "")) || 0;
      return s + cleanVal / 1000000000;
    },
    0
  );
  const amountsMatch = Math.abs(total - record.baseAmount) < 0.0005;
  const instCount = form.installments.length;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const updateInst = (id: string, field: "dueDate" | "amount", value: string) =>
    setForm((p) => ({
      ...p,
      installments: p.installments.map((i) => {
        if (i.id === id) {
          let updatedVal = value;
          if (field === "amount") {
            const clean = value.replace(/\D/g, "");
            updatedVal = clean ? parseInt(clean, 10).toLocaleString("vi-VN") : "";
          }
          return { ...i, [field]: updatedVal };
        }
        return i;
      }),
    }));

  const addInst = () =>
    setForm((p) => ({
      ...p,
      installments: [
        ...p.installments,
        { id: `inst-${Date.now()}`, dueDate: "", amount: "" },
      ],
    }));

  const removeInst = (id: string) => {
    if (form.installments.length <= 1) return;
    setForm((p) => ({
      ...p,
      installments: p.installments.filter((i) => i.id !== id),
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.approvedBy.trim()) errs.approvedBy = "Bắt buộc nhập tên nhân viên";
    if (!form.reason.trim()) errs.reason = "Bắt buộc nhập lý do gia hạn";
    if (!amountsMatch)
      errs.amounts = `Tổng đợt ${formatVND(total)} chưa khớp với số gốc ${formatVND(record.baseAmount)}`;
    form.installments.forEach((i, idx) => {
      if (!i.dueDate) errs[`date_${idx}`] = "Chưa chọn ngày";
      const cleanVal = parseFloat(i.amount.replace(/\D/g, "")) || 0;
      if (cleanVal <= 0)
        errs[`amount_${idx}`] = "Số tiền không hợp lệ";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const installments: ExtensionInstallment[] = form.installments.map(
      (i, idx) => ({
        id: i.id.startsWith("inst-")
          ? `ext-${record.id}-i${idx + 1}`
          : i.id,
        label:
          instCount === 1
            ? "Đợt gia hạn"
            : `Đợt gia hạn ${idx + 1}/${instCount}`,
        dueDate: i.dueDate,
        amount: (parseFloat(i.amount.replace(/\D/g, "")) || 0) / 1000000000,
        status: new Date(i.dueDate) < new Date() ? "overdue" : "upcoming",
      })
    );
    onSave({
      id: existing?.id ?? `ext-${record.id}-${Date.now()}`,
      requestDate: form.requestDate,
      approvedDate: form.approvedDate,
      approvedBy: form.approvedBy.trim(),
      type: form.type,
      penaltyRatePercent:
        form.type === "with-penalty"
          ? parseFloat(form.penaltyRatePercent) || 14
          : 0,
      reason: form.reason.trim(),
      notes: form.notes.trim() || undefined,
      installments,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* ── Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60">
          <DialogTitle className="text-sm text-foreground flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" />
            {existing ? "Sửa thông tin gia hạn" : "Thêm gia hạn thanh toán"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Nhập thông tin gia hạn và lịch thanh toán cho đợt quá hạn
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[78vh]">
          <div className="px-6 pt-5 pb-6 space-y-5">
            {/* ── Thông tin đợt gốc */}
            <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Đợt thanh toán cần gia hạn
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">{record.label}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Đến hạn:{" "}
                      <span className="text-red-600">
                        {new Date(record.dueDate).toLocaleDateString("vi-VN")}
                      </span>
                    </span>
                    {record.daysOverdue != null && (
                      <Badge className="text-[10px] border-red-200 bg-red-50 text-red-600 px-1.5 h-4">
                        Quá hạn {record.daysOverdue} ngày
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Số tiền gốc</p>
                  <p className="text-sm text-foreground">{formatVND(record.baseAmount)}</p>
                </div>
              </div>
            </div>

            {/* ── Section 1: Thông tin gia hạn */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Thông tin gia hạn
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Ngày yêu cầu</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={form.requestDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, requestDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ngày duyệt</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={form.approvedDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, approvedDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Nhân viên duyệt{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Tên nhân viên sale"
                    className={`h-8 text-xs ${errors.approvedBy ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                    value={form.approvedBy}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, approvedBy: e.target.value }))
                    }
                  />
                  {errors.approvedBy && (
                    <p className="text-[10px] text-red-500">{errors.approvedBy}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Lý do gia hạn <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Mô tả lý do khách hàng yêu cầu gia hạn..."
                  className={`text-xs min-h-[76px] resize-none ${errors.reason ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                  value={form.reason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reason: e.target.value }))
                  }
                />
                {errors.reason && (
                  <p className="text-[10px] text-red-500">{errors.reason}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Ghi chú nội bộ
                </Label>
                <Textarea
                  placeholder="Ghi chú riêng cho nhân viên (không hiển thị với khách hàng)..."
                  className="text-xs min-h-[56px] resize-none"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* ── Section 2: Loại gia hạn */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Loại gia hạn
              </p>

              <RadioGroup
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as ExtensionType }))
                }
                className="grid grid-cols-2 gap-3"
              >
                {/* Option: Có tính phí */}
                <Label
                  htmlFor="type-penalty"
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    form.type === "with-penalty"
                      ? "border-orange-300 bg-orange-50 shadow-sm"
                      : "border-border/60 hover:bg-accent/30"
                  }`}
                >
                  <RadioGroupItem
                    id="type-penalty"
                    value="with-penalty"
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ShieldX className="size-3.5 text-orange-500 shrink-0" />
                      <p className="text-sm text-foreground">Có tính phí phạt</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tính lãi phạt trên số ngày quá hạn theo hợp đồng
                    </p>
                  </div>
                </Label>

                {/* Option: Miễn phí */}
                <Label
                  htmlFor="type-no-penalty"
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    form.type === "no-penalty"
                      ? "border-emerald-300 bg-emerald-50 shadow-sm"
                      : "border-border/60 hover:bg-accent/30"
                  }`}
                >
                  <RadioGroupItem
                    id="type-no-penalty"
                    value="no-penalty"
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                      <p className="text-sm text-foreground">Miễn phí phạt</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Không tính lãi phạt (yêu cầu xác nhận BGĐ)
                    </p>
                  </div>
                </Label>
              </RadioGroup>

              {form.type === "with-penalty" && (
                <div className="flex items-center gap-2 pl-1">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">
                    Tỷ lệ phạt (%/năm):
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    className="h-7 text-xs w-20"
                    value={form.penaltyRatePercent}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, penaltyRatePercent: e.target.value }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">%/năm</span>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Section 3: Lịch thanh toán gia hạn */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Lịch thanh toán gia hạn
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 border-border/60"
                  onClick={addInst}
                >
                  <Plus className="size-3" />
                  Thêm đợt
                </Button>
              </div>

              <div className="rounded-lg border border-border/60 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[28px_1fr_148px_136px_36px] bg-muted/40 border-b border-border/60 px-3 py-2 gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">#</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Đợt</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Ngày đến hạn</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Số tiền (VND)</span>
                  <span />
                </div>

                {/* Rows */}
                {form.installments.map((inst, idx) => {
                  const label =
                    instCount === 1
                      ? "Đợt gia hạn"
                      : `Đợt ${idx + 1}/${instCount}`;
                  return (
                    <div
                      key={inst.id}
                      className={`grid grid-cols-[28px_1fr_148px_136px_36px] items-center px-3 py-2.5 gap-2 ${
                        idx > 0 ? "border-t border-border/40" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">{idx + 1}</span>
                      <span className="text-xs text-foreground truncate pr-1">{label}</span>
                      <Input
                        type="date"
                        className={`h-7 text-xs ${errors[`date_${idx}`] ? "border-red-400" : ""}`}
                        value={inst.dueDate}
                        onChange={(e) => updateInst(inst.id, "dueDate", e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="VD: 100.000.000"
                        className={`h-7 text-xs ${errors[`amount_${idx}`] ? "border-red-400" : ""}`}
                        value={inst.amount}
                        onChange={(e) => updateInst(inst.id, "amount", e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        disabled={instCount === 1}
                        onClick={() => removeInst(inst.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  );
                })}

                {/* Total row */}
                <div className="border-t border-border/60 bg-muted/20 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tổng</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${amountsMatch ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {formatVND(total)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {formatVND(record.baseAmount)} gốc
                    </span>
                    {amountsMatch ? (
                      <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-3.5 text-red-500 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {errors.amounts && (
                <p className="text-[11px] text-red-500">{errors.amounts}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border/60"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button size="sm" className="text-xs" onClick={handleSave}>
            {existing ? "Cập nhật gia hạn" : "Lưu gia hạn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
