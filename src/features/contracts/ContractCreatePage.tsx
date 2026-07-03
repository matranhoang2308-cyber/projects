import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { X, CheckCircle2, ChevronDown, LockKeyhole, Plus, Search, UserRound, Building2, UserPlus } from "lucide-react";
import { ALL_PAYMENT_METHODS, buildInstallments, getPaymentMethod } from "@/data/paymentMethods";
import { customers } from "@/data/mockDataHopDong";
import type { Customer } from "@/data/mockDataHopDong";
import { CustomerCreateDialog } from "@/features/customers/CustomerCreateDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { hdmbImportRecords, type HdmbRecord } from "@/data/hdmbImportSchema";

type CustomerType = "individual" | "business";
type Installment = { seq: number; pct: string; amount: string; dueDate: string; note: string };
type Person = {
  code: string; name: string; idNo: string; idDate: string; idPlace: string; dob: string;
  gender: string; phone: string; email: string; job: string; oldAddress: string; newAddress: string;
};
type FormState = {
  customerType: CustomerType; coOwnerCount: string; owner: Person; coOwner: Person;
  businessCustomerCode: string; businessName: string; businessLicense: string; taxCode: string; businessLicenseDate: string; businessLicensePlace: string;
  businessOldAddress: string; businessNewAddress: string; legalRepName: string; legalRepTitle: string; legalRepIdNo: string;
  legalRepIdDate: string; legalRepIdPlace: string; legalRepDob: string; legalRepGender: string; legalRepPhone: string; legalRepEmail: string;
  notifyReceiver: string; notifyPhone: string; notifyEmail: string; notifyOldAddress: string; notifyNewAddress: string;
  project: string; commercialCode: string; block: string; floor: string; legalCode: string; drawingType: string; bedrooms: string; bathrooms: string; view: string; handoverStatus: string; finishingPackage: string; carpetArea: string; netArea: string; gardenArea: string; otherArea: string; unitPrice: string; netPrice: string; bookingDerivedPrice: string; fitoutPrice: string;
  paymentDiscountPct: string; otherDiscountAmount: string; paymentDiscountAmount: string; wholesaleQty: string; wholesaleDiscountPct: string; wholesaleDiscountAmount: string; transferDepositDate: string; earlyQutPct: string; earlyQutAmount: string; transferDepositDiscountPct: string; transferDepositDiscountAmount: string; otherDiscountContent: string; otherDiscountPct: string; totalDiscountPct: string; totalDiscountAmount: string; vatPct: string; vatAmount: string; maintenancePct: string; maintenanceAmount: string; unitPriceAfterDiscountNoVatPbt: string; priceAfterDiscountNoVatPbt: string; unitPriceIncludeVat: string; priceIncludeVatPbt: string;
  depositDue: string; depositCollected: string; depositDate: string; depositPaidAmount: string; newDepositDate: string; newDepositAmount: string; cashAmount: string; transferAmount: string; expectedDepositDate: string; additionalDepositAmount: string; paymentMethod: string; bank: string; branch: string; accountNo: string; loanPct: string;
  hdmbRuleDate: string; hdmbExtendedDate: string; salesPerson: string; accountCode: string; salesUnit: string; depositAgreementNo: string; productInfoNo: string; xnckNo: string; note: string;
};

const steps = ["Khách hàng", "Bất động sản", "Điều khoản HĐ", "Thanh toán", "Hồ sơ xác nhận"];
const demoPerson: Person = {
  code: "Lâm Trà My", name: "Nguyễn Gia Bảo", idNo: "079093004215", idDate: "2025-09-23", idPlace: "Cục CSQLHC về TTXH", dob: "1993-09-23",
  gender: "Nam", phone: "090-987-6543", email: "giabao.nguyen@email.com", job: "Quản lý kinh doanh", oldAddress: "929 Hart St, Brooklyn, NY 11237", newAddress: "S1.05-12.08, Vinhomes Grand Park",
};
const initialState: FormState = {
  customerType: "individual", coOwnerCount: "1", owner: demoPerson, coOwner: demoPerson,
  businessCustomerCode: "DN-ANK-001", businessName: "Công ty TNHH An Khang Holdings", businessLicense: "0318294657", taxCode: "0318294657", businessLicenseDate: "2021-03-12", businessLicensePlace: "Sở KH&ĐT TP.HCM",
  businessOldAddress: "25 Nguyễn Cơ Thạch, TP. Thủ Đức", businessNewAddress: "Tầng 8, The Metropole, TP. Thủ Đức", legalRepName: "Trần Minh Quân", legalRepTitle: "Tổng giám đốc", legalRepIdNo: "079084009812",
  legalRepIdDate: "2024-05-18", legalRepIdPlace: "Cục CSQLHC về TTXH", legalRepDob: "1984-09-22", legalRepGender: "Nam", legalRepPhone: "091-228-8899", legalRepEmail: "minhquan@ankholdings.vn",
  notifyReceiver: "Lâm Trà My", notifyPhone: "090-987-6543", notifyEmail: "giabao.nguyen@email.com", notifyOldAddress: "929 Hart St, Brooklyn, NY 11237", notifyNewAddress: "S1.05-12.08, Vinhomes Grand Park",
  project: "Iki village", commercialCode: "S1.05-12.08", block: "Vitalis", floor: "08", legalCode: "", drawingType: "2PN + 1", bedrooms: "2", bathrooms: "2", view: "Sông + Công viên", handoverStatus: "", finishingPackage: "", carpetArea: "0", netArea: "0", gardenArea: "0", otherArea: "0", unitPrice: "45.200.000", netPrice: "3.254.400.000", bookingDerivedPrice: "2.570.392.888", fitoutPrice: "684.007.112",
  paymentDiscountPct: "3%", otherDiscountAmount: "16.272.000 VNĐ", paymentDiscountAmount: "97.632.000 VNĐ", wholesaleQty: "2 căn", wholesaleDiscountPct: "1%", wholesaleDiscountAmount: "32.544.000 VNĐ", transferDepositDate: "2026-02-15", earlyQutPct: "0,5%", earlyQutAmount: "16.272.000 VNĐ", transferDepositDiscountPct: "0,5%", transferDepositDiscountAmount: "16.272.000 VNĐ", otherDiscountContent: "Ưu đãi khách hàng thân thiết", otherDiscountPct: "0,5%", totalDiscountPct: "5,5%", totalDiscountAmount: "178.992.000 VNĐ", vatPct: "10%", vatAmount: "307.540.800 VNĐ", maintenancePct: "2%", maintenanceAmount: "61.508.160 VNĐ", unitPriceAfterDiscountNoVatPbt: "42.714.000 VNĐ", priceAfterDiscountNoVatPbt: "3.075.408.000 VNĐ", unitPriceIncludeVat: "46.985.400 VNĐ", priceIncludeVatPbt: "3.444.456.960 VNĐ",
  depositDue: "50.000.000 VNĐ", depositCollected: "50.000.000 VNĐ", depositDate: "2026-02-15", depositPaidAmount: "50.000.000 VNĐ", newDepositDate: "2026-02-20", newDepositAmount: "100.000.000 VNĐ", cashAmount: "0 VNĐ", transferAmount: "100.000.000 VNĐ", expectedDepositDate: "2026-02-28", additionalDepositAmount: "150.000.000 VNĐ", paymentMethod: "chuan", bank: "", branch: "", accountNo: "", loanPct: "",
  hdmbRuleDate: "2026-02-20", hdmbExtendedDate: "2026-02-20", salesPerson: "Lâm Trà My", accountCode: "ANK-LTM-024", salesUnit: "ANK Direct", depositAgreementNo: "TTC-2026-00128", productInfoNo: "PTTSP-S105-1208", xnckNo: "XNCK-2026-045", note: "",
};

const formInputClass = "h-10 text-sm";
const formSelectTriggerClass = "";
const formTextareaClass = "min-h-32 resize-none";
const formReadOnlyClass = "h-10 cursor-default bg-slate-50 text-sm text-slate-700";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className={cn("flex min-h-12 w-full items-center justify-between bg-slate-50/80 px-5 py-3 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400", isOpen && "border-b border-slate-100")}><h3 className="text-sm text-slate-950" style={{ fontWeight: 700 }}>{title}</h3><ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} /></button>{isOpen && <div className="p-5">{children}</div>}</section>;
}
function Field({ label, children, required = false, className = "" }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return <label className={cn("block space-y-2", className)}><span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>{required && <span className="text-red-500">* </span>}{label}</span>{children}</label>;
}
function TextBox({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={formInputClass} />;
}
function ReadOnlyBox({ value, type = "text" }: { value: string; type?: string }) {
  return <Input type={type} value={value} readOnly aria-readonly="true" className={formReadOnlyClass} />;
}
function toInputDate(value?: string) {
  if (!value) return "";
  const [day, month, year] = value.split("/");
  return year ? `${year}-${month}-${day}` : value;
}
function savedContractCustomers(): Customer[] {
  try { return JSON.parse(localStorage.getItem("contract-created-customers") ?? "[]"); } catch { return []; }
}
function CustomerCodeField({ value, onChange, onSelect, onCreate, label = "Mã khách hàng" }: { value: string; onChange: (value: string) => void; onSelect?: (customer: Customer) => void; onCreate?: () => Customer | null; label?: string }) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>(() => [...savedContractCustomers(), ...customers]);
  const expectedType = label.toLowerCase().includes("doanh nghiệp") ? "Doanh nghiệp" : "Cá nhân";
  const filteredCustomers = availableCustomers.filter((customer) => {
    const query = search.trim().toLowerCase();
    return customer.type === expectedType && (!query || [customer.id, customer.name, customer.phone, customer.email].some((item) => item.toLowerCase().includes(query)));
  });
  const selectCustomer = (customer: Customer) => {
    onChange(customer.id);
    onSelect?.(customer);
    if (customer.type === "Doanh nghiệp") window.dispatchEvent(new CustomEvent("contract-business-customer-selected", { detail: customer }));
    setOpen(false);
    setSearch("");
  };
  const createCustomer = () => {
    setOpen(false);
    setCreateOpen(true);
  };
  return <Field label={label}><div className="flex gap-2"><TextBox value={value} onChange={onChange} /><Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setOpen(true)} aria-label={`Chọn ${label.toLowerCase()}`} title={`Chọn ${label.toLowerCase()}`}><Plus className="h-4 w-4" /></Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl gap-0 overflow-hidden p-0"><DialogHeader className="border-b border-slate-200 px-6 py-5"><DialogTitle>Chọn khách hàng {expectedType.toLowerCase()}</DialogTitle><DialogDescription>Tìm và chọn khách hàng có sẵn để tự động điền thông tin.</DialogDescription></DialogHeader><div className="p-5"><div className="mb-4 flex gap-2"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã, tên, số điện thoại hoặc email..." className={`${formInputClass} pl-9`} /></div>{onCreate && <Button type="button" onClick={createCustomer} className="h-10 shrink-0 gap-2 bg-slate-950 px-4 text-white hover:bg-slate-800"><UserPlus className="h-4 w-4" />Thêm khách hàng</Button>}</div><div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">{filteredCustomers.map((customer) => <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">{customer.type === "Doanh nghiệp" ? <Building2 className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-slate-900">{customer.name}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{customer.id}</span></span><span className="mt-1 block truncate text-xs text-slate-500">{customer.phone} · {customer.email}</span></span><span className="text-xs font-semibold text-slate-700">Chọn</span></button>)}{filteredCustomers.length === 0 && <div className="py-10 text-center text-sm text-slate-500">Không tìm thấy khách hàng phù hợp.</div>}</div></div></DialogContent></Dialog><CustomerCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(customer) => { setAvailableCustomers((current) => [customer, ...current.filter((item) => item.id !== customer.id)]); selectCustomer(customer); }} /></Field>;
}
function PersonForm({ person, onChange }: { person: Person; onChange: (person: Person) => void }) {
  const set = (key: keyof Person, value: string) => onChange({ ...person, [key]: value });
  const selectCustomer = (customer: Customer) => onChange({ ...person, code: customer.id, name: customer.name, idNo: customer.cccd ?? "", idDate: toInputDate(customer.cccdDate), idPlace: customer.cccdPlace ?? "", dob: toInputDate(customer.dob), gender: customer.gender ?? "", phone: customer.phone, email: customer.email, job: customer.job ?? "", oldAddress: customer.oldAddress ?? customer.address, newAddress: customer.newAddress ?? customer.address });
  const createCustomer = (): Customer | null => person.name.trim() ? { id: `KH-${Date.now().toString().slice(-6)}`, name: person.name.trim(), phone: person.phone.trim(), email: person.email.trim(), address: person.newAddress.trim() || person.oldAddress.trim(), type: "Cá nhân", dob: person.dob ? person.dob.split("-").reverse().join("/") : undefined, cccd: person.idNo.trim() || undefined, joinDate: new Date().toLocaleDateString("vi-VN") } : null;
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <CustomerCodeField value={person.code} onChange={(v) => set("code", v)} onSelect={selectCustomer} onCreate={createCustomer} />
    <Field label="Họ và tên khách hàng"><TextBox value={person.name} onChange={(v) => set("name", v)} /></Field>
    <Field label="Số CCCD/HC"><TextBox value={person.idNo} onChange={(v) => set("idNo", v)} /></Field>
    <Field label="Ngày cấp"><TextBox type="date" value={person.idDate} onChange={(v) => set("idDate", v)} /></Field>
    <Field label="Cơ quan cấp"><TextBox value={person.idPlace} onChange={(v) => set("idPlace", v)} /></Field>
    <Field label="Ngày tháng năm sinh"><TextBox type="date" value={person.dob} onChange={(v) => set("dob", v)} /></Field>
    <Field label="Giới tính"><TextBox value={person.gender} onChange={(v) => set("gender", v)} /></Field>
    <Field label="Số điện thoại"><TextBox value={person.phone} onChange={(v) => set("phone", v)} /></Field>
    <Field label="Email"><TextBox value={person.email} onChange={(v) => set("email", v)} /></Field>
    <Field label="Nghề nghiệp"><TextBox value={person.job} onChange={(v) => set("job", v)} /></Field>
    <Field label="Địa chỉ thường trú cũ"><TextBox value={person.oldAddress} onChange={(v) => set("oldAddress", v)} /></Field>
    <Field label="Địa chỉ thường trú mới"><TextBox value={person.newAddress} onChange={(v) => set("newAddress", v)} /></Field>
  </div>;
}

function fromInputDate(value?: string) {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return value;
}

function recordToFormState(record: HdmbRecord): FormState {
  const v = record.values;
  const isBusiness = v.c108 === "Doanh nghiệp";

  const ownerPerson: Person = {
    code: v.c2 || "",
    name: v.c3 || "",
    idNo: v.c4 || v.c5 || "",
    idDate: toInputDate(v.c6),
    idPlace: v.c7 || "",
    dob: toInputDate(v.c8),
    gender: v.c9 || "",
    phone: v.c12 || v.c17 || "",
    email: v.c13 || v.c18 || "",
    job: v.c14 || "",
    oldAddress: v.c10 || v.c15 || "",
    newAddress: v.c11 || v.c16 || "",
  };

  const coOwnerPerson: Person = {
    code: "",
    name: v.c19 || "",
    idNo: v.c20 || "",
    idDate: toInputDate(v.c21),
    idPlace: v.c22 || "",
    dob: toInputDate(v.c23),
    gender: v.c24 || "",
    phone: v.c27 || "",
    email: v.c28 || "",
    job: v.c29 || "",
    oldAddress: v.c25 || "",
    newAddress: v.c26 || "",
  };

  return {
    customerType: isBusiness ? "business" : "individual",
    coOwnerCount: v.c19 ? "1" : "0",
    owner: ownerPerson,
    coOwner: coOwnerPerson,
    businessCustomerCode: isBusiness ? v.c2 || "" : "",
    businessName: isBusiness ? v.c3 || "" : "",
    businessLicense: isBusiness ? v.c4 || "" : "",
    taxCode: isBusiness ? v.c4 || "" : "",
    businessLicenseDate: isBusiness ? toInputDate(v.c6) : "",
    businessLicensePlace: isBusiness ? v.c7 || "" : "",
    businessOldAddress: isBusiness ? v.c10 || "" : "",
    businessNewAddress: isBusiness ? v.c11 || "" : "",
    legalRepName: isBusiness ? v.c3 || "" : "",
    legalRepTitle: isBusiness ? v.c14 || "" : "",
    legalRepIdNo: isBusiness ? v.c4 || "" : "",
    legalRepIdDate: isBusiness ? toInputDate(v.c6) : "",
    legalRepIdPlace: isBusiness ? v.c7 || "" : "",
    legalRepDob: isBusiness ? toInputDate(v.c8) : "",
    legalRepGender: isBusiness ? v.c9 || "" : "",
    legalRepPhone: isBusiness ? v.c12 || "" : "",
    legalRepEmail: isBusiness ? v.c13 || "" : "",
    notifyReceiver: v.c154 || "",
    notifyPhone: v.c12 || "",
    notifyEmail: v.c13 || "",
    notifyOldAddress: v.c10 || "",
    notifyNewAddress: v.c11 || "",
    project: v.c53 || "Iki village",
    commercialCode: v.c54 || "",
    block: v.c52 || "Vitalis",
    floor: v.c50 || "",
    legalCode: v.c51 || "",
    drawingType: v.c55 || "",
    bedrooms: v.c56 || "",
    bathrooms: v.c57 || "",
    view: v.c58 || "",
    handoverStatus: v.c59 || "",
    finishingPackage: v.c60 || "",
    carpetArea: v.c61 || "0",
    netArea: v.c62 || "0",
    gardenArea: v.c63 || "0",
    otherArea: v.c64 || "0",
    unitPrice: v.c87 || "",
    netPrice: v.c88 || "",
    bookingDerivedPrice: v.c89 || "",
    fitoutPrice: v.c90 || "",
    paymentDiscountPct: v.c70 || "",
    otherDiscountAmount: v.c71 || "",
    paymentDiscountAmount: v.c72 || "",
    wholesaleQty: v.c73 || "",
    wholesaleDiscountPct: v.c74 || "",
    wholesaleDiscountAmount: v.c75 || "",
    transferDepositDate: toInputDate(v.c76),
    earlyQutPct: v.c77 || "",
    transferDepositDiscountPct: v.c79 || "",
    transferDepositDiscountAmount: v.c80 || "",
    otherDiscountContent: v.c81 || "",
    otherDiscountPct: v.c82 || "",
    totalDiscountPct: v.c83 || "",
    totalDiscountAmount: v.c84 || "",
    vatPct: v.c85 || "",
    vatAmount: v.c86 || "",
    maintenancePct: v.c91 || "",
    maintenanceAmount: v.c92 || "",
    unitPriceAfterDiscountNoVatPbt: v.c93 || "",
    priceAfterDiscountNoVatPbt: v.c94 || "",
    unitPriceIncludeVat: v.c95 || "",
    priceIncludeVatPbt: v.c96 || "",
    depositDue: v.c97 || "",
    depositCollected: v.c98 || "",
    depositDate: toInputDate(v.c99),
    depositPaidAmount: v.c100 || "",
    newDepositDate: toInputDate(v.c101),
    newDepositAmount: v.c102 || "",
    cashAmount: v.c103 || "",
    transferAmount: v.c104 || "",
    expectedDepositDate: toInputDate(v.c105),
    additionalDepositAmount: v.c106 || "",
    paymentMethod: v.c69 || "chuan",
    bank: v.c107 || "",
    branch: v.c108 || "",
    accountNo: v.c109 || "",
    loanPct: v.c110 || "",
    hdmbRuleDate: toInputDate(v.c111),
    hdmbExtendedDate: toInputDate(v.c112),
    salesPerson: v.c154 || "",
    accountCode: v.c155 || "",
    salesUnit: v.c156 || "",
    depositAgreementNo: v.c157 || "",
    productInfoNo: v.c158 || "",
    xnckNo: v.c159 || "",
    note: v.c160 || "",
  };
}

function saveOverrides(recordId: string, form: FormState) {
  const overrides: Record<string, string> = {
    c2: form.customerType === "business" ? form.businessCustomerCode : form.owner.code,
    c3: form.customerType === "business" ? form.businessName : form.owner.name,
    c4: form.customerType === "business" ? form.legalRepIdNo : form.owner.idNo,
    c6: fromInputDate(form.customerType === "business" ? form.legalRepIdDate : form.owner.idDate),
    c7: form.customerType === "business" ? form.legalRepIdPlace : form.owner.idPlace,
    c8: fromInputDate(form.customerType === "business" ? form.legalRepDob : form.owner.dob),
    c9: form.customerType === "business" ? form.legalRepGender : form.owner.gender,
    c10: form.customerType === "business" ? form.businessOldAddress : form.owner.oldAddress,
    c11: form.customerType === "business" ? form.businessNewAddress : form.owner.newAddress,
    c12: form.customerType === "business" ? form.legalRepPhone : form.owner.phone,
    c13: form.customerType === "business" ? form.legalRepEmail : form.owner.email,
    c14: form.customerType === "business" ? form.legalRepTitle : form.owner.job,
    c19: form.coOwnerCount !== "0" ? form.coOwner.name : "",
    c20: form.coOwnerCount !== "0" ? form.coOwner.idNo : "",
    c21: fromInputDate(form.coOwnerCount !== "0" ? form.coOwner.idDate : ""),
    c22: form.coOwnerCount !== "0" ? form.coOwner.idPlace : "",
    c23: fromInputDate(form.coOwnerCount !== "0" ? form.coOwner.dob : ""),
    c24: form.coOwnerCount !== "0" ? form.coOwner.gender : "",
    c25: form.coOwnerCount !== "0" ? form.coOwner.oldAddress : "",
    c26: form.coOwnerCount !== "0" ? form.coOwner.newAddress : "",
    c27: form.coOwnerCount !== "0" ? form.coOwner.phone : "",
    c28: form.coOwnerCount !== "0" ? form.coOwner.email : "",
    c29: form.coOwnerCount !== "0" ? form.coOwner.job : "",
    c53: form.project,
    c54: form.commercialCode,
    c52: form.block,
    c50: form.floor,
    c51: form.legalCode,
    c55: form.drawingType,
    c56: form.bedrooms,
    c57: form.bathrooms,
    c58: form.view,
    c59: form.handoverStatus,
    c60: form.finishingPackage,
    c61: form.carpetArea,
    c62: form.netArea,
    c63: form.gardenArea,
    c64: form.otherArea,
    c87: form.unitPrice,
    c88: form.netPrice,
    c89: form.bookingDerivedPrice,
    c90: form.fitoutPrice,
    c70: form.paymentDiscountPct,
    c71: form.otherDiscountAmount,
    c72: form.paymentDiscountAmount,
    c73: form.wholesaleQty,
    c74: form.wholesaleDiscountPct,
    c75: form.wholesaleDiscountAmount,
    c76: fromInputDate(form.transferDepositDate),
    c77: form.earlyQutPct,
    c79: form.transferDepositDiscountPct,
    c80: form.transferDepositDiscountAmount,
    c81: form.otherDiscountContent,
    c82: form.otherDiscountPct,
    c83: form.totalDiscountPct,
    c84: form.totalDiscountAmount,
    c85: form.vatPct,
    c86: form.vatAmount,
    c91: form.maintenancePct,
    c92: form.maintenanceAmount,
    c93: form.unitPriceAfterDiscountNoVatPbt,
    c94: form.priceAfterDiscountNoVatPbt,
    c95: form.unitPriceIncludeVat,
    c96: form.priceIncludeVatPbt,
    c97: form.depositDue,
    c98: form.depositCollected,
    c99: fromInputDate(form.depositDate),
    c100: form.depositPaidAmount,
    c101: fromInputDate(form.newDepositDate),
    c102: form.newDepositAmount,
    c103: form.cashAmount,
    c104: form.transferAmount,
    c105: fromInputDate(form.expectedDepositDate),
    c106: form.additionalDepositAmount,
    c69: form.paymentMethod,
    c107: form.bank,
    c108: form.customerType === "business" ? "Doanh nghiệp" : "Cá nhân",
    c109: form.accountNo,
    c110: form.loanPct,
    c111: fromInputDate(form.hdmbRuleDate),
    c112: fromInputDate(form.hdmbExtendedDate),
    c154: form.salesPerson,
    c155: form.accountCode,
    c156: form.salesUnit,
    c157: form.depositAgreementNo,
    c158: form.productInfoNo,
    c159: form.xnckNo,
    c160: form.note,
  };

  const saved = localStorage.getItem("crm-contract-owner-overrides");
  let currentOverrides: Record<string, Record<string, string>> = {};
  try {
    if (saved) currentOverrides = JSON.parse(saved);
  } catch {}
  currentOverrides[recordId] = { ...(currentOverrides[recordId] ?? {}), ...overrides };
  localStorage.setItem("crm-contract-owner-overrides", JSON.stringify(currentOverrides));
}

export function ContractCreatePage({
  onClose,
  onSaved,
  editId: propEditId,
}: {
  onClose?: () => void;
  onSaved?: () => void;
  editId?: string;
} = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = propEditId || searchParams.get("edit");

  const record = useMemo(() => {
    if (!editId) return null;
    const base = hdmbImportRecords.find((r) => r.id === editId);
    if (!base) return null;
    const saved = localStorage.getItem("crm-contract-owner-overrides");
    let currentOverrides: Record<string, Record<string, string>> = {};
    try {
      if (saved) currentOverrides = JSON.parse(saved);
    } catch {}
    const overrides = currentOverrides[editId];
    if (!overrides) return base;
    return { ...base, values: { ...base.values, ...overrides } };
  }, [editId]);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(initialState);

  useEffect(() => {
    if (record) {
      setData(recordToFormState(record));
    }
  }, [record]);
  const method = getPaymentMethod(data.paymentMethod);
  const installments: Installment[] = useMemo(
    () => method ? buildInstallments(method, data.hdmbRuleDate, data.netPrice) : [],
    [method, data.hdmbRuleDate, data.netPrice],
  );
  const totalPct = useMemo(() => installments.reduce((sum, item) => sum + (parseFloat(item.pct) || 0), 0), [installments]);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setData((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    const handleBusinessCustomer = (event: Event) => {
      const customer = (event as CustomEvent<Customer>).detail;
      setData((prev) => ({ ...prev, businessCustomerCode: customer.id, businessName: customer.name, taxCode: customer.taxCode ?? "", legalRepName: customer.representative ?? "", legalRepPhone: customer.phone, legalRepEmail: customer.email, businessOldAddress: customer.address, businessNewAddress: customer.address }));
    };
    window.addEventListener("contract-business-customer-selected", handleBusinessCustomer);
    return () => window.removeEventListener("contract-business-customer-selected", handleBusinessCustomer);
  }, []);
  const updateMethod = (methodId: string) => {
    const next = getPaymentMethod(methodId);
    if (!next) return;
    setData((prev) => ({ ...prev, paymentMethod: methodId, loanPct: next.hasLoan && next.loanPct ? String(next.loanPct) : "" }));
  };

  return <div className="min-h-full bg-slate-50">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex w-full items-center gap-4">
        <div>
          <h1 id="create-contract-title" className="text-xl text-slate-950" style={{ fontWeight: 750 }}>
            {editId ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng"}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {editId ? `Chỉnh sửa thông tin hợp đồng ${editId}` : "Hoàn thiện thông tin theo 5 bước, dữ liệu được giữ lại khi chuyển bước."}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Đóng trang tạo hợp đồng" className="ml-auto h-10 w-10 text-slate-500" onClick={() => onClose ? onClose() : navigate("/contracts")}><X className="h-5 w-5" /></Button>
      </div>
    </header>

    <div className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex w-full items-center gap-3 overflow-x-auto">
        {steps.map((label, index) => {
          const no = index + 1; const done = step > no; const active = step === no;
          return <div key={label} className="flex flex-1 items-center gap-3 last:flex-none">
            <button type="button" aria-current={active ? "step" : undefined} disabled={!done && !active} onClick={() => done && setStep(no)} className={cn("inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400", active ? "border-slate-900 bg-slate-900 text-white" : done ? "border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300" : "cursor-default border-slate-200 bg-white text-slate-400")} style={{ fontWeight: 650 }}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-md text-xs", active ? "bg-white/15" : "bg-white")}>{no}</span>{label}{done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </button>
            {no < steps.length && <div className="h-px flex-1 border-t border-dashed border-slate-300" />}
          </div>;
        })}
      </div>
    </div>

    <section aria-labelledby="create-contract-title" className="w-full space-y-5 px-6 py-6 pb-8">
      {step === 1 && <>
        <Section title="1.1. Loại khách hàng"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Loại khách hàng" required><Select value={data.customerType} onValueChange={(v: CustomerType) => set("customerType", v)}><SelectTrigger className={formSelectTriggerClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="individual">Cá nhân</SelectItem><SelectItem value="business">Doanh nghiệp</SelectItem></SelectContent></Select></Field><Field label="Số lượng đồng sở hữu" required><Select value={data.coOwnerCount} onValueChange={(v) => set("coOwnerCount", v)}><SelectTrigger className={formSelectTriggerClass}><SelectValue placeholder="Chọn số lượng đồng sở hữu" /></SelectTrigger><SelectContent><SelectItem value="0">Không có</SelectItem><SelectItem value="1">1 đồng sở hữu</SelectItem><SelectItem value="2">2 đồng sở hữu</SelectItem><SelectItem value="3">3 đồng sở hữu</SelectItem></SelectContent></Select></Field></div></Section>
        {data.customerType === "individual" ? <Section title="1.2. Thông tin chủ sở hữu"><PersonForm person={data.owner} onChange={(owner) => set("owner", owner)} /></Section> : <Section title="1.3. Thông tin doanh nghiệp"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"><CustomerCodeField value={data.businessCustomerCode} onChange={(v) => set("businessCustomerCode", v)} label="Mã khách hàng doanh nghiệp" /><Field label="Pháp nhân/Tên công ty mua"><TextBox value={data.businessName} onChange={(v) => set("businessName", v)} /></Field><Field label="Giấy phép ĐKKD"><TextBox value={data.businessLicense} onChange={(v) => set("businessLicense", v)} /></Field><Field label="Mã số thuế"><TextBox value={data.taxCode} onChange={(v) => set("taxCode", v)} /></Field><Field label="Ngày cấp GP ĐKKD"><TextBox type="date" value={data.businessLicenseDate} onChange={(v) => set("businessLicenseDate", v)} /></Field><Field label="Cơ quan cấp"><TextBox value={data.businessLicensePlace} onChange={(v) => set("businessLicensePlace", v)} /></Field><Field label="Địa chỉ trụ sở cũ"><TextBox value={data.businessOldAddress} onChange={(v) => set("businessOldAddress", v)} /></Field><Field label="Địa chỉ trụ sở mới"><TextBox value={data.businessNewAddress} onChange={(v) => set("businessNewAddress", v)} /></Field><Field label="Người đại diện pháp luật"><TextBox value={data.legalRepName} onChange={(v) => set("legalRepName", v)} /></Field><Field label="Nghề nghiệp / chức vụ"><TextBox value={data.legalRepTitle} onChange={(v) => set("legalRepTitle", v)} /></Field><Field label="Số CCCD/HC đại diện"><TextBox value={data.legalRepIdNo} onChange={(v) => set("legalRepIdNo", v)} /></Field><Field label="Ngày cấp CCCD"><TextBox type="date" value={data.legalRepIdDate} onChange={(v) => set("legalRepIdDate", v)} /></Field><Field label="Cơ quan cấp CCCD"><TextBox value={data.legalRepIdPlace} onChange={(v) => set("legalRepIdPlace", v)} /></Field><Field label="Ngày tháng năm sinh"><TextBox type="date" value={data.legalRepDob} onChange={(v) => set("legalRepDob", v)} /></Field><Field label="Giới tính"><TextBox value={data.legalRepGender} onChange={(v) => set("legalRepGender", v)} /></Field><Field label="Số điện thoại"><TextBox value={data.legalRepPhone} onChange={(v) => set("legalRepPhone", v)} /></Field><Field label="Email"><TextBox value={data.legalRepEmail} onChange={(v) => set("legalRepEmail", v)} /></Field></div></Section>}
        {data.coOwnerCount !== "0" && <Section title={data.customerType === "business" ? "1.4. Thông tin đồng sở hữu" : "1.3. Thông tin đồng sở hữu"}><PersonForm person={data.coOwner} onChange={(coOwner) => set("coOwner", coOwner)} /></Section>}
        <Section title="1.4. Thông tin nhận thông báo"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Người nhận" className="md:col-span-2"><TextBox value={data.notifyReceiver} onChange={(v) => set("notifyReceiver", v)} /></Field><Field label="Số điện thoại nhận thông báo"><TextBox value={data.notifyPhone} onChange={(v) => set("notifyPhone", v)} /></Field><Field label="Email nhận thông báo"><TextBox value={data.notifyEmail} onChange={(v) => set("notifyEmail", v)} /></Field><Field label="Địa chỉ liên hệ cũ"><TextBox value={data.notifyOldAddress} onChange={(v) => set("notifyOldAddress", v)} /></Field><Field label="Địa chỉ liên hệ mới"><TextBox value={data.notifyNewAddress} onChange={(v) => set("notifyNewAddress", v)} /></Field></div></Section>
      </>}

      {step === 2 && <>
        <Section title="2.1. Thông tin bất động sản"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Dự án"><TextBox value={data.project} onChange={(v) => set("project", v)} placeholder="Chọn/nhập dự án" /></Field><Field label="Mã căn hộ thương mại"><TextBox value={data.commercialCode} onChange={(v) => set("commercialCode", v)} /></Field><Field label="Tháp / block"><TextBox value={data.block} onChange={(v) => set("block", v)} /></Field><Field label="Tầng"><TextBox value={data.floor} onChange={(v) => set("floor", v)} /></Field><Field label="Mã căn hộ pháp lý" className="md:col-span-2"><TextBox value={data.legalCode} onChange={(v) => set("legalCode", v)} placeholder="Nhập mã căn hộ pháp lý" /></Field></div></Section>
        <Section title="2.2. Đặc điểm căn hộ"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Loại căn hộ theo bản vẽ"><TextBox value={data.drawingType} onChange={(v) => set("drawingType", v)} /></Field><Field label="Số phòng ngủ"><TextBox value={data.bedrooms} onChange={(v) => set("bedrooms", v)} /></Field><Field label="Số nhà vệ sinh"><TextBox value={data.bathrooms} onChange={(v) => set("bathrooms", v)} /></Field><Field label="View"><TextBox value={data.view} onChange={(v) => set("view", v)} /></Field><Field label="Tình trạng bàn giao"><TextBox value={data.handoverStatus} onChange={(v) => set("handoverStatus", v)} placeholder="Chọn tình trạng bàn giao" /></Field><Field label="Gói hoàn thiện và nội thất"><TextBox value={data.finishingPackage} onChange={(v) => set("finishingPackage", v)} placeholder="Chọn gói hoàn thiện và nội thất" /></Field></div></Section>
        <Section title="2.3. Diện tích căn hộ"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Diện tích tim tường (m2)"><TextBox value={data.carpetArea} onChange={(v) => set("carpetArea", v)} /></Field><Field label="Diện tích thông thủy (m2)"><TextBox value={data.netArea} onChange={(v) => set("netArea", v)} /></Field><Field label="Diện tích sân vườn thêm"><TextBox value={data.gardenArea} onChange={(v) => set("gardenArea", v)} /></Field><Field label="Diện tích khác"><TextBox value={data.otherArea} onChange={(v) => set("otherArea", v)} /></Field></div></Section>
        <Section title="2.4. Giá trị căn hộ"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Đơn giá bán thuần (chưa VAT)"><TextBox value={data.unitPrice} onChange={(v) => set("unitPrice", v)} /></Field><Field label="Giá bán thuần (chưa VAT)"><TextBox value={data.netPrice} onChange={(v) => set("netPrice", v)} /></Field><Field label="Giá trị có được từ việc đặt mã căn hộ"><TextBox value={data.bookingDerivedPrice} onChange={(v) => set("bookingDerivedPrice", v)} /></Field><Field label="Giá bán thuần hoàn thiện/thô theo loại căn hộ chưa VAT"><TextBox value={data.fitoutPrice} onChange={(v) => set("fitoutPrice", v)} /></Field></div></Section>
      </>}

      {step === 3 && <>
        <Section title="3.1. Chính sách & chiết khấu áp dụng"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="CK thanh toán (%)"><TextBox value={data.paymentDiscountPct} onChange={(v) => set("paymentDiscountPct", v)} /></Field><Field label="CK khác (Số tiền)"><TextBox value={data.otherDiscountAmount} onChange={(v) => set("otherDiscountAmount", v)} /></Field><Field label="CK thanh toán (Số tiền)"><TextBox value={data.paymentDiscountAmount} onChange={(v) => set("paymentDiscountAmount", v)} /></Field><Field label="CK mua sỉ (Số lượng)"><TextBox value={data.wholesaleQty} onChange={(v) => set("wholesaleQty", v)} /></Field><Field label="CK mua sỉ (%)"><TextBox value={data.wholesaleDiscountPct} onChange={(v) => set("wholesaleDiscountPct", v)} /></Field><Field label="CK mua sỉ (Số tiền)"><TextBox value={data.wholesaleDiscountAmount} onChange={(v) => set("wholesaleDiscountAmount", v)} /></Field><Field label="Ngày chuyển cọc"><TextBox type="date" value={data.transferDepositDate} onChange={(v) => set("transferDepositDate", v)} /></Field><Field label="CK giữ QUT sớm (%)"><TextBox value={data.earlyQutPct} onChange={(v) => set("earlyQutPct", v)} /></Field><Field label="CK chuyển cọc (%)"><TextBox value={data.transferDepositDiscountPct} onChange={(v) => set("transferDepositDiscountPct", v)} /></Field><Field label="CK chuyển cọc (Số tiền)"><TextBox value={data.transferDepositDiscountAmount} onChange={(v) => set("transferDepositDiscountAmount", v)} /></Field><Field label="CK khác (Nội dung)"><TextBox value={data.otherDiscountContent} onChange={(v) => set("otherDiscountContent", v)} /></Field><Field label="CK khác (%)"><TextBox value={data.otherDiscountPct} onChange={(v) => set("otherDiscountPct", v)} /></Field></div></Section>
        <Section title="3.2. Tổng chiết khấu, thuế & phí"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Tổng chiết khấu (%)"><TextBox value={data.totalDiscountPct} onChange={(v) => set("totalDiscountPct", v)} /></Field><Field label="Tổng chiết khấu (Số tiền)"><TextBox value={data.totalDiscountAmount} onChange={(v) => set("totalDiscountAmount", v)} /></Field><Field label="Thuế GTGT (%)"><TextBox value={data.vatPct} onChange={(v) => set("vatPct", v)} /></Field><Field label="Thuế GTGT (Số tiền)"><TextBox value={data.vatAmount} onChange={(v) => set("vatAmount", v)} /></Field><Field label="Phí bảo trì (%)"><TextBox value={data.maintenancePct} onChange={(v) => set("maintenancePct", v)} /></Field><Field label="Phí bảo trì (Số tiền)"><TextBox value={data.maintenanceAmount} onChange={(v) => set("maintenanceAmount", v)} /></Field></div></Section>
        <Section title="3.3. Giá trị hợp đồng"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Đơn giá bán sau chiết khấu, chưa VAT và PBT"><TextBox value={data.unitPriceAfterDiscountNoVatPbt} onChange={(v) => set("unitPriceAfterDiscountNoVatPbt", v)} /></Field><Field label="Giá bán sau chiết khấu, chưa VAT và PBT"><TextBox value={data.priceAfterDiscountNoVatPbt} onChange={(v) => set("priceAfterDiscountNoVatPbt", v)} /></Field><Field label="Đơn giá bán căn hộ đã bao gồm VAT"><TextBox value={data.unitPriceIncludeVat} onChange={(v) => set("unitPriceIncludeVat", v)} /></Field><Field label="Giá bán căn hộ đã bao gồm VAT và PBT"><TextBox value={data.priceIncludeVatPbt} onChange={(v) => set("priceIncludeVatPbt", v)} /></Field></div></Section>
      </>}

      {step === 4 && <>
        <Section title="4.1. Thông tin cọc"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Tiền cọc phải thu"><TextBox value={data.depositDue} onChange={(v) => set("depositDue", v)} /></Field><Field label="Tiền cọc đã thu"><TextBox value={data.depositCollected} onChange={(v) => set("depositCollected", v)} /></Field><Field label="Ngày thanh toán cọc"><TextBox type="date" value={data.depositDate} onChange={(v) => set("depositDate", v)} /></Field><Field label="Số tiền cọc đã thanh toán"><TextBox value={data.depositPaidAmount} onChange={(v) => set("depositPaidAmount", v)} /></Field></div></Section>
        <Section title="4.2. Cọc mới / bổ sung"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Ngày thanh toán cọc mới"><TextBox type="date" value={data.newDepositDate} onChange={(v) => set("newDepositDate", v)} /></Field><Field label="Số tiền cọc mới"><TextBox value={data.newDepositAmount} onChange={(v) => set("newDepositAmount", v)} /></Field><Field label="Tiền mặt"><TextBox value={data.cashAmount} onChange={(v) => set("cashAmount", v)} /></Field><Field label="Chuyển khoản"><TextBox value={data.transferAmount} onChange={(v) => set("transferAmount", v)} /></Field><Field label="Ngày dự kiến bổ sung tiền cọc"><TextBox type="date" value={data.expectedDepositDate} onChange={(v) => set("expectedDepositDate", v)} /></Field><Field label="Số tiền cọc bổ sung"><TextBox value={data.additionalDepositAmount} onChange={(v) => set("additionalDepositAmount", v)} /></Field></div></Section>
        <Section title="4.3. Phương thức thanh toán">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p>Lịch thanh toán được áp dụng theo chính sách của loại đã chọn và không thể chỉnh sửa.</p>
            </div>
            <Field label="Loại thanh toán" className="w-full shrink-0 md:w-80">
              <Select value={data.paymentMethod} onValueChange={updateMethod}>
                <SelectTrigger className={formSelectTriggerClass}><SelectValue placeholder="Chọn loại thanh toán" /></SelectTrigger>
                <SelectContent className="w-[520px]">
                  <SelectGroup>
                    <SelectLabel>6 PTTT CHÍNH (HARMONIE / VITALIS)</SelectLabel>
                    {ALL_PAYMENT_METHODS.filter((m) => m.group === "main").map((m) => <SelectItem key={m.id} value={m.id}><div><p>{m.label}</p><p className="text-xs text-slate-400">{m.description}</p></div></SelectItem>)}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>THANH TOÁN SỚM / CAMPAIGN</SelectLabel>
                    {ALL_PAYMENT_METHODS.filter((m) => m.group === "early").map((m) => <SelectItem key={m.id} value={m.id}><div><p>{m.label}</p><p className="text-xs text-slate-400">{m.description}</p></div></SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {method?.hasLoan && <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 md:grid-cols-4"><Field label="Ngân hàng"><TextBox value={data.bank} onChange={(v) => set("bank", v)} /></Field><Field label="Chi nhánh"><TextBox value={data.branch} onChange={(v) => set("branch", v)} /></Field><Field label="Số tài khoản"><TextBox value={data.accountNo} onChange={(v) => set("accountNo", v)} /></Field><Field label="Tỷ lệ vay"><ReadOnlyBox value={data.loanPct} /></Field></div>}
          <div className="space-y-3">
            {installments.map((item) => <div key={item.seq} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">{item.seq}</span><div className="flex-1"><p className="text-sm text-slate-900" style={{ fontWeight: 650 }}>{item.note}</p><p className="mt-0.5 text-xs text-slate-400">Đợt thanh toán theo chính sách</p></div></div><div className="mt-3 grid grid-cols-1 gap-3 pl-11 md:grid-cols-3"><Field label="Tỷ lệ (%)"><ReadOnlyBox value={item.pct} /></Field><Field label="Số tiền"><ReadOnlyBox value={item.amount} /></Field><Field label="Ngày đến hạn"><ReadOnlyBox type="date" value={item.dueDate} /></Field></div></div>)}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">{installments.length} đợt theo loại {method?.label}</span><span className={Math.abs(totalPct - 100) < 0.01 ? "text-emerald-600" : "text-red-600"} style={{ fontWeight: 650 }}>Tổng tỷ lệ: {totalPct}%</span></div>
          </div>
        </Section>
      </>}

      {step === 5 && <>
        <Section title="5.1. Thông tin ký HĐMB"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Ngày ký HĐMB (theo quy định)"><TextBox type="date" value={data.hdmbRuleDate} onChange={(v) => set("hdmbRuleDate", v)} /></Field><Field label="Ngày ký HĐMB (gia hạn)"><TextBox type="date" value={data.hdmbExtendedDate} onChange={(v) => set("hdmbExtendedDate", v)} /></Field><Field label="Loại KH" className="md:col-span-2"><Select value={data.customerType} onValueChange={(v: CustomerType) => set("customerType", v)}><SelectTrigger className={formSelectTriggerClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="individual">Cá nhân</SelectItem><SelectItem value="business">Doanh nghiệp</SelectItem></SelectContent></Select></Field></div></Section>
        <Section title="5.2. Nhân viên / đơn vị bán hàng"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Nhân viên tư vấn"><Select value={data.salesPerson} onValueChange={(v) => set("salesPerson", v)}><SelectTrigger className={formSelectTriggerClass}><SelectValue /></SelectTrigger><SelectContent>{["Lâm Trà My", "Nguyễn Thu Hà", "Trần Minh Khoa"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field><Field label="Mã account"><TextBox value={data.accountCode} onChange={(v) => set("accountCode", v)} /></Field><Field label="Đơn vị bán hàng" className="md:col-span-2"><Select value={data.salesUnit} onValueChange={(v) => set("salesUnit", v)}><SelectTrigger className={formSelectTriggerClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ANK Direct">ANK Direct</SelectItem><SelectItem value="ANK Best Sales">ANK Best Sales</SelectItem></SelectContent></Select></Field></div></Section>
        <Section title="5.3. Chứng từ"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Số thỏa thuận cọc"><TextBox value={data.depositAgreementNo} onChange={(v) => set("depositAgreementNo", v)} /></Field><Field label="Số phiếu thông tin sản phẩm"><TextBox value={data.productInfoNo} onChange={(v) => set("productInfoNo", v)} /></Field><Field label="Số phiếu XNCK" className="md:col-span-2"><TextBox value={data.xnckNo} onChange={(v) => set("xnckNo", v)} /></Field><Field label="Ghi chú" className="md:col-span-2"><Textarea value={data.note} onChange={(e) => set("note", e.target.value)} placeholder="Textarea - Large" className={formTextareaClass} /></Field></div></Section>
      </>}
    </section>

    <footer className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Bước {step}/5 · {steps[step - 1]}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => step === 1 ? (onClose ? onClose() : navigate("/contracts")) : setStep((s) => s - 1)}>
            {step === 1 ? "Hủy" : "Quay lại"}
          </Button>
          {step < 5 ? (
            <Button className="bg-slate-950 hover:bg-slate-800" onClick={() => setStep((s) => s + 1)}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              className="bg-slate-950 hover:bg-slate-800"
              onClick={() => {
                if (editId) {
                  saveOverrides(editId, data);
                }
                if (onSaved) onSaved();
                else navigate("/contracts");
              }}
            >
              {editId ? "Lưu thay đổi" : "Hoàn thành"}
            </Button>
          )}
        </div>
      </div>
    </footer>
  </div>;
}
