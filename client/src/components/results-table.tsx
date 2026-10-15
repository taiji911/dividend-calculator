import { Fragment, useState } from "react";
import { ChevronDown, Flag } from "lucide-react";
import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  results: CalculationResults;
  formatCurrency: (amount: number) => string;
  targetMonthlyDividend?: number;
}

export default function ResultsTable({ results, formatCurrency, targetMonthlyDividend }: ResultsTableProps) {
  const isEn = getCurrentLanguage() === "en";
  const rows = results.yearlyData;
  const [expanded, setExpanded] = useState(rows.length <= 12);

  const targetAnnual = targetMonthlyDividend && targetMonthlyDividend > 0 ? targetMonthlyDividend * 12 : 0;
  const achievedYear = targetAnnual ? rows.find((r) => r.annualDividends >= targetAnnual)?.year ?? null : null;

  const visible = expanded ? rows : [...rows.slice(0, 5), ...rows.slice(-3)];
  const hiddenCount = rows.length - visible.length;

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-end justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
        <div>
          <p className="kicker mb-1">{isEn ? "Year by year" : "연도별"}</p>
          <h3 className="text-[17px] font-semibold">{isEn ? "Detailed results" : "연도별 상세 결과"}</h3>
        </div>
        {achievedYear && (
          <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-[12.5px] font-semibold text-gold">
            <Flag className="h-3.5 w-3.5" />
            {isEn ? `Goal in year ${achievedYear}` : `${achievedYear}년차 목표 달성`}
          </span>
        )}
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>{isEn ? "Year" : "연차"}</th>
              <th className="!text-right">{isEn ? "Principal" : "넣은 돈"}</th>
              <th className="!text-right">{isEn ? "Total assets" : "총 자산"}</th>
              <th className="!text-right">{isEn ? "Monthly div." : "월 배당"}</th>
              <th className="!text-right">{isEn ? "Cumulative div." : "누적 배당"}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              const hit = achievedYear === row.year;
              const showGap = !expanded && i === 5 && hiddenCount > 0;
              return (
                <Fragment key={row.year}>
                  {showGap && (
                    <tr>
                      <td colSpan={5} className="!py-2 text-center">
                        <button
                          type="button"
                          onClick={() => setExpanded(true)}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          {isEn ? `Show ${hiddenCount} more years` : `${hiddenCount}개 연도 더 보기`}
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )}
                  <tr className={cn(hit && "!bg-gold/[0.07]")}>
                    <td className={cn("font-medium", hit ? "text-gold" : "text-foreground")}>
                      {row.year}
                      {isEn ? "" : "년"}
                    </td>
                    <td className="text-right">{formatCurrency(row.totalInvested)}</td>
                    <td className="text-right font-semibold text-foreground">{formatCurrency(row.totalAssets)}</td>
                    <td className="text-right text-gold">{formatCurrency(row.annualDividends / 12)}</td>
                    <td className="text-right">{formatCurrency(row.cumulativeDividends)}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border px-5 py-3 text-[12px] text-subtle sm:px-6">
        {isEn ? "Monthly dividend = dividends received that year ÷ 12" : "월 배당 = 그 해 받은 배당금 ÷ 12 (일반계좌는 세후)"}
      </p>
    </section>
  );
}
