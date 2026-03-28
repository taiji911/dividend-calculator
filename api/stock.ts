import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker is required" });
  }

  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker.toUpperCase()}?modules=summaryDetail,price`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Ticker not found" });
    }

    const data = await response.json();
    const result = data?.quoteSummary?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: "No data found for this ticker" });
    }

    const summaryDetail = result.summaryDetail;
    const price = result.price;

    const dividendYield =
      summaryDetail?.dividendYield?.raw != null
        ? summaryDetail.dividendYield.raw * 100
        : null;

    const trailingAnnualDividendYield =
      summaryDetail?.trailingAnnualDividendYield?.raw != null
        ? summaryDetail.trailingAnnualDividendYield.raw * 100
        : null;

    const finalYield = dividendYield ?? trailingAnnualDividendYield;

    if (finalYield == null) {
      return res.status(200).json({
        ticker: ticker.toUpperCase(),
        name: price?.longName || price?.shortName || ticker.toUpperCase(),
        dividendYield: null,
        message: "이 종목은 배당금을 지급하지 않거나 데이터가 없습니다.",
      });
    }

    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      name: price?.longName || price?.shortName || ticker.toUpperCase(),
      dividendYield: Math.round(finalYield * 100) / 100,
      currency: summaryDetail?.currency || "USD",
      exDividendDate: summaryDetail?.exDividendDate?.fmt || null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
