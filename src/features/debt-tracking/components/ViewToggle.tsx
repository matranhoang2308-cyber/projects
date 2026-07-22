import React from "react";
import { TableProperties, Columns3 } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ViewToggleProps {
  viewMode: "vertical" | "horizontal";
  onChange: (mode: "vertical" | "horizontal") => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => onChange("vertical")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer select-none",
          viewMode === "vertical"
            ? "bg-white text-slate-900 shadow-sm font-medium dark:bg-slate-850 dark:text-white"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        )}
      >
        <TableProperties className="w-3.5 h-3.5" />
        Chiều dọc
      </button>
      <button
        onClick={() => onChange("horizontal")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer select-none",
          viewMode === "horizontal"
            ? "bg-white text-slate-900 shadow-sm font-medium dark:bg-slate-850 dark:text-white"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        )}
      >
        <Columns3 className="w-3.5 h-3.5" />
        Chiều ngang
      </button>
    </div>
  );
};
