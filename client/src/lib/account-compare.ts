/**
 * 계좌별 절세 비교 — 같은 돈을 일반계좌·ISA·연금저축(IRP)에 넣었을 때 세금 뗀 결과 비교
 *
 * 투자 대상별 세금 (2026년 기준)
 *  ▸ 미국 배당 ETF (SCHD 같은 기초자산)
 *    - 일반계좌 · 미국 직접 매수: 배당 미국 15% 원천징수 / 팔 때 양도소득세 22% (연 250만원 공제, 분리과세)
 *    - 일반계좌 · 국내상장 ETF: 펀드 단계에서 미국 15%가 빠지고, 국내 14%에서 외국납부세액을 빼기 때문에
 *      분배금에 국내 추가 세금은 거의 없음 (2025년 개편) / 팔 때 매매차익에 15.4%(배당소득, 종합과세 합산 대상)
 *    - ISA·연금 (국내상장 ETF만 가능): 미국 15%는 펀드 단계에서 빠짐 / 그 밖의 세금은 만기·수령 때
 *  ▸ 국내 주식·국내 주식형 ETF
 *    - 일반계좌: 배당 15.4% / 매매차익 비과세 (대주주 제외)
 *    - ISA·연금: 기간 중 세금 없음
 *  ▸ ISA 만기: (순이익 − 200만원, 서민형 400만원) × 9.9% — 국내 주식 매매차익은 원래 비과세라 순이익에서 제외
 *  ▸ 연금저축·IRP: 납입액 세액공제(연 900만원 한도, 13.2% 또는 16.5%), 55세 이후 연금으로 받을 때 3.3~5.5%
 *    (세액공제 받은 원금 + 운용수익에 과세)
 */
import { simulate } from "./dividend-engine";

export type AssetType = "us_dividend" | "kr_domestic";

export interface CompareInput {
  initialInvestment: number;
  monthlyInvestment: number;
  years: number;
  /** 기초자산의 세전 배당률 (%) — 예: SCHD 3.5 */
  dividendYield: number;
  dividendGrowthRate: number;
  priceGrowthRate: number;
  asset: AssetType;
  isaType: "general" | "low";
  /** 세액공제율: 총급여 5,500만원 이하 16.5%, 초과 13.2% */
  creditRate: 0.165 | 0.132;
  /** 연금소득세율: 70세 미만 5.5%, 70~79세 4.4%, 80세 이상 3.3% */
  pensionTaxRate: 0.055 | 0.044 | 0.033;
}

export interface AccountResult {
  id: "us_direct" | "general" | "isa" | "pension";
  name: string;
  sub: string;
  available: boolean;
  /** 세금 떼기 전 최종 평가액 */
  finalValue: number;
  /** 기간 중 배당에서 빠진 세금 (미국·국내 원천징수) */
  dividendTax: number;
  /** 팔 때·만기·연금 수령 때 내는 세금 */
  exitTax: number;
  exitTaxLabel: string;
  /** 세금 다 뗀 뒤 손에 쥐는 돈 */
  afterTax: number;
  /** 연금계좌 세액공제로 돌려받는 돈 (기간 합계) */
  taxCredit: number;
  /** afterTax + taxCredit */
  totalBenefit: number;
  notes: string[];
}

export interface CompareResult {
  invested: number;
  accounts: AccountResult[];
  bestId: AccountResult["id"];
  warnings: string[];
}

const ISA_EXEMPT = { general: 2_000_000, low: 4_000_000 };
const PENSION_CREDIT_CAP = 9_000_000; // 연금저축 + IRP 합산 세액공제 한도
const PENSION_ANNUAL_LIMIT = 18_000_000;
const ISA_ANNUAL_LIMIT = 20_000_000;
const ISA_TOTAL_LIMIT = 100_000_000;

export function compareAccounts(i: CompareInput): CompareResult {
  const years = Math.max(1, Math.min(50, Math.round(i.years)));
  const base = {
    initialInvestment: Math.max(0, i.initialInvestment),
    monthlyInvestment: Math.max(0, i.monthlyInvestment),
    years,
    dividendYield: i.dividendYield,
    dividendGrowthRate: i.dividendGrowthRate,
    priceGrowthRate: i.priceGrowthRate,
    drip: true,
    account: "custom" as const,
  };
  const us = i.asset === "us_dividend";
  // 배당에서 빠지는 세율 (기간 중)
  const fundLevel = us ? 15 : 0; // 국내상장 ETF 안에서 빠지는 미국 세금
  const run = (taxPct: number) => simulate({ ...base, customTaxRate: taxPct });

  const accounts: AccountResult[] = [];

  // 세전 배당 합계(세금 비교용): 같은 경로에서 세금 0으로 굴린 값과는 다르므로, 실제 경로의 순배당/(1-세율)로 역산
  const grossFromNet = (net: number, taxPct: number) => (taxPct >= 100 ? 0 : net / (1 - taxPct / 100));

  if (us) {
    // 1) 일반계좌 · 미국 직접 매수
    const r = run(15);
    const basis = r.totalInvested + r.totalDividends; // 재투자한 배당도 매수 원가
    const gain = Math.max(0, r.finalAssets - basis);
    const exit = Math.max(0, gain - 2_500_000) * 0.22;
    accounts.push({
      id: "us_direct",
      name: "일반계좌",
      sub: "미국 ETF 직접 매수 (예: SCHD)",
      available: true,
      finalValue: r.finalAssets,
      dividendTax: grossFromNet(r.totalDividends, 15) - r.totalDividends,
      exitTax: exit,
      exitTaxLabel: "팔 때 양도소득세 22%",
      afterTax: r.finalAssets - exit,
      taxCredit: 0,
      totalBenefit: r.finalAssets - exit,
      notes: ["양도소득세는 마지막 해에 한 번에 판다고 계산했어요. 여러 해에 나눠 팔면 매년 250만원씩 공제돼 줄어들어요.", "양도소득은 금융소득종합과세(2,000만원)에 들어가지 않아요."],
    });
  }

  // 2) 일반계좌 · 국내상장
  {
    const tax = us ? 15 : 15.4; // 미국 배당 ETF: 펀드 단계 미국 15% (국내 추가 거의 없음) / 국내: 15.4%
    const r = run(tax);
    const basis = r.totalInvested + r.totalDividends;
    const gain = Math.max(0, r.finalAssets - basis);
    const exit = us ? gain * 0.154 : 0;
    accounts.push({
      id: "general",
      name: "일반계좌",
      sub: us ? "국내상장 미국배당 ETF" : "국내 주식·국내 주식형 ETF",
      available: true,
      finalValue: r.finalAssets,
      dividendTax: grossFromNet(r.totalDividends, tax) - r.totalDividends,
      exitTax: exit,
      exitTaxLabel: us ? "팔 때 매매차익 15.4%" : "매매차익 비과세",
      afterTax: r.finalAssets - exit,
      taxCredit: 0,
      totalBenefit: r.finalAssets - exit,
      notes: us
        ? ["매매차익은 배당소득으로 과세돼서, 판 해에 금융소득이 2,000만원을 넘으면 종합과세 대상이 될 수 있어요."]
        : ["배당이 연 2,000만원을 넘으면 종합과세 대상이 될 수 있어요."],
    });
  }

  // 3) ISA
  {
    const r = run(fundLevel);
    const exempt = ISA_EXEMPT[i.isaType];
    // 과세 대상 순이익: 미국 배당 ETF는 배당+차익 모두, 국내 주식은 배당만 (매매차익 원래 비과세)
    const taxableProfit = us ? Math.max(0, r.finalAssets - r.totalInvested) : r.totalDividends;
    const exit = Math.max(0, taxableProfit - exempt) * 0.099;
    const notes = ["의무 가입 3년을 채워야 혜택을 받아요.", "ISA 안의 이자·배당은 금융소득종합과세와 건보료 계산에 들어가지 않아요."];
    accounts.push({
      id: "isa",
      name: i.isaType === "low" ? "ISA 서민형" : "ISA 일반형",
      sub: "국내상장 ETF로 투자",
      available: true,
      finalValue: r.finalAssets,
      dividendTax: us ? grossFromNet(r.totalDividends, fundLevel) - r.totalDividends : 0,
      exitTax: exit,
      exitTaxLabel: `만기 때 ${(exempt / 10_000).toLocaleString()}만원 초과 이익 9.9%`,
      afterTax: r.finalAssets - exit,
      taxCredit: 0,
      totalBenefit: r.finalAssets - exit,
      notes,
    });
  }

  // 4) 연금저축 · IRP
  {
    const r = run(fundLevel);
    let credited = 0;
    let credit = 0;
    for (let y = 1; y <= years; y++) {
      const paid = base.monthlyInvestment * 12 + (y === 1 ? base.initialInvestment : 0);
      const c = Math.min(paid, PENSION_CREDIT_CAP);
      credited += c;
      credit += c * i.creditRate;
    }
    const nonCredited = r.totalInvested - credited;
    const taxable = Math.max(0, r.finalAssets - nonCredited);
    const exit = taxable * i.pensionTaxRate;
    accounts.push({
      id: "pension",
      name: "연금저축·IRP",
      sub: "국내상장 ETF로 투자",
      available: true,
      finalValue: r.finalAssets,
      dividendTax: us ? grossFromNet(r.totalDividends, fundLevel) - r.totalDividends : 0,
      exitTax: exit,
      exitTaxLabel: `연금 받을 때 ${(i.pensionTaxRate * 100).toFixed(1)}%`,
      afterTax: r.finalAssets - exit,
      taxCredit: credit,
      totalBenefit: r.finalAssets - exit + credit,
      notes: [
        "55세 이후 연금으로 나눠 받을 때 기준이에요. 중간에 빼면 16.5%(기타소득세)를 내요.",
        "1년에 받는 사적연금이 1,500만원을 넘으면 종합과세나 16.5% 분리과세 중에서 골라야 해요.",
        "세액공제로 돌려받는 돈은 연말정산 환급으로 따로 받는다고 보고 위 평가액에 넣지 않았어요.",
      ],
    });
  }

  const warnings: string[] = [];
  const invested = base.initialInvestment + base.monthlyInvestment * 12 * years;
  const firstYear = base.initialInvestment + base.monthlyInvestment * 12;
  if (firstYear > ISA_ANNUAL_LIMIT || base.monthlyInvestment * 12 > ISA_ANNUAL_LIMIT)
    warnings.push("ISA는 1년에 2,000만원까지 넣을 수 있어요. 이 조건은 한도를 넘어서, 실제로는 넘는 돈을 다른 계좌에 넣어야 해요.");
  if (invested > ISA_TOTAL_LIMIT) warnings.push("ISA 총 납입한도는 1억원이에요. 이 조건은 한도를 넘어서, ISA 결과는 실제보다 크게 나와요.");
  if (firstYear > PENSION_ANNUAL_LIMIT || base.monthlyInvestment * 12 > PENSION_ANNUAL_LIMIT)
    warnings.push("연금저축·IRP는 합쳐서 1년에 1,800만원까지 넣을 수 있어요.");
  if (years < 3) warnings.push("ISA는 3년 이상 유지해야 세금 혜택을 받아요.");

  const best = accounts.filter((a) => a.available).reduce((a, b) => (b.totalBenefit > a.totalBenefit ? b : a));
  return { invested, accounts, bestId: best.id, warnings };
}
