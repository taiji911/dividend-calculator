import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BarChart3 } from "lucide-react";
import ComparisonForm from "@/components/comparison-form";
import ResultsCharts from "@/components/results-charts";

export interface ComparisonResults {
  stockA: {
    ticker: string;
    name: string;
    sector?: string;
    dividendYield: number;
    dividendGrowthRate: number;
    results: {
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
      }>;
      totalInvested: number;
    };
  };
  stockB: {
    ticker: string;
    name: string;
    sector?: string;
    dividendYield: number;
    dividendGrowthRate: number;
    results: {
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
      }>;
      totalInvested: number;
    };
  };
}

export default function Comparison() {
  const [results, setResults] = useState<ComparisonResults | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">종목 비교 분석</h1>
        <p className="text-gray-600">
          두 종목의 배당 재투자 성과를 비교해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <ComparisonForm onCompare={setResults} />
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {results ? (
            <>
              {/* Stock Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{results.stockA.ticker}</CardTitle>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        종목 A
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{results.stockA.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">평균 배당률</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.stockA.dividendYield.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">최종 자산</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(results.stockA.results.finalAssets)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">총 배당금</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(results.stockA.results.totalDividends)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">CAGR</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.stockA.results.cagr.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{results.stockB.ticker}</CardTitle>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        종목 B
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{results.stockB.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">평균 배당률</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.stockB.dividendYield.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">최종 자산</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(results.stockB.results.finalAssets)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">총 배당금</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(results.stockB.results.totalDividends)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">CAGR</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.stockB.results.cagr.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Chart */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>종목 비교 차트</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultsCharts 
                    results={results.stockA.results}
                    comparisonResults={results.stockB.results}
                    formatCurrency={formatCurrency}
                    stockATicker={results.stockA.ticker}
                    stockBTicker={results.stockB.ticker}
                  />
                </CardContent>
              </Card>

              {/* Comparison Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>비교 결과 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">배당 수익 비교</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{results.stockA.ticker} 총 배당금</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(results.stockA.results.totalDividends)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{results.stockB.ticker} 총 배당금</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(results.stockB.results.totalDividends)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">배당금 차이</span>
                            <span className={`text-sm font-medium ${
                              results.stockA.results.totalDividends > results.stockB.results.totalDividends
                                ? "text-blue-600" 
                                : "text-green-600"
                            }`}>
                              {formatCurrency(Math.abs(results.stockA.results.totalDividends - results.stockB.results.totalDividends))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">총 수익률 비교</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{results.stockA.ticker} CAGR</span>
                          <span className="text-sm font-medium text-blue-600">
                            {results.stockA.results.cagr.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{results.stockB.ticker} CAGR</span>
                          <span className="text-sm font-medium text-green-600">
                            {results.stockB.results.cagr.toFixed(1)}%
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">최종 자산 차이</span>
                            <span className={`text-sm font-medium ${
                              results.stockA.results.finalAssets > results.stockB.results.finalAssets
                                ? "text-blue-600" 
                                : "text-green-600"
                            }`}>
                              {formatCurrency(Math.abs(results.stockA.results.finalAssets - results.stockB.results.finalAssets))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  종목 비교 결과를 확인하세요
                </h3>
                <p className="text-gray-500">
                  왼쪽 패널에서 비교할 종목들을 입력하고 비교 버튼을 클릭하세요
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
            <h3 className="text-sm font-medium text-yellow-800">투자 위험 고지</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                본 계산기의 결과는 참고용이며, 실제 투자 수익을 보장하지 않습니다. 
                모든 투자에는 원금 손실의 위험이 있으며, 과거 성과가 미래 결과를 보장하지 않습니다. 
                투자 결정 전에 전문가와 상담하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
