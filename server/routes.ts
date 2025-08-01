import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationInputSchema, insertStockDataSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const calculateDividendReinvestmentSchema = z.object({
  initialInvestment: z.number().min(0),
  monthlyInvestment: z.number().min(0),
  investmentPeriod: z.number().min(1).max(50),
  dividendYield: z.number().min(0).max(50),
  dividendGrowthRate: z.number().min(-10).max(50),
  currency: z.enum(["USD", "KRW"]).default("KRW"),
  dripEnabled: z.boolean().default(true),
  taxCountry: z.enum(["KR", "US"]).default("KR"),
  taxType: z.enum(["taxable", "tax_free"]).default("taxable"),
});

const compareStocksSchema = z.object({
  stockA: z.string().min(1),
  stockB: z.string().min(1),
  initialInvestment: z.number().min(0),
  monthlyInvestment: z.number().min(0),
  investmentPeriod: z.number().min(1).max(50),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all available stocks
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getAllStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  // Get specific stock data
  app.get("/api/stocks/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const stock = await storage.getStockData(ticker);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  // Calculate dividend reinvestment
  app.post("/api/calculate", async (req, res) => {
    try {
      const validation = calculateDividendReinvestmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        const validationError = fromZodError(validation.error);
        return res.status(400).json({ message: validationError.message });
      }

      const input = validation.data;

      // Perform calculation
      const results = calculateDividendGrowth(input);

      // Save calculation input (optional - remove if not needed)
      // const savedInput = await storage.saveCalculationInput({
      //   initialInvestment: input.initialInvestment,
      //   monthlyInvestment: input.monthlyInvestment,
      //   investmentPeriod: input.investmentPeriod,
      //   dividendYield: input.dividendYield,
      //   dividendGrowthRate: input.dividendGrowthRate,
      //   currency: input.currency,
      //   dripEnabled: input.dripEnabled,
      //   stockTicker: null,
      // });

      res.json(results);
    } catch (error) {
      console.error("Calculation error:", error);
      res.status(500).json({ message: "Failed to perform calculation" });
    }
  });

  // Compare stocks
  app.post("/api/compare", async (req, res) => {
    try {
      const validation = compareStocksSchema.safeParse(req.body);
      
      if (!validation.success) {
        const validationError = fromZodError(validation.error);
        return res.status(400).json({ message: validationError.message });
      }

      const { stockA, stockB, initialInvestment, monthlyInvestment, investmentPeriod } = validation.data;

      // Get stock data
      const stockDataA = await storage.getStockData(stockA);
      const stockDataB = await storage.getStockData(stockB);

      if (!stockDataA || !stockDataB) {
        return res.status(404).json({ 
          message: `Stock data not found for ${!stockDataA ? stockA : stockB}` 
        });
      }

      // Calculate for both stocks
      const resultsA = calculateDividendGrowth({
        initialInvestment,
        monthlyInvestment,
        investmentPeriod,
        dividendYield: stockDataA.dividendYield,
        dividendGrowthRate: stockDataA.dividendGrowthRate,
        currency: "USD",
        dripEnabled: true,
        taxCountry: "US",
        taxType: "taxable",
      });

      const resultsB = calculateDividendGrowth({
        initialInvestment,
        monthlyInvestment,
        investmentPeriod,
        dividendYield: stockDataB.dividendYield,
        dividendGrowthRate: stockDataB.dividendGrowthRate,
        currency: "USD",
        dripEnabled: true,
        taxCountry: "US",
        taxType: "taxable",
      });

      res.json({
        stockA: {
          ...stockDataA,
          results: resultsA,
        },
        stockB: {
          ...stockDataB,
          results: resultsB,
        },
      });
    } catch (error) {
      console.error("Comparison error:", error);
      res.status(500).json({ message: "Failed to perform comparison" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Dividend growth calculation function
function calculateDividendGrowth(params: {
  initialInvestment: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  dividendYield: number;
  dividendGrowthRate: number;
  currency: string;
  dripEnabled: boolean;
  taxCountry: "KR" | "US";
  taxType: "taxable" | "tax_free";
}) {
  const {
    initialInvestment,
    monthlyInvestment,
    investmentPeriod,
    dividendYield,
    dividendGrowthRate,
    dripEnabled,
    taxCountry,
    taxType,
  } = params;

  // Tax rates based on country and account type
  const getTaxRate = (country: "KR" | "US", accountType: "taxable" | "tax_free"): number => {
    if (accountType === "tax_free") return 0;
    
    if (country === "KR") {
      return 0.154; // 한국 배당세율 15.4% (지방세 포함)
    } else {
      return 0.15; // 미국 배당세율 15% (한미조세협정 기준)
    }
  };

  const taxRate = getTaxRate(taxCountry, taxType);

  // Initialize variables
  let totalAssets = initialInvestment; // 총 자산 (원금 + 누적 배당금)
  let totalDividends = 0; // 누적 배당금
  let totalInvested = initialInvestment; // 누적 투자 원금
  const yearlyData = [];
  
  let currentDividendYield = dividendYield / 100; // 현재 배당률

  for (let year = 1; year <= investmentPeriod; year++) {
    // 1. 연초 자산 기준으로 배당금 계산 (전년도 말 자산 기준)
    const grossAnnualDividend = totalAssets * currentDividendYield;
    const netAnnualDividend = grossAnnualDividend * (1 - taxRate);
    
    // 2. 배당금 즉시 재투자 (DRIP 활성화 시)
    if (dripEnabled) {
      totalAssets += netAnnualDividend;
    }
    
    // 3. 연간 투자금 추가 (월 투자금 × 12개월)
    const annualInvestment = monthlyInvestment * 12;
    totalAssets += annualInvestment;
    totalInvested += annualInvestment;
    
    // 4. 누적 배당금 기록
    totalDividends += netAnnualDividend;
    
    // 5. 수익률 계산
    const currentTotalValue = dripEnabled ? totalAssets : (totalAssets + totalDividends - netAnnualDividend);
    const returnPercentage = totalInvested > 0 ? ((currentTotalValue / totalInvested) - 1) * 100 : 0;
    
    // 6. 연도별 데이터 저장
    yearlyData.push({
      year,
      totalAssets: currentTotalValue,
      cumulativeDividends: totalDividends,
      annualDividends: netAnnualDividend,
      totalInvested,
      returnPercentage,
    });
    
    // 7. 다음 해를 위한 배당 성장률 적용
    currentDividendYield *= (1 + dividendGrowthRate / 100);
  }

  // CAGR 계산
  const finalValue = dripEnabled ? totalAssets : (totalAssets + totalDividends);
  let cagr = 0;
  
  if (initialInvestment > 0) {
    cagr = (Math.pow(finalValue / initialInvestment, 1 / investmentPeriod) - 1) * 100;
  } else if (totalInvested > 0) {
    // 초기 투자가 없을 때는 평균 연간 투자금 기준으로 계산
    const avgAnnualInvestment = totalInvested / investmentPeriod;
    cagr = (Math.pow(finalValue / avgAnnualInvestment, 1 / investmentPeriod) - 1) * 100;
  }

  return {
    finalAssets: finalValue,
    totalDividends,
    cagr,
    yearlyData,
    totalInvested,
  };
}
