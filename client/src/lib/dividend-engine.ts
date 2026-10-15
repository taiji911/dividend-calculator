/**
 * 배당 시뮬레이션 계산 엔진 — 재투자 계산기와 스노우볼 시뮬레이터가 함께 씁니다.
 *
 * 모델 (월 단위)
 *  - 주가와 주당 배당금을 따로 움직입니다.
 *      주가는 매년 '주가 상승률'만큼, 주당 배당금은 매년 '배당 성장률'만큼 오릅니다.
 *  - 매달 초에 월 투자금으로 그때 주가에 주식을 삽니다.
 *  - 매달 말에 (보유 주식 × 그 해 주당 배당금 ÷ 12)를 배당으로 받습니다.
 *  - 재투자를 켜면 세후 배당으로 그때 주가에 주식을 더 삽니다.
 *  - 새로 넣은 돈은 '그때의 배당률'을 받습니다. (예전 계산은 배당률을 포트폴리오 전체에
 *    복리로 붙여서, 기간이 길수록 배당이 부풀려졌어요.)
 *
 * 세금
 *  - 일반계좌: 배당을 받을 때마다 원천징수 (국내 15.4%, 미국 15% 등)
 *  - ISA: 기간 중에는 세금 없이 굴리고, 만기 때 순이익 중 비과세 한도(일반 200만원·서민형 400만원)
 *         초과분에 9.9% 분리과세
 *  - 연금계좌: 기간 중 과세이연. 연금으로 받을 때 연금소득세 3.3~5.5% (나이에 따라)
 *  세율·한도는 TAX_RULES 한 곳에 모아 두었어요. 법이 바뀌면 여기만 고치면 됩니다.
 */

export const TAX_RULES = {
  /** 일반계좌 원천징수 */
  withholding: { KR: 0.154, US: 0.15 },
  /** ISA 만기 과세 */
  isa: { exemptGeneral: 2_000_000, exemptLowIncome: 4_000_000, rate: 0.099, annualLimit: 20_000_000, totalLimit: 100_000_000, minYears: 3 },
  /** 연금계좌 */
  pension: { rateMin: 0.033, rateMax: 0.055, annualLimit: 18_000_000 },
} as const;

export type AccountType = "taxable_kr" | "taxable_us" | "custom" | "tax_free" | "isa" | "isa_low" | "pension";

export interface SimInput {
  initialInvestment: number;
  monthlyInvestment: number;
  years: number;
  /** 지금 주가 대비 배당률 (%) */
  dividendYield: number;
  /** 주당 배당금 연 성장률 (%) */
  dividendGrowthRate: number;
  /** 주가 연 상승률 (%) */
  priceGrowthRate: number;
  drip: boolean;
  account: AccountType;
  /** account === "custom" 일 때 세율 (%) */
  customTaxRate?: number;
}

export interface YearRow {
  year: number;
  /** 연말 총 자산 (보유 주식 평가액 + 재투자하지 않고 쌓인 현금 배당) */
  totalAssets: number;
  /** 연말 보유 주식 평가액 */
  holdingValue: number;
  /** 그 해 받은 배당 (일반계좌는 세후, ISA·연금계좌는 세전) */
  annualDividends: number;
  /** 누적 배당 (같은 기준) */
  cumulativeDividends: number;
  /** 지금까지 넣은 돈 */
  totalInvested: number;
  /** 총 수익률 (%) */
  returnPercentage: number;
  /** 연말 시가 배당률 (%) — 배당 성장률이 주가 상승률보다 높으면 올라가요 */
  yieldOnPrice: number;
  /** 넣은 돈 대비 그 해 배당 (%) */
  yieldOnCost: number;
}

export interface SimResult {
  finalAssets: number;
  totalDividends: number;
  totalInvested: number;
  /** 돈을 넣은 시점까지 반영한 실제 연평균 수익률 (%) */
  cagr: number;
  yearlyData: YearRow[];
  /** 만기·인출 때 낼 세금 (ISA 만기 과세 등) */
  exitTax: number;
  /** exitTax를 뺀 최종 자산 */
  finalAfterTax: number;
  /** 연간 배당이 연간 투자금을 처음 넘는 해 */
  snowballYear: number | null;
  warnings: string[];
  account: AccountType;
}

export function withholdingRate(account: AccountType, customTaxRate = 0): number {
  switch (account) {
    case "taxable_kr": return TAX_RULES.withholding.KR;
    case "taxable_us": return TAX_RULES.withholding.US;
    case "custom": return Math.min(Math.max(customTaxRate, 0), 100) / 100;
    default: return 0; // 비과세 · ISA · 연금계좌는 기간 중 세금 없음
  }
}

/** 월 단위 현금흐름의 내부수익률을 연율로 (이분법) */
function annualizedIrr(flows: number[]): number {
  const npv = (r: number) => flows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  let lo = -0.09, hi = 0.1; // 월 -9% ~ +10% 범위에서 찾기 (긴 기간에도 숫자가 넘치지 않게)
  const fLo = npv(lo), fHi = npv(hi);
  if (!isFinite(fLo) || !isFinite(fHi) || fLo * fHi > 0) return 0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const f = npv(mid);
    if (Math.abs(f) < 1e-6) { lo = hi = mid; break; }
    if (f * fLo > 0) lo = mid; else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return (Math.pow(1 + monthly, 12) - 1) * 100;
}

export function simulate(input: SimInput): SimResult {
  const years = Math.max(1, Math.min(60, Math.round(input.years || 1)));
  const initial = Math.max(0, input.initialInvestment || 0);
  const monthly = Math.max(0, input.monthlyInvestment || 0);
  const y0 = Math.max(0, input.dividendYield || 0) / 100;
  const dg = (input.dividendGrowthRate || 0) / 100;
  const pg = (input.priceGrowthRate || 0) / 100;
  const tax = withholdingRate(input.account, input.customTaxRate);
  const monthlyPriceFactor = Math.pow(1 + pg, 1 / 12);

  let price = 1; // 시작 주가를 1로 두고 상대값으로 계산
  let shares = initial / price;
  let cash = 0;
  let invested = initial;
  let cumulative = 0;
  let yearDividends = 0;
  const rows: YearRow[] = [];
  const flows: number[] = [-initial];
  let snowballYear: number | null = null;

  for (let m = 1; m <= years * 12; m++) {
    const year = Math.ceil(m / 12);
    // 1) 달 초: 월 투자금으로 매수
    if (monthly > 0) {
      shares += monthly / price;
      invested += monthly;
      flows[m - 1] = (flows[m - 1] ?? 0) - monthly;
    }
    // 2) 한 달 동안 주가 변화
    price *= monthlyPriceFactor;
    // 3) 달 말: 배당 (주당 배당금은 해마다 성장)
    const dps = y0 * Math.pow(1 + dg, year - 1); // 시작 주가 1 기준 주당 연 배당금
    const gross = (shares * dps) / 12;
    const net = gross * (1 - tax);
    yearDividends += net;
    cumulative += net;
    if (input.drip) shares += net / price;
    else cash += net;

    if (m % 12 === 0) {
      const holding = shares * price;
      const total = holding + cash;
      rows.push({
        year,
        totalAssets: Math.round(total),
        holdingValue: Math.round(holding),
        annualDividends: Math.round(yearDividends),
        cumulativeDividends: Math.round(cumulative),
        totalInvested: Math.round(invested),
        returnPercentage: invested > 0 ? Math.round(((total - invested) / invested) * 1000) / 10 : 0,
        yieldOnPrice: Math.round(((y0 * Math.pow(1 + dg, year - 1)) / price) * 10000) / 100,
        yieldOnCost: invested > 0 ? Math.round((yearDividends / invested) * 10000) / 100 : 0,
      });
      if (snowballYear === null && monthly > 0 && yearDividends >= monthly * 12) snowballYear = year;
      yearDividends = 0;
    }
  }

  const finalAssets = shares * price + cash;
  flows[years * 12] = (flows[years * 12] ?? 0) + finalAssets;
  for (let i = 0; i < flows.length; i++) if (flows[i] === undefined) flows[i] = 0;

  // 만기·인출 세금과 안내
  const warnings: string[] = [];
  let exitTax = 0;
  const firstYearIn = initial + monthly * 12;
  const totalIn = invested;
  if (input.account === "isa" || input.account === "isa_low") {
    const exempt = input.account === "isa_low" ? TAX_RULES.isa.exemptLowIncome : TAX_RULES.isa.exemptGeneral;
    exitTax = Math.max(0, finalAssets - invested - exempt) * TAX_RULES.isa.rate;
    if (firstYearIn > TAX_RULES.isa.annualLimit || monthly * 12 > TAX_RULES.isa.annualLimit)
      warnings.push("ISA는 1년에 2,000만원까지만 넣을 수 있어요. (못 넣은 한도는 다음 해로 넘어가요)");
    if (totalIn > TAX_RULES.isa.totalLimit)
      warnings.push("ISA 총 납입한도는 1억원이에요. 넘는 금액은 다른 계좌로 넣어야 해요.");
    if (years < TAX_RULES.isa.minYears) warnings.push("ISA는 최소 3년을 유지해야 세금 혜택을 받아요.");
  }
  if (input.account === "pension") {
    if (monthly * 12 > TAX_RULES.pension.annualLimit || firstYearIn > TAX_RULES.pension.annualLimit)
      warnings.push("연금저축·IRP는 합쳐서 1년에 1,800만원까지 넣을 수 있어요.");
  }

  return {
    finalAssets: Math.round(finalAssets),
    totalDividends: Math.round(cumulative),
    totalInvested: Math.round(invested),
    cagr: Math.round(annualizedIrr(flows) * 100) / 100,
    yearlyData: rows,
    exitTax: Math.round(exitTax),
    finalAfterTax: Math.round(finalAssets - exitTax),
    snowballYear,
    warnings,
    account: input.account,
  };
}
