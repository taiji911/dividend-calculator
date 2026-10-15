import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getCurrentLanguage } from "@/lib/i18n";
import { moneyAxis } from "@/lib/format";
import type { CalculationResults } from "@/pages/calculator";

interface ResultsChartsProps {
  results: CalculationResults;
  comparisonResults?: CalculationResults;
  formatCurrency: (amount: number) => string;
  currency?: string;
  stockATicker?: string;
  stockBTicker?: string;
}

const C = {
  principal: "hsl(var(--iris))",
  growth: "hsl(var(--mint))",
  dividend: "hsl(var(--gold))",
};

function ChartTooltip({ active, payload, label, formatCurrency, rows }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-[180px] rounded-xl border border-border-strong bg-popover px-3.5 py-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-[12px] font-semibold text-subtle">{label}</p>
      {rows.map((r: any) => (
        <div key={r.key} className="flex items-center justify-between gap-4 py-0.5 text-[13px]">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="dot" style={{ background: r.color }} />
            {r.label}
          </span>
          <span className="num font-semibold text-foreground">{formatCurrency(d[r.key])}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <span className="dot" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export default function ResultsCharts({ results, formatCurrency, currency = "KRW" }: ResultsChartsProps) {
  const isEn = getCurrentLanguage() === "en";
  const [divMode, setDivMode] = useState<"annual" | "cumulative">("annual");

  const data = results.yearlyData.map((item) => ({
    year: isEn ? `Y${item.year}` : `${item.year}년`,
    principal: item.totalInvested,
    growth: Math.max(0, item.totalAssets - item.totalInvested),
    total: item.totalAssets,
    annual: item.annualDividends,
    cumulative: item.cumulativeDividends,
  }));

  const axis = { stroke: "transparent", tickLine: false, tick: { fontSize: 11 } };
  const tickGap = data.length > 20 ? 4 : data.length > 12 ? 2 : 0;

  const L = {
    principal: isEn ? "Principal" : "넣은 돈",
    growth: isEn ? "Growth" : "늘어난 돈",
    total: isEn ? "Total" : "총 자산",
    annual: isEn ? "Annual dividend" : "그 해 배당금",
    cumulative: isEn ? "Cumulative dividends" : "누적 배당금",
  };

  return (
    <div className="space-y-4">
      {/* 자산 */}
      <section className="panel p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker mb-1">{isEn ? "Assets" : "자산"}</p>
            <h3 className="text-[17px] font-semibold">{isEn ? "How your money grows" : "자산이 불어나는 모습"}</h3>
          </div>
          <Legend items={[{ label: L.principal, color: C.principal }, { label: L.growth, color: C.growth }]} />
        </div>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g-principal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.principal} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={C.principal} stopOpacity={0.12} />
                </linearGradient>
                <linearGradient id="g-growth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.growth} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={C.growth} stopOpacity={0.12} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="0" />
              <XAxis dataKey="year" {...axis} interval={tickGap === 0 ? "preserveStartEnd" : tickGap} minTickGap={6} />
              <YAxis {...axis} width={52} tickFormatter={(v) => moneyAxis(v, currency)} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border-strong))" }}
                content={<ChartTooltip formatCurrency={formatCurrency} rows={[
                  { key: "total", label: L.total, color: "hsl(var(--foreground))" },
                  { key: "principal", label: L.principal, color: C.principal },
                  { key: "growth", label: L.growth, color: C.growth },
                ]} />}
              />
              <Area type="monotone" dataKey="principal" stackId="a" stroke={C.principal} strokeWidth={2} fill="url(#g-principal)" name={L.principal} />
              <Area type="monotone" dataKey="growth" stackId="a" stroke={C.growth} strokeWidth={2} fill="url(#g-growth)" name={L.growth} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 배당 */}
      <section className="panel p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker mb-1">{isEn ? "Dividends" : "배당"}</p>
            <h3 className="text-[17px] font-semibold">{isEn ? "Dividends you receive" : "받는 배당금"}</h3>
          </div>
          <div className="seg !p-0.5">
            {(["annual", "cumulative"] as const).map((m) => (
              <button
                key={m}
                type="button"
                data-active={divMode === m}
                onClick={() => setDivMode(m)}
                className="seg-item !px-3 !py-1.5 !text-[12.5px]"
              >
                {m === "annual" ? (isEn ? "Per year" : "연간") : isEn ? "Cumulative" : "누적"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-60 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g-div" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.dividend} stopOpacity={1} />
                  <stop offset="100%" stopColor={C.dividend} stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" {...axis} interval={tickGap === 0 ? "preserveStartEnd" : tickGap} minTickGap={6} />
              <YAxis {...axis} width={52} tickFormatter={(v) => moneyAxis(v, currency)} />
              <Tooltip
                cursor={{ fill: "hsl(var(--surface-3) / 0.6)" }}
                content={<ChartTooltip formatCurrency={formatCurrency} rows={[
                  divMode === "annual"
                    ? { key: "annual", label: L.annual, color: C.dividend }
                    : { key: "cumulative", label: L.cumulative, color: C.dividend },
                ]} />}
              />
              <Bar dataKey={divMode} fill="url(#g-div)" radius={[6, 6, 2, 2]} maxBarSize={36} name={divMode === "annual" ? L.annual : L.cumulative} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
