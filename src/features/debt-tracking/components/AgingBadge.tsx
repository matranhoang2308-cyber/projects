import React from "react";
import { Badge } from "@/components/ui/badge";
import { NhomTuoiNo } from "../types/contract";

interface AgingBadgeProps {
  bucket: NhomTuoiNo;
}

export const AgingBadge: React.FC<AgingBadgeProps> = ({ bucket }) => {
  switch (bucket) {
    case "CHUA_QUA_HAN":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
          Chưa quá hạn
        </Badge>
      );
    case "QH_1_30":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400">
          1–30 ngày
        </Badge>
      );
    case "QH_31_60":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300">
          31–60 ngày
        </Badge>
      );
    case "QH_61_90":
      return (
        <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50 dark:bg-red-950/10 dark:text-red-400">
          61–90 ngày
        </Badge>
      );
    case "QH_TREN_90":
      return (
        <Badge className="bg-red-100 text-red-900 border-red-300 font-semibold hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300">
          Trên 90 ngày
        </Badge>
      );
    default:
      return null;
  }
};
