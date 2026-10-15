/**
 * 숫자를 사람이 읽기 쉬운 모양으로 바꾸는 도구들.
 *  - 원화: 86,577,307 → "8,658만원", 123,456,789 → "1억 2,346만원"
 *  - 그 밖의 통화: 영어식 축약 ($86.6K, $1.2M)
 */

/** 원화를 "억·만" 단위로 */
export function krwShort(amount: number, opts: { unit?: boolean } = {}): string {
  const unit = opts.unit ?? true;
  const sign = amount < 0 ? "-" : "";
  const n = Math.round(Math.abs(amount));
  if (n < 10_000) return `${sign}${n.toLocaleString("ko-KR")}${unit ? "원" : ""}`;

  const eok = Math.floor(n / 100_000_000);
  const man = Math.round((n % 100_000_000) / 10_000);
  // 반올림으로 1억이 되는 경우 처리
  const eokAdj = man === 10_000 ? eok + 1 : eok;
  const manAdj = man === 10_000 ? 0 : man;

  const parts: string[] = [];
  if (eokAdj > 0) parts.push(`${eokAdj.toLocaleString("ko-KR")}억`);
  if (manAdj > 0) parts.push(`${manAdj.toLocaleString("ko-KR")}만`);
  return `${sign}${parts.join(" ")}${unit ? "원" : ""}`;
}

/** 차트 축처럼 좁은 곳용: "8,658만", "1.2억" */
export function krwAxis(amount: number): string {
  const n = Math.abs(amount);
  if (n >= 100_000_000) {
    const v = amount / 100_000_000;
    return `${Number(v.toFixed(v >= 10 ? 0 : 1)).toLocaleString("ko-KR")}억`;
  }
  if (n >= 10_000) return `${Math.round(amount / 10_000).toLocaleString("ko-KR")}만`;
  return Math.round(amount).toLocaleString("ko-KR");
}

const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$", CHF: "CHF ", KRW: "₩" };

/**
 * 영어식 축약 ($120K, $1.2M) — Intl의 compact 표기는 브라우저·Node마다 결과가 달라서
 * (미리 만든 HTML과 화면이 어긋나요) 직접 계산해요.
 */
function compact(amount: number, currency: string, forceCompact: boolean): string {
  const sym = SYMBOL[currency] ?? `${currency} `;
  const sign = amount < 0 ? "-" : "";
  const n = Math.abs(amount);
  const trim = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
  if (n >= 1e9) return `${sign}${sym}${trim(n / 1e9)}B`;
  if (n >= 1e6) return `${sign}${sym}${trim(n / 1e6)}M`;
  if (n >= 1e5 || (forceCompact && n >= 1e3)) return `${sign}${sym}${trim(n / 1e3)}K`;
  return `${sign}${sym}${Math.round(n).toLocaleString("en-US")}`;
}

/** 통화에 맞춰 짧게. 원화면 억·만, 그 외는 $120K 처럼 */
export function moneyShort(amount: number, currency: string = "KRW"): string {
  if (currency === "KRW") return krwShort(amount);
  return compact(amount, currency, false);
}

export function moneyAxis(amount: number, currency: string = "KRW"): string {
  if (currency === "KRW") return krwAxis(amount);
  return compact(amount, currency, true);
}
