import React from "react";
import { Card } from "@/components/ui/card";

export type Tone = "inventory" | "revenue" | "customer" | "warning" | "danger" | "teal" | "purple";

const toneStyles: Record<Tone, { icon: string; iconBg: string; accent: string }> = {
  inventory: { icon: "text-blue-700", iconBg: "bg-blue-50 border-blue-100", accent: "bg-blue-600" },
  revenue: { icon: "text-green-700", iconBg: "bg-green-50 border-green-100", accent: "bg-green-600" },
  customer: { icon: "text-violet-700", iconBg: "bg-violet-50 border-violet-100", accent: "bg-violet-600" },
  warning: { icon: "text-amber-700", iconBg: "bg-amber-50 border-amber-100", accent: "bg-amber-500" },
  danger: { icon: "text-red-700", iconBg: "bg-red-50 border-red-100", accent: "bg-red-600" },
  teal: { icon: "text-teal-700", iconBg: "bg-teal-50 border-teal-100", accent: "bg-teal-600" },
  purple: { icon: "text-purple-700", iconBg: "bg-purple-50 border-purple-100", accent: "bg-purple-600" },
};

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: React.ReactNode;
  icon: React.ElementType;
  tone?: Tone;
  progress?: number;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "inventory",
  progress,
}: MetricCardProps) {
  const style = toneStyles[tone] || toneStyles.inventory;

  return (
    <Card className="relative min-h-[112px] gap-0 overflow-hidden rounded-lg border-[#E5EAF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-xs transition-shadow">
      {/* Top accent line */}
      <span className={`absolute inset-x-0 top-0 h-0.5 ${style.accent}`} />

      {/* Label */}
      <p className="min-h-4 pr-11 text-[11px] font-medium leading-4 text-slate-500 truncate">{label}</p>

      {/* Value */}
      <p className="mt-1 break-words text-lg font-semibold leading-6 tracking-[-0.01em] tabular-nums text-slate-950">
        {value}
      </p>

      {/* Hint or Formula */}
      {hint && (
        <div className="mt-1 text-[11px] leading-4 text-slate-500 font-medium">
          {hint}
        </div>
      )}

      {/* Progress Bar if present */}
      {typeof progress === "number" && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${style.accent} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Top Right Icon Badge */}
      <div className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border ${style.iconBg} ${style.icon}`}>
        <Icon className="size-4.5" />
      </div>
    </Card>
  );
}

// Keep export alias for compatibility
export { MetricCard as KpiCard };
