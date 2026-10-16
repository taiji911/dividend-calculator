/**
 * '처음 시작하기' 게임형 질문 — 답을 고르면 나만의 배당 시작 플랜(계좌 나누기·ETF·10년 미리보기·조언)을 만들어 줘요.
 *  - 첫 화면(미리 만든 HTML)은 시작 화면만 그리고, 나머지는 누를 때 화면에서 그려요.
 *  - 결과는 이 브라우저에 저장하고(다시 보기), 주소(?plan=)로 공유할 수 있어요.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Leaf, Lightbulb, Link2, RotateCcw, Sprout, TreeDeciduous, Trees, Trophy } from "lucide-react";
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
type Key = keyof Answers;

interface Option {
  value: string | number;
  label: string;
  sub?: string;
  feedback: string;
}
interface Question {
  key: Key;
  stage: string;
  q: string;
  hint?: string;
  options: Option[];
  /** 직접 입력 칸 (월 투자액) */
  custom?: boolean;
}

const QUESTIONS: Question[] = [
  {
    key: "safety",
    stage: "준비",
    q: "생활비 3~6개월 치 비상금, 따로 있나요?",
    hint: "투자는 몇 년 동안 쓰지 않을 돈으로 해야 오래 버틸 수 있어요.",
    options: [
      { value: "yes", label: "네, 있어요", feedback: "좋아요! 급할 때 주식을 팔 일이 없으니 하락장도 버틸 수 있어요." },
      { value: "no", label: "아직 없어요", feedback: "괜찮아요. 비상금을 모으면서 함께 시작하는 방법을 플랜에 넣어 둘게요." },
    ],
  },
  {
    key: "horizon",
    stage: "목표",
    q: "배당은 언제부터 쓰고 싶나요?",
    options: [
      { value: "long", label: "10년 넘게 뒤", sub: "노후 준비", feedback: "시간이 가장 큰 무기예요. 배당을 재투자하며 오래 키우는 쪽으로 짤게요." },
      { value: "mid", label: "5~10년 뒤", sub: "중간 목표", feedback: "모으는 동안은 재투자하고, 필요할 때 꺼낼 수 있는 계좌를 중심으로 짤게요." },
      { value: "now", label: "지금부터 바로", sub: "생활비에 보태기", feedback: "받는 대로 꺼내 쓸 수 있어야 하니, 배당이 바로 들어오는 일반계좌로 짤게요." },
    ],
  },
  {
    key: "monthly",
    stage: "목표",
    q: "한 달에 얼마씩 넣을 수 있나요?",
    hint: "무리 없이 매달 꾸준히 넣을 수 있는 금액이면 충분해요.",
    custom: true,
    options: [
      { value: 100_000, label: "10만원", feedback: "작아도 꾸준함이 이겨요. 10년이면 원금만 1,200만원이에요." },
      { value: 300_000, label: "30만원", feedback: "1년 360만원. 적립식으로 시작하기 딱 좋은 금액이에요." },
      { value: 500_000, label: "50만원", feedback: "1년 600만원이면 연금저축 세액공제 한도(600만원)를 꽉 채울 수 있어요." },
      { value: 1_000_000, label: "100만원", feedback: "1년 1,200만원. 계좌를 나눠 쓰면 세금을 꽤 아낄 수 있어요." },
    ],
  },
  {
    key: "lock",
    stage: "계좌",
    q: "이 돈, 55세 전에 꺼내 쓸 일이 있을까요?",
    hint: "연금저축은 55세 전에 꺼내면 세금(16.5%)을 내요.",
    options: [
      { value: "none", label: "아니요, 노후용이에요", feedback: "그럼 연금저축을 먼저 채워요. 넣는 돈의 13.2~16.5%를 돌려받아요." },
      { value: "maybe", label: "쓸 수도 있어요", feedback: "그럼 ISA를 중심으로 짜요. 3년이 지나면 해지해서 찾을 수 있어요." },
    ],
  },
  {
    key: "style",
    stage: "ETF",
    q: "어떤 배당이 더 끌리나요?",
    options: [
      { value: "growth", label: "해마다 늘어나는 배당", sub: "지금은 적어도 괜찮아요", feedback: "배당성장형! 미국 배당성장 100개 기업(SCHD와 같은 지수)에 투자하는 ETF가 대표적이에요." },
      { value: "high", label: "지금 많이 주는 배당", sub: "배당률 4% 이상", feedback: "고배당형! 받는 배당은 크지만, 배당이 늘어나는 속도는 느린 편이에요." },
      { value: "monthly", label: "매달 들어오는 배당", sub: "월급처럼", feedback: "월배당형! 국내 상장 미국 배당 ETF는 대부분 매달 분배해요." },
    ],
  },
  {
    key: "nerve",
    stage: "마음가짐",
    q: "산 ETF가 1년 만에 30% 떨어지면?",
    hint: "정답은 없어요. 솔직하게 골라야 맞는 플랜이 나와요.",
    options: [
      { value: "buy", label: "싸졌으니 더 산다", feedback: "강심장이에요! 같은 배당을 더 싸게 사는 기회로 보는 게 배당 투자자의 시선이에요." },
      { value: "hold", label: "그냥 둔다", feedback: "가장 좋은 대응이에요. 매달 자동으로 사는 것만 멈추지 않으면 돼요." },
      { value: "sell", label: "무서워서 팔 것 같다", feedback: "솔직해서 좋아요. 처음엔 금액을 작게 시작해서 하락장을 한 번 겪어 보는 게 좋아요." },
    ],
  },
];

const LEVELS = [
  { name: "배당 씨앗", Icon: Leaf },
  { name: "배당 새싹", Icon: Sprout },
  { name: "배당 나무", Icon: TreeDeciduous },
  { name: "배당 숲", Icon: Trees },
];

const ISA_MONTHLY = 1_660_000; // 연 2,000만원
const PENSION_MONTHLY = 750_000; // 연금저축+IRP 세액공제 한도 연 900만원
const STORE_KEY = "dc.start.plan.v1";
const won = (n: number) => krwShort(Math.round(n / 1000) * 1000);

/** '지금부터 바로' 쓸 돈이면 '55세 전에 꺼낼지'는 묻지 않아요 */
const skipped = (q: Question, a: Answers) => q.key === "lock" && a.horizon === "now";
const activeQuestions = (a: Answers) => QUESTIONS.filter((q) => !skipped(q, a));

// ── 공유 주소: ?plan=yes.now.500000.none.monthly.hold ──────────────────────────
function encode(a: Answers) {
  return QUESTIONS.map((q) => String(a[q.key] ?? "-")).join(".");
}
function decode(s: string): Answers | null {
  const parts = s.split(".");
  if (parts.length !== QUESTIONS.length) return null;
  const a: Record<string, string | number> = {};
  for (let k = 0; k < QUESTIONS.length; k++) {
    const q = QUESTIONS[k];
    const v = parts[k];
    if (v === "-") continue;
    if (q.key === "monthly") {
      const n = Number(v);
      if (!isFinite(n) || n < 10_000 || n > 50_000_000) return null;
      a.monthly = n;
    } else if (q.options.some((o) => o.value === v)) a[q.key] = v;
    else return null;
  }
  const ans = a as Answers;
  return activeQuestions(ans).every((q) => ans[q.key] !== undefined) ? ans : null;
}

function buildPlan(a: Answers) {
  const m = a.monthly!;
  const useNow = a.horizon === "now";

  // 1) 계좌 나누기
  //  - 지금 쓸 돈: ISA·연금저축 안의 배당은 바로 꺼낼 수 없어서(ISA는 원금만 중도 인출) 일반계좌
  //  - 노후용: 연금저축 60% + ISA 40% (세액공제를 받으면서도 중간에 쓸 돈을 남겨 둬요)
  //  - 10년 넘게 뒤지만 55세 전에 쓸 수도: 연금저축 30% + ISA 70%
  //  - 5~10년 뒤: ISA 중심
  let pension = 0;
  let reason = "";
  if (useNow) reason = "배당을 받는 대로 생활비로 쓰려면 바로 꺼낼 수 있는 일반계좌가 맞아요.";
  else if (a.lock === "none") {
    pension = Math.min(Math.round((m * 0.6) / 10_000) * 10_000, PENSION_MONTHLY);
    reason = "연금저축으로 세액공제를 받고, 일부는 ISA에 둬서 55세 전에도 쓸 수 있는 돈을 남겨요.";
  } else if (a.horizon === "long") {
    pension = Math.min(Math.round((m * 0.3) / 10_000) * 10_000, PENSION_MONTHLY);
    reason = "중간에 쓸 수도 있으니 ISA를 중심으로, 노후용 일부만 연금저축에 넣어요.";
  } else reason = "5~10년 뒤에 쓸 돈이라 3년만 지나면 찾을 수 있는 ISA가 중심이에요.";
  const isa = useNow ? 0 : Math.min(m - pension, ISA_MONTHLY);
  const general = m - pension - isa;
  if (!useNow && general > 0) reason += ` ISA 한도(1년 2,000만원)를 넘는 ${won(general)}은 일반계좌로 넣어요.`;

  const accounts = [
    { name: "연금저축", amount: pension, why: "세액공제 13.2~16.5% · 배당은 계좌 안에서 재투자하고 55세 이후 연금으로 받아요", href: "/learn/pension-savings" },
    { name: "ISA", amount: isa, why: "이익 200만원까지 비과세 · 배당은 계좌 안에 쌓이고 3년이 지나면 찾을 수 있어요", href: "/learn/isa" },
    {
      name: "일반계좌",
      amount: general,
      why: useNow ? "배당이 들어오는 대로 꺼내 쓸 수 있어요 · 세금 약 15%를 떼고 입금돼요" : "ISA 한도를 넘는 돈 · 미국 ETF도 직접 살 수 있어요",
      href: useNow ? "/learn/dividend-tax" : "/compare",
    },
  ].filter((x) => x.amount > 0);
  const hasGeneral = general > 0;

  // 2) ETF — 고른 배당 스타일 + 계좌에 맞춰서
  const style = a.style!;
  const addCovered = useNow && style !== "growth" && a.nerve !== "sell";
  const etfs: { href: string; label: string; note: string }[] = [];
  if (style === "growth") {
    etfs.push({ href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "SCHD와 같은 지수 · 국내 상장이라 어느 계좌든 OK · 매달 분배" });
    etfs.push(
      hasGeneral
        ? { href: "/etf/schd", label: "SCHD", note: "일반계좌에서 달러로 산다면 · 1년에 4번 배당" }
        : { href: "/etf/sol-us-dividend-dowjones", label: "SOL 미국배당다우존스", note: "같은 지수 · 환율 변동이 싫다면 환헤지 (H) 버전도 있어요" }
    );
  } else if (style === "high") {
    etfs.push({ href: "/etf/plus-high-dividend", label: "PLUS 고배당주", note: "국내 고배당 30종목 · 매달 분배 · 매매차익 비과세" });
    etfs.push(
      hasGeneral
        ? { href: "/etf/hdv", label: "HDV", note: "일반계좌에서 미국 고배당주에 · 매달 배당" }
        : { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "미국 배당주로 나눠 담기 · 매달 분배" }
    );
  } else {
    etfs.push({ href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "매달 말일 기준 분배" });
    etfs.push({ href: "/etf/ace-us-dividend-dowjones", label: "ACE 미국배당다우존스", note: "매달 15일 기준 분배 · TIGER와 섞으면 한 달에 두 번" });
  }
  if (addCovered)
    etfs.push({ href: "/etf/tiger-us-dividend-target-covered-call-2", label: "TIGER 미국배당다우존스타겟커버드콜2호", note: "분배금을 더 키우고 싶다면 전체의 30% 이내로만" });

  // 3) 10년 미리보기 — 고른 ETF 성격에 맞춘 예시 가정 (세전)
  const assume =
    style === "high" ? { y: 4.0, dg: 3, pg: 3 } : addCovered ? { y: 5.5, dg: 4, pg: 4 } : { y: 3.5, dg: 6, pg: 5 };
  const sim = simulate({
    initialInvestment: 0,
    monthlyInvestment: m,
    years: 10,
    dividendYield: assume.y,
    dividendGrowthRate: assume.dg,
    priceGrowthRate: assume.pg,
    drip: !useNow,
    account: "custom",
    customTaxRate: 0,
  });
  const last = sim.yearlyData[sim.yearlyData.length - 1];
  const monthlyDiv = last.annualDividends / 12;

  const typeName = style === "growth" ? "배당성장형" : style === "high" ? "고배당형" : "월배당형";
  const title = useNow
    ? style === "growth"
      ? "자라는 배당을 지금부터 쓰는 배당 정원사"
      : "매달 월급처럼 받는 배당 월급러"
    : style === "growth"
      ? "천천히 크게 키우는 배당 농부"
      : style === "high"
        ? "두둑하게 거두는 배당 수확꾼"
        : "매달 차곡차곡 모으는 배당 저금왕";

  // 4) 조언 — 답에 맞춰서
  const tips: string[] = [];
  if (a.safety === "no")
    tips.push(`처음 3~6개월은 매달 ${won(m / 2)}을 비상금 통장에 먼저 넣고, 나머지 ${won(m - m / 2)}만 투자해요. 비상금이 다 모이면 전액 투자로 바꿔요.`);
  if (a.nerve === "sell") tips.push("처음 1년은 계획한 금액의 절반만 투자해서 오르내림을 직접 겪어 보세요. 익숙해지면 늘려도 늦지 않아요.");
  if (a.nerve === "buy") tips.push("떨어질 때 더 사고 싶다면, 비상금과 별도로 '추가 매수용' 돈을 조금 모아 두면 좋아요.");
  if (useNow) {
    tips.push("배당을 쓰지 않고 모아 갈 돈이 따로 있다면, 그 돈은 ISA에 넣어 세금을 줄이세요.");
    tips.push("일반계좌 배당이 이자와 합쳐 1년 1,000만원을 넘으면 건강보험료, 2,000만원을 넘으면 종합과세를 확인해요.");
  } else {
    if (style === "monthly") tips.push("모으는 동안에는 매달 받는 배당을 계좌 안에서 다시 사고, 나중에 쓸 때가 되면 월급처럼 꺼내 써요.");
    tips.push("받은 배당은 꼭 다시 투자하세요. 처음엔 차이가 작아도 10년이 지나면 크게 벌어져요.");
  }
  tips.push("매달 월급날 다음 날처럼 같은 날에 자동 매수를 걸어 두면 신경 쓸 일이 거의 없어요.");

  return {
    accounts,
    reason,
    etfs,
    typeName,
    title,
    assume,
    useNow,
    monthly: m,
    totalDiv: sim.totalDividends,
    invested: last.totalInvested,
    assets: sim.finalAssets,
    monthlyDiv,
    monthlyDivAfter: monthlyDiv * (useNow ? 0.85 : 1),
    tips,
  };
}

/** 결과 카드 제목: 번호 배지 + 제목 */
const CardTitle = ({ n, children, right }: { n: number; children: React.ReactNode; right?: React.ReactNode }) => (
  <p className="flex items-center justify-between gap-2 text-[13px] font-semibold text-muted-foreground">
    <span className="flex items-center gap-2">
      <span className="num flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-[11px] font-bold text-gold">{n}</span>
      {children}
    </span>
    {right}
  </p>
);

export default function StartQuest() {
  const [i, setI] = useState(-1); // -1: 시작 화면, QUESTIONS.length: 결과
  const [answers, setAnswers] = useState<Answers>({});
  const [customOpen, setCustomOpen] = useState(false);
  const [customStr, setCustomStr] = useState("");
  const [saved, setSaved] = useState<Answers | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // 공유 주소(?plan=)나 저장된 결과 불러오기 — 화면이 뜬 뒤에 해야 미리 만든 HTML과 어긋나지 않아요
  useEffect(() => {
    const fromUrl = decode(new URLSearchParams(window.location.search).get("plan") || "");
    if (fromUrl) {
      setAnswers(fromUrl);
      setI(QUESTIONS.length);
      return;
    }
    try {
      const s = decode(localStorage.getItem(STORE_KEY) || "");
      if (s) setSaved(s);
    } catch {
      /* 저장소를 못 쓰면 무시 */
    }
  }, []);

  // 질문이 바뀌면, 상자가 화면 위로 지나가 있을 때만 상자 맨 위로 올려요
  useEffect(() => {
    if (i < 0 || !ref.current) return;
    if (ref.current.getBoundingClientRect().top < 64) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i]);

  const done = i >= QUESTIONS.length;
  const qs = activeQuestions(answers);
  const q = i >= 0 && !done ? QUESTIONS[i] : null;
  const qNo = q ? qs.indexOf(q) + 1 : 0;
  const answeredCount = qs.filter((x) => answers[x.key] !== undefined).length;
  const levelIdx = done ? 3 : Math.min(2, Math.floor((answeredCount / qs.length) * 3));
  const Level = LEVELS[levelIdx];
  const plan = useMemo(() => (done ? buildPlan(answers) : null), [done, answers]);

  // 결과가 나오면 이 브라우저에 저장
  useEffect(() => {
    if (!plan) return;
    try {
      localStorage.setItem(STORE_KEY, encode(answers));
    } catch {
      /* 무시 */
    }
  }, [plan, answers]);

  const current = q ? answers[q.key] : undefined;
  const selected = q?.options.find((o) => o.value === current);
  const customValue = q?.custom && current !== undefined && !selected ? Number(current) : null;
  const feedback =
    selected?.feedback ??
    (customValue ? `1년이면 ${won(customValue * 12)}을 모아요. 금액보다 매달 빠지지 않고 넣는 게 더 중요해요.` : null);

  const choose = (o: Option) => {
    if (!q) return;
    setCustomOpen(false);
    setAnswers((p) => ({ ...p, [q.key]: o.value }));
  };
  const applyCustom = (str: string) => {
    setCustomStr(str);
    const man = parseInt(str.replace(/[^0-9]/g, ""), 10);
    if (!q) return;
    setAnswers((p) => {
      const next = { ...p };
      if (man >= 1 && man <= 5000) next.monthly = man * 10_000;
      else delete next.monthly;
      return next;
    });
  };
  const go = (dir: 1 | -1) => {
    setCustomOpen(false);
    setCopied(false);
    setI((x) => {
      let n = x + dir;
      while (n >= 0 && n < QUESTIONS.length && skipped(QUESTIONS[n], answers)) n += dir;
      return Math.max(0, n);
    });
  };
  const start = (from?: Answers) => {
    if (from) {
      setAnswers(from);
      setI(QUESTIONS.length);
    } else {
      setAnswers({});
      setCustomStr("");
      setI(0);
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/start?plan=${encode(answers)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("이 주소를 복사해 주세요", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const isLast = q ? qs.indexOf(q) === qs.length - 1 : false;

  return (
    <section ref={ref} className="panel-hero scroll-mt-20 overflow-hidden p-5 sm:p-7" aria-labelledby="quest">
      {/* 레벨 · 진행 막대 */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[12.5px] font-semibold text-gold" aria-live="polite">
          <Level.Icon className="h-4 w-4" aria-hidden="true" /> Lv.{levelIdx + 1} {Level.name}
        </span>
        <span className="num text-[12.5px] text-subtle">{i === -1 ? "1분 소요" : `${done ? qs.length : qNo} / ${qs.length}`}</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--surface-3))]"
        role="progressbar"
        aria-label="진행도"
        aria-valuemin={0}
        aria-valuemax={qs.length}
        aria-valuenow={done ? qs.length : answeredCount}
      >
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${((done ? qs.length : answeredCount) / qs.length) * 100}%` }} />
      </div>

      {/* 시작 화면 */}
      {i === -1 && (
        <div className="py-6 text-center sm:py-8">
          <h2 id="quest" className="text-[22px] font-bold leading-snug tracking-[-0.03em] sm:text-[26px]">
            1분 질문으로 만드는
            <br />
            <span className="text-gold">나만의 배당 시작 플랜</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
            답을 고를 때마다 레벨이 올라가요. 끝까지 가면 어느 계좌에 얼마씩, 어떤 ETF로 시작하면 좋을지 정리해 드려요.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => start()}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[16px] font-bold text-gold-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              시작하기 <ArrowRight className="h-5 w-5" />
            </button>
            {saved && (
              <button type="button" onClick={() => start(saved)} className="text-[13.5px] text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground">
                지난번 결과 다시 보기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 질문 */}
      {q && (
        <div className="pt-6">
          <p className="kicker text-gold">
            Q{qNo} · {q.stage}
          </p>
          <h2 id="quest" className="mt-1 text-[20px] font-bold leading-snug tracking-[-0.02em] sm:text-[23px]">
            {q.q}
          </h2>
          {q.hint && <p className="mt-1.5 text-[13px] text-subtle">{q.hint}</p>}

          <div
            role="radiogroup"
            aria-labelledby="quest"
            className={cn("mt-5 grid gap-2.5", q.options.length >= 4 ? "grid-cols-2" : q.options.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}
          >
            {q.options.map((o) => {
              const active = current === o.value && !customOpen;
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(o)}
                  className={cn(
                    "relative rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.99]",
                    active ? "border-gold bg-gold/10 shadow-[0_0_0_3px_hsl(var(--gold)/0.15)]" : "border-border bg-[hsl(var(--surface-2))] hover:-translate-y-0.5 hover:border-border-strong"
                  )}
                >
                  {active && <Check className="absolute right-3 top-3 h-4 w-4 text-gold" aria-hidden="true" />}
                  <span className="block pr-5 text-[15.5px] font-semibold text-foreground">{o.label}</span>
                  {o.sub && <span className="mt-0.5 block text-[12.5px] text-subtle">{o.sub}</span>}
                </button>
              );
            })}
            {q.custom && (
              <div
                className={cn(
                  "col-span-2 rounded-2xl border px-4 py-3 transition-colors",
                  customOpen || customValue ? "border-gold bg-gold/10" : "border-dashed border-border-strong bg-transparent"
                )}
              >
                {customOpen || customValue ? (
                  <label className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                    <span className="shrink-0">직접 입력</span>
                    <span className="relative flex-1">
                      <input
                        autoFocus
                        inputMode="numeric"
                        value={customStr}
                        onChange={(e) => applyCustom(e.target.value)}
                        placeholder="예: 70"
                        className="w-full rounded-lg border border-border bg-[hsl(var(--surface-2))] py-2 pl-3 pr-14 text-right text-[16px] text-foreground outline-none focus:border-gold"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-subtle">만원</span>
                    </span>
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomOpen(true);
                      if (customStr) applyCustom(customStr);
                      else setAnswers((p) => ({ ...p, monthly: undefined }));
                    }}
                    className="w-full text-left text-[14.5px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    + 다른 금액 직접 입력
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 min-h-[52px]" aria-live="polite">
            {feedback && (
              <p className="note note-good flex gap-2 text-[14px] leading-relaxed">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                {feedback}
              </p>
            )}
            {q.custom && customOpen && !customValue && customStr && <p className="text-[13px] text-coral">1만원부터 5,000만원까지 넣을 수 있어요.</p>}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn("inline-flex items-center gap-1 rounded-full px-2 py-2 text-[14px] text-subtle hover:text-foreground", qNo === 1 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> 이전
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={current === undefined}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-6 py-3 text-[15px] font-bold text-gold-foreground transition-opacity disabled:cursor-not-allowed disabled:bg-[hsl(var(--surface-3))] disabled:text-subtle"
            >
              {isLast ? "결과 보기" : "다음"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 결과 */}
      {plan && (
        <div className="pt-6">
          <div className="text-center">
            <Trophy className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
            <p className="kicker mt-3 text-gold">나의 배당 유형 · {plan.typeName}</p>
            <h2 id="quest" className="mt-1 text-[21px] font-bold leading-snug tracking-[-0.03em] sm:text-[26px]">
              {plan.title}
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
              <CardTitle n={1} right={<span className="num text-foreground">매달 총 {won(plan.monthly)}</span>}>
                계좌 나누기
              </CardTitle>
              <ul className="mt-3 space-y-3">
                {plan.accounts.map((ac) => (
                  <li key={ac.name}>
                    <Link href={ac.href}>
                      <span className="group block">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-[15px] font-semibold text-foreground group-hover:text-gold">{ac.name} →</span>
                          <span className="num text-[15px] font-semibold text-gold">{won(ac.amount)}</span>
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">{ac.why}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border pt-3 text-[12.5px] leading-relaxed text-muted-foreground">{plan.reason}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
              <CardTitle n={2}>이런 ETF부터 살펴봐요</CardTitle>
              <ul className="mt-3 space-y-3">
                {plan.etfs.map((e) => (
                  <li key={e.href + e.label}>
                    <Link href={e.href}>
                      <span className="group block">
                        <span className="block text-[15px] font-semibold leading-snug text-foreground group-hover:text-gold">{e.label} →</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">{e.note}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
            <CardTitle n={3}>10년 동안 꾸준히 넣으면</CardTitle>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[12px] text-subtle">넣은 돈</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-foreground sm:text-[17px]">{won(plan.invested)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">{plan.useNow ? "주식 평가액" : "모인 돈"}</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-mint sm:text-[17px]">{won(plan.assets)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">{plan.useNow ? "월 배당(세후)" : "10년차 월 배당"}</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-gold sm:text-[17px]">{won(plan.useNow ? plan.monthlyDivAfter : plan.monthlyDiv)}</p>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-subtle">
              {plan.useNow ? (
                <>
                  배당을 받는 대로 꺼내 쓴다고 보고 계산했어요. 10년 동안 받은 배당은 세전 {won(plan.totalDiv)}, 월 배당은 세금 약 15%를 뗀 금액이에요.{" "}
                </>
              ) : (
                <>배당을 모두 재투자한다고 보고 계산했어요. 계좌 안에서는 세금 없이 굴러가요(꺼낼 때 과세). </>
              )}
              배당률 {plan.assume.y}%, 배당 성장 {plan.assume.dg}%, 주가 상승 {plan.assume.pg}%를 가정한 예시라 실제 결과는 달라져요.{" "}
              <Link href={`/?y=${plan.assume.y}&dg=${plan.assume.dg}&pg=${plan.assume.pg}&from=${encodeURIComponent("나의 배당 플랜")}`}>
                <span className="text-gold underline underline-offset-2">내 숫자로 계산해 보기</span>
              </Link>
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
            <CardTitle n={4}>이것만 기억해요</CardTitle>
            <ul className="mt-2 space-y-2">
              {plan.tips.map((t) => (
                <li key={t} className="flex gap-2 text-[14px] leading-relaxed text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              href="#missions"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-5 py-3 text-[14.5px] font-bold text-gold-foreground sm:col-span-1"
            >
              첫 달 미션 하러 가기 <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-3 text-[14.5px] text-foreground hover:border-border-strong"
            >
              {copied ? <Check className="h-4 w-4 text-mint" /> : <Link2 className="h-4 w-4" />} {copied ? "링크를 복사했어요" : "결과 링크 복사"}
            </button>
            <button
              type="button"
              onClick={() => start()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-3 text-[14.5px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" /> 처음부터 다시
            </button>
          </div>
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-subtle">답에 따라 정리한 참고용 예시예요. 특정 상품을 사라는 추천이 아니며, 투자 판단과 책임은 본인에게 있어요.</p>
        </div>
      )}
    </section>
  );
}
