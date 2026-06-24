# Figma Make Prompt: CRM Contract Transfer UI

## Role

You are designing an enterprise CRM web interface for real estate contract management.

The UI should be functional, professional, compact, and optimized for CRM staff who handle legal/financial contract workflows.

Prioritize:
- Clarity
- Auditability
- Task completion
- Error prevention
- Dense but readable information layout

Avoid:
- Marketing-style hero sections
- Decorative illustrations
- Large empty cards
- Overly colorful visual design
- Consumer app styling

---

# Product Context

This CRM manages real estate sales contracts.

The current contract type is:

“Hợp đồng mua bán”

A user can click the CTA:

“Chuyển nhượng HĐ”

to convert the current contract ownership into a transfer contract workflow.

Important business rule:

Only the following information changes:
- Chủ sở hữu
- Đồng sở hữu, if any

All other contract information remains unchanged:
- Thông tin sản phẩm
- Giá bán
- Chiết khấu
- Chính sách bán hàng
- Tiến độ thanh toán
- Tài liệu hợp đồng gốc

The system must save transfer history logs.

Each transfer log must store:
- Chủ sở hữu cũ
- Chủ sở hữu mới
- Đồng sở hữu cũ, if any
- Đồng sở hữu mới, if any
- Ngày chuyển nhượng
- File hợp đồng chuyển nhượng
- Người thực hiện
- Ghi chú

For the next transfer, the old owner must be the most recent current owner, not the original owner.

Example:
- Transfer 1: Nguyễn A → Trần B
- Transfer 2: Trần B → Lê C

---

# Target User

CRM staff / sales admin / contract operations staff.

They need to:
1. Open a contract detail page
2. Review current contract information
3. Click “Chuyển nhượng HĐ”
4. Enter new owner and co-owner information
5. Upload transfer document
6. Confirm before saving
7. View transfer history later

---

# Design Style

Use an enterprise CRM visual style.

## Visual Requirements

- White background
- Light gray page background
- Compact cards and sections
- 8px border radius or less
- Thin dividers
- Clear section headers
- Dense information layout
- Professional typography
- Minimal color usage
- Green for completed / success
- Red for overdue / warning
- Blue for active / informational
- Yellow or amber for attention states

## Layout Requirements

Desktop web app layout.

Use:
- Top page header
- Sticky bottom action bar where appropriate
- Collapsible information sections
- Data grid style for read-only fields
- Form sections grouped by meaning
- Timeline for transfer history
- Before/after comparison for confirmation

---

# Screen 1: Contract Detail Page

Create a high-fidelity desktop CRM screen.

## Header

Title:

“Chi tiết hợp đồng”

Show contract metadata:

- Mã hợp đồng: S8392U-X1
- Status badge: Công chứng
- Ngày tạo: 16/08/2025
- Dự án: The Gió Riverside Grand Park
- Căn: S105-12

Header actions:

- Secondary button: “Chuyển nhượng HĐ”
- Primary button: “Cập nhật”

## Progress Summary

Add a compact progress section:

Title:

“Tiến độ tổng thể”

Content:

- Progress bar: 40%
- Paid amount: 750 triệu
- Total amount: 1,25 tỷ
- Bắt đầu: 03/2022
- Dự kiến hoàn thành: 08/2027

## Main Content Sections

Create stacked accordion-like cards.

Each card has:
- Section title
- Collapse icon
- Light gray header
- White content area
- 3-column data grid where possible

Sections:

### 1. Thông tin chủ sở hữu

Display read-only fields:

- Họ và tên: Gia Bảo
- Ngày sinh: 24/02/1993
- Số điện thoại: 090-987-6543
- CCCD: 294857392
- Ngày cấp: 24/02/2025
- Nơi cấp: CTCCS
- Địa chỉ thường trú
- Địa chỉ liên hệ
- Email
- Số tài khoản
- Ngân hàng
- Tên tài khoản

### 2. Thông tin đồng chủ sở hữu

Same field structure as owner.

Support multiple co-owners visually.

### 3. Thông tin sản phẩm

Fields:

- Tháp
- Tầng
- Mã số căn
- Mã pháp lý
- Mã căn hộ
- Ghi chú
- View
- Số phòng ngủ
- Số nhà vệ sinh
- Diện tích tim tường
- Diện tích thông thủy
- Tình trạng bàn giao
- Đơn giá bán
- Giá trị đất
- Giá trị xây dựng
- Tổng giá trị trước VAT

### 4. Chính sách bán hàng - chiết khấu ưu đãi

Fields:

- Chiết khấu theo phương án thanh toán
- PTTT
- Tổng chiết khấu

### 5. Giá căn hộ sau chiết khấu

Fields:

- Thuế GTGT
- Số tiền thuế GTGT
- Giá trị HĐMB đã bao gồm VAT

### 6. Thông tin Hợp đồng mua bán

Fields:

- Ngày ký HĐMB theo quy định
- Ngày gia hạn
- Ngày ký HĐMB thực tế
- Số HĐMB
- Nhân viên phụ trách
- Trạng thái HĐ
- Số lần chuyển nhượng

### 7. Tiến độ thanh toán

Show payment milestone cards.

Each milestone includes:

- Đợt thanh toán
- Số tiền
- Hạn thanh toán
- Status badge

Example statuses:

- Đã thanh toán
- Quá hạn
- Sắp đến hạn
- Chưa đến hạn

### 8. Lịch sử chuyển nhượng

If transfer history exists, show this section as a timeline.

Each timeline item includes:

- Lần chuyển nhượng
- Ngày chuyển nhượng
- Chủ sở hữu cũ
- Chủ sở hữu mới
- Đồng sở hữu cũ
- Đồng sở hữu mới
- File đính kèm
- Người thực hiện

If no history exists, show empty state:

“Chưa có lịch sử chuyển nhượng”

### 9. Tài liệu đính kèm

Show file list:

- Hợp đồng đặt cọc PDF
- Hợp đồng đặt cọc PDF

Each file row has:

- File icon
- File name
- File metadata
- Button: “Tải về”
- Button: “Xóa”

Add upload button:

“Tải tài liệu mới lên”

## Bottom Action Bar

Sticky bottom bar with:

- “Đóng”
- “Chuyển nhượng HĐ”
- “Cập nhật”

---

# Screen 2: Transfer Flow - Step 1

Create a full-page form or large right-side drawer.

Title:

“Chuyển nhượng hợp đồng”

Subtitle:

“Kiểm tra thông tin hiện tại trước khi tạo chuyển nhượng”

Use step indicator:

1. Kiểm tra thông tin
2. Nhập thông tin mới
3. Xác nhận

## Section: Thông tin hợp đồng

Read-only summary card:

- Mã hợp đồng
- Dự án
- Căn hộ
- Trạng thái HĐ
- Số lần chuyển nhượng

## Section: Thông tin sở hữu hiện tại

Read-only card:

- Chủ sở hữu hiện tại
- Đồng sở hữu hiện tại
- Số điện thoại
- Email
- CCCD

## Information Notice

Show an info box:

“Các thông tin sản phẩm, giá, chiết khấu và tiến độ thanh toán sẽ được giữ nguyên. Chỉ thông tin chủ sở hữu và đồng sở hữu được cập nhật sau khi xác nhận.”

## Footer Actions

- “Hủy”
- “Tiếp tục”

---

# Screen 3: Transfer Flow - Step 2

Title:

“Nhập thông tin chuyển nhượng”

Use a 2-column comparison layout.

## Left Column: Trước chuyển nhượng

Read-only card.

Fields:

- Chủ sở hữu hiện tại
- Đồng sở hữu hiện tại
- CCCD
- Số điện thoại
- Email
- Địa chỉ liên hệ

## Right Column: Sau chuyển nhượng

Editable form card.

Fields:

- Chủ sở hữu mới
- CCCD
- Ngày sinh
- Số điện thoại
- Email
- Địa chỉ thường trú
- Địa chỉ liên hệ
- Số tài khoản
- Ngân hàng
- Tên tài khoản

## Co-owner Section

Title:

“Đồng sở hữu mới”

Add button:

“Thêm đồng sở hữu”

When clicked, show compact co-owner form card.

Each co-owner card includes:

- Họ và tên
- CCCD
- Ngày sinh
- Số điện thoại
- Email
- Địa chỉ liên hệ
- Remove icon button

Support 0, 1, 2, or 3 co-owners.

## Transfer Document Section

Title:

“Hồ sơ chuyển nhượng”

Fields:

- Ngày hiệu lực chuyển nhượng
- File hợp đồng chuyển nhượng
- Ghi chú nội bộ

Upload component:

- Drag and drop area
- Button: “Chọn file”
- Accepted format hint: PDF, DOCX

## Validation States

Show validation examples:

- Chủ sở hữu mới là bắt buộc
- Ngày hiệu lực là bắt buộc
- File chuyển nhượng là bắt buộc
- Chủ sở hữu mới không được trùng với chủ sở hữu hiện tại

## Footer Actions

- “Quay lại”
- “Tiếp tục xác nhận”

---

# Screen 4: Transfer Flow - Step 3

Title:

“Xác nhận chuyển nhượng”

Subtitle:

“Vui lòng kiểm tra kỹ thông tin trước khi xác nhận”

## Before / After Comparison Table

Columns:

- Nội dung
- Trước chuyển nhượng
- Sau chuyển nhượng

Rows:

- Chủ sở hữu
- Đồng sở hữu
- Sản phẩm
- Giá / chiết khấu
- Tiến độ thanh toán
- File chuyển nhượng

For unchanged rows, show badge:

“Giữ nguyên”

## Warning Box

Show warning message:

“Sau khi xác nhận, chủ sở hữu mới sẽ trở thành chủ sở hữu hiện tại của hợp đồng. Lịch sử chuyển nhượng sẽ được lưu lại và không bị ghi đè.”

## Footer Actions

- “Quay lại chỉnh sửa”
- Primary danger/confirm button: “Xác nhận chuyển nhượng”

---

# Screen 5: Success State

Create success screen or success modal.

Title:

“Chuyển nhượng hợp đồng thành công”

Show summary:

- Chủ sở hữu cũ
- Chủ sở hữu mới
- Ngày chuyển nhượng
- File chuyển nhượng
- Người thực hiện

CTA:

“Quay lại chi tiết hợp đồng”

---

# Screen 6: Contract Detail After Transfer

Show the same contract detail page after transfer.

Changes:

- “Thông tin chủ sở hữu” now displays the new owner
- “Thông tin đồng chủ sở hữu” now displays the new co-owners
- “Số lần chuyển nhượng” increases by 1
- “Lịch sử chuyển nhượng” section shows a timeline item

## Transfer History Timeline Item

Title:

“Lần chuyển nhượng 1”

Content:

- Ngày chuyển nhượng: 08/06/2026
- Chủ sở hữu cũ: Gia Bảo
- Chủ sở hữu mới: Trần Minh Anh
- Đồng sở hữu cũ: Nguyễn Minh Khôi
- Đồng sở hữu mới: Lê Hoàng Nam, Phạm Thanh Hà
- File: hop-dong-chuyen-nhuong-lan-1.pdf
- Người thực hiện: Lâm Trà My

Add small button:

“Xem chi tiết”

---

# Interaction Requirements

Design the following interactions visually:

1. Clicking “Chuyển nhượng HĐ” starts the transfer flow.
2. Step indicator shows progress.
3. “Thêm đồng sở hữu” adds another co-owner card.
4. Upload area clearly shows selected file.
5. Confirmation screen compares old vs new data.
6. After confirmation, transfer history is visible on the contract detail page.

---

# Accessibility Requirements

- Text must be readable
- Use sufficient contrast
- Buttons must have clear labels
- Form fields must have visible labels
- Error messages must appear near the relevant fields
- Touch/click targets should be comfortable
- Do not rely on color alone to communicate status

---

# Final Output

Generate a high-fidelity desktop web CRM UI with these screens:

1. Contract detail before transfer
2. Transfer step 1: Review current ownership
3. Transfer step 2: Enter new owner and co-owner information
4. Transfer step 3: Confirm transfer
5. Success state
6. Contract detail after transfer with transfer history timeline

The design should feel like a real internal CRM product for legal contract operations.