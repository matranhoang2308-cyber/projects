export type DatePreset = "today" | "7d" | "30d" | "quarter" | "year" | "custom";

export interface DashboardFilters {
  datePreset: DatePreset;
  from?: string;
  to?: string;
  project?: string;
  zone?: string;
  building?: string;
  productType?: string;
  agency?: string;
  productId?: string;
  productStatus?: "sold" | "available";
  dossierStatus?: string;
  paymentStage?: string;
  customerId?: string;
  salesUnit?: string;
  apartmentType?: string;
  paymentStatus?: string;
}

export interface ReportTypeOption { label: string; value: string }

export interface DashboardFilterOptions {
  projects: { id: string; name: string }[];
  zones: { id: string; name: string; project: string }[];
  buildings: { id: string; name: string; zone: string }[];
  productTypes: string[];
  agencies: string[];
  products: { id: string; name: string }[];
  dossierStatuses: string[];
  paymentStages: string[];
  customers: { id: string; name: string }[];
  salesUnits: string[];
  apartmentTypes: string[];
  paymentStatuses: string[];
}

export interface DashboardBootstrap {
  reportTypes: ReportTypeOption[];
  filterOptions: DashboardFilterOptions;
  defaultReportType: string;
}

export interface SalesInventorySummary {
  inventory: { totalProducts: number; totalProductValue: number; soldProducts: number; availableProducts: number; absorptionRate: number };
  transactions: { totalTransactions: number; totalCustomers: number; expectedContractValue: number; averageProductValue: number };
  customers: { totalCustomers: number; signedCustomers: number; unsignedCustomers: number; totalContractValue: number; receivedAmount: number; remainingAmount: number; averageCustomerValue: number };
  meta: { updatedAt: string; source: "api" | "demo" };
}

export interface ProductChartsData {
  availableByZone: { zone: string; count: number }[];
  availableByProductType: { productType: string; count: number }[];
  valueByProductType: { productType: string; value: number }[];
  salesStatus: { name: "Đã bán" | "Chưa bán"; value: number; fill: string }[];
  zoneStatusMatrix: { zone: string; sold: number; available: number }[];
  meta: { updatedAt: string; source: "api" | "demo" };
}

export interface SalesTrendData {
  points: { date: string; soldProductCount: number; salesValue: number }[];
  meta: { updatedAt: string; source: "api" | "demo" };
}

export type TrendGroup = "day" | "week" | "month" | "year" | "custom";

export interface AgencyPerformanceData {
  agencies: { agency: string; transactionValue: number; transactionCount: number }[];
  funnel: { stage: "Giỏ hàng" | "Giữ chỗ" | "Đặt cọc" | "Hợp đồng"; count: number; fill: string }[];
  meta: { updatedAt: string; source: "api" | "demo" };
}

export interface CustomerStructureData {
  groups: { customerGroup: string; count: number; contractValue: number; fill: string }[];
  meta: { updatedAt: string; source: "api" | "demo" };
}

export interface CustomerDemographicsData {
  genders: { gender: string; count: number; fill: string }[];
  ageRanges: { ageRange: string; count: number }[];
  provinces: { province: string; count: number }[];
  meta: { updatedAt: string; source: "api" | "demo" };
}

export type CustomerRankingKind = "productCount" | "contractValue";
export type CustomerRankingSortKey = "customerCode" | "customerName" | "phoneNumber" | "productCount" | "contractValue" | "averageProductValue" | "lastPurchaseDate";

export interface CustomerRankingQuery {
  search?: string;
  minProductCount?: number;
  maxProductCount?: number;
  minContractValue?: number;
  maxContractValue?: number;
  sortBy: CustomerRankingSortKey;
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface CustomerRankingRow {
  rank: number;
  customerCode: string;
  customerName: string;
  phoneNumber: string;
  productCount: number;
  contractValue: number;
  averageProductValue: number;
  lastPurchaseDate: string;
}

export interface CustomerRankingData {
  rows: CustomerRankingRow[];
  summary: { totalCustomers: number; totalProducts: number; totalContractValue: number; averageContractValue: number };
  pagination: { page: number; pageSize: number; totalRows: number; totalPages: number };
  meta: { updatedAt: string; source: "api" | "demo" };
}

const towerBlocks = [
  { id: "vitalis", name: "Vitalis" },
  { id: "harmonie", name: "Harmonie" },
] as const;

const buildingsList = [
  { id: "toa-a", name: "Tòa A", zone: "vitalis" },
  { id: "toa-b", name: "Tòa B", zone: "vitalis" },
  { id: "toa-c", name: "Tòa C", zone: "harmonie" },
  { id: "toa-d", name: "Tòa D", zone: "harmonie" },
] as const;

const productTypes = ["Sky Garden", "Penhouse", "Sky Villa Residence", "Duplex Garden", "River View", "Garden Suite"] as const;

const demoBootstrap: DashboardBootstrap = {
  defaultReportType: "sales-inventory",
  reportTypes: [
    { label: "Giỏ hàng và bán hàng", value: "sales-inventory" },
    { label: "Hợp đồng", value: "contracts" },
    { label: "Công nợ", value: "debt" },
  ],
  filterOptions: {
    projects: [{ id: "iki-village", name: "Iki village" }],
    zones: towerBlocks.map((item) => ({ ...item, project: "iki-village" })),
    buildings: [...buildingsList],
    productTypes: [...productTypes],
    agencies: ["AKH Realty", "Đất Xanh Miền Bắc", "Cen Land", "NewstarLand", "Lâm Trà My", "Nguyễn Hoàng Phúc", "Trần Minh Khoa", "Đại lý Đông Nam", "Sàn liên kết An Phú"],
    products: [
      { id: "TM-IKV-A-0501", name: "TM-IKV-A-0501" },
      { id: "TM-IKV-B-0912", name: "TM-IKV-B-0912" },
      { id: "TM-IKV-C-1208", name: "TM-IKV-C-1208" },
      { id: "TM-IKV-A-0004", name: "TM-IKV-A-0004" },
      { id: "S1.05-12", name: "S1.05-12" },
      { id: "B3.08-22", name: "B3.08-22" },
      { id: "B1.09-03", name: "B1.09-03" },
      { id: "MT2.06-15", name: "MT2.06-15" },
      { id: "E1.14-21", name: "E1.14-21" },
      { id: "S2.03-11", name: "S2.03-11" },
      { id: "B4.04-12", name: "B4.04-12" },
      { id: "B2.05-13", name: "B2.05-13" },
      { id: "MT3.06-14", name: "MT3.06-14" },
      { id: "LR1.07-15", name: "LR1.07-15" },
      { id: "EPC.08-16", name: "EPC.08-16" },
    ],
    dossierStatuses: ["Đã cọc", "Đã phát hành", "Đã ký", "Đã đóng dấu", "Chờ trả HĐMB", "Đã trả", "Bàn giao"],
    paymentStages: ["Đợt 1", "Đợt 2", "Đợt 3", "Đợt 4", "Đợt 5", "Đợt 6"],
    customers: [
      { id: "1", name: "Nguyễn Văn An" },
      { id: "2", name: "Trần Thị Bích" },
      { id: "3", name: "Lê Minh Cường" },
      { id: "4", name: "Phạm Thị Dung" },
      { id: "5", name: "Hoàng Văn Em" },
      { id: "6", name: "Vũ Thị Phương" },
      { id: "7", name: "Đặng Văn Giang" },
      { id: "8", name: "Bùi Thị Hoa" },
      { id: "demo-1", name: "Phạm Gia Hân" },
      { id: "demo-2", name: "Đỗ Minh Quân" },
      { id: "demo-3", name: "Võ Thanh Tùng" },
      { id: "demo-4", name: "Mai Khánh Linh" },
      { id: "demo-5", name: "Bùi Quốc Việt" },
      { id: "demo-6", name: "Ngô Thu Trang" },
    ],
    salesUnits: ["AKH Realty", "Đất Xanh Miền Bắc", "Cen Land", "NewstarLand", "Lâm Trà My", "Nguyễn Hoàng Phúc", "Trần Minh Khoa", "Đại lý Đông Nam", "Sàn liên kết An Phú"],
    apartmentTypes: [...productTypes],
    paymentStatuses: ["Chưa đến hạn", "Sắp đến hạn", "Đã thanh toán", "Thanh toán một phần", "Quá hạn", "Gia hạn"],
  },
};

function waitForDemo(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 260);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

function getBaseUrl() {
  return import.meta.env.VITE_DASHBOARD_API_URL?.replace(/\/$/, "") as string | undefined;
}

export async function getDashboardBootstrap(signal?: AbortSignal): Promise<DashboardBootstrap> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoBootstrap;
  }
  const response = await fetch(`${baseUrl}/api/dashboard/bootstrap`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Dashboard bootstrap API error: ${response.status}`);
  return response.json() as Promise<DashboardBootstrap>;
}

function demoSalesSummary(filters: DashboardFilters): SalesInventorySummary {
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId, filters.productStatus].filter(Boolean).length;
  const timeFactor: Record<DatePreset, number> = { today: 0.08, "7d": 0.26, "30d": 0.58, quarter: 0.76, year: 1, custom: 0.44 };
  const scope = Math.max(0.12, timeFactor[filters.datePreset] * (1 - dimensions * 0.08));
  const totalProducts = Math.max(1, Math.round(1284 * scope));
  const soldProducts = filters.productStatus === "available" ? 0 : Math.round(totalProducts * 0.644);
  const availableProducts = filters.productStatus === "sold" ? 0 : Math.max(0, totalProducts - soldProducts);
  const effectiveTotal = soldProducts + availableProducts;
  const totalCustomers = Math.max(1, Math.round(426 * scope));
  const signedCustomers = Math.round(totalCustomers * 0.71);
  const contractValue = Math.round(986_400_000_000 * scope);
  const receivedAmount = Math.round(contractValue * 0.623);
  return {
    inventory: { totalProducts: effectiveTotal, totalProductValue: Math.round(3_248_600_000_000 * scope), soldProducts, availableProducts, absorptionRate: effectiveTotal ? soldProducts / effectiveTotal * 100 : 0 },
    transactions: { totalTransactions: Math.round(352 * scope), totalCustomers, expectedContractValue: Math.round(1_126_800_000_000 * scope), averageProductValue: 2_530_000_000 },
    customers: { totalCustomers, signedCustomers, unsignedCustomers: totalCustomers - signedCustomers, totalContractValue: contractValue, receivedAmount, remainingAmount: contractValue - receivedAmount, averageCustomerValue: Math.round(contractValue / totalCustomers) },
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getSalesInventorySummary(filters: DashboardFilters, signal?: AbortSignal): Promise<SalesInventorySummary> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoSalesSummary(filters);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/summary?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Sales inventory API error: ${response.status}`);
  return response.json() as Promise<SalesInventorySummary>;
}

function demoProductCharts(filters: DashboardFilters): ProductChartsData {
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId].filter(Boolean).length;
  const timeFactor: Record<DatePreset, number> = { today: 0.08, "7d": 0.26, "30d": 0.58, quarter: 0.76, year: 1, custom: 0.44 };
  const scope = Math.max(0.12, timeFactor[filters.datePreset] * (1 - dimensions * 0.08));
  const zoneSource = [
    { id: "vitalis", zone: "Vitalis", sold: 386, available: 184 },
    { id: "harmonie", zone: "Harmonie", sold: 360, available: 354 },
  ].filter((item) => !filters.zone || item.id === filters.zone);
  const matrix = zoneSource.map((item) => ({
    zone: item.zone,
    sold: filters.productStatus === "available" ? 0 : Math.round(item.sold * scope),
    available: filters.productStatus === "sold" ? 0 : Math.round(item.available * scope),
  }));
  const productTypeSource = [
    { productType: "Duplex Garden", value: 724_800_000_000, available: 126 },
    { productType: "Penhouse", value: 586_300_000_000, available: 82 },
    { productType: "Sky Garden", value: 1_126_600_000_000, available: 196 },
    { productType: "Sky Villa Residence", value: 810_900_000_000, available: 134 },
  ].filter((item) => !filters.productType || item.productType === filters.productType);
  const sold = matrix.reduce((sum, item) => sum + item.sold, 0);
  const available = matrix.reduce((sum, item) => sum + item.available, 0);
  return {
    availableByZone: matrix.map((item) => ({ zone: item.zone, count: item.available })),
    availableByProductType: productTypeSource.map((item) => ({ productType: item.productType, count: filters.productStatus === "sold" ? 0 : Math.round(item.available * scope) })),
    valueByProductType: productTypeSource.map((item) => ({ productType: item.productType, value: Math.round(item.value * scope) })),
    salesStatus: [
      { name: "Đã bán", value: sold, fill: "#2563eb" },
      { name: "Chưa bán", value: available, fill: "#f59e0b" },
    ],
    zoneStatusMatrix: matrix,
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getProductCharts(filters: DashboardFilters, signal?: AbortSignal): Promise<ProductChartsData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoProductCharts(filters);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/product-charts?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Product charts API error: ${response.status}`);
  return response.json() as Promise<ProductChartsData>;
}

function demoSalesTrends(filters: DashboardFilters, groupBy: TrendGroup, from?: string, to?: string): SalesTrendData {
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId].filter(Boolean).length;
  const scope = Math.max(0.18, 1 - dimensions * 0.09);
  const now = new Date();
  const activity = [0.68, 0.82, 0.76, 1.08, 0.94, 1.22, 1.14, 1.36, 1.18, 1.48, 1.31, 1.56];
  const count = groupBy === "year" ? 3 : groupBy === "week" ? 8 : groupBy === "custom" ? 8 : groupBy === "month" ? 12 : 10;
  const customFrom = from ? new Date(`${from}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const customTo = to ? new Date(`${to}T00:00:00`) : now;
  const customStep = Math.max(1, Math.round((customTo.getTime() - customFrom.getTime()) / 86_400_000 / Math.max(1, count - 1)));
  const points = Array.from({ length: count }, (_, index) => {
    const date = new Date(groupBy === "custom" ? customFrom : now);
    if (groupBy === "custom") date.setDate(customFrom.getDate() + index * customStep);
    else if (groupBy === "day") date.setDate(now.getDate() - (count - index - 1) * 3);
    else if (groupBy === "month") date.setMonth(index);
    else if (groupBy === "year") date.setFullYear(now.getFullYear() - (count - index - 1));
    const soldProductCount = filters.productStatus === "available" ? 0 : Math.max(0, Math.round(18 * activity[index] * scope));
    const label = groupBy === "week"
      ? `Tuần ${index + 1}`
      : groupBy === "month"
        ? `Tháng ${index + 1}`
        : groupBy === "year"
          ? String(date.getFullYear())
          : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }).replace("/", "-");
    return {
      date: label,
      soldProductCount,
      salesValue: soldProductCount * Math.round((2_280_000_000 + index * 47_000_000) * (0.96 + activity[index] * 0.04)),
    };
  });
  return { points, meta: { updatedAt: new Date().toISOString(), source: "demo" } };
}

export async function getSalesTrends(filters: DashboardFilters, groupBy: TrendGroup, from?: string, to?: string, signal?: AbortSignal): Promise<SalesTrendData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoSalesTrends(filters, groupBy, from, to);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  params.set("groupBy", groupBy);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/sales-trends?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Sales trends API error: ${response.status}`);
  return response.json() as Promise<SalesTrendData>;
}

function demoAgencyPerformance(filters: DashboardFilters): AgencyPerformanceData {
  const timeFactor: Record<DatePreset, number> = { today: 0.12, "7d": 0.34, "30d": 0.62, quarter: 0.78, year: 1, custom: 0.52 };
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.productId].filter(Boolean).length;
  const scope = Math.max(0.16, timeFactor[filters.datePreset] * (1 - dimensions * 0.08));
  const source = [
    { agency: "AKH Realty", transactionValue: 386_400_000_000, transactionCount: 128 },
    { agency: "Đất Xanh Miền Bắc", transactionValue: 298_700_000_000, transactionCount: 97 },
    { agency: "Cen Land", transactionValue: 241_900_000_000, transactionCount: 84 },
    { agency: "NewstarLand", transactionValue: 176_300_000_000, transactionCount: 61 },
  ].filter((item) => !filters.agency || item.agency === filters.agency);
  const agencies = source.map((item) => ({
    agency: item.agency,
    transactionValue: Math.round(item.transactionValue * scope),
    transactionCount: Math.round(item.transactionCount * scope),
  }));
  const inventory = Math.max(0, Math.round(1284 * scope));
  const funnelSource = [
    { stage: "Giỏ hàng" as const, ratio: 1, fill: "#2563eb" },
    { stage: "Giữ chỗ" as const, ratio: 0.58, fill: "#0891b2" },
    { stage: "Đặt cọc" as const, ratio: 0.37, fill: "#7c3aed" },
    { stage: "Hợp đồng" as const, ratio: 0.24, fill: "#16a34a" },
  ];
  return {
    agencies,
    funnel: funnelSource.map((item) => ({ stage: item.stage, count: Math.round(inventory * item.ratio), fill: item.fill })),
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getAgencyPerformance(filters: DashboardFilters, signal?: AbortSignal): Promise<AgencyPerformanceData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoAgencyPerformance(filters);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/agency-performance?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Agency performance API error: ${response.status}`);
  return response.json() as Promise<AgencyPerformanceData>;
}

function demoCustomerStructure(filters: DashboardFilters): CustomerStructureData {
  const timeFactor: Record<DatePreset, number> = { today: 0.12, "7d": 0.34, "30d": 0.62, quarter: 0.78, year: 1, custom: 0.52 };
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId, filters.productStatus].filter(Boolean).length;
  const scope = Math.max(0.16, timeFactor[filters.datePreset] * (1 - dimensions * 0.07));
  const source = [
    { customerGroup: "VIP", count: 84, contractValue: 342_800_000_000, fill: "#7c3aed" },
    { customerGroup: "Đối tác", count: 116, contractValue: 286_400_000_000, fill: "#2563eb" },
    { customerGroup: "Khách hàng mới", count: 173, contractValue: 247_900_000_000, fill: "#0891b2" },
    { customerGroup: "Nội bộ", count: 53, contractValue: 109_300_000_000, fill: "#f59e0b" },
  ];
  return {
    groups: source.map((item) => ({ ...item, count: Math.round(item.count * scope), contractValue: Math.round(item.contractValue * scope) })),
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getCustomerStructure(filters: DashboardFilters, signal?: AbortSignal): Promise<CustomerStructureData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoCustomerStructure(filters);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/customer-structure?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Customer structure API error: ${response.status}`);
  return response.json() as Promise<CustomerStructureData>;
}

function demoCustomerDemographics(filters: DashboardFilters): CustomerDemographicsData {
  const timeFactor: Record<DatePreset, number> = { today: 0.12, "7d": 0.34, "30d": 0.62, quarter: 0.78, year: 1, custom: 0.52 };
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId, filters.productStatus].filter(Boolean).length;
  const scope = Math.max(0.16, timeFactor[filters.datePreset] * (1 - dimensions * 0.07));
  const scale = (count: number) => Math.round(count * scope);
  return {
    genders: [
      { gender: "Nam", count: scale(218), fill: "#2563eb" },
      { gender: "Nữ", count: scale(194), fill: "#ec4899" },
      { gender: "Chưa cập nhật", count: scale(14), fill: "#94a3b8" },
    ],
    ageRanges: [
      { ageRange: "Dưới 25", count: scale(21) },
      { ageRange: "25–34", count: scale(108) },
      { ageRange: "35–44", count: scale(156) },
      { ageRange: "45–54", count: scale(91) },
      { ageRange: "55–64", count: scale(38) },
      { ageRange: "Từ 65", count: scale(12) },
    ],
    provinces: [
      { province: "TP. Hồ Chí Minh", count: scale(142) },
      { province: "Hà Nội", count: scale(86) },
      { province: "Bình Dương", count: scale(53) },
      { province: "Đồng Nai", count: scale(41) },
      { province: "Đà Nẵng", count: scale(32) },
      { province: "Hải Phòng", count: scale(27) },
      { province: "Cần Thơ", count: scale(24) },
      { province: "Khác", count: scale(21) },
    ],
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getCustomerDemographics(filters: DashboardFilters, signal?: AbortSignal): Promise<CustomerDemographicsData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoCustomerDemographics(filters);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/customer-demographics?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Customer demographics API error: ${response.status}`);
  return response.json() as Promise<CustomerDemographicsData>;
}

function demoCustomerRankings(filters: DashboardFilters, query: CustomerRankingQuery): CustomerRankingData {
  const now = new Date();
  const isoDaysAgo = (days: number) => { const date = new Date(now); date.setDate(date.getDate() - days); return date.toISOString(); };
  const source = [
    ["KH000128", "Nguyễn Minh Anh", "0903 128 286", 8, 52_800_000_000, 0],
    ["KH000097", "Trần Quốc Huy", "0918 442 190", 6, 44_600_000_000, 1],
    ["KH000214", "Lê Thu Trang", "0938 705 412", 7, 39_900_000_000, 3],
    ["KH000185", "Phạm Hoàng Nam", "0908 631 557", 5, 34_250_000_000, 5],
    ["KH000076", "Võ Ngọc Mai", "0982 417 360", 4, 31_800_000_000, 7],
    ["KH000301", "Đặng Gia Bảo", "0932 850 144", 5, 28_750_000_000, 12],
    ["KH000142", "Bùi Thanh Hà", "0902 744 983", 3, 26_400_000_000, 18],
    ["KH000259", "Đỗ Minh Khang", "0976 381 225", 4, 24_200_000_000, 23],
    ["KH000334", "Hồ Khánh Linh", "0914 509 672", 3, 21_750_000_000, 28],
    ["KH000118", "Ngô Anh Tuấn", "0907 263 418", 4, 19_600_000_000, 30],
    ["KH000287", "Dương Bảo Châu", "0935 821 766", 2, 17_900_000_000, 42],
    ["KH000163", "Phan Đức Long", "0988 614 203", 3, 16_350_000_000, 55],
    ["KH000352", "Vũ Thảo Vy", "0905 337 891", 2, 13_800_000_000, 71],
    ["KH000226", "Mai Quang Vinh", "0912 490 635", 2, 11_500_000_000, 96],
    ["KH000371", "Tạ Mỹ Duyên", "0937 164 508", 1, 8_200_000_000, 143],
    ["KH000194", "Cao Nhật Minh", "0909 758 324", 1, 6_450_000_000, 214],
  ] as const;
  const dimensions = [filters.project, filters.zone, filters.building, filters.productType, filters.agency, filters.productId, filters.productStatus].filter(Boolean).length;
  const scope = Math.max(0.42, 1 - dimensions * 0.08);
  const from = filters.datePreset === "custom" && filters.from ? new Date(`${filters.from}T00:00:00`) : filters.datePreset === "today" ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : filters.datePreset === "7d" ? new Date(now.getTime() - 7 * 86_400_000) : filters.datePreset === "30d" ? new Date(now.getTime() - 30 * 86_400_000) : filters.datePreset === "quarter" ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1) : new Date(now.getFullYear(), 0, 1);
  const to = filters.datePreset === "custom" && filters.to ? new Date(`${filters.to}T23:59:59`) : now;
  const search = query.search?.trim().toLocaleLowerCase("vi-VN") ?? "";
  const filtered = source.map(([customerCode, customerName, phoneNumber, baseCount, baseValue, daysAgo]) => {
    const productCount = Math.max(1, Math.round(baseCount * scope));
    const contractValue = Math.round(baseValue * scope);
    return { customerCode, customerName, phoneNumber, productCount, contractValue, averageProductValue: Math.round(contractValue / productCount), lastPurchaseDate: isoDaysAgo(daysAgo) };
  }).filter((item) => {
    const purchaseDate = new Date(item.lastPurchaseDate);
    return purchaseDate >= from && purchaseDate <= to
      && (!search || item.customerName.toLocaleLowerCase("vi-VN").includes(search) || item.phoneNumber.replace(/\s/g, "").includes(search.replace(/\s/g, "")))
      && (query.minProductCount === undefined || item.productCount >= query.minProductCount)
      && (query.maxProductCount === undefined || item.productCount <= query.maxProductCount)
      && (query.minContractValue === undefined || item.contractValue >= query.minContractValue)
      && (query.maxContractValue === undefined || item.contractValue <= query.maxContractValue);
  });
  const sorted = [...filtered].sort((left, right) => {
    const a = left[query.sortBy]; const b = right[query.sortBy];
    const result = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "vi");
    return query.sortDirection === "asc" ? result : -result;
  });
  const totalRows = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const totalContractValue = filtered.reduce((sum, item) => sum + item.contractValue, 0);
  return {
    rows: sorted.slice((page - 1) * query.pageSize, page * query.pageSize).map((item, index) => ({ ...item, rank: (page - 1) * query.pageSize + index + 1 })),
    summary: { totalCustomers: totalRows, totalProducts: filtered.reduce((sum, item) => sum + item.productCount, 0), totalContractValue, averageContractValue: totalRows ? Math.round(totalContractValue / totalRows) : 0 },
    pagination: { page, pageSize: query.pageSize, totalRows, totalPages },
    meta: { updatedAt: new Date().toISOString(), source: "demo" },
  };
}

export async function getCustomerRankings(kind: CustomerRankingKind, filters: DashboardFilters, query: CustomerRankingQuery, signal?: AbortSignal): Promise<CustomerRankingData> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    await waitForDemo(signal);
    return demoCustomerRankings(filters, query);
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
  params.set("rankingType", kind);
  const response = await fetch(`${baseUrl}/api/dashboard/reports/sales-inventory/customer-rankings?${params}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Customer rankings API error: ${response.status}`);
  return response.json() as Promise<CustomerRankingData>;
}
