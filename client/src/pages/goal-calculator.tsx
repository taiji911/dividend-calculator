import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Target, Wallet, TrendingUp, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CalculatorTabs from "@/components/calculator-tabs";

interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividend: number;
  monthlyDividend: number;
}

interface CalculationResult {
  requiredPrincipal: number;
  annualDividendNow: number;
  projections: YearlyProjection[];
  showProjections: boolean;
  usedDefaultYears: boolean;
}

export default function GoalCalculator() {
  const [location] = useLocation();
  const isEnglish = location.startsWith('/en');
  
  const [targetMonthlyDividend, setTargetMonthlyDividend] = useState(1000000);
  const [dividendYield, setDividendYield] = useState(4.0);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(0.0);
  const [investmentPeriod, setInvestmentPeriod] = useState(0);
  const [reinvest, setReinvest] = useState(true);
  const [monthlyContribution, setMonthlyContribution] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  const t = {
    title: isEnglish ? "Dividend Goal Calculator" : "배당 목표 금액 계산기",
    subtitle: isEnglish 
      ? "Calculate the initial investment needed to achieve your target monthly dividend."
      : "월 목표 배당금을 달성하려면 필요한 투자 원금을 계산합니다.",
    formTitle: isEnglish ? "Set Investment Goals" : "투자 목표 설정",
    targetMonthlyDividend: isEnglish ? "Target Monthly Dividend" : "목표 월 배당금 (원)",
    dividendYield: isEnglish ? "Expected Dividend Yield (Annual %)" : "예상 배당률 (연 %)",
    dividendGrowthRate: isEnglish ? "Dividend Growth Rate (Annual %, Optional)" : "배당 성장률 (연 %, 선택)",
    investmentPeriod: isEnglish ? "Investment Period (Years, Optional)" : "투자 기간 (년, 선택)",
    reinvest: isEnglish ? "Reinvest Dividends" : "배당금 재투자",
    monthlyContribution: isEnglish ? "Monthly Contribution (Optional)" : "월 추가 투자금 (원, 선택)",
    calculate: isEnglish ? "Calculate" : "계산하기",
    requiredPrincipal: isEnglish ? "Required Principal" : "필요 원금",
    annualDividendNow: isEnglish ? "Annual Dividend (Current)" : "연 배당금 (현재 기준)",
    projectionTitle: isEnglish ? "Yearly Projection" : "연도별 예상 시뮬레이션",
    year: isEnglish ? "Year" : "연차",
    portfolioValue: isEnglish ? "Est. Portfolio" : "예상 자산",
    annualDividend: isEnglish ? "Annual Dividend" : "연 배당금",
    monthlyDividend: isEnglish ? "Monthly Dividend" : "월 배당금",
    assumptions: isEnglish ? "Assumptions & Notes" : "계산 가정 및 유의사항",
    disclaimer: {
      title: isEnglish ? "Investment Risk Disclosure" : "투자 위험 고지",
      content: isEnglish 
        ? "The results of this calculator are for reference only and do not guarantee actual investment returns. All investments carry the risk of principal loss, and past performance does not guarantee future results. Please consult a professional before making investment decisions."
        : "본 계산기의 결과는 참고용이며, 실제 투자 수익을 보장하지 않습니다. 모든 투자에는 원금 손실의 위험이 있으며, 과거 성과가 미래 결과를 보장하지 않습니다. 투자 결정 전에 전문가와 상담하시기 바랍니다.",
    },
    defaultYearsNotice: isEnglish 
      ? "Note: Since investment period is 0 but growth rate or contributions are set, we're simulating 10 years."
      : "참고: 투자 기간이 0이지만 성장률 또는 추가 투자금이 설정되어 10년 기준으로 시뮬레이션됩니다.",
    errors: {
      negative: isEnglish ? "Cannot be negative" : "음수는 입력할 수 없습니다",
      yieldRequired: isEnglish ? "Dividend yield must be greater than 0" : "배당률은 0보다 커야 합니다",
      integerRequired: isEnglish ? "Please enter an integer >= 0" : "0 이상의 정수를 입력해주세요",
    },
    placeholder: {
      title: isEnglish ? "Set your goals" : "목표 설정을 입력하세요",
      description: isEnglish 
        ? "Enter target dividend and investment conditions in the left panel"
        : "왼쪽 패널에서 목표 배당금과 투자 조건을 입력해주세요",
    },
    currency: isEnglish ? "" : "원",
  };

  useEffect(() => {
    if (isEnglish) {
      document.title = "Dividend Goal Calculator | Monthly Dividend Simulation";
      document.documentElement.lang = "en";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Calculate the initial investment needed to achieve your target monthly dividend (e.g., $1,000/month). Includes yearly projections.');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', 'Dividend Goal Calculator | Monthly Dividend Simulation');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 'Calculate the initial investment needed to achieve your target monthly dividend (e.g., $1,000/month). Includes yearly projections.');
      }
    } else {
      document.title = "배당 목표 금액 계산기 | 월 배당금 달성 시뮬레이션";
      document.documentElement.lang = "ko";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '목표 월 배당금(예: 100만원)을 달성하려면 필요한 투자 원금과 기간별 시뮬레이션을 계산해보세요.');
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', '배당, 목표 배당금, 월 배당, 투자 원금, 배당 계산기, 파이어, FIRE, 경제적 자유');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', '배당 목표 금액 계산기 | 월 배당금 달성 시뮬레이션');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', '목표 월 배당금(예: 100만원)을 달성하려면 필요한 투자 원금과 기간별 시뮬레이션을 계산해보세요.');
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
      }).format(amount / 1300);
    }
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (isEnglish) {
      return new Intl.NumberFormat("en-US").format(Math.round(num / 1300));
    }
    return new Intl.NumberFormat("ko-KR").format(Math.round(num));
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (targetMonthlyDividend < 0) {
      newErrors.targetMonthlyDividend = t.errors.negative;
    }
    if (dividendYield <= 0) {
      newErrors.dividendYield = t.errors.yieldRequired;
    }
    if (dividendGrowthRate < 0) {
      newErrors.dividendGrowthRate = t.errors.negative;
    }
    if (investmentPeriod < 0 || !Number.isInteger(investmentPeriod)) {
      newErrors.investmentPeriod = t.errors.integerRequired;
    }
    if (monthlyContribution < 0) {
      newErrors.monthlyContribution = t.errors.negative;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulatePortfolio = (
    initialPrincipal: number,
    years: number
  ): YearlyProjection[] => {
    const projections: YearlyProjection[] = [];
    let portfolioValue = initialPrincipal;
    const annualContribution = monthlyContribution * 12;

    for (let year = 1; year <= years; year++) {
      const growthMultiplier = Math.pow(1 + dividendGrowthRate / 100, year - 1);
      const annualDividend = portfolioValue * (dividendYield / 100) * growthMultiplier;
      const monthlyDividend = annualDividend / 12;

      projections.push({
        year,
        portfolioValue: Math.round(portfolioValue),
        annualDividend: Math.round(annualDividend),
        monthlyDividend: Math.round(monthlyDividend),
      });

      if (reinvest) {
        portfolioValue = portfolioValue + annualContribution + annualDividend;
      } else {
        portfolioValue = portfolioValue + annualContribution;
      }
    }

    return projections;
  };

  const findRequiredPrincipal = (targetYears: number): number => {
    const targetAnnualDividend = targetMonthlyDividend * 12;

    if (targetYears === 0 && monthlyContribution === 0 && dividendGrowthRate === 0) {
      return targetAnnualDividend / (dividendYield / 100);
    }

    let low = 0;
    let high = 100000000000;
    const maxIterations = 80;
    const tolerance = 1000;

    let testProjections = simulatePortfolio(high, targetYears);
    let testFinalDividend = testProjections.length > 0 
      ? testProjections[testProjections.length - 1].monthlyDividend 
      : 0;
    while (testFinalDividend < targetMonthlyDividend && high < 1e15) {
      high *= 10;
      testProjections = simulatePortfolio(high, targetYears);
      testFinalDividend = testProjections.length > 0 
        ? testProjections[testProjections.length - 1].monthlyDividend 
        : 0;
    }

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const projections = simulatePortfolio(mid, targetYears);
      const finalMonthlyDividend = projections.length > 0
        ? projections[projections.length - 1].monthlyDividend
        : 0;

      if (Math.abs(finalMonthlyDividend - targetMonthlyDividend) < tolerance) {
        return mid;
      }

      if (finalMonthlyDividend < targetMonthlyDividend) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return (low + high) / 2;
  };

  const calculate = () => {
    if (!validateInputs()) return;

    const isSimpleCase =
      investmentPeriod === 0 &&
      monthlyContribution === 0 &&
      dividendGrowthRate === 0;

    let effectiveYears = investmentPeriod;
    let usedDefaultYears = false;
    if (!isSimpleCase && investmentPeriod === 0) {
      effectiveYears = 10;
      usedDefaultYears = true;
    }

    const requiredPrincipal = findRequiredPrincipal(effectiveYears);
    const annualDividendNow = requiredPrincipal * (dividendYield / 100);

    let projections: YearlyProjection[] = [];
    if (!isSimpleCase) {
      projections = simulatePortfolio(requiredPrincipal, effectiveYears);
    }

    setResult({
      requiredPrincipal: Math.round(requiredPrincipal),
      annualDividendNow: Math.round(annualDividendNow),
      projections,
      showProjections: !isSimpleCase,
      usedDefaultYears,
    });
  };

  useEffect(() => {
    if (dividendYield > 0 && targetMonthlyDividend > 0) {
      calculate();
    }
  }, [targetMonthlyDividend, dividendYield, dividendGrowthRate, investmentPeriod, reinvest, monthlyContribution]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t.formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetMonthlyDividend">{t.targetMonthlyDividend}</Label>
                <Input
                  id="targetMonthlyDividend"
                  type="number"
                  value={targetMonthlyDividend}
                  onChange={(e) => setTargetMonthlyDividend(Number(e.target.value))}
                  placeholder="1,000,000"
                />
                {errors.targetMonthlyDividend && (
                  <p className="text-sm text-red-500">{errors.targetMonthlyDividend}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendYield">{t.dividendYield}</Label>
                <Input
                  id="dividendYield"
                  type="number"
                  step="0.1"
                  value={dividendYield}
                  onChange={(e) => setDividendYield(Number(e.target.value))}
                  placeholder="4.0"
                />
                {errors.dividendYield && (
                  <p className="text-sm text-red-500">{errors.dividendYield}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendGrowthRate">{t.dividendGrowthRate}</Label>
                <Input
                  id="dividendGrowthRate"
                  type="number"
                  step="0.1"
                  value={dividendGrowthRate}
                  onChange={(e) => setDividendGrowthRate(Number(e.target.value))}
                  placeholder="0.0"
                />
                {errors.dividendGrowthRate && (
                  <p className="text-sm text-red-500">{errors.dividendGrowthRate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentPeriod">{t.investmentPeriod}</Label>
                <Input
                  id="investmentPeriod"
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  placeholder="0"
                />
                {errors.investmentPeriod && (
                  <p className="text-sm text-red-500">{errors.investmentPeriod}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reinvest">{t.reinvest}</Label>
                <Switch
                  id="reinvest"
                  checked={reinvest}
                  onCheckedChange={setReinvest}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">{t.monthlyContribution}</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  placeholder="0"
                />
                {errors.monthlyContribution && (
                  <p className="text-sm text-red-500">{errors.monthlyContribution}</p>
                )}
              </div>

              <Button onClick={calculate} className="w-full">
                {t.calculate}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <>
              {result.usedDefaultYears && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">{t.defaultYearsNotice}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{t.requiredPrincipal}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(result.requiredPrincipal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{t.annualDividendNow}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(result.annualDividendNow)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.showProjections && result.projections.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t.projectionTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">{t.year}</th>
                            <th className="text-right py-3 px-2">{t.portfolioValue}</th>
                            <th className="text-right py-3 px-2">{t.annualDividend}</th>
                            <th className="text-right py-3 px-2">{t.monthlyDividend}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.projections.map((row) => (
                            <tr key={row.year} className="border-b">
                              <td className="py-3 px-2">{row.year}{isEnglish ? "" : "년차"}</td>
                              <td className="text-right py-3 px-2">{formatNumber(row.portfolioValue)}{t.currency}</td>
                              <td className="text-right py-3 px-2">{formatNumber(row.annualDividend)}{t.currency}</td>
                              <td className="text-right py-3 px-2 font-medium">{formatNumber(row.monthlyDividend)}{t.currency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t.placeholder.title}
                </h3>
                <p className="text-gray-500">
                  {t.placeholder.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}

      <Collapsible open={isAssumptionsOpen} onOpenChange={setIsAssumptionsOpen} className="mt-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{t.assumptions}</span>
                {isAssumptionsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {isEnglish ? (
                <>
                  <p>• Dividend yield remains constant; dividends grow annually based on the growth rate.</p>
                  <p>• Dividend = Portfolio Value × Yield × (1 + Growth Rate)^(Year - 1)</p>
                  <p>• With reinvestment: Next Year Assets = Current Assets + Annual Contributions + Annual Dividend</p>
                  <p>• Without reinvestment: Next Year Assets = Current Assets + Annual Contributions</p>
                  <p>• If investment period is 0 but growth rate or contributions are set, we simulate 10 years by default.</p>
                  <p className="text-yellow-700 font-medium">• Taxes, fees, and exchange rate fluctuations are not considered.</p>
                </>
              ) : (
                <>
                  <p>• 배당률은 일정하게 유지되며, 배당 성장률에 따라 배당금이 매년 증가합니다.</p>
                  <p>• 배당금 = 포트폴리오 가치 × 배당률 × (1 + 성장률)^(연차-1)</p>
                  <p>• 재투자 시: 다음 해 자산 = 현재 자산 + 연간 추가 투자금 + 연간 배당금</p>
                  <p>• 재투자 안함: 다음 해 자산 = 현재 자산 + 연간 추가 투자금</p>
                  <p>• 투자 기간이 0이고 성장률/추가투자가 있는 경우, 기본 10년으로 시뮬레이션합니다.</p>
                  <p className="text-yellow-700 font-medium">• 세금, 수수료, 환율 변동 등은 고려하지 않았습니다.</p>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">{t.disclaimer.title}</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{t.disclaimer.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
