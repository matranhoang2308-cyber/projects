import { useMemo, useState } from "react";
import { Search, MoreVertical, Eye, History, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnVisibilityDropdown } from "./ColumnVisibilityDropdown";
import {
  addendumList,
  addendumStatusCfg,
  addendumColumns,
  employeeFilterOptions,
  towerBlockFilterOptions,
  statusFilterOptions,
  templates,
  type AddendumListItem,
} from "./addendumData";
import {
  addendumPanelClass,
  addendumToolbarWrapClass,
  addendumToolbarRowClass,
  addendumToolbarSearchInputClass,
  addendumCompactFilterTriggerClass,
  addendumTableHeaderClass,
  addendumTableCellClass,
  addendumStickyCellClass,
  addendumPanelFooterClass,
  addendumPaginationButtonClass,
  addendumBadgeBaseClass,
  addendumAvatarPalette,
  addendumPanelHeaderClass,
  addendumPanelMetaClass,
  cn,
} from "./addendumStyles";

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % addendumAvatarPalette.length;
  return addendumAvatarPalette[hash];
}

function PersonCell({ name, email }: { name: string; email: string }) {
  const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(-2).join("").toUpperCase();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs text-white", paletteFor(name))}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-800">{name}</p>
        <p className="truncate text-xs text-slate-400">{email}</p>
      </div>
    </div>
  );
}

interface AddendumTableProps {
  onView: (item: AddendumListItem) => void;
  onHistory: (item: AddendumListItem) => void;
}

const ALL = "__all__";
const stickyShadowLeft = "shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]";
const stickyShadowRight = "shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]";

export function AddendumTable({ onView, onHistory }: AddendumTableProps) {
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState(ALL);
  const [towerFilter, setTowerFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(addendumColumns.map((c) => [c.key, true]))
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const isVisible = (key: string) => visible[key] ?? true;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return addendumList.filter((item) => {
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.soPhuLuc.toLowerCase().includes(q) ||
        item.maHopDong.toLowerCase().includes(q) ||
        item.khachHang.name.toLowerCase().includes(q) ||
        item.maCan.toLowerCase().includes(q);
      const matchEmployee = employeeFilter === ALL || item.nhanVienThayDoi.name === employeeFilter;
      const matchTower = towerFilter === ALL || item.thapBlock === towerFilter;
      const matchStatus = statusFilter === ALL || item.trangThai === statusFilter;
      return matchSearch && matchEmployee && matchTower && matchStatus;
    });
  }, [search, employeeFilter, towerFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRowActivate(item: AddendumListItem, target: EventTarget) {
    if (target instanceof HTMLElement && target.closest(".td-actions, .td-select")) return;
    onView(item);
  }

  return (
    <div className={addendumPanelClass}>
      {/* ── Panel Header ── */}
      <div className={addendumPanelHeaderClass}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Danh sách phụ lục</h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {filtered.length} phụ lục phù hợp · {selected.size} đang chọn
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className={cn(addendumPanelMetaClass, "border-blue-100 bg-blue-50 text-blue-700 gap-1.5")}>
              <RefreshCw className="h-3 w-3 text-blue-500" />
              Tự động đồng bộ: 15:03 14/03/2026
            </span>
            <span className={addendumPanelMetaClass}>{filtered.length} kết quả</span>
            {selected.size > 0 && (
              <span className={cn(addendumPanelMetaClass, "border-blue-200 bg-blue-50 text-blue-700")}>
                {selected.size} đang chọn
              </span>
            )}
            <span className="hidden text-xs text-slate-500 lg:inline">Bấm vào dòng để xem chi tiết phụ lục</span>
          </div>
        </div>
      </div>
      {/* ── Toolbar (single scroll row, matches ContractListPage/DebtDashboard) ── */}
      <div className={addendumToolbarWrapClass}>
        <div className={addendumToolbarRowClass}>
          <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={addendumToolbarSearchInputClass}
            />
          </div>
          <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setPage(1); }}>
            <SelectTrigger className={cn(addendumCompactFilterTriggerClass, "w-[180px] flex-shrink-0")}>
              <SelectValue placeholder="Nhân viên thay đổi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Nhân viên thay đổi</SelectItem>
              {employeeFilterOptions.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={towerFilter} onValueChange={(v) => { setTowerFilter(v); setPage(1); }}>
            <SelectTrigger className={cn(addendumCompactFilterTriggerClass, "w-[140px] flex-shrink-0")}>
              <SelectValue placeholder="Tháp/block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tháp/block</SelectItem>
              {towerBlockFilterOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className={cn(addendumCompactFilterTriggerClass, "w-[130px] flex-shrink-0")}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Trạng thái</SelectItem>
              {statusFilterOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-shrink-0">
            <ColumnVisibilityDropdown visible={visible} onChange={(key, v) => setVisible((prev) => ({ ...prev, [key]: v }))} />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <Table className="min-w-[1600px] table-fixed border-separate border-spacing-0 text-sm">
        <TableHeader className="sticky top-0 z-20">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(addendumTableHeaderClass, "sticky left-0 z-40 w-12 text-center", addendumStickyCellClass, stickyShadowLeft)}>
              <button
                type="button"
                aria-label="Chọn tất cả dòng"
                aria-pressed={allSelected}
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${allSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-transparent hover:border-slate-500"}`}
                onClick={toggleAll}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead className={cn(addendumTableHeaderClass, "w-28")} style={{ fontWeight: 650 }}>
              Mã phụ lục
            </TableHead>
            {isVisible("soPhuLuc") && <TableHead className={cn(addendumTableHeaderClass, "w-44")} style={{ fontWeight: 650 }}>Số phụ lục</TableHead>}
            {isVisible("loaiPhuLuc") && <TableHead className={cn(addendumTableHeaderClass, "w-52")} style={{ fontWeight: 650 }}>Loại phụ lục</TableHead>}
            {isVisible("maHopDong") && <TableHead className={cn(addendumTableHeaderClass, "w-32")} style={{ fontWeight: 650 }}>Mã hợp đồng</TableHead>}
            {isVisible("khachHang") && <TableHead className={cn(addendumTableHeaderClass, "w-56")} style={{ fontWeight: 650 }}>Khách hàng</TableHead>}
            {isVisible("nhanVienThayDoi") && <TableHead className={cn(addendumTableHeaderClass, "w-56")} style={{ fontWeight: 650 }}>Nhân viên thay đổi</TableHead>}
            {isVisible("duAn") && <TableHead className={cn(addendumTableHeaderClass, "w-36")} style={{ fontWeight: 650 }}>Dự án</TableHead>}
            {isVisible("thapBlock") && <TableHead className={cn(addendumTableHeaderClass, "w-28")} style={{ fontWeight: 650 }}>Tháp/block</TableHead>}
            {isVisible("tang") && <TableHead className={cn(addendumTableHeaderClass, "w-20")} style={{ fontWeight: 650 }}>Tầng</TableHead>}
            {isVisible("maCan") && <TableHead className={cn(addendumTableHeaderClass, "w-24")} style={{ fontWeight: 650 }}>Mã căn</TableHead>}
            {isVisible("ngayTao") && <TableHead className={cn(addendumTableHeaderClass, "w-32")} style={{ fontWeight: 650 }}>Ngày tạo</TableHead>}
            {isVisible("capNhatLanCuoi") && <TableHead className={cn(addendumTableHeaderClass, "w-36")} style={{ fontWeight: 650 }}>Cập nhật lần cuối</TableHead>}
            <TableHead className={cn(addendumTableHeaderClass, "w-28 text-center")} style={{ fontWeight: 650 }}>Trạng thái</TableHead>
            <TableHead className={cn(addendumTableHeaderClass, "sticky right-0 z-40 w-14 border-l border-l-[#DDE5F0] border-r-0 text-center", addendumStickyCellClass, stickyShadowRight)} style={{ fontWeight: 650 }}>
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="px-3 py-10 text-center text-sm text-slate-400">
                Không tìm thấy phụ lục phù hợp
              </TableCell>
            </TableRow>
          ) : pageRows.map((item) => (
            <TableRow
              key={item.id}
              className="group h-11 cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Mở chi tiết phụ lục ${item.id}`}
              onClick={(e) => handleRowActivate(item, e.target)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(item); }
              }}
            >
              <TableCell className={cn(addendumTableCellClass, "td-select sticky left-0 z-10 text-center", addendumStickyCellClass, stickyShadowLeft)}>
                <button
                  type="button"
                  className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${selected.has(item.id) ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                  title="Chọn dòng"
                  aria-label={`Chọn dòng ${item.id}`}
                  aria-pressed={selected.has(item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(item.id);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              </TableCell>
              <TableCell className={addendumTableCellClass}>
                <span className="text-xs font-semibold text-indigo-600">{item.id}</span>
              </TableCell>
               {isVisible("soPhuLuc") && <TableCell className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.soPhuLuc}</span></TableCell>}
              {isVisible("loaiPhuLuc") && (
                <TableCell className={addendumTableCellClass}>
                  <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                    {item.loaiPhuLuc}
                  </span>
                </TableCell>
              )}
              {isVisible("maHopDong") && (
                <TableCell className={addendumTableCellClass}>
                  <span className="text-xs font-semibold text-indigo-600">{item.maHopDong}</span>
                </TableCell>
              )}
              {isVisible("khachHang") && (
                <TableCell className={addendumTableCellClass}>
                  <PersonCell name={item.khachHang.name} email={item.khachHang.email} />
                </TableCell>
              )}
              {isVisible("nhanVienThayDoi") && (
                <TableCell className={addendumTableCellClass}>
                  <PersonCell name={item.nhanVienThayDoi.name} email={item.nhanVienThayDoi.email} />
                </TableCell>
              )}
              {isVisible("duAn") && <TableCell className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.duAn}</span></TableCell>}
              {isVisible("thapBlock") && <TableCell className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.thapBlock}</span></TableCell>}
              {isVisible("tang") && <TableCell className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.tang}</span></TableCell>}
              {isVisible("maCan") && <TableCell className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.maCan}</span></TableCell>}
              {isVisible("ngayTao") && <TableCell className={addendumTableCellClass}><span className="text-xs tabular-nums text-slate-600">{item.ngayTao}</span></TableCell>}
              {isVisible("capNhatLanCuoi") && <TableCell className={addendumTableCellClass}><span className="text-xs tabular-nums text-slate-600">{item.capNhatLanCuoi}</span></TableCell>}
              <TableCell className={cn(addendumTableCellClass, "text-center")}>
                <Badge variant="outline" className={cn(addendumBadgeBaseClass, "font-semibold", addendumStatusCfg[item.trangThai])}>
                  {item.trangThai}
                </Badge>
              </TableCell>
              <TableCell className={cn(addendumTableCellClass, "td-actions sticky right-0 z-10 border-l border-r-0 text-center", addendumStickyCellClass, stickyShadowRight)}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label={`Hành động cho ${item.id}`} className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(item);
                      }}
                      className="gap-2 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />Xem
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onHistory(item);
                      }}
                      className="gap-2 text-xs"
                    >
                      <History className="h-3.5 w-3.5" />Nhật ký thay đổi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ── Pagination (prev/next + count, no numbered pages — matches system) ── */}
      <div className={addendumPanelFooterClass}>
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-8 w-[68px] rounded-[8px] border-[#E5EAF3] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>trang</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 tabular-nums">{rangeStart}-{rangeEnd} / {filtered.length}</span>
          <Button
            variant="ghost" size="sm" className={addendumPaginationButtonClass}
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Trang trước"
          >
            ‹
          </Button>
          <Button
            variant="ghost" size="sm" className={addendumPaginationButtonClass}
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Trang sau"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
