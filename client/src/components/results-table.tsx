import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CalculationResults } from "@/pages/calculator";
import { getCurrentLanguage, getTranslation } from "@/lib/i18n";

interface ResultsTableProps {
  results: CalculationResults;
  formatCurrency: (amount: number) => string;
}

export default function ResultsTable({ results, formatCurrency }: ResultsTableProps) {
  const language = getCurrentLanguage();
  const t = getTranslation(language);

  return (
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
                <TableHead>{t.calculator.results.holdingAssets}</TableHead>
                <TableHead>{t.calculator.results.cumulativeDividend}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.yearlyData.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}{language === 'en' ? '' : '년'}</TableCell>
                  <TableCell>{formatCurrency(row.totalAssets)}</TableCell>
                  <TableCell>{formatCurrency(row.annualDividends)}</TableCell>
                  <TableCell>{formatCurrency(row.holdingAssets || row.totalAssets)}</TableCell>
                  <TableCell>{formatCurrency(row.cumulativeDividends)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
