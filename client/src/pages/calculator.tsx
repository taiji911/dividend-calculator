import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, AlertTriangle, Repeat, Target, BarChart3, Shield, ArrowRight } from "lucide-react";
import CalculatorForm from "@/components/calculator-form";
import ResultsCharts from "@/components/results-charts";
import ResultsTable from "@/components/results-table";
import CalculatorTabs from "@/components/calculator-tabs";

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

export default function Calculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const currency = "KRW";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">배당 재투자 계산기</h1>
        <p className="text-gray-600">
          배당금 재투자를 통한 복리 효과를 시뮬레이션해보세요
        </p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

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
                        <p className="text-sm font-medium text-gray-500">총 자산</p>
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
                        <p className="text-sm font-medium text-gray-500">누적 배당금</p>
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
                        <p className="text-sm font-medium text-gray-500">연간 배당금</p>
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

      {/* CTA Card */}
      <div className="mt-8">
        <Link href="/goal">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">월 100만원 배당, 원금이 얼마 필요할까?</h3>
                    <p className="text-sm text-gray-600">목표 배당금 계산기 바로가기</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}

      {/* Risk Disclaimer */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
