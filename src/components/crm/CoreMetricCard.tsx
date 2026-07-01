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

export function CoreMetricCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  valueClass,
}: CoreMetricCardProps) {
  return (
    <Card className="min-h-[128px] min-w-0 rounded-[12px] border-[#E5EAF3] bg-white shadow-sm shadow-slate-200/40">
      <CardContent className="flex min-h-[128px] items-center p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass ?? "bg-slate-100"}`}>
            <Icon className="size-5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium leading-4 text-muted-foreground">{label}</p>
            <p className={`mt-1 break-words text-xl font-medium leading-6 tabular-nums ${valueClass ?? "text-foreground"}`}>
              {value}
            </p>
            {sub && <p className="mt-1.5 text-xs leading-4 text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
