# An Khải Hưng CRM Research Repository

## Tổng Quan

Repository này lưu trữ toàn bộ research, insight, quyết định thiết kế và cấu trúc thông tin cho dự án **CRM quản lý hợp đồng, công nợ và thanh toán bất động sản An Khải Hưng**.

Mục tiêu của repository là giúp team Product, UX/UI, BA, Dev và các bên nghiệp vụ có cùng một nguồn tham chiếu khi thiết kế và phát triển hệ thống.

## Phạm Vi Sản Phẩm

Sản phẩm không chỉ quản lý hợp đồng HDMB, mà bao gồm toàn bộ vòng đời sau bán hàng:

- Quản lý khách hàng
- Quản lý bất động sản / căn hộ
- Quản lý hợp đồng HDMB
- Quản lý chính sách bán hàng và chiết khấu
- Quản lý cọc, thanh toán và công nợ
- Quản lý hồ sơ / chứng từ
- Dashboard, filter và báo cáo vận hành

## Vấn Đề Cần Giải Quyết

Dữ liệu hợp đồng và công nợ hiện có nhiều field, nhiều nguồn và nhiều nhóm nghiệp vụ khác nhau. Nếu đưa toàn bộ vào một form hoặc một bảng phẳng, người dùng sẽ khó nhập, khó kiểm tra và dễ sai.

Các vấn đề chính:

- Master data HDMB có quá nhiều trường dữ liệu.
- Dữ liệu khách hàng, sản phẩm, hợp đồng, thanh toán và công nợ bị phân tán.
- Người dùng khó biết field nào cần xử lý ở bước nào.
- Dễ nhầm giữa thông tin hợp đồng và thông tin công nợ.
- Khó theo dõi hợp đồng nào đã thu, còn phải thu hoặc quá hạn.
- Dashboard cần phản ánh đúng dữ liệu sau khi filter.

## Người Dùng Chính

- Nhân viên kinh doanh
- CSKH / vận hành hợp đồng
- Kế toán / công nợ
- Pháp lý
- Quản lý

## Luồng Chính

Flow tạo hợp đồng được chia thành 5 bước:

1. Khách hàng
2. Bất động sản
3. Điều khoản HĐ
4. Thanh toán
5. Hồ sơ & xác nhận

Trong đó, bước **Thanh toán** là điểm nối giữa hợp đồng và công nợ. Sau khi hợp đồng được tạo, lịch thanh toán sẽ trở thành dữ liệu đầu vào cho module công nợ.

## Cấu Trúc Research Repository

```txt
research-repository/
├── 00_RAW_DATA/
├── 01_SYNTHESIZED_INSIGHTS/
├── 02_STUDIES_INDEX/
└── 03_DECISIONS_LOG/