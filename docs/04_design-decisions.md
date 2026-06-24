# Design Decisions

## 1. Không tách hợp đồng và công nợ thành hai trải nghiệm rời rạc
Lý do: công nợ luôn phát sinh từ hợp đồng. Người dùng cần xem hợp đồng và tình trạng thanh toán trong cùng một ngữ cảnh.

## 2. Tạo hợp đồng vẫn dùng 5 bước
1. Khách hàng
2. Bất động sản
3. Điều khoản HĐ
4. Thanh toán
5. Hồ sơ & xác nhận

Trong đó bước Thanh toán là điểm nối giữa hợp đồng và công nợ.

## 3. Công nợ nên là module theo dõi riêng sau khi hợp đồng được tạo
Lý do: tạo hợp đồng chỉ cần setup lịch thanh toán; còn công nợ là workflow vận hành dài hạn.

## 4. Lịch thanh toán sinh từ template
Lý do: mỗi PTTT có số đợt, tỷ lệ và logic khác nhau. Không nên để người dùng nhập thủ công toàn bộ.

## 5. Dashboard phải có cả chỉ số hợp đồng và công nợ
Ví dụ:
- Tổng số hợp đồng
- Tổng giá trị hợp đồng
- Tổng đã thu
- Tổng còn phải thu
- Số tiền quá hạn
- Số hợp đồng quá hạn thanh toán