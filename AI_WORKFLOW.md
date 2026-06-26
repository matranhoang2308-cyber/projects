# AI Workflow - Quy trình phát triển UI cho CRM Project

Quy trình này định nghĩa các bước bắt buộc mà AI Agent phải tuân thủ để phát triển giao diện người dùng đồng bộ, tái sử dụng tối đa mã nguồn và giữ vững tính nhất quán của hệ thống thiết kế.

---

## 1. Workflow Tổng Quát (General Workflow)

Mỗi khi nhận một Task UI từ người dùng, AI phải đi qua đúng trình tự sau:

```text
User Task (Yêu cầu thiết kế/mã hóa UI)
      ↓
Read AGENTS.md (Đọc quy tắc AI trong dự án)
      ↓
Read appminis-design-system/README.md (Nắm cấu trúc Design System)
      ↓
Read appminis-design-system/README_LEARNING_PATH.md (Xác định lộ trình đọc)
      ↓
Identify Screen Type (Xác định loại màn hình cần xây dựng)
      ↓
Read Pattern (Đọc đặc tả nghiệp vụ tương ứng trong 04-patterns)
      ↓
Read Layout (Đọc cấu trúc khung xương trong 03-layout)
      ↓
Read Component (Đọc đặc tả component con trong 02-components)
      ↓
Read Foundation (Đọc token, màu sắc, font, spacing trong 01-foundation)
      ↓
Search Existing Component (Tìm kiếm các component có sẵn trong dự án)
      ↓
Generate UI (Viết mã giao diện dựa trên quy tắc đã đọc)
      ↓
Self Review (Tự kiểm tra theo Checklist trước khi phản hồi)
```

---

## 2. Ánh Xạ Màn Hình (Screen Mapping)

Khi thiết kế hoặc sửa đổi một loại màn hình cụ thể, AI bắt buộc phải đọc và tham chiếu các tài liệu tương ứng theo thứ tự sau:

### Dashboard
1. **Pattern**: `04-patterns/dashboard.md` (hoặc tương tự trong thư mục patterns)
2. **Layout**: `03-layout/grid-dashboard.md` hoặc cấu trúc lưới dashboard.
3. **Component**: `02-components/chart.md`, `02-components/table.md`, `02-components/card.md`
4. **Foundation**: `01-foundation/color.md`, `01-foundation/spacing.md`

### Report
1. **Layout**: `03-layout/report-layout.md`
2. **Component**: `02-components/chart.md`, `02-components/table.md`, `02-components/button.md`
3. **Foundation**: `01-foundation/color.md`, `01-foundation/typography.md`

### List Page
1. **Pattern**: `04-patterns/crm.md` (đặc tả danh sách khách hàng/CRM)
2. **Layout**: `03-layout/list-layout.md`
3. **Component**: `02-components/filter.md`, `02-components/table.md`, `02-components/pagination.md`
4. **Foundation**: `01-foundation/spacing.md`, `01-foundation/radius.md`

### Detail Page
1. **Pattern**: `04-patterns/crm.md` (luồng chi tiết thông tin CRM)
2. **Layout**: `03-layout/detail-layout.md`
3. **Component**: `02-components/tabs.md`, `02-components/table.md`, `02-components/badge.md`
4. **Foundation**: `01-foundation/typography.md`, `01-foundation/shadow.md`

### Form
1. **Layout**: `03-layout/form-layout.md`
2. **Component**: `02-components/input.md`, `02-components/select.md`, `02-components/button.md`
3. **Foundation**: `01-foundation/spacing.md`, `01-foundation/color.md`

### Chart
1. **Component**: `02-components/chart.md`
2. **Guideline**: `05-guidelines/chart-guideline.md`
3. **Foundation**: `01-foundation/color.md` (bảng màu biểu đồ)

### Table
1. **Component**: `02-components/table.md`
2. **Component**: `02-components/badge.md`, `02-components/pagination.md`
3. **Foundation**: `01-foundation/spacing.md`

### Modal
1. **Component**: `02-components/modal.md`
2. **Component**: `02-components/button.md`, `02-components/input.md`
3. **Foundation**: `01-foundation/shadow.md`, `01-foundation/radius.md`

---

## 3. Quy Tắc Tái Sử Dụng (Reusability Rules)

### 3.1. Existing Component Rule (Quy tắc linh kiện có sẵn)
Trước khi khởi tạo hay xây dựng bất kỳ component nào, AI bắt buộc phải thực hiện luồng sau:
1. **Search**: Quét toàn bộ thư mục `src/components` để tìm component tương tự.
2. **Found**: Nếu có sẵn component phù hợp → **Tái sử dụng** và cấu hình props thay vì viết mới.
3. **Not Found**: Nếu không có → Đọc kỹ tài liệu kỹ thuật trong `appminis-design-system/02-components/` để tạo mới component chuẩn hóa tại thư mục project.

### 3.2. Existing Layout Rule (Quy tắc layout có sẵn)
- Nếu dự án đã có cấu trúc App Shell, Sidebar, Topbar hoặc các layout đặc thù khác, AI **phải giữ nguyên** cấu trúc đó.
- Chỉ chỉnh sửa các khu vực (slots, children) được chỉ định trong phạm vi task.
- **Không thực hiện refactor toàn bộ** hoặc thay đổi cấu trúc khung layout chính trừ khi được người dùng yêu cầu trực tiếp.

### 3.3. Existing Style Rule (Quy tắc kiểu dáng có sẵn)
- Ưu tiên sử dụng tuyệt đối các token có sẵn về: `spacing`, `typography`, `radius`, `shadow`, `color` cấu hình bằng Tailwind CSS CSS Variables.
- Không tự ý định nghĩa thêm các màu sắc hex ngẫu nhiên hoặc các giá trị hardcode không thuộc bảng màu hệ thống.
- **Không thay đổi các file cấu hình style toàn cục** (`global.css`, `index.css`, `default_shadcn_theme.css`) khi không được giao cụ thể.

---

## 4. Bảng Kiểm Tự Đánh Giá (Self Review Checklist)

Trước khi gửi phản hồi hoặc hoàn thành task cho người dùng, AI phải tự kiểm tra lại các mục sau:

- [ ] Đã đọc `AGENTS.md` chưa?
- [ ] Đã đọc `README.md` và `README_LEARNING_PATH.md` của Design System chưa?
- [ ] Đã xác định đúng loại màn hình (`Screen Type`) chưa?
- [ ] Đã đọc tài liệu theo đúng trình tự từ `Pattern` → `Layout` → `Component` → `Foundation` chưa?
- [ ] Đã tìm kiếm và tái sử dụng component có sẵn trong `src/components` chưa?
- [ ] Đã tránh tuyệt đối việc viết hardcode style (spacing, màu sắc, size) chưa?
- [ ] Đã chắc chắn không chỉnh sửa gì bên trong repository liên kết `appminis-design-system` chưa?
- [ ] Có đảm bảo chỉ sửa đổi các file trong phạm vi của task và tránh refactor ngoài lề không?

> Nếu phát hiện bất kỳ điểm nào chưa đạt trong Checklist, AI phải quay lại điều chỉnh và sửa code trước khi hoàn tất công việc.
