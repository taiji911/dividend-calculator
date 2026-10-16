/**
 * '처음 시작하기' 게임형 질문 화면. 질문과 결과 규칙은 lib/start-plan.ts 에 있어요.
 *  - 첫 화면(미리 만든 HTML)은 시작 화면만 그리고, 나머지는 누를 때 화면에서 그려요.
 *  - 결과는 이 브라우저에 저장하고(다시 보기), 주소(?plan=)로 공유할 수 있어요.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Leaf, Lightbulb, Link2, RotateCcw, Sprout, TreeDeciduous, Trees, Trophy } from "lucide-react";
import { QUESTIONS, activeQuestions, buildPlan, decodeAnswers, encodeAnswers, isSkipped, won, type Answers, type Option } from "@/lib/start-plan";
import { cn } from "@/lib/utils";

const LEVELS = [
  { name: "배당 씨앗", Icon: Leaf },
  { name: "배당 새싹", Icon: Sprout },
  { name: "배당 나무", Icon: TreeDeciduous },
  { name: "배당 숲", Icon: Trees },
];
const STORE_KEY = "dc.start.plan.v2";

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
    const fromUrl = decodeAnswers(new URLSearchParams(window.location.search).get("plan") || "");
    if (fromUrl) {
      setAnswers(fromUrl);
      setI(QUESTIONS.length);
      return;
    }
    try {
      const s = decodeAnswers(localStorage.getItem(STORE_KEY) || "");
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
      localStorage.setItem(STORE_KEY, encodeAnswers(answers));
    } catch {
      /* 무시 */
    }
  }, [plan, answers]);

  const current = q ? answers[q.key] : undefined;
  const selected = q?.options.find((o) => o.value === current);
  const customValue = q?.custom && current !== undefined && !selected ? Number(current) : null;
  const feedback =
    selected?.feedback ?? (customValue ? `1년이면 ${won(customValue * 12)}을 모아요. 금액보다 매달 빠지지 않고 넣는 게 더 중요해요.` : null);

  const choose = (o: Option) => {
    if (!q) return;
    setCustomOpen(false);
    setAnswers((p) => ({ ...p, [q.key]: o.value }));
  };
  const applyCustom = (str: string) => {
    setCustomStr(str);
    const man = parseInt(str.replace(/[^0-9]/g, ""), 10);
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
      while (n >= 0 && n < QUESTIONS.length && isSkipped(QUESTIONS[n], answers)) n += dir;
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
    const url = `${window.location.origin}/start?plan=${encodeAnswers(answers)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("이 주소를 복사해 주세요", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const isLast = q ? qs.indexOf(q) === qs.length - 1 : false;
  const gridCols = (n: number) => (n === 2 ? "grid-cols-1 sm:grid-cols-2" : n === 3 ? "grid-cols-1 sm:grid-cols-3" : n === 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3");

  return (
    <section ref={ref} className="panel-hero scroll-mt-20 overflow-hidden p-5 sm:p-7" aria-labelledby="quest">
      {/* 레벨 · 진행 막대 */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[12.5px] font-semibold text-gold" aria-live="polite">
          <Level.Icon className="h-4 w-4" aria-hidden="true" /> Lv.{levelIdx + 1} {Level.name}
        </span>
        <span className="num text-[12.5px] text-subtle">{i === -1 ? "약 1분" : `${done ? qs.length : qNo} / ${qs.length}`}</span>
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
            나이, 목표, 소득, 성향에 맞춰 어느 계좌에 얼마씩, 어떤 ETF를 몇 %씩 담을지 정리해 드려요. 답을 고를 때마다 레벨이 올라가요.
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
          {q.hint && <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">{q.hint}</p>}

          <div role="radiogroup" aria-labelledby="quest" className={cn("mt-5 grid gap-2.5", gridCols(q.options.length))}>
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
                  <span className="block pr-5 text-[15.5px] font-semibold leading-snug text-foreground">{o.label}</span>
                  {o.sub && <span className="mt-0.5 block text-[12.5px] text-subtle">{o.sub}</span>}
                </button>
              );
            })}
            {q.custom && (
              <div
                className={cn(
                  "col-span-2 rounded-2xl border px-4 py-3 transition-colors sm:col-span-3",
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
            <h2 id="quest" className="mx-auto mt-1 max-w-md text-[21px] font-bold leading-snug tracking-[-0.03em] sm:text-[26px]">
              {plan.title}
            </h2>
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="나의 조건">
              {plan.tags.map((t) => (
                <li key={t} className="rounded-full border border-border bg-[hsl(var(--surface-2))] px-2.5 py-1 text-[12px] text-muted-foreground">
                  #{t}
                </li>
              ))}
            </ul>
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
                          <span className="num shrink-0 text-[15px] font-semibold text-gold">{won(ac.amount)}</span>
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
              <CardTitle n={2}>담을 ETF와 비중</CardTitle>
              <ul className="mt-3 space-y-3">
                {plan.etfs.map((e) => (
                  <li key={e.href + e.label}>
                    <Link href={e.href}>
                      <span className="group block">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="min-w-0 text-[15px] font-semibold leading-snug text-foreground group-hover:text-gold">{e.label} →</span>
                          <span className="num shrink-0 text-right text-[14px] font-semibold text-gold">
                            {e.pct}%<span className="ml-1 text-[12px] font-normal text-subtle">{won(e.amount)}</span>
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">{e.note}</span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[hsl(var(--surface-3))]">
                          <span className="block h-full rounded-full bg-gold/70" style={{ width: `${e.pct}%` }} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                {plan.satellite && (
                  <li>
                    <Link href="/calendar">
                      <span className="group block">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-[15px] font-semibold text-foreground group-hover:text-gold">직접 고른 배당주 →</span>
                          <span className="num shrink-0 text-[14px] font-semibold text-iris">
                            {plan.satellite.pct}%<span className="ml-1 text-[12px] font-normal text-subtle">{won((plan.monthly * plan.satellite.pct) / 100)}</span>
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-subtle">{plan.satellite.note} 배당 달력에서 조합해 보세요.</span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[hsl(var(--surface-3))]">
                          <span className="block h-full rounded-full bg-iris/70" style={{ width: `${plan.satellite.pct}%` }} />
                        </span>
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
            <CardTitle n={3}>{plan.years}년 동안 꾸준히 넣으면</CardTitle>
            <div className={cn("mt-3 grid gap-2 text-center", plan.creditBack > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
              <div>
                <p className="text-[12px] text-subtle">넣은 돈</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-foreground sm:text-[17px]">{won(plan.invested)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">{plan.useNow ? "주식 평가액" : "모인 돈"}</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-mint sm:text-[17px]">{won(plan.assets)}</p>
              </div>
              <div>
                <p className="text-[12px] text-subtle">{plan.useNow ? "월 배당(세후)" : `${plan.years}년차 월 배당`}</p>
                <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-gold sm:text-[17px]">{won(plan.useNow ? plan.monthlyDivAfter : plan.monthlyDiv)}</p>
              </div>
              {plan.creditBack > 0 && (
                <div>
                  <p className="text-[12px] text-subtle">세액공제 (1년)</p>
                  <p className="num mt-0.5 whitespace-nowrap text-[14px] font-bold text-iris sm:text-[17px]">+{won(plan.creditBack)}</p>
                </div>
              )}
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-subtle">
              {plan.useNow ? (
                <>배당을 받는 대로 꺼내 쓴다고 보고 계산했어요. {plan.years}년 동안 받은 배당은 세전 {won(plan.totalDiv)}, 월 배당은 세금 약 15%를 뗀 금액이에요. </>
              ) : (
                <>배당을 모두 재투자한다고 보고 계산했어요(세전, 세액공제 환급은 빼고). </>
              )}
              담을 ETF 비중대로 배당률 {plan.assume.y}%, 배당 성장 {plan.assume.dg}%, 주가 상승 {plan.assume.pg}%를 가정한 예시라 실제 결과는 달라져요.{" "}
              <Link href={`/?y=${plan.assume.y}&dg=${plan.assume.dg}&pg=${plan.assume.pg}&from=${encodeURIComponent("나의 배당 플랜")}`}>
                <span className="text-gold underline underline-offset-2">내 숫자로 계산해 보기</span>
              </Link>
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-[hsl(var(--surface-2))] p-4">
            <CardTitle n={4}>나에게 맞는 조언</CardTitle>
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
            <a href="#missions" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-5 py-3 text-[14.5px] font-bold text-gold-foreground">
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
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-subtle">
            답에 따라 정리한 참고용 예시예요. 특정 상품을 사라는 추천이 아니며, 투자 판단과 책임은 본인에게 있어요.
          </p>
        </div>
      )}
    </section>
  );
}
