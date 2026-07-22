import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrangThaiDot } from "../types/contract";

interface StatusBadgeProps {
  status: TrangThaiDot;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "DA_THANH_TOAN":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
          Đã thanh toán
        </Badge>
      );
    case "QUA_HAN":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 font-semibold">
          Quá hạn
        </Badge>
      );
    case "SAP_TOI_HAN":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
          Sắp đến hạn
        </Badge>
      );
    default:
      return null;
  }
};
