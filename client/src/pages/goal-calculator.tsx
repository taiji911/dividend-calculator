import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Target, Wallet, Calculator, BookOpen, Snowflake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { moneyShort } from "@/lib/format";

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
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker={t.title}
        title={isEnglish ? <>How much do I need for <span className="text-gold">my monthly dividend</span>?</> : <>월 배당 목표, <span className="text-gold">원금은 얼마</span> 필요할까?</>}
        subtitle={t.subtitle}
      />

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isEnglish ? "Input" : "입력"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetMonthlyDividend" className="text-[13.5px] font-medium text-muted-foreground">
                {t.targetMonthlyDividend}
              </Label>
              <Input
                id="targetMonthlyDividend"
                type="text"
                inputMode="numeric"
                value={targetMonthlyDividendStr}
                onChange={(e) => setTargetMonthlyDividendStr(formatWithCommas(e.target.value))}
                placeholder={isEnglish ? "1,000" : "1,000,000"}
                className="h-12 text-[16px] font-semibold"
              />
              {errors.targetMonthlyDividend && (
                <p className="text-sm text-coral">{errors.targetMonthlyDividend}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendYield" className="text-[13.5px] font-medium text-muted-foreground">
                {t.dividendYield}
              </Label>
              <Input
                id="dividendYield"
                type="text"
                inputMode="decimal"
                value={dividendYieldStr}
                onChange={(e) => setDividendYieldStr(e.target.value)}
                placeholder="4.0"
                className="h-12 text-[16px] font-semibold"
              />
              <p className="text-xs text-muted-foreground">{t.dividendYieldHelper}</p>
              {errors.dividendYield && (
                <p className="text-sm text-coral">{errors.dividendYield}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-[13.5px] font-medium text-muted-foreground">{t.taxOption}</Label>
              <RadioGroup
                value={taxOption}
                onValueChange={(value) => setTaxOption(value as TaxOption)}
                className="grid gap-2"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3 transition-colors has-[[data-state=checked]]:border-gold/60 has-[[data-state=checked]]:bg-gold/[0.07]">
                  <RadioGroupItem value="tax_free" id="tax_free" />
                  <Label htmlFor="tax_free" className="flex-1 cursor-pointer text-[14px] font-normal text-foreground">
                    {t.taxOptions.tax_free}
                  </Label>
                </div>
                {!isEnglish && (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3 transition-colors has-[[data-state=checked]]:border-gold/60 has-[[data-state=checked]]:bg-gold/[0.07]">
                    <RadioGroupItem value="korea" id="korea" />
                    <Label htmlFor="korea" className="flex-1 cursor-pointer text-[14px] font-normal text-foreground">
                      {t.taxOptions.korea}
                    </Label>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3 transition-colors has-[[data-state=checked]]:border-gold/60 has-[[data-state=checked]]:bg-gold/[0.07]">
                  <RadioGroupItem value="us" id="us" />
                  <Label htmlFor="us" className="flex-1 cursor-pointer text-[14px] font-normal text-foreground">
                    {t.taxOptions.us}
                  </Label>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3 transition-colors has-[[data-state=checked]]:border-gold/60 has-[[data-state=checked]]:bg-gold/[0.07]">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer text-[14px] font-normal text-foreground">
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
                    <p className="text-sm text-coral mt-1">{errors.customTaxRate}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {result ? (
          <div className="panel-hero p-5 sm:p-7">
              <p className="kicker text-gold/90">{t.requiredPrincipal}</p>
              <p className="num mt-2 text-[38px] font-bold leading-none tracking-[-0.04em] sm:text-[52px]">
                {moneyShort(result.requiredPrincipal, isEnglish ? "USD" : "KRW")}
              </p>
              <p className="num mt-2 text-[13px] text-subtle">{formatCurrency(result.requiredPrincipal)}</p>
              <p className="mt-4 text-[13.5px] text-muted-foreground">{t.requiredPrincipalHelper}</p>

              <div className="num mt-6 space-y-3 border-t border-border pt-5 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.annualDividendGross}</span>
                  <span className="font-semibold">{formatCurrency(result.annualDividendGross)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.annualDividendNet}</span>
                  <span className="font-semibold text-lg">{formatCurrency(result.annualDividendNet)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.monthlyDividendNet}</span>
                  <span className="text-lg font-semibold text-gold">{formatCurrency(result.monthlyDividendNet)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">{t.appliedTaxRate}</span>
                  <span className="font-medium">{result.taxRate}%</span>
                </div>
              </div>
              <div className="note note-info mt-6 flex items-start gap-2.5">
                <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-iris" />
                <span><b className="font-semibold text-foreground">{t.howItWorks}</b><br /><span className="text-muted-foreground">{t.formula}</span></span>
              </div>
          </div>
        ) : (
          <Card className="flex items-center justify-center">
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-subtle mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t.placeholder.title}
              </h3>
              <p className="text-muted-foreground">
                {t.placeholder.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Snowball CTA Card */}
      <Link href={isEnglish ? "/en/snowball" : "/snowball"}>
        <span className="panel group mt-10 flex items-center gap-4 p-5 transition-colors hover:border-border-strong">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iris/10 text-iris">
            <Snowflake className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-foreground">
              {isEnglish ? "When will dividends start rolling on their own?" : "배당이 스스로 굴러가는 시점은 언제일까?"}
            </span>
            <span className="mt-0.5 block text-[13px] text-muted-foreground">
              {isEnglish ? "Find out when dividends exceed your contributions" : "스노우볼 시뮬레이터 바로가기"}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </span>
      </Link>

      {/* ADSENSE_SLOT_BOTTOM */}

      <RiskNote title={t.disclaimer.title}>{t.disclaimer.content}</RiskNote>
    </div>
  );
}
