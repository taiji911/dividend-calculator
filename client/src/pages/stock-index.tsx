import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { ContentArticle, Section, FaqList, RelatedLinks, Updated } from "@/components/content";
import { FAQ } from "@/content/faq";
import { STOCKS, STOCK_AS_OF_LABEL, TAG_LABEL, monthsText, stockTags, type Stock, type StockTag } from "@/lib/stocks";
import { yieldText } from "@/lib/etf";
import { useSeo } from "@/lib/seo";

type Filter = "all" | StockTag;
type Sort = "yield" | "years" | "growth";

const FILTERS: [Filter, string][] = [
  ["all", "전체"],
  ["monthly", TAG_LABEL.monthly],
  ["king", TAG_LABEL.king],
  ["high", TAG_LABEL.high],
  ["growth", TAG_LABEL.growth],
];
const SORTS: [Sort, string][] = [
  ["yield", "배당률 높은 순"],
  ["years", "배당 증가 오래된 순"],
  ["growth", "배당 증가율 높은 순"],
];

function StockCard({ s }: { s: Stock }) {
  return (
    <Link href={`/stock/${s.slug}`}>
      <span className="panel group flex h-full flex-col p-4 transition-colors hover:border-border-strong">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[16.5px] font-bold leading-snug tracking-[-0.02em] text-foreground">
              {s.name} <span className="text-[13px] font-semibold text-subtle">{s.ticker}</span>
            </span>
            <span className="mt-0.5 block text-[12.5px] text-subtle">{s.desc}</span>
          </span>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
        </span>
        <span className="mt-auto grid grid-cols-3 gap-2 pt-4 text-[12px]">
          <span>
            <span className="block text-subtle">배당률</span>
            <span className="num block text-[15px] font-semibold text-gold">{yieldText(s.yield)}</span>
          </span>
          <span>
            <span className="block text-subtle">연속 증가</span>
            <span className="num block text-[15px] font-semibold text-foreground">{s.years ? `${s.years}년` : "—"}</span>
          </span>
          <span>
            <span className="block text-subtle">지급</span>
            <span className="block text-[13.5px] font-semibold leading-[1.45] text-foreground">{s.freq === "월" ? "매달" : monthsText(s.months)}</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

export default function StockIndex() {
  useSeo("stock", "ko");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("yield");

  const list = useMemo(() => {
    const items = STOCKS.filter((s) => filter === "all" || stockTags(s).includes(filter));
    const key = (s: Stock) => (sort === "yield" ? s.yield : sort === "years" ? s.years ?? 0 : s.g1y ?? -99);
    return [...items].sort((a, b) => key(b) - key(a));
  }, [filter, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="미국 배당주"
        title={<>미국 배당주 {STOCKS.length}종목, <span className="text-gold">배당금 계산</span>까지</>}
        subtitle="리얼티 인컴, 코카콜라, 존슨앤드존슨처럼 국내 투자자가 많이 찾는 미국 배당주의 배당률·배당일·연속 증가 기간을 모았어요. 종목을 누르면 내 돈으로 배당을 바로 계산할 수 있어요."
      >
        <p className="mt-3 text-[12.5px] text-subtle">{STOCK_AS_OF_LABEL} 기준 · 배당률은 주가에 따라 매일 조금씩 바뀌어요.</p>
      </PageHeader>

      <div className="space-y-3">
        <div className="seg" role="tablist" aria-label="종목 거르기">
          {FILTERS.map(([v, l]) => (
            <button key={v} type="button" role="tab" aria-selected={filter === v} data-active={filter === v} onClick={() => setFilter(v)} className="seg-item">
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] text-subtle">
            <span className="num font-semibold text-foreground">{list.length}</span>종목
          </p>
          <label className="flex items-center gap-2 text-[13px] text-subtle">
            정렬
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-border bg-[hsl(var(--surface-2))] px-2.5 py-1.5 text-[13px] font-medium text-foreground"
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <StockCard key={s.slug} s={s} />
        ))}
      </div>

      <RiskNote title="투자 안내">
        특정 종목을 사거나 팔라는 추천이 아니에요. 배당률과 배당 내역은 {STOCK_AS_OF_LABEL}에 확인한 값이고, 배당은 회사 사정에 따라 줄거나 끊길 수 있어요.
      </RiskNote>

      <ContentArticle>
        <Section kicker="고르는 법" title="미국 배당주, 배당률만 보고 고르면 안 되는 이유">
          <ul>
            <li>
              <strong>배당률</strong>은 지금 주가 대비 1년 배당이에요. 주가가 크게 떨어져서 배당률이 높아 보이는 경우도 있어서, 배당이 줄어든 적은 없는지 함께 봐야 해요.
            </li>
            <li>
              <strong>연속 배당 증가 기간</strong>이 길수록 경기가 나쁠 때도 배당을 지켜 왔다는 뜻이에요. 코카콜라·P&G·존슨앤드존슨처럼 50년이 넘는 회사도 있어요.
            </li>
            <li>
              <strong>배당 증가율</strong>이 높으면 지금 배당률은 낮아도 10년, 20년 뒤 받는 배당이 더 커질 수 있어요. 마이크로소프트·브로드컴이 이런 경우예요.
            </li>
            <li>
              <strong>배당성향</strong>이 너무 높으면(벌어들인 돈 대부분을 배당으로 주면) 앞으로 배당을 늘릴 여유가 적어요. 단, 리츠는 회계 특성상 높게 보여요.
            </li>
          </ul>
        </Section>

        <Section kicker="월배당 만들기" title="분기배당 종목을 섞으면 매달 배당을 받을 수 있어요">
          <p>
            미국 배당주는 대부분 1년에 4번 배당해요. 지급하는 달이 1·4·7·10월, 2·5·8·11월, 3·6·9·12월로 나뉘어서 세 그룹을 섞으면 매달 배당이 들어오게 만들 수
            있어요. 어떻게 섞으면 비는 달이 없는지는 <Link href="/calendar">배당 달력</Link>에서 바로 확인할 수 있어요.
          </p>
        </Section>

        <FaqList items={FAQ.stock!.ko!} />

        <RelatedLinks
          items={[
            { href: "/calendar", title: "배당 달력", desc: "가진 종목을 넣으면 몇 월에 얼마가 들어오는지 보여줘요." },
            { href: "/etf", title: "배당 ETF 비교", desc: "종목 고르기가 어렵다면 SCHD 같은 배당 ETF로 한 번에 담을 수 있어요." },
          ]}
        />

        <Updated>{STOCK_AS_OF_LABEL} 기준. 각 종목 페이지 아래에 출처를 적어 두었어요.</Updated>
      </ContentArticle>
    </div>
  );
}
