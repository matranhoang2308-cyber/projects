import { Layers, MapPin, Ruler, Tag, Wallet, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatVnd, type RealEstateProduct } from "./categoriesData";

const statusClass: Record<string, string> = {
  "Đã bán": "bg-slate-100 text-slate-700 ring-slate-200",
  "Còn trống": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Đang giữ chỗ": "bg-amber-50 text-amber-700 ring-amber-200",
  "Đã cọc": "bg-blue-50 text-blue-700 ring-blue-200",
};

interface ProductDetailSheetProps {
  product: RealEstateProduct | null;
  blockName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({ product, blockName, open, onOpenChange }: ProductDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full p-0 sm:max-w-xl" aria-describedby={undefined}>
        <SheetClose className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 z-50">
          <X className="h-4 w-4" />
        </SheetClose>
        {product && (
          <div className="flex h-full flex-col">
            <SheetTitle className="sr-only">Chi tiết bất động sản {product.apartmentCode}</SheetTitle>

            <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-base text-slate-950" style={{ fontWeight: 700 }}>Chi tiết bất động sản</h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img src={product.imageUrl} alt={`Hình ảnh ${product.apartmentCode}`} className="h-full w-full object-cover" />
              </div>

              <div className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[22px] leading-8 text-slate-950" style={{ fontWeight: 750 }}>{product.apartmentCode}</h3>
                  <span className={`inline-flex h-6 items-center rounded-md px-2.5 text-xs ring-1 ${statusClass[product.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`} style={{ fontWeight: 600 }}>
                    {product.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">ID bất động sản: <span className="text-slate-800" style={{ fontWeight: 650 }}>{product.id}</span></p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {[
                    { icon: Wallet, label: "Giá bán", value: `${formatVnd(product.price)} đ` },
                    { icon: Ruler, label: "Diện tích", value: `${product.area} m²` },
                    { icon: MapPin, label: "Block / Tháp", value: blockName ?? "—" },
                    { icon: Layers, label: "Tầng", value: `Tầng ${product.floor}` },
                    { icon: Tag, label: "Loại sản phẩm", value: product.productType },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-1.5">
                        <item.icon className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6">
              <SheetClose asChild>
                <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
                  Đóng
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
