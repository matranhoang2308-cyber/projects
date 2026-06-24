00_product-brief.md
→ Đổi scope từ “quản lý hợp đồng” thành “quản lý hợp đồng + công nợ + thanh toán”.
→ Thêm business goal về theo dõi phải thu, đã thu, quá hạn.

01_user-problems.md
→ Thêm pain point của kế toán/công nợ:
  - khó theo dõi khoản phải thu
  - khó biết hợp đồng nào quá hạn
  - khó đối chiếu tiền cọc, tiền đã thu, còn lại
  - khó nhắc thanh toán đúng thời điểm

02_user-flows.md
→ Thêm flow:
  - Theo dõi công nợ
  - Cập nhật thanh toán
  - Xem lịch thanh toán
  - Lọc hợp đồng quá hạn
  - Đối chiếu chứng từ thanh toán

03_information-architecture.md
→ Thêm domain Công nợ:
  - Tổng quan công nợ
  - Cọc / thanh toán ban đầu
  - Lịch thanh toán
  - Trạng thái công nợ
  - Chứng từ thanh toán

04_design-decisions.md
→ Thêm decision:
  - Công nợ là module vận hành sau khi hợp đồng được tạo
  - Step Thanh toán là điểm nối giữa hợp đồng và công nợ
  - Lịch thanh toán sinh từ template PTTT

05_prompt-log.md
→ Ghi lại thay đổi scope:
  - Ban đầu tập trung HDMB
  - Sau đó mở rộng sang công nợ
  - Cần cover cả hợp đồng lẫn công nợ

06_release-notes.md
→ Thêm version:
  - v0.2 Expand scope to Contract + Debt/Receivables