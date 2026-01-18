import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, TrendingUp, AlertTriangle, Repeat, Target, BarChart3, Shield, ArrowRight, BookOpen, Snowflake } from "lucide-react";
import CalculatorForm from "@/components/calculator-form";
import ResultsCharts from "@/components/results-charts";
import ResultsTable from "@/components/results-table";
import CalculatorTabs from "@/components/calculator-tabs";
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

  useEffect(() => {
    // Update page title and meta tags for Korean version
    document.title = "배당 재투자 계산기 | DRIP 복리 계산";
    document.documentElement.lang = "ko";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '배당 재투자(DRIP)를 통한 장기 투자 수익률을 계산하고 시뮬레이션해보세요. 한국과 미국 주식의 세율을 고려한 정확한 계산기입니다.');
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', '배당, 재투자, DRIP, 복리, 투자 계산기, 배당 수익률, 주식 투자, 세율 계산');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', '배당 재투자 계산기 | DRIP 복리 계산');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', '배당 재투자(DRIP)를 통한 장기 투자 수익률을 계산하고 시뮬레이션해보세요. 한국과 미국 주식의 세율을 고려한 정확한 계산기입니다.');
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return formatCurrencyByLanguage(amount, 'kr');
  };

  const handleCalculate = (calculationResults: CalculationResults, currency?: string) => {
    setResults(calculationResults);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      <CalculatorTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <CalculatorForm 
            onCalculate={handleCalculate}
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

      {/* CTA Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/goal">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer h-full">
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
        <Link href="/snowball">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Snowflake className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">배당이 스스로 굴러가는 시점은 언제일까?</h3>
                    <p className="text-sm text-gray-600">스노우볼 시뮬레이터 바로가기</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600" />
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