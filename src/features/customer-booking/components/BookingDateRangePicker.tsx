import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarDays, RotateCcw, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export type TimePresetKey = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "this_year" | "custom";

export interface BookingDateRangePickerProps {
  fromDate?: string;
  toDate?: string;
  preset: TimePresetKey;
  onApply: (preset: TimePresetKey, fromDate?: string, toDate?: string) => void;
}

const PRESET_OPTIONS: { key: TimePresetKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "today", label: "Hôm nay" },
  { key: "this_week", label: "Tuần này" },
  { key: "this_month", label: "Tháng này" },
  { key: "this_quarter", label: "Quý này" },
  { key: "this_year", label: "Năm nay" },
];

function getPresetRange(key: TimePresetKey): DateRange | undefined {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
    case "today":
      return { from: today, to: today };
    case "this_week":
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case "this_month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };
    case "this_quarter":
      return {
        from: startOfQuarter(today),
        to: endOfQuarter(today),
      };
    case "this_year":
      return {
        from: startOfYear(today),
        to: endOfYear(today),
      };
    default:
      return undefined;
  }
}

export function BookingDateRangePicker({
  fromDate,
  toDate,
  preset,
  onApply,
}: BookingDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempPreset, setTempPreset] = useState<TimePresetKey>(preset);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(() => {
    if (fromDate || toDate) {
      return {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      };
    }
    return getPresetRange(preset);
  });

  // Keep state synchronized when popover opens
  useEffect(() => {
    if (open) {
      setTempPreset(preset);
      if (fromDate || toDate) {
        setTempRange({
          from: fromDate ? new Date(fromDate) : undefined,
          to: toDate ? new Date(toDate) : undefined,
        });
      } else {
        setTempRange(getPresetRange(preset));
      }
    }
  }, [open, preset, fromDate, toDate]);

  const handleSelectPreset = (key: TimePresetKey) => {
    setTempPreset(key);
    setTempRange(getPresetRange(key));
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setTempRange(range);
    setTempPreset("custom");
  };

  const handleReset = () => {
    setTempPreset("all");
    setTempRange(undefined);
  };

  const handleConfirmApply = () => {
    const fromStr = tempRange?.from ? format(tempRange.from, "yyyy-MM-dd") : undefined;
    const toStr = tempRange?.to ? format(tempRange.to, "yyyy-MM-dd") : undefined;
    onApply(tempPreset, fromStr, toStr);
    setOpen(false);
  };

  // Format trigger label text
  const getTriggerLabel = () => {
    if (preset === "all" && !fromDate && !toDate) {
      return "Tất cả thời gian";
    }
    if (fromDate && toDate) {
      const f = format(new Date(fromDate), "dd/MM/yyyy");
      const t = format(new Date(toDate), "dd/MM/yyyy");
      return `${f} - ${t}`;
    }
    if (fromDate) {
      return `Từ ${format(new Date(fromDate), "dd/MM/yyyy")}`;
    }
    if (preset !== "custom") {
      const p = PRESET_OPTIONS.find((o) => o.key === preset);
      if (p) return p.label;
    }
    return "Tất cả thời gian";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 shadow-none hover:bg-slate-50 gap-2 rounded-[8px]"
        >
          <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{getTriggerLabel()}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 border border-slate-200 bg-white shadow-xl rounded-xl overflow-hidden"
      >
        {/* Preset quick tabs */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex items-center gap-1.5 overflow-x-auto">
          {PRESET_OPTIONS.map((opt) => {
            const isActive = tempPreset === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelectPreset(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* 2-Month Calendar Grid */}
        <div className="p-3">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={tempRange}
            onSelect={handleCalendarSelect}
            locale={vi}
            className="rounded-md border-none p-0"
          />
        </div>

        {/* Bottom Action Footer Bar matching screenshot */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmApply}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 shadow-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
