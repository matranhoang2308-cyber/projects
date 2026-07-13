import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, LeadStatus } from "./leadTypes";

const sourceOptions = [
  "Facebook",
  "Website",
  "Hotline",
  "Walk-in",
  "Giới thiệu",
  "Offline",
  "Khác"
];

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
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold text-slate-700">
        {required && <span className="text-red-600">* </span>}
        {label}
      </span>
      {children}
      {error && <span role="alert" className="block text-[11px] text-red-600 font-medium">{error}</span>}
    </label>
  );
}

export function LeadCreateDialog({
  open,
  onOpenChange,
  onCreated,
  leadToEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lead: Lead) => void;
  leadToEdit?: Lead | null;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [job, setJob] = useState("");
  const [source, setSource] = useState("Website");
  const [customSource, setCustomSource] = useState("");
  const [salesperson, setSalesperson] = useState("Nguyễn Văn A");
  const [customSalesperson, setCustomSalesperson] = useState("");
  const [careNote, setCareNote] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");
  const [bookingPaymentDate, setBookingPaymentDate] = useState("");
  const [bookingQueueNumber, setBookingQueueNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (leadToEdit) {
        setName(leadToEdit.name || "");
        setPhone(leadToEdit.phone || "");
        setEmail(leadToEdit.email || "");
        setGender(leadToEdit.gender || "");
        const dobParts = (leadToEdit.dob || "").split("/");
        const dobVal = dobParts.length === 3 ? `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}` : "";
        setDob(dobVal);
        setAddress(leadToEdit.address || "");
        setJob(leadToEdit.job || "");

        // Handle booking details
        setBookingAmount(leadToEdit.bookingAmount || "");
        const bpdParts = (leadToEdit.bookingPaymentDate || "").split("/");
        setBookingPaymentDate(bpdParts.length === 3 ? `${bpdParts[2]}-${bpdParts[1]}-${bpdParts[0]}` : "");
        setBookingQueueNumber(leadToEdit.bookingQueueNumber ? String(leadToEdit.bookingQueueNumber) : "");
        const bdParts = (leadToEdit.bookingDate || "").split("/");
        setBookingDate(bdParts.length === 3 ? `${bdParts[2]}-${bdParts[1]}-${bdParts[0]}` : "");

        // Handle source
        const standardSources = ["Facebook", "Website", "Hotline", "Walk-in", "Giới thiệu", "Offline"];
        if (standardSources.includes(leadToEdit.source)) {
          setSource(leadToEdit.source);
          setCustomSource("");
        } else {
          setSource("Khác");
          setCustomSource(leadToEdit.source || "");
        }

        // Handle salesperson
        const standardStaff = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"];
        if (standardStaff.includes(leadToEdit.salesperson)) {
          setSalesperson(leadToEdit.salesperson);
          setCustomSalesperson("");
        } else {
          setSalesperson("Khác (Tự nhập)");
          setCustomSalesperson(leadToEdit.salesperson || "");
        }

        setCareNote(leadToEdit.careNote || "");
        setErrors({});
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setGender("");
        setDob("");
        setAddress("");
        setJob("");
        setSource("Website");
        setCustomSource("");
        setSalesperson("Nguyễn Văn A");
        setCustomSalesperson("");
        setCareNote("");
        setBookingAmount("");
        setBookingPaymentDate("");
        setBookingQueueNumber("");
        setBookingDate("");
        setErrors({});
      }
    }
  }, [open, leadToEdit]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Họ và tên là bắt buộc";
    if (!phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (phone.trim() && !/^[0-9+\s().-]{9,16}$/.test(phone)) newErrors.phone = "Số điện thoại không hợp lệ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedDob = dob ? dob.split("-").reverse().join("/") : "";
    const formattedBookingPaymentDate = bookingPaymentDate ? bookingPaymentDate.split("-").reverse().join("/") : "";
    const formattedBookingDate = bookingDate ? bookingDate.split("-").reverse().join("/") : "";
    const createdDate = new Date();
    const formattedDate = `${String(createdDate.getDate()).padStart(2, "0")}/${String(createdDate.getMonth() + 1).padStart(2, "0")}/${createdDate.getFullYear()}`;

    const finalSource = source === "Khác" ? customSource.trim() || "Khác" : source;
    const finalSalesperson = salesperson === "Khác (Tự nhập)" ? customSalesperson.trim() || "Chưa gán" : salesperson;

    if (leadToEdit) {
      const updatedLead: Lead = {
        ...leadToEdit,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gender,
        dob: formattedDob,
        address: address.trim(),
        job: job.trim(),
        source: finalSource,
        salesperson: finalSalesperson,
        careNote: careNote.trim(),
        bookingAmount: bookingAmount.trim() || undefined,
        bookingPaymentDate: formattedBookingPaymentDate || undefined,
        bookingQueueNumber: bookingQueueNumber ? Number(bookingQueueNumber) : undefined,
        bookingDate: formattedBookingDate || undefined,
      };
      onCreated(updatedLead);
    } else {
      const newLead: Lead = {
        id: `LEAD-${Math.floor(Math.random() * 9000) + 1000}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gender,
        dob: formattedDob,
        address: address.trim(),
        job: job.trim(),
        source: finalSource,
        salesperson: finalSalesperson,
        status: "Lead mới" as LeadStatus,
        createDate: formattedDate,
        careNote: careNote.trim(),
        timeline: [
          { date: `10:00 ${formattedDate}`, type: "Hệ thống", content: "Tạo Lead thủ công mới" }
        ],
        chats: [],
        files: [],
        proposals: [],
        tasks: [],
        bookingAmount: bookingAmount.trim() || undefined,
        bookingPaymentDate: formattedBookingPaymentDate || undefined,
        bookingQueueNumber: bookingQueueNumber ? Number(bookingQueueNumber) : undefined,
        bookingDate: formattedBookingDate || undefined,
      };
      onCreated(newLead);
    }

    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setDob("");
    setAddress("");
    setJob("");
    setSource("Website");
    setCustomSource("");
    setSalesperson("Nguyễn Văn A");
    setCustomSalesperson("");
    setCareNote("");
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-base font-bold text-slate-900">
            {leadToEdit ? "Chỉnh sửa thông tin Lead" : "Thêm Lead mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {leadToEdit ? "Chỉnh sửa và cập nhật hồ sơ khách hàng tiềm năng." : "Nhập thông tin cơ bản để bắt đầu quy trình chăm sóc khách hàng tiềm năng."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Họ và tên" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="VD: Nguyễn Văn A"
                className="h-9 text-xs"
              />
            </FormField>
            <FormField label="Số điện thoại" required error={errors.phone}>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="VD: 0912345678"
                className="h-9 text-xs"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: email@example.com"
                className="h-9 text-xs"
              />
            </FormField>
            <FormField label="Ngày sinh">
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-9 text-xs"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Giới tính">
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Nguồn">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chọn nguồn Lead" /></SelectTrigger>
                <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                  {sourceOptions.map((src) => (
                    <SelectItem key={src} value={src}>{src}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {source === "Khác" && (
            <FormField label="Nhập nguồn khác" required>
              <Input
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder="Nhập nguồn phát sinh..."
                className="h-9 text-xs"
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nghề nghiệp">
              <Input
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="VD: Nhân viên văn phòng"
                className="h-9 text-xs"
              />
            </FormField>
            <FormField label="Người tạo">
              <Select value={salesperson} onValueChange={setSalesperson}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chọn người tạo" /></SelectTrigger>
                <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                  <SelectItem value="Nguyễn Văn A">Nguyễn Văn A</SelectItem>
                  <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
                  <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
                  <SelectItem value="Khác (Tự nhập)">Khác (Tự nhập)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {salesperson === "Khác (Tự nhập)" && (
            <FormField label="Nhập tên người tạo" required>
              <Input
                value={customSalesperson}
                onChange={(e) => setCustomSalesperson(e.target.value)}
                placeholder="Nhập họ tên người tạo..."
                className="h-9 text-xs"
              />
            </FormField>
          )}

          <FormField label="Địa chỉ">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 123 Nguyễn Huệ, Quận 1"
              className="h-9 text-xs"
            />
          </FormField>

          {leadToEdit?.status === "Đặt chỗ" && (
            <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Thông tin đặt chỗ</h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Số tiền đặt chỗ">
                  <Input
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                    placeholder="VD: 50,000,000"
                    className="h-9 text-xs bg-white"
                  />
                </FormField>
                <FormField label="Ngày thanh toán">
                  <Input
                    type="date"
                    value={bookingPaymentDate}
                    onChange={(e) => setBookingPaymentDate(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Số thứ tự (STT giữ chỗ)">
                  <Input
                    type="number"
                    value={bookingQueueNumber}
                    onChange={(e) => setBookingQueueNumber(e.target.value)}
                    placeholder="VD: 5"
                    className="h-9 text-xs bg-white"
                  />
                </FormField>
                <FormField label="Ngày đặt chỗ">
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </FormField>
              </div>
            </div>
          )}

          <FormField label="Ghi chú ban đầu">
            <Textarea
              value={careNote}
              onChange={(e) => setCareNote(e.target.value)}
              placeholder="VD: Quan tâm dự án The Sun Avenue, căn hộ shophouse..."
              className="min-h-20 text-xs resize-none"
            />
          </FormField>
        </div>

        <DialogFooter className="border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-xs">
            Hủy
          </Button>
          <Button type="button" onClick={handleSave} className="h-9 text-xs bg-slate-950 hover:bg-slate-800 text-white px-5">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
