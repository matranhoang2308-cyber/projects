import type { LucideIcon } from "lucide-react";

interface RealEstatePlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function RealEstatePlaceholderPage({ eyebrow, title, description, icon: Icon }: RealEstatePlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 p-4 pb-10 md:p-6 md:pb-12">
      <header className="flex flex-col gap-2.5 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700">
          <Icon className="size-4.5 text-blue-700" /> {eyebrow}
        </div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-950">{title}</h1>
      </header>

      <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.025)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon className="size-6 text-blue-700" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">{title} chưa được cấu hình</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      </section>
    </div>
  );
}
