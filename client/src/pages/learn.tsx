import { Link, useParams } from "wouter";
import { ArrowUpRight, ChevronRight, Clock } from "lucide-react";
import PageHeader from "@/components/page-header";
import NotFound from "@/pages/not-found";
import { FaqList, RelatedLinks, Updated } from "@/components/content";
import { LEARN, findLearn } from "@/content/learn-meta";
import { LEARN_BODY } from "@/content/learn-articles";
import { useSeo } from "@/lib/seo";

const dateText = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return `${y}년 ${m}월 ${day}일`;
};

/** 글 묶음 — 새 글을 쓰면 여기에도 slug를 넣어요 */
const LEARN_GROUPS = [
  { id: "basic", title: "배당 투자 기초", desc: "배당을 언제 받고, 어떤 종목·ETF를 고를지", slugs: ["ex-dividend-date", "how-to-pick-dividend-stocks", "monthly-dividend", "covered-call-etf"] },
  { id: "tax", title: "세금과 건강보험료", desc: "배당이 늘수록 꼭 알아야 할 세금·건보료", slugs: ["dividend-tax", "high-dividend-separate-tax", "health-insurance"] },
  { id: "account", title: "절세 계좌", desc: "같은 배당도 어느 계좌에 담느냐에 따라 달라져요", slugs: ["isa", "pension-savings"] },
];

/** 배당 공부 — 글 목록 */
export function LearnIndex() {
  useSeo("learn", "ko");
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="배당 공부"
        title={<>배당 투자, <span className="text-gold">이것만 알면</span> 돼요</>}
        subtitle="배당 받는 날짜와 종목 고르는 법부터 세금·건강보험료·절세 계좌까지. 배당 투자에 꼭 필요한 내용만 쉽게 정리했어요."
      />
      <Link href="/start">
        <span className="panel-hero group mb-3 flex items-center justify-between gap-4 p-5">
          <span>
            <span className="kicker text-gold">여기서부터 시작</span>
            <span className="mt-1 block text-[17px] font-bold text-foreground">배당 투자 처음 시작하기 · 7단계</span>
            <span className="mt-0.5 block text-[13px] text-muted-foreground">무엇부터 해야 할지 순서대로 정리했어요.</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-gold" />
        </span>
      </Link>
      <div className="mt-8 space-y-10">
        {LEARN_GROUPS.map((g) => {
          const items = g.slugs.map((sl) => LEARN.find((x) => x.slug === sl)).filter(Boolean) as typeof LEARN;
          return (
            <section key={g.title} aria-labelledby={`lg-${g.id}`}>
              <h2 id={`lg-${g.id}`} className="text-[19px] font-bold tracking-[-0.03em] sm:text-[21px]">
                {g.title}
              </h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">{g.desc}</p>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/learn/${a.slug}`}>
                      <span className="panel group flex h-full flex-col p-5 transition-colors hover:border-border-strong">
                        <span className="kicker text-gold">{a.kicker}</span>
                        <span className="mt-2 flex items-start justify-between gap-3">
                          <span className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-foreground">{a.title}</span>
                          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle group-hover:text-foreground" />
                        </span>
                        <span className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">{a.description}</span>
                        <span className="mt-auto flex items-center gap-1 pt-4 text-[12px] text-subtle">
                          <Clock className="h-3.5 w-3.5" /> {a.minutes}분
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <div className="mt-10">
        <RelatedLinks
          title="계산기 사용법이 궁금하다면"
          items={[
            { href: "/guide", title: "배당 계산기 사용 가이드", desc: "입력값 고르는 법부터 결과 읽는 법까지 정리했어요." },
            { href: "/etf", title: "배당 ETF 정보", desc: "인기 배당 ETF 19개의 배당률·총보수·배당 주기를 비교해요." },
          ]}
        />
      </div>
    </div>
  );
}

/** 배당 공부 — 글 하나 */
export function LearnArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const a = findLearn(slug);
  useSeo(a ? `learn-${a.slug}` : "learn", "ko");
  const Body = a ? LEARN_BODY[a.slug] : undefined;
  if (!a || !Body) return <NotFound />;
  const others = LEARN.filter((x) => x.slug !== a.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <nav aria-label="경로" className="pt-6 text-[13px] text-subtle sm:pt-8">
        <Link href="/learn">
          <span className="hover:text-foreground">배당 공부</span>
        </Link>
        <ChevronRight className="mx-1 inline h-3.5 w-3.5" />
        <span className="text-muted-foreground">{a.kicker}</span>
      </nav>
      <article>
        <PageHeader kicker={a.kicker} title={a.title} subtitle={a.description}>
          <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-subtle">
            <Clock className="h-3.5 w-3.5" /> {a.minutes}분 · {dateText(a.updated)} 업데이트
          </p>
        </PageHeader>
        <div className="mt-4 space-y-12">
          <Body />
          <FaqList items={a.faq} />
        </div>
      </article>
      <div className="mt-14 space-y-10">
        <RelatedLinks
          title="함께 읽으면 좋은 글"
          items={others.map((o) => ({ href: `/learn/${o.slug}`, title: o.title, desc: o.description.slice(0, 60) + "…" }))}
        />
        <Updated>
          {dateText(a.updated)} 기준 세법·제도로 작성했어요. 세금은 개인 상황에 따라 달라질 수 있으니 큰 결정 전에는 세무 전문가와 확인해 주세요.
        </Updated>
      </div>
    </div>
  );
}
