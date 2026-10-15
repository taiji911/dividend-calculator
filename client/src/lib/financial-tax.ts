/**
 * 금융소득종합과세 계산 — 배당·이자가 연 2,000만원을 넘을 때 5월에 더 내는 세금을 추정해요.
 *
 * 계산 순서 (소득세법 비교과세)
 *  1) 금융소득 = 국내 배당 + 국내 ETF 분배금·이자 + 해외 배당 (고배당기업 분리과세 선택분은 제외)
 *  2) 2,000만원 이하 → 원천징수(14%, 지방세 포함 15.4%)로 끝 (분리과세)
 *  3) 2,000만원 초과 → 아래 두 금액 중 큰 쪽이 산출세액
 *       ① 종합과세 방식: (종합소득 과세표준 − 2,000만원) × 기본세율 + 2,000만원 × 14%
 *       ② 분리과세 방식: 다른 종합소득 과세표준 × 기본세율 + 금융소득 × 14%
 *     · 2,000만원을 넘는 부분 중 국내 주식 배당(법인세를 낸 이익에서 나온 배당)은 10%를 더해(Gross-up)
 *       과세표준에 넣고, 같은 금액 한도로 배당세액공제를 해줘요. (한도: ① − ②)
 *     · 2,000만원을 채우는 순서: 이자·ETF 분배금 → 국내 주식 배당 (그래서 Gross-up은 국내 주식 배당에서 먼저 생겨요)
 *     · 해외 배당은 현지(미국 15%)에서 낸 세금을 외국납부세액공제로 빼줘요.
 *  4) 추가 납부 = 결정세액 − 다른 소득에 대해 이미 낸 세금 − 금융소득 원천징수세액, 지방소득세 10% 별도
 *
 *  고배당기업 배당 분리과세(2026년 지급분부터 한시 적용, 신청해야 적용):
 *    종합과세에 합치지 않고 그 배당만 14%(2천만원 이하)·20%(3억 이하)·25%(50억 이하)·30%로 따로 과세
 *
 *  ※ 결과는 추정치예요. 세액공제·감면, 다른 소득의 실제 결정세액에 따라 달라질 수 있어요.
 */

export const FIN_TAX = {
  threshold: 20_000_000,
  withholding: 0.14,
  localRate: 0.1,
  grossUpRate: 0.1,
  foreignWithholding: 0.15, // 미국 주식 배당 현지 원천징수 (한미 조세조약)
  brackets: [
    { limit: 14_000_000, rate: 0.06, deduction: 0 },
    { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { limit: 500_000_000, rate: 0.4, deduction: 25_940_000 },
    { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
    { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
  ],
  highDividend: [
    { limit: 20_000_000, rate: 0.14 },
    { limit: 300_000_000, rate: 0.2 },
    { limit: 5_000_000_000, rate: 0.25 },
    { limit: Infinity, rate: 0.3 },
  ],
  health: { financialFloor: 10_000_000, dependentLimit: 20_000_000, otherIncomeLimit: 20_000_000 },
} as const;

/** 종합소득 기본세율 (국세) */
export function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  for (const b of FIN_TAX.brackets) {
    if (base <= b.limit) return Math.max(0, base * b.rate - b.deduction);
  }
  return 0;
}

/** 고배당기업 배당 분리과세 세액 (국세) */
export function highDividendTax(amount: number): number {
  let tax = 0;
  let prev = 0;
  for (const b of FIN_TAX.highDividend) {
    if (amount <= prev) break;
    tax += (Math.min(amount, b.limit) - prev) * b.rate;
    prev = b.limit;
  }
  return tax;
}

export type InsuranceStatus = "employee" | "dependent" | "regional";

export interface FinTaxInput {
  /** 국내 주식 배당 (일반 상장주식) */
  domesticDividends: number;
  /** 국내 ETF 분배금·리츠·예금 이자 등 (Gross-up 없음) */
  otherFinancial: number;
  /** 해외 주식 배당 (현지 세금 떼기 전 금액) */
  foreignDividends: number;
  /** 고배당기업 배당 — 분리과세를 신청할 금액 */
  highDividend: number;
  /** 다른 종합소득 과세표준 (근로·사업소득 등, 소득공제 후) */
  otherTaxBase: number;
  insurance: InsuranceStatus;
  /** 건보 판단용: 연금·근로·기타 등 다른 소득금액 (연간) */
  otherIncomeForInsurance: number;
}

export interface FinTaxResult {
  financialIncome: number;
  comprehensive: boolean;
  grossUp: number;
  taxBase: number;
  methodA: number;
  methodB: number;
  computedTax: number;
  dividendCredit: number;
  foreignCredit: number;
  determinedTax: number;
  baselineTax: number;
  domesticWithheld: number;
  foreignPaid: number;
  /** 5월에 더 낼 세금 (국세 + 지방세). 음수면 환급 가능성 */
  additionalNational: number;
  additionalLocal: number;
  additionalTotal: number;
  highDividendExtra: number;
  /** 금융소득 전체에 대해 낸 세금 (원천징수 + 현지세금 + 추가 납부) */
  totalFinancialTax: number;
  effectiveRate: number;
  netFinancialIncome: number;
  health: {
    counted: number;
    status: "ok" | "risk";
    message: string;
  };
}

export function calcFinancialTax(i: FinTaxInput): FinTaxResult {
  const E = Math.max(0, i.domesticDividends);
  const N = Math.max(0, i.otherFinancial);
  const Fo = Math.max(0, i.foreignDividends);
  const H = Math.max(0, i.highDividend);
  const X = Math.max(0, i.otherTaxBase);
  const T = FIN_TAX.threshold;

  const F = E + N + Fo;
  const domesticWithheld = (E + N) * FIN_TAX.withholding;
  const foreignPaid = Fo * FIN_TAX.foreignWithholding;
  const comprehensive = F > T;

  let grossUp = 0, taxBase = X, methodA = 0, methodB = 0, computedTax = 0;
  let dividendCredit = 0, foreignCredit = 0, determinedTax = 0;
  const baselineTax = progressiveTax(X);

  if (comprehensive) {
    // 2천만원 초과분 중 국내 주식 배당 해당액에 Gross-up
    grossUp = Math.min(E, F - T) * FIN_TAX.grossUpRate;
    taxBase = X + F + grossUp;
    methodA = progressiveTax(taxBase - T) + T * FIN_TAX.withholding;
    methodB = progressiveTax(X) + F * FIN_TAX.withholding;
    computedTax = Math.max(methodA, methodB);
    dividendCredit = methodA > methodB ? Math.min(grossUp, methodA - methodB) : 0;
    // 외국납부세액공제 한도 ≈ 산출세액 × 해외 배당 / 종합소득 과세표준
    foreignCredit = Fo > 0 && taxBase > 0 ? Math.min(foreignPaid, computedTax * (Fo / taxBase)) : 0;
    determinedTax = Math.max(0, computedTax - dividendCredit - foreignCredit);
  }

  const additionalNational = comprehensive ? determinedTax - baselineTax - domesticWithheld : 0;
  const additionalLocal = additionalNational * FIN_TAX.localRate;

  // 고배당기업 분리과세: 받을 때 14% 원천징수 → 구간 세율과의 차이를 추가 납부
  const highTax = highDividendTax(H);
  const highDividendExtra = Math.max(0, highTax - H * FIN_TAX.withholding) * (1 + FIN_TAX.localRate);

  const totalFinancialTax =
    domesticWithheld * (1 + FIN_TAX.localRate) +
    foreignPaid +
    Math.max(0, additionalNational + additionalLocal) +
    H * FIN_TAX.withholding * (1 + FIN_TAX.localRate) +
    highDividendExtra;
  const allFinancial = F + H;
  const effectiveRate = allFinancial > 0 ? (totalFinancialTax / allFinancial) * 100 : 0;

  // 건강보험: 금융소득이 1천만원 이하면 반영 안 하고, 넘으면 전액 반영
  const finForHealth = F + H;
  const counted = finForHealth > FIN_TAX.health.financialFloor ? finForHealth : 0;
  const other = Math.max(0, i.otherIncomeForInsurance);
  let health: FinTaxResult["health"];
  if (i.insurance === "dependent") {
    const sum = counted + other;
    health = sum > FIN_TAX.health.dependentLimit
      ? { counted, status: "risk", message: `합산 소득이 ${Math.round(sum / 10000).toLocaleString()}만원으로 2,000만원을 넘어요. 피부양자 자격을 잃고 지역가입자로 바뀔 수 있어요.` }
      : { counted, status: "ok", message: counted === 0
          ? "금융소득이 1,000만원 이하라 피부양자 소득 판정에 들어가지 않아요."
          : `합산 소득 ${Math.round(sum / 10000).toLocaleString()}만원으로 2,000만원 이하예요. 다만 금융소득 1,000만원을 넘어서 전액이 소득으로 잡히고 있어요.` };
  } else if (i.insurance === "employee") {
    const sum = counted + other;
    health = sum > FIN_TAX.health.otherIncomeLimit
      ? { counted, status: "risk", message: `월급 외 소득이 ${Math.round(sum / 10000).toLocaleString()}만원으로 2,000만원을 넘어요. 넘는 부분에 건강보험료(소득월액보험료)가 따로 붙어요.` }
      : { counted, status: "ok", message: "월급 외 소득이 2,000만원 이하라 추가 건강보험료는 없어요." };
  } else {
    health = counted > 0
      ? { counted, status: "risk", message: "금융소득이 1,000만원을 넘어서 전액이 지역 건강보험료 계산에 들어가요." }
      : { counted, status: "ok", message: "금융소득이 1,000만원 이하라 지역 건강보험료 계산에 들어가지 않아요." };
  }

  return {
    financialIncome: F,
    comprehensive,
    grossUp,
    taxBase,
    methodA,
    methodB,
    computedTax,
    dividendCredit,
    foreignCredit,
    determinedTax,
    baselineTax,
    domesticWithheld,
    foreignPaid,
    additionalNational,
    additionalLocal,
    additionalTotal: additionalNational + additionalLocal,
    highDividendExtra,
    totalFinancialTax,
    effectiveRate,
    netFinancialIncome: allFinancial - totalFinancialTax,
    health,
  };
}
