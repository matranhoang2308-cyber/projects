import { useEffect, useState } from "react";
import { getRemindersByCustomer, subscribeReminders } from "@/services/reminderService";
import type { Reminder } from "@/types/reminder";

/** Activity log for a customer's Reminders, re-synced whenever any reminder changes. */
export function useCustomerReminders(customerId: string): Reminder[] {
  const [reminders, setReminders] = useState<Reminder[]>(() => getRemindersByCustomer(customerId));

  useEffect(() => {
    const sync = () => setReminders(getRemindersByCustomer(customerId));
    sync();
    return subscribeReminders(sync);
  }, [customerId]);

  return reminders;
}
