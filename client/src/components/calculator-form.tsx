import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage, getTranslation, currencyOptions, type Language } from "@/lib/i18n";

const calculationSchema = z.object({
  initialInvestment: z.number().min(0),
  monthlyInvestment: z.number().min(0),
  investmentPeriod: z.number().min(1).max(50),
  dividendYield: z.number().min(0).max(50),
  dividendGrowthRate: z.number().min(-10).max(50),
  currency: z.string(),
  dripEnabled: z.boolean(),
  taxCountry: z.enum(["KR", "US", "CUSTOM"]),
  taxType: z.enum(["taxable", "tax_free"]),
  customTaxRate: z.number().min(0).max(100).optional(),
});

type CalculationFormData = z.infer<typeof calculationSchema>;

interface CalculatorFormProps {
  onCalculate: (results: CalculationResults, currency?: string) => void;
}

export default function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const language = getCurrentLanguage();
  const t = getTranslation(language);

  const form = useForm<CalculationFormData>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      // 처음 들어와도 결과가 바로 보이도록 예시 값을 채워 둡니다
      initialInvestment: language === 'en' ? 10000 : 10000000,
      monthlyInvestment: language === 'en' ? 500 : 500000,
      investmentPeriod: 10,
      dividendYield: 3.5,
      dividendGrowthRate: 5.0,
      currency: language === 'kr' ? 'KRW' : 'USD',
      dripEnabled: true,
      taxCountry: "KR" as const,
      taxType: "taxable" as const,
      customTaxRate: 0,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculationFormData) => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (results: CalculationResults) => {
      onCalculate(results, selectedCurrency);
      // 휴대폰에서 직접 계산 버튼을 누른 경우 결과로 내려가기
      if (manualSubmit.current && window.matchMedia("(max-width: 1023px)").matches) {
        setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
      manualSubmit.current = false;
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Calculation Error" : "계산 오류",
        description: error.message || (language === 'en' ? "An error occurred during calculation." : "계산 중 오류가 발생했습니다."),
        variant: "destructive",
      });
    },
  });

  const manualSubmit = React.useRef(false);
  const onSubmit = (data: CalculationFormData) => {
    manualSubmit.current = true;
    calculateMutation.mutate(data);
  };

  // 첫 화면에서 예시 값으로 한 번 계산
  React.useEffect(() => {
    calculateMutation.mutate(form.getValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const presets = {
    conservative: { dividendYield: 3.0, dividendGrowthRate: 3.0, label: language === 'en' ? "Conservative" : "보수적", description: language === 'en' ? "3% yield, 3% growth" : "배당률 3%, 성장률 3%" },
    moderate: { dividendYield: 4.0, dividendGrowthRate: 5.0, label: language === 'en' ? "Moderate" : "중간", description: language === 'en' ? "4% yield, 5% growth" : "배당률 4%, 성장률 5%" },
    aggressive: { dividendYield: 5.0, dividendGrowthRate: 8.0, label: language === 'en' ? "Growth" : "공격적", description: language === 'en' ? "5% yield, 8% growth" : "배당률 5%, 성장률 8%" },
    schd: { dividendYield: 3.5, dividendGrowthRate: 12.0, label: language === 'en' ? "SCHD (Example)" : "SCHD (예시)", description: language === 'en' ? "3.5% yield, 12% growth" : "배당률 3.5%, 성장률 12%" },
  };

  const loadPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    form.setValue("dividendYield", preset.dividendYield);
    form.setValue("dividendGrowthRate", preset.dividendGrowthRate);
    setSelectedPreset(presetName);
  };

  const watchedValues = form.watch(["dividendYield", "dividendGrowthRate"]);
  React.useEffect(() => {
    if (selectedPreset) {
      const preset = presets[selectedPreset as keyof typeof presets];
      const [currentYield, currentGrowth] = watchedValues;
      if (currentYield !== preset.dividendYield || currentGrowth !== preset.dividendGrowthRate) {
        setSelectedPreset(null);
      }
    }
  }, [watchedValues]);

  const selectedCurrency = form.watch("currency") || (language === 'kr' ? 'KRW' : 'USD');
  const currencySymbol = currencyOptions[selectedCurrency as keyof typeof currencyOptions]?.symbol || '$';

  const isEn = language === 'en';

  const hint = (children: React.ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-subtle transition-colors hover:text-foreground">
          <Info className="h-[15px] w-[15px]" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );

  const fieldLabel = "mb-2 flex items-center text-[13.5px] font-medium text-muted-foreground";
  const affix = "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[14px] text-subtle";

  const moneyInput = (name: "initialInvestment" | "monthlyInvestment", placeholder: string) => (
    <div className="relative">
      <span className={`${affix} left-3.5`}>{currencySymbol}</span>
      <Input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        className="pl-9 text-[16px] font-semibold"
        value={form.watch(name)?.toLocaleString() || "0"}
        onChange={(e) => {
          const numValue = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
          form.setValue(name, isNaN(numValue) ? 0 : numValue);
        }}
      />
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">{t.calculator.title}</h2>
        <span className="kicker">{isEn ? 'Inputs' : 'INPUT'}</span>
      </div>

      <div className="space-y-5">
        {/* 금액 */}
        <div>
          <label className={fieldLabel}>
            {t.calculator.initialInvestment}
            {hint(isEn ? 'Initial capital to start investing' : '투자를 시작할 때 한 번에 넣는 돈')}
          </label>
          {moneyInput("initialInvestment", t.calculator.placeholders.initialAmount)}
        </div>

        <div>
          <label className={fieldLabel}>
            {t.calculator.monthlyInvestment}
            {hint(isEn ? 'Regular monthly investment amount' : '매달 꾸준히 더 넣을 돈')}
          </label>
          {moneyInput("monthlyInvestment", t.calculator.placeholders.monthlyAmount)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>
              {t.calculator.investmentPeriod}
              {hint(isEn ? 'Total investment period' : '투자를 이어갈 기간')}
            </label>
            <div className="relative">
              <Input type="number" inputMode="numeric" placeholder={t.calculator.placeholders.years} className="pr-10"
                {...form.register("investmentPeriod", { valueAsNumber: true })} />
              <span className={`${affix} right-3.5`}>{isEn ? 'yrs' : '년'}</span>
            </div>
          </div>

          {isEn ? (
            <div>
              <label className={fieldLabel}>{t.calculator.currency}</label>
              <Select value={form.watch("currency")} onValueChange={(value) => form.setValue("currency", value)}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(currencyOptions).map(([code, info]) => (
                    <SelectItem key={code} value={code}>{info.symbol} {code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className={fieldLabel}>
                {t.calculator.dripEnabled.replace(' (DRIP)', '')}
                {hint("배당금을 현금으로 받지 않고 다시 사들이는 방식이에요")}
              </label>
              <label htmlFor="drip" className="flex h-11 items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5">
                <span className="text-[14px] text-foreground">{form.watch("dripEnabled") ? '켜짐' : '꺼짐'}</span>
                <Switch id="drip" checked={form.watch("dripEnabled")} onCheckedChange={(checked) => form.setValue("dripEnabled", checked)} />
              </label>
            </div>
          )}
        </div>

        {isEn && (
          <label htmlFor="drip" className="flex h-11 items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5">
            <span className="flex items-center text-[14px] text-foreground">
              {t.calculator.dripEnabled}
              {hint("Automatically reinvest dividends instead of receiving cash")}
            </span>
            <Switch id="drip" checked={form.watch("dripEnabled")} onCheckedChange={(checked) => form.setValue("dripEnabled", checked)} />
          </label>
        )}

        <div className="h-px bg-border" />

        {/* 배당 가정 */}
        <div>
          <p className="mb-2.5 text-[13.5px] font-medium text-muted-foreground">{isEn ? 'Quick presets' : '빠른 설정'}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                type="button"
                key={key}
                data-active={selectedPreset === key}
                className="chip"
                onClick={() => loadPreset(key as keyof typeof presets)}
              >
                <span className="block text-[14px] font-semibold text-foreground">{preset.label}</span>
                <span className="mt-0.5 block text-[12px] text-subtle">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>
              {t.calculator.dividendYield}
              {hint(isEn ? 'Annual dividend ÷ current price' : '지금 주가 대비 1년 배당금 비율')}
            </label>
            <div className="relative">
              <Input type="number" inputMode="decimal" step="0.1" placeholder={t.calculator.placeholders.yieldPercent} className="pr-9"
                {...form.register("dividendYield", { valueAsNumber: true, onChange: () => setSelectedPreset(null) })} />
              <span className={`${affix} right-3.5`}>%</span>
            </div>
          </div>
          <div>
            <label className={fieldLabel}>
              {t.calculator.dividendGrowthRate}
              {hint(isEn ? 'Annual dividend growth rate' : '배당금이 매년 늘어나는 비율')}
            </label>
            <div className="relative">
              <Input type="number" inputMode="decimal" step="0.1" placeholder={t.calculator.placeholders.growthPercent} className="pr-9"
                {...form.register("dividendGrowthRate", { valueAsNumber: true, onChange: () => setSelectedPreset(null) })} />
              <span className={`${affix} right-3.5`}>%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* 세금 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>
              {t.calculator.taxCountry}
              {hint(isEn ? 'Country where dividend tax rate applies' : '배당세율이 적용될 국가')}
            </label>
            <Select value={form.watch("taxCountry")} onValueChange={(value: "KR" | "US" | "CUSTOM") => {
              form.setValue("taxCountry", value);
              if (value === "CUSTOM") { form.setValue("taxType", "taxable"); form.setValue("customTaxRate", 0); }
            }}>
              <SelectTrigger><SelectValue placeholder={isEn ? 'Select country' : '국가 선택'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="KR">{t.calculator.options.korea}</SelectItem>
                <SelectItem value="US">{t.calculator.options.us}</SelectItem>
                <SelectItem value="CUSTOM">{isEn ? 'Custom' : '직접 입력'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={fieldLabel}>
              {t.calculator.taxType}
              {hint(isEn ? 'Tax application based on account type' : '과세 여부에 따른 세금 적용')}
            </label>
            <Select value={form.watch("taxType")} onValueChange={(value: "taxable" | "tax_free") => form.setValue("taxType", value)} disabled={form.watch("taxCountry") === "CUSTOM"}>
              <SelectTrigger><SelectValue placeholder={isEn ? 'Account type' : '계좌 유형'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="taxable">{t.calculator.options.taxable}</SelectItem>
                <SelectItem value="tax_free">{t.calculator.options.taxFree}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {form.watch("taxCountry") === "CUSTOM" && (
          <div>
            <label className={fieldLabel}>{isEn ? 'Tax rate' : '세율'}</label>
            <div className="relative">
              <Input type="number" inputMode="decimal" step="0.1" placeholder="15.0" className="pr-9" {...form.register("customTaxRate", { valueAsNumber: true })} />
              <span className={`${affix} right-3.5`}>%</span>
            </div>
          </div>
        )}

        <p className="text-[12.5px] leading-relaxed text-subtle">
          {isEn
            ? 'Tax: Korea 15.4% / US 15% withholding. Tax-free accounts apply 0%.'
            : '세율: 한국 주식 15.4% · 미국 주식 15% 원천징수 기준이에요.'}
        </p>

        <Button type="submit" className="h-12 w-full text-[15px]" disabled={calculateMutation.isPending}>
          {calculateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {calculateMutation.isPending ? (isEn ? 'Calculating…' : '계산 중…') : t.calculator.calculateButton}
        </Button>
      </div>
    </form>
  );
}
