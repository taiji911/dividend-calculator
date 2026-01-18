import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Target, Wallet, Calculator, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalculatorTabs from "@/components/calculator-tabs";

interface CalculationResult {
  requiredPrincipal: number;
  annualDividendGross: number;
  annualDividendNet: number;
  monthlyDividendNet: number;
  taxRate: number;
}

type TaxOption = 'tax_free' | 'korea' | 'us' | 'custom';

export default function GoalCalculator() {
  const [location] = useLocation();
  const isEnglish = location.startsWith('/en');
  
  const [targetMonthlyDividendStr, setTargetMonthlyDividendStr] = useState(isEnglish ? "1,000" : "1,000,000");
  const [dividendYieldStr, setDividendYieldStr] = useState("4.0");
  const [taxOption, setTaxOption] = useState<TaxOption>(isEnglish ? 'us' : 'korea');
  const [customTaxRateStr, setCustomTaxRateStr] = useState("15");
  const [initializedForLanguage, setInitializedForLanguage] = useState(isEnglish ? 'en' : 'kr');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const currentLang = isEnglish ? 'en' : 'kr';
    if (initializedForLanguage !== currentLang) {
      setTargetMonthlyDividendStr(isEnglish ? "1,000" : "1,000,000");
      setTaxOption(isEnglish ? 'us' : 'korea');
      setInitializedForLanguage(currentLang);
    }
  }, [isEnglish, initializedForLanguage]);

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
  const customTaxRate = parseNumber(customTaxRateStr);

  const getTaxRate = (): number => {
    switch (taxOption) {
      case 'tax_free': return 0;
      case 'korea': return 15.4;
      case 'us': return 15;
      case 'custom': return customTaxRate;
      default: return 0;
    }
  };

  const t = {
    title: isEnglish ? "Dividend Goal Calculator" : "목표 배당금 계산기",
    subtitle: isEnglish 
      ? "How much do I need to invest to receive my target monthly dividend?"
      : "목표 월 배당금을 받으려면 얼마를 투자해야 할까요?",
    targetMonthlyDividend: isEnglish ? "Target Monthly Dividend (USD, after tax)" : "목표 월 배당금 (원, 세후)",
    dividendYield: isEnglish ? "Expected Dividend Yield (%/year)" : "예상 배당률 (연 %)",
    dividendYieldHelper: isEnglish ? "e.g., SCHD: ~3.5%, High-yield ETFs: ~8%" : "예: SCHD 약 3.5%, 고배당 ETF 약 8%",
    taxOption: isEnglish ? "Tax Rate" : "세금 옵션",
    taxOptions: {
      tax_free: isEnglish ? "Tax-free (ISA/Pension)" : "비과세 (ISA/연금저축)",
      korea: isEnglish ? "Korea (15.4%)" : "한국 일반계좌 (15.4%)",
      us: isEnglish ? "US (15% treaty rate)" : "미국 주식 (15%)",
      custom: isEnglish ? "Custom rate" : "직접 입력",
    },
    customTaxRate: isEnglish ? "Custom Tax Rate (%)" : "세율 직접 입력 (%)",
    resultTitle: isEnglish ? "Calculation Result" : "계산 결과",
    requiredPrincipal: isEnglish ? "Required Investment" : "필요 투자금",
    requiredPrincipalHelper: isEnglish 
      ? "Invest this amount to receive your target monthly dividend after tax"
      : "이 금액을 투자하면 세후 목표 월 배당금을 받을 수 있습니다",
    annualDividendGross: isEnglish ? "Annual Dividend (before tax)" : "연간 배당금 (세전)",
    annualDividendNet: isEnglish ? "Annual Dividend (after tax)" : "연간 배당금 (세후)",
    monthlyDividendNet: isEnglish ? "Monthly Dividend (after tax)" : "월 배당금 (세후)",
    appliedTaxRate: isEnglish ? "Applied Tax Rate" : "적용 세율",
    disclaimer: {
      title: isEnglish ? "Investment Risk Disclosure" : "투자 위험 고지",
      content: isEnglish 
        ? "The results of this calculator are for reference only and do not guarantee actual investment returns. All investments carry the risk of principal loss, and past performance does not guarantee future results. Please consult a professional before making investment decisions."
        : "본 계산기의 결과는 참고용이며, 실제 투자 수익을 보장하지 않습니다. 모든 투자에는 원금 손실의 위험이 있으며, 과거 성과가 미래 결과를 보장하지 않습니다. 투자 결정 전에 전문가와 상담하시기 바랍니다.",
    },
    errors: {
      negative: isEnglish ? "Cannot be negative" : "음수는 입력할 수 없습니다",
      yieldRequired: isEnglish ? "Dividend yield must be greater than 0" : "배당률은 0보다 커야 합니다",
      taxRateRange: isEnglish ? "Tax rate must be between 0 and 100" : "세율은 0~100 사이여야 합니다",
    },
    placeholder: {
      title: isEnglish ? "Enter your dividend goal" : "목표를 입력하세요",
      description: isEnglish 
        ? "Set your target monthly dividend and expected yield"
        : "목표 월 배당금과 예상 배당률을 입력하세요",
    },
    howItWorks: isEnglish ? "How it works" : "계산 원리",
    formula: isEnglish 
      ? "Required Investment = (Target Monthly Dividend × 12) ÷ (Dividend Yield × (1 - Tax Rate))"
      : "필요 투자금 = (목표 월 배당금 × 12개월) ÷ (배당률 × (1 - 세율))",
    guideLink: isEnglish ? "View Usage Guide" : "사용 가이드 보기",
  };

  useEffect(() => {
    if (isEnglish) {
      document.title = "Dividend Goal Calculator | How Much to Invest";
      document.documentElement.lang = "en";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Calculate how much you need to invest to achieve your target monthly dividend income after tax.');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', 'Dividend Goal Calculator | How Much to Invest');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 'Calculate how much you need to invest to achieve your target monthly dividend income after tax.');
      }
    } else {
      document.title = "목표 배당금 계산기 | 필요 투자금 계산";
      document.documentElement.lang = "ko";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '월 100만원 배당을 받으려면 얼마를 투자해야 할까요? 세금을 고려한 목표 배당금 계산기입니다.');
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', '배당, 목표 배당금, 월 배당, 투자 원금, 배당 계산기, 파이어, FIRE, 경제적 자유, 세금');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', '목표 배당금 계산기 | 필요 투자금 계산');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', '월 100만원 배당을 받으려면 얼마를 투자해야 할까요? 세금을 고려한 목표 배당금 계산기입니다.');
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

    if (targetMonthlyDividend < 0) {
      newErrors.targetMonthlyDividend = t.errors.negative;
    }
    if (dividendYield <= 0) {
      newErrors.dividendYield = t.errors.yieldRequired;
    }
    if (taxOption === 'custom' && (customTaxRate < 0 || customTaxRate > 100)) {
      newErrors.customTaxRate = t.errors.taxRateRange;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validateInputs()) return;

    const taxRate = getTaxRate();
    const annualDividendNet = targetMonthlyDividend * 12;
    const annualDividendGross = annualDividendNet / (1 - taxRate / 100);
    const requiredPrincipal = annualDividendGross / (dividendYield / 100);

    setResult({
      requiredPrincipal: Math.round(requiredPrincipal),
      annualDividendGross: Math.round(annualDividendGross),
      annualDividendNet: Math.round(annualDividendNet),
      monthlyDividendNet: Math.round(targetMonthlyDividend),
      taxRate: taxRate,
    });
  };

  useEffect(() => {
    if (dividendYield > 0 && targetMonthlyDividend > 0) {
      calculate();
    }
  }, [targetMonthlyDividendStr, dividendYieldStr, taxOption, customTaxRateStr]);

  const guideHref = isEnglish ? "/en/guide" : "/guide";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

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
                placeholder={isEnglish ? "1,000" : "1,000,000"}
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

            <div className="space-y-3">
              <Label className="text-base font-medium">{t.taxOption}</Label>
              <RadioGroup
                value={taxOption}
                onValueChange={(value) => setTaxOption(value as TaxOption)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tax_free" id="tax_free" />
                  <Label htmlFor="tax_free" className="font-normal cursor-pointer">
                    {t.taxOptions.tax_free}
                  </Label>
                </div>
                {!isEnglish && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="korea" id="korea" />
                    <Label htmlFor="korea" className="font-normal cursor-pointer">
                      {t.taxOptions.korea}
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="us" id="us" />
                  <Label htmlFor="us" className="font-normal cursor-pointer">
                    {t.taxOptions.us}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-normal cursor-pointer">
                    {t.taxOptions.custom}
                  </Label>
                </div>
              </RadioGroup>

              {taxOption === 'custom' && (
                <div className="mt-3">
                  <Input
                    id="customTaxRate"
                    type="text"
                    inputMode="decimal"
                    value={customTaxRateStr}
                    onChange={(e) => setCustomTaxRateStr(e.target.value)}
                    placeholder="15"
                    className="w-32"
                  />
                  {errors.customTaxRate && (
                    <p className="text-sm text-red-500 mt-1">{errors.customTaxRate}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  <span className="text-gray-600">{t.annualDividendGross}</span>
                  <span className="font-semibold">{formatCurrency(result.annualDividendGross)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.annualDividendNet}</span>
                  <span className="font-semibold text-lg">{formatCurrency(result.annualDividendNet)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.monthlyDividendNet}</span>
                  <span className="font-semibold text-lg">{formatCurrency(result.monthlyDividendNet)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">{t.appliedTaxRate}</span>
                  <span className="font-medium">{result.taxRate}%</span>
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

      {/* Guide CTA Card */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isEnglish ? "Need help using the calculator?" : "계산기 사용법이 궁금하신가요?"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEnglish 
                    ? "Learn how to interpret results and understand assumptions"
                    : "결과 해석 방법과 계산 가정을 확인하세요"}
                </p>
              </div>
            </div>
            <Link href={guideHref}>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                {t.guideLink}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
