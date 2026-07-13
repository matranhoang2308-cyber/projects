import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addendumColumns } from "./addendumData";
import { addendumCompactFilterTriggerClass, cn } from "./addendumStyles";

interface ColumnVisibilityDropdownProps {
  visible: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}

export function ColumnVisibilityDropdown({ visible, onChange }: ColumnVisibilityDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn(addendumCompactFilterTriggerClass, "flex items-center justify-between gap-2 px-3")}>
          Hiển thị
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-slate-500">Trường thông tin hiển thị</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {addendumColumns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={visible[col.key] ?? true}
            disabled={col.alwaysOn}
            onCheckedChange={(v) => onChange(col.key, Boolean(v))}
            onSelect={(e) => e.preventDefault()}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
