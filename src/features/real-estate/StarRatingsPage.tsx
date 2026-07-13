import { Star } from "lucide-react";
import { RealEstatePlaceholderPage } from "./RealEstatePlaceholderPage";

export function StarRatingsPage() {
  return (
    <RealEstatePlaceholderPage
      eyebrow="Quản lý bất động sản"
      title="Đánh giá sao"
      description="Khung màn hình đã sẵn sàng. Bảng dữ liệu, bộ lọc và thao tác đánh giá sẽ được kết nối ở giai đoạn triển khai tương ứng."
      icon={Star}
    />
  );
}
