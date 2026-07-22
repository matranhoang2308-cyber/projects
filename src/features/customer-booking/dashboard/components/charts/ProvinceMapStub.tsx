import React from "react";
import { Info } from "lucide-react";
import { VietnamRegionalSvg } from "./VietnamRegionalSvg";

interface ProvinceMapStubProps {
  data: Array<{ province: string; count: number }>;
}

export function ProvinceMapStub({ data }: ProvinceMapStubProps) {
  // Fallback data if passed props are empty
  const displayList =
    data && data.length > 0
      ? data
      : [
          { province: "Hà Nội", count: 18 },
          { province: "Quảng Ninh", count: 14 },
          { province: "Hưng Yên", count: 10 },
          { province: "Điện Biên", count: 7 },
          { province: "Thái Nguyên", count: 4 },
          { province: "Thái Bình", count: 2 },
        ];

  const maxCount = Math.max(1, ...displayList.map((item) => item.count));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-center">
      {/* 1. Left Side: SVG Vietnam Regional Vector Map */}
      <div className="flex items-center justify-center bg-white rounded-xl border border-slate-100 p-2 h-[260px] overflow-hidden">
        <VietnamRegionalSvg />
      </div>

      {/* 2. Right Side: "Top thành phố" Progress Bars with Exact COUNT */}
      <div className="flex flex-col justify-center h-full space-y-3 pr-2">
        {/* Header Title with Info Tooltip Icon */}
        <div className="flex items-center gap-1.5 pb-1">
          <h4 className="text-sm font-semibold text-slate-900">Top thành phố</h4>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>

        {/* Vertical Stack of City Progress Bars showing COUNT on the right */}
        <div className="space-y-3.5 overflow-auto max-h-[230px] pr-1">
          {displayList.slice(0, 6).map((item) => {
            const widthPct = Math.round((item.count / maxCount) * 100);

            return (
              <div key={item.province} className="space-y-1">
                {/* City Name Header */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>{item.province}</span>
                </div>

                {/* Rounded Blue Progress Bar displaying exact COUNT on the right */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, widthPct)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-900 min-w-12 text-right">
                    {item.count.toLocaleString("vi-VN")} KH
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
