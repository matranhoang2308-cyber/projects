import { Construction, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CustomerBookingDashboardPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <span>Khách hàng</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Khách hàng đặt chỗ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-900">Dashboard</span>
        </nav>
        <h1 className="text-xl font-semibold leading-7 text-slate-950">Dashboard</h1>
      </div>

      {/* Body Card */}
      <Card className="flex flex-col items-center justify-center p-12 text-center border border-slate-200 bg-white shadow-sm rounded-lg min-h-[360px]">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <Construction className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Đang phát triển</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Tính năng Dashboard khách hàng đặt chỗ sẽ được triển khai ở bước tiếp theo.
        </p>
      </Card>
    </div>
  );
}
