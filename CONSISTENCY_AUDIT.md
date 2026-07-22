# CONSISTENCY AUDIT & PATTERN SPECIFICATION

Dựa trên việc đọc và phân tích source code của 2 module đã có (`src/features/customers/` và `src/features/leads/`), dưới đây là danh sách các UI/UX patterns đã được chuẩn hóa để áp dụng cho module **Khách hàng đặt chỗ**:

---

## 1. Layout Tổng Thể & Spacing
- **Container**: `div` chính dùng `space-y-4 p-4 md:p-6`.
- **Breadcrumb**: `nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2"` sử dụng icon `ChevronRight`.
- **Page Header**: Tiêu đề trang `h1 className="text-xl font-semibold leading-7 text-slate-950"` đặt cạnh khu vực Action Buttons ở góc phải.

---

## 2. KPI Cards
- **Component**: Tái sử dụng component hệ thống `CoreMetricCard` (`src/components/crm/CoreMetricCard.tsx`).
- **Layout**: Grid 4 cột (`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4`).
- **Typography & Style**: `min-h-[112px] rounded-lg border-[#E5EAF3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]`, icon box `h-9 w-9 rounded-md ring-1 ring-inset ring-slate-200/70`.

---

## 3. Toolbar & Filters
- **Card Panel**: Bao bọc bởi `Card` có class `max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50`.
- **Header Panel**: `border-b border-[#E5EAF3] bg-white px-4 py-3`.
- **Toolbar Filter Row**: `border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5 flex items-center gap-2 overflow-x-auto`.
- **Select Filters**: Class trigger `h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none`.
- **Search Input**: Input chiều cao `h-9` kèm icon `Search` tuyệt đối góc trái (`left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`).

---

## 4. Bảng Dữ Liệu (Table)
- **Table Element**: Sử dụng Shadcn `Table` kết hợp `@tanstack/react-table` v8.
- **Header Cell Style**: `h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600 font-semibold`.
- **Body Cell Style**: `h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle text-xs transition-colors group-hover:bg-[#F8FAFC]`.
- **Sticky / Freeze Columns**:
  - Sticky Left: STT (col 1), Số phiếu GQUT (col 2), Tên KH (col 6) với `sticky left-0 bg-white z-10`.
  - Sticky Right: Tình trạng (col 26) với `sticky right-0 bg-white z-10 shadow-[-6px_0_12px_-12px_rgba(15,23,42,0.45)]`.
- **Pagination Footer**: `flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between`.

---

## 5. Detail View (Drawer / Sheet)
- **Component**: Sử dụng `Sheet` từ `@/components/ui/sheet` vị trí bên phải (`side="right"`), chiều rộng `sm:max-w-xl w-full md:w-[600px]`.
- **Layout nội dung**: Phân nhóm bằng các section card/divider rõ ràng, hiển thị đầy đủ 26 trường thông tin, các trường rỗng hiển thị `—`.
- **CTA Footer**: Nếu tình trạng là `HOAN_TIEN` hoặc `CHUYEN_COC`, hiển thị nút Primary CTA "Chuyển sang Danh sách khách hàng" điều hướng tới `/customers?bookingId={id}`.

---

## 6. Modal "Tạo Mới" (Wizard 3 Bước)
- **Component**: Sử dụng `Dialog` từ `@/components/ui/dialog` (size `max-w-3xl`).
- **Wizard Stepper**: Thanh hiển thị tiến trình 3 bước (1. Thông tin phiếu & thanh toán -> 2. Phân phối & KH -> 3. Trạng thái & Xác nhận).
- **Auto-compute**: Trường *Còn bổ sung* tự động tính toán `= Phải thu - Đã thu` dạng readonly.

---

## 7. Modal "Import Excel" (Wizard 4 Bước)
- **Component**: Sử dụng `Dialog` từ `@/components/ui/dialog` (size `max-w-4xl`).
- **Thư viện đọc Excel**: `xlsx` (SheetJS).
- **Luồng 4 bước**: 1. Upload File -> 2. Preview & Map Cột -> 3. Validate & Preview Data -> 4. Kết quả Import.

---

## 8. Color Scheme cho Status Badges
- `DAT_CHO`: `bg-slate-50 text-slate-700 ring-slate-200`
- `HOAN_TIEN`: `bg-amber-50 text-amber-700 ring-amber-200`
- `CHUYEN_COC`: `bg-emerald-50 text-emerald-700 ring-emerald-200`

---

## 9. Empty State & UX Details
- **Empty state**: Centered card với text "Không tìm thấy dữ liệu phù hợp", gợi ý đổi từ khóa hoặc bộ lọc.
- **Formatting**:
  - Tiền tệ: `1.234.567.890 ₫` (hỗ trợ hiển thị "Thừa 197.900.000 ₫" màu warning nếu âm).
  - Ngày tháng: `dd/MM/yyyy`.
