import { useMemo, useState } from "react";
import { Info, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { compareAccounts, type AssetType, type CompareInput } from "@/lib/account-compare";
import { krwShort } from "@/lib/format";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { CompareContentKo } from "@/content/compare-content";

const fieldLabel = "mb-2 flex items-center text-[13.5px] font-medium text-muted-foreground";
const affix = "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[14px] text-subtle";

function Hint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-subtle hover:text-foreground">
          <Info className="h-[15px] w-[15px]" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

function Choice<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(([v, l]) => (
        <button key={String(v)} type="button" data-active={value === v} onClick={() => onChange(v)} className="chip !px-2 !py-2.5 text-center text-[13px] font-medium leading-snug text-foreground">
          {l}
        </button>
      ))}
    </div>
  );
}

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return isFinite(n) ? n : 0;
};

export default function AccountCompare() {
  useSeo("compare", "ko");
  const [monthly, setMonthly] = useState(500_000);
  const [initial, setInitial] = useState(0);
  const [years, setYears] = useState(10);
  const [asset, setAsset] = useState<AssetType>("us_dividend");
  const [yieldStr, setYieldStr] = useState("3.5");
  const [dgStr, setDgStr] = useState("7");
  const [pgStr, setPgStr] = useState("6");
  const [isaType, setIsaType] = useState<CompareInput["isaType"]>("general");
  const [creditRate, setCreditRate] = useState<CompareInput["creditRate"]>(0.132);
  const [pensionTaxRate, setPensionTaxRate] = useState<CompareInput["pensionTaxRate"]>(0.055);

  const r = useMemo(
    () =>
      compareAccounts({
        initialInvestment: initial,
        monthlyInvestment: monthly,
        years: Math.min(Math.max(years || 1, 1), 50),
        dividendYield: Math.min(Math.max(num(yieldStr), 0), 30),
        dividendGrowthRate: Math.min(Math.max(num(dgStr), -20), 40),
        priceGrowthRate: Math.min(Math.max(num(pgStr), -20), 40),
        asset,
        isaType,
        creditRate,
        pensionTaxRate,
      }),
    [initial, monthly, years, yieldStr, dgStr, pgStr, asset, isaType, creditRate, pensionTaxRate]
  );

  const max = Math.max(...r.accounts.map((a) => a.totalBenefit));
  const min = Math.min(...r.accounts.map((a) => a.totalBenefit));
  const best = r.accounts.find((a) => a.id === r.bestId)!;
  const worst = r.accounts.reduce((a, b) => (b.totalBenefit < a.totalBenefit ? b : a));

  const money = (label: string, value: number, set: (n: number) => void, hint?: string) => (
    <div>
      <label className={fieldLabel}>
        {label}
        {hint && <Hint text={hint} />}
      </label>
      <div className="relative">
        <span className={`${affix} left-3.5`}>₩</span>
        <Input
          type="text"
          inputMode="numeric"
          className="pl-9 text-[16px] font-semibold"
          value={value ? value.toLocaleString("ko-KR") : ""}
          placeholder="0"
          onChange={(e) => set(parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10))}
        />
      </div>
    </div>
  );
  const pct = (label: string, value: string, set: (s: string) => void, hint: string) => (
    <div>
      <label className={fieldLabel}>
        {label}
        <Hint text={hint} />
      </label>
      <div className="relative">
        <Input type="text" inputMode="decimal" className="pr-9" value={value} onChange={(e) => set(e.target.value.replace(/[^0-9.\-]/g, ""))} />
        <span className={`${affix} right-3.5`}>%</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="계좌별 절세 비교"
        title={<>일반계좌 vs ISA vs 연금저축, <span className="text-gold">어디가 이득</span>일까?</>}
        subtitle="같은 돈을 같은 ETF에 넣어도 어느 계좌에 담느냐에 따라 손에 쥐는 돈이 달라져요. 세금을 다 뗀 뒤 금액으로 비교해요."
      />

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr] lg:gap-6">
        <form onSubmit={(e) => e.preventDefault()} className="panel space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">투자 조건</h2>
            <span className="kicker">실시간 계산</span>
          </div>

          <div>
            <p className={fieldLabel}>무엇에 투자하나요?</p>
            <Choice
              value={asset}
              onChange={setAsset}
              options={[
                ["us_dividend", "미국 배당 ETF"],
                ["kr_domestic", "국내 주식·ETF"],
              ]}
            />
            <p className="mt-2 text-[12.5px] leading-relaxed text-subtle">
              {asset === "us_dividend"
                ? "SCHD 같은 미국 배당 ETF예요. ISA·연금에서는 국내상장 미국배당 ETF로 사요."
                : "삼성전자 같은 국내 주식이나 국내 주식형 배당 ETF예요."}
            </p>
          </div>

          {money("월 투자금", monthly, setMonthly)}
          <div className="grid grid-cols-2 gap-3">
            {money("초기 투자금", initial, setInitial)}
            <div>
              <label className={fieldLabel}>투자 기간</label>
              <div className="relative">
                <Input type="text" inputMode="numeric" className="pr-10" value={years || ""} onChange={(e) => setYears(Math.min(parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10), 50))} />
                <span className={`${affix} right-3.5`}>년</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {pct("세전 배당률", yieldStr, setYieldStr, "세금 떼기 전 배당률이에요. 미국 ETF는 미국 기준 배당수익률을 넣어요.")}
          <div className="grid grid-cols-2 gap-3">
            {pct("배당 성장률", dgStr, setDgStr, "주당 배당금이 1년에 몇 % 늘어나는지")}
            {pct("주가 상승률", pgStr, setPgStr, "주가가 1년에 몇 % 오르는지")}
          </div>

          <div className="h-px bg-border" />

          <div>
            <p className={fieldLabel}>ISA 유형</p>
            <Choice value={isaType} onChange={setIsaType} options={[["general", "일반형 (200만원)"], ["low", "서민형 (400만원)"]]} />
          </div>
          <div>
            <p className={fieldLabel}>
              연금 세액공제율
              <Hint text="총급여 5,500만원 이하(종합소득 4,500만원 이하)는 16.5%, 넘으면 13.2%예요. 연 900만원 납입분까지 받아요." />
            </p>
            <Choice value={creditRate} onChange={setCreditRate} options={[[0.132, "13.2%"], [0.165, "16.5%"]]} />
          </div>
          <div>
            <p className={fieldLabel}>
              연금 받을 나이
              <Hint text="연금소득세는 받을 때 나이에 따라 달라져요." />
            </p>
            <Choice value={pensionTaxRate} onChange={setPensionTaxRate} options={[[0.055, "55~69세 5.5%"], [0.044, "70대 4.4%"], [0.033, "80세+ 3.3%"]]} />
          </div>
        </form>

        <div id="results" className="min-w-0 scroll-mt-24 space-y-4">
          <section className="panel-hero p-5 sm:p-7">
            <p className="kicker text-gold/90">{years}년 뒤 세금 뗀 결과</p>
            <p className="mt-3 text-[22px] font-bold leading-snug tracking-[-0.03em] sm:text-[28px]">
              <span className="text-gold">{best.name}</span>이 가장 유리해요
            </p>
            <p className="num mt-2 text-[14px] text-muted-foreground">
              {worst.id !== best.id && (
                <>
                  {worst.name}({worst.sub.split(" (")[0]})보다 <b className="font-semibold text-mint">+{krwShort(max - min)}</b> 더 남아요
                  {best.taxCredit > 0 && " (세액공제 환급 포함)"}
                </>
              )}
            </p>

            <div className="mt-6 space-y-3">
              {r.accounts.map((a) => (
                <div key={a.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className={cn("font-medium", a.id === r.bestId ? "text-foreground" : "text-muted-foreground")}>
                      {a.name} <span className="text-[12px] text-subtle">· {a.sub}</span>
                    </span>
                    <span className={cn("num shrink-0 font-semibold", a.id === r.bestId ? "text-gold" : "text-foreground")}>{krwShort(a.totalBenefit)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={cn("h-full rounded-full", a.id === r.bestId ? "bg-gold" : "bg-iris/70")}
                      style={{ width: `${Math.max(4, (a.totalBenefit / max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-subtle">넣은 돈 {krwShort(r.invested)} 기준 · 연금저축은 세액공제 환급을 더한 금액이에요.</p>
          </section>

          {r.warnings.map((w) => (
            <div key={w} className="note note-risk text-muted-foreground">{w}</div>
          ))}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {r.accounts.map((a) => (
              <section key={a.id} className={cn("panel p-5", a.id === r.bestId && "!border-gold/40")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[16px] font-semibold">{a.name}</h3>
                    <p className="text-[12.5px] text-subtle">{a.sub}</p>
                  </div>
                  {a.id === r.bestId && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-[12px] font-semibold text-gold">
                      <Trophy className="h-3.5 w-3.5" /> 최고
                    </span>
                  )}
                </div>
                <dl className="num mt-4 space-y-2 text-[13.5px]">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">세금 떼기 전 평가액</dt><dd>{krwShort(a.finalValue)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">기간 중 배당에서 빠진 세금</dt><dd className={a.dividendTax > 0 ? "text-coral" : ""}>{a.dividendTax > 0 ? `−${krwShort(a.dividendTax)}` : "0원"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{a.exitTaxLabel}</dt><dd className={a.exitTax > 0 ? "text-coral" : ""}>{a.exitTax > 0 ? `−${krwShort(a.exitTax)}` : "0원"}</dd></div>
                  {a.taxCredit > 0 && (
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">세액공제 환급 (합계)</dt><dd className="text-mint">+{krwShort(a.taxCredit)}</dd></div>
                  )}
                  <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold"><dt>손에 쥐는 돈</dt><dd className={a.id === r.bestId ? "text-gold" : ""}>{krwShort(a.totalBenefit)}</dd></div>
                </dl>
                <ul className="mt-3 space-y-1 text-[12px] leading-relaxed text-subtle">
                  {a.notes.map((n) => <li key={n}>· {n}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>

      <RiskNote title="계산 안내">
        2026년 세법 기준 추정치예요. 국내상장 해외 ETF의 분배금은 펀드 안에서 외국 세금이 먼저 빠지는 구조라 실제 금액이 상품마다 조금씩 달라요. 연금은 55세 이후 연금으로 받는 경우, ISA는 의무기간을 채운 경우를 가정했어요.
      </RiskNote>

      <CompareContentKo />
    </div>
  );
}
