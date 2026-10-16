/**
 * '처음 시작하기' 게임형 질문 — 5개 선택지에 답하면 나만의 배당 시작 플랜을 만들어 줘요.
 * 첫 화면(미리 만든 HTML)은 시작 버튼만 보여주고, 나머지는 누를 때 화면에서 그려요.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, RotateCcw, Sprout, Trees, TreeDeciduous, Leaf, Trophy, Lightbulb } from "lucide-react";
import { simulate } from "@/lib/dividend-engine";
import { krwShort } from "@/lib/format";
import { cn } from "@/lib/utils";

type Answers = {
  safety?: "yes" | "no";
  horizon?: "long" | "mid" | "now";
  monthly?: number;
  lock?: "none" | "maybe";
  style?: "growth" | "high" | "monthly";
  nerve?: "buy" | "hold" | "sell";
};

interface Option {
  value: string | number;
  label: string;
  sub?: string;
  feedback: string;
}
interface Question {
  key: keyof Answers;
  stage: string;
  q: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    key: "safety",
    stage: "준비",
    q: "생활비 3~6개월 치 비상금, 따로 있나요?",
    options: [
      { value: "yes", label: "네, 있어요", feedback: "좋아요! 급할 때 주식을 팔 일이 없으니 오래 버틸 수 있어요." },
      { value: "no", label: "아직 없어요", feedback: "괜찮아요. 투자금 일부를 먼저 비상금으로 모으면서 시작하면 돼요. 플랜에 함께 넣어 둘게요." },
    ],
  },
  {
    key: "horizon",
    stage: "목표",
    q: "배당은 언제부터 쓰고 싶나요?",
    options: [
      { value: "long", label: "10년 넘게 뒤", sub: "노후 준비", feedback: "시간이 가장 큰 무기예요. 배당이 자라는 ETF와 연금저축이 잘 맞아요." },
      { value: "mid", label: "5~10년 뒤", sub: "중간 목표", feedback: "ISA처럼 중간에 찾을 수 있는 절세 계좌를 중심으로 짜면 좋아요." },
      { value: "now", label: "지금 바로", sub: "매달 현금 흐름", feedback: "지금 받는 배당이 중요하니 매달 분배하는 ETF를 중심으로 볼게요." },
    ],
  },
  {
    key: "monthly",
    stage: "목표",
    q: "한 달에 얼마씩 넣을 수 있나요?",
    options: [
      { value: 100_000, label: "10만원", feedback: "작아도 꾸준함이 이겨요. 10년이면 원금만 1,200만원이에요." },
      { value: 300_000, label: "30만원", feedback: "적립식으로 딱 좋은 금액이에요." },
      { value: 500_000, label: "50만원", feedback: "연 600만원, 연금저축 세액공제 한도(600만원)를 꽉 채울 수 있는 금액이에요." },
      { value: 1_000_000, label: "100만원 이상", feedback: "계좌를 나눠 쓰면 세금을 꽤 아낄 수 있어요." },
    ],
  },
  {
    key: "lock",
    stage: "계좌",
    q: "이 돈, 55세 전에 꺼내 쓸 수도 있나요?",
    options: [
      { value: "none", label: "아니요, 노후용이에요", feedback: "그럼 연금저축이 1순위예요. 넣는 순간 13.2~16.5%를 돌려받아요." },
      { value: "maybe", label: "쓸 수도 있어요", feedback: "그럼 ISA를 중심으로 짜요. 3년만 지나면 언제든 찾을 수 있어요." },
    ],
  },
  {
    key: "style",
    stage: "ETF",
    q: "어떤 배당이 더 끌리나요?",
    options: [
      { value: "growth", label: "해마다 늘어나는 배당", sub: "지금은 적어도 OK", feedback: "배당성장형! SCHD와 같은 지수를 따르는 ETF가 대표적이에요." },
      { value: "high", label: "지금 많이 주는 배당", sub: "배당률 4%+", feedback: "고배당형! 대신 배당이 늘어나는 속도는 느린 편이에요." },
      { value: "monthly", label: "매달 들어오는 배당", sub: "월급처럼", feedback: "월배당형! 국내 상장 미국 배당 ETF는 대부분 매달 분배해요." },
    ],
  },
  {
    key: "nerve",
    stage: "마음가짐",
    q: "산 ETF가 1년 만에 30% 떨어지면?",
    options: [
      { value: "buy", label: "싸졌으니 더 산다", feedback: "강심장이에요! 배당 투자자에게 하락장은 배당률이 올라가는 할인 기간이에요." },
      { value: "hold", label: "그냥 둔다", feedback: "가장 좋은 대응이에요. 매달 자동으로 사는 것만 멈추지 않으면 돼요." },
      { value: "sell", label: "무서워서 팔 것 같다", feedback: "솔직해서 좋아요. 처음엔 금액을 작게 시작해서 하락을 한 번 겪어 보는 게 좋아요." },
    ],
  },
];

const LEVELS = [
  { at: 0, name: "배당 씨앗", Icon: Leaf },
  { at: 2, name: "배당 새싹", Icon: Sprout },
  { at: 4, name: "배당 나무", Icon: TreeDeciduous },
  { at: 6, name: "배당 숲", Icon: Trees },
];

const ISA_MONTHLY = 1_660_000; // 연 2,000만원
const PENSION_MONTHLY = 750_000; // 세액공제 한도 연 900만원

function buildPlan(a: Required<Answers>) {
  const m = a.monthly;
  // 1) 계좌 나누기
  //  - 배당을 '지금' 생활비로 쓸 사람: ISA·연금저축은 배당을 꺼내 쓸 수 없으니(ISA는 원금만 중도 인출) 일반계좌로
  //  - 노후용: 연금저축 먼저, 나머지 ISA
  //  - 5~10년 뒤 / 중간에 쓸 수도: ISA 중심
  const useNow = a.horizon === "now";
  let pension = 0;
  if (!useNow && a.lock === "none") pension = Math.min(Math.round(m * 0.6), PENSION_MONTHLY);
  else if (!useNow && a.horizon === "long") pension = Math.min(Math.round(m * 0.3), PENSION_MONTHLY);
  const isa = useNow ? 0 : Math.min(m - pension, ISA_MONTHLY);
  const general = m - pension - isa;
  const accounts = [
    { name: "연금저축", amount: pension, why: "세액공제 13.2~16.5% · 배당은 계좌 안에서 재투자 (55세 이후 연금으로 꺼내 써요)", href: "/learn/pension-savings" },
    { name: "ISA", amount: isa, why: "배당·이익 200만원까지 비과세 · 배당은 계좌 안에 쌓여요 (3년 뒤 만기 때 꺼내요)", href: "/learn/isa" },
    {
      name: "일반계좌",
      amount: general,
      why: useNow ? "배당이 들어오는 대로 바로 꺼내 쓸 수 있어요 (세금 약 15%를 떼고 입금돼요)" : "ISA 한도를 넘는 돈",
      href: useNow ? "/learn/dividend-tax" : "/compare",
    },
  ].filter((x) => x.amount > 0);

  // 2) ETF 유형
  const type = a.style === "high" ? "high" : a.style === "monthly" || a.horizon === "now" ? "monthly" : "growth";
  const etfs =
    type === "growth"
      ? [
          { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "연금저축·ISA용 (매달 분배)" },
          { href: "/etf/schd", label: "SCHD", note: "일반계좌에서 달러로 산다면" },
        ]
      : type === "high"
        ? [
            { href: "/etf/plus-high-dividend", label: "PLUS 고배당주", note: "국내 고배당 30종목 (매달 분배)" },
            { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "미국 배당주로 나눠 담기" },
          ]
        : [
            { href: "/etf/ace-us-dividend-dowjones", label: "ACE 미국배당다우존스", note: "15일 기준 분배" },
            { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "월말 기준 분배 · 둘을 섞으면 한 달에 두 번" },
          ];
  if (type === "monthly" && a.horizon === "now" && a.nerve !== "sell")
    etfs.push({ href: "/etf/tiger-us-dividend-target-covered-call-2", label: "타겟커버드콜2호 (30% 이내)", note: "분배금을 더 키우고 싶다면 일부만" });

  // 3) 10년 뒤 미리보기 (세전, 예시 가정)
  const assume = type === "growth" ? { y: 3.5, dg: 6, pg: 5 } : type === "high" ? { y: 4.5, dg: 3, pg: 2 } : { y: 4.5, dg: 4, pg: 3 };
  const sim = simulate({ initialInvestment: 0, monthlyInvestment: m, years: 10, dividendYield: assume.y, dividendGrowthRate: assume.dg, priceGrowthRate: assume.pg, drip: !useNow, account: "custom", customTaxRate: 0 });
  const last = sim.yearlyData[sim.yearlyData.length - 1];

  const typeName = type === "growth" ? "배당성장형" : type === "high" ? "고배당형" : "월배당형";
  const title =
    type === "growth" ? "천천히 크게 키우는 배당 농부" : type === "high" ? "지금 수확하는 배당 사냥꾼" : "매달 월급 받는 배당 월급러";

  const tips: string[] = [];
  if (a.safety === "no") tips.push(`처음 3~6개월은 매달 ${krwShort(Math.round(m / 2))}을 비상금으로, 나머지만 투자해요.`);
  if (a.nerve === "sell") tips.push("처음 1년은 금액을 절반으로 시작해서 하락장을 한 번 겪어 보세요.");
  if (useNow)
    tips.push("ISA·연금저축 안의 배당은 바로 꺼내 쓸 수 없어서 일반계좌로 짰어요. 배당을 쓰지 않고 모아 갈 돈이 따로 있다면 그 돈은 ISA에 넣어 세금을 줄이세요.");
  if (useNow) tips.push("일반계좌 배당이 이자와 합쳐 1년 1,000만원을 넘으면 건강보험료, 2,000만원을 넘으면 종합과세를 확인해요.");
  if (!useNow && a.style === "monthly") tips.push("지금은 매달 받는 배당을 계좌 안에서 다시 사고, 은퇴 뒤에 월급처럼 꺼내 쓰는 구조예요.");
  if (a.horizon === "long") tips.push("배당은 무조건 재투자! 10년 뒤부터 차이가 크게 벌어져요.");
  tips.push("매달 같은 날 자동 매수를 걸어 두면 신경 쓸 일이 거의 없어요.");

  return { accounts, etfs, typeName, title, assume, useNow, totalDiv: sim.totalDividends, invested: last.totalInvested, assets: sim.finalAssets, monthlyDiv: last.annualDividends / 12, tips };
}

export default function StartQuest() {
  const [i, setI] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [picked, setPicked] = useState<Option | null>(null);

  const ref = useRef<HTMLElement>(null);
  // 질문이 바뀌거나 결과가 나오면, 화면이 아래로 내려가 있을 때만 질문 상자 맨 위로 올려요
  useEffect(() => {
    if (i < 0 || !ref.current) return;
    if (ref.current.getBoundingClientRect().top < 64) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i]);

  const total = answers.horizon === "now" ? QUESTIONS.length - 1 : QUESTIONS.length;
  const answered = QUESTIONS.filter((qq) => answers[qq.key] !== undefined && !(qq.key === "lock" && answers.horizon === "now")).length;
  const level = [...LEVELS].reverse().find((l) => answered >= l.at)!;
  const done = i >= QUESTIONS.length;
  const plan = useMemo(() => (done ? buildPlan(answers as Required<Answers>) : null), [done, answers]);

  const q = i >= 0 && !done ? QUESTIONS[i] : null;
  const choose = (o: Option) => {
    if (!q) return;
    setAnswers((p) => ({ ...p, [q.key]: o.value }));
    setPicked(o);
  };
  // '지금 바로' 쓸 돈이면 '55세 전에 꺼낼지' 질문은 건너뛰어요
  const skip = (idx: number) => QUESTIONS[idx]?.key === "lock" && answers.horizon === "now";
  const next = () => {
    setPicked(null);
    setI((x) => (skip(x + 1) ? x + 2 : x + 1));
  };
  const back = () => {
    setPicked(null);
    setI((x) => Math.max(0, skip(x - 1) ? x - 2 : x - 1));
  };
  const restart = () => {
    setAnswers({});
    setPicked(null);
    setI(0);
  };

  return (
    <section ref={ref} className="panel-hero scroll-mt-20 overflow-hidden p-5 sm:p-7" aria-labelledby="quest">
      {/* 레벨 · 진행 막대 */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[12.5px] font-semibold text-gold">
          <level.Icon className="h-4 w-4" /> Lv.{LEVELS.indexOf(level) + 1} {level.name}
        </span>
        <span className="num text-[12.5px] text-subtle">
          {Math.min(answered, total)} / {total}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--surface-3))]" aria-hidden="true">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${(Math.min(answered, total) / total) * 100}%` }} />
      </div>

      {i === -1 && (
        <div className="py-6 text-center sm:py-8">
          <h2 id="quest" className="text-[22px] font-bold leading-snug tracking-[-0.03em] sm:text-[26px]">
            질문 6개로 만드는
            <br />
            <span className="text-gold">나만의 배당 시작 플랜</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
            답을 고를 때마다 레벨이 올라가요. 끝까지 가면 어떤 계좌에 얼마씩, 어떤 ETF로 시작하면 좋을지 정리해 드려요. 1분이면 끝나요.
          </p>
          <button type="button" onClick={() => setI(0)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[16px] font-bold text-gold-foreground transition-transform hover:scale-[1.02]">
            시작하기 <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {q && (
        <div className="pt-6">
          <p className="kicker text-gold">
            Q{QUESTIONS.slice(0, i + 1).filter((_, k) => !skip(k)).length} · {q.stage}
          </p>
          <h2 id="quest" className="mt-1 text-[20px] font-bold leading-snug tracking-[-0.02em] sm:text-[23px]">
            {q.q}
          </h2>
          <div className={cn("mt-5 grid gap-2.5", q.options.length === 4 ? "grid-cols-2" : q.options.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
            {q.options.map((o) => {
              const active = answers[q.key] === o.value;
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => choose(o)}
                  data-active={active}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all",
                    active ? "border-gold bg-gold/10 shadow-[0_0_0_3px_hsl(var(--gold)/0.15)]" : "border-border bg-[hsl(var(--surface-2))] hover:-translate-y-0.5 hover:border-border-strong"
                  )}
                >
                  <span className="block text-[15.5px] font-semibold text-foreground">{o.label}</span>
                  {o.sub && <span className="mt-0.5 block text-[12.5px] text-subtle">{o.sub}</span>}
                </button>
              );
            })}
          </div>

          {picked && (
            <p className="note note-good mt-4 flex gap-2 text-[14px]">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
              {picked.feedback}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <button type="button" onClick={back} disabled={i === 0} className="inline-flex items-center gap-1 text-[14px] text-subtle hover:text-foreground disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" /> 이전
            </button>
            <button
              type="button"
              onClick={next}
              disabled={answers[q.key] === undefined}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[14.5px] font-semibold text-background disabled:opacity-30"
            >
              {i === QUESTIONS.length - 1 ? "결과 보기" : "다음"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {plan && (
        <div className="pt-6">
          <div className="text-center">
            <Trophy className="mx-auto h-10 w-10 text-gold" />
            <p className="kicker mt-3 text-gold">나의 배당 유형 · {plan.typeName}</p>
            <h2 id="quest" className="mt-1 text-[22px] font-bold tracking-[-0.03em] sm:text-[26px]">
              {plan.title}
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
              <p className="text-[13px] font-semibold text-subtle">① 매달 이렇게 나눠 넣어요</p>
              <ul className="mt-2 space-y-2">
                {plan.accounts.map((ac) => (
                  <li key={ac.name}>
                    <Link href={ac.href}>
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[15px] font-semibold text-foreground hover:text-gold">{ac.name}</span>
                        <span className="num text-[15px] font-semibold text-gold">{krwShort(ac.amount)}</span>
                      </span>
                      <span className="block text-[12.5px] text-subtle">{ac.why}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
              <p className="text-[13px] font-semibold text-subtle">② 이런 ETF부터 살펴봐요</p>
              <ul className="mt-2 space-y-2">
                {plan.etfs.map((e) => (
                  <li key={e.href + e.label}>
                    <Link href={e.href}>
                      <span className="block text-[15px] font-semibold text-foreground hover:text-gold">{e.label} →</span>
                      <span className="block text-[12.5px] text-subtle">{e.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
            <p className="text-[13px] font-semibold text-subtle">
              ③ 10년 동안 꾸준히 하면 (세전 · 예시 가정{plan.useNow ? " · 배당은 꺼내 쓴다고 가정" : " · 배당 재투자"})
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[12px] text-subtle">넣은 돈</p>
                <p className="num whitespace-nowrap text-[14px] font-bold text-foreground sm:text-[16px]">{krwShort(plan.invested)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">{plan.useNow ? "주식 평가액" : "모인 돈"}</p>
                <p className="num whitespace-nowrap text-[14px] font-bold text-mint sm:text-[16px]">{krwShort(plan.assets)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">10년차 월 배당</p>
                <p className="num whitespace-nowrap text-[14px] font-bold text-gold sm:text-[16px]">{krwShort(plan.monthlyDiv)}</p>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-subtle">
              {plan.useNow && <>10년 동안 꺼내 쓴 배당은 모두 {krwShort(plan.totalDiv)}이에요. </>}
              배당률 {plan.assume.y}% · 배당 성장 {plan.assume.dg}% · 주가 상승 {plan.assume.pg}%를 가정한 예시예요. 실제 결과는 달라져요.
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
            <p className="text-[13px] font-semibold text-subtle">④ 이것만 기억해요</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
              {plan.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <a href="#missions" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-2.5 text-[14.5px] font-semibold text-gold-foreground">
              첫 달 미션 하러 가기 <ArrowRight className="h-4 w-4" />
            </a>
            <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-[14.5px] text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" /> 다시 하기
            </button>
          </div>
          <p className="mt-4 text-center text-[11.5px] text-subtle">답에 따라 정리한 참고용 예시예요. 특정 상품을 추천하는 게 아니에요.</p>
        </div>
      )}
    </section>
  );
}
