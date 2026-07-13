import type { Reminder, ReminderInput } from "@/types/reminder";

const STORAGE_KEY = "crm_reminders";
const DEFAULT_CREATED_BY = "Nguyễn Văn A";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeReminders(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readAll(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Reminder[];
  } catch (error) {
    console.warn("Không thể đọc dữ liệu Reminder từ localStorage.", error);
    return [];
  }
}

function writeAll(reminders: Reminder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.warn("Không thể lưu dữ liệu Reminder vào localStorage.", error);
  }
  notify();
}

/** Activity log for a customer, most recently recorded first. */
export function getRemindersByCustomer(customerId: string): Reminder[] {
  return readAll()
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}

export function createReminder(input: ReminderInput): Reminder {
  const now = new Date().toISOString();
  const reminder: Reminder = {
    id: `RM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: input.type,
    context: input.context,
    customerId: input.customerId,
    contractId: input.contractId,
    paymentId: input.paymentId,
    recordedAt: now,
    files: input.files,
    createdBy: input.createdBy ?? DEFAULT_CREATED_BY,
    createdAt: now,
  };
  writeAll([reminder, ...readAll()]);
  return reminder;
}
