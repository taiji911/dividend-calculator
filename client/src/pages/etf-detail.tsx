import { Link, useParams } from "wouter";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleAlert } from "lucide-react";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import NotFound from "@/pages/not-found";
import { ETF_AS_OF_LABEL, ETF_GROUPS, calcHref, etfLabel, feeText, findEtf, sinceText, taxableRate, yieldText, type Etf } from "@/lib/etf";
import { useSeo } from "@/lib/seo";

const Stat = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) => (
  <div className="rounded-xl border border-border bg-[hsl(var(--surface-2))] px-4 py-3">
    <p className="text-[12px] text-subtle">{label}</p>
    <p className="mt-1 text-[15.5px] font-semibold leading-snug text-foreground">{value}</p>
    {sub && <p className="mt-0.5 text-[12px] leading-snug text-subtle">{sub}</p>}
  </div>
);

function AccountTax({ e }: { e: Etf }) {
  if (e.market === "us") {
    return (
      <>
        <p>
          미국 시장에 상장된 ETF라 <strong>ISA·연금저축·IRP에는 담을 수 없어요.</strong> 증권사 일반계좌(해외주식)에서만 사고팔 수 있어요.
        </p>
        <ul>
          <li>배당을 받을 때 미국에서 15%가 떼이고, 한국에서 따로 더 내는 세금은 없어요. 다만 금융소득 2,000만원 계산에는 들어가요.</li>
          <li>팔 때 이익이 나면 1년 이익에서 250만원을 뺀 나머지에 양도소득세 22%를 내요(다음 해 5월 신고).</li>
          <li>절세계좌에 담고 싶다면 비슷한 전략의 국내 상장 ETF를 찾아보세요.</li>
        </ul>
      </>
    );
  }
  return (
    <>
      <p>
        한국 시장에 상장된 ETF라 <strong>일반계좌·ISA·연금저축·IRP</strong> 어디에나 담을 수 있어요.
      </p>
      <ul>
        {e.group === "kr-high" ? (
          <>
            <li>일반계좌: 분배금에서 15.4%가 떼여요. 국내 주식 ETF라 팔 때 매매차익에는 세금이 없어요.</li>
            <li>ISA: 기간 중 세금 없이 굴리고, 만기 때 이익 200만원(서민형 400만원)을 넘는 부분만 9.9%를 내요.</li>
          </>
        ) : (
          <>
            <li>일반계좌: 분배금에서 약 15%(미국에서 뗀 세금 포함)가 빠지고, 팔 때 매매차익에도 15.4%가 붙어요. 둘 다 금융소득 2,000만원 계산에 들어가요.</li>
            <li>ISA: 기간 중 세금 없이 굴리고, 만기 때 이익 200만원(서민형 400만원)을 넘는 부분만 9.9%를 내요. 미국에서 뗀 15%는 돌려받지 못해요.</li>
          </>
        )}
        <li>연금저축·IRP: 넣을 때 세액공제를 받고, 55세 이후 연금으로 받을 때 3.3~5.5%를 내요. IRP는 주식형 ETF를 70%까지만 담을 수 있어요.</li>
      </ul>
    </>
  );
}

export default function EtfDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const e = findEtf(slug);
  // 훅 순서를 지키려고 없는 ETF여도 먼저 호출해요 (없으면 목록 페이지 정보로)
  useSeo(e ? `etf-${e.slug}` : "etf", "ko");
  if (!e) return <NotFound />;

  const label = etfLabel(e);
  const won = (n: number) => `${(Math.round(n / 10) * 10).toLocaleString("ko-KR")}원`;
  const group = ETF_GROUPS.find((g) => g.id === e.group)!;
  const yearly = 10_000_000 * (e.yield / 100);
  const monthlyAfter = (yearly * (1 - taxableRate(e))) / 12;
  const similar = e.similar.map(findEtf).filter(Boolean) as Etf[];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <nav aria-label="경로" className="pt-6 text-[13px] text-subtle sm:pt-8">
        <Link href="/etf">
          <span className="hover:text-foreground">배당 ETF 정보</span>
        </Link>
        <ChevronRight className="mx-1 inline h-3.5 w-3.5" />
        <span className="text-muted-foreground">{label}</span>
      </nav>

      <PageHeader
        kicker={group.title}
        title={
          <>
            <span className={label.length > 12 ? "text-[22px] sm:text-[34px]" : undefined}>{label}</span>
            <span className="mt-1 block text-[15px] font-medium tracking-[-0.01em] text-muted-foreground sm:text-[17px]">
              {e.market === "us" ? e.name : `종목코드 ${e.ticker} · ${e.issuer}`}
            </span>
          </>
        }
        subtitle={e.summary}
      />

      <section className="panel-hero p-5 sm:p-6" aria-label="핵심 정보">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-gold">배당률</p>
            <p className="num mt-1 text-[40px] font-bold leading-none tracking-[-0.03em] text-gold sm:text-[48px]">{yieldText(e.yield)}</p>
            <p className="mt-2 text-[12.5px] text-subtle">
              {e.yieldNote} · {ETF_AS_OF_LABEL} 확인
            </p>
          </div>
          <Link href={calcHref(e)}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-3 text-[14.5px] font-semibold text-gold-foreground transition-opacity hover:opacity-90">
              이 배당률로 재투자 계산하기 <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Stat label="총보수 (1년)" value={feeText(e.fee)} />
          <Stat label="배당 주기" value={e.freq === "월" ? "매달" : "1년 4번 (분기)"} />
          <Stat label="상장" value={sinceText(e.inception)} sub={e.market === "us" ? "미국 상장 · 달러" : "국내 상장 · 원화"} />
          <Stat label="운용사" value={e.issuer} />
          <Stat label="보유 종목" value={e.holdings ?? "운용사 공시 참고"} />
          <Stat label="따라가는 지수·전략" value={<span className="text-[13.5px]">{e.index}</span>} />
        </div>
      </section>

      <section className="mt-6 panel p-5 sm:p-6" aria-labelledby="ex">
        <h2 id="ex" className="text-[18px] font-bold tracking-[-0.02em]">
          1,000만원을 넣으면 배당은 얼마?
        </h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">지금 배당률이 1년 동안 그대로라고 가정한 단순 계산이에요.</p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Stat label="1년 배당 (세전)" value={<span className="num text-gold">{won(yearly)}</span>} />
          <Stat label="한 달 평균 (세전)" value={<span className="num">{won(yearly / 12)}</span>} />
          <Stat label="한 달 평균 (일반계좌 세후)" value={<span className="num">{won(monthlyAfter)}</span>} sub={`세금 약 ${(taxableRate(e) * 100).toFixed(1)}% 반영`} />
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="panel p-5" aria-labelledby="pros">
          <h2 id="pros" className="text-[16px] font-bold">이런 점이 좋아요</h2>
          <ul className="mt-3 space-y-2.5">
            {e.pros.map((t) => (
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
            {e.cons.map((t) => (
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
          어느 계좌에 담을 수 있나요? 세금은?
        </h2>
        <div className="content-prose mt-3">
          <AccountTax e={e} />
          {e.market === "kr" && (
            <p>
              계좌별로 10년 뒤 얼마나 차이 나는지는 <Link href="/compare">계좌별 절세 비교</Link>에서 계산할 수 있어요.
            </p>
          )}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-10" aria-labelledby="similar">
          <h2 id="similar" className="text-[20px] font-bold tracking-[-0.03em]">
            함께 비교해 볼 ETF
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {similar.map((s) => (
              <Link key={s.slug} href={`/etf/${s.slug}`}>
                <span className="panel group flex h-full items-start justify-between gap-3 p-4 transition-colors hover:border-border-strong">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug text-foreground">{etfLabel(s)}</span>
                    <span className="mt-0.5 block text-[12.5px] text-subtle">{s.short}</span>
                    <span className="num mt-2 block text-[13px] text-muted-foreground">
                      배당률 <span className="font-semibold text-gold">{yieldText(s.yield)}</span> · 총보수 {feeText(s.fee)}
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
          {ETF_AS_OF_LABEL} 기준으로 확인한 정보예요. 출처:{" "}
          {e.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-border-strong underline-offset-2 hover:text-foreground">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      </section>

      <RiskNote title="투자 안내">
        이 페이지는 정보 정리용이며 특정 ETF를 사라는 추천이 아니에요. 배당률·총보수는 바뀔 수 있고, 과거 배당이 앞으로도 같다는 보장은 없어요. 투자 전에 운용사
        공식 자료를 꼭 확인해 주세요.
      </RiskNote>
    </div>
  );
}
