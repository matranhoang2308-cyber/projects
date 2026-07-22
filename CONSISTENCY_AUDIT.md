# Audit Consistent System UI & Chart — Dashboard Khách hàng đặt chỗ

> **Thời điểm audit**: 2026-07-22
> **Mục đích**: Đảm bảo toàn bộ UI/UX, Chart, Card, Filter và Tab trong Module Dashboard "Khách hàng đặt chỗ" tuân thủ 100% Design System (Appminis / Metronic 9) và nhất quán với các module báo cáo/thống kê hiện có trong codebase (`src/features/dashboard/`).

---

## 0.1 Audit chart hiện có trong project

| Mục cần audit | Chi tiết trích xuất từ Codebase (`DebtDashboardReport.tsx`, `components/ui/chart.tsx`) |
|---|---|
| **Chart library** | Recharts (với `recharts` primitives & `ChartContainer` wrapper trong `src/components/ui/chart.tsx`) |
| **Wrapper component** | `ChartCard` (Card bg-white, shadow-sm, border-slate-200, header flex title/subtitle + action menu 3 chấm, body `h-[300px] min-w-0`) |
| **Kích thước chuẩn** | Height chart chuẩn là `300px` (min-height 240px cho compact cards, 300px cho standard cards) |
| **Palette màu** | Dung hệ màu Slate/Tailwind: Primary `#2563eb` (Blue), Success `#16a34a` (Green), Warning `#f59e0b` / `#d97706` (Amber/Yellow), Destructive `#ef4444` (Red), Muted `#64748b` (Slate-500), Purple `#8b5cf6`, Cyan `#06b6d4` |
| **Typography** | Title chart: `text-sm font-semibold text-slate-950`; Subtitle: `text-xs leading-5 text-slate-500`; Axis tick: `text-xs` (`fontSize: 11`, `fill: "#64748b"`) |
| **Grid/axis style** | `CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3"` (chỉ hiện horizontal hoặc vertical tuỳ chart type); Axis tickLine={false} axisLine={false} |
| **Tooltip** | `Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}` hoặc `cursor={{ fill: "#f8fafc" }}`, custom tooltip box bg-white shadow-md border-slate-200 rounded-lg text-xs |
| **Legend** | Reuse `ChartLegendList` ở right side (`lg:grid-cols-[1fr_180px]`) hoặc dưới bottom chart. Hỗ trợ badge chấm màu tròn + label + value tabular-nums |
| **Number formatting** | Axis format currency: `100K`, `1tr`, `1M`, `1.5 tỷ`; Tooltip format: full currency `1.234.567.890 ₫` qua helper `money()` & `number()` |
| **Empty state** | `EmptyChart`: Container flex items-center justify-center, `border border-dashed border-slate-200 bg-slate-50/70 text-xs text-slate-500 rounded-lg` |
| **Loading state** | Skeleton layout `h-[300px] w-full animate-pulse bg-slate-100 rounded-xl` |
| **Responsive** | Bắt buộc wrap trong `ResponsiveContainer width="100%" height="100%"`. Layout grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| **Action menu** | Header action `DropdownMenu` 3 chấm icon (nút Export CSV / Export PNG / View Detail stub) |

---

## 0.2 Audit KPI Card hiện có

- **Card Structure**: `Card` với `p-4 md:p-5 rounded-xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow`.
- **Header**: Icon badge với màu tương ứng nhóm (`bg-blue-50 text-blue-600`, `bg-emerald-50 text-emerald-600`, `bg-amber-50 text-amber-600`, `bg-purple-50 text-purple-600`).
- **Main Value**: `text-2xl font-bold tracking-tight text-slate-950 tabular-nums`.
- **Sub-metrics**: 2 dòng nhỏ (`text-xs text-slate-500 flex items-center gap-2`), ví dụ "💵 Tiền mặt: X | 🏦 Chuyển khoản: Y".
- **Progress Bar**: Băng tiến độ % chỉ tiêu (`h-1.5 rounded-full bg-slate-100` với bar fill color).

---

## 0.3 Audit Filter / Tab pattern

- **Global Filter Bar**: Sticky top (`sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 md:px-6`).
- **Filters**: 4 Select dropdown (Thời gian, Đơn vị phân phối, Trạng thái thanh toán, Tình trạng giao dịch) + Nút `Reset filters`.
- **Tab Component**: shadcn `Tabs`, `TabsList className="bg-slate-100 p-1 border border-slate-200/80 rounded-lg"`, `TabsTrigger className="data-[state=active]:bg-white data-[state=active]:shadow-xs text-xs font-medium px-4 py-2"`.

---

## 0.4 Quy tắc kết luận audit

1. **Shared Chart Components**: Reuse pattern `ChartCard`, `EmptyChart`, `ChartLegendList` từ `DebtDashboardReport.tsx` để đồng bộ UI toàn bộ project.
2. **Chart Palette CSS Variables / Tokens**: Sử dụng đúng palette chuẩn Tailwind Slate & CSS Variables (`#2563eb`, `#16a34a`, `#f59e0b`, `#ef4444`, `#8b5cf6`).
3. **Formatters**: Dùng utility `formatCurrency` (chuẩn hoá `100tr`, `1.5 tỷ`, `1.000.000 ₫`) và `formatPercent`.
4. **Clean Modular Architecture**: Tạo mới các file trong `src/features/customer-booking/dashboard/` với API sạch để có thể mở rộng dễ dàng.
