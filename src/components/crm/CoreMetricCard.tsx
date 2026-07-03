import type { ElementType } from "react";
import { Card, CardContent } from "@/components/ui/card";

type CoreMetricCardProps = {
  icon: ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
  valueClass?: string;
};

const metricIconTextClass = (iconClass?: string) => {
  if (iconClass?.includes("emerald") || iconClass?.includes("green")) return "text-emerald-700";
  if (iconClass?.includes("red") || iconClass?.includes("rose")) return "text-red-700";
  if (iconClass?.includes("orange") || iconClass?.includes("amber")) return "text-amber-700";
  if (iconClass?.includes("blue")) return "text-blue-700";
  if (iconClass?.includes("violet") || iconClass?.includes("indigo")) return "text-indigo-700";
  return "text-slate-600";
};

export function CoreMetricCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  valueClass,
}: CoreMetricCardProps) {
  return (
    <Card className="min-h-[112px] min-w-0 rounded-lg border-[#E5EAF3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <CardContent className="flex min-h-[112px] items-center p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-slate-200/70 ${iconClass ?? "bg-slate-100"}`}>
            <Icon className={`size-4.5 ${metricIconTextClass(iconClass)}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium leading-4 text-slate-500">{label}</p>
            <p className={`mt-1 break-words text-lg font-semibold leading-6 tabular-nums tracking-[-0.01em] ${valueClass ?? "text-slate-950"}`}>
              {value}
            </p>
            {sub && <p className="mt-1 text-[11px] leading-4 text-slate-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
