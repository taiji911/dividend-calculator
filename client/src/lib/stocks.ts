/**
 * 미국 배당주 종목 정보 — 숫자는 content/dividend-stocks.json (매달 자동 갱신),
 * 설명은 content/stock-profiles.ts 에서 가져와요.
 */
import DATA from "@/content/dividend-stocks.json";
import { STOCK_PROFILES, type StockProfile } from "@/content/stock-profiles";

export interface DividendPayment {
  ex: string;
  pay: string;
  amount: number;
}

export interface Stock extends StockProfile {
  slug: string;
  ticker: string;
  name: string;
  en: string;
  desc: string;
  /** 배당률 (%) */
  yield: number;
  /** 1주당 1년 배당금 ($) */
  annual: number;
  /** 배당성향 (%) — 순이익 기준 */
  payout: number;
  /** 최근 1년 배당 증가율 (%) — 없으면 null */
  g1y: number | null;
  /** 연속 배당 증가 연수 — 없으면 null */
  years: number | null;
  freq: "월" | "분기";
  months: number[];
  recent: DividendPayment[];
}

export const STOCK_AS_OF: string = DATA.asOf;
export const STOCK_AS_OF_LABEL: string = DATA.asOfLabel;

export const STOCKS: Stock[] = (DATA.stocks as Omit<Stock, "slug" | keyof StockProfile>[]).map((s) => ({
  ...s,
  slug: s.ticker.toLowerCase(),
  ...STOCK_PROFILES[s.ticker],
}));

export const findStock = (slug: string) => STOCKS.find((s) => s.slug === slug.toLowerCase());

/** 화면 제목용 이름: "코카콜라(KO)" */
export const stockLabel = (s: Stock) => `${s.name}(${s.ticker})`;

/** 배당 지급 달 문구: [3,6,9,12] → "3·6·9·12월" */
export const monthsText = (months: number[]) => (months.length === 12 ? "매달" : `${months.join("·")}월`);

/** 달러 표기: 1달러 이상은 소수 둘째 자리, 1달러 미만은 넷째 자리까지 ($0.2715) */
export const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(n) >= 1 ? 2 : 4 })}`;

/** "2026-10-15" → "2026.10.15" */
export const dotDate = (d: string) => d.replace(/-/g, ".");

/** 종목 성격 꼬리표 */
export type StockTag = "monthly" | "king" | "long" | "high" | "growth";
export const TAG_LABEL: Record<StockTag, string> = {
  monthly: "월배당",
  king: "50년+ 배당 증가",
  long: "25년+ 배당 증가",
  high: "고배당 4%+",
  growth: "배당 빠르게 증가",
};
export function stockTags(s: Stock): StockTag[] {
  const t: StockTag[] = [];
  if (s.freq === "월") t.push("monthly");
  if ((s.years ?? 0) >= 50) t.push("king");
  else if ((s.years ?? 0) >= 25) t.push("long");
  if (s.yield >= 4) t.push("high");
  if ((s.g1y ?? 0) >= 7) t.push("growth");
  return t;
}

/** 배당 재투자 계산기로 넘길 주소 */
export const stockCalcHref = (s: Stock) =>
  `/?y=${s.yield}&dg=${s.assume.dg}&pg=${s.assume.pg}&from=${encodeURIComponent(stockLabel(s))}`;

/** 출처 링크 */
export const stockSource = (s: Stock) => ({ label: `StockAnalysis · ${s.ticker} 배당 내역`, url: `https://stockanalysis.com/stocks/${s.slug}/dividend/` });

/** 다음(가장 가까운 앞으로의) 지급 — 기준일(asOf) 이후 지급일이 있으면 그걸, 없으면 null */
export const upcoming = (s: Stock) => [...s.recent].reverse().find((p) => p.pay > STOCK_AS_OF) ?? null;

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** 종목 페이지 자주 묻는 질문 — 화면과 구조화 데이터(FAQPage)에 함께 써요 */
export function stockFaq(s: Stock): { q: string; a: string }[] {
  const per100 = s.annual * 100;
  const pays = s.freq === "월" ? "매달" : `1년에 4번(${monthsText(s.months)})`;
  const yearsText =
    s.years && s.years >= 5
      ? `${s.years}년 연속 배당을 늘려 왔어요.`
      : (s.g1y ?? 0) <= 0
        ? "최근 1년 동안은 배당을 늘리지 않았어요."
        : "";
  return [
    {
      q: `${s.name} 배당금은 언제 들어오나요?`,
      a: `${s.name}(${s.ticker}) 배당은 ${pays} 들어와요. 배당락일 전날까지 주식을 가지고 있어야 받을 수 있고, 한국 증권사 계좌에는 미국 지급일보다 하루이틀 늦게 들어와요.`,
    },
    {
      q: `${s.name} 100주를 가지고 있으면 배당금은 얼마인가요?`,
      a: `1주당 1년 배당금은 약 $${fmt(s.annual)} 정도예요. 100주면 1년 배당이 세전 약 $${fmt(per100)}, 미국 세금 15%를 뗀 세후 약 $${fmt(per100 * 0.85)} 정도이고, ${s.freq === "월" ? "매달" : "한 번에"} 약 $${fmt((per100 * 0.85) / (s.freq === "월" ? 12 : 4))}씩 들어와요.`,
    },
    {
      q: `${s.name} 배당률은 몇 %인가요?`,
      a: `${STOCK_AS_OF_LABEL} 기준 약 ${s.yield}%예요. 1년 배당금을 지금 주가로 나눈 값이라 주가가 오르면 낮아지고, 내리면 높아져요. ${yearsText}`.trim(),
    },
    {
      q: `${s.name} 배당에는 세금이 얼마나 붙나요?`,
      a: "미국 주식 배당은 미국에서 15%를 먼저 떼고 들어와요. 한국에서 더 낼 세금은 보통 없지만, 1년 이자·배당이 2,000만원을 넘으면 금융소득종합과세 대상이 될 수 있어요. 미국 주식은 ISA·연금저축에 담을 수 없어요.",
    },
  ];
}

/** 받침에 맞춰 은/는 붙이기 (영문은 읽는 소리 기준: L·M·N·R 로 끝나면 받침 있음) */
export function withTopic(word: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  let batchim: boolean;
  if (code >= 0xac00 && code <= 0xd7a3) batchim = (code - 0xac00) % 28 !== 0;
  else batchim = /[lmnrLMNR0136780]/.test(last);
  return `${word}${batchim ? "은" : "는"}`;
}
