import { ShieldAlert } from "lucide-react";

/** 투자 위험 고지 — 모든 계산기 하단 공통 */
export default function RiskNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="mt-10 flex gap-3 rounded-[var(--radius)] border border-border bg-surface/60 px-5 py-4">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-subtle" aria-hidden="true" />
      <div>
        <p className="text-[13px] font-semibold text-muted-foreground">{title}</p>
        <div className="mt-1 text-[13px] leading-relaxed text-subtle">{children}</div>
      </div>
    </aside>
  );
}
