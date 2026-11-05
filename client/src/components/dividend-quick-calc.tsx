import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { simulate } from "@/lib/dividend-engine";
import { krwShort } from "@/lib/format";

/**
 * 종목·ETF 페이지 안에서 바로 쓰는 배당금 계산기.
 * 일반계좌(배당 세금 taxPct%) 기준으로, 넣은 돈·기간에 따라 월 배당과 자산을 보여줘요.
 */
interface Props {
  /** 화면에 부를 이름 (예: "SCHD", "코카콜라") */
  name: string;
  yieldPct: number;
  dg: number;
  pg: number;
  /** 일반계좌 배당 세금 (%) */
  taxPct: number;
  /** 자세히 계산하기 링크 */
  detailHref: string;
  detailLabel?: string;
}

const fieldLabel = "mb-1.5 block text-[13px] font-medium text-muted-foreground";
const affix = "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[13.5px] text-subtle";

/** 100만원 아래는 10원 단위까지, 그 위는 "1억 2,345만원" */
const won = (n: number) => (Math.abs(n) < 1_000_000 ? `${(Math.round(n / 10) * 10).toLocaleString("ko-KR")}원` : krwShort(n));

const toNum = (s: string, min: number, max: number) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return isFinite(n) ? Math.min(Math.max(n, min), max) : 0;
};

const YEARS = [5, 10, 20, 30] as const;

export default function DividendQuickCalc({ name, yieldPct, dg, pg, taxPct, detailHref, detailLabel = "더 자세히 계산하기" }: Props) {
  const [initialMan, setInitialMan] = useState("1000");
  const [monthlyMan, setMonthlyMan] = useState("30");
  const [years, setYears] = useState<number>(10);
  const [drip, setDrip] = useState(true);
  const [open, setOpen] = useState(false);
  const [yStr, setYStr] = useState(String(yieldPct));
  const [dgStr, setDgStr] = useState(String(dg));
  const [pgStr, setPgStr] = useState(String(pg));

  const initial = toNum(initialMan, 0, 1_000_000) * 10_000;
  const monthly = toNum(monthlyMan, 0, 100_000) * 10_000;
  const y = toNum(yStr, 0, 30);
  const tax = taxPct / 100;

  const r = useMemo(
    () =>
      simulate({
        initialInvestment: initial,
        monthlyInvestment: monthly,
        years,
        dividendYield: y,
        dividendGrowthRate: toNum(dgStr, -20, 30),
        priceGrowthRate: toNum(pgStr, -20, 30),
        drip,
        account: "custom",
        customTaxRate: taxPct,
      }),
    [initial, monthly, years, y, dgStr, pgStr, drip, taxPct]
  );

  const nowMonthly = (initial * (y / 100) * (1 - tax)) / 12;
  const last = r.yearlyData[r.yearlyData.length - 1];
  const laterMonthly = (last?.annualDividends ?? 0) / 12;
  const maxBar = Math.max(1, ...r.yearlyData.map((row) => row.annualDividends));
  const empty = initial <= 0 && monthly <= 0;

  const money = (label: string, value: string, set: (s: string) => void) => (
    <div>
      <label className={fieldLabel}>{label}</label>
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          className="pr-12 text-[16px] font-semibold"
          value={value}
          placeholder="0"
          onChange={(e) => set(e.target.value.replace(/[^0-9]/g, "").slice(0, 7))}
        />
        <span className={`${affix} right-3.5`}>만원</span>
      </div>
    </div>
  );
  const pct = (label: string, value: string, set: (s: string) => void) => (
    <div>
      <label className={fieldLabel}>{label}</label>
      <div className="relative">
        <Input type="text" inputMode="decimal" className="pr-8" value={value} onChange={(e) => set(e.target.value.replace(/[^0-9.\-]/g, "").slice(0, 6))} />
        <span className={`${affix} right-3.5`}>%</span>
      </div>
    </div>
  );

  return (
    <section className="panel-hero p-5 sm:p-6" aria-labelledby="quick-calc">
      <p className="kicker text-gold">바로 계산</p>
      <h2 id="quick-calc" className="mt-1 scroll-mt-24 text-[19px] font-bold tracking-[-0.02em] sm:text-[21px]">
        {name} 배당금 계산기
      </h2>
      <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
        넣을 돈과 기간을 바꾸면 한 달에 받는 배당(세후)과 {drip ? "배당을 다시 투자했을 때" : "배당을 받아 쓸 때"} 자산이 바로 바뀌어요.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {money("처음 넣을 돈", initialMan, setInitialMan)}
        {money("매달 더 넣을 돈", monthlyMan, setMonthlyMan)}
      </div>

      <div className="mt-4">
        <p className={fieldLabel} id="qc-years">
          기간
        </p>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="qc-years">
          {YEARS.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={years === n}
              data-active={years === n}
              onClick={() => setYears(n)}
              className="chip !px-2 !py-2.5 text-center text-[13.5px] font-medium text-foreground"
            >
              {n}년
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="qc-drip" className="flex items-center gap-2.5 text-[14px] font-medium text-foreground">
          <Switch id="qc-drip" checked={drip} onCheckedChange={setDrip} />
          배당 재투자
        </label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          가정 {open ? "접기" : "바꾸기"}
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-3 gap-2.5 rounded-xl border border-border bg-[hsl(var(--surface-2))] p-3">
          {pct("배당률", yStr, setYStr)}
          {pct("배당 성장률", dgStr, setDgStr)}
          {pct("주가 상승률", pgStr, setPgStr)}
          <p className="col-span-3 text-[12px] leading-relaxed text-subtle">
            배당 성장률·주가 상승률은 1년 평균으로 넣어요. 기본값은 이 종목의 최근 흐름을 보고 보수적으로 잡았어요.
          </p>
        </div>
      )}

      {empty ? (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-[14px] text-subtle">넣을 돈을 입력하면 바로 계산해요.</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2.5" aria-live="polite">
            <div className="rounded-xl border border-border bg-[hsl(var(--surface-2))] px-4 py-3">
              <p className="text-[12px] text-subtle">지금 넣으면 한 달 배당</p>
              <p className="num mt-1 text-[18px] font-bold text-foreground sm:text-[20px]">{won(nowMonthly)}</p>
              <p className="mt-0.5 text-[11.5px] text-subtle">처음 넣은 돈 기준 · 세후</p>
            </div>
            <div className="rounded-xl border border-gold/30 bg-gold/[0.07] px-4 py-3">
              <p className="text-[12px] text-subtle">{years}년 뒤 한 달 배당</p>
              <p className="num mt-1 text-[18px] font-bold text-gold sm:text-[20px]">{won(laterMonthly)}</p>
              <p className="mt-0.5 text-[11.5px] text-subtle">{years}년째 1년 배당 ÷ 12 · 세후</p>
            </div>
            <div className="rounded-xl border border-border bg-[hsl(var(--surface-2))] px-4 py-3">
              <p className="text-[12px] text-subtle">{years}년 뒤 자산</p>
              <p className="num mt-1 text-[16px] font-semibold text-foreground sm:text-[18px]">{krwShort(r.finalAssets)}</p>
              <p className="mt-0.5 text-[11.5px] text-subtle">넣은 돈 {krwShort(r.totalInvested)}</p>
            </div>
            <div className="rounded-xl border border-border bg-[hsl(var(--surface-2))] px-4 py-3">
              <p className="text-[12px] text-subtle">{years}년 동안 받은 배당</p>
              <p className="num mt-1 text-[16px] font-semibold text-foreground sm:text-[18px]">{krwShort(r.totalDividends)}</p>
              <p className="mt-0.5 text-[11.5px] text-subtle">세후 합계</p>
            </div>
          </div>

          <figure className="mt-5">
            <figcaption className="mb-2 flex items-baseline justify-between text-[12px] text-subtle">
              <span>해마다 받는 배당 (세후)</span>
              <span className="num">{krwShort(maxBar)}</span>
            </figcaption>
            <div className="flex h-24 items-end gap-[3px]" role="img" aria-label={`1년째 ${krwShort(r.yearlyData[0]?.annualDividends ?? 0)}에서 ${years}년째 ${krwShort(last?.annualDividends ?? 0)}로 늘어요`}>
              {r.yearlyData.map((row) => (
                <div
                  key={row.year}
                  title={`${row.year}년째: ${krwShort(row.annualDividends)}`}
                  className="flex-1 rounded-t-[3px] bg-gold/70"
                  style={{ height: `${Math.max(2, (row.annualDividends / maxBar) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-subtle">
              <span>1년</span>
              <span>{years}년</span>
            </div>
          </figure>
        </>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-subtle">
          일반계좌 배당 세금 {taxPct}%를 뺀 금액이에요. 주가·배당이 가정대로 움직인다고 본 예시라 실제와 달라질 수 있어요.
        </p>
        <Link href={detailHref}>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-[13.5px] font-semibold text-foreground transition-colors hover:border-gold hover:text-gold">
            {detailLabel} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
