
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Calendar, Target, Info, Share2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

interface FireData {
  year: number;
  age: number;
  assets: number;
  phase: 'accumulation' | 'retirement';
  annualIncome?: number;
  annualExpenses?: number;
}

export default function FireCalculator() {
  const [location] = useLocation();
  
  // Initialize state from URL parameters or defaults
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      income: Number(params.get('income')) || 50000000,
      expenses: Number(params.get('expenses')) || 30000000,
      initialAssets: Number(params.get('initialAssets')) || 10000000,
      returnRate: Number(params.get('returnRate')) || 5,
      withdrawalRate: Number(params.get('withdrawalRate')) || 4,
      currentAge: Number(params.get('currentAge')) || 30,
    };
  };

  const urlParams = getUrlParams();
  const [income, setIncome] = useState<number>(urlParams.income);
  const [expenses, setExpenses] = useState<number>(urlParams.expenses);
  const [initialAssets, setInitialAssets] = useState<number>(urlParams.initialAssets);
  const [returnRate, setReturnRate] = useState<number>(urlParams.returnRate);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(urlParams.withdrawalRate);
  const [currentAge, setCurrentAge] = useState<number>(urlParams.currentAge);
  const [results, setResults] = useState<{
    yearsToFire: number;
    fireYear: number;
    fireAge: number;
    fireNumber: number;
    chartData: FireData[];
  } | null>(null);

  useEffect(() => {
    // Update page title and meta tags
    document.title = "FIRE 계산기 – 조기 은퇴 시뮬레이션으로 당신의 은퇴 연도를 예측하세요";
    document.documentElement.lang = "ko";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '연간 소득, 지출, 수익률만 입력하면 조기 은퇴까지 걸리는 기간과 자산 그래프를 바로 확인할 수 있습니다.');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'FIRE 계산기, 조기 은퇴, 은퇴 시뮬레이션, 재정 자립, 파이어족, FIRE 전략');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'FIRE 계산기 – 조기 은퇴 시뮬레이션으로 당신의 은퇴 연도를 예측하세요');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', '연간 소득, 지출, 수익률만 입력하면 조기 은퇴까지 걸리는 기간과 자산 그래프를 바로 확인할 수 있습니다.');
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateFire = () => {
    if (income <= expenses) {
      alert("연간 소득이 연간 지출보다 커야 합니다.");
      return;
    }

    const annualSavings = income - expenses;
    const fireNumber = expenses * (100 / withdrawalRate); // 4% 룰 기준
    const savingsRate = annualSavings / income;
    
    let currentAssets = initialAssets;
    let year = 0;
    const chartData: FireData[] = [];
    
    // 자산 축적 단계
    while (currentAssets < fireNumber && year <= 50) {
      const age = currentAge + year;
      chartData.push({
        year: new Date().getFullYear() + year,
        age,
        assets: currentAssets,
        phase: 'accumulation',
        annualIncome: income,
        annualExpenses: expenses
      });
      
      if (currentAssets >= fireNumber) break;
      
      // 다음 연도 자산 계산
      currentAssets = currentAssets * (1 + returnRate / 100) + annualSavings;
      year++;
    }

    const yearsToFire = year;
    const fireAge = currentAge + yearsToFire;
    const fireYear = new Date().getFullYear() + yearsToFire;

    // 은퇴 후 시뮬레이션 (30년간)
    let retirementAssets = fireNumber;
    for (let retirementYear = 1; retirementYear <= 30; retirementYear++) {
      const age = fireAge + retirementYear;
      retirementAssets = retirementAssets * (1 + returnRate / 100) - expenses;
      
      chartData.push({
        year: fireYear + retirementYear,
        age,
        assets: Math.max(0, retirementAssets),
        phase: 'retirement'
      });
      
      if (retirementAssets <= 0) break;
    }

    setResults({
      yearsToFire,
      fireYear,
      fireAge,
      fireNumber,
      chartData
    });
  };

  useEffect(() => {
    if (income > 0 && expenses > 0 && income > expenses) {
      calculateFire();
      updateUrlParams();
    }
  }, [income, expenses, initialAssets, returnRate, withdrawalRate, currentAge]);

  const formatNumberInput = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Update URL parameters when inputs change
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    params.set('income', income.toString());
    params.set('expenses', expenses.toString());
    params.set('initialAssets', initialAssets.toString());
    params.set('returnRate', returnRate.toString());
    params.set('withdrawalRate', withdrawalRate.toString());
    params.set('currentAge', currentAge.toString());
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Share current calculation
  const shareCalculation = () => {
    const params = new URLSearchParams();
    params.set('income', income.toString());
    params.set('expenses', expenses.toString());
    params.set('initialAssets', initialAssets.toString());
    params.set('returnRate', returnRate.toString());
    params.set('withdrawalRate', withdrawalRate.toString());
    params.set('currentAge', currentAge.toString());
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
      alert(`공유 링크: ${shareUrl}`);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FIRE 계산기</h1>
        <p className="text-gray-600">
          Financial Independence, Retire Early - 조기 은퇴를 위한 재정 계획을 세워보세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                FIRE 계산 입력값
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center">
                  현재 나이
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      현재 나이를 입력하세요
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="30"
                    className="pr-8"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(parseFloat(e.target.value) || 30)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    세
                  </span>
                </div>
              </div>

              <div>
                <Label className="flex items-center">
                  연간 소득 (세후)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      세금을 제외한 실제 가져가는 연간 소득
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₩
                  </span>
                  <Input
                    type="text"
                    placeholder="50,000,000"
                    className="pl-8"
                    value={income.toLocaleString()}
                    onChange={(e) => setIncome(formatNumberInput(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center">
                  연간 지출
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      매년 필요한 생활비 및 지출 총액
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₩
                  </span>
                  <Input
                    type="text"
                    placeholder="30,000,000"
                    className="pl-8"
                    value={expenses.toLocaleString()}
                    onChange={(e) => setExpenses(formatNumberInput(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center">
                  초기 자산
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      현재 보유하고 있는 투자 자산
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₩
                  </span>
                  <Input
                    type="text"
                    placeholder="10,000,000"
                    className="pl-8"
                    value={initialAssets.toLocaleString()}
                    onChange={(e) => setInitialAssets(formatNumberInput(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center">
                  연평균 수익률
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      투자 포트폴리오의 예상 연평균 수익률
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="5"
                    className="pr-8"
                    value={returnRate}
                    onChange={(e) => setReturnRate(parseFloat(e.target.value) || 5)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>

              <div>
                <Label className="flex items-center">
                  은퇴 후 인출률
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      은퇴 후 자산에서 매년 인출할 비율 (4% 룰)
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="4"
                    className="pr-8"
                    value={withdrawalRate}
                    onChange={(e) => setWithdrawalRate(parseFloat(e.target.value) || 4)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={calculateFire} 
                  className="w-full"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  FIRE 계산하기
                </Button>
                
                {results && (
                  <Button 
                    onClick={shareCalculation} 
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    계산 결과 공유
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {results ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">은퇴까지 남은 기간</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {results.yearsToFire}년
                        </p>
                        <p className="text-sm text-gray-600">
                          {results.fireAge}세에 은퇴 가능
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
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">은퇴 예상 연도</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {results.fireYear}년
                        </p>
                        <p className="text-sm text-gray-600">
                          필요 자산: {formatCurrency(results.fireNumber)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      현재 생활 수준을 유지한다면, 약 {results.yearsToFire}년 뒤 조기 은퇴가 가능합니다.
                    </h3>
                    <p className="text-gray-600">
                      {results.fireYear}년에 {results.fireAge}세의 나이로 재정적 자유를 달성할 수 있습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>자산 성장 시뮬레이션</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 100000000).toFixed(1)}억`}
                        />
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'assets' ? '자산' : name
                          ]}
                          labelFormatter={(year) => `${year}년 (${results.chartData.find(d => d.year === year)?.age}세)`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="assets" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          name="자산"
                          dot={false}
                        />
                        <ReferenceLine 
                          x={results.fireYear} 
                          stroke="#dc2626" 
                          strokeDasharray="5 5"
                          label={{ value: "FIRE", position: "top" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  FIRE 계산 결과를 확인하세요
                </h3>
                <p className="text-gray-500">
                  왼쪽 패널에서 재정 정보를 입력하고 계산 버튼을 클릭하세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">FIRE에 대해 알아보기</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">💰 4% 룰이란?</h4>
            <p>은퇴 후 매년 총 자산의 4%씩 인출하면서도 자산이 고갈되지 않는다는 경험적 법칙입니다.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📈 저축률의 중요성</h4>
            <p>소득 대비 저축률이 높을수록 FIRE 달성 시기가 빨라집니다. 지출을 줄이는 것이 핵심입니다.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚠️ 리스크 고려사항</h4>
            <p>인플레이션, 의료비, 경기 변동 등 예상치 못한 변수들을 고려해 여유자금을 확보하세요.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 단계별 접근</h4>
            <p>FIRE는 단거리 달리기가 아닌 마라톤입니다. 꾸준한 저축과 투자 습관이 중요합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
