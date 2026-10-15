/**
 * 계산기 아래 본문 영역의 공통 조각 — 검색엔진이 읽는 설명·예시·FAQ를 같은 모양으로 보여줘요.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Faq } from "@/content/faq";

export function ContentArticle({ children }: { children: ReactNode }) {
  return <article className="mx-auto mt-16 max-w-3xl space-y-14 border-t border-border pt-14">{children}</article>;
}

export function Section({ id, kicker, title, children }: { id?: string; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {kicker && <p className="kicker mb-2">{kicker}</p>}
      <h2 className="text-[22px] font-bold leading-snug tracking-[-0.03em] sm:text-[26px]">{title}</h2>
      <div className="content-prose mt-4">{children}</div>
    </section>
  );
}

export function DataTable({ caption, headers, rows, note }: { caption?: string; headers: string[]; rows: (string | ReactNode)[][]; note?: string }) {
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
        <table className="data-table data-table-tight w-full">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={h} className={i > 0 ? "!text-right" : ""}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j > 0 ? "text-right" : "!whitespace-normal font-medium text-foreground [overflow-wrap:normal]"}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <figcaption className="mt-2 text-[12.5px] leading-relaxed text-subtle">{note}</figcaption>}
    </figure>
  );
}

export function FaqList({ items, title = "자주 묻는 질문" }: { items: Faq[]; title?: string }) {
  return (
    <section id="faq" className="scroll-mt-24">
      <p className="kicker mb-2">FAQ</p>
      <h2 className="text-[22px] font-bold tracking-[-0.03em] sm:text-[26px]">{title}</h2>
      <div className="mt-5 divide-y divide-border rounded-[var(--radius)] border border-border bg-card">
        {items.map((f) => (
          <details key={f.q} className="group px-5 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15.5px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              <h3 className="font-semibold">{f.q}</h3>
              <ChevronDown className="h-5 w-5 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-5 text-[15px] leading-[1.75] text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function RelatedLinks({ title = "함께 쓰면 좋은 계산기", items }: { title?: string; items: { href: string; title: string; desc: string }[] }) {
  return (
    <section>
      <h2 className="text-[20px] font-bold tracking-[-0.03em]">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href}>
            <span className="panel group flex h-full items-start gap-3 p-4 transition-colors hover:border-border-strong">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-foreground">{it.title}</span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-muted-foreground">{it.desc}</span>
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-subtle group-hover:text-foreground" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Updated({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] text-subtle">{children}</p>;
}
