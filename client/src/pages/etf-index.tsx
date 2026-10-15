import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/page-header";
import RiskNote from "@/components/risk-note";
import { ContentArticle, Section, FaqList, RelatedLinks, Updated } from "@/components/content";
import { FAQ } from "@/content/faq";
import { ETFS, ETF_GROUPS, ETF_AS_OF_LABEL, etfLabel, feeText, yieldText, type Etf } from "@/lib/etf";
import { useSeo } from "@/lib/seo";

function EtfCard({ e }: { e: Etf }) {
  const label = etfLabel(e);
  return (
    <Link href={`/etf/${e.slug}`}>
      <span className="panel group flex h-full flex-col p-4 transition-colors hover:border-border-strong">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className={`block font-bold tracking-[-0.02em] text-foreground ${e.market === "us" ? "text-[20px]" : "text-[15.5px] leading-snug"}`}>{label}</span>
            <span className="mt-0.5 block truncate text-[12.5px] text-subtle">{e.market === "us" ? e.name : `${e.ticker} · ${e.issuer}`}</span>
          </span>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
        </span>
        <span className="mt-2 block text-[13.5px] leading-snug text-muted-foreground">{e.short}</span>
        <span className="mt-auto grid grid-cols-3 gap-2 pt-4 text-[12px]">
          <span>
            <span className="block text-subtle">배당률</span>
            <span className="num block text-[15px] font-semibold text-gold">{yieldText(e.yield)}</span>
          </span>
          <span>
            <span className="block text-subtle">총보수</span>
            <span className="num block text-[15px] font-semibold text-foreground">{feeText(e.fee)}</span>
          </span>
          <span>
            <span className="block text-subtle">배당</span>
            <span className="block text-[15px] font-semibold text-foreground">{e.freq === "월" ? "매달" : "분기"}</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

export default function EtfIndex() {
  useSeo("etf", "ko");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="배당 ETF 정보"
        title={<>인기 배당 ETF, <span className="text-gold">한눈에 비교</span></>}
        subtitle={`SCHD부터 국내 상장 미국배당다우존스까지, 많이 찾는 배당 ETF ${ETFS.length}개의 배당률·총보수·배당 주기를 모았어요. 눌러서 자세히 보고, 바로 계산기로 넘어갈 수 있어요.`}
      >
        <p className="mt-3 text-[12.5px] text-subtle">{ETF_AS_OF_LABEL} 기준 · 배당률은 최근 12개월 분배금 기준이라 매일 조금씩 바뀌어요.</p>
      </PageHeader>

      <div className="space-y-12">
        {ETF_GROUPS.map((g) => {
          const items = ETFS.filter((e) => e.group === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`} className="text-[20px] font-bold tracking-[-0.03em] sm:text-[22px]">
                {g.title}
              </h2>
              <p className="mt-1 text-[14px] text-muted-foreground">{g.desc}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => (
                  <EtfCard key={e.slug} e={e} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <RiskNote title="투자 안내">
        특정 ETF를 사거나 팔라는 추천이 아니에요. 배당률과 총보수는 {ETF_AS_OF_LABEL}에 확인한 값이고, 과거 배당이 앞으로도 같다는 보장은 없어요. 투자 전에는
        운용사 공식 자료로 최신 정보를 꼭 확인해 주세요.
      </RiskNote>

      <ContentArticle>
        <Section kicker="고르는 법" title="배당 ETF는 세 가지 성격으로 나뉘어요">
          <ul>
            <li>
              <strong>배당성장형</strong>(SCHD·DGRO·VIG): 지금 배당률은 1~3%대로 낮지만 배당이 해마다 늘어나요. 10년 이상 길게 모을 때 유리해요.
            </li>
            <li>
              <strong>고배당형</strong>(SPYD·HDV·VYM): 지금 배당을 많이 받는 대신 배당이 늘어나는 속도는 느려요. 은퇴 뒤처럼 당장 현금이 필요할 때 맞아요.
            </li>
            <li>
              <strong>커버드콜형</strong>(JEPI·JEPQ·QYLD): 옵션을 팔아 분배율이 7~12%로 높아요. 대신 주가가 크게 오를 때 수익이 제한되고, 분배금이 늘어난다는
              보장이 없어요.
            </li>
          </ul>
          <p>
            배당률만 보고 고르면 안 되는 이유가 여기 있어요. 배당 재투자 계산기에서 같은 돈을 넣고 <strong>배당률·배당 성장률·주가 상승률</strong>을 바꿔 보면, 10년
            뒤 어느 쪽이 더 큰지 바로 비교할 수 있어요.
          </p>
        </Section>

        <Section kicker="미국 상장 vs 국내 상장" title="SCHD와 TIGER 미국배당다우존스, 뭐가 달라요?">
          <p>
            둘은 <strong>같은 지수</strong>(Dow Jones U.S. Dividend 100)를 따라가요. 차이는 어디서 어떻게 사느냐예요.
          </p>
          <ul>
            <li>SCHD는 달러로 미국 시장에서 사고, 1년에 4번 배당해요. 일반계좌(해외주식)에서만 살 수 있어요.</li>
            <li>국내 상장 ETF는 원화로 한국 시장에서 사고, 매달 분배해요. ISA·연금저축·IRP에 담을 수 있어요.</li>
            <li>팔 때 세금도 달라요. SCHD는 이익에서 연 250만원을 뺀 나머지에 22%, 국내 상장은 이익 전체에 15.4%예요.</li>
          </ul>
          <p>
            절세계좌를 쓸 수 있다면 국내 상장이, 일반계좌에서 큰 금액을 오래 굴린다면 미국 상장이 유리할 때가 많아요. 내 조건에서 어느 쪽이 나은지는{" "}
            <Link href="/compare">계좌별 절세 비교</Link>에서 계산해 볼 수 있어요.
          </p>
        </Section>

        <FaqList items={FAQ.etf!.ko!} />

        <RelatedLinks
          items={[
            { href: "/", title: "배당 재투자 계산기", desc: "ETF 배당률로 10년·20년 뒤 자산과 월 배당을 계산해요." },
            { href: "/compare", title: "계좌별 절세 비교", desc: "같은 ETF를 일반계좌·ISA·연금저축에 넣으면 얼마나 차이 나는지 봐요." },
          ]}
        />

        <Updated>
          {ETF_AS_OF_LABEL} 기준. 각 ETF 페이지 아래에 출처를 적어 두었어요.
        </Updated>
      </ContentArticle>
    </div>
  );
}
