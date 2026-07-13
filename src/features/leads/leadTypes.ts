export type LeadTimeline = {
  date: string;
  type: string;
  content: string;
};

export type LeadChat = {
  sender: "Khách" | "Nhân viên";
  message: string;
};

export type LeadFile = {
  name: string;
  size: string;
  date: string;
};

export type LeadProposal = {
  productName: string;
  price: string;
  date: string;
};

export type LeadTask = {
  id: string;
  title: string;
  dueDate: string;
  status: "Hoàn thành" | "Chưa hoàn thành";
};

export type LeadStatus =
  | "Lead mới"
  | "Đã tiếp nhận"
  | "Đang tư vấn"
  | "Đã gửi báo giá"
  | "Đặt chỗ"
  | "Tham quan nhà mẫu"
  | "Thành công"
  | "Không thành công";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  address: string;
  job: string;
  source: string;
  salesperson: string;
  status: LeadStatus;
  createDate: string;
  careNote: string;
  timeline: LeadTimeline[];
  chats: LeadChat[];
  files: LeadFile[];
  proposals: LeadProposal[];
  tasks: LeadTask[];
  bookingAmount?: string;
  bookingPaymentDate?: string;
  bookingQueueNumber?: number;
  bookingDate?: string;
  notes?: Array<{ content: string; author: string; date: string }>;
}
