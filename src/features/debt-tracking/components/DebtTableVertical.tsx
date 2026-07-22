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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { VerticalRowData, verticalColumns } from "../columns/verticalColumns";
import { StatusBadge } from "./StatusBadge";
import { AgingBadge } from "./AgingBadge";
import { formatPercent } from "../utils/format";

export interface ActiveFiltersState {
  maSanPham?: boolean;
  dot?: boolean;
  loaiSp?: boolean;
  phanKhu?: boolean;
  trangThaiNo?: boolean;
  search?: boolean;
}

interface DebtTableVerticalProps {
  data: VerticalRowData[];
  onRowClick?: (row: VerticalRowData) => void;
  isFilteredByMaSp?: boolean;
  activeFilters?: ActiveFiltersState;
}

export const DebtTableVertical: React.FC<DebtTableVerticalProps> = ({ data, onRowClick, isFilteredByMaSp = false, activeFilters }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const table = useReactTable({
    data,
    columns: verticalColumns,
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

  // Helper to determine sticky CSS for headers and cells
  const getStickyClass = (columnId: string, isHeader = false) => {
    const baseClass = isHeader
      ? "z-20 font-semibold bg-[#F6F8FB] text-slate-600 dark:bg-slate-800 dark:text-slate-200"
      : "z-10 bg-white dark:bg-slate-900 group-hover:bg-[#F8FAFC] dark:group-hover:bg-slate-800/60";

    switch (columnId) {
      case "stt":
        return cn("sticky left-0 border-r border-[#E5EAF3] dark:border-slate-850", baseClass);
      case "contract_maSanPham":
        return cn("sticky left-[50px] border-r border-[#E5EAF3] dark:border-slate-850 font-mono font-medium text-slate-900 dark:text-white", baseClass);
      case "contract_tenKhachHang":
        return cn("sticky left-[150px] border-r border-[#E5EAF3] dark:border-slate-850 font-medium text-slate-900 dark:text-white", baseClass);
      case "actions":
        return cn("sticky right-0 border-l border-[#E5EAF3] dark:border-slate-850 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]", baseClass);
      default:
        return "";
    }
  };

  const getCellAlignment = (columnId: string) => {
    if (
      columnId.includes("donGia") ||
      columnId.includes("giaBan") ||
      columnId.includes("soTienPhaiThu") ||
      columnId.includes("daThu") ||
      columnId.includes("duThieuKyTruoc") ||
      columnId.includes("boSung") ||
      columnId.includes("conLai")
    ) {
      return "text-right";
    }
    if (columnId === "stt" || columnId.includes("soDot") || columnId.includes("phanTramTT")) {
      return "text-center";
    }
    if (columnId === "actions") {
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
          <Table className="border-collapse table-fixed w-max min-w-full">
            <colgroup>
              <col style={{ width: "50px" }} /> {/* STT */}
              <col style={{ width: "115px" }} /> {/* Mã sản phẩm */}
              <col style={{ width: "180px" }} /> {/* Tên khách hàng */}
              <col style={{ width: "120px" }} /> {/* Phân khu */}
              <col style={{ width: "140px" }} /> {/* NVTV */}
              <col style={{ width: "140px" }} /> {/* TPKD */}
              <col style={{ width: "140px" }} /> {/* GĐS/SLK */}
              <col style={{ width: "160px" }} /> {/* Đơn vị */}
              <col style={{ width: "110px" }} /> {/* Giai đoạn */}
              <col style={{ width: "100px" }} /> {/* Hướng/View */}
              <col style={{ width: "140px" }} /> {/* Loại SP */}
              <col style={{ width: "130px" }} /> {/* Đơn giá */}
              <col style={{ width: "150px" }} /> {/* Giá bán */}
              <col style={{ width: "80px" }} />  {/* Đợt TT */}
              <col style={{ width: "85px" }} />  {/* % thanh toán */}
              <col style={{ width: "140px" }} /> {/* Số tiền phải thu */}
              <col style={{ width: "120px" }} /> {/* Ngày đến hạn */}
              <col style={{ width: "130px" }} /> {/* Ngày dự kiến TT */}
              <col style={{ width: "130px" }} /> {/* Ngày thực tế TT */}
              <col style={{ width: "135px" }} /> {/* Đã thu */}
              <col style={{ width: "135px" }} /> {/* Dư thiếu kỳ trước */}
              <col style={{ width: "120px" }} /> {/* Bổ sung */}
              <col style={{ width: "135px" }} /> {/* Còn lại */}
              <col style={{ width: "140px" }} /> {/* Tỷ lệ KH thanh toán */}
              <col style={{ width: "120px" }} /> {/* Số ngày quá hạn */}
              <col style={{ width: "130px" }} /> {/* Nhóm tuổi nợ */}
              <col style={{ width: "120px" }} /> {/* Trạng thái */}
              <col style={{ width: "200px" }} /> {/* Ghi chú */}
              <col style={{ width: "60px" }} />  {/* Hành động */}
            </colgroup>
            <TableHeader className="sticky top-0 bg-[#F6F8FB] dark:bg-slate-800 border-b border-[#DDE5F0] dark:border-slate-700 z-30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.id;
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    const isColumnActive = (() => {
                      if (!activeFilters) return false;
                      if (columnId === "contract_maSanPham" && (activeFilters.maSanPham || activeFilters.search)) return true;
                      if (columnId === "contract_phanKhu" && activeFilters.phanKhu) return true;
                      if (columnId.includes("loaiSp") && activeFilters.loaiSp) return true;
                      if (columnId.includes("soDot") && activeFilters.dot) return true;
                      if (columnId.includes("trangThai") && activeFilters.trangThaiNo) return true;
                      return false;
                    })();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-10 border-b border-r border-[#DDE5F0] dark:border-slate-800 bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600 font-semibold uppercase tracking-wider select-none transition-colors",
                          getStickyClass(columnId, true),
                          getCellAlignment(columnId),
                          isColumnActive && "bg-blue-50/90 text-blue-700 font-bold border-b-2 border-b-blue-500 dark:bg-blue-950/60 dark:text-blue-300"
                        )}
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
                    colSpan={verticalColumns.length}
                    className="h-28 text-center text-slate-400"
                  >
                    Không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isOverdue = row.original.installment.trangThai === "QUA_HAN";
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "group h-11 border-b border-[#E5EAF3] dark:border-slate-800 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors",
                        isOverdue && "bg-red-50/40 hover:bg-red-50/70 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;

                        let cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

                        // Customize cell rendering for statuses, product code highlight and progress bar
                        if (columnId === "contract_maSanPham") {
                          const code = cell.getValue() as string;
                          cellContent = (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200/60 dark:border-blue-800/50 shadow-2xs">
                              {code}
                            </div>
                          );
                        } else if (columnId === "installment_trangThai") {
                          cellContent = <StatusBadge status={row.original.installment.trangThai} />;
                        } else if (columnId === "installment_nhomTuoiNo") {
                          cellContent = <AgingBadge bucket={row.original.installment.nhomTuoiNo} />;
                        } else if (columnId === "installment_tyLeKHTT") {
                          const val = cell.getValue() as number;
                          cellContent = (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200 min-w-[46px] text-right">
                                {formatPercent(val)}
                              </span>
                              <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/50">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    val >= 1 ? "bg-emerald-500" : val > 0 ? "bg-blue-500" : "bg-slate-350"
                                  )}
                                  style={{ width: `${Math.min(val * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        } else if (columnId === "actions") {
                          cellContent = (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Xem công nợ của ${row.original.contract.tenKhachHang}`}
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
                                  Xem hợp đồng khách hàng
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "h-11 border-b border-r border-[#E5EAF3] dark:border-slate-800/50 p-2 align-middle text-2sm text-slate-700 transition-colors",
                              getStickyClass(columnId, false),
                              getCellAlignment(columnId),
                              columnId === "installment_daThu" && cell.getValue() as number > 0 && "text-emerald-600 font-medium dark:text-emerald-400",
                              columnId === "installment_conLai" && cell.getValue() as number > 0 && "text-red-600 font-medium dark:text-red-400",
                              columnId === "installment_soNgayQuaHan" && cell.getValue() as number > 0 && "text-red-600 font-semibold dark:text-red-400"
                            )}
                            title={
                              typeof cell.getValue() === "string" ? (cell.getValue() as string) : undefined
                            }
                          >
                            {cellContent}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
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
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows}</span> đợt thanh toán
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
