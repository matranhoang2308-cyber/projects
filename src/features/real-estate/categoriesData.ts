export type RealEstateCategoryType = "project" | "block";

export interface RealEstateCategory {
  id: string;
  type: RealEstateCategoryType;
  name: string;
  slug: string;
  /** Only set when type === "block" — the parent Dự án. */
  parentProjectId?: string;
  productIds: string[];
  description?: string;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateProduct {
  id: string;
  name: string;
  apartmentCode: string;
  imageUrl: string;
  status: string;
  price: number;
  area: number;
  /** Id of the parent Block / Tháp category (RealEstateCategory with type === "block"). */
  blockId: string;
  floor: number;
  productType: string;
}

export const realEstateProducts: RealEstateProduct[] = [
  {
    id: "SP-001",
    name: "Căn hộ Harmonie A1-0812",
    apartmentCode: "A1-0812",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=480&q=80",
    status: "Đã bán",
    price: 2_400_000_000,
    area: 78,
    blockId: "CAT-002",
    floor: 8,
    productType: "Căn hộ",
  },
  {
    id: "SP-002",
    name: "Căn hộ Harmonie A2-1104",
    apartmentCode: "A2-1104",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=480&q=80",
    status: "Còn trống",
    price: 2_950_000_000,
    area: 92,
    blockId: "CAT-002",
    floor: 11,
    productType: "Căn hộ",
  },
  {
    id: "SP-005",
    name: "Penthouse Harmonie A-3801",
    apartmentCode: "A-3801",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=480&q=80",
    status: "Đang giữ chỗ",
    price: 15_600_000_000,
    area: 210,
    blockId: "CAT-002",
    floor: 38,
    productType: "Penthouse",
  },
  {
    id: "SP-003",
    name: "Shophouse Vitalis C-11",
    apartmentCode: "C-11",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=480&q=80",
    status: "Đã bán",
    price: 3_600_000_000,
    area: 120,
    blockId: "CAT-003",
    floor: 1,
    productType: "Shophouse",
  },
  {
    id: "SP-004",
    name: "Biệt thự Vitalis B2-05",
    apartmentCode: "B2-05",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=480&q=80",
    status: "Còn trống",
    price: 8_100_000_000,
    area: 260,
    blockId: "CAT-003",
    floor: 1,
    productType: "Biệt thự",
  },
  {
    id: "SP-006",
    name: "Studio Vitalis B1-0203",
    apartmentCode: "B1-0203",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=480&q=80",
    status: "Đã cọc",
    price: 650_000_000,
    area: 32,
    blockId: "CAT-003",
    floor: 2,
    productType: "Studio",
  },
];

export const initialRealEstateCategories: RealEstateCategory[] = [
  {
    id: "CAT-001",
    type: "project",
    name: "IKIVILLAGE",
    slug: "ikivillage",
    productIds: [],
    description: "Khu đô thị nghỉ dưỡng phức hợp gồm nhiều Block / Tháp căn hộ và biệt thự.",
    featured: true,
    visible: true,
    createdAt: "01/02/2026",
    updatedAt: "01/02/2026",
  },
  {
    id: "CAT-002",
    type: "block",
    name: "Harmonie",
    slug: "ikivillage-harmonie",
    parentProjectId: "CAT-001",
    productIds: ["SP-001", "SP-002", "SP-005"],
    description: "Tháp căn hộ cao tầng hướng hồ trung tâm.",
    featured: true,
    visible: true,
    createdAt: "03/02/2026",
    updatedAt: "12/04/2026",
  },
  {
    id: "CAT-003",
    type: "block",
    name: "Vitalis",
    slug: "ikivillage-vitalis",
    parentProjectId: "CAT-001",
    productIds: ["SP-003", "SP-004", "SP-006"],
    featured: false,
    visible: true,
    createdAt: "03/02/2026",
    updatedAt: "03/02/2026",
  },
];

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatVnd(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
  return value.toLocaleString("vi-VN");
}

export function todayVn() {
  return new Date().toLocaleDateString("vi-VN");
}
