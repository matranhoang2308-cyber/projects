import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Filter, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { Contract } from "../types/contract";
import { horizontalColumns } from "../columns/horizontalColumns";

interface DebtTableHorizontalProps {
  data: Contract[];
  onRowClick?: (contract: Contract) => void;
  activeFilters?: {
    maSanPham?: boolean;
    dot?: boolean;
    loaiSp?: boolean;
    phanKhu?: boolean;
    trangThaiNo?: boolean;
    search?: boolean;
  };
}

export const DebtTableHorizontal: React.FC<DebtTableHorizontalProps> = ({
  data,
  onRowClick,
  activeFilters,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns: horizontalColumns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Sticky columns configuration for horizontal view
  const getStickyClass = (columnId: string, isHeader = false) => {
    const baseClass = isHeader
      ? "z-20 font-semibold bg-[#F6F8FB] text-slate-600 dark:bg-slate-800 dark:text-slate-200"
      : "z-10 bg-white dark:bg-slate-900 group-hover:bg-[#F8FAFC] dark:group-hover:bg-slate-850";

    switch (columnId) {
      case "stt":
        return cn("sticky left-0 border-r border-[#E5EAF3] dark:border-slate-850", baseClass);
      case "maSanPham":
        return cn("sticky left-[50px] border-r border-[#E5EAF3] dark:border-slate-850 font-mono font-medium text-slate-900 dark:text-white", baseClass);
      case "tenKhachHang":
        return cn("sticky left-[165px] border-r border-[#E5EAF3] dark:border-slate-850 font-medium text-slate-900 dark:text-white", baseClass);
      case "actions":
        return cn("sticky right-0 w-[60px] min-w-[60px] max-w-[60px] px-1 text-center border-l border-[#E5EAF3] dark:border-slate-850 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]", baseClass);
      default:
        return "";
    }
  };

  const getCellAlignment = (columnId: string) => {
    const lower = columnId.toLowerCase();
    if (
      lower.includes("sotien") ||
      lower.includes("dongia") ||
      lower.includes("giaban") ||
      lower.includes("phaithu") ||
      lower.includes("dathu") ||
      lower.includes("conthu") ||
      lower.includes("conlai") ||
      lower.includes("bosung") ||
      lower.includes("duthieu")
    ) {
      return "text-right";
    }
    if (lower === "stt" || lower.includes("phantram") || lower.includes("tylekhtt")) {
      return "text-center";
    }
    return "text-left";
  };

  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = pagination;
  const totalRows = data.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950 shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] relative">
          <Table className="border-collapse table-auto w-max min-w-full">
            <TableHeader className="sticky top-0 bg-[#F6F8FB] dark:bg-slate-800 border-b border-[#DDE5F0] dark:border-slate-700 z-30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.id;
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    const isColumnActive = (() => {
                      if (!activeFilters) return false;
                      if (columnId === "maSanPham" && (activeFilters.maSanPham || activeFilters.search)) return true;
                      if (columnId === "phanKhu" && activeFilters.phanKhu) return true;
                      if (columnId.includes("loaiSp") && activeFilters.loaiSp) return true;
                      if (columnId.includes("dot") && activeFilters.dot) return true;
                      if (columnId.includes("trangThai") && activeFilters.trangThaiNo) return true;
                      return false;
                    })();

                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "h-10 border-b border-r border-[#DDE5F0] dark:border-slate-800 bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600 font-semibold uppercase tracking-wider whitespace-nowrap transition-colors",
                          getStickyClass(columnId, true),
                          getCellAlignment(columnId),
                          isColumnActive && "bg-blue-50/90 text-blue-700 font-bold border-b-2 border-b-blue-500 dark:bg-blue-950/60 dark:text-blue-300"
                        )}
                        style={{
                          width: columnId === "actions" ? "60px" : undefined,
                          minWidth: columnId === "actions" ? "60px" : header.column.columns.length > 0 ? undefined : "120px",
                          textAlign: columnId === "actions" || header.column.columns.length > 0 ? "center" : undefined,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 py-1 justify-center",
                              isSortable && "cursor-pointer hover:text-slate-900 dark:hover:text-white",
                              getCellAlignment(columnId) === "text-right" && "justify-end",
                              getCellAlignment(columnId) === "text-left" && "justify-start"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {isColumnActive && (
                              <Filter className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse ml-0.5" />
                            )}
                            {isSortable && (
                              <span className="shrink-0">
                                {sortDirection === "asc" ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : sortDirection === "desc" ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </tr>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={186}
                    className="h-28 text-center text-slate-400"
                  >
                    Không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group h-11 border-b border-[#E5EAF3] dark:border-slate-800 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors"
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnId = cell.column.id;
                      let cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

                      if (columnId === "maSanPham") {
                        const code = cell.getValue() as string;
                        cellContent = (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200/60 dark:border-blue-800/50 shadow-2xs">
                            {code}
                          </div>
                        );
                      } else if (columnId === "actions") {
                        cellContent = (
                          <div className="flex items-center justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Xem công nợ của ${row.original.tenKhachHang}`}
                                    className="h-8 w-8 rounded-md p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-350"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRowClick?.(row.original);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs bg-slate-900 text-white p-1 px-2 rounded shadow-md z-50">
                                  Xem chi tiết công nợ hợp đồng
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        );
                      }

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "h-11 border-b border-r border-[#E5EAF3] dark:border-slate-800/50 px-3 py-1.5 align-middle text-2sm text-slate-700 transition-colors whitespace-nowrap",
                            getStickyClass(columnId, false),
                            getCellAlignment(columnId)
                          )}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-300">{startRow}</span> -{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{endRow}</span> trên tổng số{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows}</span> hợp đồng
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {pageIndex + 1}
              </span>
              <span>/</span>
              <span>{pageCount}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
