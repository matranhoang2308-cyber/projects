import type { Lead } from "./leadTypes";

const INITIAL_LEADS: Lead[] = [
  {
    id: "LEAD-001",
    name: "Lê Hoàng Nam",
    phone: "0912345678",
    email: "nam.le@gmail.com",
    gender: "Nam",
    dob: "12/04/1990",
    address: "72 Nguyễn Huệ, Quận 1, TP.HCM",
    job: "Kinh doanh tự do",
    source: "Website",
    salesperson: "Nguyễn Văn A",
    status: "Ký HĐMB",
    createDate: "01/06/2026",
    careNote: "Khách hàng rất quan tâm căn hộ 2 phòng ngủ dự án The Sun Avenue. Đã xem căn hộ mẫu.",
    timeline: [
      { date: "09:00 01/06/2026", type: "Hệ thống", content: "Đăng ký nhận thông tin qua Landing Page" },
      { date: "10:30 01/06/2026", type: "Cuộc gọi", content: "Salesperson liên hệ tư vấn sơ bộ về dự án" },
      { date: "14:00 03/06/2026", type: "Tham quan", content: "Check-in tham quan căn hộ mẫu Block B" },
      { date: "11:00 05/06/2026", type: "Báo giá", content: "Gửi báo giá chính thức căn B3.08-22" },
      { date: "16:00 10/06/2026", type: "Ký HĐMB", content: "Đăng ký lịch hẹn ký hợp đồng mua bán" }
    ],
    chats: [
      { sender: "Khách", message: "Chào em, anh muốn xin bảng giá căn 2 phòng ngủ." },
      { sender: "Nhân viên", message: "Dạ em chào anh Nam, em gửi anh bảng giá chi tiết đính kèm tiến độ đóng tiền ạ." },
      { sender: "Khách", message: "Lịch thanh toán có dãn ra thêm được không?" },
      { sender: "Nhân viên", message: "Dạ có chính sách hỗ trợ lãi suất ngân hàng tối đa 18 tháng anh nhé." }
    ],
    files: [
      { name: "Phieu_dang_ky_thong_tin.pdf", size: "124 KB", date: "01/06/2026" },
      { name: "Bao_gia_can_B3.08-22.pdf", size: "245 KB", date: "05/06/2026" }
    ],
    proposals: [
      { productName: "Căn hộ The Sun Avenue B3.08-22", price: "4.500.000.000đ", date: "05/06/2026" }
    ],
    tasks: [
      { id: "task-1", title: "Gọi điện xác nhận thời gian ký HĐMB", dueDate: "12/06/2026", status: "Chưa hoàn thành" },
      { id: "task-2", title: "Chuẩn bị tài liệu pháp lý căn hộ", dueDate: "09/06/2026", status: "Hoàn thành" }
    ]
  },
  {
    id: "LEAD-002",
    name: "Trần Văn Hùng",
    phone: "0987654321",
    email: "hung.tran@yahoo.com",
    gender: "Nam",
    dob: "25/08/1985",
    address: "15 Lê Lợi, Quận 1, TP.HCM",
    job: "Quản lý dự án",
    source: "Hotline",
    salesperson: "Trần Thị B",
    status: "Đang tư vấn",
    createDate: "05/06/2026",
    careNote: "Cần mua căn hộ shophouse để kinh doanh cà phê. Đang phân vân vị trí mặt đường chính.",
    timeline: [
      { date: "14:30 05/06/2026", type: "Cuộc gọi", content: "Khách gọi hotline hỏi thăm giá shophouse" },
      { date: "09:00 06/06/2026", type: "Gặp mặt", content: "Tư vấn trực tiếp tại văn phòng đại diện" }
    ],
    chats: [
      { sender: "Khách", message: "Mặt bằng Shophouse block A còn căn nào trống không em?" },
      { sender: "Nhân viên", message: "Dạ bên em còn 2 căn góc ngoại giao rất đẹp, anh có tiện đi xem thực tế không ạ?" }
    ],
    files: [
      { name: "Mat_bang_shophouse_block_A.pdf", size: "1.2 MB", date: "06/06/2026" }
    ],
    proposals: [
      { productName: "Shophouse Block A SH-03", price: "8.200.000.000đ", date: "06/06/2026" }
    ],
    tasks: [
      { id: "task-3", title: "Gửi sơ đồ layout chi tiết căn SH-03", dueDate: "08/06/2026", status: "Hoàn thành" }
    ]
  },
  {
    id: "LEAD-003",
    name: "Nguyễn Thị Mai",
    phone: "0933445566",
    email: "mai.nguyen@outlook.com",
    gender: "Nữ",
    dob: "05/05/1993",
    address: "350 Lê Văn Sỹ, Quận 3, TP.HCM",
    job: "Nhân viên văn phòng",
    source: "Facebook",
    salesperson: "Nguyễn Văn A",
    status: "Lead mới",
    createDate: "08/06/2026",
    careNote: "Quan tâm dự án để ở, muốn thanh toán theo đợt nhỏ.",
    timeline: [
      { date: "10:15 08/06/2026", type: "Hệ thống", content: "Để lại tin nhắn qua Fanpage Facebook" }
    ],
    chats: [
      { sender: "Khách", message: "Dự án này có trả góp 5 triệu/tháng không em?" }
    ],
    files: [],
    proposals: [],
    tasks: []
  }
];

// Demo module: dữ liệu chỉ tồn tại trong phiên làm việc hiện tại (bộ nhớ JS).
// Tải lại trang (F5) sẽ nạp lại module này từ đầu và reset về đúng dữ liệu mẫu
// bên trên — Lead tạo/sửa trong phiên trước đó sẽ không còn, đúng như mục đích demo.
let leadsStore: Lead[] = INITIAL_LEADS.map((lead) => ({ ...lead }));

export const getStoredLeads = (): Lead[] => leadsStore;

export const saveStoredLeads = (leads: Lead[]) => {
  leadsStore = leads;
};
