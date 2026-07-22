import { useState } from "react";
import { useNavigate } from "react-router";
import {
  X, Copy, Check, DollarSign, Wallet, AlertCircle, User
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CustomerBooking, TinhTrangDatCho } from "../types/booking";

interface BookingDetailSheetProps {
  booking: CustomerBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (booking: CustomerBooking) => void;
}

type BookingTab = "bookingInfo" | "addressDistribution" | "timeline";

const bookingTabs: Array<{ value: BookingTab; label: string }> = [
  { value: "bookingInfo", label: "Thông tin phiếu & Đặt chỗ" },
  { value: "addressDistribution", label: "Địa chỉ & Phân phối" },
  { value: "timeline", label: "Nhật ký & Timeline" },
];

const statusConfig: Record<TinhTrangDatCho, { label: string; class: string }> = {
  DAT_CHO: {
    label: "Đặt chỗ",
    class: "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-200",
  },
  HOAN_TIEN: {
    label: "Hoàn tiền",
    class: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200",
  },
  CHUYEN_COC: {
    label: "Chuyển cọc",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200",
  },
};

export function fmtVndCurrency(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VND`;
}

export function fmtDateVn(dateStr: string | null | undefined): string {
  if (!dateStr) return "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function BookingDetailSheet({ booking, open, onOpenChange, onEdit }: BookingDetailSheetProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BookingTab>("bookingInfo");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!booking) return null;

  const empty = "Chưa cập nhật";

  const copyToClipboard = async (label: string, value: string) => {
    if (!value || value === empty) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(label);
      window.setTimeout(() => setCopiedField((current) => (current === label ? null : current)), 1600);
    } catch {
      setCopiedField(null);
    }
  };

  const handleNavigateToCustomer = () => {
    onOpenChange(false);
    navigate(`/customers?bookingId=${encodeURIComponent(booking.id)}`);
  };

  // Sidebar profile rows matching exact fields of Group C
  const sidebarRows = [
    { label: "Họ và tên", value: booking.tenKhachHang || empty },
    { label: "Số điện thoại", value: booking.soDienThoai || empty, copyable: Boolean(booking.soDienThoai) },
    { label: "Email", value: booking.email || empty, copyable: Boolean(booking.email) },
    { label: "CMND/CCCD", value: booking.cmnd || empty, copyable: Boolean(booking.cmnd) },
    { label: "Giới tính", value: booking.gioiTinh === "NAM" ? "Nam" : booking.gioiTinh === "NU" ? "Nữ" : "Khác" },
    { label: "Ngày sinh", value: fmtDateVn(booking.ngaySinh) },
    { label: "Mối quan hệ", value: booking.moiQuanHe || empty },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1440px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1440px]"
        aria-describedby={undefined}
      >
        <SheetClose className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 z-50">
          <X className="h-4 w-4" />
        </SheetClose>

        <div className="flex h-full min-h-0 flex-col bg-white">
          <SheetTitle className="sr-only">Hồ sơ phiếu đặt chỗ {booking.soPhieuGQUT}</SheetTitle>

          {/* Header Bar */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
            <h2 className="text-base text-slate-950 font-bold" style={{ fontWeight: 700 }}>
              Chi tiết khách hàng đặt chỗ
            </h2>
          </div>

          {/* Summary Card */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="truncate text-[26px] leading-8 text-slate-950 font-extrabold" style={{ fontWeight: 750 }}>
                {booking.tenKhachHang}
              </h3>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-sm text-slate-600">Khách hàng đặt chỗ</span>
              <Badge variant="outline" className={`ml-1 h-6 text-xs font-semibold px-2.5 rounded-md ${statusConfig[booking.tinhTrang].class}`}>
                {statusConfig[booking.tinhTrang].label}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>Số phiếu GQUT: <span className="text-slate-800 font-mono font-semibold">{booking.soPhieuGQUT}</span></span>
              <span className="text-slate-300">•</span>
              <span>STT ưu tiên: <span className="text-slate-800 font-semibold">{booking.sttUuTien}</span></span>
              <span className="text-slate-300">•</span>
              <span>Ngày xác nhận: <span className="text-slate-800 font-semibold">{fmtDateVn(booking.ngayXacNhanGQUT)}</span></span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex min-h-0 flex-1 overflow-hidden bg-slate-50">
            {/* Left Profile Sidebar */}
            <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-5">
              {/* Avatar Frame */}
              <div className="aspect-[1.04] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-200/80">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80"
                  alt={`Ảnh đại diện ${booking.tenKhachHang}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Sidebar Field List */}
              <div className="mt-4 divide-y divide-slate-100">
                {sidebarRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.1fr)] items-center gap-3 py-2.5 text-sm">
                    <p className="text-slate-500">{row.label}</p>
                    <div className="flex min-w-0 items-center justify-end gap-1.5">
                      <p className="min-w-0 truncate text-right text-slate-950 font-medium">
                        {row.value}
                      </p>
                      {row.copyable && row.value !== empty && (
                        <button
                          type="button"
                          className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded transition hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          title={`Sao chép ${row.label}`}
                          onClick={() => copyToClipboard(row.label, row.value)}
                        >
                          {copiedField === row.label ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Right Main Panel */}
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-slate-50">
              {/* Navigation Tabs Bar */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
                {bookingTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none whitespace-nowrap ${
                      activeTab === tab.value
                        ? "bg-slate-100 text-slate-950 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Panel Content Container */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  {/* Tab 1: Thông tin phiếu & Đặt chỗ (Group A Fields) */}
                  {activeTab === "bookingInfo" && (
                    <div className="space-y-6">
                      {/* Financial Metrics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="p-4 border-slate-200 bg-white shadow-none rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Phải thu</span>
                              <span className="text-base font-bold text-slate-900">{fmtVndCurrency(booking.phaiThu)}</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 border-slate-200 bg-white shadow-none rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Đã thu</span>
                              <span className="text-base font-bold text-emerald-600">{fmtVndCurrency(booking.daThu)}</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 border-slate-200 bg-white shadow-none rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Còn bổ sung</span>
                              <span className={`text-base ${booking.conBoSung > 0 ? "font-extrabold text-red-600" : "font-semibold text-slate-600"}`}>
                                {fmtVndCurrency(booking.conBoSung)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Key-Value Fields of Group A */}
                      <div className="space-y-4 divide-y divide-slate-100 text-sm pt-2">
                        <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-1">
                          <span className="text-slate-500 font-medium">Số phiếu GQUT</span>
                          <span className="text-slate-950 font-bold font-mono">{booking.soPhieuGQUT}</span>
                        </div>
                        <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                          <span className="text-slate-500 font-medium">STT ưu tiên</span>
                          <span className="text-slate-950 font-bold">{booking.sttUuTien}</span>
                        </div>
                        <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                          <span className="text-slate-500 font-medium">Ngày xác nhận GQUT</span>
                          <span className="text-slate-950 font-bold">{fmtDateVn(booking.ngayXacNhanGQUT)}</span>
                        </div>
                        <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                          <span className="text-slate-500 font-medium">Ngày thanh toán</span>
                          <span className="text-slate-950 font-bold">{fmtDateVn(booking.ngayThanhToan)}</span>
                        </div>
                        <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                          <span className="text-slate-500 font-medium">Hình thức thanh toán</span>
                          <span className="text-slate-950 font-bold">
                            {booking.hinhThucThanhToan === "CHUYEN_KHOAN" ? "Chuyển khoản" : "Tiền mặt"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[180px_1fr] items-start gap-4 pt-4">
                          <span className="text-slate-500 font-medium">Nội dung đặt chỗ</span>
                          <span className="text-slate-950 font-bold leading-relaxed">{booking.noiDung || empty}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Địa chỉ & Phân phối (Group B & C Fields) */}
                  {activeTab === "addressDistribution" && (
                    <div className="space-y-4 divide-y divide-slate-100 text-sm">
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-1">
                        <span className="text-slate-500 font-medium">Đơn vị phân phối</span>
                        <span className="text-slate-950 font-bold">{booking.donViPhanPhoi || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Nhân viên tư vấn (NVTV)</span>
                        <span className="text-slate-950 font-bold">{booking.nvtv || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">CMND/CCCD</span>
                        <span className="text-slate-950 font-bold font-mono">{booking.cmnd || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Ngày cấp</span>
                        <span className="text-slate-950 font-bold">{fmtDateVn(booking.ngayCap)}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Nơi cấp</span>
                        <span className="text-slate-950 font-bold">{booking.noiCap || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Địa chỉ thường trú (cũ)</span>
                        <span className="text-slate-950 font-bold">{booking.diaChiThuongTruCu || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Địa chỉ thường trú (mới)</span>
                        <span className="text-slate-950 font-bold">{booking.diaChiThuongTruMoi || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Địa chỉ liên hệ (cũ)</span>
                        <span className="text-slate-950 font-bold">{booking.diaChiLienHeCu || empty}</span>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                        <span className="text-slate-500 font-medium">Địa chỉ liên hệ (mới)</span>
                        <span className="text-slate-950 font-bold">{booking.diaChiLienHeMoi || empty}</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Nhật ký & Timeline */}
                  {activeTab === "timeline" && (
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm" />
                        <div>
                          <p className="font-bold text-slate-900">Xác nhận phiếu GQUT {booking.soPhieuGQUT}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{fmtDateVn(booking.ngayXacNhanGQUT)} — Ghi nhận số tiền {fmtVndCurrency(booking.daThu)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 relative pl-6">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                        <div>
                          <p className="font-bold text-slate-900">Khởi tạo thông tin khách hàng đặt chỗ</p>
                          <p className="text-xs text-slate-500 mt-0.5">{fmtDateVn(booking.ngayThanhToan)} — NVTV: {booking.nvtv || "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6">
            <SheetClose asChild>
              <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
                Đóng
              </Button>
            </SheetClose>

            {(booking.tinhTrang === "HOAN_TIEN" || booking.tinhTrang === "CHUYEN_COC") ? (
              <Button
                className="h-9 rounded-lg bg-black px-4 text-sm text-white hover:bg-slate-800"
                onClick={handleNavigateToCustomer}
              >
                Chuyển sang Danh sách khách hàng
              </Button>
            ) : (
              <Button
                className="h-9 rounded-lg bg-black px-4 text-sm text-white hover:bg-slate-800"
                onClick={() => {
                  onOpenChange(false);
                  if (onEdit) onEdit(booking);
                }}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
