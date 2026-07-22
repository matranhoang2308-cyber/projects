import React from "react";
import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
  actionMenu?: React.ReactNode;
  heightClass?: string;
}

export function ChartCard({
  title,
  description,
  children,
  isEmpty = false,
  emptyText = "Không có dữ liệu trong khoảng thời gian này.",
  actionMenu,
  heightClass = "h-[300px]",
}: ChartCardProps) {
  return (
    <Card className="gap-0 rounded-xl border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-950 truncate">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500 line-clamp-1">{description}</p>
          )}
        </div>
        {actionMenu && <div className="shrink-0">{actionMenu}</div>}
      </div>

      <div className={`${heightClass} min-w-0 w-full`}>
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-xs text-slate-500">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export function PillBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function ChartLegendList({
  items,
  valueLabel = "amount",
  formatFn,
}: {
  items: Array<{ name: string; amount?: number; count?: number; value?: number; fill?: string }>;
  valueLabel?: "amount" | "count" | "value";
  formatFn?: (val: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5 justify-center w-full min-w-[210px]">
      {items.slice(0, 6).map((item) => {
        const val = item.amount ?? item.count ?? item.value ?? 0;
        const displayVal = formatFn ? formatFn(val) : val.toLocaleString("vi-VN");
        return (
          <div
            key={item.name}
            className="inline-flex items-center justify-between gap-3 rounded-[10px] border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs shadow-2xs transition-all hover:bg-slate-100/80"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.fill || "#64748b" }}
              />
              <span className="truncate font-semibold text-slate-800">{item.name}</span>
            </div>
            <span className="shrink-0 font-bold tabular-nums text-slate-900 ml-1">
              {displayVal}
            </span>
          </div>
        );
      })}
    </div>
  );
}
