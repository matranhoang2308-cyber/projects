import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarDays, RotateCcw, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export type TimePresetKey = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "this_year" | "custom";

export interface BookingDateRangePickerProps {
  fromDate?: string;
  toDate?: string;
  preset: TimePresetKey;
  onApply: (preset: TimePresetKey, fromDate?: string, toDate?: string) => void;
  disabled?: boolean;
}

const PRESET_OPTIONS: { key: TimePresetKey; label: string }[] = [
  { key: "all", label: "Tất cả thời gian" },
  { key: "today", label: "Hôm nay" },
  { key: "this_week", label: "7 ngày qua / Tuần này" },
  { key: "this_month", label: "Tháng này" },
  { key: "this_quarter", label: "Quý này" },
  { key: "this_year", label: "Năm nay" },
  { key: "custom", label: "Khoảng thời gian..." },
];

const PRESET_TABS: { key: TimePresetKey; label: string }[] = [
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
  disabled,
}: BookingDateRangePickerProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
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
    if (popoverOpen) {
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
  }, [popoverOpen, preset, fromDate, toDate]);

  // Handle standard dropdown selection
  const handleSelectDropdown = (value: string) => {
    const key = value as TimePresetKey;
    if (key === "custom") {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
      onApply(key, undefined, undefined);
    }
  };

  const handleSelectPresetTab = (key: TimePresetKey) => {
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
    onApply(tempPreset === "all" ? "all" : "custom", fromStr, toStr);
    setPopoverOpen(false);
  };

  // Format trigger display text
  const getDisplayLabel = () => {
    if (fromDate && toDate) {
      const f = format(new Date(fromDate), "dd/MM/yyyy");
      const t = format(new Date(toDate), "dd/MM/yyyy");
      return `${f} - ${t}`;
    }
    if (fromDate) {
      return `Từ ${format(new Date(fromDate), "dd/MM/yyyy")}`;
    }
    if (preset === "today") return "Hôm nay";
    if (preset === "this_week") return "Tuần này";
    if (preset === "this_month") return "Tháng này";
    if (preset === "this_quarter") return "Quý này";
    if (preset === "this_year") return "Năm nay";
    if (preset === "all") return "Tất cả thời gian";
    return "Tất cả thời gian";
  };

  return (
    <div className="relative w-full">
      {/* 1. Main Dropdown Trigger */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <Select
              disabled={disabled}
              value={preset === "custom" || (fromDate && toDate) ? "custom" : preset}
              onValueChange={handleSelectDropdown}
            >
              <SelectTrigger className="h-9 min-w-0 w-full rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-left shadow-none flex items-center justify-between px-3">
                <div className="flex items-center gap-2 truncate">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{getDisplayLabel()}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {PRESET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverTrigger>

        {/* 2. Custom Date Range Popover matching the exact screenshot when 'Khoảng thời gian...' is active */}
        <PopoverContent
          align="start"
          className="w-auto p-0 border border-slate-200 bg-white shadow-xl rounded-xl overflow-hidden z-50"
        >
          {/* Top Quick Preset Tabs */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex items-center gap-1.5 overflow-x-auto">
            {PRESET_TABS.map((opt) => {
              const isActive = tempPreset === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectPresetTab(opt.key)}
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

          {/* Bottom Action Footer Bar: Reset, Cancel, Apply */}
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
                onClick={() => setPopoverOpen(false)}
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
    </div>
  );
}
