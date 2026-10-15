import { useEffect } from "react";
import { ETFS, ETF_AS_OF_LABEL, etfLabel, feeText, yieldText } from "./etf";
import { LEARN } from "@/content/learn-meta";

/**
 * 페이지별 검색 정보(제목·설명·대표 주소·언어 연결)를 한 곳에서 관리해요.
 * - 대표 주소(canonical): 한국어는 접두어 없이(/goal), 영어는 /en/goal
 * - hreflang: 한국어·영어 버전을 서로 연결해 구글이 같은 페이지의 다른 언어로 이해하게 해요
 */
export const SITE_URL = "https://dividendcalcul.jayinform.com";
export const SITE_NAME_KO = "배당 계산기";
export const SITE_NAME_EN = "Dividend Calculator";
export const OG_IMAGE = `${SITE_URL}/thumbnail.png`;
/** 페이지별 공유 이미지 (빌드 전에 scripts/make-og.py 로 만들어 client/public/og 에 둬요) */
export const ogImageFor = (key: string, lang: "ko" | "en") => `${SITE_URL}/og/${key}-${lang}.png`;

export type Lang = "ko" | "en";
interface PageSeo {
  path: Record<Lang, string | null>;
  /** 짧은 이름 (경로 표시·구조화 데이터용) */
  name: Record<Lang, string>;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

const STATIC_PAGES = {
  reinvest: {
    path: { ko: "/", en: "/en" },
    name: { ko: "배당 재투자 계산기", en: "Dividend Reinvestment Calculator" },
    title: {
      ko: "배당 재투자 계산기 | 배당금 복리 시뮬레이터 (세후·ISA·연금)",
      en: "Dividend Reinvestment Calculator | DRIP Compound Growth",
    },
    description: {
      ko: "초기 투자금·월 투자금·배당률·배당 성장률·주가 상승률을 넣으면 몇 년 뒤 자산과 월 배당금을 바로 계산해요. 일반계좌·ISA·연금계좌 세금까지 반영한 배당 재투자(DRIP) 계산기.",
      en: "See how dividend reinvestment (DRIP) grows your portfolio. Enter your investment, dividend yield, dividend growth and price growth to project total assets and monthly dividend income.",
    },
  },
  goal: {
    path: { ko: "/goal", en: "/en/goal" },
    name: { ko: "목표 배당금 계산기", en: "Dividend Goal Calculator" },
    title: {
      ko: "목표 배당금 계산기 | 월 배당 100만원 받으려면 원금 얼마?",
      en: "Dividend Goal Calculator | How Much to Invest for Monthly Income",
    },
    description: {
      ko: "원하는 월 배당금과 배당률을 넣으면 필요한 투자 원금을 세후 기준으로 계산해요. 월 100만원·200만원 배당에 필요한 금액을 바로 확인하세요.",
      en: "Enter your target monthly dividend and yield to find the investment you need, after tax.",
    },
  },
  snowball: {
    path: { ko: "/snowball", en: "/en/snowball" },
    name: { ko: "배당 스노우볼 계산기", en: "Dividend Snowball Simulator" },
    title: {
      ko: "배당 스노우볼 계산기 | 배당이 월 투자금을 넘는 시점",
      en: "Dividend Snowball Simulator | When Dividends Outrun Contributions",
    },
    description: {
      ko: "매달 투자하면서 배당을 재투자할 때, 1년 배당금이 1년 투자금을 넘어서는 '스노우볼 전환점'이 언제 오는지 계산해요.",
      en: "Find the year your annual dividends exceed your annual contributions with dividend reinvestment.",
    },
  },
  tax: {
    path: { ko: "/tax", en: null },
    name: { ko: "금융소득종합과세 계산기", en: "Financial Income Tax Calculator" },
    title: {
      ko: "금융소득종합과세 계산기 | 배당 2천만원 초과 세금·건보료",
      en: "Korean Financial Income Tax Calculator",
    },
    description: {
      ko: "배당·이자가 연 2,000만원을 넘으면 5월에 얼마를 더 내는지 계산해요. 비교과세, Gross-up, 해외 배당 외국납부세액공제, 고배당기업 분리과세, 건강보험 피부양자 판정까지.",
      en: "Estimate additional Korean tax when financial income exceeds KRW 20M.",
    },
  },
  compare: {
    path: { ko: "/compare", en: null },
    name: { ko: "계좌별 절세 비교 계산기", en: "Account Tax Comparison" },
    title: {
      ko: "ISA vs 연금저축 vs 일반계좌 비교 계산기 | 배당 ETF 어디에 담을까",
      en: "Korean ISA vs Pension vs Taxable Account Comparison",
    },
    description: {
      ko: "같은 배당 ETF를 일반계좌·ISA·연금저축(IRP)에 넣었을 때 세금을 다 뗀 뒤 얼마가 남는지 비교해요. 미국 배당 ETF 직접 매수와 국내상장 ETF, 세액공제와 연금소득세까지 반영.",
      en: "Compare after-tax results of holding dividend ETFs in Korean taxable, ISA and pension accounts.",
    },
  },
  guide: {
    path: { ko: "/guide", en: "/en/guide" },
    name: { ko: "배당 계산기 사용 가이드", en: "Dividend Calculator Guide" },
    title: {
      ko: "배당 계산기 사용 가이드 | 배당 재투자·목표 배당금 계산 방법",
      en: "Dividend Calculator Guide | How to Use",
    },
    description: {
      ko: "배당 재투자 계산기, 목표 배당금 계산기, 스노우볼 시뮬레이터를 언제 어떻게 쓰는지, 입력값과 결과 해석, 가정과 한계를 정리했어요.",
      en: "How to use the dividend reinvestment, goal and snowball calculators, and how to read the results.",
    },
  },
  learn: {
    path: { ko: "/learn", en: null },
    name: { ko: "배당 공부", en: "Learn" },
    title: { ko: "배당 공부 | 배당소득세·ISA·연금저축·배당락일·커버드콜 쉽게 정리", en: "Learn about dividend investing" },
    description: {
      ko: "배당 투자를 시작할 때 꼭 알아야 할 배당소득세, ISA, 연금저축, 배당락일, 커버드콜 ETF를 2026년 기준으로 쉽게 정리했어요.",
      en: "Guides to dividend taxes, accounts and ETFs in Korea.",
    },
  },
  calendar: {
    path: { ko: "/calendar", en: null },
    name: { ko: "배당 달력", en: "Dividend Calendar" },
    title: {
      ko: "배당 달력 | 월배당 포트폴리오 만들기 (SCHD·JEPI·코카콜라 지급월)",
      en: "Dividend Calendar | Build a Monthly Dividend Portfolio",
    },
    description: {
      ko: "가진 배당주·ETF와 금액을 넣으면 몇 월에 배당이 얼마 들어오는지 달력으로 보여줘요. 배당이 비는 달을 채워 줄 종목 추천까지, 월배당 포트폴리오를 쉽게 만들어 보세요.",
      en: "See which months your dividend stocks and ETFs pay, and fill the gaps for monthly income.",
    },
  },
  etf: {
    path: { ko: "/etf", en: null },
    name: { ko: "배당 ETF 정보", en: "Dividend ETFs" },
    title: {
      ko: "배당 ETF 비교 | SCHD·JEPI·미국배당다우존스 배당률·총보수 한눈에",
      en: "Dividend ETF Comparison",
    },
    description: {
      ko: "SCHD, VYM, JEPI, JEPQ, TIGER 미국배당다우존스 등 인기 배당 ETF 19개의 배당률·총보수·배당 주기·특징을 한 곳에서 비교해요. 국내 상장과 미국 상장, 계좌별 세금 차이까지.",
      en: "Compare popular dividend ETFs by yield, fees and payout frequency.",
    },
  },
} satisfies Record<string, PageSeo>;

/** ETF 상세 페이지 검색 정보 — etf-data.json 에서 자동으로 만들어요 */
const ETF_PAGES = Object.fromEntries(
  ETFS.map((e) => {
    const label = etfLabel(e);
    const sub = e.market === "us" ? e.name : e.ticker;
    return [
      `etf-${e.slug}`,
      {
        path: { ko: `/etf/${e.slug}`, en: null },
        name: { ko: label, en: label },
        title: { ko: `${label} 배당률·총보수·배당일 정리 | ${sub}`, en: `${label} dividend overview` },
        description: {
          ko: `${label}(${e.short}) 최근 배당률 약 ${yieldText(e.yield)}, 총보수 ${feeText(e.fee)}, ${e.freq} 배당. 장단점과 계좌별 세금, 1,000만원 투자 시 예상 배당까지 정리했어요. ${ETF_AS_OF_LABEL} 기준.`,
          en: `${label} dividend yield, fees and payout frequency.`,
        },
      } satisfies PageSeo,
    ];
  })
) as Record<`etf-${string}`, PageSeo>;

/** 배당 공부 글 검색 정보 — content/learn-meta.ts 에서 자동으로 만들어요 */
const LEARN_PAGES = Object.fromEntries(
  LEARN.map((a) => [
    `learn-${a.slug}`,
    {
      path: { ko: `/learn/${a.slug}`, en: null },
      name: { ko: a.title, en: a.title },
      title: { ko: a.seoTitle, en: a.title },
      description: { ko: a.description, en: a.description },
    } satisfies PageSeo,
  ])
) as Record<`learn-${string}`, PageSeo>;

export const SEO_PAGES: typeof STATIC_PAGES & Record<`etf-${string}` | `learn-${string}`, PageSeo> = { ...STATIC_PAGES, ...ETF_PAGES, ...LEARN_PAGES };

export type SeoKey = keyof typeof STATIC_PAGES | `etf-${string}` | `learn-${string}`;

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** 페이지 검색 정보 적용 */
export function applySeo(key: SeoKey, lang: Lang) {
  const page: PageSeo = (SEO_PAGES as Record<string, PageSeo>)[key];
  const path = page.path[lang] ?? page.path.ko!;
  const url = SITE_URL + (path === "/" ? "/" : path);
  const title = page.title[lang];
  const description = page.description[lang];

  document.title = title;
  document.documentElement.lang = lang;
  upsertMeta("name", "description", description);
  upsertMeta("name", "robots", "index, follow, max-image-preview:large");
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:locale", lang === "ko" ? "ko_KR" : "en_US");
  upsertMeta("property", "og:site_name", lang === "ko" ? SITE_NAME_KO : SITE_NAME_EN);
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("property", "og:image", ogImageFor(key, lang));
  upsertMeta("name", "twitter:image", ogImageFor(key, lang));
  upsertLink("canonical", url);

  // 언어 연결 — 두 언어가 모두 있는 페이지만
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
  if (page.path.ko && page.path.en) {
    const ko = SITE_URL + (page.path.ko === "/" ? "/" : page.path.ko);
    upsertLink("alternate", ko, "ko");
    upsertLink("alternate", SITE_URL + page.path.en, "en");
    upsertLink("alternate", ko, "x-default");
  }
}

export function useSeo(key: SeoKey, lang: Lang) {
  useEffect(() => {
    applySeo(key, lang);
  }, [key, lang]);
}

/** 없는 페이지: 검색에 올리지 않기 */
export function useNoIndex() {
  useEffect(() => {
    document.title = "페이지를 찾을 수 없어요 | 배당 계산기";
    upsertMeta("name", "robots", "noindex, follow");
  }, []);
}
