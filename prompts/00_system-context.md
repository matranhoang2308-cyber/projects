# 00_RAW_DATA - AKH CRM Research

## Mục đích

Lưu toàn bộ dữ liệu thô được dùng để nghiên cứu sản phẩm CRM quản lý hợp đồng, công nợ và thanh toán bất động sản cho An Khải Hưng.

Dữ liệu trong folder này chưa cần diễn giải sâu. Mục tiêu là giữ lại nguồn gốc để có thể đối chiếu khi thiết kế IA, user flow, dashboard và form tạo hợp đồng.

## Nguồn dữ liệu chính

### 1. Master data HDMB

File:
- `MASTER Ký HDMB.xlsx`

Sheet:
- `IMPORT DL KÝ HDMB`

Vai trò:
- Là nguồn field chính để xác định các thông tin cần quản lý trong hệ thống.
- Dùng để phân nhóm dữ liệu hợp đồng, khách hàng, sản phẩm, chính sách, thanh toán và hồ sơ.

Các nhóm dữ liệu chính:
- Thông tin chủ sở hữu
- Thông tin đồng sở hữu
- Thông tin khách hàng doanh nghiệp
- Thông tin sản phẩm / bất động sản
- Thông tin chính sách bán hàng
- Cọc / thanh toán ban đầu
- Thông tin nhận thông báo
- Thông tin HĐMB
- Hồ sơ / chứng từ

### 2. Google Doc field list

Nguồn:
- File Google Doc danh sách field đã được chia theo bảng.

Vai trò:
- Dùng để chuẩn hóa lại field theo từng section.
- Xác định logic field cha - con.

Quy ước:
- Nếu field có dạng `Tên nhóm: field A, field B`, thì `Tên nhóm` là thông tin cha.
- `field A`, `field B` là thông tin con.
- Nếu chỉ có field đơn như `Số tiền`, `Ngày cấp`, `Họ tên`, thì đó là field độc lập.

### 3. Hợp đồng mua bán / HDMB

Vai trò:
- Là nguồn tham chiếu để fill dữ liệu mẫu.
- Dùng để hiểu cấu trúc pháp lý của hợp đồng.
- Dùng để kiểm tra các field liên quan đến HĐMB, khách hàng, sản phẩm và chứng từ.

### 4. Công nợ / thanh toán

Vai trò:
- Là nguồn để hiểu logic khoản phải thu, đã thu, còn lại và quá hạn.
- Dùng để xác định module công nợ sau khi hợp đồng được tạo.

Các nhóm thông tin công nợ:
- Tiền cọc phải thu
- Tiền cọc đã thu
- Cọc bổ sung
- Lịch thanh toán
- Số tiền từng đợt
- Ngày đến hạn
- Trạng thái thanh toán
- Chứng từ thanh toán

### 5. Figma screenshots

Vai trò:
- Ghi lại trạng thái UI hiện tại.
- Dùng để đối chiếu component, spacing, label, table, dropdown và form wizard.

Các khu vực đã tham chiếu:
- Master data HDMB table
- Dropdown Master data HDMB
- Chi tiết hợp đồng dạng list
- Tạo hợp đồng / Khách hàng
- Tạo hợp đồng / Bất động sản
- Tạo hợp đồng / Điều khoản HĐ
- Tạo hợp đồng / Thanh toán
- Tạo hợp đồng / Hồ sơ xác nhận