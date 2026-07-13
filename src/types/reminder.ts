export type ReminderContext = "contract" | "payment";

export interface ReminderFile {
  name: string;
  size: string;
  date: string;
}

export interface Reminder {
  id: string;
  type: string; // e.g. "Nhắc ký HĐMB", "Nhắc công chứng", "Nhắc thanh toán" — auto-generated, never typed by hand
  context: ReminderContext;
  customerId: string; // Activity always rolls up to the Customer (root entity)
  contractId: string;
  paymentId?: string; // only set when context === "payment"
  recordedAt: string; // ISO datetime — the moment the user performed the reminder action
  files?: ReminderFile[];
  createdBy: string;
  createdAt: string;
}

export type ReminderInput = {
  type: string;
  context: ReminderContext;
  customerId: string;
  contractId: string;
  paymentId?: string;
  files?: ReminderFile[];
  createdBy?: string;
};
