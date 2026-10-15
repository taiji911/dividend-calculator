import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, CircleAlert } from "lucide-react";
import PageHeader from "@/components/page-header";
import StartQuest from "@/components/start-quest";
import { ContentArticle, FaqList, RelatedLinks, Updated } from "@/components/content";
import { FAQ } from "@/content/faq";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  body: React.ReactNode;
  tip?: string;
  links: { href: string; label: string }[];
}

const STEPS: Step[] = [
  {
    title: "비상금부터 따로 떼어 두세요",
    body: (
      <>
        투자는 <strong>몇 년 동안 쓰지 않을 돈</strong>으로 해요. 생활비 3~6개월 치는 예금이나 파킹통장에 먼저 모아 두세요. 급하게 돈이 필요해서 주가가 떨어졌을 때
        팔게 되는 게 가장 큰 손해예요.
      </>
    ),
    tip: "카드값·대출이 남아 있다면 금리가 높은 빚부터 갚는 게 배당보다 확실한 수익이에요.",
    links: [],
  },
  {
    title: "목표를 숫자로 정해요",
    body: (
      <>
        '언젠가 배당으로 살기'보다 <strong>'10년 뒤 월 50만원'</strong>처럼 숫자로 정하면 매달 얼마를 넣어야 하는지가 보여요. 목표 배당금 계산기에 원하는 월 배당을 넣으면
        필요한 원금이 바로 나와요.
      </>
    ),
    links: [
      { href: "/goal", label: "목표 배당금 계산기" },
      { href: "/", label: "배당 재투자 계산기" },
    ],
  },
  {
    title: "계좌를 골라요",
    body: (
      <>
        같은 ETF라도 어느 계좌에 담느냐에 따라 세금이 달라져요. 보통 이 순서로 채워요.
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            <strong>연금저축</strong>: 노후까지 안 쓸 돈. 넣는 돈의 13.2~16.5%를 돌려받아요.
          </li>
          <li>
            <strong>ISA</strong>: 3~5년 안에 쓸 수도 있는 돈. 배당과 이익에 세금이 거의 없어요.
          </li>
          <li>
            <strong>일반계좌</strong>: 그 밖의 돈. 미국 주식을 직접 살 수 있어요.
          </li>
        </ol>
      </>
    ),
    tip: "처음이라면 증권사 앱에서 연금저축과 중개형 ISA를 함께 만들어 두세요. 계좌 개설은 무료예요.",
    links: [
      { href: "/compare", label: "계좌별 절세 비교" },
      { href: "/learn/isa", label: "ISA 정리" },
      { href: "/learn/pension-savings", label: "연금저축 정리" },
    ],
  },
  {
    title: "첫 ETF 하나를 골라요",
    body: (
      <>
        처음엔 개별 종목보다 <strong>배당 ETF 하나</strong>로 시작하는 게 쉬워요. 회사 100곳에 한 번에 나눠 투자하는 효과가 있거든요. 오래 모을 거라면 배당이 꾸준히 늘어나는{" "}
        <strong>배당성장형</strong>(SCHD와 같은 지수의 ETF)이 무난해요. 연금저축·ISA에서는 국내 상장 ETF를, 일반계좌에서는 미국 상장 ETF도 살 수 있어요.
      </>
    ),
    tip: "분배율이 10%가 넘는 커버드콜 ETF는 매달 받는 돈은 크지만 오래 불리기엔 불리할 수 있어요. 처음 한 종목으로는 피하는 게 좋아요.",
    links: [
      { href: "/etf", label: "배당 ETF 19개 비교" },
      { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스" },
      { href: "/learn/covered-call-etf", label: "커버드콜 ETF 이해하기" },
    ],
  },
  {
    title: "매달 같은 날 자동으로 사요",
    body: (
      <>
        언제 사야 쌀지 맞히려고 하지 마세요. 월급날 다음 날처럼 <strong>매달 같은 날 같은 금액</strong>을 사면, 비쌀 땐 적게 싸게 쌀 땐 많이 사게 돼요. 대부분 증권사 앱에
        정해진 날 알아서 사 주는 자동 매수(적립식) 기능이 있어요.
      </>
    ),
    links: [{ href: "/snowball", label: "매달 넣으면 언제 스노우볼이 굴러갈까?" }],
  },
  {
    title: "받은 배당은 다시 투자해요",
    body: (
      <>
        배당을 써 버리지 않고 다시 사는 것(재투자)이 배당 투자의 핵심이에요. 처음 몇 년은 차이가 작지만 10년, 20년이 지나면 재투자한 쪽과 안 한 쪽의 자산 차이가 크게 벌어져요.
        들어온 배당은 기록해 두면 늘어나는 게 눈에 보여서 오래 버티는 데 도움이 돼요.
      </>
    ),
    links: [
      { href: "/", label: "재투자 효과 계산해 보기" },
      { href: "/calendar", label: "배당 달력 만들기" },
    ],
  },
  {
    title: "1년에 한 번 세금을 확인해요",
    body: (
      <>
        일반계좌의 배당은 받을 때 세금(15.4%, 미국 15%)이 떼여서 보통은 따로 할 일이 없어요. 다만 이자와 배당을 합쳐 <strong>1년 2,000만원</strong>을 넘으면 종합과세,{" "}
        <strong>1,000만원</strong>을 넘으면 건강보험료에 영향이 있어요. 연말에 한 번 확인하고, 넘을 것 같으면 ISA·연금저축 비중을 늘려요.
      </>
    ),
    links: [
      { href: "/learn/dividend-tax", label: "배당소득세 정리" },
      { href: "/tax", label: "종합과세 계산기" },
    ],
  },
];

const AVOID = [
  "배당률이 높다는 이유만으로 고르기 — 배당이 높은 데는 이유가 있을 때가 많아요.",
  "배당락일 직전에 사서 배당만 받고 팔기 — 주가가 배당만큼 내려가고 세금까지 붙어요.",
  "대출받은 돈이나 곧 쓸 돈으로 투자하기",
  "한 종목에 전부 넣기 — 처음엔 ETF로 나눠 담는 게 안전해요.",
];

const CHECKS = [
  "비상금 3~6개월 치를 따로 모았다",
  "목표 월 배당과 기간을 정했다",
  "연금저축·ISA 계좌를 만들었다",
  "첫 배당 ETF를 골랐다",
  "매달 자동 매수를 설정했다",
  "배당 재투자 규칙을 정했다",
];
const STORE_KEY = "dc.start.checks.v1";

export default function Start() {
  useSeo("start", "ko");
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === CHECKS.length) setDone(saved.map(Boolean));
    } catch {
      /* 무시 */
    }
  }, []);
  const toggle = (i: number) =>
    setDone((p) => {
      const next = p.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* 무시 */
      }
      return next;
    });
  const count = done.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader
        kicker="처음 시작하기"
        title={<>배당 투자, <span className="text-gold">이 순서대로</span> 시작하세요</>}
        subtitle="뭐부터 해야 할지 막막하다면 질문 6개에 답해 보세요. 나에게 맞는 계좌와 ETF, 첫 달 미션까지 정리해 드려요. 아래에는 7단계 순서를 자세히 적어 뒀어요."
      />

      <StartQuest />

      <h2 className="mb-4 mt-12 text-[22px] font-bold tracking-[-0.03em] sm:text-[24px]">7단계, 자세히 보기</h2>
      <ol className="relative space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="panel relative p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-[15px] font-bold text-gold-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[18px] font-bold leading-snug tracking-[-0.02em] sm:text-[19px]">{s.title}</h3>
                <div className="mt-2 text-[15px] leading-[1.75] text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">{s.body}</div>
                {s.tip && <p className="note note-info mt-3 text-[13.5px]">{s.tip}</p>}
                {s.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.links.map((l) => (
                      <Link key={l.href + l.label} href={l.href}>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-[hsl(var(--surface-2))] px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-gold/50">
                          {l.label} <ArrowRight className="h-3.5 w-3.5 text-gold" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-8 panel p-5 sm:p-6" aria-labelledby="avoid">
        <h2 id="avoid" className="text-[18px] font-bold">처음에 피해야 할 것</h2>
        <ul className="mt-3 space-y-2.5">
          {AVOID.map((t) => (
            <li key={t} className="flex gap-2 text-[14.5px] leading-relaxed text-muted-foreground">
              <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-coral" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section id="missions" className="mt-8 scroll-mt-24 panel-hero p-5 sm:p-6" aria-labelledby="check">
        <div className="flex items-end justify-between gap-3">
          <h2 id="check" className="text-[18px] font-bold">첫 달 미션</h2>
          <span className="num text-[14px] font-semibold text-gold">
            {count} / {CHECKS.length}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-subtle">누르면 체크돼요. 이 브라우저에만 저장돼요.</p>
        <ul className="mt-4 space-y-2">
          {CHECKS.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={done[i]}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] transition-colors",
                  done[i] ? "border-mint/40 bg-mint/10 text-foreground" : "border-border bg-[hsl(var(--surface-2))] text-muted-foreground hover:border-border-strong"
                )}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", done[i] ? "border-mint bg-mint text-background" : "border-border-strong")}>
                  {done[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={done[i] ? "line-through decoration-mint/60" : undefined}>{c}</span>
              </button>
            </li>
          ))}
        </ul>
        {count === CHECKS.length && <p className="mt-4 text-[14px] font-semibold text-mint">미션 완료! 이제 배당 숲을 가꾸기만 하면 돼요. 🌳</p>}
      </section>

      <ContentArticle>
        <FaqList items={FAQ.start!.ko!} />
        <RelatedLinks
          title="다음으로 볼 만한 곳"
          items={[
            { href: "/learn", title: "배당 공부", desc: "세금, ISA, 연금저축, 배당락일, 커버드콜을 쉽게 정리했어요." },
            { href: "/etf", title: "배당 ETF 정보", desc: "인기 배당 ETF 19개의 배당률·총보수·배당 주기를 비교해요." },
          ]}
        />
        <Updated>2026년 10월 기준으로 작성했어요. 특정 상품을 추천하는 글이 아니며, 투자 판단과 책임은 본인에게 있어요.</Updated>
      </ContentArticle>
    </div>
  );
}
