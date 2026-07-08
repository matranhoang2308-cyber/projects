import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { templates, contractOptions } from "./addendumData";
import { AddendumCreateStep1 } from "./AddendumCreateStep1";
import { AddendumCreateStep2, emptyNewOwnerFields, type NewOwnerFields } from "./AddendumCreateStep2";
import { AddendumCreateStep3 } from "./AddendumCreateStep3";
import { addendumSelectTriggerClass, cn } from "./addendumStyles";

const steps = [
  { id: 1, label: "Chọn HĐ và mẫu phụ lục" },
  { id: 2, label: "Nội dung thay đổi" },
  { id: 3, label: "Hoàn tất" },
];

interface AddendumCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddendumCreateModal({ open, onClose, onSuccess }: AddendumCreateModalProps) {
  const [step, setStep] = useState(1);
  const [selectedContract, setSelectedContract] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-04-15");
  const [fields, setFields] = useState<NewOwnerFields>(emptyNewOwnerFields);
  const [attachedFile, setAttachedFile] = useState(false);
  const [draftMode, setDraftMode] = useState("draft");

  const contract = contractOptions.find((c) => c.value === selectedContract);
  const template = templates.find((t) => t.id === selectedTemplate);
  const canStep1 = Boolean(selectedContract && selectedTemplate);

  function handleClose() {
    setStep(1);
    setSelectedContract("");
    setSelectedTemplate("");
    setFields(emptyNewOwnerFields);
    setAttachedFile(false);
    onClose();
  }

  function handleFieldChange(key: keyof NewOwnerFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden p-0" aria-describedby={undefined}>
        {/* Header + stepper — circle/connector classes match ContractTransferDialog's
            stepper exactly (design/addendum-consistency-checklist.md #6); current step
            uses the system's slate-900, not the blue Figma calls for. */}
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <DialogTitle className="text-slate-900">Tạo phụ lục</DialogTitle>
            <button type="button" onClick={handleClose} aria-label="Đóng" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-0">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    step > s.id ? "border-emerald-500 bg-emerald-500 text-white"
                      : step === s.id ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-400"
                  )}>
                    {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <p className={cn(
                    "hidden whitespace-nowrap text-xs sm:block",
                    step === s.id ? "font-medium text-slate-900" : step > s.id ? "text-emerald-600" : "text-slate-400"
                  )}>{s.label}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("mx-2 h-px flex-1", step > s.id ? "bg-emerald-300" : "bg-slate-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <AddendumCreateStep1
              selectedContract={selectedContract}
              onSelectContract={setSelectedContract}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
          )}
          {step === 2 && (
            <AddendumCreateStep2
              contract={contract}
              template={template}
              effectiveDate={effectiveDate}
              fields={fields}
              onChange={handleFieldChange}
              attachedFile={attachedFile}
              onAttach={() => setAttachedFile(true)}
            />
          )}
          {step === 3 && (
            <AddendumCreateStep3
              contract={contract}
              template={template}
              effectiveDate={effectiveDate}
              fields={fields}
              attachedFile={attachedFile}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-white px-6 py-4">
          <Select value={draftMode} onValueChange={setDraftMode}>
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[110px]")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="save">Lưu nháp</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-sm" onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}>
              {step === 1 ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {step === 1 ? "Đóng" : "Quay lại"}
            </Button>
            {step < 3 ? (
              <Button className="gap-2 bg-slate-950 text-sm hover:bg-slate-800" disabled={step === 1 && !canStep1} onClick={() => setStep((s) => s + 1)}>
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2 bg-slate-950 text-sm hover:bg-slate-800" onClick={() => { onSuccess(); handleClose(); }}>
                <Check className="h-4 w-4" />Hoàn tất
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
