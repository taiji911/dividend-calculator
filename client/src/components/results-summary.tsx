import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage } from "@/lib/i18n";

interface Props {
  results: CalculationResults;
  formatCurrency: (n: number) => string;
  formatShort: (n: number) => string;
}

/** 결과 맨 위 요약 — 한눈에 보는 핵심 숫자 */
export default function ResultsSummary({ results, formatCurrency, formatShort }: Props) {
  const isEn = getCurrentLanguage() === "en";
  const last = results.yearlyData[results.yearlyData.length - 1];
  if (!last) return null;

  const years = last.year;
  const principal = last.totalInvested;
  const total = results.finalAssets;
  const gain = Math.max(0, total - principal);
  const gainPct = principal > 0 ? (gain / principal) * 100 : 0;
  const principalShare = total > 0 ? Math.min(100, (principal / total) * 100) : 100;
  const monthly = last.annualDividends / 12;

  return (
    <div className="space-y-3">
      <section className="panel-hero p-5 sm:p-7">
        <p className="kicker text-gold/90">{isEn ? `After ${years} years` : `${years}년 뒤 예상 자산`}</p>
        <p className="num mt-2 text-[38px] font-bold leading-none tracking-[-0.04em] text-foreground sm:text-[52px]">
          {formatShort(total)}
        </p>
        <p className="num mt-2 text-[13px] text-subtle">
          {formatCurrency(total)}
          <span className="mx-2 text-border-strong">|</span>
          {isEn ? "Annualized return" : "연평균 수익률"} <span className="font-semibold text-foreground">{results.cagr.toFixed(1)}%</span>
        </p>

        {/* 원금 vs 늘어난 돈 비율 막대 */}
        <div className="mt-6">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full bg-iris" style={{ width: `${principalShare}%` }} />
            <div className="h-full bg-mint" style={{ width: `${100 - principalShare}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <span className="dot bg-iris" />
                {isEn ? "Principal" : "넣은 돈"}
              </p>
              <p className="num mt-0.5 text-[16px] font-semibold text-foreground">{formatShort(principal)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <span className="dot bg-mint" />
                {isEn ? "Growth" : "늘어난 돈"}
              </p>
              <p className="num mt-0.5 text-[16px] font-semibold text-mint">
                +{formatShort(gain)} <span className="text-[13px] font-medium text-mint/80">({gainPct.toFixed(0)}%)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {(results.exitTax > 0 || results.account === "pension" || results.warnings.length > 0) && (
        <div className="space-y-2">
          {results.exitTax > 0 && (
            <div className="note note-warn flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">ISA 만기 때 낼 세금 (순이익 중 비과세 한도 초과분 × 9.9%)</span>
              <span className="num font-semibold text-foreground">
                −{formatShort(results.exitTax)} <span className="font-normal text-subtle">→ 세후 {formatShort(results.finalAfterTax)}</span>
              </span>
            </div>
          )}
          {results.account === "pension" && (
            <div className="note note-info text-muted-foreground">
              연금으로 받을 때 연금소득세 3.3~5.5%(나이에 따라)가 붙어요. 1년에 받는 사적연금이 1,500만원을 넘으면 종합과세나 16.5% 분리과세 중에서 골라야 해요.
            </div>
          )}
          {results.warnings.map((w) => (
            <div key={w} className="note note-risk text-muted-foreground">{w}</div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isEn ? "Monthly dividend" : "월 배당금", sub: isEn ? `in year ${years}` : results.account === "taxable_kr" || results.account === "taxable_us" || results.account === "custom" ? `${years}년차 · 세후` : `${years}년차 · 세전`, value: monthly, accent: true },
          { label: isEn ? "Annual dividend" : "연 배당금", sub: isEn ? `in year ${years}` : `${years}년차`, value: last.annualDividends },
          { label: isEn ? "Total dividends" : "누적 배당금", sub: isEn ? `${years} yrs` : `${years}년 합계`, value: results.totalDividends },
        ].map((s) => (
          <div key={s.label} className="panel px-3.5 py-4 sm:px-5">
            <p className="text-[12px] font-medium text-muted-foreground sm:text-[13px]">{s.label}</p>
            <p className={`num mt-1.5 text-[16px] font-bold leading-tight sm:text-[21px] ${s.accent ? "text-gold" : "text-foreground"}`}>
              {formatShort(s.value)}
            </p>
            <p className="mt-1 text-[11.5px] text-subtle">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
