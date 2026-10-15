/**
 * 배당 ETF 정보 — 데이터는 content/etf-data.json 한 곳에서 관리해요.
 * (공유 이미지 만드는 scripts/make-og.py 도 같은 파일을 읽어요)
 * 배당률·총보수는 바뀌므로 화면에 항상 기준일(asOf)을 함께 보여줘요.
 */
import DATA from "@/content/etf-data.json";

export type EtfGroup = "growth" | "high" | "covered" | "kr-us" | "kr-high";

export interface Etf {
  slug: string;
  ticker: string;
  name: string;
  short: string;
  group: EtfGroup;
  market: "us" | "kr";
  issuer: string;
  inception: string;
  index: string;
  fee: number;
  freq: string;
  holdings: string | null;
  yield: number;
  yieldNote: string;
  summary: string;
  pros: string[];
  cons: string[];
  assume: { dg: number; pg: number };
  similar: string[];
  sources: { label: string; url: string }[];
}

export const ETF_AS_OF: string = DATA.asOf;
export const ETF_AS_OF_LABEL: string = DATA.asOfLabel;
export const ETF_GROUPS = DATA.groups as { id: EtfGroup; title: string; desc: string }[];
export const ETFS = DATA.etfs as Etf[];

export const findEtf = (slug: string) => ETFS.find((e) => e.slug === slug);

/** 화면에 부를 이름: 미국 상장은 티커(SCHD), 국내 상장은 상품명 */
export const etfLabel = (e: Etf) => (e.market === "us" ? e.ticker : e.name);

/** 총보수 표기: 0.0099 → "0.0099%", 0.06 → "0.06%" */
export const feeText = (fee: number) => `${Number(fee.toFixed(4))}%`;

export const yieldText = (y: number) => `${y.toFixed(y >= 10 ? 1 : 2).replace(/0$/, "")}%`;

/** 상장일 "2011-10-20" → "2011년 10월" */
export const sinceText = (d: string) => {
  const [y, m] = d.split("-");
  return `${y}년 ${Number(m)}월`;
};

/** 배당 재투자 계산기로 넘길 주소 (계산기가 주소의 값을 읽어 채워요) */
export const calcHref = (e: Etf) => `/?y=${e.yield}&dg=${e.assume.dg}&pg=${e.assume.pg}&from=${encodeURIComponent(etfLabel(e))}`;

/** 일반계좌에서 배당에 붙는 세금 (단순화) */
export const taxableRate = (e: Etf) => (e.market === "us" ? 0.15 : e.group === "kr-high" ? 0.154 : 0.15);
