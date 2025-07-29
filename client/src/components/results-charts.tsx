import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CalculationResults } from "@/pages/calculator";

interface ResultsChartsProps {
  results: CalculationResults;
  comparisonResults?: CalculationResults;
  formatCurrency: (amount: number) => string;
  stockATicker?: string;
  stockBTicker?: string;
}

export default function ResultsCharts({ 
  results, 
  comparisonResults, 
  formatCurrency,
  stockATicker = "종목 A",
  stockBTicker = "종목 B"
}: ResultsChartsProps) {
  const isComparison = !!comparisonResults;

  // Prepare data for charts
  const chartData = results.yearlyData.map((item, index) => ({
    year: `${item.year}년`,
    totalAssets: item.totalAssets,
    dividends: item.annualDividends,
    cumulativeDividends: item.cumulativeDividends,
    ...(comparisonResults && {
      totalAssetsB: comparisonResults.yearlyData[index]?.totalAssets || 0,
      dividendsB: comparisonResults.yearlyData[index]?.annualDividends || 0,
      cumulativeDividendsB: comparisonResults.yearlyData[index]?.cumulativeDividends || 0,
    }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Asset Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isComparison ? "자산 성장 비교" : "자산 성장 추이"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                {isComparison && <Legend />}
                <Line
                  type="monotone"
                  dataKey="totalAssets"
                  stroke="hsl(207, 90%, 54%)"
                  strokeWidth={2}
                  name={isComparison ? stockATicker : "총 자산"}
                  dot={{ fill: "hsl(207, 90%, 54%)", strokeWidth: 2 }}
                />
                {comparisonResults && (
                  <Line
                    type="monotone"
                    dataKey="totalAssetsB"
                    stroke="hsl(142, 76%, 47%)"
                    strokeWidth={2}
                    name={stockBTicker}
                    dot={{ fill: "hsl(142, 76%, 47%)", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dividend Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isComparison ? "배당금 비교" : "배당금 성장 추이"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                {isComparison && <Legend />}
                <Bar
                  dataKey="dividends"
                  fill="hsl(142, 76%, 47%)"
                  name={isComparison ? `${stockATicker} 연간 배당금` : "연간 배당금"}
                  radius={[4, 4, 0, 0]}
                />
                {comparisonResults && (
                  <Bar
                    dataKey="dividendsB"
                    fill="hsl(25, 95%, 53%)"
                    name={`${stockBTicker} 연간 배당금`}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Dividends Chart */}
      {!isComparison && (
        <Card>
          <CardHeader>
            <CardTitle>누적 배당금 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cumulativeDividends"
                    stroke="hsl(25, 95%, 53%)"
                    strokeWidth={2}
                    name="누적 배당금"
                    dot={{ fill: "hsl(25, 95%, 53%)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
