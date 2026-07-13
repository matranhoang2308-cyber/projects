import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  realEstateProducts,
  slugify,
  todayVn,
  type RealEstateCategory,
  type RealEstateCategoryType,
} from "./categoriesData";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: RealEstateCategory) => void;
  categoryToEdit: RealEstateCategory | null;
  /** All Dự án categories, used to populate "Thuộc dự án". Excludes the category being edited. */
  projectOptions: RealEstateCategory[];
}

interface Draft {
  type: RealEstateCategoryType;
  name: string;
  slug: string;
  parentProjectId: string;
  productIds: string[];
  featured: boolean;
  visible: boolean;
}

const emptyDraft: Draft = {
  type: "project",
  name: "",
  slug: "",
  parentProjectId: "",
  productIds: [],
  featured: false,
  visible: true,
};

const inputClass = "h-10 border-slate-200 bg-white text-sm focus-visible:ring-slate-400";
const selectTriggerClass = "h-10 w-full border-slate-200 bg-white";

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-slate-700">
        {required && <span className="text-red-600">* </span>}
        {label}
      </Label>
      {children}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function CategoryFormDialog({ open, onOpenChange, onSave, categoryToEdit, projectOptions }: CategoryFormDialogProps) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (categoryToEdit) {
      setDraft({
        type: categoryToEdit.type,
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        parentProjectId: categoryToEdit.parentProjectId ?? "",
        productIds: categoryToEdit.productIds,
        featured: categoryToEdit.featured,
        visible: categoryToEdit.visible,
      });
      setSlugTouched(true);
    } else {
      setDraft(emptyDraft);
      setSlugTouched(false);
    }
    setErrors({});
  }, [open, categoryToEdit]);

  const availableParentProjects = useMemo(
    () => projectOptions.filter((project) => project.id !== categoryToEdit?.id),
    [projectOptions, categoryToEdit],
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleNameChange = (value: string) => {
    set("name", value);
    if (!slugTouched) set("slug", slugify(value));
  };

  const toggleProduct = (productId: string) => {
    setDraft((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "Vui lòng nhập tên danh mục.";
    if (!draft.slug.trim()) nextErrors.slug = "Vui lòng nhập mã định danh.";
    if (draft.type === "block" && !draft.parentProjectId) nextErrors.parentProjectId = "Vui lòng chọn dự án cha.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const now = todayVn();
    const category: RealEstateCategory = {
      id: categoryToEdit ? categoryToEdit.id : `CAT-${Date.now().toString().slice(-6)}`,
      type: draft.type,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      parentProjectId: draft.type === "block" ? draft.parentProjectId : undefined,
      productIds: draft.productIds,
      featured: draft.featured,
      visible: draft.visible,
      createdAt: categoryToEdit ? categoryToEdit.createdAt : now,
      updatedAt: now,
    };

    onSave(category);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto border-slate-200 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          <DialogDescription>Quản lý cấu trúc Dự án và Block / Tháp chứa sản phẩm bất động sản.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField label="Loại danh mục" required>
            <Select value={draft.type} onValueChange={(value: RealEstateCategoryType) => set("type", value)}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Chọn loại danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Dự án</SelectItem>
                <SelectItem value="block">Block / Tháp</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Tên danh mục" required error={errors.name}>
            <Input
              autoFocus
              value={draft.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Nhập tên danh mục"
              className={inputClass}
            />
          </FormField>

          <FormField label="Mã định danh" required error={errors.slug}>
            <Input
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", event.target.value);
              }}
              placeholder="ma-dinh-danh"
              className={inputClass}
            />
          </FormField>

          {draft.type === "block" && (
            <FormField label="Thuộc dự án" required error={errors.parentProjectId}>
              <Select value={draft.parentProjectId} onValueChange={(value) => set("parentProjectId", value)}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Chọn dự án cha" />
                </SelectTrigger>
                <SelectContent>
                  {availableParentProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField label="Gán sản phẩm bất động sản">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {realEstateProducts.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox
                    checked={draft.productIds.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  {product.name}
                </label>
              ))}
            </div>
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
            <Label className="text-sm font-medium text-slate-700">Nổi bật</Label>
            <Switch checked={draft.featured} onCheckedChange={(checked) => set("featured", checked)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
            <Label className="text-sm font-medium text-slate-700">Hiển thị</Label>
            <Switch checked={draft.visible} onCheckedChange={(checked) => set("visible", checked)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10">
            Đóng
          </Button>
          <Button type="button" onClick={handleSave} className="h-10 bg-slate-950 px-5 text-white hover:bg-slate-800">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
