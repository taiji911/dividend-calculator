/**
 * 배당 달력 — 고른 종목·ETF가 몇 월에 배당을 주는지 모아서 달마다 받을 돈을 계산해요.
 * 지급 달은 최근 1년 실제 지급일 기준이에요 (미국 분기배당 ETF는 대부분 3·6·9·12월).
 */
import STOCKS from "@/content/dividend-stocks.json";
import { ETFS, etfLabel } from "./etf";

export interface CalItem {
  id: string;
  label: string;
  sub: string;
  kind: "etf" | "stock";
  market: "us" | "kr";
  yield: number;
  months: number[];
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const CAL_ITEMS: CalItem[] = [
  ...ETFS.map((e) => ({
    id: e.slug,
    label: etfLabel(e),
    sub: e.short,
    kind: "etf" as const,
    market: e.market,
    yield: e.yield,
    months: e.freq === "월" ? ALL_MONTHS : [3, 6, 9, 12],
  })),
  ...STOCKS.stocks.map((s) => ({
    id: s.ticker.toLowerCase(),
    label: s.ticker,
    sub: `${s.name} · ${s.desc}`,
    kind: "stock" as const,
    market: "us" as const,
    yield: s.yield,
    months: s.months,
  })),
];

export const STOCK_AS_OF_LABEL: string = STOCKS.asOfLabel;
export const findItem = (id: string) => CAL_ITEMS.find((i) => i.id === id);

export interface Holding {
  id: string;
  amount: number;
  yieldPct: number;
}

/** 일반계좌 기준 배당 세금 (미국 15%, 국내 고배당 15.4%) */
const taxOf = (it: CalItem) => (it.market === "us" ? 0.15 : it.id === "plus-high-dividend" ? 0.154 : 0.15);

export function buildCalendar(holdings: Holding[], afterTax: boolean) {
  const months = ALL_MONTHS.map((m) => ({ month: m, total: 0, parts: [] as { id: string; label: string; amount: number }[] }));
  let annual = 0;
  for (const h of holdings) {
    const it = findItem(h.id);
    if (!it || h.amount <= 0 || h.yieldPct <= 0) continue;
    const yearly = h.amount * (h.yieldPct / 100) * (afterTax ? 1 - taxOf(it) : 1);
    annual += yearly;
    const per = yearly / it.months.length;
    for (const m of it.months) {
      months[m - 1].total += per;
      months[m - 1].parts.push({ id: it.id, label: it.label, amount: per });
    }
  }
  const empty = months.filter((m) => m.total <= 0).map((m) => m.month);
  const max = Math.max(1, ...months.map((m) => m.total));
  const min = Math.min(...months.map((m) => m.total));
  return { months, annual, empty, max, min, avg: annual / 12 };
}

/** 빈 달을 가장 많이 채워 주는 후보 (이미 고른 것 제외) */
export function suggestFor(empty: number[], chosen: string[], limit = 4) {
  if (!empty.length) return [];
  return CAL_ITEMS.filter((i) => !chosen.includes(i.id) && i.months.length < 12)
    .map((i) => ({ item: i, cover: i.months.filter((m) => empty.includes(m)).length }))
    .filter((x) => x.cover > 0)
    .sort((a, b) => b.cover - a.cover || b.item.yield - a.item.yield)
    .slice(0, limit);
}
