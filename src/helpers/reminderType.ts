import type { ContractStatus } from "@/types/contractStatus";

const SIGN_HDMB_STATUSES: ContractStatus[] = [
  "Đã cọc",
  "Chờ xác nhận dòng tiền",
  "Đã xác nhận dòng tiền",
  "Chờ kiểm tra pháp lý",
  "Đủ điều kiện ký",
  "Đã phát hành",
];

const SUPPLEMENT_DOCS_STATUSES: ContractStatus[] = ["Đã ký", "Đã hậu kiểm chữ ký", "Đang trình ký"];

const NOTARIZE_STATUSES: ContractStatus[] = ["Đã ký CĐT", "Đã đóng dấu"];

/** "Loại nhắc" for a contract-context Reminder is derived from the contract's status, never typed by hand. */
export function getContractReminderType(status: ContractStatus): string {
  if (SIGN_HDMB_STATUSES.includes(status)) return "Nhắc ký HĐMB";
  if (SUPPLEMENT_DOCS_STATUSES.includes(status)) return "Nhắc bổ sung hồ sơ";
  if (NOTARIZE_STATUSES.includes(status)) return "Nhắc công chứng";
  return "Nhắc khách hàng";
}

export const PAYMENT_REMINDER_TYPE = "Nhắc thanh toán";
