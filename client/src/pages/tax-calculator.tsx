import { useMemo, useState } from "react";
import { Info, CheckCircle2, AlertTriangle, HeartPulse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import { useSeo } from "@/lib/seo";
import RiskNote from "@/components/risk-note";
import { TaxContentKo } from "@/content/tax-content";
import { calcFinancialTax, FIN_TAX, type InsuranceStatus } from "@/lib/financial-tax";
import { krwShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

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

function MoneyField({ label, hint, value, onChange, placeholder = "0" }: { label: string; hint?: string; value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-2 flex items-center text-[13.5px] font-medium text-muted-foreground">
        {label}
        {hint && <Hint text={hint} />}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-subtle">₩</span>
        <Input
          type="text"
          inputMode="numeric"
          className="pl-9 text-[16px] font-semibold"
          placeholder={placeholder}
          value={value ? value.toLocaleString("ko-KR") : ""}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10);
            onChange(isNaN(n) ? 0 : n);
          }}
        />
      </div>
      {value >= 10_000 && <p className="mt-1.5 text-[12px] text-subtle">{krwShort(value)}</p>}
    </div>
  );
}

function Row({ label, value, tone, strong, sub }: { label: React.ReactNode; value: string; tone?: "minus" | "plus" | "gold"; strong?: boolean; sub?: string }) {
  return (
    <div className={cn("num flex items-start justify-between gap-4 border-b border-border py-2.5 text-[14px] last:border-0", strong && "font-semibold")}>
      <span className="text-muted-foreground">
        {label}
        {sub && <span className="mt-0.5 block text-[12px] font-normal text-subtle">{sub}</span>}
      </span>
      <span className={cn("shrink-0", tone === "minus" && "text-coral", tone === "plus" && "text-mint", tone === "gold" && "text-gold", !tone && "text-foreground")}>{value}</span>
    </div>
  );
}

export default function TaxCalculator() {
  useSeo("tax", "ko");

  const [domestic, setDomestic] = useState(15_000_000);
  const [otherFin, setOtherFin] = useState(5_000_000);
  const [foreign, setForeign] = useState(10_000_000);
  const [useHigh, setUseHigh] = useState(false);
  const [high, setHigh] = useState(0);
  const [taxBase, setTaxBase] = useState(40_000_000);
  const [insurance, setInsurance] = useState<InsuranceStatus>("employee");
  const [otherIncome, setOtherIncome] = useState(0);

  const r = useMemo(
    () =>
      calcFinancialTax({
        domesticDividends: domestic,
        otherFinancial: otherFin,
        foreignDividends: foreign,
        highDividend: useHigh ? high : 0,
        otherTaxBase: taxBase,
        insurance,
        otherIncomeForInsurance: otherIncome,
      }),
    [domestic, otherFin, foreign, useHigh, high, taxBase, insurance, otherIncome]
  );

  const extra = Math.max(0, r.additionalTotal) + r.highDividendExtra;
  const refund = r.additionalTotal < 0;
  const leftToThreshold = FIN_TAX.threshold - r.financialIncome;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="금융소득종합과세 계산기"
        title={<>배당이 연 <span className="text-gold">2,000만원</span>을 넘으면?</>}
        subtitle="이자·배당이 2,000만원을 넘을 때 5월 종합소득세로 더 내는 세금과 건강보험료 영향을 계산해요."
      />

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[400px_1fr] lg:gap-6">
        {/* 입력 */}
        <div className="space-y-4">
          <section className="panel space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold">1년 금융소득</h2>
              <span className="kicker">세전 금액</span>
            </div>
            <MoneyField label="국내 주식 배당" hint="삼성전자 같은 국내 상장주식에서 받은 배당 (세금 떼기 전)" value={domestic} onChange={setDomestic} />
            <MoneyField label="국내 ETF 분배금 · 이자" hint="국내상장 ETF 분배금, 리츠 배당, 예금·채권 이자 등" value={otherFin} onChange={setOtherFin} />
            <MoneyField label="해외 주식 배당" hint="미국 주식 등에서 받은 배당 (현지 세금 떼기 전, 원화 환산)" value={foreign} onChange={setForeign} />

            <div className="rounded-xl border border-border bg-surface-2 p-3.5">
              <label htmlFor="high" className="flex items-center justify-between gap-3">
                <span className="text-[14px] text-foreground">
                  고배당기업 배당 분리과세
                  <span className="mt-0.5 block text-[12px] text-subtle">2026년 지급분부터 한시 적용 · 신청 필요</span>
                </span>
                <Switch id="high" checked={useHigh} onCheckedChange={setUseHigh} />
              </label>
              {useHigh && (
                <div className="mt-3">
                  <MoneyField label="분리과세할 고배당기업 배당" hint="거래소(KIND)에 고배당기업으로 공시된 회사의 배당. 위 '국내 주식 배당'과 겹치지 않게 넣어주세요." value={high} onChange={setHigh} />
                </div>
              )}
            </div>
          </section>

          <section className="panel space-y-5 p-5 sm:p-6">
            <h2 className="text-[17px] font-semibold">다른 소득 · 건강보험</h2>
            <MoneyField
              label="다른 종합소득 과세표준"
              hint="근로·사업소득 등에서 소득공제를 뺀 금액. 직장인은 연말정산 원천징수영수증의 '과세표준'을 넣으면 돼요."
              value={taxBase}
              onChange={setTaxBase}
            />
            <div>
              <p className="mb-2 text-[13.5px] font-medium text-muted-foreground">건강보험 자격</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["employee", "직장가입자"],
                  ["dependent", "피부양자"],
                  ["regional", "지역가입자"],
                ] as [InsuranceStatus, string][]).map(([v, l]) => (
                  <button key={v} type="button" data-active={insurance === v} onClick={() => setInsurance(v)} className="chip !py-2.5 text-center text-[13.5px] font-medium text-foreground">
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {insurance !== "regional" && (
              <MoneyField
                label={insurance === "dependent" ? "연금·근로 등 다른 소득 (연간)" : "월급 외 다른 소득 (연간)"}
                hint={insurance === "dependent" ? "공적연금, 근로소득, 기타소득 등 1년 소득금액" : "임대·사업·기타소득 등 월급 말고 버는 소득"}
                value={otherIncome}
                onChange={setOtherIncome}
              />
            )}
          </section>
        </div>

        {/* 결과 */}
        <div id="results" className="min-w-0 scroll-mt-24 space-y-4">
          <section className="panel-hero p-5 sm:p-7">
            <div className="flex items-center gap-2">
              {r.comprehensive ? <AlertTriangle className="h-4 w-4 text-gold" /> : <CheckCircle2 className="h-4 w-4 text-mint" />}
              <p className={cn("text-[13.5px] font-semibold", r.comprehensive ? "text-gold" : "text-mint")}>
                {r.comprehensive ? "종합과세 대상 (금융소득 2,000만원 초과)" : "분리과세로 끝나요 (금융소득 2,000만원 이하)"}
              </p>
            </div>
            <p className="kicker mt-5">5월에 더 낼 세금 (지방세 포함)</p>
            <p className="num mt-2 text-[38px] font-bold leading-none tracking-[-0.04em] sm:text-[52px]">{extra > 0 ? krwShort(extra) : "0원"}</p>
            <p className="num mt-2 text-[13px] text-subtle">
              {refund ? "원천징수·해외 세금이 더 많아 환급될 수도 있어요" : won(extra)}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
              <div>
                <p className="text-[12px] text-muted-foreground">금융소득</p>
                <p className="num mt-1 text-[16px] font-semibold">{krwShort(r.financialIncome + (useHigh ? high : 0))}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">실효세율</p>
                <p className="num mt-1 text-[16px] font-semibold text-coral">{r.effectiveRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">세후 금융소득</p>
                <p className="num mt-1 text-[16px] font-semibold text-mint">{krwShort(r.netFinancialIncome)}</p>
              </div>
            </div>
          </section>

          {!r.comprehensive && leftToThreshold > 0 && (
            <div className={cn("note", leftToThreshold < 4_000_000 ? "note-warn" : "note-good", "text-muted-foreground")}>
              2,000만원까지 <b className="font-semibold text-foreground">{krwShort(leftToThreshold)}</b> 남았어요.
              {leftToThreshold < 4_000_000 && " 연말 배당이 몰리는 종목이 있다면 넘지 않게 확인해 보세요."}
            </div>
          )}

          {/* 세금 계산 내역 */}
          <section className="panel p-5 sm:p-6">
            <p className="kicker mb-1">계산 내역</p>
            <h3 className="mb-3 text-[17px] font-semibold">세금은 이렇게 계산했어요</h3>
            <Row label="받을 때 원천징수 (국내 15.4%)" value={`−${won(r.domesticWithheld * 1.1)}`} tone="minus" />
            {r.foreignPaid > 0 && <Row label="해외 현지 원천징수 (미국 15%)" value={`−${won(r.foreignPaid)}`} tone="minus" />}
            {r.comprehensive ? (
              <>
                {r.grossUp > 0 && <Row label="Gross-up (국내 주식 배당 가산)" sub="2,000만원 초과분 중 국내 주식 배당 × 10%를 과세표준에 더해요" value={`+${won(r.grossUp)}`} />}
                <Row label="① 종합과세 방식" sub="(과세표준 − 2,000만원) × 기본세율 + 2,000만원 × 14%" value={won(r.methodA)} />
                <Row label="② 분리과세 방식" sub="다른 소득 × 기본세율 + 금융소득 × 14%" value={won(r.methodB)} />
                <Row label="산출세액 (둘 중 큰 금액)" value={won(r.computedTax)} strong />
                {r.dividendCredit > 0 && <Row label="배당세액공제" value={`−${won(r.dividendCredit)}`} tone="plus" />}
                {r.foreignCredit > 0 && <Row label="외국납부세액공제 (해외 배당)" value={`−${won(r.foreignCredit)}`} tone="plus" />}
                <Row label="다른 소득에 대해 원래 내는 세금" sub="금융소득이 없었을 때의 세금" value={`−${won(r.baselineTax)}`} />
                <Row label="이미 원천징수된 국내 금융소득세" value={`−${won(r.domesticWithheld)}`} />
                <Row label="5월 추가 납부 (국세)" value={won(Math.max(0, r.additionalNational))} tone="gold" strong />
                <Row label="지방소득세 (10%)" value={won(Math.max(0, r.additionalLocal))} tone="gold" />
              </>
            ) : (
              <Row label="추가로 낼 세금" sub="원천징수로 납세가 끝나요" value="0원" strong />
            )}
            {useHigh && high > 0 && (
              <Row label="고배당기업 분리과세 추가분" sub="구간 세율(14~30%)과 받을 때 낸 14%의 차이, 지방세 포함" value={won(r.highDividendExtra)} tone="gold" />
            )}
          </section>

          {/* 건강보험 */}
          <section className={cn("panel p-5 sm:p-6", r.health.status === "risk" && "!border-coral/40")}>
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", r.health.status === "risk" ? "bg-coral/10 text-coral" : "bg-mint/10 text-mint")}>
                <HeartPulse className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold">건강보험 영향</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{r.health.message}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-subtle">
                  금융소득은 1년에 1,000만원 이하면 건강보험 소득에 넣지 않고, 넘으면 전액을 넣어요. 피부양자는 재산(과세표준 5.4억원 이하 기준)과 사업소득 여부도 함께 봐요.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <RiskNote title="세금 계산 안내">
        추정치예요. 소득공제·세액공제, 다른 소득의 실제 결정세액, 환율, 배당 종류에 따라 실제 세금은 달라질 수 있어요. 고배당기업 분리과세는 대상 기업과 적용 기간을 국세청·거래소 공시로 확인하고, 정확한 신고는 홈택스나 세무사와 상담해 주세요.
      </RiskNote>

      <TaxContentKo />
    </div>
  );
}
