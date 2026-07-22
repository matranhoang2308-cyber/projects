import { useState, useEffect, useRef } from "react";
import {
  X, ChevronRight, CheckCircle2, Phone, Mail, CreditCard, User, Upload, CalendarDays, MapPin, FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { CustomerBooking, HinhThucThanhToan, GioiTinh, TinhTrangDatCho } from "../types/booking";
import { fmtVndCurrency } from "./BookingDetailSheet";

interface BookingCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBookings: CustomerBooking[];
  onCreated: (booking: CustomerBooking) => void;
  bookingToEdit?: CustomerBooking | null;
}

const defaultDonViOptions = [
  "Đại lý Đất Xanh",
  "Đại lý Khải Hoàn Land",
  "Đại lý Sunland",
  "Đại lý ERA Vietnam",
];

export function BookingCreateDialog({
  open,
  onOpenChange,
  existingBookings,
  onCreated,
  bookingToEdit = null,
}: BookingCreateDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group A — Thông tin phiếu (11 fields)
  const [soPhieuGQUT, setSoPhieuGQUT] = useState("");
  const [ngayXacNhanGQUT, setNgayXacNhanGQUT] = useState(new Date().toISOString().split("T")[0]);
  const [ngayThanhToan, setNgayThanhToan] = useState("");
  const [sttUuTien, setSttUuTien] = useState("");
  const [tenKhachHang, setTenKhachHang] = useState("");
  const [phaiThu, setPhaiThu] = useState<number>(100000000);
  const [daThu, setDaThu] = useState<number>(100000000);
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState<HinhThucThanhToan>("CHUYEN_KHOAN");
  const [noiDung, setNoiDung] = useState("");

  // Group B — Phân phối (2 fields)
  const [donViPhanPhoi, setDonViPhanPhoi] = useState("Đại lý Đất Xanh");
  const [nvtv, setNvtv] = useState("");

  // Group C — Thông tin KH (12 fields)
  const [cmnd, setCmnd] = useState("");
  const [ngayCap, setNgayCap] = useState("");
  const [noiCap, setNoiCap] = useState("");
  const [diaChiThuongTruCu, setDiaChiThuongTruCu] = useState("");
  const [diaChiThuongTruMoi, setDiaChiThuongTruMoi] = useState("");
  const [diaChiLienHeCu, setDiaChiLienHeCu] = useState("");
  const [diaChiLienHeMoi, setDiaChiLienHeMoi] = useState("");
  const [gioiTinh, setGioiTinh] = useState<GioiTinh>("NAM");
  const [ngaySinh, setNgaySinh] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [moiQuanHe, setMoiQuanHe] = useState("Bản thân");

  // Group D — Trạng thái (1 field)
  const [tinhTrang, setTinhTrang] = useState<TinhTrangDatCho>("DAT_CHO");

  // Auto compute conBoSung
  const conBoSung = phaiThu - daThu;

  // Reset form or populate edit values when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setErrors({});

      if (bookingToEdit) {
        setSoPhieuGQUT(bookingToEdit.soPhieuGQUT || "");
        setSttUuTien(bookingToEdit.sttUuTien || "");
        setNgayXacNhanGQUT(bookingToEdit.ngayXacNhanGQUT || new Date().toISOString().split("T")[0]);
        setNgayThanhToan(bookingToEdit.ngayThanhToan || "");
        setTenKhachHang(bookingToEdit.tenKhachHang || "");
        setPhaiThu(bookingToEdit.phaiThu || 100000000);
        setDaThu(bookingToEdit.daThu || 100000000);
        setHinhThucThanhToan(bookingToEdit.hinhThucThanhToan || "CHUYEN_KHOAN");
        setNoiDung(bookingToEdit.noiDung || "");
        setDonViPhanPhoi(bookingToEdit.donViPhanPhoi || "Đại lý Đất Xanh");
        setNvtv(bookingToEdit.nvtv || "");
        setCmnd(bookingToEdit.cmnd || "");
        setNgayCap(bookingToEdit.ngayCap || "");
        setNoiCap(bookingToEdit.noiCap || "");
        setDiaChiThuongTruCu(bookingToEdit.diaChiThuongTruCu || "");
        setDiaChiThuongTruMoi(bookingToEdit.diaChiThuongTruMoi || "");
        setDiaChiLienHeCu(bookingToEdit.diaChiLienHeCu || "");
        setDiaChiLienHeMoi(bookingToEdit.diaChiLienHeMoi || "");
        setGioiTinh(bookingToEdit.gioiTinh || "NAM");
        setNgaySinh(bookingToEdit.ngaySinh || "");
        setSoDienThoai(bookingToEdit.soDienThoai || "");
        setEmail(bookingToEdit.email || "");
        setMoiQuanHe(bookingToEdit.moiQuanHe || "Bản thân");
        setTinhTrang(bookingToEdit.tinhTrang || "DAT_CHO");
      } else {
        const nextStt = existingBookings.length + 1;
        const sttStr = String(nextStt).padStart(3, "0");
        setSoPhieuGQUT(`${sttStr}/2025/GQUT`);
        setSttUuTien(sttStr);
        setNgayXacNhanGQUT(new Date().toISOString().split("T")[0]);
        setNgayThanhToan(new Date().toISOString().split("T")[0]);
        setTenKhachHang("");
        setPhaiThu(100000000);
        setDaThu(100000000);
        setHinhThucThanhToan("CHUYEN_KHOAN");
        setNoiDung("Đặt chỗ mua căn hộ dự án");
        setDonViPhanPhoi("Đại lý Đất Xanh");
        setNvtv("");
        setCmnd("");
        setNgayCap("");
        setNoiCap("");
        setDiaChiThuongTruCu("");
        setDiaChiThuongTruMoi("");
        setDiaChiLienHeCu("");
        setDiaChiLienHeMoi("");
        setGioiTinh("NAM");
        setNgaySinh("");
        setSoDienThoai("");
        setEmail("");
        setMoiQuanHe("Bản thân");
        setTinhTrang("DAT_CHO");
      }
    }
  }, [open, existingBookings.length, bookingToEdit]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!soPhieuGQUT.trim()) {
      errs.soPhieuGQUT = "Vui lòng nhập số phiếu GQUT";
    }
    if (!ngayXacNhanGQUT) errs.ngayXacNhanGQUT = "Vui lòng chọn ngày xác nhận";
    if (!sttUuTien.trim()) errs.sttUuTien = "Vui lòng nhập STT ưu tiên";
    if (!tenKhachHang.trim() || tenKhachHang.trim().length < 2) {
      errs.tenKhachHang = "Tên khách hàng phải từ 2 ký tự trở lên";
    }
    if (phaiThu <= 0) errs.phaiThu = "Phải thu phải lớn hơn 0";
    if (daThu < 0) errs.daThu = "Đã thu không được âm";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!donViPhanPhoi) errs.donViPhanPhoi = "Vui lòng chọn đơn vị phân phối";
    if (!nvtv.trim()) errs.nvtv = "Vui lòng nhập tên NVTV";
    if (!cmnd.trim()) {
      errs.cmnd = "Vui lòng nhập CMND/CCCD";
    } else if (!/^\d{9}$|^\d{12}$/.test(cmnd.trim())) {
      errs.cmnd = "CMND/CCCD phải gồm 9 hoặc 12 chữ số";
    }
    if (!soDienThoai.trim()) {
      errs.soDienThoai = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(soDienThoai.trim())) {
      errs.soDienThoai = "Số điện thoại không đúng định dạng VN (10 số)";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Email chưa đúng định dạng";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    const savedBooking: CustomerBooking = {
      id: bookingToEdit ? bookingToEdit.id : `BK-${String(existingBookings.length + 1).padStart(3, "0")}`,
      stt: bookingToEdit ? bookingToEdit.stt : existingBookings.length + 1,
      soPhieuGQUT: soPhieuGQUT.trim(),
      ngayXacNhanGQUT,
      ngayThanhToan: ngayThanhToan || null,
      sttUuTien: sttUuTien.trim(),
      tenKhachHang: tenKhachHang.trim(),
      phaiThu,
      daThu,
      conBoSung,
      hinhThucThanhToan,
      noiDung: noiDung.trim(),
      donViPhanPhoi,
      nvtv: nvtv.trim(),
      cmnd: cmnd.trim(),
      ngayCap: ngayCap || null,
      noiCap: noiCap.trim(),
      diaChiThuongTruCu: diaChiThuongTruCu.trim(),
      diaChiThuongTruMoi: diaChiThuongTruMoi.trim(),
      diaChiLienHeCu: diaChiLienHeCu.trim(),
      diaChiLienHeMoi: diaChiLienHeMoi.trim(),
      gioiTinh,
      ngaySinh: ngaySinh || null,
      soDienThoai: soDienThoai.trim(),
      email: email.trim(),
      moiQuanHe: moiQuanHe.trim() || "Bản thân",
      tinhTrang,
    };

    onCreated(savedBooking);
    if (bookingToEdit) {
      toast.success(`Đã cập nhật thành công phiếu ${savedBooking.soPhieuGQUT}`);
    } else {
      toast.success(`Đã tạo thành công phiếu ${savedBooking.soPhieuGQUT}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1280px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1280px] bg-white">
        {/* Header Bar */}
        <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-extrabold text-slate-950">
            {bookingToEdit ? `Chỉnh sửa phiếu ${bookingToEdit.soPhieuGQUT}` : "Thêm khách hàng đặt chỗ"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {bookingToEdit
              ? `Cập nhật hồ sơ thông tin phiếu đặt chỗ ${bookingToEdit.soPhieuGQUT}`
              : "Tạo hồ sơ khách hàng đặt chỗ đồng bộ với màn chi tiết khách hàng."}
          </DialogDescription>
        </DialogHeader>

        {/* 2-Column Body Layout matching CustomerCreateDialog */}
        <div className="flex flex-col md:flex-row min-h-0 flex-1 overflow-hidden bg-slate-50">
          {/* Left Sidebar Preview (280px) */}
          <aside className="w-full md:w-[280px] shrink-0 border-r border-slate-200 bg-white p-5 space-y-4 overflow-y-auto">
            {/* Image Selector Box */}
            <div className="aspect-[1.04] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <User className="w-12 h-12 stroke-1 opacity-60" />
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-9 rounded-xl border-slate-200 text-xs font-semibold gap-2 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Chọn ảnh</span>
            </Button>
            <p className="text-[11px] text-slate-400 text-center">PNG, JPG hoặc WebP</p>

            {/* Live Profile Preview Card */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-950 truncate">
                  {tenKhachHang.trim() || "Khách hàng mới"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Hồ sơ khách hàng đặt chỗ</p>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100 pt-1">
                <div className="flex gap-2.5 pt-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px]">Điện thoại</p>
                    <p className="font-medium text-slate-800 truncate">{soDienThoai || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px]">Email</p>
                    <p className="font-medium text-slate-800 truncate">{email || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px]">CCCD/Hộ chiếu</p>
                    <p className="font-medium text-slate-800 font-mono truncate">{cmnd || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-slate-400 text-[11px]">Quốc gia</p>
                    <p className="font-medium text-slate-800">Việt Nam</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Wizard Area */}
          <main className="flex-1 min-w-0 p-6 overflow-y-auto space-y-5 bg-slate-50">
            {/* Stepper Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${
                  step === 1
                    ? "bg-slate-950 text-white shadow-sm"
                    : step > 1
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  step === 1 ? "bg-white/20 text-white" : step > 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  1
                </span>
                <span>1. Thông tin phiếu</span>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(2); }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${
                  step === 2
                    ? "bg-slate-950 text-white shadow-sm"
                    : step > 2
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  step === 2 ? "bg-white/20 text-white" : step > 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  2
                </span>
                <span>2. Phân phối & KH</span>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

              <button
                type="button"
                onClick={() => { if (validateStep1() && validateStep2()) setStep(3); }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${
                  step === 3
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  step === 3 ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  3
                </span>
                <span>3. Trạng thái & Xác nhận</span>
              </button>
            </div>

            {/* Step Content Container */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              {/* Step 1: Thông tin phiếu (Group A Fields) */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Thông tin phiếu đặt chỗ
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Số phiếu GQUT <span className="text-red-500">*</span></Label>
                      <Input
                        value={soPhieuGQUT}
                        onChange={(e) => setSoPhieuGQUT(e.target.value)}
                        placeholder="VD: 001/2025/GQUT"
                        className="h-9 text-xs mt-1"
                      />
                      {errors.soPhieuGQUT && <p className="text-[11px] text-red-500 mt-0.5">{errors.soPhieuGQUT}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">STT ưu tiên <span className="text-red-500">*</span></Label>
                      <Input
                        value={sttUuTien}
                        onChange={(e) => setSttUuTien(e.target.value)}
                        placeholder="VD: 001"
                        className="h-9 text-xs mt-1"
                      />
                      {errors.sttUuTien && <p className="text-[11px] text-red-500 mt-0.5">{errors.sttUuTien}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Ngày xác nhận GQUT <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={ngayXacNhanGQUT}
                        onChange={(e) => setNgayXacNhanGQUT(e.target.value)}
                        className="h-9 text-xs mt-1"
                      />
                      {errors.ngayXacNhanGQUT && <p className="text-[11px] text-red-500 mt-0.5">{errors.ngayXacNhanGQUT}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Ngày thanh toán</Label>
                      <Input
                        type="date"
                        value={ngayThanhToan}
                        onChange={(e) => setNgayThanhToan(e.target.value)}
                        className="h-9 text-xs mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">Họ và tên khách hàng <span className="text-red-500">*</span></Label>
                      <Input
                        value={tenKhachHang}
                        onChange={(e) => setTenKhachHang(e.target.value)}
                        placeholder="Nhập họ và tên khách hàng"
                        className="h-9 text-xs mt-1"
                      />
                      {errors.tenKhachHang && <p className="text-[11px] text-red-500 mt-0.5">{errors.tenKhachHang}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Phải thu (VNĐ) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        value={phaiThu}
                        onChange={(e) => setPhaiThu(Number(e.target.value))}
                        className="h-9 text-xs mt-1"
                      />
                      {errors.phaiThu && <p className="text-[11px] text-red-500 mt-0.5">{errors.phaiThu}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Đã thu (VNĐ) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        value={daThu}
                        onChange={(e) => setDaThu(Number(e.target.value))}
                        className="h-9 text-xs mt-1"
                      />
                      {errors.daThu && <p className="text-[11px] text-red-500 mt-0.5">{errors.daThu}</p>}
                    </div>

                    <div className={`md:col-span-2 p-3 rounded-lg border flex items-center justify-between transition-all ${conBoSung > 0 ? "bg-red-50/50 border-red-100" : "bg-slate-50 border-slate-200"}`}>
                      <span className="text-xs font-semibold text-slate-700">Còn bổ sung (Phải thu - Đã thu):</span>
                      <span className={`text-sm ${conBoSung > 0 ? "font-extrabold text-red-600" : "font-bold text-slate-800"}`}>
                        {fmtVndCurrency(conBoSung)}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700 block mb-2">Hình thức thanh toán <span className="text-red-500">*</span></Label>
                      <RadioGroup
                        value={hinhThucThanhToan}
                        onValueChange={(val) => setHinhThucThanhToan(val as HinhThucThanhToan)}
                        className="flex items-center gap-3"
                      >
                        <label htmlFor="r-ck" className={`flex items-center space-x-2.5 border px-3.5 py-2 rounded-xl cursor-pointer transition-all ${hinhThucThanhToan === "CHUYEN_KHOAN" ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                          <RadioGroupItem value="CHUYEN_KHOAN" id="r-ck" />
                          <span className="text-xs font-semibold text-slate-900 cursor-pointer">Chuyển khoản</span>
                        </label>
                        <label htmlFor="r-tm" className={`flex items-center space-x-2.5 border px-3.5 py-2 rounded-xl cursor-pointer transition-all ${hinhThucThanhToan === "TIEN_MAT" ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                          <RadioGroupItem value="TIEN_MAT" id="r-tm" />
                          <span className="text-xs font-semibold text-slate-900 cursor-pointer">Tiền mặt</span>
                        </label>
                      </RadioGroup>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">Nội dung đặt chỗ</Label>
                      <Textarea
                        value={noiDung}
                        onChange={(e) => setNoiDung(e.target.value)}
                        maxLength={300}
                        placeholder="Nhập ghi chú nội dung đặt chỗ..."
                        className="min-h-[70px] text-xs resize-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Phân phối & KH (Group B & C Fields) */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Fieldset Phân phối */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-700">1. Thông tin phân phối</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Đơn vị phân phối <span className="text-red-500">*</span></Label>
                        <Select value={donViPhanPhoi} onValueChange={setDonViPhanPhoi}>
                          <SelectTrigger className="h-9 text-xs bg-white mt-1">
                            <SelectValue placeholder="Chọn đại lý phân phối" />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultDonViOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.donViPhanPhoi && <p className="text-[11px] text-red-500 mt-0.5">{errors.donViPhanPhoi}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">NVTV <span className="text-red-500">*</span></Label>
                        <Input
                          value={nvtv}
                          onChange={(e) => setNvtv(e.target.value)}
                          placeholder="Nhập tên nhân viên tư vấn"
                          className="h-9 text-xs bg-white mt-1"
                        />
                        {errors.nvtv && <p className="text-[11px] text-red-500 mt-0.5">{errors.nvtv}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Fieldset Thông tin cá nhân */}
                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-700">2. Thông tin khách hàng</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">CMND / CCCD <span className="text-red-500">*</span></Label>
                        <Input
                          value={cmnd}
                          onChange={(e) => setCmnd(e.target.value)}
                          placeholder="9 hoặc 12 chữ số"
                          className="h-9 text-xs bg-white mt-1 font-mono"
                        />
                        {errors.cmnd && <p className="text-[11px] text-red-500 mt-0.5">{errors.cmnd}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input
                          value={soDienThoai}
                          onChange={(e) => setSoDienThoai(e.target.value)}
                          placeholder="VD: 0903123456"
                          className="h-9 text-xs bg-white mt-1 font-mono"
                        />
                        {errors.soDienThoai && <p className="text-[11px] text-red-500 mt-0.5">{errors.soDienThoai}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Ngày cấp</Label>
                        <Input
                          type="date"
                          value={ngayCap}
                          onChange={(e) => setNgayCap(e.target.value)}
                          className="h-9 text-xs bg-white mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Nơi cấp</Label>
                        <Input
                          value={noiCap}
                          onChange={(e) => setNoiCap(e.target.value)}
                          placeholder="Nơi cấp CMND/CCCD"
                          className="h-9 text-xs bg-white mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700 block mb-1.5">Giới tính <span className="text-red-500">*</span></Label>
                        <RadioGroup
                          value={gioiTinh}
                          onValueChange={(val) => setGioiTinh(val as GioiTinh)}
                          className="flex items-center gap-2 mt-1"
                        >
                          <label htmlFor="g-nam" className={`flex items-center space-x-2 border px-3 py-1.5 rounded-xl cursor-pointer transition-all ${gioiTinh === "NAM" ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <RadioGroupItem value="NAM" id="g-nam" />
                            <span className="text-xs font-semibold text-slate-900 cursor-pointer">Nam</span>
                          </label>
                          <label htmlFor="g-nu" className={`flex items-center space-x-2 border px-3 py-1.5 rounded-xl cursor-pointer transition-all ${gioiTinh === "NU" ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <RadioGroupItem value="NU" id="g-nu" />
                            <span className="text-xs font-semibold text-slate-900 cursor-pointer">Nữ</span>
                          </label>
                          <label htmlFor="g-khac" className={`flex items-center space-x-2 border px-3 py-1.5 rounded-xl cursor-pointer transition-all ${gioiTinh === "KHAC" ? "border-slate-900 bg-slate-50/80 ring-1 ring-slate-900" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <RadioGroupItem value="KHAC" id="g-khac" />
                            <span className="text-xs font-semibold text-slate-900 cursor-pointer">Khác</span>
                          </label>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Ngày sinh</Label>
                        <Input
                          type="date"
                          value={ngaySinh}
                          onChange={(e) => setNgaySinh(e.target.value)}
                          className="h-9 text-xs bg-white mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="h-9 text-xs bg-white mt-1"
                        />
                        {errors.email && <p className="text-[11px] text-red-500 mt-0.5">{errors.email}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Mối quan hệ</Label>
                        <Input
                          value={moiQuanHe}
                          onChange={(e) => setMoiQuanHe(e.target.value)}
                          placeholder="VD: Bản thân / Chủ sở hữu"
                          className="h-9 text-xs bg-white mt-1"
                        />
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Địa chỉ thường trú (cũ)</Label>
                          <Input
                            value={diaChiThuongTruCu}
                            onChange={(e) => setDiaChiThuongTruCu(e.target.value)}
                            className="h-9 text-xs bg-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Địa chỉ thường trú (mới)</Label>
                          <Input
                            value={diaChiThuongTruMoi}
                            onChange={(e) => setDiaChiThuongTruMoi(e.target.value)}
                            className="h-9 text-xs bg-white mt-1"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Địa chỉ liên hệ (cũ)</Label>
                          <Input
                            value={diaChiLienHeCu}
                            onChange={(e) => setDiaChiLienHeCu(e.target.value)}
                            className="h-9 text-xs bg-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Địa chỉ liên hệ (mới)</Label>
                          <Input
                            value={diaChiLienHeMoi}
                            onChange={(e) => setDiaChiLienHeMoi(e.target.value)}
                            className="h-9 text-xs bg-white mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Trạng thái & Xác nhận (Group D & Review) */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Chọn trạng thái & Xác nhận thông tin
                  </h3>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 block mb-2">Trạng thái phiếu đặt chỗ <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={tinhTrang}
                      onValueChange={(val) => setTinhTrang(val as TinhTrangDatCho)}
                      className="grid grid-cols-3 gap-3"
                    >
                      <div className={`flex items-center space-x-2 border p-3 rounded-xl cursor-pointer transition-all ${tinhTrang === "DAT_CHO" ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 bg-white"}`}>
                        <RadioGroupItem value="DAT_CHO" id="tt-dc" />
                        <Label htmlFor="tt-dc" className="text-xs font-bold cursor-pointer">Đặt chỗ</Label>
                      </div>
                      <div className={`flex items-center space-x-2 border p-3 rounded-xl cursor-pointer transition-all ${tinhTrang === "HOAN_TIEN" ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-600" : "border-slate-200 bg-white"}`}>
                        <RadioGroupItem value="HOAN_TIEN" id="tt-ht" />
                        <Label htmlFor="tt-ht" className="text-xs font-bold cursor-pointer">Hoàn tiền</Label>
                      </div>
                      <div className={`flex items-center space-x-2 border p-3 rounded-xl cursor-pointer transition-all ${tinhTrang === "CHUYEN_COC" ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-slate-200 bg-white"}`}>
                        <RadioGroupItem value="CHUYEN_COC" id="tt-cc" />
                        <Label htmlFor="tt-cc" className="text-xs font-bold cursor-pointer">Chuyển cọc</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Comprehensive 2-Column Summary Review Card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-[#F8FAFC] space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Xác nhận thông tin tổng hợp</span>
                      </h4>
                      <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-[11px] font-semibold">
                        {tinhTrang === "DAT_CHO" ? "Đặt chỗ" : tinhTrang === "HOAN_TIEN" ? "Hoàn tiền" : "Chuyển cọc"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Side: THÔNG TIN KHÁCH HÀNG */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                        <h5 className="font-bold text-xs text-indigo-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>THÔNG TIN KHÁCH HÀNG</span>
                        </h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Khách hàng:</span>
                            <span className="font-bold text-slate-900">{tenKhachHang || "---"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">CMND/CCCD:</span>
                            <span className="font-mono font-semibold text-slate-900">{cmnd || "---"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Số điện thoại:</span>
                            <span className="font-mono font-medium text-slate-900">{soDienThoai || "---"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Giới tính:</span>
                            <span className="text-slate-900">{gioiTinh === "NAM" ? "Nam" : gioiTinh === "NU" ? "Nữ" : "Khác"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Mối quan hệ:</span>
                            <span className="text-slate-900">{moiQuanHe || "Bản thân"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: THÔNG TIN PHIẾU & TÀI CHÍNH */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                        <h5 className="font-bold text-xs text-blue-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>THÔNG TIN PHIẾU & TÀI CHÍNH</span>
                        </h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Số phiếu GQUT:</span>
                            <span className="font-mono font-bold text-slate-900">{soPhieuGQUT || "---"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">STT ưu tiên:</span>
                            <span className="font-semibold text-slate-900">{sttUuTien || "---"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Phải thu:</span>
                            <span className="font-bold text-slate-900">{fmtVndCurrency(phaiThu)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Đã thu:</span>
                            <span className="font-bold text-emerald-600">{fmtVndCurrency(daThu)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Còn bổ sung:</span>
                            <span className={`font-bold ${conBoSung > 0 ? "text-red-600 font-extrabold" : "text-slate-700"}`}>
                              {fmtVndCurrency(conBoSung)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Hình thức TT:</span>
                            <span className="text-slate-900">{hinhThucThanhToan === "CHUYEN_KHOAN" ? "Chuyển khoản" : "Tiền mặt"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Đơn vị PP:</span>
                            <span className="text-slate-900">{donViPhanPhoi || "---"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Footer Bar matching CustomerCreateDialog */}
        <DialogFooter className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sm:justify-end">
          {step === 1 ? (
            <Button variant="outline" size="sm" onClick={handleClose} className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700">
              Đóng
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleBack} className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700">
              Quay lại
            </Button>
          )}

          {step < 3 ? (
            <Button size="sm" onClick={handleNext} className="h-9 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:bg-slate-800">
              <span>Tiếp theo</span>
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} className="h-9 rounded-lg bg-black px-5 text-sm font-semibold text-white hover:bg-slate-800">
              <span>Xác nhận tạo mới</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
