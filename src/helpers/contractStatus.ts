import { CONTRACT_STATUS_FLOW } from "@/constants/contractStatus";
import type { ContractStatus } from "@/types/contractStatus";

export const CONTRACT_STATUS_CLASSES: Record<ContractStatus, string> = {
  "Đã cọc": "bg-slate-100 text-slate-700 ring-slate-200",
  "Chờ xác nhận dòng tiền": "bg-amber-50 text-amber-700 ring-amber-100",
  "Đã xác nhận dòng tiền": "bg-blue-50 text-blue-700 ring-blue-100",
  "Chờ kiểm tra pháp lý": "bg-amber-50 text-amber-700 ring-amber-100",
  "Đủ điều kiện ký": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Đã phát hành": "bg-sky-50 text-sky-700 ring-sky-100",
  "Đã ký": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Đã hậu kiểm chữ ký": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Đang trình ký": "bg-amber-50 text-amber-700 ring-amber-100",
  "Đã ký CĐT": "bg-blue-50 text-blue-700 ring-blue-100",
  "Đã đóng dấu": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Chờ trả hợp đồng": "bg-amber-50 text-amber-700 ring-amber-100",
  "Đã trả": "bg-sky-50 text-sky-700 ring-sky-100",
  "Bàn giao": "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

/**
 * Lấy chỉ số (index) của trạng thái trong luồng quy trình hợp đồng.
 * Trả về -1 nếu không tìm thấy trạng thái hợp lệ.
 */
export function getStatusIndex(status: ContractStatus): number {
  return CONTRACT_STATUS_FLOW.indexOf(status);
}

/**
 * Lấy trạng thái tiếp theo trong luồng quy trình hợp đồng.
 * Trả về null nếu đang ở trạng thái cuối cùng hoặc trạng thái không hợp lệ.
 */
export function getNextContractStatus(status: ContractStatus): ContractStatus | null {
  const currentIndex = getStatusIndex(status);
  if (currentIndex === -1 || currentIndex === CONTRACT_STATUS_FLOW.length - 1) {
    return null;
  }
  return CONTRACT_STATUS_FLOW[currentIndex + 1];
}

/**
 * Lấy trạng thái trước đó trong luồng quy trình hợp đồng.
 * Trả về null nếu đang ở trạng thái đầu tiên hoặc trạng thái không hợp lệ.
 */
export function getPreviousContractStatus(status: ContractStatus): ContractStatus | null {
  const currentIndex = getStatusIndex(status);
  if (currentIndex <= 0) {
    return null;
  }
  return CONTRACT_STATUS_FLOW[currentIndex - 1];
}

/**
 * Kiểm tra xem trạng thái hiện tại có phải là trạng thái cuối cùng (Bàn giao) hay không.
 */
export function isFinalContractStatus(status: ContractStatus): boolean {
  return getStatusIndex(status) === CONTRACT_STATUS_FLOW.length - 1;
}

/**
 * Kiểm tra xem có thể chuyển trực tiếp từ trạng thái hiện tại sang trạng thái đích hay không.
 * Hiện tại luôn trả về true để cho phép nhảy cóc tự do không giới hạn.
 */
export function canJumpToStatus(currentStatus: ContractStatus, targetStatus: ContractStatus): boolean {
  return true;
}
