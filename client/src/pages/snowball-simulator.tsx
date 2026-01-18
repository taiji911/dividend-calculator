import { useState, useEffect, useMemo } from "react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

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
  
  const [initialInvestmentStr, setInitialInvestmentStr] = useState("10,000,000");
  const [dividendYieldStr, setDividendYieldStr] = useState("4.0");
  const [dividendGrowthStr, setDividendGrowthStr] = useState("0.0");
  const [monthlyContributionStr, setMonthlyContributionStr] = useState("500,000");
  const [investmentPeriodStr, setInvestmentPeriodStr] = useState("15");
  const [reinvestDividends, setReinvestDividends] = useState(true);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      annualContribution: isEnglish ? "Annual Contribution" : "연간 추가 투자금",
      annualDividend: isEnglish ? "Annual Dividend" : "해당 연도 연 배당금",
      exceeds: isEnglish ? "Exceeds" : "초과",
      timeline: isEnglish ? "Transition Timeline" : "전환점 타임라인",
      transitionPoint: isEnglish ? "Transition" : "전환점",
      notYet: isEnglish ? "Not yet" : "미도달",
      yearlyTable: isEnglish ? "Yearly Breakdown" : "연도별 상세",
      year: isEnglish ? "Year" : "연도",
      portfolioValue: isEnglish ? "Portfolio Value" : "포트폴리오 가치",
      dividendContributionRatio: isEnglish ? "Dividend/Contribution" : "배당/기여 비율",
      gap: isEnglish ? "Gap (Dividend - Contribution)" : "차이 (배당-기여)",
    },
    insights: {
      title: isEnglish ? "Key Insights" : "참고 사항",
      points: isEnglish ? [
        "Higher monthly contributions may delay the transition point (as the contribution threshold is higher).",
        "Changes in dividend yield or growth rate assumptions will shift the transition point.",
      ] : [
        "월 추가 투자금이 커질수록 전환점이 늦어질 수 있습니다 (기여 기준이 커지기 때문).",
        "배당률/성장률 가정이 달라지면 전환점도 달라집니다.",
      ],
    },
    assumptions: {
      title: isEnglish ? "Assumptions & Disclaimer" : "가정 및 면책사항",
      points: isEnglish ? [
        "Dividend rates and amounts are not fixed and may fluctuate.",
        "Taxes, fees, exchange rates, and capital gains/losses from price changes are not reflected.",
        "This tool is a simulation to assist decision-making, not investment advice.",
      ] : [
        "배당률/배당금은 고정이 아니며 변동될 수 있습니다.",
        "세금, 수수료, 환율, 주가 변동에 따른 자본손익은 반영하지 않았습니다.",
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

  useEffect(() => {
    if (isEnglish) {
      document.title = "Dividend Snowball Simulator | When Dividends Exceed Contributions";
      document.documentElement.lang = "en";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Calculate when your annual dividends exceed your annual contributions under dividend reinvestment assumptions.');
      }
    } else {
      document.title = "배당 스노우볼 시뮬레이터 | 배당이 기여금을 넘는 시점 계산";
      document.documentElement.lang = "ko";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '월 추가 투자와 배당 재투자 가정 하에서, 연 배당금이 연간 추가 투자금을 초과하는 스노우볼 전환점이 언제 발생하는지 계산합니다.');
      }
    }
  }, [isEnglish]);

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

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (initialInvestment < 0) newErrors.initialInvestment = t.errors.negative;
    if (monthlyContribution < 0) newErrors.monthlyContribution = t.errors.negative;
    if (dividendYield <= 0) newErrors.dividendYield = t.errors.yieldRequired;
    if (dividendGrowth < 0) newErrors.dividendGrowth = t.errors.negative;
    if (investmentPeriod < 1 || investmentPeriod > 60) newErrors.investmentPeriod = t.errors.periodRange;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulationResult: SimulationResult | null = useMemo(() => {
    if (!validateInputs()) return null;
    if (dividendYield <= 0 || investmentPeriod < 1) return null;

    const contributionAnnual = monthlyContribution * 12;
    const yearlyData: YearlyData[] = [];
    let snowballYear: number | null = null;
    let portfolioEnd = initialInvestment;
    let totalDividends = 0;

    for (let year = 1; year <= investmentPeriod; year++) {
      const portfolioStart = portfolioEnd;
      
      const annualDividend = portfolioStart * (dividendYield / 100) * Math.pow(1 + dividendGrowth / 100, year - 1);
      
      totalDividends += annualDividend;

      if (reinvestDividends) {
        portfolioEnd = portfolioStart + contributionAnnual + annualDividend;
      } else {
        portfolioEnd = portfolioStart + contributionAnnual;
      }

      const dividendToContributionRatio = contributionAnnual > 0 ? annualDividend / contributionAnnual : 0;
      const netGap = annualDividend - contributionAnnual;

      yearlyData.push({
        year,
        portfolioStart: Math.round(portfolioStart),
        portfolioEnd: Math.round(portfolioEnd),
        annualDividend: Math.round(annualDividend),
        contributionAnnual: Math.round(contributionAnnual),
        dividendToContributionRatio,
        netGap: Math.round(netGap),
      });

      if (snowballYear === null && annualDividend >= contributionAnnual && contributionAnnual > 0) {
        snowballYear = year;
      }
    }

    return {
      yearlyData,
      snowballYear,
      finalPortfolio: Math.round(portfolioEnd),
      totalDividends: Math.round(totalDividends),
    };
  }, [initialInvestment, dividendYield, dividendGrowth, monthlyContribution, investmentPeriod, reinvestDividends]);

  const reinvestHref = isEnglish ? "/en" : "/kr";
  const goalHref = isEnglish ? "/en/goal" : "/goal";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Snowflake className="h-8 w-8 text-blue-500" />
          {t.title}
        </h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <Card className="lg:col-span-1">
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
              {errors.initialInvestment && <p className="text-sm text-red-500">{errors.initialInvestment}</p>}
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
              {errors.dividendYield && <p className="text-sm text-red-500">{errors.dividendYield}</p>}
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
              {errors.dividendGrowth && <p className="text-sm text-red-500">{errors.dividendGrowth}</p>}
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
              {errors.monthlyContribution && <p className="text-sm text-red-500">{errors.monthlyContribution}</p>}
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
              {errors.investmentPeriod && <p className="text-sm text-red-500">{errors.investmentPeriod}</p>}
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
              <Card className={`border-2 ${simulationResult.snowballYear ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${simulationResult.snowballYear ? 'bg-blue-500' : 'bg-gray-400'}`}>
                      <Snowflake className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{t.results.snowballPoint}</h3>
                      <p className={`text-lg ${simulationResult.snowballYear ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                        {simulationResult.snowballYear 
                          ? t.results.snowballFound(simulationResult.snowballYear)
                          : t.results.snowballNotFound(investmentPeriod)
                        }
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{t.results.disclaimer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.results.annualContribution}</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(monthlyContribution * 12)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={simulationResult.snowballYear ? 'border-2 border-green-400 bg-green-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${simulationResult.snowballYear ? 'bg-green-500' : 'bg-orange-100'}`}>
                        <TrendingUp className={`h-5 w-5 ${simulationResult.snowballYear ? 'text-white' : 'text-orange-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">{t.results.annualDividend}</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            simulationResult.snowballYear 
                              ? simulationResult.yearlyData[simulationResult.snowballYear - 1].annualDividend
                              : simulationResult.yearlyData[simulationResult.yearlyData.length - 1].annualDividend
                          )}
                        </p>
                      </div>
                      {simulationResult.snowballYear && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
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
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={simulationResult.yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 12 }}
                          label={{ 
                            value: isEnglish ? 'Year' : '연도', 
                            position: 'insideBottomRight', 
                            offset: -5,
                            fontSize: 12 
                          }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value >= 100000000) return `${(value / 100000000).toFixed(0)}${isEnglish ? 'B' : '억'}`;
                            if (value >= 10000000) return `${(value / 10000).toFixed(0)}${isEnglish ? 'K' : '만'}`;
                            if (value >= 1000000) return `${(value / 10000).toFixed(0)}${isEnglish ? 'K' : '만'}`;
                            return value.toLocaleString();
                          }}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name
                          ]}
                          labelFormatter={(label) => `${label}${isEnglish ? ' Year' : '년차'}`}
                        />
                        <Legend />
                        {simulationResult.snowballYear && (
                          <ReferenceLine 
                            x={simulationResult.snowballYear} 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{ 
                              value: isEnglish ? 'Transition' : '전환점', 
                              position: 'top',
                              fill: '#3b82f6',
                              fontSize: 12
                            }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="annualDividend"
                          name={isEnglish ? "Annual Dividend" : "연 배당금"}
                          fill="#22c55e"
                          fillOpacity={0.3}
                          stroke="#22c55e"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="contributionAnnual"
                          name={isEnglish ? "Annual Contribution" : "연 기여금"}
                          stroke="#f97316"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {isEnglish 
                      ? "The transition point is where the green area crosses above the orange line"
                      : "녹색 영역이 주황색 선을 넘는 지점이 전환점입니다"}
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
                          <th className="text-right py-2 px-2">{isEnglish ? "Contribution" : "연 기여금"}</th>
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
                              className={`border-b ${isTransitionPoint ? 'bg-blue-50 font-semibold' : ''}`}
                            >
                              <td className="py-2 px-2">
                                {data.year}
                                {isTransitionPoint && (
                                  <span className="ml-1 text-blue-500">★</span>
                                )}
                              </td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.portfolioEnd)}</td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.annualDividend)}</td>
                              <td className="text-right py-2 px-2">{formatCurrency(data.contributionAnnual)}</td>
                              <td className="text-right py-2 px-2">{data.dividendToContributionRatio.toFixed(2)}x</td>
                              <td className={`text-right py-2 px-2 ${data.netGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t.insights.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {t.insights.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
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
                <Snowflake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isEnglish ? "Enter your investment details" : "투자 정보를 입력하세요"}
                </h3>
                <p className="text-gray-500">
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
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {t.assumptions.title}
                </span>
                {isDisclaimerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-gray-600">
                {t.assumptions.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">⚠</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Internal Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href={reinvestHref}>
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.links.reinvestCalc}</h3>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={goalHref}>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-400 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.links.goalCalc}</h3>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}
    </div>
  );
}
