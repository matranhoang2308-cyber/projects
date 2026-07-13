import { Package } from "lucide-react";
import { RealEstatePlaceholderPage } from "./RealEstatePlaceholderPage";

export function ProductsPage() {
  return (
    <RealEstatePlaceholderPage
      eyebrow="Quản lý bất động sản"
      title="Sản phẩm"
      description="Khung màn hình đã sẵn sàng. Bảng sản phẩm, bộ lọc và biểu mẫu chi tiết sẽ được kết nối ở giai đoạn triển khai tương ứng."
      icon={Package}
    />
  );
}
