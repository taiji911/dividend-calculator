export interface DividendCalculationParams {
  initialInvestment: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  dividendYield: number;
  dividendGrowthRate: number;
  dripEnabled: boolean;
}

export interface DividendCalculationResult {
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

export function calculateDividendReinvestment(params: DividendCalculationParams): DividendCalculationResult {
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

export function formatCurrency(amount: number, currency: "USD" | "KRW" = "USD"): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "ko-KR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}
