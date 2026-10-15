import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, Search, X, CalendarDays, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";
import { FAQ } from "@/content/faq";
import { CAL_ITEMS, STOCK_AS_OF_LABEL, buildCalendar, findItem, suggestFor, type Holding } from "@/lib/dividend-calendar";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const DEFAULT: Holding[] = [
  { id: "schd", amount: 10_000_000, yieldPct: 3.09 },
  { id: "mo", amount: 5_000_000, yieldPct: 6.07 },
];
const STORE_KEY = "dc.calendar.v1";
const won = (n: number) => `${(Math.round(n / 10) * 10).toLocaleString("ko-KR")}원`;
const manShort = (n: number) => (n >= 10_000 ? `${Math.round(n / 10_000).toLocaleString("ko-KR")}만` : n > 0 ? `${Math.round(n / 1000)}천` : "0");

export default function DividendCalendar() {
  useSeo("calendar", "ko");
  const [holdings, setHoldings] = useState<Holding[]>(DEFAULT);
  const [afterTax, setAfterTax] = useState(true);
  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState("");

  // 고른 종목은 이 브라우저에만 저장해요 (화면이 뜬 뒤에 불러와야 미리 만든 HTML과 어긋나지 않아요)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (Array.isArray(saved) && saved.every((h) => findItem(h.id))) setHoldings(saved);
    } catch {
      /* 저장소를 못 쓰면 기본값으로 */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(holdings));
    } catch {
      /* 무시 */
    }
  }, [holdings]);

  const cal = useMemo(() => buildCalendar(holdings, afterTax), [holdings, afterTax]);
  const chosen = holdings.map((h) => h.id);
  const suggestions = useMemo(() => suggestFor(cal.empty, chosen), [cal.empty, chosen.join(",")]);

  const add = (id: string) => {
    const it = findItem(id);
    if (!it || chosen.includes(id)) return;
    setHoldings((p) => [...p, { id, amount: 5_000_000, yieldPct: it.yield }]);
    setPicking(false);
    setQ("");
  };
  const update = (id: string, patch: Partial<Holding>) => setHoldings((p) => p.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const remove = (id: string) => setHoldings((p) => p.filter((h) => h.id !== id));

  const filtered = CAL_ITEMS.filter((i) => !chosen.includes(i.id) && (q === "" || `${i.label} ${i.sub}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="배당 달력"
        title={<>매달 배당 받는 <span className="text-gold">포트폴리오 만들기</span></>}
        subtitle="가진 종목과 금액을 넣으면 몇 월에 얼마가 들어오는지 달력으로 보여줘요. 배당이 비는 달이 있으면 그 달을 채워 줄 종목도 알려줘요."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[400px_1fr] lg:gap-6">
        {/* 입력 */}
        <section className="panel p-5 sm:p-6" aria-labelledby="mine">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="mine" className="text-[17px] font-semibold">
              내 배당 종목
            </h2>
            <span className="kicker">실시간 계산</span>
          </div>

          <ul className="space-y-3">
            {holdings.map((h) => {
              const it = findItem(h.id)!;
              return (
                <li key={h.id} className="rounded-xl border border-border bg-[hsl(var(--surface-2))] p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-foreground">{it.label}</p>
                      <p className="truncate text-[12px] text-subtle">
                        {it.sub} · {it.months.length === 12 ? "매달" : it.months.map((m) => `${m}월`).join("·")}
                      </p>
                    </div>
                    <button type="button" onClick={() => remove(h.id)} aria-label={`${it.label} 빼기`} className="rounded-md p-1 text-subtle hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_96px] gap-2">
                    <label className="relative block">
                      <span className="sr-only">투자 금액</span>
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-subtle">₩</span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        className="h-10 pl-7 text-[15px] font-semibold"
                        value={h.amount ? h.amount.toLocaleString("ko-KR") : ""}
                        placeholder="0"
                        onChange={(e) => update(h.id, { amount: parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10) })}
                      />
                    </label>
                    <label className="relative block">
                      <span className="sr-only">배당률</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="h-10 pr-7 text-[14px]"
                        value={String(h.yieldPct)}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                          update(h.id, { yieldPct: isFinite(v) ? Math.min(v, 30) : 0 });
                        }}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-subtle">%</span>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>

          {picking ? (
            <div className="mt-3 rounded-xl border border-border p-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <Input autoFocus className="h-10 pl-9" placeholder="SCHD, JEPI, 코카콜라…" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <ul className="mt-2 max-h-72 overflow-y-auto">
                {filtered.map((i) => (
                  <li key={i.id}>
                    <button type="button" onClick={() => add(i.id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[hsl(var(--surface-3))]">
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-foreground">{i.label}</span>
                        <span className="block truncate text-[12px] text-subtle">{i.sub}</span>
                      </span>
                      <span className="shrink-0 text-right text-[12px] text-subtle">
                        <span className="num block font-semibold text-gold">{i.yield}%</span>
                        {i.months.length === 12 ? "매달" : i.months.join("·") + "월"}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && <li className="px-2.5 py-3 text-[13px] text-subtle">찾는 종목이 없어요.</li>}
              </ul>
              <button type="button" onClick={() => setPicking(false)} className="mt-2 w-full rounded-lg py-2 text-[13px] text-subtle hover:text-foreground">
                닫기
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong py-3 text-[14px] font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> 종목·ETF 추가
            </button>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-subtle">배당률은 {STOCK_AS_OF_LABEL} 기준 최근 12개월 값이에요. 내 매수가 기준 배당률로 바꿔도 돼요.</p>
        </section>

        {/* 결과 */}
        <div className="space-y-5">
          <section className="panel-hero p-5 sm:p-6" aria-labelledby="cal">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="kicker text-gold">1년 예상 배당 {afterTax ? "(일반계좌 세후)" : "(세전)"}</p>
                <p id="cal" className="num mt-1 text-[34px] font-bold leading-none tracking-[-0.03em] sm:text-[40px]">
                  {won(cal.annual)}
                </p>
                <p className="mt-2 text-[13.5px] text-muted-foreground">
                  한 달 평균 <strong className="text-foreground">{won(cal.avg)}</strong>
                  {cal.empty.length > 0 ? (
                    <>
                      {" "}
                      · 배당 없는 달 <strong className="text-coral">{cal.empty.length}개월</strong>
                    </>
                  ) : (
                    <> · 매달 배당이 들어와요</>
                  )}
                </p>
              </div>
              <div className="seg !w-auto" role="tablist" aria-label="세금">
                {[
                  [true, "세후"],
                  [false, "세전"],
                ].map(([v, l]) => (
                  <button key={String(v)} type="button" role="tab" aria-selected={afterTax === v} data-active={afterTax === v} className="seg-item !px-3.5 !py-1.5" onClick={() => setAfterTax(v as boolean)}>
                    {l as string}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-12 items-end gap-1.5 sm:gap-2" style={{ height: 180 }} aria-hidden="true">
              {cal.months.map((m) => (
                <div key={m.month} className="flex h-full flex-col justify-end">
                  <span className={cn("num mb-1 text-center text-[10px] sm:text-[11px]", m.total > 0 ? "text-muted-foreground" : "text-coral")}>{manShort(m.total)}</span>
                  <div
                    className={cn("w-full rounded-t-md", m.total > 0 ? "bg-gold" : "bg-coral/25")}
                    style={{ height: m.total > 0 ? `${Math.max(6, (m.total / cal.max) * 140)}px` : "4px", opacity: m.total > 0 ? 0.55 + 0.45 * (m.total / cal.max) : 1 }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-12 gap-1.5 sm:gap-2">
              {cal.months.map((m) => (
                <span key={m.month} className={cn("text-center text-[11px] sm:text-[12px]", m.total > 0 ? "text-subtle" : "font-semibold text-coral")}>
                  {m.month}월
                </span>
              ))}
            </div>
          </section>

          {suggestions.length > 0 && (
            <section className="panel p-5" aria-labelledby="fill">
              <h2 id="fill" className="flex items-center gap-1.5 text-[16px] font-bold">
                <Lightbulb className="h-4 w-4 text-gold" /> {cal.empty.map((m) => `${m}월`).join("·")}을 채우려면
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">빈 달에 배당을 주는 종목이에요. 누르면 바로 추가돼요.</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map(({ item, cover }) => (
                  <button key={item.id} type="button" onClick={() => add(item.id)} className="chip flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-foreground">{item.label}</span>
                      <span className="block truncate text-[12px] text-subtle">
                        {item.months.join("·")}월 · 빈 달 {cover}개 채움
                      </span>
                    </span>
                    <span className="num shrink-0 text-[13px] font-semibold text-gold">{item.yield}%</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12.5px] text-subtle">
                매달 분배하는 ETF(예: <Link href="/etf/tiger-us-dividend-dowjones">TIGER 미국배당다우존스</Link>, <Link href="/etf/jepi">JEPI</Link>)를 더하면 빈 달이 한 번에
                채워져요.
              </p>
            </section>
          )}

          <section className="panel p-5" aria-labelledby="detail">
            <h2 id="detail" className="flex items-center gap-1.5 text-[16px] font-bold">
              <CalendarDays className="h-4 w-4 text-subtle" /> 달마다 들어오는 배당
            </h2>
            <ul className="mt-3 divide-y divide-border">
              {cal.months.map((m) => (
                <li key={m.month} className="flex items-baseline justify-between gap-3 py-2.5 text-[14px]">
                  <span className="w-10 shrink-0 font-semibold text-foreground">{m.month}월</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-subtle">{m.parts.length ? m.parts.map((p) => p.label).join(", ") : "배당 없음"}</span>
                  <span className={cn("num shrink-0 font-semibold", m.total > 0 ? "text-foreground" : "text-coral")}>{m.total > 0 ? won(m.total) : "-"}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <RiskNote title="계산 안내">
        지금 배당률이 1년 동안 그대로이고, 1년 배당을 지급 횟수로 똑같이 나눠 받는다고 가정했어요. 실제 금액은 분배금 변화·환율·지급일에 따라 달라지고, 지급일이
        월말·월초에 걸리면 한 달 밀리기도 해요. 특정 종목을 추천하는 게 아니에요.
      </RiskNote>

      <ContentArticle>
        <Section kicker="기본 개념" title="배당락일과 지급일, 헷갈리지 마세요">
          <ul>
            <li>
              <strong>배당락일</strong>: 이날 <strong>전까지</strong> 주식을 갖고 있어야 이번 배당을 받아요. 배당락일에 사면 이번 배당은 못 받아요.
            </li>
            <li>
              <strong>지급일</strong>: 실제로 계좌에 배당이 들어오는 날이에요. 미국은 배당락일 며칠~몇 주 뒤, 국내 상장 ETF는 기준일 다음 달 초(영업일 2일째 무렵)예요.
            </li>
          </ul>
          <p>이 달력은 실제로 돈이 들어오는 <strong>지급일이 속한 달</strong>을 기준으로 보여줘요.</p>
        </Section>

        <Section kicker="조합 예시" title="월배당 포트폴리오를 만드는 세 가지 방법">
          <DataTable
            caption="월배당 조합 예시"
            text
            headers={["방법", "예시", "특징"]}
            rows={[
              ["월배당 ETF 하나로", "TIGER 미국배당다우존스, JEPI", "가장 간단해요. ISA·연금저축에서는 국내 상장 월배당 ETF를 써요."],
              ["분기배당 3개 묶기", "1·4·7·10월(MO) + 2·5·8·11월(PG·ABBV) + 3·6·9·12월(SCHD)", "지급 달이 다른 종목을 섞어 12달을 채워요. 회사별로 고를 수 있어요."],
              ["섞어서", "SCHD + 월배당 리츠(O)", "배당성장과 매달 현금 흐름을 함께 가져가요."],
            ]}
          />
          <p>
            미국의 분기배당 ETF(SCHD·VYM·VIG·DGRO·NOBL·SPYD)는 대부분 <strong>3·6·9·12월</strong>에 몰려 있어요. 그래서 이들끼리만 섞으면 나머지 8개월이 비어요.
          </p>
        </Section>

        <FaqList items={FAQ.calendar!.ko!} />

        <RelatedLinks
          items={[
            { href: "/etf", title: "배당 ETF 정보", desc: "달력에 넣을 ETF의 배당률·총보수·배당 주기를 비교해요." },
            { href: "/", title: "배당 재투자 계산기", desc: "받은 배당을 다시 투자하면 10년 뒤 얼마가 되는지 계산해요." },
          ]}
        />

        <Updated>{STOCK_AS_OF_LABEL} 기준 배당률과 최근 1년 지급 달로 만들었어요. 출처: 각 운용사 공시, StockAnalysis 배당 내역.</Updated>
      </ContentArticle>
    </div>
  );
}
