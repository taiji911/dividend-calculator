import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, Calculator } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CalculatorTabs from "@/components/calculator-tabs";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";

const TAX_BRACKETS = [
  { limit: 14000000, rate: 0.06, deduction: 0 },
  { limit: 50000000, rate: 0.15, deduction: 1260000 },
  { limit: 88000000, rate: 0.24, deduction: 5760000 },
  { limit: 150000000, rate: 0.35, deduction: 15440000 },
  { limit: 300000000, rate: 0.38, deduction: 19940000 },
  { limit: 500000000, rate: 0.40, deduction: 25940000 },
  { limit: 1000000000, rate: 0.42, deduction: 35940000 },
  { limit: Infinity, rate: 0.45, deduction: 65940000 },
];

function calcProgressiveTax(income: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (income <= bracket.limit) {
      return Math.round(income * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function TaxCalculator() {
  const [dividendIncome, setDividendIncome] = useState<string>("");
  const [otherIncome, setOtherIncome] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const THRESHOLD = 20000000; // 2,000만원

  const handleCalculate = () => {
    const dividend = parseFloat(dividendIncome.replace(/,/g, "")) || 0;
    const other = parseFloat(otherIncome.replace(/,/g, "")) || 0;

    if (dividend <= 0) return;

    // 2,000만원 이하: 분리과세 (원천징수 15.4%)
    if (dividend <= THRESHOLD) {
      const withholdingTax = Math.round(dividend * 0.154);
      setResult({
        type: "withholding",
        dividendIncome: dividend,
        withholdingTax,
        netIncome: dividend - withholdingTax,
        monthlyNet: Math.round((dividend - withholdingTax) / 12),
        isHealthRisk: false,
        isThresholdRisk: dividend > THRESHOLD * 0.8,
      });
      return;
    }

    // 2,000만원 초과: 종합과세
    const totalIncome = dividend + other;
    const basicDeduction = 1500000; // 기본공제 150만원
    const taxableIncome = Math.max(0, totalIncome - basicDeduction);

    const totalTax = calcProgressiveTax(taxableIncome);
    // 이미 원천징수된 세금 (2,000만원 × 15.4%)
    const alreadyWithheld = Math.round(THRESHOLD * 0.154);
    const additionalTax = Math.max(0, totalTax - alreadyWithheld);
    const localTax = Math.round(totalTax * 0.1); // 지방소득세 10%
    const finalTax = totalTax + localTax;
    const netIncome = dividend - additionalTax - localTax;

    // 종합소득 2,000만원 초과 = 건강보험 피부양자 탈락
    const isHealthRisk = dividend > THRESHOLD;

    setResult({
      type: "comprehensive",
      dividendIncome: dividend,
      otherIncome: other,
      totalIncome,
      taxableIncome,
      totalTax,
      localTax,
      finalTax,
      alreadyWithheld,
      additionalTax,
      netIncome,
      monthlyNet: Math.round(netIncome / 12),
      isHealthRisk,
      isThresholdRisk: false,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="금융소득종합과세 계산기"
        title={<>배당이 연 <span className="text-gold">2,000만원</span>을 넘으면?</>}
        subtitle="배당소득이 연 2,000만원을 초과할 때 세금을 미리 계산해보세요"
      />

      <CalculatorTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* 입력 */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">소득 정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 배당소득 */}
              <div>
                <Label className="flex items-center gap-1">
                  연간 배당소득 (세전)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button"><Info className="h-4 w-4 text-subtle" /></button>
                    </TooltipTrigger>
                    <TooltipContent>JEPI, SCHD 등에서 받는 연간 배당금 합계 (세금 차감 전)</TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₩</span>
                  <Input
                    type="text"
                    className="pl-8"
                    placeholder="20,000,000"
                    value={dividendIncome}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(v))) setDividendIncome(Number(v).toLocaleString());
                    }}
                  />
                </div>
                {/* 2,000만원 임박 경고 */}
                {parseFloat(dividendIncome.replace(/,/g, "")) > 16000000 &&
                  parseFloat(dividendIncome.replace(/,/g, "")) <= 20000000 && (
                  <p className="text-xs text-gold mt-1">
                    연 2,000만원에 근접! 초과 시 종합과세 대상이 됩니다.
                  </p>
                )}
              </div>

              {/* 종합과세 시 다른 소득 */}
              <div>
                <Label className="flex items-center gap-1">
                  다른 종합소득 (근로·사업 등)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button"><Info className="h-4 w-4 text-subtle" /></button>
                    </TooltipTrigger>
                    <TooltipContent>배당소득 2,000만원 초과 시 다른 소득과 합산됩니다. 없으면 0으로 두세요.</TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₩</span>
                  <Input
                    type="text"
                    className="pl-8"
                    placeholder="0"
                    value={otherIncome}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(v))) setOtherIncome(Number(v).toLocaleString());
                    }}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleCalculate} disabled={!dividendIncome}>
                <Calculator className="mr-2 h-4 w-4" />
                세금 계산하기
              </Button>
            </CardContent>
          </Card>

          {/* 기준 안내 */}
          <Card className="!border-iris/30 !bg-iris/[0.06]">
            <CardContent className="space-y-2 p-5 text-[13px] leading-relaxed text-muted-foreground">
              <p className="font-semibold text-iris">핵심 기준</p>
              <p>• <strong>2,000만원 이하</strong>: 분리과세 (15.4% 원천징수로 종결)</p>
              <p>• <strong>2,000만원 초과</strong>: 다른 소득과 합산, 누진세율 적용</p>
              <p>• <strong>건강보험 피부양자</strong>: 금융소득 연 2,000만원 초과 시 탈락</p>
              <p className="mt-2 text-subtle">※ 본 계산기는 참고용이며 실제 세금과 다를 수 있습니다.</p>
            </CardContent>
          </Card>
        </div>

        {/* 결과 */}
        <div className="lg:col-span-2">
          {!result ? (
            <Card className="flex h-80 items-center justify-center border-dashed">
              <CardContent className="text-center">
                <Calculator className="h-12 w-12 text-subtle mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">세금 계산 결과</h3>
                <p className="text-muted-foreground text-sm">왼쪽에서 배당소득을 입력하고 계산 버튼을 클릭하세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* 과세 유형 뱃지 */}
              <Card className={result.type === "withholding" ? "border-mint/30 bg-mint/10" : "border-gold/30 bg-gold/10"}>
                <CardContent className="p-4 flex items-center gap-3">
                  {result.type === "withholding"
                    ? <CheckCircle className="h-6 w-6 text-mint flex-shrink-0" />
                    : <AlertTriangle className="h-6 w-6 text-gold flex-shrink-0" />
                  }
                  <div>
                    <p className={`font-semibold text-sm ${result.type === "withholding" ? "text-mint" : "text-gold"}`}>
                      {result.type === "withholding" ? "분리과세 대상 (2,000만원 이하)" : "금융소득종합과세 대상 (2,000만원 초과)"}
                    </p>
                    <p className={`text-xs mt-0.5 ${result.type === "withholding" ? "text-mint" : "text-gold"}`}>
                      {result.type === "withholding"
                        ? "15.4% 원천징수로 납세 의무 종결. 별도 종합소득세 신고 불필요."
                        : "5월에 종합소득세 신고 필요. 다른 소득과 합산 과세됩니다."}
                    </p>
                    {result.isThresholdRisk && (
                      <p className="text-xs text-gold mt-1">연 2,000만원에 근접 — 초과하지 않도록 주의하세요!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 세금 상세 */}
              <Card>
                <CardHeader><CardTitle className="text-base">세금 상세 내역</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="num flex justify-between border-b border-border py-2.5">
                      <span className="text-muted-foreground">연간 배당소득 (세전)</span>
                      <span className="font-medium">{formatKRW(result.dividendIncome)}</span>
                    </div>
                    {result.type === "withholding" ? (
                      <>
                        <div className="num flex justify-between border-b border-border py-2.5">
                          <span className="text-muted-foreground">원천징수세 (15.4%)</span>
                          <span className="font-medium text-coral">- {formatKRW(result.withholdingTax)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5 font-semibold">
                          <span>세후 연간 배당금</span>
                          <span className="text-mint">{formatKRW(result.netIncome)}</span>
                        </div>
                        <div className="num mt-2 flex items-center justify-between rounded-xl bg-mint/10 px-3 py-3 font-bold">
                          <span>세후 월 배당금</span>
                          <span className="text-mint text-lg">{formatKRW(result.monthlyNet)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {result.otherIncome > 0 && (
                          <div className="num flex justify-between border-b border-border py-2.5">
                            <span className="text-muted-foreground">다른 종합소득</span>
                            <span className="font-medium">+ {formatKRW(result.otherIncome)}</span>
                          </div>
                        )}
                        <div className="num flex justify-between border-b border-border py-2.5">
                          <span className="text-muted-foreground">합산 과세표준</span>
                          <span className="font-medium">{formatKRW(result.taxableIncome)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5">
                          <span className="text-muted-foreground">산출 세액 (누진세)</span>
                          <span className="font-medium text-coral">- {formatKRW(result.totalTax)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5">
                          <span className="text-muted-foreground">지방소득세 (10%)</span>
                          <span className="font-medium text-coral">- {formatKRW(result.localTax)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5">
                          <span className="text-muted-foreground">기납부 원천징수세</span>
                          <span className="font-medium text-muted-foreground">{formatKRW(result.alreadyWithheld)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5 text-gold font-semibold">
                          <span>추가 납부세액</span>
                          <span>- {formatKRW(result.additionalTax)}</span>
                        </div>
                        <div className="num flex justify-between border-b border-border py-2.5 font-semibold">
                          <span>세후 연간 배당금</span>
                          <span className="text-mint">{formatKRW(result.netIncome)}</span>
                        </div>
                        <div className="num mt-2 flex items-center justify-between rounded-xl bg-mint/10 px-3 py-3 font-bold">
                          <span>세후 월 배당금</span>
                          <span className="text-mint text-lg">{formatKRW(result.monthlyNet)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 건강보험 피부양자 경고 */}
              {result.isHealthRisk && (
                <Card className="border-coral/30 bg-coral/10">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-coral">건강보험 피부양자 탈락 주의!</p>
                      <p className="text-coral text-xs mt-1">
                        금융소득이 연 2,000만원을 초과하면 건강보험 피부양자 자격을 잃습니다.
                        배우자나 부모님 건강보험 피부양자라면 별도 지역가입자로 전환되어 보험료가 발생합니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 면책 고지 */}
      <RiskNote title="세금 계산 안내">본 계산기는 참고용이며 실제 세금과 다를 수 있습니다. 정확한 세금 계산은 국세청 홈택스 또는 세무사와 상담하시기 바랍니다.</RiskNote>
    </div>
  );
}
