# Prompt Log

## Mục đích

Ghi lại các yêu cầu, quyết định, thay đổi phạm vi và hướng xử lý trong quá trình research/design dự án CRM An Khải Hưng.

Tài liệu này dùng để:
- Theo dõi lịch sử quyết định sản phẩm
- Tránh quên các field / logic đã thống nhất
- Làm input cho product brief, IA, user flow và release note
- Giúp team hiểu vì sao thiết kế hiện tại được chia như vậy

---

## 1. Phạm vi ban đầu

### Yêu cầu ban đầu
Dự án bắt đầu từ việc đọc file master data HDMB và xác định các trường dữ liệu trong sheet:

- File: `MASTER Ký HDMB.xlsx`
- Sheet: `IMPORT DL KÝ HDMB`
- Dòng field chính: dòng 6
- Cần đối chiếu các field theo nhóm merge / section

### Kết quả
Các field master data được phân tích theo nhóm:
- Khách hàng
- Đồng sở hữu
- Doanh nghiệp
- Sản phẩm / bất động sản
- Chính sách bán hàng
- Cọc / thanh toán ban đầu
- Nhận thông báo
- HĐMB / chứng từ

---

## 2. Master Data HDMB

### Yêu cầu
Fill các field trong file master data vào bảng Figma:

- Table: `Master data HDMB`
- Component: `Dropdown Master data HDMB`

### Quyết định
- Giữ nguyên component, spacing, màu, font size, auto layout.
- Chỉ thay đổi text label và dữ liệu mẫu.
- Thêm dữ liệu khoảng 14 dòng.
- Các field không có dữ liệu có thể tạo dữ liệu giả nhưng phải hợp lý theo ngữ cảnh.

### Điều chỉnh sau đó
- Chỉnh padding các ô table.
- Mở rộng ngang các cột để text không bị quá 2 dòng.
- Đưa text/icon trong header cha và header con về hug.
- Đổi định dạng tiền tệ thành `1.000.000.000 VND`.
- Dropdown field đưa về width tổng `300`.
- Text trong dropdown không được bị cắt hoặc che khuất.

---

## 3. Kiểm tra số lượng field

### Yêu cầu
Kiểm tra lại số lượng field trong phần dòng 6 của file master data.

### Kết quả / quyết định
- Bỏ khoảng trống từ `DE -> EW`.
- Không tính các khoảng trống không có field.
- Không tính `STT` như field nghiệp vụ chính.
- Có một số nhóm/field cần kiểm tra lại như:
  - KHDN
  - SH2
  - Các field sau `CO`

### Ghi chú
Nhóm `SH2` được hiểu là nhóm thông tin đồng sở hữu / chủ thể thứ hai trong hợp đồng.

---

## 4. Dashboard & Filter

### Yêu cầu
Đề xuất card balance scorecard và chart để người dùng xem nhanh khi lọc master data.

### Filter chính
- Khách hàng
- Mã căn hộ
- Tháp
- Loại căn hộ
- PTTT
- Nhân viên tư vấn
- Đơn vị bán hàng
- Trạng thái kiểm tra

### Quyết định
Khi chưa filter:
- Card và chart hiển thị tổng quan toàn bộ file.

Khi đã filter:
- Card và chart chỉ tính trên tập dữ liệu đã lọc.

### Chart đã đề xuất
- Donut chart: Trạng thái kiểm tra
- Bar chart: phân bổ theo loại căn hộ / PTTT / tháp
- Stacked bar: trạng thái kiểm tra theo nhân viên tư vấn hoặc đơn vị bán hàng

### Điều chỉnh
- Cân nhắc thay chart “Số hợp đồng theo tháp” nếu không đủ hữu ích.
- Ưu tiên chart giúp người dùng biết hồ sơ nào cần xử lý, ai/đơn vị nào đang có nhiều hồ sơ chưa đạt/chưa kiểm tra.

---

## 5. Chi tiết hợp đồng dạng list

### Yêu cầu
Phân chia lại cấu trúc dữ liệu chi tiết hợp đồng thành các block thông tin.

### Block ban đầu
- Thông tin chủ sở hữu
- Thông tin đồng sở hữu
- Thông tin sản phẩm
- Chính sách bán hàng / chiết khấu
- Giá căn hộ sau chiết khấu
- Thông tin HĐMB
- Thông tin giao dịch
- Tiến độ thanh toán
- Tài liệu đính kèm

### Quyết định IA
Ưu tiên thông tin theo thứ tự người dùng cần đọc:
1. Trạng thái / thông tin kiểm tra
2. Chủ thể hợp đồng
3. Doanh nghiệp nếu có
4. Sản phẩm
5. Giá trị hợp đồng
6. Chính sách / chiết khấu
7. Cọc / thanh toán
8. Nhận thông báo
9. Hồ sơ / chứng từ

---

## 6. Google Doc field structure

### Yêu cầu
Đọc file Google Doc chứa danh sách field đã được chia theo bảng.

### File
`https://docs.google.com/document/d/1m7UILOQMyy5SCaIk_fcaukjruWwZWC3pYOkDYJvfajE/edit`

### Ghi chú logic cha - con
Nếu field có dạng:

`Chuyển từ GQUT sang cọc: ngày thanh toán, số tiền`

Thì hiểu là:
- `Chuyển từ GQUT sang cọc` = thông tin cha
- `Ngày thanh toán`, `Số tiền` = thông tin con

Nếu chỉ có một field đơn như:
- `Số tiền`
- `Ngày cấp`
- `Họ tên`

Thì field đó là dòng thông tin con độc lập, không cần tạo cha riêng.

---

## 7. Flow tạo hợp đồng

### Quyết định lớn
Flow tạo hợp đồng được chia thành 5 step:

1. Khách hàng
2. Bất động sản
3. Điều khoản HĐ
4. Thanh toán
5. Hồ sơ & xác nhận

### Lý do
- Giảm cognitive load
- Tránh đưa toàn bộ master data vào một form dài
- Mỗi bước tương ứng với một nhóm quyết định nghiệp vụ
- Dễ validate từng phần
- Dễ save draft và quay lại chỉnh sửa

---

## 8. Step 1 - Khách hàng

### Logic chính
Người dùng chọn loại khách hàng:

- Cá nhân
- Doanh nghiệp

### Nếu là cá nhân
Hiển thị:
- Chủ sở hữu
- Đồng sở hữu nếu có
- Thông tin nhận thông báo

### Nếu là doanh nghiệp
Hiển thị:
- Thông tin doanh nghiệp
- Người đại diện pháp luật
- Thông tin nhận thông báo

### Field chính
#### Chủ sở hữu
- Mã KH
- Họ tên khách hàng
- Số CCCD/HC
- Ngày cấp
- Cơ quan cấp
- Ngày tháng năm sinh
- Giới tính
- Địa chỉ thường trú cũ
- Địa chỉ thường trú mới
- Số điện thoại
- Email
- Nghề nghiệp

#### Đồng sở hữu
- Họ tên khách hàng
- Số CCCD/HC
- Ngày cấp
- Cơ quan cấp
- Ngày tháng năm sinh
- Giới tính
- Địa chỉ thường trú cũ
- Địa chỉ thường trú mới
- Số điện thoại
- Email
- Nghề nghiệp

#### Doanh nghiệp
- Pháp nhân / tên công ty mua
- Giấy phép ĐKKD
- Mã số thuế
- Ngày cấp giấy phép ĐKKD
- Cơ quan cấp
- Địa chỉ trụ sở cũ
- Địa chỉ trụ sở mới
- Chủ sở hữu / đại diện theo pháp luật
- Số CCCD/HC
- Ngày cấp
- Cơ quan cấp
- Ngày tháng năm sinh
- Giới tính
- Số điện thoại
- Email
- Nghề nghiệp / chức vụ

---

## 9. Step 2 - Bất động sản

### Logic chính
Người dùng select căn hộ / sản phẩm từ kho dữ liệu bất động sản.

Sau khi chọn:
- Hệ thống autofill thông tin căn hộ.
- Các field nguồn từ kho sản phẩm nên hạn chế sửa trực tiếp.

### Field chính
- Mã căn hộ thương mại
- Tháp
- Tầng
- Mã căn hộ pháp lý
- Loại căn hộ
- Số phòng ngủ
- Số phòng WC
- View
- Hướng view
- Diện tích tim tường
- Diện tích thông thủy
- Diện tích sân vườn thêm
- Diện tích khác
- Đơn giá bán thuần chưa VAT
- Giá bán thuần chưa VAT
- Giá trị có được từ việc đặt mã căn hộ
- Tình trạng bàn giao
- Gói hoàn thiện và nội thất
- Giá bán thuần hoàn thiện/thô theo loại căn hộ chưa VAT

### Quyết định bổ sung
Lấy thêm:
- View
- Hướng view
- Số phòng WC

Không lấy:
- Phân khu
- Hướng cửa
- Dự kiến bàn giao
- Tiêu chuẩn bàn giao
- Tình trạng pháp lý

---

## 10. Step 3 - Điều khoản HĐ

### Nhóm cuối cùng sau khi gộp
Gộp `3.1 + 3.2`, gộp `3.3 + 3.4`, giữ `3.5`.

### Section
#### 3.1 Chính sách & chiết khấu áp dụng
- PTTT
- CK thanh toán %
- CK thanh toán số tiền
- CK mua sỉ số lượng
- CK mua sỉ %
- CK mua sỉ số tiền
- Ngày GQUT
- CK giữ QUT sớm %
- CK giữ QUT sớm số tiền
- Ngày chuyển cọc
- CK chuyển cọc %
- CK chuyển cọc số tiền
- CK khác nội dung
- CK khác %
- CK khác số tiền

#### 3.2 Tổng chiết khấu, thuế & phí
- Tổng chiết khấu %
- Tổng chiết khấu số tiền
- Thuế GTGT %
- Thuế GTGT số tiền
- Phí bảo trì %
- Phí bảo trì số tiền

#### 3.3 Giá trị hợp đồng
- Đơn giá bán sau chiết khấu, chưa VAT và PBT
- Giá bán sau chiết khấu, chưa VAT và PBT
- Đơn giá bán căn hộ đã bao gồm VAT
- Giá bán căn hộ đã bao gồm VAT và PBT

---

## 11. Step 4 - Thanh toán / Công nợ ban đầu

### Logic chính
Bước thanh toán là điểm nối giữa hợp đồng và công nợ.

Trong tạo hợp đồng:
- Người dùng chọn loại thanh toán / PTTT.
- Hệ thống sinh lịch thanh toán ban đầu.

Sau khi hợp đồng được tạo:
- Lịch thanh toán trở thành dữ liệu đầu vào cho module công nợ.

### Field chính
#### Thông tin cọc
- Tiền cọc phải thu
- Tiền cọc đã thu
- Ngày thanh toán cọc
- Số tiền cọc đã thanh toán

#### Cọc mới / bổ sung
- Ngày thanh toán cọc mới
- Số tiền cọc mới
- Tiền mặt
- Chuyển khoản
- Ngày dự kiến bổ sung tiền cọc
- Số tiền cọc bổ sung

#### Phương thức và lịch thanh toán
- Nội dung - PTTT
- Tỷ lệ PTTT
- Loại thanh toán
- Ngày bắt đầu
- Ngày kết thúc
- Tổng giá trị hợp đồng
- Đặt cọc
- Lịch thanh toán theo đợt

### Quyết định
- Mỗi loại thanh toán có số đợt setup cứng.
- Số tiền từng đợt tính theo tổng giá trị hợp đồng và tiền cọc.
- Lịch thanh toán phụ thuộc ngày bắt đầu và ngày kết thúc.

---

## 12. Step 5 - Hồ sơ & xác nhận

### Field chính
#### Thông tin ký HĐMB
- Ngày ký HĐMB theo quy định
- Ngày ký HĐMB gia hạn
- Loại KH

#### Nhân viên / đơn vị bán hàng
- Nhân viên tư vấn
- Mã account
- Đơn vị bán hàng

#### Chứng từ
- Số thỏa thuận cọc
- Số phiếu thông tin sản phẩm
- Số phiếu XNCK

#### Ghi chú
- Ghi chú

---

## 13. Mở rộng phạm vi sang công nợ

### Yêu cầu mới
Sản phẩm không chỉ quản lý hợp đồng mà cần bao gồm cả công nợ.

### Quyết định
Phạm vi sản phẩm gồm 2 domain:

1. Hợp đồng / HDMB
2. Công nợ / thanh toán

### Quan hệ giữa 2 domain
- Hợp đồng tạo ra nghĩa vụ thanh toán.
- PTTT và lịch thanh toán sinh ra dữ liệu công nợ.
- Công nợ theo dõi trạng thái từng khoản phải thu, đã thu, còn lại, quá hạn.
- Chi tiết hợp đồng cần hiển thị cả thông tin pháp lý và tình trạng công nợ.

---

## 14. Công nợ - IA đề xuất

### Tổng quan công nợ
- Tổng giá trị hợp đồng
- Tổng phải thu
- Tổng đã thu
- Tổng còn lại
- Tổng quá hạn
- Tỷ lệ đã thu

### Cọc / thanh toán ban đầu
- Tiền cọc phải thu
- Tiền cọc đã thu
- Ngày thanh toán cọc
- Số tiền cọc đã thanh toán
- Cọc bổ sung
- Tiền mặt
- Chuyển khoản

### Lịch thanh toán
- Loại thanh toán
- PTTT
- Số đợt thanh toán
- Tỷ lệ từng đợt
- Số tiền từng đợt
- Ngày đến hạn
- Trạng thái từng đợt

### Trạng thái công nợ
- Chưa đến hạn
- Sắp đến hạn
- Đã thanh toán
- Thanh toán một phần
- Quá hạn
- Hủy / điều chỉnh

### Chứng từ thanh toán
- Mã giao dịch
- Ngày thanh toán
- Số tiền thanh toán
- Phương thức thanh toán
- File/chứng từ đính kèm
- Người cập nhật

---

## 15. Các quyết định UI/Figma đã thực hiện

### Master data HDMB
- Fill field vào table.
- Chỉnh padding cell.
- Chỉnh header cha/con về hug.
- Định dạng tiền tệ VND.
- Thêm summary footer.

### Dropdown Master data HDMB
- Fill field vào dropdown.
- Đưa text về hug.
- Chỉnh width tổng 300.
- Đảm bảo text không bị che khuất.

### Tạo hợp đồng
Đã làm / đã yêu cầu theo các frame:
- `Tạo hợp đồng/khách hàng`
- `Tạo hợp đồng/bất động sản`
- `Tạo hợp đồng/Điều khoản HĐ`
- `Tạo hợp đồng/Thanh toán`
- `Tạo hợp đồng/Hồ sơ xác nhận`

### Design rule
- Giữ nguyên component structure.
- Giữ autolayout.
- Giữ spacing.
- Giữ text style.
- Giữ color.
- Chỉ đổi label, nội dung field, title section khi cần.

---

## 16. Open Questions

- Công nợ có cần màn hình riêng ngoài chi tiết hợp đồng không?
- Trạng thái công nợ được cập nhật thủ công hay tự động theo giao dịch?
- Có cần nhắc thanh toán tự động không?
- Ai có quyền chỉnh lịch thanh toán sau khi hợp đồng đã tạo?
- Có cần audit log cho thay đổi tiền/công nợ không?
- Có cần phân quyền giữa kinh doanh, kế toán, pháp lý không?