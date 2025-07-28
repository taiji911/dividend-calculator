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
  currency: z.enum(["USD", "KRW"]).default("USD"),
  dripEnabled: z.boolean().default(true),
  stockTicker: z.string().optional(),
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
      
      // If stock ticker is provided, use its data
      let finalDividendYield = input.dividendYield;
      let finalDividendGrowthRate = input.dividendGrowthRate;
      
      if (input.stockTicker) {
        const stockData = await storage.getStockData(input.stockTicker);
        if (stockData) {
          finalDividendYield = stockData.dividendYield;
          finalDividendGrowthRate = stockData.dividendGrowthRate;
        }
      }

      // Perform calculation
      const results = calculateDividendGrowth({
        ...input,
        dividendYield: finalDividendYield,
        dividendGrowthRate: finalDividendGrowthRate,
      });

      // Save calculation input
      const savedInput = await storage.saveCalculationInput({
        initialInvestment: input.initialInvestment,
        monthlyInvestment: input.monthlyInvestment,
        investmentPeriod: input.investmentPeriod,
        dividendYield: finalDividendYield,
        dividendGrowthRate: finalDividendGrowthRate,
        currency: input.currency,
        dripEnabled: input.dripEnabled,
        stockTicker: input.stockTicker,
      });

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
      });

      const resultsB = calculateDividendGrowth({
        initialInvestment,
        monthlyInvestment,
        investmentPeriod,
        dividendYield: stockDataB.dividendYield,
        dividendGrowthRate: stockDataB.dividendGrowthRate,
        currency: "USD",
        dripEnabled: true,
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
}) {
  const {
    initialInvestment,
    monthlyInvestment,
    investmentPeriod,
    dividendYield,
    dividendGrowthRate,
    dripEnabled,
  } = params;

  let totalValue = initialInvestment;
  let totalDividends = 0;
  let totalInvested = initialInvestment;
  const yearlyData = [];
  
  let currentDividendYield = dividendYield / 100;

  for (let year = 1; year <= investmentPeriod; year++) {
    // Add monthly investments
    const yearlyInvestment = monthlyInvestment * 12;
    totalValue += yearlyInvestment;
    totalInvested += yearlyInvestment;
    
    // Calculate dividends based on portfolio value at beginning of year
    const yearlyDividend = totalValue * currentDividendYield;
    totalDividends += yearlyDividend;
    
    // Reinvest dividends if DRIP is enabled
    if (dripEnabled) {
      totalValue += yearlyDividend;
    }
    
    // Apply dividend growth rate for next year
    currentDividendYield *= (1 + dividendGrowthRate / 100);
    
    // Calculate return percentage
    const returnPercentage = ((totalValue + (dripEnabled ? 0 : totalDividends)) / totalInvested - 1) * 100;
    
    yearlyData.push({
      year,
      totalAssets: totalValue + (dripEnabled ? 0 : totalDividends),
      cumulativeDividends: totalDividends,
      annualDividends: yearlyDividend,
      totalInvested,
      returnPercentage,
    });
  }

  // Calculate CAGR
  const finalValue = totalValue + (dripEnabled ? 0 : totalDividends);
  const cagr = (Math.pow(finalValue / initialInvestment, 1 / investmentPeriod) - 1) * 100;

  return {
    finalAssets: finalValue,
    totalDividends,
    cagr,
    yearlyData,
    totalInvested,
  };
}
