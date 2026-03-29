import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage, getTranslation } from "@/lib/i18n";

interface ResultsTableProps {
  results: CalculationResults;
  formatCurrency: (amount: number) => string;
  targetMonthlyDividend?: number;
}

export default function ResultsTable({ results, formatCurrency, targetMonthlyDividend }: ResultsTableProps) {
  const language = getCurrentLanguage();
  const t = getTranslation(language);

  // 목표 달성 카운트다운 계산
  const getCountdown = () => {
    if (!targetMonthlyDividend || targetMonthlyDividend <= 0) return null;
    const targetAnnual = targetMonthlyDividend * 12;
    const achievedRow = results.yearlyData.find(row => row.annualDividends >= targetAnnual);
    if (!achievedRow) return null;
    return achievedRow.year;
  };

  const achievedYear = getCountdown();

  return (
    <div className="space-y-4">
      {/* 목표 달성 카운트다운 */}
      {targetMonthlyDividend && targetMonthlyDividend > 0 && (
        <Card className={achievedYear ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{achievedYear ? "🎯" : "📈"}</span>
              <div>
                {achievedYear ? (
                  <>
                    <p className="font-semibold text-green-800 text-sm">
                      목표 월 배당 {formatCurrency(targetMonthlyDividend)} 달성!
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      투자 시작 후 <strong>{achievedYear}년차</strong>에 목표를 달성해요 🎉
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-orange-800 text-sm">
                      목표 월 배당 {formatCurrency(targetMonthlyDividend)}
                    </p>
                    <p className="text-orange-700 text-xs mt-0.5">
                      투자 기간 내 목표 달성이 어렵습니다. 투자금이나 기간을 늘려보세요.
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 연도별 결과 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>{t.calculator.results.yearlyResults}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.calculator.results.year}</TableHead>
                  <TableHead>{t.calculator.results.assets}</TableHead>
                  <TableHead>{t.calculator.results.yearlyDividend}</TableHead>
                  <TableHead>
                    {language === 'en' ? 'Yield on Cost' : '취득원가 수익률'}
                  </TableHead>
                  <TableHead>{t.calculator.results.holdingAssets}</TableHead>
                  <TableHead>{t.calculator.results.cumulativeDividend}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.yearlyData.map((row) => (
                  <TableRow
                    key={row.year}
                    className={achievedYear === row.year ? "bg-green-50 font-medium" : ""}
                  >
                    <TableCell className="font-medium">
                      {row.year}{language === 'en' ? '' : '년'}
                      {achievedYear === row.year && (
                        <span className="ml-1 text-xs text-green-600">🎯</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(row.totalAssets)}</TableCell>
                    <TableCell>{formatCurrency(row.annualDividends)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${(row.yieldOnCost || 0) >= 5 ? "text-green-600" : (row.yieldOnCost || 0) >= 3 ? "text-blue-600" : "text-gray-600"}`}>
                        {row.yieldOnCost != null ? `${row.yieldOnCost.toFixed(2)}%` : "-"}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(row.holdingAssets || row.totalAssets)}</TableCell>
                    <TableCell>{formatCurrency(row.cumulativeDividends)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {language === 'en'
              ? '* Yield on Cost = Annual dividend / Initial investment. Shows how your effective yield grows over time.'
              : '* 취득원가 수익률 = 연간 배당금 ÷ 초기 투자 원금. 시간이 지날수록 실질 수익률이 높아지는 걸 보여줍니다.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
