import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BriefcaseBusiness, CreditCard, Mail, MapPin, Phone, UserRound, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/data/mockDataHopDong";

type Draft = {
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  country: string;
  cccd: string;
  address: string;
  job: string;
  source: string;
  customerStatus: string;
  lifestyle: string;
  customerGroup: string;
  hobbies: string;
  wellnessStyle: string;
  housingNeed: string;
  careNote: string;
};

const emptyDraft: Draft = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  country: "",
  cccd: "",
  address: "",
  job: "",
  source: "",
  customerStatus: "",
  lifestyle: "",
  customerGroup: "",
  hobbies: "",
  wellnessStyle: "",
  housingNeed: "",
  careNote: "",
};

const phonePattern = /^[0-9+\s().-]{9,16}$/;

function displayDate(value: string) {
  return value ? value.split("-").reverse().join("/") : "";
}

function toInputDate(value?: string) {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return value;
}

function FormField({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-semibold text-slate-700">
        {required && <span className="text-red-600">* </span>}
        {label}
      </span>
      {children}
      {error && <span role="alert" className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4">{children}</div>
    </section>
  );
}

function PreviewRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="mt-0.5 break-words font-medium text-slate-800">{value || "Chưa cập nhật"}</dd>
      </div>
    </div>
  );
}

export function CustomerCreateDialog({
  open,
  onOpenChange,
  onCreated,
  customerToEdit = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
  customerToEdit?: Customer | null;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        setDraft({
          name: customerToEdit.name || "",
          phone: customerToEdit.phone || "",
          email: customerToEdit.email || "",
          gender: customerToEdit.gender || "",
          dob: toInputDate(customerToEdit.dob),
          country: customerToEdit.country || "",
          cccd: customerToEdit.cccd || "",
          address: customerToEdit.address || "",
          job: customerToEdit.job || "",
          source: customerToEdit.source || "",
          customerStatus: customerToEdit.customerStatus || "",
          lifestyle: customerToEdit.lifestyle || "",
          customerGroup: customerToEdit.customerGroup || "",
          hobbies: customerToEdit.hobbies || "",
          wellnessStyle: customerToEdit.wellnessStyle || "",
          housingNeed: customerToEdit.housingNeed || "",
          careNote: customerToEdit.careNote || customerToEdit.note || "",
        });
      } else {
        setStep(1);
        setDraft(emptyDraft);
      }
      setErrors({});
    } else {
      setStep(1);
      setDraft(emptyDraft);
      setErrors({});
      setAvatarUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
    }
  }, [open, customerToEdit]);

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "Vui lòng nhập họ và tên.";
    if (!draft.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại.";
    if (draft.phone && !phonePattern.test(draft.phone.trim())) nextErrors.phone = "Số điện thoại chưa đúng định dạng.";
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = "Email chưa đúng định dạng.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  const saveCustomer = () => {
    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    const customer: Customer = {
      ...(customerToEdit ?? {}),
      id: customerToEdit ? customerToEdit.id : `KH-${Date.now().toString().slice(-6)}`,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      address: draft.address.trim(),
      type: customerToEdit ? customerToEdit.type : "Cá nhân",
      dob: displayDate(draft.dob),
      country: draft.country.trim(),
      cccd: draft.cccd.trim(),
      gender: draft.gender,
      job: draft.job.trim(),
      source: draft.source,
      customerStatus: draft.customerStatus,
      lifestyle: draft.lifestyle.trim(),
      customerGroup: draft.customerGroup,
      hobbies: draft.hobbies.trim(),
      wellnessStyle: draft.wellnessStyle.trim(),
      housingNeed: draft.housingNeed.trim(),
      careNote: draft.careNote.trim(),
      note: draft.careNote.trim(),
      oldAddress: draft.address.trim(),
      newAddress: draft.address.trim(),
      joinDate: customerToEdit ? customerToEdit.joinDate : new Date().toLocaleDateString("vi-VN"),
    };

    onCreated(customer);
    onOpenChange(false);
  };

  const inputClass = "h-10 border-slate-200 bg-white text-sm focus-visible:ring-slate-400";
  const selectTriggerClass = "h-10 border-slate-200 bg-white";
  const textareaClass = "min-h-24 resize-none border-slate-200 bg-white text-sm focus-visible:ring-slate-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="grid h-[min(760px,86vh)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-slate-200 p-0 shadow-xl"
        style={{ width: "min(1120px, calc(100vw - 48px))", maxWidth: "min(1120px, calc(100vw - 48px))" }}
      >
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-[28px] font-bold leading-9 text-slate-950">{customerToEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}</DialogTitle>
          <DialogDescription className="text-base text-slate-500">{customerToEdit ? "Chỉnh sửa hồ sơ khách hàng cá nhân đồng bộ với màn chi tiết khách hàng." : "Tạo hồ sơ khách hàng cá nhân đồng bộ với màn chi tiết khách hàng."}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-r border-slate-200 bg-slate-50/70 p-4 xl:p-5">
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400 xl:h-36">
              {avatarUrl ? <img src={avatarUrl} alt="Ảnh khách hàng đã chọn" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10" strokeWidth={1.5} />}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setAvatarUrl((current) => {
                  if (current) URL.revokeObjectURL(current);
                  return URL.createObjectURL(file);
                });
              }}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-3 h-10 w-full gap-2 border-slate-300 bg-white text-slate-800">
              <Upload className="h-4 w-4" />
              Chọn ảnh
            </Button>
            <p className="mt-2 text-center text-xs leading-4 text-slate-500">PNG, JPG hoặc WebP</p>

            <div className="mt-5 xl:mt-6">
              <p className="truncate text-base font-semibold text-slate-900 xl:text-lg">{draft.name || "Khách hàng mới"}</p>
              <p className="mt-1 text-xs text-slate-500">Hồ sơ cá nhân</p>
            </div>
            <dl className="mt-5 space-y-3.5 text-xs">
              <PreviewRow icon={<Phone className="h-4 w-4" />} label="Điện thoại" value={draft.phone} />
              <PreviewRow icon={<Mail className="h-4 w-4" />} label="Email" value={draft.email} />
              <PreviewRow icon={<CreditCard className="h-4 w-4" />} label="CCCD/Hộ chiếu" value={draft.cccd} />
              <PreviewRow icon={<MapPin className="h-4 w-4" />} label="Quốc gia" value={draft.country} />
            </dl>
          </aside>

          <div className="min-h-0 overflow-y-auto bg-slate-50 p-5">
            <div className="mb-5 flex items-center gap-3">
              {[
                { value: 1, label: "Thông tin cá nhân" },
                { value: 2, label: "Thông tin thêm" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-current={step === item.value ? "step" : undefined}
                  onClick={() => (item.value === 1 ? setStep(1) : nextStep())}
                  className={`flex h-10 min-w-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                    step === item.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-xs ${step === item.value ? "bg-white/15" : "bg-slate-100"}`}>{item.value}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <Section title="Thông tin cơ bản">
                  <FormField label="Họ và tên" required error={errors.name}>
                    <Input autoFocus value={draft.name} onChange={(event) => set("name", event.target.value)} placeholder="Nhập họ và tên" className={inputClass} />
                  </FormField>
                  <FormField label="Số điện thoại" required error={errors.phone}>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={draft.phone} onChange={(event) => set("phone", event.target.value)} placeholder="Nhập số điện thoại" className={`${inputClass} pl-9`} />
                    </div>
                  </FormField>
                  <FormField label="Email" error={errors.email}>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} placeholder="Nhập email" className={`${inputClass} pl-9`} />
                    </div>
                  </FormField>
                  <FormField label="Giới tính">
                    <Select value={draft.gender} onValueChange={(value) => set("gender", value)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Ngày sinh">
                    <Input type="date" value={draft.dob} onChange={(event) => set("dob", event.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Quốc gia">
                    <Input value={draft.country} onChange={(event) => set("country", event.target.value)} placeholder="Nhập quốc gia" className={inputClass} />
                  </FormField>
                </Section>

                <Section title="Giấy tờ & địa chỉ">
                  <FormField label="CCCD / Passport">
                    <Input value={draft.cccd} onChange={(event) => set("cccd", event.target.value)} placeholder="Nhập CCCD / Passport" className={inputClass} />
                  </FormField>
                  <FormField label="Địa chỉ">
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input value={draft.address} onChange={(event) => set("address", event.target.value)} placeholder="Nhập địa chỉ" className={`${inputClass} pl-9`} />
                    </div>
                  </FormField>
                </Section>

                <Section title="Thông tin CRM">
                  <FormField label="Nghề nghiệp">
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={draft.job} onChange={(event) => set("job", event.target.value)} placeholder="Nhập nghề nghiệp" className={`${inputClass} pl-9`} />
                    </div>
                  </FormField>
                  <FormField label="Nguồn khách hàng">
                    <Select value={draft.source} onValueChange={(value) => set("source", value)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chọn nguồn khách hàng" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Sự kiện">Sự kiện</SelectItem>
                        <SelectItem value="Đối tác">Đối tác</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Trạng thái khách hàng">
                    <Select value={draft.customerStatus} onValueChange={(value) => set("customerStatus", value)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chọn trạng thái khách hàng" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mới">Mới</SelectItem>
                        <SelectItem value="Đang chăm sóc">Đang chăm sóc</SelectItem>
                        <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                        <SelectItem value="Đã mua">Đã mua</SelectItem>
                        <SelectItem value="Không liên hệ được">Không liên hệ được</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </Section>
              </div>
            ) : (
              <div className="space-y-4">
                <Section title="Hồ sơ khách hàng">
                  <FormField label="Gu sống">
                    <Textarea value={draft.lifestyle} onChange={(event) => set("lifestyle", event.target.value)} placeholder="Mô tả phong cách sống, nhu cầu sinh hoạt, môi trường sống mong muốn" className={textareaClass} />
                  </FormField>
                  <FormField label="Nhóm khách hàng">
                    <Select value={draft.customerGroup} onValueChange={(value) => set("customerGroup", value)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chọn nhóm khách hàng" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nhà đầu tư">Nhà đầu tư</SelectItem>
                        <SelectItem value="An cư">An cư</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                        <SelectItem value="Khách cũ">Khách cũ</SelectItem>
                        <SelectItem value="Khách mới">Khách mới</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Sở thích">
                    <Input value={draft.hobbies} onChange={(event) => set("hobbies", event.target.value)} placeholder="Nhập sở thích" className={inputClass} />
                  </FormField>
                  <FormField label="Wellness / Living Style">
                    <Input value={draft.wellnessStyle} onChange={(event) => set("wellnessStyle", event.target.value)} placeholder="Nhập phong cách sống" className={inputClass} />
                  </FormField>
                  <FormField label="Nhu cầu đầu tư / an cư">
                    <Textarea value={draft.housingNeed} onChange={(event) => set("housingNeed", event.target.value)} placeholder="Mô tả nhu cầu bất động sản" className={textareaClass} />
                  </FormField>
                  <FormField label="Ghi chú CSKH">
                    <Textarea value={draft.careNote} onChange={(event) => set("careNote", event.target.value)} placeholder="Nhập ghi chú chăm sóc khách hàng" className={textareaClass} />
                  </FormField>
                </Section>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            Đóng
          </Button>
          {step === 1 ? (
            <Button type="button" onClick={nextStep} className="h-10 bg-slate-950 px-5 text-white hover:bg-slate-800">
              Tiếp theo
            </Button>
          ) : (
            <Button type="button" onClick={saveCustomer} className="h-10 bg-slate-950 px-5 text-white hover:bg-slate-800">
              Lưu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
