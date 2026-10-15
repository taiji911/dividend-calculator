/**
 * 빌드할 때 페이지별 HTML의 <head>를 만드는 도구 (scripts/prerender.mjs 에서 써요).
 * 화면에서 쓰는 applySeo(lib/seo.ts)와 같은 정보를 문자열로 만들어요.
 */
import { SEO_PAGES, SITE_URL, SITE_NAME_KO, SITE_NAME_EN, ogImageFor, type SeoKey, type Lang } from "./seo";
import { FAQ } from "@/content/faq";
import { ETFS } from "./etf";

export interface RouteDef {
  path: string;
  key: SeoKey;
  lang: Lang;
}

/** 미리 만들 페이지 목록 — 새 페이지를 만들면 여기에 추가해요 */
export const ROUTES: RouteDef[] = [
  { path: "/", key: "reinvest", lang: "ko" },
  { path: "/goal", key: "goal", lang: "ko" },
  { path: "/snowball", key: "snowball", lang: "ko" },
  { path: "/tax", key: "tax", lang: "ko" },
  { path: "/compare", key: "compare", lang: "ko" },
  { path: "/etf", key: "etf", lang: "ko" },
  ...ETFS.map((e) => ({ path: `/etf/${e.slug}`, key: `etf-${e.slug}` as SeoKey, lang: "ko" as Lang })),
  { path: "/guide", key: "guide", lang: "ko" },
  { path: "/en", key: "reinvest", lang: "en" },
  { path: "/en/goal", key: "goal", lang: "en" },
  { path: "/en/snowball", key: "snowball", lang: "en" },
  { path: "/en/guide", key: "guide", lang: "en" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const abs = (path: string) => SITE_URL + (path === "/" ? "/" : path);
const json = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export function headTags(key: SeoKey, lang: Lang): string {
  const page = (SEO_PAGES as Record<string, (typeof SEO_PAGES)["reinvest"] | (typeof SEO_PAGES)["tax"]>)[key];
  const path = (page.path as Record<Lang, string | null>)[lang] ?? page.path.ko!;
  const url = abs(path);
  const title = page.title[lang];
  const desc = page.description[lang];
  const img = ogImageFor(key, lang);
  const siteName = lang === "ko" ? SITE_NAME_KO : SITE_NAME_EN;
  const homePath = lang === "ko" ? "/" : "/en";

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${url}" />`,
  ];
  if (page.path.ko && page.path.en) {
    tags.push(
      `<link rel="alternate" hreflang="ko" href="${abs(page.path.ko)}" />`,
      `<link rel="alternate" hreflang="en" href="${abs(page.path.en)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${abs(page.path.ko)}" />`
    );
  }
  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(siteName)}" />`,
    `<meta property="og:locale" content="${lang === "ko" ? "ko_KR" : "en_US"}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${img}" />`
  );

  // 구조화 데이터
  const graph: Record<string, unknown>[] = [];
  const isEtf = key === "etf" || key.startsWith("etf-");
  if (key !== "guide" && !isEtf) {
    graph.push({
      "@type": "WebApplication",
      name: page.name[lang],
      url,
      description: desc,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: lang,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: lang === "ko" ? "KRW" : "USD" },
    });
  }
  if (path === homePath) {
    graph.push({ "@type": "WebSite", name: siteName, alternateName: lang === "ko" ? ["배당계산기", "Dividend Calculator"] : ["배당 계산기"], url: abs(homePath), inLanguage: lang });
  } else {
    const crumbs = [{ name: siteName, item: abs(homePath) }];
    if (key.startsWith("etf-")) crumbs.push({ name: "배당 ETF 정보", item: abs("/etf") });
    crumbs.push({ name: page.name[lang], item: url });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    });
  }
  const faqs = FAQ[key]?.[lang];
  if (faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  tags.push(`<script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graph })}</script>`);
  return tags.map((t) => `    ${t}`).join("\n");
}

export function notFoundHeadTags(): string {
  return [
    `<title>페이지를 찾을 수 없어요 | 배당 계산기</title>`,
    `<meta name="robots" content="noindex, follow" />`,
  ].map((t) => `    ${t}`).join("\n");
}

export function sitemapXml(lastmod: string): string {
  const out = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ];
  for (const r of ROUTES) {
    const page = (SEO_PAGES as Record<string, { path: Record<Lang, string | null> }>)[r.key];
    out.push(`  <url>`, `    <loc>${abs(r.path)}</loc>`);
    if (page.path.ko && page.path.en) {
      out.push(
        `    <xhtml:link rel="alternate" hreflang="ko" href="${abs(page.path.ko)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${abs(page.path.en)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(page.path.ko)}"/>`
      );
    }
    out.push(`    <lastmod>${lastmod}</lastmod>`, `  </url>`);
  }
  out.push(`</urlset>`, ``);
  return out.join("\n");
}
