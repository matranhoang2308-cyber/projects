import { useState, useCallback } from "react";
import {
  Download,
  Upload,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  CalendarClock,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  LayoutList,
  Table2,
  ArrowLeftRight,
  History,
  FileCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaymentExtensionDialog } from "./PaymentExtensionDialog";
import { ContractTableView } from "./ContractTableView";
import { ContractTransferDialog } from "./ContractTransferDialog";
import { buildTransferContractDetailSections } from "./transferContractDetailSchema";
import { TransferContractTableView } from "./TransferContractTableView";
import { TransferContractBlockView } from "./TransferContractBlockView";
import type { Contract, PaymentRecord, PaymentExtension, TransferLog } from "@/data/mockDataHopDong";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewTab = "detail" | "table";

function getInitialTab(): ViewTab {
  try {
    const saved = sessionStorage.getItem("contractDetailTab");
    if (saved === "table" || saved === "detail") return saved;
  } catch {}
  return "detail";
}

// ─── Config lookup maps ───────────────────────────────────────────────────────
const statusConfig: Record<string, string> = {
  "Đang ký":   "border-blue-300 bg-blue-50 text-blue-700 font-semibold shadow-sm",
  "Đã ký":     "border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-sm",
  "Công chứng": "border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold shadow-sm",
  "Đã hủy":   "border-red-300 bg-red-50 text-red-700 font-semibold shadow-sm",
};

type PayStatus  = "on-time" | "late" | "overdue" | "pending";
type InstStatus = "pending" | "paid" | "overdue";

const paymentLabel: Record<PayStatus, string> = {
  "on-time": "Đúng hạn",
  late:      "Trễ hạn",
  overdue:   "Quá hạn",
  pending:   "Chưa đến hạn",
};
const paymentColor: Record<PayStatus, string> = {
  "on-time": "text-emerald-700 font-semibold",
  late:      "text-amber-700 font-semibold",
  overdue:   "text-red-700 font-semibold",
  pending:   "text-slate-500 font-medium",
};
const paymentRowBg: Record<PayStatus, string> = {
  "on-time": "bg-transparent border-l-4 border-l-emerald-500 border border-slate-200 transition-all hover:bg-slate-50/50",
  late:      "bg-transparent border-l-4 border-l-amber-500 border border-slate-200 transition-all hover:bg-slate-50/50",
  overdue:   "bg-transparent border-l-4 border-l-red-500 border border-slate-200 transition-all hover:bg-slate-50/50",
  pending:   "bg-transparent border-l-4 border-l-slate-400 border border-slate-200 transition-all hover:bg-slate-50/50",
};
const instLabel: Record<InstStatus, string> = {
  pending: "Chờ đóng",
  paid:    "Đã đóng",
  overdue: "Quá hạn",
};
const instColor: Record<InstStatus, string> = {
  pending: "text-slate-500",
  paid:    "text-emerald-600",
  overdue: "text-red-600",
};
const instDotBg: Record<InstStatus, string> = {
  pending: "bg-slate-100 border-slate-300 text-slate-600",
  paid:    "bg-emerald-100 border-emerald-300 text-emerald-700",
  overdue: "bg-red-100 border-red-300 text-red-700",
};

// ─── View Toggle ──────────────────────────────────────────────────────────────
function ViewToggle({ active, onChange }: { active: ViewTab; onChange: (t: ViewTab) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      {(
        [
          { id: "detail" as ViewTab, icon: LayoutList, label: "Dạng chi tiết" },
          { id: "table"  as ViewTab, icon: Table2,     label: "Dạng bảng"    },
        ] as const
      ).map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
            active === id
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
          }`}
          style={{ fontWeight: active === id ? 600 : 400 }}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Extension Mini-Panel ─────────────────────────────────────────────────────
function ExtensionMiniPanel({
  extension,
  onViewDetail,
}: {
  extension: PaymentExtension;
  onViewDetail: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const paidCount  = extension.installments.filter((i) => i.status === "paid").length;
  const totalCount = extension.installments.length;

  const headerBg    = extension.hasPenalty ? "bg-amber-50 hover:bg-amber-100" : "bg-green-50 hover:bg-green-100";
  const borderColor = extension.hasPenalty ? "border-amber-200" : "border-green-200";
  const textMain    = extension.hasPenalty ? "text-amber-800" : "text-green-800";
  const badgeCls    = extension.hasPenalty
    ? "bg-amber-100 border-amber-300 text-amber-700"
    : "bg-green-100 border-green-300 text-green-700";

  return (
    <div className={`mt-2 rounded-lg border overflow-hidden ${borderColor}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${headerBg}`}
      >
        {extension.hasPenalty
          ? <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          : <ShieldCheck  className="w-3.5 h-3.5 shrink-0 text-green-600" />}
        <span className={`text-xs flex-1 ${textMain}`} style={{ fontWeight: 600 }}>
          {extension.hasPenalty ? "Gia hạn · Có phí phạt" : "Gia hạn · Miễn phí phạt"}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeCls}`} style={{ fontWeight: 500 }}>
          {paidCount}/{totalCount} đợt
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="bg-white">
          {extension.hasPenalty && extension.penaltyAmount && (
            <div className="px-2.5 py-1.5 border-b border-amber-100 flex items-center justify-between">
              <span className="text-xs text-amber-600">
                Phí phạt: {extension.penaltyRate}%/{extension.penaltyUnit} × {extension.penaltyDays} {extension.penaltyUnit}
              </span>
              <span className="text-xs text-amber-800" style={{ fontWeight: 600 }}>{extension.penaltyAmount} đ</span>
            </div>
          )}
          <div className="divide-y divide-slate-100">
            {extension.installments.map((inst) => {
              const s = inst.status as InstStatus;
              return (
                <div key={inst.seq} className="flex items-center gap-2 px-2.5 py-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 border ${instDotBg[s]}`}
                    style={{ fontWeight: 700, fontSize: "10px" }}
                  >
                    {inst.seq}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{inst.amount} đ</p>
                    <p className="text-xs text-slate-400">
                      Hạn: {inst.dueDate}
                      {inst.paidDate ? ` · Đã nộp: ${inst.paidDate}` : ""}
                    </p>
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
          </div>
          <div className={`px-2.5 py-1.5 border-t flex justify-end ${extension.hasPenalty ? "border-amber-100" : "border-green-100"}`}>
            <Button
              variant="ghost" size="sm"
              className="h-6 text-xs gap-1 px-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
              onClick={onViewDetail}
            >
              <CalendarClock className="w-3 h-3" />
              Xem chi tiết gia hạn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payment Row ──────────────────────────────────────────────────────────────
function PaymentRow({
  payment,
  contractId,
  localExtension,
  onExtensionSaved,
}: {
  payment: PaymentRecord;
  contractId: string;
  localExtension?: PaymentExtension;
  onExtensionSaved: (ext: PaymentExtension) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const effectiveExt = localExtension ?? payment.extension;
  const st = payment.status as PayStatus;

  return (
    <>
      <div className={`p-3 rounded-lg border ${paymentRowBg[st]}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-700" style={{ fontWeight: 500 }}>
              Đợt {payment.seq}: {payment.amount} đ
            </p>
            <p className="text-xs text-slate-400">Hạn: {payment.due}</p>
            {payment.paid && <p className="text-xs text-slate-400">Đã TT: {payment.paid}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {st === "overdue" && (
              <button
                onClick={() => setDialogOpen(true)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors ${
                  effectiveExt
                    ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    : "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                }`}
                style={{ fontWeight: 500 }}
              >
                <CalendarClock className="w-3 h-3" />
                {effectiveExt ? "Xem gia hạn" : "Ghi gia hạn"}
              </button>
            )}
            <div className={`flex items-center gap-1 text-xs ${paymentColor[st]}`} style={{ fontWeight: 500 }}>
              {st === "on-time" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {st === "late"    && <AlertCircle  className="w-3.5 h-3.5" />}
              {st === "overdue" && <XCircle      className="w-3.5 h-3.5" />}
              {st === "pending" && <Clock        className="w-3.5 h-3.5" />}
              {paymentLabel[st]}
            </div>
          </div>
        </div>

        {effectiveExt && (
          <ExtensionMiniPanel extension={effectiveExt} onViewDetail={() => setDialogOpen(true)} />
        )}

        {st === "overdue" && !effectiveExt && (
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-2 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50/60 hover:bg-orange-100/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="text-xs text-orange-700" style={{ fontWeight: 500 }}>
              Chưa có gia hạn — Nhấn để ghi nhận yêu cầu gia hạn
            </span>
          </button>
        )}
      </div>

      <PaymentExtensionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={payment}
        existingExtension={effectiveExt}
        onSave={onExtensionSaved}
      />
    </>
  );
}

// ─── Contract Detail Content ──────────────────────────────────────────────────
function ContractDetailContent({
  contract,
  onClose,
}: {
  contract: Contract;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ViewTab>(getInitialTab);
  const [localExtensions, setLocalExtensions] = useState<Record<string, PaymentExtension>>({});
  const [transferOpen, setTransferOpen] = useState(false);
  const [localOwner, setLocalOwner] = useState(contract.owner);
  const [localCoOwners, setLocalCoOwners] = useState(contract.coOwners ?? []);
  const [localTransferHistory, setLocalTransferHistory] = useState<TransferLog[]>(contract.transferHistory ?? []);
  const [localTransferCount, setLocalTransferCount] = useState(contract.transferCount ?? 0);

  const contractWithLocalState: Contract = {
    ...contract,
    owner: localOwner,
    coOwners: localCoOwners,
    transferHistory: localTransferHistory,
    transferCount: localTransferCount,
  };
  const sections = buildTransferContractDetailSections(contractWithLocalState);

  const switchTab = useCallback((t: ViewTab) => {
    setActiveTab(t);
    try { sessionStorage.setItem("contractDetailTab", t); } catch {}
  }, []);

  function handleExtensionSaved(paymentSeq: number, ext: PaymentExtension) {
    const key = `${contract.id}-seq${paymentSeq}`;
    setLocalExtensions((prev) => ({ ...prev, [key]: ext }));
  }

  function handleTransferSuccess(log: TransferLog) {
    setLocalOwner({
      name: log.newOwner.name, dob: log.newOwner.dob, phone: log.newOwner.phone,
      email: log.newOwner.email, cccd: log.newOwner.cccd, cccdDate: log.newOwner.cccdDate,
      cccdPlace: log.newOwner.cccdPlace, permanentAddress: log.newOwner.permanentAddress,
      contactAddress: log.newOwner.contactAddress, bankAccount: log.newOwner.bankAccount,
      bank: log.newOwner.bank, bankAccountName: log.newOwner.bankAccountName,
    });
    setLocalCoOwners(log.newCoOwners);
    setLocalTransferHistory((prev) => [...prev, log]);
    setLocalTransferCount((n) => n + 1);
  }

  const overdueCount   = contract.payments.filter((p) => p.status === "overdue").length;
  const extensionCount = contract.payments.filter(
    (p) => p.extension || localExtensions[`${contract.id}-seq${p.seq}`]
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header (always visible) ── */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-5 pt-4 pb-3 z-10 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-indigo-600 mb-0.5" style={{ fontWeight: 500 }}>{contract.id}</p>
            <h3 className="text-slate-900 leading-tight">{contract.customer}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {contract.date} · {contract.property}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${statusConfig[contract.status]}`}
              style={{ fontWeight: 500 }}
            >
              {contract.status}
            </span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-50 border-red-200 text-red-700 text-xs">
                <XCircle className="w-3 h-3" />
                {overdueCount} đợt quá hạn
              </span>
            )}
            {extensionCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-amber-50 border-amber-200 text-amber-700 text-xs">
                <CalendarClock className="w-3 h-3" />
                {extensionCount} đợt gia hạn
              </span>
            )}
          </div>
        </div>

        {/* ── Progress (always visible) ── */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <Progress value={contract.pct} className="h-1.5" />
          </div>
          <span className="text-xs text-slate-600 shrink-0" style={{ fontWeight: 500 }}>
            {contract.pct}%
          </span>
          <span className="text-xs text-slate-400 shrink-0">
            {contract.paid.toLocaleString()} / {contract.total.toLocaleString()} đ
          </span>
        </div>

        {/* ── View Toggle ── */}
        <ViewToggle active={activeTab} onChange={switchTab} />
      </div>

      {/* ── Tab content ── */}
      {activeTab === "table" ? (
        /* TABLE VIEW */
        <TransferContractTableView
          sections={sections}
          contract={contractWithLocalState}
        />
      ) : (
        /* DETAIL VIEW */
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: User,       label: "Nhân viên KD",  value: contract.salesperson },
              { icon: CreditCard, label: "Loại HĐ",       value: contract.type        },
              { icon: MapPin,     label: "Địa chỉ",       value: contract.address     },
              { icon: Phone,      label: "Điện thoại",    value: contract.phone       },
              { icon: Mail,       label: "Email",          value: contract.email       },
              { icon: CreditCard, label: "Giá trị HĐ",    value: `${contract.value} đ` },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
                <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Accordion */}
          <Accordion type="multiple" defaultValue={["payments", "docs"]}>
            {/* Payment stages */}
            <AccordionItem value="payments" className="border border-slate-200 rounded-xl px-4 mb-3">
              <AccordionTrigger className="text-sm py-3 text-slate-800 hover:no-underline">
                <div className="flex items-center gap-2 flex-wrap">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Giai đoạn thanh toán ({contract.payments.length} đợt)</span>
                  {overdueCount > 0 && (
                    <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full border border-red-200" style={{ fontWeight: 500 }}>
                      <AlertCircle className="w-3 h-3" />
                      {overdueCount} quá hạn
                    </span>
                  )}
                  {extensionCount > 0 && (
                    <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full border border-amber-200" style={{ fontWeight: 500 }}>
                      <CalendarClock className="w-3 h-3" />
                      {extensionCount} gia hạn
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                {contract.payments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Không có dữ liệu thanh toán</p>
                ) : (
                  <div className="space-y-2">
                    {contract.payments.map((p) => (
                      <PaymentRow
                        key={p.seq}
                        payment={p}
                        contractId={contract.id}
                        localExtension={localExtensions[`${contract.id}-seq${p.seq}`]}
                        onExtensionSaved={(ext) => handleExtensionSaved(p.seq, ext)}
                      />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Documents */}
            <AccordionItem value="docs" className="border border-slate-200 rounded-xl px-4">
              <AccordionTrigger className="text-sm py-3 text-slate-800 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  Tài liệu đính kèm ({contract.docs.length} file)
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  {contract.docs.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div>
                        <p className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{doc.name}</p>
                        <p className="text-xs text-slate-400">{doc.size} · {doc.date}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" />
                        Tải về
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs mt-1">
                    <Upload className="w-3.5 h-3.5" />
                    Tải lên tài liệu mới
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ── Schema Sections (Block View) ── */}
          <TransferContractBlockView sections={sections} />

          {/* ── Transfer history section ── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <History className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                Lịch sử chuyển nhượng
              </span>
              {localTransferHistory.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  {localTransferHistory.length}
                </span>
              )}
            </div>
            <div className="px-4 py-3">
              {localTransferHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Chưa có lịch sử chuyển nhượng</p>
              ) : (
                <div className="space-y-4">
                  {localTransferHistory.map((log) => (
                    <div key={log.id} className="relative pl-5">
                      {/* Timeline line */}
                      <div className="absolute left-1.5 top-3 bottom-0 w-px bg-slate-200" />
                      <div className="absolute left-0 top-2.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-1 ring-indigo-200" />

                      <div className="border border-slate-100 rounded-xl p-3 bg-white space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-indigo-700" style={{ fontWeight: 600 }}>
                            Lần chuyển nhượng #{log.seq}
                          </span>
                          <span className="text-xs text-slate-400">{log.transferDate}</span>
                        </div>

                        <div className="flex items-start gap-2 text-xs">
                          <div className="flex-1 bg-slate-50 rounded-lg p-2">
                            <p className="text-slate-400 mb-0.5">Chủ sở hữu cũ</p>
                            <p className="text-slate-800" style={{ fontWeight: 500 }}>{log.previousOwner.name}</p>
                            {log.previousCoOwners.length > 0 && (
                              <p className="text-slate-400 mt-1">ĐSH: {log.previousCoOwners.map(c => c.name).join(", ")}</p>
                            )}
                          </div>
                          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-3" />
                          <div className="flex-1 bg-indigo-50 rounded-lg p-2">
                            <p className="text-indigo-400 mb-0.5">Chủ sở hữu mới</p>
                            <p className="text-slate-800" style={{ fontWeight: 500 }}>{log.newOwner.name}</p>
                            {log.newCoOwners.length > 0 && (
                              <p className="text-slate-400 mt-1">ĐSH: {log.newCoOwners.map(c => c.name).join(", ")}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            {log.file}
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <User className="w-3 h-3" />
                            {log.performedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions – detail view */}
          <div className="flex gap-2 pt-1 pb-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm"
              size="sm"
              onClick={() => setTransferOpen(true)}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Chuyển nhượng HĐ
            </Button>
            <Button className="flex-1 gap-2 text-sm" size="sm">
              <Download className="w-4 h-4" />
              Xuất PDF
            </Button>
            <Button variant="outline" className="flex-1 gap-2 text-sm" size="sm">
              <Upload className="w-4 h-4" />
              Cập nhật
            </Button>
          </div>

          <ContractTransferDialog
            open={transferOpen}
            onClose={() => setTransferOpen(false)}
            contract={contractWithLocalState}
            onSuccess={handleTransferSuccess}
          />
        </div>
      )}
    </div>
  );
}

// ─── Public Sheet API ─────────────────────────────────────────────────────────
interface ContractDetailSheetProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "sheet" | "inline";
}

export function ContractDetailSheet({
  contract,
  open,
  onOpenChange,
  mode = "sheet",
}: ContractDetailSheetProps) {
  if (mode === "inline") {
    if (!contract) return null;
    return (
      <div className="overflow-y-auto max-h-[70vh]">
        <ContractDetailContent contract={contract} />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl p-0 flex flex-col h-full overflow-hidden"
        aria-describedby={undefined}
      >
        {contract && (
          <>
            <SheetTitle className="sr-only">Chi tiết hợp đồng {contract.id}</SheetTitle>
            <ContractDetailContent contract={contract} onClose={() => onOpenChange(false)} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
