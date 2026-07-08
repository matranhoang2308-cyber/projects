import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreVertical, Eye, History } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  type AddendumListItem,
} from "./addendumData";
import {
  addendumSearchInputClass,
  addendumSelectTriggerClass,
  addendumTableHeaderClass,
  addendumTableCellClass,
  cn,
} from "./addendumStyles";

const avatarPalette = [
  "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700", "bg-pink-100 text-pink-700", "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700", "bg-orange-100 text-orange-700",
];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % avatarPalette.length;
  return avatarPalette[hash];
}

function PersonCell({ name, email }: { name: string; email: string }) {
  const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(-2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", paletteFor(name))}>
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
      if (allSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
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

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  return (
    <div className={cn("gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50")}>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2 border-b border-[#E5EAF3] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={addendumSearchInputClass}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setPage(1); }}>
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[180px]")}>
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
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[140px]")}>
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
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[130px]")}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Trạng thái</SelectItem>
              {statusFilterOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ColumnVisibilityDropdown visible={visible} onChange={(key, v) => setVisible((prev) => ({ ...prev, [key]: v }))} />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(addendumTableHeaderClass, "sticky left-0 z-20 w-10 bg-[#F6F8FB] text-center")}>
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Chọn tất cả" />
              </th>
              <th className={cn(addendumTableHeaderClass, "sticky left-10 z-20 bg-[#F6F8FB]")} style={{ fontWeight: 650 }}>
                Mã phụ lục
              </th>
              {isVisible("soPhuLuc") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Số phụ lục</th>}
              {isVisible("loaiPhuLuc") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Loại phụ lục</th>}
              {isVisible("maHopDong") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Mã hợp đồng</th>}
              {isVisible("khachHang") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Khách hàng</th>}
              {isVisible("nhanVienThayDoi") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Nhân viên thay đổi</th>}
              {isVisible("duAn") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Dự án</th>}
              {isVisible("thapBlock") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Tháp/block</th>}
              {isVisible("tang") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Tầng</th>}
              {isVisible("maCan") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Mã căn</th>}
              {isVisible("ngayTao") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Ngày tạo</th>}
              {isVisible("capNhatLanCuoi") && <th className={addendumTableHeaderClass} style={{ fontWeight: 650 }}>Cập nhật lần cuối</th>}
              <th className={cn(addendumTableHeaderClass, "sticky right-14 z-20 bg-[#F6F8FB] text-center")} style={{ fontWeight: 650 }}>
                Trạng thái
              </th>
              <th className={cn(addendumTableHeaderClass, "sticky right-0 z-20 w-14 border-r-0 bg-[#F6F8FB] text-center")} style={{ fontWeight: 650 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-10 text-center text-sm text-slate-400">
                  Không tìm thấy phụ lục phù hợp
                </td>
              </tr>
            ) : pageRows.map((item) => (
              <tr key={item.id} className="group">
                <td className={cn(addendumTableCellClass, "sticky left-0 z-10 bg-white text-center group-hover:bg-[#F8FAFC]")}>
                  <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleRow(item.id)} aria-label={`Chọn ${item.id}`} />
                </td>
                <td className={cn(addendumTableCellClass, "sticky left-10 z-10 bg-white group-hover:bg-[#F8FAFC]")}>
                  <button type="button" onClick={() => onView(item)} className="text-xs font-semibold text-indigo-600 hover:underline">
                    {item.id}
                  </button>
                </td>
                {isVisible("soPhuLuc") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.soPhuLuc}</span></td>}
                {isVisible("loaiPhuLuc") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.loaiPhuLuc}</span></td>}
                {isVisible("maHopDong") && (
                  <td className={addendumTableCellClass}>
                    <span className="text-xs font-semibold text-indigo-600">{item.maHopDong}</span>
                  </td>
                )}
                {isVisible("khachHang") && (
                  <td className={addendumTableCellClass}>
                    <PersonCell name={item.khachHang.name} email={item.khachHang.email} />
                  </td>
                )}
                {isVisible("nhanVienThayDoi") && (
                  <td className={addendumTableCellClass}>
                    <PersonCell name={item.nhanVienThayDoi.name} email={item.nhanVienThayDoi.email} />
                  </td>
                )}
                {isVisible("duAn") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.duAn}</span></td>}
                {isVisible("thapBlock") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.thapBlock}</span></td>}
                {isVisible("tang") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.tang}</span></td>}
                {isVisible("maCan") && <td className={addendumTableCellClass}><span className="text-xs text-slate-700">{item.maCan}</span></td>}
                {isVisible("ngayTao") && <td className={addendumTableCellClass}><span className="text-xs tabular-nums text-slate-600">{item.ngayTao}</span></td>}
                {isVisible("capNhatLanCuoi") && <td className={addendumTableCellClass}><span className="text-xs tabular-nums text-slate-600">{item.capNhatLanCuoi}</span></td>}
                <td className={cn(addendumTableCellClass, "sticky right-14 z-10 bg-white text-center group-hover:bg-[#F8FAFC]")}>
                  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", addendumStatusCfg[item.trangThai])}>
                    {item.trangThai}
                  </span>
                </td>
                <td className={cn(addendumTableCellClass, "sticky right-0 z-10 border-r-0 bg-white text-center group-hover:bg-[#F8FAFC]")}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Hành động cho ${item.id}`} className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(item)} className="gap-2 text-xs">
                        <Eye className="h-3.5 w-3.5" />Xem
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onHistory(item)} className="gap-2 text-xs">
                        <History className="h-3.5 w-3.5" />Nhật ký thay đổi
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-2 border-t border-[#E5EAF3] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{rangeStart}-{rangeEnd} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-8 w-8 rounded-[8px] p-0"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={n === currentPage ? "default" : "outline"}
                size="sm"
                className={cn("h-8 w-8 rounded-[8px] p-0 text-xs", n === currentPage && "bg-slate-950 hover:bg-slate-800")}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline" size="sm" className="h-8 w-8 rounded-[8px] p-0"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Trang sau"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
