import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CalculationResults } from "@/pages/calculator";

const calculationSchema = z.object({
  initialInvestment: z.number().min(0, "초기 투자금은 0 이상이어야 합니다"),
  monthlyInvestment: z.number().min(0, "월 투자금은 0 이상이어야 합니다"),
  investmentPeriod: z.number().min(1, "투자 기간은 최소 1년이어야 합니다").max(50, "투자 기간은 최대 50년입니다"),
  dividendYield: z.number().min(0, "배당률은 0% 이상이어야 합니다").max(50, "배당률은 50% 이하여야 합니다"),
  dividendGrowthRate: z.number().min(-10, "배당 성장률은 -10% 이상이어야 합니다").max(50, "배당 성장률은 50% 이하여야 합니다"),
  dripEnabled: z.boolean(),
});

type CalculationFormData = z.infer<typeof calculationSchema>;

interface CalculatorFormProps {
  onCalculate: (results: CalculationResults) => void;
  currency: "USD" | "KRW";
  onCurrencyChange: (currency: "USD" | "KRW") => void;
}

export default function CalculatorForm({ onCalculate, currency, onCurrencyChange }: CalculatorFormProps) {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const form = useForm<CalculationFormData>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      initialInvestment: 0,
      monthlyInvestment: 0,
      investmentPeriod: 10,
      dividendYield: 3.5,
      dividendGrowthRate: 5.0,
      dripEnabled: true,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculationFormData) => {
      const response = await apiRequest("POST", "/api/calculate", {
        ...data,
        currency,
      });
      return response.json();
    },
    onSuccess: (results: CalculationResults) => {
      onCalculate(results);
      toast({
        title: "계산 완료!",
        description: "배당 재투자 시뮬레이션이 완료되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "계산 오류",
        description: error.message || "계산 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CalculationFormData) => {
    calculateMutation.mutate(data);
  };

  const presets = {
    conservative: { 
      dividendYield: 3.0, 
      dividendGrowthRate: 3.0, 
      monthlyInvestment: 300,
      label: "보수적",
      description: "배당률 3%, 성장률 3%" 
    },
    moderate: { 
      dividendYield: 4.0, 
      dividendGrowthRate: 5.0, 
      monthlyInvestment: 500,
      label: "중간",
      description: "배당률 4%, 성장률 5%" 
    },
    aggressive: { 
      dividendYield: 5.0, 
      dividendGrowthRate: 8.0, 
      monthlyInvestment: 800,
      label: "공격적",
      description: "배당률 5%, 성장률 8%" 
    },
    schd: { 
      dividendYield: 3.5, 
      dividendGrowthRate: 12.0, 
      monthlyInvestment: 500,
      label: "SCHD",
      description: "실제 데이터 기반" 
    },
  };

  const loadPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    form.setValue("dividendYield", preset.dividendYield);
    form.setValue("dividendGrowthRate", preset.dividendGrowthRate);
    form.setValue("monthlyInvestment", preset.monthlyInvestment);
    setSelectedPreset(presetName);
  };

  const currencySymbol = currency === "USD" ? "$" : "₩";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            투자 조건 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Currency Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">통화</Label>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <Button
                type="button"
                variant={currency === "USD" ? "default" : "outline"}
                className="flex-1 rounded-none border-0"
                onClick={() => onCurrencyChange("USD")}
              >
                USD ($)
              </Button>
              <Button
                type="button"
                variant={currency === "KRW" ? "default" : "outline"}
                className="flex-1 rounded-none border-0 border-l"
                onClick={() => onCurrencyChange("KRW")}
              >
                KRW (₩)
              </Button>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Initial Investment */}
            <div>
              <Label className="flex items-center">
                초기 투자 자산
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    투자를 시작할 때의 초기 자본
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="text"
                  placeholder="10,000"
                  className="pl-8"
                  value={form.watch("initialInvestment")?.toLocaleString() || "0"}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    const numValue = parseFloat(value);
                    form.setValue("initialInvestment", isNaN(numValue) ? 0 : numValue);
                  }}
                />
              </div>
              {form.formState.errors.initialInvestment && (
                <p className="text-sm text-red-600">{form.formState.errors.initialInvestment.message}</p>
              )}
            </div>

            {/* Monthly Investment */}
            <div>
              <Label className="flex items-center">
                매달 투자 금액
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    매월 정기적으로 투자할 금액
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="text"
                  placeholder="500"
                  className="pl-8"
                  value={form.watch("monthlyInvestment")?.toLocaleString() || "0"}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    const numValue = parseFloat(value);
                    form.setValue("monthlyInvestment", isNaN(numValue) ? 0 : numValue);
                  }}
                />
              </div>
              {form.formState.errors.monthlyInvestment && (
                <p className="text-sm text-red-600">{form.formState.errors.monthlyInvestment.message}</p>
              )}
            </div>

            {/* Investment Period */}
            <div>
              <Label className="flex items-center">
                투자 기간
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    투자를 지속할 총 기간
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="10"
                  className="pr-8"
                  {...form.register("investmentPeriod", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  년
                </span>
              </div>
              {form.formState.errors.investmentPeriod && (
                <p className="text-sm text-red-600">{form.formState.errors.investmentPeriod.message}</p>
              )}
            </div>

            {/* Dividend Yield */}
            <div>
              <Label className="flex items-center">
                예상 연간 배당률
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    현재 주가 대비 연간 배당 수익률
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="3.5"
                  className="pr-8"
                  {...form.register("dividendYield", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {form.formState.errors.dividendYield && (
                <p className="text-sm text-red-600">{form.formState.errors.dividendYield.message}</p>
              )}
            </div>

            {/* Dividend Growth Rate */}
            <div>
              <Label className="flex items-center">
                예상 연간 배당 성장률
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    매년 배당금이 증가하는 비율
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  className="pr-8"
                  {...form.register("dividendGrowthRate", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {form.formState.errors.dividendGrowthRate && (
                <p className="text-sm text-red-600">{form.formState.errors.dividendGrowthRate.message}</p>
              )}
            </div>

            {/* DRIP Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="drip"
                {...form.register("dripEnabled")}
                checked={form.watch("dripEnabled")}
                onCheckedChange={(checked) => form.setValue("dripEnabled", checked)}
              />
              <Label htmlFor="drip" className="flex items-center">
                DRIP (배당금 재투자) 활성화
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    배당금을 현금으로 받지 않고 자동으로 재투자
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>



            <Button 
              type="submit" 
              className="w-full" 
              disabled={calculateMutation.isPending}
            >
              <Calculator className="mr-2 h-4 w-4" />
              {calculateMutation.isPending ? "계산 중..." : "계산하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold text-gray-900">빠른 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(presets).map(([key, preset]) => (
              <Button
                key={key}
                variant={selectedPreset === key ? "default" : "outline"}
                className="p-3 h-auto text-left justify-start"
                onClick={() => loadPreset(key as keyof typeof presets)}
              >
                <div>
                  <div className="text-sm font-medium">{preset.label}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
