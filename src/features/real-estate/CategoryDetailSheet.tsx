import { useState } from "react";
import type { ReactNode } from "react";
import { Building2, CalendarClock, Layers, Package, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { formatVnd, realEstateProducts, type RealEstateCategory, type RealEstateProduct } from "./categoriesData";

const productStatusClass: Record<string, string> = {
  "Đã bán": "bg-slate-100 text-slate-700 ring-slate-200",
  "Còn trống": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Đang giữ chỗ": "bg-amber-50 text-amber-700 ring-amber-200",
  "Đã cọc": "bg-blue-50 text-blue-700 ring-blue-200",
};

const categoryTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const categoryTableCellClass = "h-12 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle";

function InfoGrid({ items }: { items: { icon: typeof Building2; label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <item.icon className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
          <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

interface CategoryDetailSheetProps {
  category: RealEstateCategory | null;
  categories: RealEstateCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (category: RealEstateCategory) => void;
}

export function CategoryDetailSheet({ category, categories, open, onOpenChange, onEdit }: CategoryDetailSheetProps) {
  const [selectedProduct, setSelectedProduct] = useState<RealEstateProduct | null>(null);
  const [productSheetOpen, setProductSheetOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="top"
          className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1200px]"
          aria-describedby={undefined}
        >
          <SheetClose className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 z-50">
            <X className="h-4 w-4" />
          </SheetClose>
          {category && (
            <CategoryDetailContent
              category={category}
              categories={categories}
              onEdit={() => onEdit(category)}
              onOpenProduct={(product) => {
                setSelectedProduct(product);
                setProductSheetOpen(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      <ProductDetailSheet
        product={selectedProduct}
        blockName={selectedProduct ? categories.find((item) => item.id === selectedProduct.blockId)?.name : undefined}
        open={productSheetOpen}
        onOpenChange={setProductSheetOpen}
      />
    </>
  );
}

function CategoryDetailContent({
  category,
  categories,
  onEdit,
  onOpenProduct,
}: {
  category: RealEstateCategory;
  categories: RealEstateCategory[];
  onEdit: () => void;
  onOpenProduct: (product: RealEstateProduct) => void;
}) {
  const parentProject = category.parentProjectId ? categories.find((item) => item.id === category.parentProjectId) : undefined;
  const products = realEstateProducts.filter((product) => category.productIds.includes(product.id));
  const productTypes = Array.from(new Set(products.map((product) => product.productType)));
  const isVisible = category.visible;

  const project = category.type === "project" ? category.name : parentProject?.name ?? "—";
  const block = category.type === "block" ? category.name : "—";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SheetTitle className="sr-only">Chi tiết danh mục {category.name}</SheetTitle>

      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 pr-14">
        <h2 className="text-base text-slate-950" style={{ fontWeight: 700 }}>Chi tiết danh mục</h2>
        <Button variant="outline" onClick={onEdit} className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
          Chỉnh sửa
        </Button>
      </div>

      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[26px] leading-8 text-slate-950" style={{ fontWeight: 750 }}>{category.name}</h3>
          <span className={`h-2.5 w-2.5 rounded-full ${isVisible ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />
          <span className="text-sm text-slate-600">{isVisible ? "Đang hiển thị" : "Đang ẩn"}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>ID danh mục: <span className="text-slate-800" style={{ fontWeight: 650 }}>{category.id}</span></span>
          <span className="text-slate-300">•</span>
          <span>Ngày tạo: <span className="text-slate-800" style={{ fontWeight: 650 }}>{category.createdAt}</span></span>
          <span className="text-slate-300">•</span>
          <span>Cập nhật lần cuối: <span className="text-slate-800" style={{ fontWeight: 650 }}>{category.updatedAt}</span></span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <Section title="Tổng quan">
          <InfoGrid
            items={[
              { icon: Tag, label: "Tên danh mục", value: category.name },
              { icon: Package, label: "Tổng số bất động sản", value: `${category.productIds.length}` },
              { icon: Building2, label: "Trạng thái", value: isVisible ? "Đang hiển thị" : "Đang ẩn" },
              { icon: CalendarClock, label: "Thời gian tạo", value: category.createdAt },
              { icon: CalendarClock, label: "Thời gian cập nhật", value: category.updatedAt },
            ]}
          />
        </Section>

        <Section title="Thông tin phân loại">
          <InfoGrid
            items={[
              { icon: Building2, label: "Dự án", value: project },
              { icon: Layers, label: "Block / Tháp", value: block },
              { icon: Tag, label: "Loại sản phẩm", value: productTypes.length > 0 ? productTypes.join(", ") : "—" },
              { icon: Package, label: "Tổng sản phẩm", value: `${category.productIds.length}` },
            ]}
          />
        </Section>

        <Section title={`Danh sách bất động sản (${products.length})`}>
          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
            <Table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className={`${categoryTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Mã BĐS</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Mã căn hộ</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-20`} style={{ fontWeight: 650 }}>Hình ảnh</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Trạng thái</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-28`} style={{ fontWeight: 650 }}>Giá bán</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-24`} style={{ fontWeight: 650 }}>Diện tích</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Block / Tháp</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-20`} style={{ fontWeight: 650 }}>Tầng</TableHead>
                  <TableHead className={`${categoryTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Loại sản phẩm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="h-12 hover:bg-[#F8FAFC]">
                    <TableCell className={`${categoryTableCellClass} w-28`}>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(product)}
                        className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        {product.id}
                      </button>
                    </TableCell>
                    <TableCell className={`${categoryTableCellClass} w-32 text-slate-700`}>{product.apartmentCode}</TableCell>
                    <TableCell className={`${categoryTableCellClass} w-20`}>
                      <div className="h-9 w-12 overflow-hidden rounded-md bg-slate-100">
                        <img src={product.imageUrl} alt={`Hình ảnh ${product.apartmentCode}`} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className={`${categoryTableCellClass} w-32`}>
                      <span className={`inline-flex h-6 items-center rounded-md px-2.5 text-xs ring-1 ${productStatusClass[product.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`} style={{ fontWeight: 600 }}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className={`${categoryTableCellClass} w-28 text-slate-700`}>{formatVnd(product.price)} đ</TableCell>
                    <TableCell className={`${categoryTableCellClass} w-24 text-slate-700`}>{product.area} m²</TableCell>
                    <TableCell className={`${categoryTableCellClass} w-32 text-slate-600`}>
                      {categories.find((item) => item.id === product.blockId)?.name ?? "—"}
                    </TableCell>
                    <TableCell className={`${categoryTableCellClass} w-20 text-slate-600`}>{product.floor}</TableCell>
                    <TableCell className={`${categoryTableCellClass} w-32 text-slate-600`}>{product.productType}</TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                      Chưa có bất động sản nào được gán vào danh mục này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Section>
      </div>
    </div>
  );
}
