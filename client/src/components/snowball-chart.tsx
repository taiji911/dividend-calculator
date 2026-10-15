import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { moneyAxis } from "@/lib/format";

interface Props {
  data: { year: number; annualDividend: number; contributionAnnual: number }[];
  snowballYear: number | null;
  isEnglish: boolean;
  formatCurrency: (n: number) => string;
}

/** 연 배당금(초록 영역)이 연간 투자금(금색 점선)을 넘는 순간을 보여주는 차트 — 따로 불러와요 */
export default function SnowballChart({ data, snowballYear, isEnglish, formatCurrency }: Props) {
  const currency = isEnglish ? "USD" : "KRW";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 16, right: 14, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="year" stroke="transparent" tickLine={false} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={6} />
        <YAxis stroke="transparent" tickLine={false} tick={{ fontSize: 11 }} width={52} tickFormatter={(v) => moneyAxis(v, currency)} />
        <Tooltip
          cursor={{ stroke: "hsl(var(--border-strong))" }}
          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border-strong))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 13 }}
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          labelFormatter={(label) => (isEnglish ? `Year ${label}` : `${label}년차`)}
        />
        {snowballYear && (
          <ReferenceLine
            x={snowballYear}
            stroke="hsl(var(--mint))"
            strokeDasharray="4 4"
            label={{ value: isEnglish ? "Snowball" : "전환점", position: "top", fill: "hsl(var(--mint))", fontSize: 12 }}
          />
        )}
        <Area type="monotone" dataKey="annualDividend" name={isEnglish ? "Annual dividend" : "연 배당금"} fill="hsl(var(--mint))" fillOpacity={0.22} stroke="hsl(var(--mint))" strokeWidth={2} />
        <Line type="monotone" dataKey="contributionAnnual" name={isEnglish ? "Annual contribution" : "연간 투자금"} stroke="hsl(var(--gold))" strokeWidth={2} strokeDasharray="6 5" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
