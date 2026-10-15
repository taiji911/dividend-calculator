import { useState } from "react";
import { Link } from "wouter";
import { Target, Snowflake, ArrowUpRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CalculatorForm from "@/components/calculator-form";
import ResultsCharts from "@/components/results-charts";
import ResultsTable from "@/components/results-table";
import ResultsSummary from "@/components/results-summary";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { getTranslation, formatCurrencyByLanguage, currencyOptions, type Language } from "@/lib/i18n";
import { moneyShort } from "@/lib/format";
import type { SimResult } from "@/lib/dividend-engine";
import { useSeo } from "@/lib/seo";

/** 계산 결과 모양 — 계산 엔진(lib/dividend-engine.ts)의 결과를 그대로 씁니다 */
export type CalculationResults = SimResult;

/** 배당 재투자 계산기 — 한국어(/, /kr)와 영어(/en)가 같은 화면을 씁니다 */
export function ReinvestPage({ lang = "kr" }: { lang?: Language }) {
  const isEn = lang === "en";
  const t = getTranslation(lang);
  useSeo("reinvest", isEn ? "en" : "ko");
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [currency, setCurrency] = useState(isEn ? "USD" : "KRW");
  const [target, setTarget] = useState<string>("");

  const formatCurrency = (amount: number) => formatCurrencyByLanguage(amount, lang, currency);
  const formatShort = (amount: number) => moneyShort(amount, currency);
  const targetValue = parseFloat(target.replace(/,/g, "")) || 0;
  const symbol = currencyOptions[currency as keyof typeof currencyOptions]?.symbol ?? "₩";

  const lastYear = results?.yearlyData.find((r) => targetValue > 0 && r.annualDividends >= targetValue * 12)?.year;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker={isEn ? "DRIP simulator" : "배당 재투자 시뮬레이터"}
        title={isEn ? <>Watch dividends <span className="text-gold">compound</span></> : <>배당이 배당을 낳는 <span className="text-gold">복리</span>, 숫자로 보기</>}
        subtitle={t.subtitle}
      />

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr] lg:gap-6">
        {/* 입력 */}
        <div className="space-y-4">
          <CalculatorForm
            onCalculate={(r, c) => {
              setResults(r);
              if (c) setCurrency(isEn ? c : "KRW");
            }}
          />

          <div className="panel p-5">
            <label className="mb-2 flex items-center text-[13.5px] font-medium text-muted-foreground">
              <Target className="mr-1.5 h-4 w-4 text-gold" />
              {isEn ? "Target monthly dividend (optional)" : "목표 월 배당금 (선택)"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-subtle hover:text-foreground">
                    <Info className="h-[15px] w-[15px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isEn ? "We'll mark the year you reach it in the results." : "입력하면 몇 년차에 목표에 닿는지 결과 표에 표시돼요"}
                </TooltipContent>
              </Tooltip>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-subtle">{symbol}</span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-9"
                placeholder={isEn ? "1,000" : "1,000,000"}
                value={target}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setTarget(v ? Number(v).toLocaleString() : "");
                }}
              />
            </div>
            {targetValue > 0 && results && (
              <p className={`mt-2.5 text-[13px] ${lastYear ? "text-gold" : "text-muted-foreground"}`}>
                {lastYear
                  ? isEn
                    ? `You reach it in year ${lastYear}.`
                    : `${lastYear}년차에 목표 월 배당에 닿아요.`
                  : isEn
                    ? "Not reached in this period — try more years or a bigger monthly amount."
                    : "이 기간 안에는 어려워요. 기간이나 월 투자금을 늘려보세요."}
              </p>
            )}
          </div>
        </div>

        {/* 결과 */}
        <div id="results" className="min-w-0 scroll-mt-24 space-y-4">
          {results && results.yearlyData.length > 0 ? (
            <>
              <ResultsSummary results={results} formatCurrency={formatCurrency} formatShort={formatShort} />
              <ResultsCharts results={results} formatCurrency={formatShort} currency={currency} />
              <ResultsTable results={results} formatCurrency={formatShort} targetMonthlyDividend={targetValue || undefined} />
            </>
          ) : (
            <div className="space-y-3" aria-busy="true">
              <div className="panel-hero h-[230px] animate-pulse" />
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <div key={i} className="panel h-[96px] animate-pulse" />)}
              </div>
              <div className="panel h-72 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* 다음 단계 */}
      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          {
            href: isEn ? "/en/goal" : "/goal",
            icon: Target,
            color: "text-gold bg-gold/10",
            title: isEn ? "How much do I need for $1,000 a month?" : "월 100만원 배당, 원금은 얼마나 필요할까?",
            sub: isEn ? "Goal calculator" : "목표 배당금 계산기",
          },
          {
            href: isEn ? "/en/snowball" : "/snowball",
            icon: Snowflake,
            color: "text-iris bg-iris/10",
            title: isEn ? "When do dividends outrun my savings?" : "배당이 스스로 굴러가는 시점은 언제일까?",
            sub: isEn ? "Snowball simulator" : "스노우볼 시뮬레이터",
          },
        ].map((c) => (
          <Link key={c.href} href={c.href}>
            <span className="panel group flex items-center gap-4 p-5 transition-colors hover:border-border-strong">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-foreground">{c.title}</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{c.sub}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-subtle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </span>
          </Link>
        ))}
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}

      <RiskNote title={t.disclaimer.title}>{t.disclaimer.content}</RiskNote>
    </div>
  );
}

export default function Calculator() {
  return <ReinvestPage lang="kr" />;
}
