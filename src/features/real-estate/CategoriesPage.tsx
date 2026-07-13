import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDownIcon, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryDetailSheet } from "./CategoryDetailSheet";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { initialRealEstateCategories, type RealEstateCategory } from "./categoriesData";

const categoryPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const categoryPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const categoryPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const categoryPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const categoryPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";
const categoryTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const categoryTableCellClass = "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const categoryStickyCellClass = "bg-white transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";

const productCountFilters = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "0 sản phẩm" },
  { value: "1-50", label: "1–50 sản phẩm" },
  { value: "51-100", label: "51–100 sản phẩm" },
  { value: "100+", label: "Trên 100 sản phẩm" },
];

type CategoryFieldKey = "name" | "project" | "productCount" | "description" | "featured" | "visibleStatus" | "actions";

const categoryFields: { key: CategoryFieldKey; label: string }[] = [
  { key: "name", label: "Tên danh mục" },
  { key: "project", label: "Thuộc dự án" },
  { key: "productCount", label: "Số sản phẩm" },
  { key: "description", label: "Mô tả" },
  { key: "featured", label: "Nổi bật" },
  { key: "visibleStatus", label: "Trạng thái hiển thị" },
  { key: "actions", label: "Hành động" },
];

const defaultColumnVisibility: Record<CategoryFieldKey, boolean> = {
  name: true,
  project: true,
  productCount: true,
  description: true,
  featured: true,
  visibleStatus: true,
  actions: true,
};

function matchesProductCount(count: number, filter: string) {
  switch (filter) {
    case "0": return count === 0;
    case "1-50": return count >= 1 && count <= 50;
    case "51-100": return count >= 51 && count <= 100;
    case "100+": return count > 100;
    default: return true;
  }
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<RealEstateCategory[]>(initialRealEstateCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<RealEstateCategory | null>(null);
  const [detailCategory, setDetailCategory] = useState<RealEstateCategory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [productCountFilter, setProductCountFilter] = useState("all");
  const [columnVisibility, setColumnVisibility] = useState<Record<CategoryFieldKey, boolean>>(defaultColumnVisibility);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => new Set());

  const projectOptions = categories.filter((category) => category.type === "project");
  const blockOptions = categories.filter((category) => category.type === "block");

  const visibleFields = useMemo(
    () => categoryFields.filter((field) => columnVisibility[field.key]),
    [columnVisibility],
  );
  const isFieldVisible = (key: CategoryFieldKey) => columnVisibility[key];

  const toggleColumn = (key: CategoryFieldKey, value: boolean) => {
    setColumnVisibility((current) => ({ ...current, [key]: value }));
  };
  const selectAllColumns = () => setColumnVisibility({ ...defaultColumnVisibility });
  const resetColumns = () => setColumnVisibility(defaultColumnVisibility);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => {
      const parentName = category.parentProjectId
        ? categories.find((item) => item.id === category.parentProjectId)?.name ?? ""
        : "";

      const matchesSearch = !query
        || category.name.toLowerCase().includes(query)
        || category.slug.toLowerCase().includes(query)
        || parentName.toLowerCase().includes(query);

      const matchesProject = projectFilter === "all"
        || (category.type === "project" ? category.id === projectFilter : category.parentProjectId === projectFilter);

      const matchesBlock = blockFilter === "all" || category.id === blockFilter;

      const matchesCount = matchesProductCount(category.productIds.length, productCountFilter);

      return matchesSearch && matchesProject && matchesBlock && matchesCount;
    });
  }, [categories, search, projectFilter, blockFilter, productCountFilter]);

  const currentPageSelected = filtered.length > 0 && filtered.every((category) => selectedCategoryIds.has(category.id));
  const toggleCurrentPageSelection = () => {
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      if (currentPageSelected) {
        filtered.forEach((category) => next.delete(category.id));
      } else {
        filtered.forEach((category) => next.add(category.id));
      }
      return next;
    });
  };
  const toggleSelectedCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const openCreate = () => {
    setCategoryToEdit(null);
    setFormOpen(true);
  };

  const openEdit = (category: RealEstateCategory) => {
    setDetailOpen(false);
    setCategoryToEdit(category);
    setFormOpen(true);
  };

  const openDetail = (category: RealEstateCategory) => {
    setDetailCategory(category);
    setDetailOpen(true);
  };

  const handleSave = (category: RealEstateCategory) => {
    setCategories((current) => {
      const exists = current.some((item) => item.id === category.id);
      return exists ? current.map((item) => (item.id === category.id ? category : item)) : [...current, category];
    });
  };

  const handleDelete = (category: RealEstateCategory) => {
    const hasChildren = category.type === "project" && categories.some((item) => item.parentProjectId === category.id);
    if (hasChildren) {
      alert("Không thể xóa Dự án đang có Block / Tháp bên dưới. Vui lòng xóa Block / Tháp trước.");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      setCategories((current) => current.filter((item) => item.id !== category.id));
    }
  };

  const toggleField = (categoryId: string, field: "featured" | "visible", value: boolean) => {
    setCategories((current) => current.map((item) => (item.id === categoryId ? { ...item, [field]: value } : item)));
  };

  const fixedColumnCount = 2; // checkbox + Loại danh mục
  const colSpan = fixedColumnCount + visibleFields.length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold leading-7 text-slate-950">Danh mục bất động sản</h1>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">{categories.length} danh mục · {projectOptions.length} dự án</p>
        </div>
        <Button size="sm" onClick={openCreate} className="h-10 gap-2 self-start bg-slate-950 hover:bg-slate-800 sm:self-auto">
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card className={categoryPanelClass}>
        <div className={categoryPanelHeaderClass}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách danh mục</h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {filtered.length} danh mục phù hợp · {selectedCategoryIds.size} đang chọn · {visibleFields.length} cột đang hiển thị
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={categoryPanelMetaClass}>{filtered.length} kết quả</span>
              {selectedCategoryIds.size > 0 && (
                <span className={`${categoryPanelMetaClass} border-blue-200 bg-blue-50 text-blue-700`}>
                  {selectedCategoryIds.size} đang chọn
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={categoryPanelToolbarClass}>
          <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm danh mục..."
                aria-label="Tìm kiếm danh mục theo tên, mã định danh hoặc dự án"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger aria-label="Lọc theo dự án" className={`${compactFilterTriggerClass} w-40 flex-shrink-0`}>
                <SelectValue placeholder="Dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {projectOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger aria-label="Lọc theo Block / Tháp" className={`${compactFilterTriggerClass} w-40 flex-shrink-0`}>
                <SelectValue placeholder="Block / Tháp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả block</SelectItem>
                {blockOptions.map((block) => (
                  <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={productCountFilter} onValueChange={setProductCountFilter}>
              <SelectTrigger aria-label="Lọc theo số lượng sản phẩm" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                <SelectValue placeholder="Số lượng sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {productCountFilters.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" aria-label="Chọn cột hiển thị trong bảng" className={`${compactFilterTriggerClass} w-32 flex-shrink-0 justify-between gap-2`}>
                  Hiển thị
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border border-[#E5EAF3] bg-white p-1 shadow-md">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <button type="button" onClick={selectAllColumns} className="text-xs font-medium text-slate-700 hover:underline">Chọn tất cả</button>
                  <button type="button" onClick={resetColumns} className="text-xs font-medium text-slate-700 hover:underline">Đặt lại</button>
                </div>
                <DropdownMenuSeparator />
                {categoryFields.map((field) => (
                  <DropdownMenuCheckboxItem
                    key={field.key}
                    checked={columnVisibility[field.key]}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => toggleColumn(field.key, checked === true)}
                  >
                    {field.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="max-h-[calc(100dvh-320px)] min-h-[420px] max-w-full overflow-auto bg-white">
          <Table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
            <TableHeader className="sticky top-0 z-20">
              <TableRow>
                <TableHead className="sticky left-0 z-40 w-12 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-2 py-2 text-center text-[11px] text-slate-600 shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>
                  <button
                    type="button"
                    aria-label="Chọn tất cả danh mục đang hiển thị"
                    aria-pressed={currentPageSelected}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${currentPageSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                    onClick={toggleCurrentPageSelection}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className={`${categoryTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Loại danh mục</TableHead>
                {visibleFields.filter((field) => field.key !== "actions").map((field) => (
                  <TableHead key={field.key} className={`${categoryTableHeaderClass} ${field.key === "description" ? "w-64" : "w-44"}`} style={{ fontWeight: 650 }}>
                    {field.label}
                  </TableHead>
                ))}
                {isFieldVisible("actions") && (
                  <TableHead className="sticky right-0 z-40 h-10 w-14 border-b border-l border-[#DDE5F0] bg-[#F6F8FB] px-0 py-2 text-center text-[11px] text-slate-600 shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>...</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => {
                const parentProject = category.parentProjectId
                  ? categories.find((item) => item.id === category.parentProjectId)
                  : undefined;
                const isSelected = selectedCategoryIds.has(category.id);

                return (
                  <TableRow
                    key={category.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mở chi tiết danh mục ${category.name}`}
                    data-state={isSelected ? "selected" : undefined}
                    className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) return;
                      openDetail(category);
                    }}
                    onKeyDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDetail(category);
                      }
                    }}
                  >
                    <TableCell className={`td-select sticky left-0 z-10 h-11 w-12 border-b border-r border-[#E5EAF3] px-2 py-1.5 text-center shadow-[6px_0_12px_-12px_rgba(15,23,42,0.45)] ${categoryStickyCellClass}`}>
                      <button
                        type="button"
                        className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                        title="Chọn dòng"
                        aria-label={`Chọn dòng ${category.name}`}
                        aria-pressed={isSelected}
                        onClick={() => toggleSelectedCategory(category.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                    <TableCell className={`${categoryTableCellClass} w-36`}>
                      <Badge variant="outline" className="text-xs">
                        {category.type === "project" ? "Dự án" : "Block / Tháp"}
                      </Badge>
                    </TableCell>
                    {isFieldVisible("name") && (
                      <TableCell className={`${categoryTableCellClass} w-44`}>
                        <span className="font-medium text-slate-900">{category.name}</span>
                      </TableCell>
                    )}
                    {isFieldVisible("project") && (
                      <TableCell className={`${categoryTableCellClass} w-44 text-slate-600`}>
                        {parentProject?.name ?? "—"}
                      </TableCell>
                    )}
                    {isFieldVisible("productCount") && (
                      <TableCell className={`${categoryTableCellClass} w-44 text-slate-600`}>
                        {category.productIds.length}
                      </TableCell>
                    )}
                    {isFieldVisible("description") && (
                      <TableCell className={`${categoryTableCellClass} w-64 truncate text-slate-600`}>
                        {category.description || "—"}
                      </TableCell>
                    )}
                    {isFieldVisible("featured") && (
                      <TableCell className={`${categoryTableCellClass} w-44`} onClick={(event) => event.stopPropagation()}>
                        <Switch checked={category.featured} onCheckedChange={(checked) => toggleField(category.id, "featured", checked)} />
                      </TableCell>
                    )}
                    {isFieldVisible("visibleStatus") && (
                      <TableCell className={`${categoryTableCellClass} w-44`} onClick={(event) => event.stopPropagation()}>
                        <Switch checked={category.visible} onCheckedChange={(checked) => toggleField(category.id, "visible", checked)} />
                      </TableCell>
                    )}
                    {isFieldVisible("actions") && (
                      <TableCell className={`td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-[#E5EAF3] px-0 py-1.5 text-center shadow-[-6px_0_12px_-12px_rgba(15,23,42,0.45)] ${categoryStickyCellClass}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" aria-label={`Thao tác với danh mục ${category.name}`} className="rounded-md p-1.5 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border border-[#E5EAF3] bg-white p-1 shadow-md">
                            <DropdownMenuItem onClick={() => openDetail(category)} className="gap-2 text-sm">
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(category)} className="gap-2 text-sm">
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(category)} className="gap-2 text-sm text-red-600">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
                    {categories.length === 0 ? "Chưa có danh mục nào. Nhấn \"Thêm danh mục\" để bắt đầu." : "Không tìm thấy danh mục phù hợp."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={categoryPanelFooterClass}>
          <div>Hiển thị {filtered.length} / {categories.length} danh mục</div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filtered.length === 0 ? "0-0" : `1-${filtered.length}`} of {filtered.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        categoryToEdit={categoryToEdit}
        projectOptions={projectOptions}
      />

      <CategoryDetailSheet
        category={detailCategory}
        categories={categories}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
      />
    </div>
  );
}
