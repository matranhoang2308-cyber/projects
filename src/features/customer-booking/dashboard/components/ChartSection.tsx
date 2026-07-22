import React from "react";

interface ChartSectionProps {
  title: string;
  description?: string;
  badgeText?: string;
  columns?: 2 | 3;
  children: React.ReactNode;
}

export function ChartSection({
  title,
  description,
  badgeText,
  columns = 2,
  children,
}: ChartSectionProps) {
  const gridClass =
    columns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <section className="space-y-4">
      {/* Section Header with Left Vertical Accent Line */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full shrink-0" />
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {badgeText && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-blue-50 text-blue-700">
              {badgeText}
            </span>
          )}
        </div>
        {description && <p className="pl-3 text-xs text-slate-500">{description}</p>}
      </div>

      {/* Grid Content */}
      <div className={`grid gap-4 ${gridClass}`}>{children}</div>
    </section>
  );
}
