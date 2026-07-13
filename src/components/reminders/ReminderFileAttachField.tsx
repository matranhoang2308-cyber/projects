import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import type { ReminderFile } from "@/types/reminder";

interface ReminderFileAttachFieldProps {
  files: ReminderFile[];
  onChange: (files: ReminderFile[]) => void;
}

export function ReminderFileAttachField({ files, onChange }: ReminderFileAttachFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFile = (file: File) => {
    const newFile: ReminderFile = {
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      date: new Date().toLocaleDateString("vi-VN"),
    };
    onChange([...files, newFile]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700">Tài liệu đính kèm</label>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-4 text-center cursor-pointer transition-all duration-200 ${
          dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-400 bg-slate-50/50"
        }`}
      >
        <UploadCloud className={`h-5 w-5 ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
        <p className="text-[11px] font-medium text-slate-600">Nhấp để chọn file hoặc kéo thả vào đây</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-xs font-medium text-slate-700">{f.name}</span>
                <span className="shrink-0 text-[10px] text-slate-400">{f.size}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Xóa tài liệu ${f.name}`}
                className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
