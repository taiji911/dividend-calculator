/**
 * 배당 ETF 정보 — 데이터는 content/etf-data.json 한 곳에서 관리해요.
 * (공유 이미지 만드는 scripts/make-og.py 도 같은 파일을 읽어요)
 * 배당률·총보수는 바뀌므로 화면에 항상 기준일(asOf)을 함께 보여줘요.
 */
import DATA from "@/content/etf-data.json";
import { withTopic } from "./stocks";

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

/** ETF 페이지 자주 묻는 질문 — 화면과 구조화 데이터(FAQPage)에 함께 써요 */
export function etfFaq(e: Etf): { q: string; a: string }[] {
  const label = etfLabel(e);
  const tax = taxableRate(e);
  const yearly = 10_000_000 * (e.yield / 100);
  const monthlyAfter = Math.round((yearly * (1 - tax)) / 12 / 10) * 10;
  const pays =
    e.freq !== "월"
      ? "1년에 4번(보통 3·6·9·12월) 배당해요. 배당락일 전날까지 가지고 있어야 받을 수 있어요."
      : e.market === "kr"
        ? "매달 분배금을 줘요. 보통 매월 마지막 영업일을 기준으로 다음 달 초에 들어와요."
        : "매달 분배금을 줘요. 배당락일 전날까지 가지고 있어야 받을 수 있고, 한국 증권사 계좌에는 미국 지급일보다 하루이틀 늦게 들어와요.";
  return [
    { q: `${label} 배당금은 언제 들어오나요?`, a: `${withTopic(label)} ${pays}` },
    {
      q: `${label}에 1,000만원을 넣으면 배당은 한 달에 얼마인가요?`,
      a: `${ETF_AS_OF_LABEL} 기준 배당률 약 ${yieldText(e.yield)}로 계산하면 1년에 약 ${Math.round(yearly / 10_000).toLocaleString("ko-KR")}만원(세전)이에요. 일반계좌에서 세금 약 ${(tax * 100).toFixed(1)}%를 빼면 한 달에 약 ${monthlyAfter.toLocaleString("ko-KR")}원이에요. 배당률은 바뀔 수 있어요.`,
    },
    {
      q: `${withTopic(label)} ISA·연금저축에 담을 수 있나요?`,
      a:
        e.market === "us"
          ? "아니요. 미국 시장에 상장된 ETF라 일반계좌(해외주식)에서만 살 수 있어요. 절세계좌를 쓰려면 비슷한 전략의 국내 상장 ETF를 담아요."
          : "네. 국내 상장 ETF라 ISA·연금저축·IRP에 모두 담을 수 있어요. IRP는 주식형 ETF를 70%까지만 담을 수 있어요.",
    },
  ];
}
