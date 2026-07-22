import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { CustomerBooking, HinhThucThanhToan, GioiTinh, TinhTrangDatCho } from "../types/booking";

interface BookingImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBookings: CustomerBooking[];
  onImportSuccess: (imported: CustomerBooking[]) => void;
}

const systemFields = [
  { key: "soPhieuGQUT", label: "Số phiếu GQUT", required: true },
  { key: "sttUuTien", label: "STT ưu tiên", required: true },
  { key: "tenKhachHang", label: "Tên khách hàng", required: true },
  { key: "phaiThu", label: "Phải thu", required: true },
  { key: "daThu", label: "Đã thu", required: true },
  { key: "hinhThucThanhToan", label: "Hình thức TT", required: false },
  { key: "donViPhanPhoi", label: "Đơn vị phân phối", required: false },
  { key: "nvtv", label: "NVTV", required: false },
  { key: "cmnd", label: "CMND/CCCD", required: true },
  { key: "soDienThoai", label: "Số điện thoại", required: true },
  { key: "email", label: "Email", required: false },
  { key: "tinhTrang", label: "Tình trạng", required: false },
];

export function BookingImportDialog({
  open,
  onOpenChange,
  existingBookings,
  onImportSuccess,
}: BookingImportDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [ignoreErrors, setIgnoreErrors] = useState(true);
  const [parsedRows, setParsedRows] = useState<Array<{ data: Partial<CustomerBooking>; errors: string[] }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setStep(1);
    setFile(null);
    setFileData([]);
    setExcelHeaders([]);
    setColumnMapping({});
    setIgnoreErrors(true);
    setParsedRows([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      readExcelFile(selected);
    }
  };

  const readExcelFile = (fileToRead: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length > 0) {
          const headers = (rawJson[0] as string[]).map((h) => String(h || "").trim());
          const rows = rawJson.slice(1).filter((r) => r.length > 0);

          setExcelHeaders(headers);

          // Auto-map headers
          const autoMap: Record<string, string> = {};
          systemFields.forEach((sys) => {
            const found = headers.find(
              (h) => h.toLowerCase().includes(sys.label.toLowerCase()) || h.toLowerCase().includes(sys.key.toLowerCase())
            );
            if (found) autoMap[sys.key] = found;
          });
          setColumnMapping(autoMap);

          // Format rows as objects
          const objectRows = rows.map((r) => {
            const rowObj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              rowObj[h] = r[idx];
            });
            return rowObj;
          });
          setFileData(objectRows);
        }
      } catch (err) {
        toast.error("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.");
      }
    };
    reader.readAsBinaryString(fileToRead);
  };

  const handleDownloadSample = () => {
    const sampleHeaders = [
      "Số phiếu GQUT", "STT ưu tiên", "Tên khách hàng", "Phải thu", "Đã thu",
      "Hình thức TT", "Đơn vị phân phối", "NVTV", "CMND/CCCD", "Số điện thoại", "Email", "Tình trạng"
    ];
    const sampleData = [
      [
        "021/2025/GQUT", "021", "Lê Văn Tiến", 100000000, 100000000,
        "Chuyển khoản", "Đại lý Đất Xanh", "Lê Thị Thu", "079090001122", "0903112233", "tien.le@gmail.com", "Đặt chỗ"
      ],
      [
        "022/2025/GQUT", "022", "Trần Thị Mai", 100000000, 50000000,
        "Tiền mặt", "Đại lý Sunland", "Phạm Hoàng Long", "036090003344", "0912334455", "mai.tran@gmail.com", "Đặt chỗ"
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Dat_Cho");
    XLSX.writeFile(wb, "File_Mau_Dat_Cho.xlsx");
  };

  const processValidation = () => {
    const results: Array<{ data: Partial<CustomerBooking>; errors: string[] }> = [];

    fileData.forEach((rowObj, idx) => {
      const rowErrs: string[] = [];
      const getVal = (sysKey: string) => {
        const header = columnMapping[sysKey];
        return header ? rowObj[header] : undefined;
      };

      const soPhieuGQUT = String(getVal("soPhieuGQUT") || "").trim();
      const sttUuTien = String(getVal("sttUuTien") || "").trim();
      const tenKhachHang = String(getVal("tenKhachHang") || "").trim();
      const phaiThuRaw = getVal("phaiThu");
      const daThuRaw = getVal("daThu");
      const phaiThu = Number(phaiThuRaw) || 0;
      const daThu = Number(daThuRaw) || 0;
      const conBoSung = phaiThu - daThu;
      const cmnd = String(getVal("cmnd") || "").trim();
      const soDienThoai = String(getVal("soDienThoai") || "").trim();
      const email = String(getVal("email") || "").trim();
      const donViPhanPhoi = String(getVal("donViPhanPhoi") || "Đại lý Đất Xanh").trim();
      const nvtv = String(getVal("nvtv") || "N/A").trim();

      const htRaw = String(getVal("hinhThucThanhToan") || "").toLowerCase();
      const hinhThucThanhToan: HinhThucThanhToan = htRaw.includes("tiền") || htRaw.includes("tien") ? "TIEN_MAT" : "CHUYEN_KHOAN";

      const ttRaw = String(getVal("tinhTrang") || "").toLowerCase();
      let tinhTrang: TinhTrangDatCho = "DAT_CHO";
      if (ttRaw.includes("hoàn") || ttRaw.includes("hoan")) tinhTrang = "HOAN_TIEN";
      if (ttRaw.includes("cọc") || ttRaw.includes("coc")) tinhTrang = "CHUYEN_COC";

      // Validations
      if (!soPhieuGQUT) rowErrs.push("Thiếu số phiếu GQUT");
      else if (existingBookings.some((b) => b.soPhieuGQUT.toLowerCase() === soPhieuGQUT.toLowerCase())) {
        rowErrs.push("Trùng số phiếu với dữ liệu có sẵn");
      }
      if (!sttUuTien) rowErrs.push("Thiếu STT ưu tiên");
      if (!tenKhachHang) rowErrs.push("Thiếu tên khách hàng");
      if (phaiThu <= 0) rowErrs.push("Phải thu phải > 0");
      if (!cmnd) rowErrs.push("Thiếu CMND/CCCD");
      if (!soDienThoai) rowErrs.push("Thiếu SĐT");

      const item: Partial<CustomerBooking> = {
        id: `BK-IMP-${idx + 1}`,
        stt: existingBookings.length + idx + 1,
        soPhieuGQUT,
        ngayXacNhanGQUT: new Date().toISOString().split("T")[0],
        ngayThanhToan: new Date().toISOString().split("T")[0],
        sttUuTien,
        tenKhachHang,
        phaiThu,
        daThu,
        conBoSung,
        hinhThucThanhToan,
        noiDung: `Import từ file ${file?.name || ""}`,
        donViPhanPhoi,
        nvtv,
        cmnd,
        ngayCap: null,
        noiCap: "N/A",
        diaChiThuongTruCu: "",
        diaChiThuongTruMoi: "",
        diaChiLienHeCu: "",
        diaChiLienHeMoi: "",
        gioiTinh: "NAM",
        ngaySinh: null,
        soDienThoai,
        email,
        moiQuanHe: "Bản thân",
        tinhTrang,
      };

      results.push({ data: item, errors: rowErrs });
    });

    setParsedRows(results);
  };

  const validRows = parsedRows.filter((r) => r.errors.length === 0);
  const invalidRows = parsedRows.filter((r) => r.errors.length > 0);

  const handleExecuteImport = () => {
    const toImport = ignoreErrors ? validRows.map((r) => r.data as CustomerBooking) : parsedRows.map((r) => r.data as CustomerBooking);
    if (toImport.length === 0) {
      toast.error("Không có dòng dữ liệu hợp lệ nào để import");
      return;
    }
    onImportSuccess(toImport);
    setStep(4);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetAll(); onOpenChange(false); } }}>
      <DialogContent className="max-w-4xl bg-white p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Import danh sách khách hàng đặt chỗ từ Excel</span>
            </DialogTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-white">
              Bước {step}/4
            </span>
          </div>

          {/* Stepper progress */}
          <div className="flex items-center gap-2 text-xs font-medium pt-1">
            <span className={step >= 1 ? "text-indigo-600 font-bold" : "text-slate-400"}>1. Upload file</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 2 ? "text-indigo-600 font-bold" : "text-slate-400"}>2. Map cột</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 3 ? "text-indigo-600 font-bold" : "text-slate-400"}>3. Validate & Preview</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 4 ? "text-emerald-600 font-bold" : "text-slate-400"}>4. Kết quả</span>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 max-h-[calc(100vh-230px)] overflow-y-auto text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Tải file mẫu để đảm bảo đúng định dạng cấu trúc dữ liệu:</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadSample} className="h-8 gap-1.5 bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100">
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu (.xlsx)</span>
                </Button>
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Kéo thả file vào đây hoặc bấm để chọn file</p>
                  <p className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng .xlsx, .xls, .csv</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-slate-900">{file.name}</span>
                    <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setFileData([]); }} className="h-7 w-7 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-slate-600 font-medium">Khớp các cột từ file Excel với trường dữ liệu trong hệ thống:</p>
              <div className="grid grid-cols-2 gap-4">
                {systemFields.map((sys) => (
                  <div key={sys.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">
                      {sys.label} {sys.required && <span className="text-red-500">*</span>}
                    </span>
                    <Select
                      value={columnMapping[sys.key] || ""}
                      onValueChange={(val) => setColumnMapping((prev) => ({ ...prev, [sys.key]: val }))}
                    >
                      <SelectTrigger className="w-44 h-8 text-xs bg-white">
                        <SelectValue placeholder="-- Chọn cột Excel --" />
                      </SelectTrigger>
                      <SelectContent>
                        {excelHeaders.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="font-bold text-slate-900 mb-2">Preview 5 dòng dữ liệu đầu tiên:</p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        {excelHeaders.map((h) => (
                          <TableHead key={h} className="text-slate-700 font-semibold py-2 px-3">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileData.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          {excelHeaders.map((h) => (
                            <TableCell key={h} className="py-2 px-3">{String(row[h] ?? "—")}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    ✓ {validRows.length} hợp lệ
                  </Badge>
                  {invalidRows.length > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      ✗ {invalidRows.length} lỗi
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-err"
                    checked={ignoreErrors}
                    onCheckedChange={(c) => setIgnoreErrors(!!c)}
                  />
                  <Label htmlFor="ignore-err" className="text-xs cursor-pointer font-medium">Bỏ qua các dòng lỗi và chỉ import dòng hợp lệ</Label>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-lg">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-100 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-12 py-2 text-center">STT</TableHead>
                      <TableHead className="py-2">Số phiếu</TableHead>
                      <TableHead className="py-2">Tên khách hàng</TableHead>
                      <TableHead className="py-2 text-right">Phải thu</TableHead>
                      <TableHead className="py-2 text-right">Đã thu</TableHead>
                      <TableHead className="py-2">SĐT</TableHead>
                      <TableHead className="py-2">Trạng thái kiểm tra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((r, i) => (
                      <TableRow key={i} className={r.errors.length > 0 ? "bg-red-50/70 hover:bg-red-100/50" : ""}>
                        <TableCell className="text-center font-mono py-2">{i + 1}</TableCell>
                        <TableCell className="font-mono py-2">{r.data.soPhieuGQUT || "—"}</TableCell>
                        <TableCell className="font-medium py-2">{r.data.tenKhachHang || "—"}</TableCell>
                        <TableCell className="text-right py-2">{r.data.phaiThu ? r.data.phaiThu.toLocaleString() : 0} ₫</TableCell>
                        <TableCell className="text-right py-2">{r.data.daThu ? r.data.daThu.toLocaleString() : 0} ₫</TableCell>
                        <TableCell className="font-mono py-2">{r.data.soDienThoai || "—"}</TableCell>
                        <TableCell className="py-2">
                          {r.errors.length === 0 ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold flex items-center gap-1" title={r.errors.join(", ")}>
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {r.errors.join("; ")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Import dữ liệu thành công!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đã thêm thành công <strong className="text-emerald-700">{validRows.length}</strong> phiếu khách hàng đặt chỗ vào hệ thống.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between sm:justify-between">
          {step === 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button size="sm" disabled={!file} onClick={() => setStep(2)} className="bg-slate-950 hover:bg-slate-800 text-white gap-1">
                <span>Tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>Quay lại</Button>
              <Button size="sm" onClick={() => { processValidation(); setStep(3); }} className="bg-slate-950 hover:bg-slate-800 text-white gap-1">
                <span>Tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>Quay lại</Button>
              <Button size="sm" onClick={handleExecuteImport} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận import</span>
              </Button>
            </>
          )}

          {step === 4 && (
            <div className="w-full flex justify-end">
              <Button size="sm" onClick={() => { resetAll(); onOpenChange(false); }} className="bg-slate-950 hover:bg-slate-800 text-white">
                Đóng
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
