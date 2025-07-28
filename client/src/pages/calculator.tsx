import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, AlertTriangle, Repeat, Target, BarChart3, Shield } from "lucide-react";
import CalculatorForm from "@/components/calculator-form";
import ResultsCharts from "@/components/results-charts";
import ResultsTable from "@/components/results-table";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">배당 재투자 계산기</h1>
        <p className="text-gray-600">
          배당금 재투자를 통한 복리 효과를 시뮬레이션해보세요
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">배당 재투자의 장점</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Repeat className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">자동 재투자</h3>
            <p className="text-sm text-gray-600">
              받은 배당금을 자동으로 주식 매수에 활용하여 지속적인 복리 효과 창출
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">복리 성장</h3>
            <p className="text-sm text-gray-600">
              시간이 지날수록 가속화되는 복리 효과로 자산 증식 속도 향상
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">수익률 향상</h3>
            <p className="text-sm text-gray-600">
              장기적으로 단순 배당 수령보다 높은 총 수익률 달성 가능
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">리스크 분산</h3>
            <p className="text-sm text-gray-600">
              정기적인 재투자를 통한 달러 코스트 평균화 효과로 변동성 완화
            </p>
          </Card>
        </div>
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
                        <p className="text-sm font-medium text-gray-500">총 자산</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(results.finalAssets)}
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
                          {formatCurrency(results.totalDividends)}
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
                        <p className="text-sm font-medium text-gray-500">연복리 수익률 (CAGR)</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {results.cagr.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <ResultsCharts results={results} formatCurrency={formatCurrency} />

              {/* Results Table */}
              <ResultsTable results={results} formatCurrency={formatCurrency} />
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
