import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, AlertTriangle, Repeat, Target, BarChart3, Shield } from "lucide-react";
import CalculatorForm from "@/components/calculator-form";
import ResultsCharts from "@/components/results-charts";
import ResultsTable from "@/components/results-table";
import { getTranslation, formatCurrencyByLanguage } from "@/lib/i18n";

export interface CalculationResults {
  finalAssets: number;
  totalDividends: number;
  cagr: number;
  yearlyData: Array<{
    year: number;
    totalAssets: number;
    cumulativeDividends: number;
    annualDividends: number;
    totalInvested: number;
    returnPercentage: number;
    holdingAssets?: number;
  }>;
  totalInvested: number;
}

export default function CalculatorKR() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const t = getTranslation('kr');

  const formatCurrency = (amount: number) => {
    return formatCurrencyByLanguage(amount, 'kr');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <CalculatorForm 
            onCalculate={setResults}
          />
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {results ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{t.calculator.results.totalAssets}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(results?.finalAssets || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Coins className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{t.calculator.results.cumulativeDividends}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(results?.totalDividends || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{t.calculator.results.annualDividends}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {results?.yearlyData && results.yearlyData.length > 0 
                            ? formatCurrency(results.yearlyData[results.yearlyData.length - 1].annualDividends)
                            : formatCurrency(0)
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {results && results.yearlyData && results.yearlyData.length > 0 && (
                <ResultsCharts results={results} formatCurrency={formatCurrency} />
              )}

              {/* Results Table */}
              {results && results.yearlyData && results.yearlyData.length > 0 && (
                <ResultsTable results={results} formatCurrency={formatCurrency} />
              )}
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  계산 결과를 확인하세요
                </h3>
                <p className="text-gray-500">
                  왼쪽 패널에서 투자 정보를 입력하고 계산 버튼을 클릭하세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {t.disclaimer.title}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                {t.disclaimer.content}
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}