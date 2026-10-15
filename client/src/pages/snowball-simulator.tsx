import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Snowflake, 
  TrendingUp, 
  Wallet, 
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  Info
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import { useSeo } from "@/lib/seo";
import { simulate } from "@/lib/dividend-engine";
import { SnowballContentKo, SnowballContentEn } from "@/content/snowball-content";
// 차트는 용량이 커서 나중에 불러와요
const SnowballChart = lazy(() => import("@/components/snowball-chart"));

interface YearlyData {
  year: number;
  portfolioStart: number;
  portfolioEnd: number;
  annualDividend: number;
  contributionAnnual: number;
  dividendToContributionRatio: number;
  netGap: number;
}

interface SimulationResult {
  yearlyData: YearlyData[];
  snowballYear: number | null;
  finalPortfolio: number;
  totalDividends: number;
}

export default function SnowballSimulator() {
  const [location] = useLocation();
  const isEnglish = location.startsWith('/en');
  useSeo("snowball", isEnglish ? "en" : "ko");
  
  const [initialInvestmentStr, setInitialInvestmentStr] = useState("10,000,000");
  const [dividendYieldStr, setDividendYieldStr] = useState("4.0");
  const [dividendGrowthStr, setDividendGrowthStr] = useState("5.0");
  const [priceGrowthStr, setPriceGrowthStr] = useState("4.0");
  const [monthlyContributionStr, setMonthlyContributionStr] = useState("500,000");
  const [investmentPeriodStr, setInvestmentPeriodStr] = useState("15");
  const [reinvestDividends, setReinvestDividends] = useState(true);
  
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const formatWithCommas = (value: string): string => {
    const cleaned = value.replace(/,/g, '').replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    return Number(cleaned).toLocaleString('ko-KR');
  };

  const initialInvestment = parseNumber(initialInvestmentStr);
  const dividendYield = parseNumber(dividendYieldStr);
  const dividendGrowth = parseNumber(dividendGrowthStr);
  const priceGrowth = parseNumber(priceGrowthStr);
  const monthlyContribution = parseNumber(monthlyContributionStr);
  const investmentPeriod = parseInt(investmentPeriodStr) || 0;

  const t = {
    title: isEnglish ? "Dividend Snowball Simulator" : "배당 스노우볼 시뮬레이터",
    subtitle: isEnglish 
      ? "Calculate when dividends start exceeding your contributions (assumption-based simulation)."
      : "배당이 배당을 낳기 시작하는 전환점을 계산합니다 (가정 기반 시뮬레이션).",
    form: {
      initialInvestment: isEnglish ? "Initial Investment (USD)" : "초기 투자금 (원)",
      dividendYield: isEnglish ? "Expected Dividend Yield (%/year)" : "예상 배당률 (연 %)",
      dividendGrowth: isEnglish ? "Dividend Growth Rate (%/year)" : "배당 성장률 (연 %)",
      priceGrowth: isEnglish ? "Price Growth Rate (%/year)" : "주가 상승률 (연 %)",
      monthlyContribution: isEnglish ? "Monthly Contribution (USD)" : "월 추가 투자금 (원)",
      investmentPeriod: isEnglish ? "Investment Period (years)" : "투자 기간 (년)",
      reinvestDividends: isEnglish ? "Reinvest Dividends" : "배당금 재투자",
    },
    results: {
      snowballPoint: isEnglish ? "Snowball Transition Point" : "스노우볼 전환점",
      snowballFound: isEnglish 
        ? (year: number) => `From year ${year}, annual dividends exceed annual contributions.`
        : (year: number) => `${year}년 차부터 연 배당금이 연간 추가 투자금을 초과합니다.`,
      snowballNotFound: isEnglish
        ? (years: number) => `Within the ${years}-year period, annual dividends do not exceed annual contributions.`
        : (years: number) => `설정한 투자 기간(${years}년) 내에는 연 배당금이 연간 추가 투자금을 초과하지 않습니다.`,
      disclaimer: isEnglish
        ? "This result is a simulation based on your assumptions and may differ from actual results."
        : "본 결과는 입력한 가정에 따른 시뮬레이션이며, 실제 결과와 다를 수 있습니다.",
      annualContribution: isEnglish ? "Annual Contribution" : "연간 투자금",
      annualDividend: isEnglish ? "Annual Dividend" : "해당 연도 연 배당금",
      exceeds: isEnglish ? "Exceeds" : "초과",
      timeline: isEnglish ? "Transition Timeline" : "전환점 타임라인",
      transitionPoint: isEnglish ? "Transition" : "전환점",
      notYet: isEnglish ? "Not yet" : "미도달",
      yearlyTable: isEnglish ? "Yearly Breakdown" : "연도별 상세",
      year: isEnglish ? "Year" : "연도",
      portfolioValue: isEnglish ? "Total Assets" : "총 자산",
      dividendContributionRatio: isEnglish ? "Dividend/Contribution" : "배당/투자 비율",
      gap: isEnglish ? "Gap (Dividend - Contribution)" : "차이 (배당-투자)",
    },
    insights: {
      title: isEnglish ? "Key Insights" : "참고 사항",
      points: isEnglish ? [
        "Higher monthly contributions mean a higher annual threshold to exceed, which may delay the transition point.",
        "Changes in dividend yield or growth rate assumptions will shift the transition point.",
      ] : [
        "월 투자금이 클수록 넘어야 할 연간 기준이 높아져 전환점이 늦어질 수 있습니다.",
        "배당률/성장률 가정이 달라지면 전환점도 달라집니다.",
      ],
    },
    assumptions: {
      title: isEnglish ? "Notes" : "참고사항",
      points: isEnglish ? [
        "Dividend rates and amounts are not fixed and may fluctuate.",
        "Pre-tax figures. Fees and exchange rates are not reflected; price changes follow your price growth assumption.",
        "This tool is a simulation to assist decision-making, not investment advice.",
      ] : [
        "배당률/배당금은 고정이 아니며 변동될 수 있습니다.",
        "세전 기준이에요. 수수료와 환율은 반영하지 않았고, 주가는 입력한 주가 상승률대로 움직인다고 가정했어요.",
        "본 도구는 투자 조언이 아닌, 의사결정 보조를 위한 시뮬레이션입니다.",
      ],
    },
    links: {
      reinvestCalc: isEnglish ? "Calculate with Reinvestment Calculator" : "배당 재투자 계산기에서 내 조건 계산하기",
      goalCalc: isEnglish ? "Check with Goal Calculator" : "목표 배당금 계산기로 목표 점검하기",
    },
    errors: {
      negative: isEnglish ? "Cannot be negative" : "음수는 입력할 수 없습니다",
      yieldRequired: isEnglish ? "Dividend yield must be greater than 0" : "배당률은 0보다 커야 합니다",
      periodRange: isEnglish ? "Investment period must be between 1 and 60 years" : "투자 기간은 1~60년 사이여야 합니다",
    },
  };


  const formatCurrency = (amount: number) => {
    if (isEnglish) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validationErrors = useMemo(() => {
    const newErrors: Record<string, string> = {};

    if (initialInvestment < 0) newErrors.initialInvestment = t.errors.negative;
    if (monthlyContribution < 0) newErrors.monthlyContribution = t.errors.negative;
    if (dividendYield <= 0) newErrors.dividendYield = t.errors.yieldRequired;
    if (dividendGrowth < 0) newErrors.dividendGrowth = t.errors.negative;
    if (investmentPeriod < 1 || investmentPeriod > 60) newErrors.investmentPeriod = t.errors.periodRange;

    return newErrors;
  }, [initialInvestment, monthlyContribution, dividendYield, dividendGrowth, investmentPeriod, t.errors]);

  // 입력 오류는 상태로 따로 두지 않고 바로 계산해요 (첫 화면에서 불필요한 다시 그리기를 막아요)
  const errors = validationErrors;

  const isValid = Object.keys(validationErrors).length === 0;

  const simulationResult: SimulationResult | null = useMemo(() => {
    if (!isValid) return null;
    if (dividendYield <= 0 || investmentPeriod < 1) return null;

    // 재투자 계산기와 같은 계산 엔진을 써요 (주가·배당을 따로 움직이는 월 단위 모델, 세전 기준)
    const sim = simulate({
      initialInvestment,
      monthlyInvestment: monthlyContribution,
      years: investmentPeriod,
      dividendYield,
      dividendGrowthRate: dividendGrowth,
      priceGrowthRate: priceGrowth,
      drip: reinvestDividends,
      account: "tax_free",
    });
    const contributionAnnual = monthlyContribution * 12;
    let prevEnd = initialInvestment;
    const yearlyData: YearlyData[] = sim.yearlyData.map((row) => {
      const item: YearlyData = {
        year: row.year,
        portfolioStart: Math.round(prevEnd),
        portfolioEnd: row.totalAssets,
        annualDividend: row.annualDividends,
        contributionAnnual: Math.round(contributionAnnual),
        dividendToContributionRatio: contributionAnnual > 0 ? row.annualDividends / contributionAnnual : 0,
        netGap: Math.round(row.annualDividends - contributionAnnual),
      };
      prevEnd = row.totalAssets;
      return item;
    });

    return {
      yearlyData,
      snowballYear: sim.snowballYear,
      finalPortfolio: sim.finalAssets,
      totalDividends: sim.totalDividends,
    };
  }, [initialInvestment, dividendYield, dividendGrowth, priceGrowth, monthlyContribution, investmentPeriod, reinvestDividends, isValid]);

  const reinvestHref = isEnglish ? "/en" : "/";
  const goalHref = isEnglish ? "/en/goal" : "/goal";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker={t.title}
        title={isEnglish ? <>When do dividends <span className="text-mint">outrun</span> your savings?</> : <>배당이 내 저축을 <span className="text-mint">앞지르는</span> 순간</>}
        subtitle={t.subtitle}
      />

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1 lg:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {isEnglish ? "Input" : "입력"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialInvestment">{t.form.initialInvestment}</Label>
              <Input
                id="initialInvestment"
                type="text"
                inputMode="numeric"
                value={initialInvestmentStr}
                onChange={(e) => setInitialInvestmentStr(formatWithCommas(e.target.value))}
                placeholder="10,000,000"
              />
              {errors.initialInvestment && <p className="text-sm text-coral">{errors.initialInvestment}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendYield">{t.form.dividendYield}</Label>
              <Input
                id="dividendYield"
                type="text"
                inputMode="decimal"
                value={dividendYieldStr}
                onChange={(e) => setDividendYieldStr(e.target.value)}
                placeholder="4.0"
              />
              {errors.dividendYield && <p className="text-sm text-coral">{errors.dividendYield}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendGrowth">{t.form.dividendGrowth}</Label>
              <Input
                id="dividendGrowth"
                type="text"
                inputMode="decimal"
                value={dividendGrowthStr}
                onChange={(e) => setDividendGrowthStr(e.target.value)}
                placeholder="0.0"
              />
              {errors.dividendGrowth && <p className="text-sm text-coral">{errors.dividendGrowth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceGrowth">{t.form.priceGrowth}</Label>
              <Input
                id="priceGrowth"
                type="text"
                inputMode="decimal"
                value={priceGrowthStr}
                onChange={(e) => setPriceGrowthStr(e.target.value)}
                placeholder="4.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">{t.form.monthlyContribution}</Label>
              <Input
                id="monthlyContribution"
                type="text"
                inputMode="numeric"
                value={monthlyContributionStr}
                onChange={(e) => setMonthlyContributionStr(formatWithCommas(e.target.value))}
                placeholder="500,000"
              />
              {errors.monthlyContribution && <p className="text-sm text-coral">{errors.monthlyContribution}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentPeriod">{t.form.investmentPeriod}</Label>
              <Input
                id="investmentPeriod"
                type="number"
                min="1"
                max="60"
                value={investmentPeriodStr}
                onChange={(e) => setInvestmentPeriodStr(e.target.value)}
                placeholder="15"
              />
              {errors.investmentPeriod && <p className="text-sm text-coral">{errors.investmentPeriod}</p>}
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="reinvestDividends">{t.form.reinvestDividends}</Label>
              <Switch
                id="reinvestDividends"
                checked={reinvestDividends}
                onCheckedChange={setReinvestDividends}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {simulationResult ? (
            <>
              {/* Snowball Point Badge */}
              <Card className={simulationResult.snowballYear ? 'panel-hero !border-mint/40' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${simulationResult.snowballYear ? 'bg-mint/15 text-mint' : 'bg-surface-3 text-muted-foreground'}`}>
                      <Snowflake className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{t.results.snowballPoint}</h3>
                      <p className={`text-[17px] leading-snug ${simulationResult.snowballYear ? 'font-semibold text-mint' : 'text-muted-foreground'}`}>
                        {simulationResult.snowballYear 
                          ? t.results.snowballFound(simulationResult.snowballYear)
                          : t.results.snowballNotFound(investmentPeriod)
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{t.results.disclaimer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.results.annualContribution}</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(monthlyContribution * 12)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={simulationResult.snowballYear ? 'border-2 border-mint/60 bg-mint/10' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${simulationResult.snowballYear ? 'bg-mint' : 'bg-gold/10'}`}>
                        <TrendingUp className={`h-5 w-5 ${simulationResult.snowballYear ? 'text-foreground' : 'text-gold'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{t.results.annualDividend}</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(
                            simulationResult.snowballYear 
                              ? simulationResult.yearlyData[simulationResult.snowballYear - 1].annualDividend
                              : simulationResult.yearlyData[simulationResult.yearlyData.length - 1].annualDividend
                          )}
                        </p>
                      </div>
                      {simulationResult.snowballYear && (
                        <span className="px-2 py-1 bg-mint text-foreground text-xs font-bold rounded">
                          {t.results.exceeds}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transition Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isEnglish ? "Dividend vs Contribution Chart" : "배당금 vs 기여금 추이"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Suspense fallback={null}>
                      <SnowballChart
                        data={simulationResult.yearlyData}
                        snowballYear={simulationResult.snowballYear}
                        isEnglish={isEnglish}
                        formatCurrency={formatCurrency}
                      />
                    </Suspense>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {isEnglish 
                      ? "The snowball point is where the green area rises above the gold dashed line"
                      : "초록 영역(연 배당금)이 금색 점선(연간 투자금)을 넘는 지점이 전환점이에요"}
                  </p>
                </CardContent>
              </Card>

              {/* Yearly Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.results.yearlyTable}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">{t.results.year}</th>
                          <th className="text-right py-2 px-2">{t.results.portfolioValue}</th>
                          <th className="text-right py-2 px-2">{isEnglish ? "Dividend" : "연 배당금"}</th>
                          <th className="text-right py-2 px-2">{isEnglish ? "Contribution" : "연간 투자금"}</th>
                          <th className="text-right py-2 px-2">{t.results.dividendContributionRatio}</th>
                          <th className="text-right py-2 px-2">{t.results.gap}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResult.yearlyData.map((data) => {
                          const isTransitionPoint = simulationResult.snowballYear === data.year;
                          return (
                            <tr 
                              key={data.year} 
                              className={`border-b ${isTransitionPoint ? 'bg-iris/10 font-semibold' : ''}`}
                            >
                              <td className="py-2 px-2">
                                {data.year}
                                {isTransitionPoint && (
                                  <span className="ml-1 text-mint">●</span>
                                )}
                              </td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.portfolioEnd)}</td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.annualDividend)}</td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.contributionAnnual)}</td>
                              <td className="text-right py-2 px-2">{data.dividendToContributionRatio.toFixed(2)}x</td>
                              <td className={`text-right py-2 px-2 ${data.netGap >= 0 ? 'text-mint' : 'text-coral'}`}>
                                {data.netGap >= 0 ? '+' : ''}{formatCurrency(data.netGap)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card className="bg-surface-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t.insights.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {t.insights.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-subtle">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <CardContent className="text-center">
                <Snowflake className="h-12 w-12 text-subtle mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {isEnglish ? "Enter your investment details" : "투자 정보를 입력하세요"}
                </h3>
                <p className="text-muted-foreground">
                  {isEnglish ? "Fill in the form to see when your dividends exceed contributions" : "배당이 기여금을 초과하는 시점을 확인하세요"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assumptions/Disclaimer */}
      <Collapsible open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen} className="mt-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-surface-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gold" />
                  {t.assumptions.title}
                </span>
                {isDisclaimerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.assumptions.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Internal Links */}
      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { href: reinvestHref, label: t.links.reinvestCalc, icon: TrendingUp, color: "bg-gold/10 text-gold" },
          { href: goalHref, label: t.links.goalCalc, icon: Target, color: "bg-iris/10 text-iris" },
        ].map((c) => (
          <Link key={c.href} href={c.href}>
            <span className="panel group flex items-center gap-4 p-5 transition-colors hover:border-border-strong">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-[15px] font-semibold text-foreground">{c.label}</span>
              <ArrowRight className="h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </span>
          </Link>
        ))}
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}

      {isEnglish ? <SnowballContentEn /> : <SnowballContentKo />}
    </div>
  );
}
