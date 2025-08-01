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

  // [초기값]
  let A = initialInvestment;  // A₀ = I₀
  let D = dividendYield / 100;  // D₁ = D₀ 
  let T = initialInvestment;  // T₀ = I₀
  let C = 0;  // C₀ = 0

  const yearlyData = [];

  // [연도별 반복 계산: for n in 1 to Y]
  for (let year = 1; year <= investmentPeriod; year++) {
    const M_annual = monthlyInvestment * 12;  // M × 12

    if (dripEnabled) {
      // 1) DRIP == True (배당 재투자):
      const A_base = A + M_annual;  // A_base = Aₙ₋₁ + (M × 12)
      const B_gross = A_base * D;   // Bₙ = A_base × Dₙ (세전)
      const B = B_gross * (1 - taxRate);  // 세후 배당금
      
      A = A_base + B;  // Aₙ = A_base + Bₙ
      T = T + M_annual;  // Tₙ = Tₙ₋₁ + (M × 12)
      C = C + B;  // Cₙ = Cₙ₋₁ + Bₙ

      // 수익률 계산
      const returnPercentage = T > 0 ? ((A / T) - 1) * 100 : 0;

      yearlyData.push({
        year,
        totalAssets: A,
        cumulativeDividends: C,
        annualDividends: B,
        totalInvested: T,
        returnPercentage,
      });

    } else {
      // 2) DRIP == False (배당 미재투자):
      A = A + M_annual;  // Aₙ = Aₙ₋₁ + (M × 12)
      const B_gross = A * D;  // Bₙ = Aₙ × Dₙ (세전)
      const B = B_gross * (1 - taxRate);  // 세후 배당금
      
      T = T + M_annual;  // Tₙ = Tₙ₋₁ + (M × 12)
      C = C + B;  // Cₙ = Cₙ₋₁ + Bₙ

      // 수익률 계산 (총 가치 = 자산 + 누적 배당금)
      const totalValue = A + C;
      const returnPercentage = T > 0 ? ((totalValue / T) - 1) * 100 : 0;

      yearlyData.push({
        year,
        totalAssets: A,  // DRIP 비활성화시에는 순수 자산만 표시
        cumulativeDividends: C,
        annualDividends: B,
        totalInvested: T,
        returnPercentage,
      });
    }

    // Dₙ₊₁ = Dₙ × (1 + G)
    D = D * (1 + dividendGrowthRate / 100);
  }

  // 최종 결과값 계산
  const finalAssets = dripEnabled ? A : (A + C);

  return {
    finalAssets,
    totalDividends: C,
    cagr: 0, // TODO: Implement CAGR calculation
    yearlyData,
    totalInvested: T,
  };
}