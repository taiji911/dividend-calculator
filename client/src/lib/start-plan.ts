/**
 * '처음 시작하기' 질문과 결과(배당 시작 플랜) 만드는 규칙.
 * 화면(components/start-quest.tsx)과 분리해 두어서 규칙만 따로 점검할 수 있어요.
 * 기준: 2026년 10월 세법 (연금저축 세액공제 연 900만원 한도, ISA 연 2,000만원)
 */
import { simulate } from "./dividend-engine";
import { krwShort } from "./format";

export type Answers = {
  age?: "20" | "30" | "40" | "50" | "60";
  safety?: "yes" | "half" | "no";
  horizon?: "long" | "mid" | "now";
  monthly?: number;
  income?: "low" | "high" | "none";
  lock?: "none" | "maybe";
  region?: "us" | "kr" | "mix";
  style?: "growth" | "high" | "monthly" | "mix";
  nerve?: "buy" | "hold" | "sell" | "unsure";
  manage?: "simple" | "pick";
};
export type Key = keyof Answers;

export interface Option {
  value: string | number;
  label: string;
  sub?: string;
  feedback: string;
}
export interface Question {
  key: Key;
  stage: string;
  q: string;
  hint?: string;
  options: Option[];
  custom?: boolean;
}

export const QUESTIONS: Question[] = [
  {
    key: "age",
    stage: "나",
    q: "지금 나이대가 어떻게 되세요?",
    hint: "나이에 따라 쓸 수 있는 계좌와 시간이 달라져요.",
    options: [
      { value: "20", label: "20대", feedback: "가장 큰 무기인 '시간'을 가졌어요. 작게 시작해도 30년 뒤엔 큰 차이가 나요." },
      { value: "30", label: "30대", feedback: "모으는 힘과 시간이 둘 다 있는 시기예요. 계좌를 잘 나누면 세금도 크게 아껴요." },
      { value: "40", label: "40대", feedback: "노후 준비를 본격적으로 시작하기 좋은 때예요. 연금저축 세액공제를 꼭 챙겨요." },
      { value: "50", label: "50대", feedback: "곧 연금을 받을 수 있는 나이예요. 연금저축은 가입 5년이 지나야 연금으로 받을 수 있어서 지금 만들어 두면 좋아요." },
      { value: "60", label: "60대 이상", feedback: "모으기보다 '꺼내 쓰는 계획'이 중요한 시기예요. 건강보험료까지 함께 챙길게요." },
    ],
  },
  {
    key: "safety",
    stage: "준비",
    q: "비상금은 얼마나 모아 두셨어요?",
    hint: "갑자기 돈이 필요할 때 주식을 팔지 않으려면 생활비 3~6개월 치가 있으면 좋아요.",
    options: [
      { value: "yes", label: "생활비 3개월 치 이상", sub: "든든해요", feedback: "좋아요! 급할 때 주식을 팔 일이 없으니 하락장도 버틸 수 있어요." },
      { value: "half", label: "1~2개월 치 정도", sub: "조금 더 모으는 중", feedback: "시작하기엔 충분해요. 3개월 치가 될 때까지 조금씩 채우면서 투자도 같이 하는 방법을 넣어 둘게요." },
      { value: "no", label: "따로 모아 둔 건 없어요", sub: "이제 시작", feedback: "괜찮아요, 처음엔 다들 그래요. 비상금을 먼저 모으면서 작게 시작하는 방법을 플랜에 넣어 둘게요." },
    ],
  },
  {
    key: "horizon",
    stage: "목표",
    q: "배당은 언제부터 쓰고 싶나요?",
    options: [
      { value: "long", label: "10년 넘게 모을래요", sub: "노후 준비", feedback: "시간이 가장 큰 무기예요. 배당을 재투자하며 오래 키우는 쪽으로 짤게요." },
      { value: "mid", label: "5~10년 뒤에 쓸래요", sub: "결혼·내 집 마련·목돈", feedback: "모으는 동안은 재투자하고, 필요할 때 꺼낼 수 있는 계좌를 중심으로 짤게요." },
      { value: "now", label: "지금부터 받아 쓸래요", sub: "생활비에 보태기", feedback: "받는 대로 꺼내 쓸 수 있어야 하니, 배당이 바로 들어오는 일반계좌로 짤게요." },
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
      { value: 2_000_000, label: "200만원", feedback: "1년 2,400만원. 연금저축·ISA 한도를 거의 다 쓰고 일반계좌까지 활용하는 금액이에요." },
    ],
  },
  {
    key: "income",
    stage: "세금",
    q: "1년 근로소득(총급여)은 어느 정도예요?",
    hint: "연금저축 세액공제율과 ISA 종류가 여기에 따라 달라져요.",
    options: [
      { value: "low", label: "5,500만원 이하", sub: "세액공제 16.5%", feedback: "연금저축에 넣는 돈의 16.5%를 돌려받아요. 총급여 5,000만원 이하면 비과세 한도가 2배인 서민형 ISA도 돼요." },
      { value: "high", label: "5,500만원 초과", sub: "세액공제 13.2%", feedback: "세액공제율은 13.2%지만 소득세율이 높은 만큼 절세 계좌 효과가 커요." },
      { value: "none", label: "근로소득은 없어요", sub: "학생·주부·은퇴 등", feedback: "세액공제는 낸 세금에서 빼 주는 거라 소득이 없으면 혜택이 줄어요. ISA를 먼저 채우는 쪽으로 짤게요." },
    ],
  },
  {
    key: "lock",
    stage: "계좌",
    q: "이 돈, 55세 전에 꺼내 쓸 일이 있을까요?",
    hint: "연금저축은 55세 전에 꺼내면 세금(16.5%)을 내요.",
    options: [
      { value: "none", label: "아니요, 노후용이에요", feedback: "그럼 연금저축을 먼저 채워요. 세액공제에 과세이연까지 받아요." },
      { value: "maybe", label: "쓸 일이 생길 수도 있어요", feedback: "그럼 ISA를 중심으로 짜요. 3년이 지나면 해지해서 찾을 수 있어요." },
    ],
  },
  {
    key: "region",
    stage: "ETF",
    q: "어느 나라 회사의 배당이 더 끌리나요?",
    options: [
      { value: "us", label: "미국 회사", sub: "배당을 오래 늘려 온 회사가 많아요", feedback: "미국은 25년, 50년씩 배당을 늘려 온 회사가 많아요. 국내 상장 ETF로도 원화로 쉽게 살 수 있어요." },
      { value: "kr", label: "한국 회사", sub: "환율 걱정 없이", feedback: "환율 영향이 없고, 국내 주식 ETF는 팔 때 매매차익에 세금이 없어요." },
      { value: "mix", label: "반반 섞을래요", sub: "한쪽에 쏠리지 않게", feedback: "나라를 나누면 한쪽 시장이 부진할 때 덜 흔들려요." },
    ],
  },
  {
    key: "style",
    stage: "ETF",
    q: "어떤 배당이 더 끌리나요?",
    options: [
      { value: "growth", label: "해마다 늘어나는 배당", sub: "지금은 적어도 괜찮아요", feedback: "배당성장형! 배당을 꾸준히 늘려 온 회사에 투자해서, 시간이 갈수록 받는 배당이 커져요." },
      { value: "high", label: "지금 많이 주는 배당", sub: "배당률 4% 이상", feedback: "고배당형! 받는 배당은 크지만, 배당이 늘어나는 속도는 느린 편이에요." },
      { value: "monthly", label: "매달 들어오는 배당", sub: "월급처럼", feedback: "월배당형! 국내 상장 배당 ETF는 대부분 매달 분배해요." },
      { value: "mix", label: "잘 모르겠어요", sub: "골고루 섞어 주세요", feedback: "그럼 배당성장형을 중심에 두고 고배당을 조금 섞는 '균형형'으로 짤게요." },
    ],
  },
  {
    key: "nerve",
    stage: "마음가짐",
    q: "산 ETF가 1년 만에 30% 떨어지면?",
    hint: "정답은 없어요. 솔직하게 골라야 맞는 플랜이 나와요.",
    options: [
      { value: "buy", label: "싸게 살 기회! 더 살래요", feedback: "강심장이에요! 같은 배당을 더 싸게 사는 기회로 보는 게 배당 투자자의 시선이에요." },
      { value: "hold", label: "신경 안 쓰고 그냥 둘래요", feedback: "가장 좋은 대응이에요. 매달 자동으로 사는 것만 멈추지 않으면 돼요." },
      { value: "sell", label: "무서워서 팔 것 같아요", feedback: "솔직해서 좋아요. 처음엔 금액을 작게 시작해서 하락장을 한 번 겪어 보는 게 좋아요." },
      { value: "unsure", label: "아직 겪어 본 적이 없어요", feedback: "대부분 그래요. 처음 1년은 '팔지 않기'만 지켜도 절반은 성공이에요." },
    ],
  },
  {
    key: "manage",
    stage: "스타일",
    q: "어떻게 관리하고 싶나요?",
    options: [
      { value: "simple", label: "ETF로 간단하게 할래요", sub: "자동 매수 걸어 두고 신경 끄기", feedback: "가장 오래 가는 방법이에요. ETF 한두 개면 충분해요." },
      { value: "pick", label: "종목도 직접 골라 보고 싶어요", sub: "공부하는 재미", feedback: "좋아요. 중심은 ETF로 두고, 일부만 직접 고른 배당주로 채우는 방법을 알려 드릴게요." },
    ],
  },
];

/** 상황에 따라 묻지 않는 질문: 지금 바로 쓸 돈이거나 60대 이상이면 '55세 전에 꺼낼지'는 의미가 없어요 */
export const isSkipped = (q: Question, a: Answers) => q.key === "lock" && (a.horizon === "now" || a.age === "60");
export const activeQuestions = (a: Answers) => QUESTIONS.filter((q) => !isSkipped(q, a));

// ── 공유 주소 ?plan=30.yes.long.500000.low.none.us.growth.hold.simple ─────────────────
export function encodeAnswers(a: Answers) {
  return QUESTIONS.map((q) => String(a[q.key] ?? "-")).join(".");
}
export function decodeAnswers(s: string): Answers | null {
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

// ── ETF 후보 (예시 가정: 배당률·배당 성장률·주가 상승률) ─────────────────────────────
interface Pick {
  href: string;
  label: string;
  note: string;
  y: number;
  dg: number;
  pg: number;
}
const E = {
  tiger: { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스", note: "미국 배당성장 100개 기업 · 매달 말일 기준 분배", y: 3.5, dg: 6, pg: 5 },
  ace: { href: "/etf/ace-us-dividend-dowjones", label: "ACE 미국배당다우존스", note: "같은 지수 · 매달 15일 기준 분배 (TIGER와 섞으면 한 달에 두 번)", y: 3.5, dg: 6, pg: 5 },
  sol: { href: "/etf/sol-us-dividend-dowjones", label: "SOL 미국배당다우존스", note: "같은 지수 · 환율이 걱정되면 환헤지 (H) 버전도 있어요", y: 3.5, dg: 6, pg: 5 },
  schd: { href: "/etf/schd", label: "SCHD", note: "일반계좌에서 달러로 · 1년에 4번 배당", y: 3.2, dg: 6, pg: 5 },
  hdv: { href: "/etf/hdv", label: "HDV", note: "일반계좌에서 미국 고배당주에 · 매달 배당", y: 3.1, dg: 4, pg: 3 },
  spyd: { href: "/etf/spyd", label: "SPYD", note: "일반계좌에서 · S&P 500 고배당 80개 · 분기 배당", y: 4.5, dg: 3, pg: 2 },
  plus: { href: "/etf/plus-high-dividend", label: "PLUS 고배당주", note: "국내 고배당 30종목 · 매달 분배 · 팔 때 매매차익 비과세", y: 4.6, dg: 4, pg: 3 },
  cc: { href: "/etf/tiger-us-dividend-target-covered-call-2", label: "TIGER 미국배당다우존스타겟커버드콜2호", note: "분배금을 더 키우고 싶을 때 · 상승은 덜 누려요", y: 10, dg: 0, pg: 0 },
  jepi: { href: "/etf/jepi", label: "JEPI", note: "일반계좌에서 · S&P 500 기반 월배당 커버드콜", y: 8, dg: 0, pg: 1 },
} satisfies Record<string, Pick>;

const ISA_MONTHLY = 1_660_000; // 연 2,000만원
const PENSION_CREDIT_MONTHLY = 750_000; // 세액공제 한도 연 900만원(연금저축+IRP)
const PENSION_MAX_MONTHLY = 1_500_000; // 납입 한도 연 1,800만원
export const won = (n: number) => krwShort(Math.round(n / 1000) * 1000);
const roundMan = (n: number) => Math.round(n / 10_000) * 10_000;

const AGE_LABEL = { "20": "20대", "30": "30대", "40": "40대", "50": "50대", "60": "60대 이상" } as const;

export function buildPlan(a: Answers) {
  const m = a.monthly!;
  const useNow = a.horizon === "now";
  const senior = a.age === "60";
  const credit = a.income === "low" ? 0.165 : a.income === "high" ? 0.132 : 0;

  // ── 1) 계좌 나누기 ──
  let pensionShare = 0;
  let reason: string;
  if (useNow) {
    reason = "배당을 받는 대로 생활비로 쓰려면 바로 꺼낼 수 있는 일반계좌가 맞아요. ISA·연금저축 안의 배당은 바로 꺼낼 수 없어요.";
  } else if (senior) {
    pensionShare = a.horizon === "long" ? 0.5 : 0.3;
    reason =
      "60대 이상은 연금저축을 만든 지 5년이 지나면 바로 연금으로 받을 수 있어요. 일부는 연금저축으로 과세이연을 받고, 나머지는 ISA로 비과세 혜택을 챙겨요.";
  } else if (a.lock === "none") {
    pensionShare = 0.6;
    reason = "노후용이라 연금저축을 먼저 채우고, 일부는 ISA에 둬서 55세 전에도 쓸 수 있는 돈을 남겨요.";
  } else if (a.horizon === "long") {
    pensionShare = 0.3;
    reason = "중간에 쓸 수도 있으니 ISA를 중심으로, 노후용 일부만 연금저축에 넣어요.";
  } else {
    reason = "5~10년 뒤에 쓸 돈이라 3년만 지나면 찾을 수 있는 ISA가 중심이에요.";
  }
  if (!useNow && credit === 0 && pensionShare > 0) {
    pensionShare = pensionShare / 2;
    reason += " 근로소득이 없어 세액공제를 받기 어려우니 연금저축 비중은 줄였어요.";
  }
  const pensionCap = credit > 0 ? PENSION_CREDIT_MONTHLY : PENSION_MAX_MONTHLY;
  const pension = Math.min(roundMan(m * pensionShare), pensionCap);
  const isa = useNow ? 0 : Math.min(m - pension, ISA_MONTHLY);
  const general = m - pension - isa;
  if (!useNow && general > 0) reason += ` ISA 한도(1년 2,000만원)를 넘는 ${won(general)}은 일반계좌로 넣어요.`;

  const isaType = a.income === "low" ? "ISA (서민형 가능)" : "ISA";
  const accounts = [
    {
      name: "연금저축",
      amount: pension,
      why: credit
        ? `넣는 돈의 ${(credit * 100).toFixed(1)}%를 세액공제 · 배당은 계좌 안에서 재투자하고 55세 이후 연금으로 받아요`
        : "배당에 세금을 떼지 않고 굴려요(과세이연) · 55세 이후 연금으로 받아요",
      href: "/learn/pension-savings",
    },
    {
      name: isaType,
      amount: isa,
      why:
        a.income === "low"
          ? "총급여 5,000만원 이하면 서민형으로 이익 400만원까지 비과세 · 3년이 지나면 찾을 수 있어요"
          : "이익 200만원까지 비과세, 넘으면 9.9% · 3년이 지나면 찾을 수 있어요",
      href: "/learn/isa",
    },
    {
      name: "일반계좌",
      amount: general,
      why: useNow ? "배당이 들어오는 대로 꺼내 쓸 수 있어요 · 세금 약 15%를 떼고 입금돼요" : "ISA 한도를 넘는 돈 · 미국 ETF도 직접 살 수 있어요",
      href: useNow ? "/learn/dividend-tax" : "/compare",
    },
  ].filter((x) => x.amount > 0);
  const hasGeneral = general > 0;
  const onlyGeneral = hasGeneral && pension === 0 && isa === 0;

  // ── 2) ETF와 비중 ── 나라 × 배당 스타일 × 계좌
  const region = a.region!;
  const style = a.style!;
  const covered = useNow && a.nerve !== "sell" && a.nerve !== "unsure" && (style === "monthly" || style === "high");
  let core: [Pick, number][] = [];
  const usCore: Pick = style === "high" ? (onlyGeneral ? E.spyd : E.tiger) : E.tiger;
  if (style === "growth") {
    if (region === "us") core = onlyGeneral && a.manage === "pick" ? [[E.schd, 100]] : [[E.tiger, 100]];
    else if (region === "kr") core = [[E.plus, 70], [E.tiger, 30]];
    else core = [[E.tiger, 60], [E.plus, 40]];
  } else if (style === "high") {
    if (region === "us") core = onlyGeneral ? [[E.spyd, 50], [E.hdv, 50]] : hasGeneral ? [[E.tiger, 70], [E.spyd, 30]] : [[E.tiger, 100]];
    else if (region === "kr") core = [[E.plus, 100]];
    else core = [[usCore, 50], [E.plus, 50]];
  } else if (style === "monthly") {
    if (region === "us") core = [[E.tiger, 50], [E.ace, 50]];
    else if (region === "kr") core = [[E.plus, 100]];
    else core = [[E.tiger, 60], [E.plus, 40]];
  } else {
    // 균형형
    if (region === "kr") core = [[E.plus, 70], [E.tiger, 30]];
    else if (region === "us") core = [[E.tiger, 70], [hasGeneral ? E.hdv : E.sol, 30]];
    else core = [[E.tiger, 60], [E.plus, 40]];
  }
  if (covered) {
    // 커버드콜은 전체의 30%까지만
    core = core.map(([p, w]) => [p, Math.round(w * 0.7)] as [Pick, number]);
    core.push([onlyGeneral && region !== "kr" ? E.jepi : E.cc, 30]);
  }
  let satellite: { pct: number; note: string } | null = null;
  if (a.manage === "pick") {
    satellite = { pct: 20, note: "직접 고른 배당주는 전체의 20% 안에서만. 지급 월이 다른 종목을 섞으면 매달 배당을 받을 수 있어요." };
    core = core.map(([p, w]) => [p, Math.round(w * 0.8)] as [Pick, number]);
  }
  // 반올림 오차는 가장 큰 비중에 맞춰서 합계를 딱 맞춰요
  const target = 100 - (satellite?.pct ?? 0);
  const diff = target - core.reduce((sum, [, w]) => sum + w, 0);
  if (diff && core.length) {
    const big = core.reduce((bi, [, w], idx) => (w > core[bi][1] ? idx : bi), 0);
    core[big] = [core[big][0], core[big][1] + diff];
  }
  const etfs = core.map(([p, w]) => ({ href: p.href, label: p.label, note: p.note, pct: w, amount: roundMan((m * w) / 100) }));

  // ── 3) 미리보기 — 고른 ETF 비중대로 섞은 예시 가정 (세전)
  const totalW = core.reduce((s, [, w]) => s + w, 0) || 1;
  const mix = (k: "y" | "dg" | "pg") => Math.round((core.reduce((s, [p, w]) => s + p[k] * w, 0) / totalW) * 10) / 10;
  const assume = { y: mix("y"), dg: mix("dg"), pg: mix("pg") };
  const years = a.horizon === "long" && (a.age === "20" || a.age === "30") ? 20 : 10;
  const sim = simulate({
    initialInvestment: 0,
    monthlyInvestment: m,
    years,
    dividendYield: assume.y,
    dividendGrowthRate: assume.dg,
    priceGrowthRate: assume.pg,
    drip: !useNow,
    account: "custom",
    customTaxRate: 0,
  });
  const last = sim.yearlyData[sim.yearlyData.length - 1];
  const monthlyDiv = last.annualDividends / 12;
  const creditBack = Math.round(Math.min(pension, PENSION_CREDIT_MONTHLY) * 12 * credit);

  // ── 유형 이름 ──
  const typeName = { growth: "배당성장형", high: "고배당형", monthly: "월배당형", mix: "균형형" }[style];
  const titles: Record<string, string> = {
    "growth-long": "천천히 크게 키우는 배당 농부",
    "growth-mid": "차근차근 키우는 배당 정원사",
    "growth-now": "자라는 배당을 지금부터 쓰는 배당 과수원지기",
    "high-long": "두둑한 배당을 쌓아 가는 배당 수확꾼",
    "high-mid": "알찬 열매를 모으는 배당 수확꾼",
    "high-now": "지금 바로 거두는 배당 사냥꾼",
    "monthly-long": "매달 차곡차곡 모으는 배당 저금왕",
    "monthly-mid": "매달 쌓아 가는 배당 적금러",
    "monthly-now": "매달 월급처럼 받는 배당 월급러",
    "mix-long": "골고루 담아 오래 가는 배당 밸런서",
    "mix-mid": "흔들림 없는 배당 밸런서",
    "mix-now": "골고루 받아 쓰는 배당 밸런서",
  };
  const title = titles[`${style}-${a.horizon}`];

  // ── 나를 나타내는 태그 ──
  const tags = [
    AGE_LABEL[a.age!],
    { us: "미국 배당", kr: "한국 배당", mix: "한·미 반반" }[region],
    useNow ? "지금부터 꺼내 쓰기" : a.horizon === "long" ? "10년+ 장기" : "5~10년 목표",
    a.income === "low" ? "세액공제 16.5%" : a.income === "high" ? "세액공제 13.2%" : "근로소득 없음",
    { buy: "하락장엔 매수", hold: "하락장엔 버티기", sell: "안정 추구", unsure: "첫 하락장 대비" }[a.nerve!],
    a.manage === "pick" ? "종목도 직접" : "ETF로 간단히",
  ];

  // ── 4) 조언 ──
  const tips: string[] = [];
  if (a.safety === "no")
    tips.push(`처음 3~6개월은 매달 ${won(m / 2)}을 비상금 통장에 먼저 넣고, 나머지 ${won(m - m / 2)}만 투자해요. 비상금이 다 모이면 전액 투자로 바꿔요.`);
  if (a.safety === "half") tips.push(`비상금이 생활비 3개월 치가 될 때까지 매달 ${won(m * 0.2)}만 비상금으로 돌리고, 나머지로 투자를 시작해요.`);
  if (a.nerve === "sell") tips.push("처음 1년은 계획한 금액의 절반만 투자해서 오르내림을 직접 겪어 보세요. 익숙해지면 늘려도 늦지 않아요.");
  if (a.nerve === "unsure") tips.push("처음 하락장이 오면 앱을 덜 보는 게 도움이 돼요. 자동 매수는 그대로 두고, 1년 뒤에 성적표를 확인해요.");
  if (a.nerve === "buy") tips.push("떨어질 때 더 사고 싶다면, 비상금과 별도로 '추가 매수용' 돈을 조금 모아 두면 좋아요.");
  if (a.age === "20" || a.age === "30") tips.push("지금은 배당보다 '모으는 속도'가 더 중요해요. 연봉이 오를 때마다 매달 넣는 금액도 같이 올려요.");
  if (a.age === "50" && pension > 0) tips.push("연금저축은 가입 5년이 지나야 연금으로 받을 수 있어요. 금액이 작더라도 계좌는 지금 만들어 두세요.");
  if (senior) tips.push("건강보험 피부양자라면 금융소득을 포함한 소득이 1년 2,000만원을 넘지 않게 관리해요. ISA·연금저축 안의 배당은 이 계산에 들어가지 않아요.");
  if (credit > 0 && pension > 0) tips.push(`연금저축에 1년 ${won(pension * 12)}을 넣으면 연말정산 때 약 ${won(creditBack)}을 돌려받아요. 이 돈도 다시 투자하면 효과가 더 커져요.`);
  if (useNow) {
    tips.push("배당을 쓰지 않고 모아 갈 돈이 따로 있다면, 그 돈은 ISA에 넣어 세금을 줄이세요.");
    tips.push("일반계좌 배당이 이자와 합쳐 1년 1,000만원을 넘으면 건강보험료, 2,000만원을 넘으면 종합과세를 확인해요.");
  } else {
    if (style === "monthly") tips.push("모으는 동안에는 매달 받는 배당을 계좌 안에서 다시 사고, 쓸 때가 되면 월급처럼 꺼내 써요.");
    tips.push("받은 배당은 꼭 다시 투자하세요. 처음엔 차이가 작아도 10년이 지나면 크게 벌어져요.");
  }
  if (region === "kr" && style === "growth")
    tips.push("국내에는 배당성장 ETF가 아직 많지 않아서 국내 고배당 ETF를 중심에 두고, 배당이 꾸준히 늘어나는 미국 배당 ETF를 30% 섞었어요.");
  else if (region === "kr" || (region === "mix" && style !== "growth"))
    tips.push("국내 고배당주는 은행·증권 같은 금융주 비중이 커요. 한 업종에 쏠리지 않게 미국 배당 ETF와 섞는 것도 생각해 보세요.");
  tips.push(
    a.income === "none"
      ? "생활비가 들어오는 날 다음 날처럼, 매달 같은 날에 자동 매수를 걸어 두면 신경 쓸 일이 거의 없어요."
      : "월급날 다음 날처럼 매달 같은 날에 자동 매수를 걸어 두면 신경 쓸 일이 거의 없어요."
  );

  return {
    accounts,
    reason,
    etfs,
    satellite,
    typeName,
    title,
    tags,
    assume,
    years,
    useNow,
    monthly: m,
    creditBack,
    totalDiv: sim.totalDividends,
    invested: last.totalInvested,
    assets: sim.finalAssets,
    monthlyDiv,
    monthlyDivAfter: monthlyDiv * (useNow ? 0.85 : 1),
    tips: tips.slice(0, 6),
  };
}
export type Plan = ReturnType<typeof buildPlan>;
