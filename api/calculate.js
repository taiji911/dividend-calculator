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

    for (let year = 1; year <= investmentPeriod; year++) {
      const yearlyMonthlyContribution = monthlyInvestment * 12;
      totalInvested += yearlyMonthlyContribution;

      const currentYield =
        (dividendYield / 100) *
        Math.pow(1 + dividendGrowthRate / 100, year - 1);

      const grossDividends = totalAssets * currentYield;
      const netDividends = grossDividends * (1 - taxRate);

      cumulativeDividends += netDividends;

      if (dripEnabled) {
        totalAssets += netDividends + yearlyMonthlyContribution;
      } else {
        totalAssets += yearlyMonthlyContribution;
      }

      const returnPercentage =
        totalInvested > 0
          ? ((totalAssets - totalInvested) / totalInvested) * 100
          : 0;

      yearlyData.push({
        year,
        totalAssets: Math.round(totalAssets),
        cumulativeDividends: Math.round(cumulativeDividends),
        annualDividends: Math.round(netDividends),
        totalInvested: Math.round(totalInvested),
        returnPercentage: Math.round(returnPercentage * 10) / 10,
        holdingAssets: Math.round(totalAssets - cumulativeDividends),
      });
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
    });
  } catch (error) {
    return res.status(500).json({ error: "Calculation failed" });
  }
}
