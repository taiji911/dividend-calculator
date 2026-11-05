import { Link, useParams } from "wouter";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronRight, CircleAlert } from "lucide-react";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import DividendQuickCalc from "@/components/dividend-quick-calc";
import { DataTable, FaqList } from "@/components/content";
import NotFound from "@/pages/not-found";
import {
  STOCK_AS_OF,
  STOCK_AS_OF_LABEL,
  TAG_LABEL,
  dotDate,
  findStock,
  monthsText,
  stockCalcHref,
  stockFaq,
  stockLabel,
  stockSource,
  stockTags,
  usd,
  withTopic,
  type Stock,
} from "@/lib/stocks";
import { yieldText } from "@/lib/etf";
import { useSeo } from "@/lib/seo";

const Stat = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) => (
  <div className="rounded-xl border border-border bg-[hsl(var(--surface-2))] px-4 py-3">
    <p className="text-[12px] text-subtle">{label}</p>
    <p className="mt-1 text-[15.5px] font-semibold leading-snug text-foreground">{value}</p>
    {sub && <p className="mt-0.5 text-[12px] leading-snug text-subtle">{sub}</p>}
  </div>
);

const pctText = (n: number | null) => (n === null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}%`);

export default function StockDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const s = findStock(slug);
  useSeo(s ? `stock-${s.slug}` : "stock", "ko");
  if (!s) return <NotFound />;

  const tags = stockTags(s);
  const per = s.freq === "월" ? 12 : 4;
  const similar = s.similar.map((t) => findStock(t)).filter(Boolean) as Stock[];
  const src = stockSource(s);
  const growthSub =
    s.years && s.years >= 5 ? "해마다 배당을 늘려 온 기간" : (s.g1y ?? 0) <= 0 ? "최근 배당을 늘리지 않았어요" : "연속 증가 기간이 짧아요";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <nav aria-label="경로" className="pt-6 text-[13px] text-subtle sm:pt-8">
        <Link href="/stock">
          <span className="hover:text-foreground">미국 배당주</span>
        </Link>
        <ChevronRight className="mx-1 inline h-3.5 w-3.5" />
        <span className="text-muted-foreground">{s.name}</span>
      </nav>

      <PageHeader
        kicker={`${s.desc} · 미국 상장`}
        title={
          <>
            {s.name} 배당금{" "}
            <span className="mt-1 block text-[15px] font-medium tracking-[-0.01em] text-muted-foreground sm:text-[17px]">
              {s.ticker} · {s.en}
            </span>
          </>
        }
        subtitle={s.summary}
      >
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-border px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                {TAG_LABEL[t]}
              </span>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="panel-hero p-5 sm:p-6" aria-label="핵심 배당 정보">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-gold">배당률</p>
            <p className="num mt-1 text-[40px] font-bold leading-none tracking-[-0.03em] text-gold sm:text-[48px]">{yieldText(s.yield)}</p>
            <p className="mt-2 text-[12.5px] text-subtle">최근 1년 배당금 ÷ 주가 · {STOCK_AS_OF_LABEL} 확인</p>
          </div>
          <a
            href="#quick-calc"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-3 text-[14.5px] font-semibold text-gold-foreground transition-opacity hover:opacity-90"
          >
            내 돈으로 배당 계산하기 <ArrowDown className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Stat label="1주당 1년 배당금" value={<span className="num">{usd(s.annual)}</span>} sub={`한 번에 약 ${usd(s.annual / per)}`} />
          <Stat label="배당 주기" value={s.freq === "월" ? "매달" : "1년 4번 (분기)"} sub={s.freq === "월" ? "1~12월 매달 지급" : `${monthsText(s.months)} 지급`} />
          <Stat label="연속 배당 증가" value={s.years ? `${s.years}년` : "—"} sub={growthSub} />
          <Stat label="최근 1년 배당 증가율" value={<span className="num">{pctText(s.g1y)}</span>} />
          <Stat
            label="배당성향"
            value={<span className="num">{s.payout.toFixed(0)}%</span>}
            sub={s.payout > 100 ? "순이익 기준이라 100%를 넘게 보여요 (아래 참고)" : "순이익 중 배당으로 주는 몫"}
          />
          <Stat label="업종" value={s.desc} sub="미국 상장 · 달러" />
        </div>
      </section>

      <div className="mt-6">
        <DividendQuickCalc name={s.name} yieldPct={s.yield} dg={s.assume.dg} pg={s.assume.pg} taxPct={15} detailHref={stockCalcHref(s)} />
      </div>

      <section className="mt-10" aria-labelledby="shares">
        <h2 id="shares" className="text-[20px] font-bold tracking-[-0.03em]">
          {s.name} 주식 수로 보면 배당은?
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">1주당 1년 배당금 {usd(s.annual)} 기준이에요. 세후는 미국에서 떼는 15%를 뺀 금액이에요.</p>
        <div className="mt-3">
          <DataTable
            headers={["가진 주식", "1년 배당 (세전)", "1년 배당 (세후)", `${s.freq === "월" ? "매달" : "한 번에"} (세후)`]}
            rows={[1, 10, 50, 100, 500].map((n) => [
              `${n.toLocaleString("ko-KR")}주`,
              <span className="num">{usd(s.annual * n)}</span>,
              <span className="num font-semibold text-foreground">{usd(s.annual * n * 0.85)}</span>,
              <span className="num">{usd((s.annual * n * 0.85) / per)}</span>,
            ])}
          />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="history">
        <h2 id="history" className="text-[20px] font-bold tracking-[-0.03em]">
          최근 배당 내역
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          <strong className="font-semibold text-foreground">배당락일 전날</strong>까지 주식을 가지고 있어야 그 배당을 받아요. 날짜는 미국 기준이에요.
        </p>
        <div className="mt-3">
          <DataTable
            headers={["배당락일", "지급일", "1주당 배당금"]}
            rows={s.recent.map((p) => [
              <span className="num">{dotDate(p.ex)}</span>,
              <span className="num">
                {dotDate(p.pay)}
                {p.pay > STOCK_AS_OF && <span className="ml-1.5 rounded bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-gold">예정</span>}
              </span>,
              <span className="num font-semibold text-foreground">{usd(p.amount)}</span>,
            ])}
            note={`${STOCK_AS_OF_LABEL} 기준 최근 ${s.recent.length}번이에요. 매달 1일에 새로 확인해 갱신해요.`}
          />
        </div>
        <Link href="/calendar">
          <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-gold hover:underline">
            <CalendarDays className="h-4 w-4" /> 다른 종목과 섞어서 매달 배당 받기 (배당 달력)
          </span>
        </Link>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="panel p-5" aria-labelledby="pros">
          <h2 id="pros" className="text-[16px] font-bold">이런 점이 좋아요</h2>
          <ul className="mt-3 space-y-2.5">
            {s.pros.map((t) => (
              <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-muted-foreground">
                <Check className="mt-1 h-4 w-4 shrink-0 text-mint" />
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-5" aria-labelledby="cons">
          <h2 id="cons" className="text-[16px] font-bold">알아둘 점</h2>
          <ul className="mt-3 space-y-2.5">
            {s.cons.map((t) => (
              <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-muted-foreground">
                <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-coral" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="tax">
        <h2 id="tax" className="text-[20px] font-bold tracking-[-0.03em]">
          어디서 사고, 세금은 얼마?
        </h2>
        <div className="content-prose mt-3">
          <p>
            {withTopic(s.name)} 미국 시장에 상장된 주식이라 <strong>증권사 일반계좌(해외주식)</strong>에서 달러로 사요. ISA·연금저축·IRP에는 담을 수 없어요.
          </p>
          <ul>
            <li>배당을 받을 때 미국에서 15%를 떼고 들어와요. 한국에서 더 낼 세금은 보통 없어요.</li>
            <li>1년 이자·배당이 2,000만원을 넘으면 금융소득종합과세 대상이 될 수 있어요. 얼마를 더 내는지는 <Link href="/tax">배당금 세금 계산기</Link>에서 볼 수 있어요.</li>
            <li>팔 때 이익이 나면 1년 해외주식 이익에서 250만원을 뺀 나머지에 양도소득세 22%를 내요.</li>
          </ul>
          {s.payout > 100 && (
            <p>
              <strong>배당성향이 100%를 넘는 이유:</strong> 배당성향은 회계상 순이익으로 나눈 값이에요. 리츠는 건물 감가상각, 제약사는 인수 관련 비용 같은 현금이 나가지
              않는 비용 때문에 순이익이 작게 잡혀서 100%를 넘게 보일 수 있어요. 이럴 땐 현금흐름(리츠는 AFFO) 기준으로 배당 여력을 따져 봐야 해요.
            </p>
          )}
        </div>
      </section>

      <div className="mt-10">
        <FaqList items={stockFaq(s)} />
      </div>

      {similar.length > 0 && (
        <section className="mt-10" aria-labelledby="similar">
          <h2 id="similar" className="text-[20px] font-bold tracking-[-0.03em]">
            함께 비교해 볼 배당주
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {similar.map((o) => (
              <Link key={o.slug} href={`/stock/${o.slug}`}>
                <span className="panel group flex h-full items-start justify-between gap-3 p-4 transition-colors hover:border-border-strong">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug text-foreground">{stockLabel(o)}</span>
                    <span className="mt-0.5 block text-[12.5px] text-subtle">{o.desc}</span>
                    <span className="num mt-2 block text-[13px] text-muted-foreground">
                      배당률 <span className="font-semibold text-gold">{yieldText(o.yield)}</span> · {o.freq === "월" ? "매달" : "분기"}
                      {o.years ? ` · ${o.years}년 증가` : ""}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-subtle group-hover:text-foreground" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 text-[12.5px] leading-relaxed text-subtle" aria-label="출처">
        <p>
          배당률·배당금·배당 내역은 {STOCK_AS_OF_LABEL}에 확인한 값이고, 매달 1일에 갱신해요. 출처:{" "}
          <a href={src.url} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-border-strong underline-offset-2 hover:text-foreground">
            {src.label}
          </a>
        </p>
      </section>

      <RiskNote title="투자 안내">
        이 페이지는 정보 정리용이며 특정 종목을 사라는 추천이 아니에요. 배당은 회사 사정에 따라 줄거나 끊길 수 있고, 과거 배당이 앞으로도 같다는 보장은 없어요.
        투자 전에 회사 공시를 꼭 확인해 주세요.
      </RiskNote>
    </div>
  );
}
