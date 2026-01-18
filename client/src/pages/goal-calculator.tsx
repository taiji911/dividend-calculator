import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Target, Wallet, TrendingUp, Calculator } from "lucide-react";
import CalculatorTabs from "@/components/calculator-tabs";

interface CalculationResult {
  requiredPrincipal: number;
  annualDividend: number;
  monthlyDividend: number;
}

export default function GoalCalculator() {
  const [location] = useLocation();
  const isEnglish = location.startsWith('/en');
  
  const [targetMonthlyDividendStr, setTargetMonthlyDividendStr] = useState("1,000,000");
  const [dividendYieldStr, setDividendYieldStr] = useState("4.0");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

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

  const targetMonthlyDividend = parseNumber(targetMonthlyDividendStr);
  const dividendYield = parseNumber(dividendYieldStr);

  const t = {
    title: isEnglish ? "Dividend Goal Calculator" : "목표 배당금 계산기",
    subtitle: isEnglish 
      ? "How much do I need to invest to receive my target monthly dividend?"
      : "목표 월 배당금을 받으려면 얼마를 투자해야 할까요?",
    targetMonthlyDividend: isEnglish ? "Target Monthly Dividend" : "목표 월 배당금",
    dividendYield: isEnglish ? "Expected Dividend Yield (%/year)" : "예상 배당률 (연 %)",
    dividendYieldHelper: isEnglish ? "e.g., SCHD: ~3.5%, High-yield ETFs: ~8%" : "예: SCHD 약 3.5%, 고배당 ETF 약 8%",
    resultTitle: isEnglish ? "Calculation Result" : "계산 결과",
    requiredPrincipal: isEnglish ? "Required Investment" : "필요 투자금",
    requiredPrincipalHelper: isEnglish 
      ? "Invest this amount to receive your target monthly dividend"
      : "이 금액을 투자하면 목표 월 배당금을 받을 수 있습니다",
    annualDividend: isEnglish ? "Annual Dividend" : "연간 배당금",
    monthlyDividend: isEnglish ? "Monthly Dividend" : "월 배당금",
    disclaimer: {
      title: isEnglish ? "Investment Risk Disclosure" : "투자 위험 고지",
      content: isEnglish 
        ? "The results of this calculator are for reference only and do not guarantee actual investment returns. All investments carry the risk of principal loss, and past performance does not guarantee future results. Please consult a professional before making investment decisions."
        : "본 계산기의 결과는 참고용이며, 실제 투자 수익을 보장하지 않습니다. 모든 투자에는 원금 손실의 위험이 있으며, 과거 성과가 미래 결과를 보장하지 않습니다. 투자 결정 전에 전문가와 상담하시기 바랍니다.",
    },
    errors: {
      negative: isEnglish ? "Cannot be negative" : "음수는 입력할 수 없습니다",
      yieldRequired: isEnglish ? "Dividend yield must be greater than 0" : "배당률은 0보다 커야 합니다",
    },
    placeholder: {
      title: isEnglish ? "Enter your dividend goal" : "목표를 입력하세요",
      description: isEnglish 
        ? "Set your target monthly dividend and expected yield"
        : "목표 월 배당금과 예상 배당률을 입력하세요",
    },
    howItWorks: isEnglish ? "How it works" : "계산 원리",
    formula: isEnglish 
      ? "Required Investment = (Target Monthly Dividend × 12) ÷ Dividend Yield"
      : "필요 투자금 = (목표 월 배당금 × 12개월) ÷ 배당률",
  };

  useEffect(() => {
    if (isEnglish) {
      document.title = "Dividend Goal Calculator | How Much to Invest";
      document.documentElement.lang = "en";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Calculate how much you need to invest to achieve your target monthly dividend income.');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', 'Dividend Goal Calculator | How Much to Invest');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 'Calculate how much you need to invest to achieve your target monthly dividend income.');
      }
    } else {
      document.title = "목표 배당금 계산기 | 필요 투자금 계산";
      document.documentElement.lang = "ko";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '월 100만원 배당을 받으려면 얼마를 투자해야 할까요? 목표 배당금을 설정하고 필요한 투자금을 계산해보세요.');
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', '배당, 목표 배당금, 월 배당, 투자 원금, 배당 계산기, 파이어, FIRE, 경제적 자유');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', '목표 배당금 계산기 | 필요 투자금 계산');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', '월 100만원 배당을 받으려면 얼마를 투자해야 할까요? 목표 배당금을 설정하고 필요한 투자금을 계산해보세요.');
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

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (targetMonthlyDividend < 0) {
      newErrors.targetMonthlyDividend = t.errors.negative;
    }
    if (dividendYield <= 0) {
      newErrors.dividendYield = t.errors.yieldRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validateInputs()) return;

    const annualDividend = targetMonthlyDividend * 12;
    const requiredPrincipal = annualDividend / (dividendYield / 100);

    setResult({
      requiredPrincipal: Math.round(requiredPrincipal),
      annualDividend: Math.round(annualDividend),
      monthlyDividend: Math.round(targetMonthlyDividend),
    });
  };

  useEffect(() => {
    if (dividendYield > 0 && targetMonthlyDividend > 0) {
      calculate();
    }
  }, [targetMonthlyDividendStr, dividendYieldStr]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600 text-lg">{t.subtitle}</p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      {/* How it works explanation */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">{t.howItWorks}</p>
            <p className="text-sm text-blue-700 mt-1">{t.formula}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isEnglish ? "Input" : "입력"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetMonthlyDividend" className="text-base font-medium">
                {t.targetMonthlyDividend}
              </Label>
              <Input
                id="targetMonthlyDividend"
                type="text"
                inputMode="numeric"
                value={targetMonthlyDividendStr}
                onChange={(e) => setTargetMonthlyDividendStr(formatWithCommas(e.target.value))}
                placeholder="1,000,000"
                className="text-lg h-12"
              />
              {errors.targetMonthlyDividend && (
                <p className="text-sm text-red-500">{errors.targetMonthlyDividend}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendYield" className="text-base font-medium">
                {t.dividendYield}
              </Label>
              <Input
                id="dividendYield"
                type="text"
                inputMode="decimal"
                value={dividendYieldStr}
                onChange={(e) => setDividendYieldStr(e.target.value)}
                placeholder="4.0"
                className="text-lg h-12"
              />
              <p className="text-xs text-gray-500">{t.dividendYieldHelper}</p>
              {errors.dividendYield && (
                <p className="text-sm text-red-500">{errors.dividendYield}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        {result ? (
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                {t.resultTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">{t.requiredPrincipal}</p>
                <p className="text-4xl font-bold text-primary mb-2">
                  {formatCurrency(result.requiredPrincipal)}
                </p>
                <p className="text-xs text-gray-500">{t.requiredPrincipalHelper}</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.annualDividend}</span>
                  <span className="font-semibold text-lg">{formatCurrency(result.annualDividend)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.monthlyDividend}</span>
                  <span className="font-semibold text-lg">{formatCurrency(result.monthlyDividend)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center">
            <CardContent className="text-center py-12">
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

      {/* ADSENSE_SLOT_BOTTOM */}

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
