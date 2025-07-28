import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CalculationResults } from "@/pages/calculator";

interface ResultsTableProps {
  results: CalculationResults;
  formatCurrency: (amount: number) => string;
}

export default function ResultsTable({ results, formatCurrency }: ResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>연도별 상세 결과</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>연도</TableHead>
                <TableHead>총 자산</TableHead>
                <TableHead>누적 배당금</TableHead>
                <TableHead>연간 배당금</TableHead>
                <TableHead>수익률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.yearlyData.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}년</TableCell>
                  <TableCell>{formatCurrency(row.totalAssets)}</TableCell>
                  <TableCell>{formatCurrency(row.cumulativeDividends)}</TableCell>
                  <TableCell>{formatCurrency(row.annualDividends)}</TableCell>
                  <TableCell className="text-green-600">
                    +{row.returnPercentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
