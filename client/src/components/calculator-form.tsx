import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage, getTranslation, currencyOptions } from "@/lib/i18n";
import { simulate, type AccountType } from "@/lib/dividend-engine";

interface CalculatorFormProps {
  onCalculate: (results: CalculationResults, currency?: string) => void;
}

export type FormState = {
  initialInvestment: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  dividendYield: string;
  dividendGrowthRate: string;
  priceGrowthRate: string;
  dripEnabled: boolean;
  account: AccountType;
  customTaxRate: string;
  currency: string;
};

const num = (v: string | number) => {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return isFinite(n) ? n : 0;
};

/** 처음 들어왔을 때 채워 둘 예시 값 — 화면과 미리 만든 HTML이 같은 결과를 보여주도록 한 곳에서 정해요 */
export function defaultForm(isEn: boolean): FormState {
  return {
    initialInvestment: isEn ? 10000 : 10000000,
    monthlyInvestment: isEn ? 500 : 500000,
    investmentPeriod: 10,
    dividendYield: "3.5",
    dividendGrowthRate: "5",
    priceGrowthRate: "5",
    dripEnabled: true,
    account: isEn ? "taxable_us" : "taxable_kr",
    customTaxRate: "15",
    currency: isEn ? "USD" : "KRW",
  };
}

export function toSimInput(f: FormState) {
  return {
    initialInvestment: f.initialInvestment,
    monthlyInvestment: f.monthlyInvestment,
    years: Math.min(Math.max(num(f.investmentPeriod), 1), 50),
    dividendYield: Math.min(Math.max(num(f.dividendYield), 0), 50),
    dividendGrowthRate: Math.min(Math.max(num(f.dividendGrowthRate), -20), 50),
    priceGrowthRate: Math.min(Math.max(num(f.priceGrowthRate), -20), 50),
    drip: f.dripEnabled,
    account: f.account,
    customTaxRate: num(f.customTaxRate),
  };
}

/**
 * 투자 조건 입력 — 값을 바꾸는 즉시 브라우저에서 바로 계산해요 (서버 왕복 없음).
 */
export default function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const language = getCurrentLanguage();
  const isEn = language === "en";
  const t = getTranslation(language);

  const [f, setF] = useState<FormState>(() => defaultForm(isEn));
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const presets = {
    conservative: { y: 3, dg: 3, pg: 3, label: isEn ? "Conservative" : "보수적", description: isEn ? "Yield 3% · div +3% · price +3%" : "배당률 3% · 배당 +3% · 주가 +3%" },
    moderate: { y: 4, dg: 5, pg: 4, label: isEn ? "Moderate" : "중간", description: isEn ? "Yield 4% · div +5% · price +4%" : "배당률 4% · 배당 +5% · 주가 +4%" },
    highYield: { y: 7, dg: 2, pg: 1, label: isEn ? "High yield" : "고배당", description: isEn ? "Yield 7% · div +2% · price +1%" : "배당률 7% · 배당 +2% · 주가 +1%" },
    schd: { y: 3.5, dg: 10, pg: 9, label: isEn ? "SCHD-like" : "SCHD (예시)", description: isEn ? "Past 10-yr pace" : "과거 10년 흐름 참고" },
  };
  type PresetKey = keyof typeof presets;
  const activePreset = (Object.keys(presets) as PresetKey[]).find(
    (k) => num(f.dividendYield) === presets[k].y && num(f.dividendGrowthRate) === presets[k].dg && num(f.priceGrowthRate) === presets[k].pg
  );

  // ETF 페이지에서 넘어오면 주소의 값(?y=3.1&dg=6&pg=5&from=SCHD)으로 채워요.
  // 미리 만든 HTML과 첫 화면이 같아야 해서, 화면이 뜬 뒤에 바꿔요.
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const y = q.get("y");
    if (!y || !isFinite(parseFloat(y))) return;
    const pick = (k: string, fallback: string) => {
      const v = q.get(k);
      return v != null && isFinite(parseFloat(v)) ? v : fallback;
    };
    setF((p) => ({ ...p, dividendYield: y, dividendGrowthRate: pick("dg", p.dividendGrowthRate), priceGrowthRate: pick("pg", p.priceGrowthRate) }));
    setFrom(q.get("from"));
  }, []);

  const result = useMemo(() => simulate(toSimInput(f)), [f]);

  useEffect(() => {
    onCalculate(result, f.currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, f.currency]);

  const currencySymbol = currencyOptions[f.currency as keyof typeof currencyOptions]?.symbol || "₩";

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
        value={f[name] ? f[name].toLocaleString() : ""}
        onChange={(e) => {
          const n = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
          set(name, isNaN(n) ? 0 : n);
        }}
      />
    </div>
  );

  const pctInput = (name: "dividendYield" | "dividendGrowthRate" | "priceGrowthRate" | "customTaxRate", placeholder: string) => (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className="pr-9"
        value={f[name]}
        onChange={(e) => set(name, e.target.value.replace(/[^0-9.\-]/g, ""))}
      />
      <span className={`${affix} right-3.5`}>%</span>
    </div>
  );

  const accountOptions: { value: AccountType; label: string }[] = isEn
    ? [
        { value: "taxable_us", label: "Taxable · US stocks (15%)" },
        { value: "taxable_kr", label: "Taxable · Korean stocks (15.4%)" },
        { value: "tax_free", label: "Tax-free account" },
        { value: "custom", label: "Custom tax rate" },
      ]
    : [
        { value: "taxable_kr", label: "일반계좌 · 국내 주식·ETF (15.4%)" },
        { value: "taxable_us", label: "일반계좌 · 미국 주식 (15%)" },
        { value: "isa", label: "ISA 일반형 (만기 때 과세)" },
        { value: "isa_low", label: "ISA 서민형 (만기 때 과세)" },
        { value: "pension", label: "연금저축·IRP (과세이연)" },
        { value: "custom", label: "세율 직접 입력" },
      ];

  const accountNote: Partial<Record<AccountType, string>> = isEn
    ? {
        taxable_kr: "15.4% is withheld from every dividend.",
        taxable_us: "15% US withholding on every dividend.",
        tax_free: "No tax is applied to dividends.",
        custom: "Your rate is applied to every dividend.",
      }
    : {
        taxable_kr: "배당을 받을 때마다 15.4%(지방세 포함)가 원천징수돼요.",
        taxable_us: "미국에서 15%가 원천징수되고, 국내 추가 원천징수는 없어요.",
        isa: "기간 중에는 세금 없이 굴리고, 만기 때 순이익 200만원 초과분에 9.9%를 내요.",
        isa_low: "기간 중에는 세금 없이 굴리고, 만기 때 순이익 400만원 초과분에 9.9%를 내요.",
        pension: "기간 중 세금을 미뤄요. 연금으로 받을 때 나이에 따라 3.3~5.5%를 내요.",
        custom: "입력한 세율을 배당마다 적용해요.",
      };

  const scrollToResults = () => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">{t.calculator.title}</h2>
        <span className="kicker">{isEn ? "Live" : "실시간 계산"}</span>
      </div>
      {from && (
        <p className="note note-info mb-5 !py-2.5 text-[13px]">
          <strong className="text-foreground">{from.slice(0, 40)}</strong> 정보로 배당률을 채웠어요. 배당 성장률·주가 상승률은 예시 가정이니 자유롭게 바꿔 보세요.
        </p>
      )}

      <div className="space-y-5">
        {/* 금액 */}
        <div>
          <label className={fieldLabel}>
            {t.calculator.initialInvestment}
            {hint(isEn ? "Initial capital to start investing" : "투자를 시작할 때 한 번에 넣는 돈")}
          </label>
          {moneyInput("initialInvestment", t.calculator.placeholders.initialAmount)}
        </div>

        <div>
          <label className={fieldLabel}>
            {t.calculator.monthlyInvestment}
            {hint(isEn ? "Regular monthly investment amount" : "매달 꾸준히 더 넣을 돈")}
          </label>
          {moneyInput("monthlyInvestment", t.calculator.placeholders.monthlyAmount)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>
              {t.calculator.investmentPeriod}
              {hint(isEn ? "1 to 50 years" : "1~50년")}
            </label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                placeholder={t.calculator.placeholders.years}
                className="pr-10"
                value={f.investmentPeriod || ""}
                onChange={(e) => set("investmentPeriod", Math.min(parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10), 50))}
              />
              <span className={`${affix} right-3.5`}>{isEn ? "yrs" : "년"}</span>
            </div>
          </div>

          {isEn ? (
            <div>
              <label className={fieldLabel}>{t.calculator.currency}</label>
              <Select value={f.currency} onValueChange={(v) => set("currency", v)}>
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
                배당 재투자
                {hint("배당금을 현금으로 받지 않고 그 돈으로 주식을 더 사는 방식이에요")}
              </label>
              <label htmlFor="drip" className="flex h-11 items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5">
                <span className="text-[14px] text-foreground">{f.dripEnabled ? "켜짐" : "꺼짐"}</span>
                <Switch id="drip" checked={f.dripEnabled} onCheckedChange={(c) => set("dripEnabled", c)} />
              </label>
            </div>
          )}
        </div>

        {isEn && (
          <label htmlFor="drip" className="flex h-11 items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5">
            <span className="flex items-center text-[14px] text-foreground">
              {t.calculator.dripEnabled}
              {hint("Use dividends to buy more shares instead of taking cash")}
            </span>
            <Switch id="drip" checked={f.dripEnabled} onCheckedChange={(c) => set("dripEnabled", c)} />
          </label>
        )}

        <div className="h-px bg-border" />

        {/* 가정 */}
        <div>
          <p className="mb-2.5 text-[13.5px] font-medium text-muted-foreground">{isEn ? "Quick presets" : "빠른 설정"}</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(presets) as PresetKey[]).map((key) => {
              const p = presets[key];
              return (
                <button
                  type="button"
                  key={key}
                  data-active={activePreset === key}
                  className="chip"
                  onClick={() => setF((prev) => ({ ...prev, dividendYield: String(p.y), dividendGrowthRate: String(p.dg), priceGrowthRate: String(p.pg) }))}
                >
                  <span className="block text-[14px] font-semibold text-foreground">{p.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-subtle">{p.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={fieldLabel}>
            {t.calculator.dividendYield}
            {hint(isEn ? "Annual dividend ÷ current price" : "지금 주가 대비 1년 배당금 비율이에요")}
          </label>
          {pctInput("dividendYield", "3.5")}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>
              {isEn ? "Dividend growth" : "배당 성장률"}
              {hint(isEn ? "How fast the dividend per share grows each year" : "주당 배당금이 1년에 몇 % 늘어나는지")}
            </label>
            {pctInput("dividendGrowthRate", "5")}
          </div>
          <div>
            <label className={fieldLabel}>
              {isEn ? "Price growth" : "주가 상승률"}
              {hint(isEn ? "How fast the share price grows each year" : "주가가 1년에 몇 % 오르는지. 배당 성장률보다 낮으면 시가 배당률이 점점 올라가요")}
            </label>
            {pctInput("priceGrowthRate", "5")}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* 세금 */}
        <div>
          <label className={fieldLabel}>
            {isEn ? "Account & tax" : "계좌·세금"}
            {hint(isEn ? "How dividends are taxed" : "어떤 계좌에서 투자하는지에 따라 세금이 달라져요")}
          </label>
          <Select value={f.account} onValueChange={(v) => set("account", v as AccountType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {accountOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {f.account === "custom" && <div className="mt-2.5">{pctInput("customTaxRate", "15")}</div>}
          <p className="mt-2 text-[12.5px] leading-relaxed text-subtle">{accountNote[f.account]}</p>
        </div>

        <Button type="button" onClick={scrollToResults} className="h-12 w-full text-[15px] lg:hidden">
          <ArrowDown className="h-4 w-4" />
          {isEn ? "See results" : "결과 보기"}
        </Button>
      </div>
    </form>
  );
}
