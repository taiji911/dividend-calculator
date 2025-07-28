import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ComparisonResults } from "@/pages/comparison";

const comparisonSchema = z.object({
  stockA: z.string().min(1, "종목 A 티커를 입력해주세요"),
  stockB: z.string().min(1, "종목 B 티커를 입력해주세요"),
  initialInvestment: z.number().min(0, "초기 투자금은 0 이상이어야 합니다"),
  monthlyInvestment: z.number().min(0, "월 투자금은 0 이상이어야 합니다"),
  investmentPeriod: z.number().min(1, "투자 기간은 최소 1년이어야 합니다").max(50, "투자 기간은 최대 50년입니다"),
});

type ComparisonFormData = z.infer<typeof comparisonSchema>;

interface ComparisonFormProps {
  onCompare: (results: ComparisonResults) => void;
}

export default function ComparisonForm({ onCompare }: ComparisonFormProps) {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState(10);

  const form = useForm<ComparisonFormData>({
    resolver: zodResolver(comparisonSchema),
    defaultValues: {
      stockA: "",
      stockB: "",
      initialInvestment: 10000,
      monthlyInvestment: 500,
      investmentPeriod: 10,
    },
  });

  const compareMutation = useMutation({
    mutationFn: async (data: ComparisonFormData) => {
      const response = await apiRequest("POST", "/api/compare", data);
      return response.json();
    },
    onSuccess: (results: ComparisonResults) => {
      onCompare(results);
      toast({
        title: "비교 완료!",
        description: "종목 비교 분석이 완료되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "비교 오류",
        description: error.message || "비교 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComparisonFormData) => {
    compareMutation.mutate(data);
  };

  const setPeriod = (years: number) => {
    setSelectedPeriod(years);
    form.setValue("investmentPeriod", years);
  };

  const popularComparisons = [
    { stockA: "SCHD", stockB: "VTI", label: "SCHD vs VTI", description: "배당 성장 vs 전체 시장" },
    { stockA: "SCHD", stockB: "SPY", label: "SCHD vs SPY", description: "배당 성장 vs S&P 500" },
    { stockA: "SCHD", stockB: "QQQ", label: "SCHD vs QQQ", description: "배당 성장 vs 나스닥" },
  ];

  const loadComparison = (stockA: string, stockB: string) => {
    form.setValue("stockA", stockA);
    form.setValue("stockB", stockB);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            종목 비교 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Stock A */}
            <div>
              <Label>종목 A 티커</Label>
              <Input
                type="text"
                placeholder="SCHD"
                className="uppercase"
                {...form.register("stockA")}
              />
              {form.formState.errors.stockA && (
                <p className="text-sm text-red-600">{form.formState.errors.stockA.message}</p>
              )}
            </div>

            {/* Stock B */}
            <div>
              <Label>종목 B 티커</Label>
              <Input
                type="text"
                placeholder="VTI"
                className="uppercase"
                {...form.register("stockB")}
              />
              {form.formState.errors.stockB && (
                <p className="text-sm text-red-600">{form.formState.errors.stockB.message}</p>
              )}
            </div>

            {/* Investment Period */}
            <div>
              <Label className="mb-2 block">투자 기간</Label>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10, 15, 30].map((years) => (
                  <Button
                    key={years}
                    type="button"
                    variant={selectedPeriod === years ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setPeriod(years)}
                  >
                    {years}년
                  </Button>
                ))}
              </div>
            </div>

            {/* Initial Investment */}
            <div>
              <Label>초기 투자금</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="10,000"
                  className="pl-8"
                  {...form.register("initialInvestment", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.initialInvestment && (
                <p className="text-sm text-red-600">{form.formState.errors.initialInvestment.message}</p>
              )}
            </div>

            {/* Monthly Investment */}
            <div>
              <Label>월 투자금</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="500"
                  className="pl-8"
                  {...form.register("monthlyInvestment", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.monthlyInvestment && (
                <p className="text-sm text-red-600">{form.formState.errors.monthlyInvestment.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={compareMutation.isPending}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {compareMutation.isPending ? "비교 중..." : "종목 비교하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Comparisons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold text-gray-900">인기 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {popularComparisons.map((comparison, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-3 h-auto text-left justify-start"
                onClick={() => loadComparison(comparison.stockA, comparison.stockB)}
              >
                <div>
                  <div className="text-sm font-medium">{comparison.label}</div>
                  <div className="text-xs text-gray-500">{comparison.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
