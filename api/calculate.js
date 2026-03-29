const TAX_RATES = {
  KR: { taxable: 0.154, tax_free: 0 },
  US: { taxable: 0.15, tax_free: 0 },
  CUSTOM: { taxable: 0, tax_free: 0 },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      initialInvestment = 0,
      monthlyInvestment = 0,
      investmentPeriod = 10,
      dividendYield = 3.5,
      dividendGrowthRate = 5,
      dripEnabled = true,
      taxCountry = "KR",
      taxType = "taxable",
      customTaxRate = 0,
    } = req.body;

    const taxRate =
      taxCountry === "CUSTOM"
        ? customTaxRate / 100
        : (TAX_RATES[taxCountry]?.[taxType] ?? 0.154);

    let totalAssets = initialInvestment;
    let cumulativeDividends = 0;
    let totalInvested = initialInvestment;
    const yearlyData = [];

    const totalMonths = investmentPeriod * 12;
    let prevYearCumulativeDividends = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const year = Math.ceil(month / 12);

      // 월 배당률 = 연 배당률(성장 반영) / 12
      const annualYieldForYear =
        (dividendYield / 100) *
        Math.pow(1 + dividendGrowthRate / 100, year - 1);
      const monthlyYieldRate = annualYieldForYear / 12;

      // 월 배당금
      const grossMonthlyDividend = totalAssets * monthlyYieldRate;
      const netMonthlyDividend = grossMonthlyDividend * (1 - taxRate);

      cumulativeDividends += netMonthlyDividend;
      totalInvested += monthlyInvestment;

      if (dripEnabled) {
        totalAssets += netMonthlyDividend + monthlyInvestment;
      } else {
        totalAssets += monthlyInvestment;
      }

      // 연도 마지막 달에 yearlyData 추가
      if (month % 12 === 0) {
        const annualDividends = cumulativeDividends - prevYearCumulativeDividends;
        prevYearCumulativeDividends = cumulativeDividends;

        const returnPercentage =
          totalInvested > 0
            ? ((totalAssets - totalInvested) / totalInvested) * 100
            : 0;

        // YoC: 초기 투자 원금 대비 연간 배당률
        const yieldOnCost =
          initialInvestment > 0
            ? (annualDividends / initialInvestment) * 100
            : 0;

        yearlyData.push({
          year: month / 12,
          totalAssets: Math.round(totalAssets),
          cumulativeDividends: Math.round(cumulativeDividends),
          annualDividends: Math.round(annualDividends),
          totalInvested: Math.round(totalInvested),
          returnPercentage: Math.round(returnPercentage * 10) / 10,
          holdingAssets: Math.round(totalAssets - cumulativeDividends),
          yieldOnCost: Math.round(yieldOnCost * 100) / 100,
        });
      }
    }

    const cagr =
      initialInvestment > 0
        ? (Math.pow(totalAssets / initialInvestment, 1 / investmentPeriod) - 1) * 100
        : 0;

    return res.status(200).json({
      finalAssets: Math.round(totalAssets),
      totalDividends: Math.round(cumulativeDividends),
      cagr: Math.round(cagr * 10) / 10,
      yearlyData,
      totalInvested: Math.round(totalInvested),
      initialInvestment: Math.round(initialInvestment),
    });
  } catch (error) {
    return res.status(500).json({ error: "Calculation failed" });
  }
}
