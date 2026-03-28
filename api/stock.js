export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker is required" });
  }

  try {
    const symbol = ticker.toUpperCase().trim();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d&includePrePost=false`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Ticker not found" });
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return res.status(404).json({ error: "No data found for this ticker" });
    }

    const dividendYield =
      meta.dividendYield != null
        ? Math.round(meta.dividendYield * 100) / 100
        : null;

    const trailingYield =
      meta.trailingAnnualDividendYield != null
        ? Math.round(meta.trailingAnnualDividendYield * 10000) / 100
        : null;

    const finalYield = dividendYield ?? trailingYield;

    if (finalYield == null || finalYield === 0) {
      return res.status(200).json({
        ticker: symbol,
        name: meta.longName || meta.shortName || symbol,
        dividendYield: null,
        message: "이 종목은 배당금을 지급하지 않거나 데이터가 없습니다.",
      });
    }

    return res.status(200).json({
      ticker: symbol,
      name: meta.longName || meta.shortName || symbol,
      dividendYield: finalYield,
      currency: meta.currency || "USD",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
