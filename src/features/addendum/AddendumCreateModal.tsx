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
      <DialogContent className="flex max-h-[90vh] sm:max-w-4xl w-full flex-col overflow-hidden p-0" aria-describedby={undefined}>
        {/* Header + stepper */}
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <DialogTitle className="text-slate-900 font-bold text-base">Tạo phụ lục</DialogTitle>
          </div>
          <div className="flex w-full items-center gap-3 overflow-x-auto">
            {steps.map((s, index) => {
              const no = s.id;
              const done = step > no;
              const active = step === no;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-3 last:flex-none">
                  <button
                    type="button"
                    disabled={!done && !active}
                    onClick={() => done && setStep(no)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-all focus-visible:outline-none",
                      active
                        ? "border-slate-900 bg-slate-900 text-white font-bold"
                        : done
                          ? "border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300"
                          : "cursor-default border-[#E5EAF3] bg-white text-slate-400"
                    )}
                  >
                    <span className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md text-xs font-semibold",
                      active ? "bg-white/15 text-white" : done ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
                    )}>
                      {no}
                    </span>
                    {s.label}
                  </button>
                  {no < steps.length && (
                    <div className="h-px flex-1 border-t border-dashed border-slate-300 min-w-[20px]" />
                  )}
                </div>
              );
            })}
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
