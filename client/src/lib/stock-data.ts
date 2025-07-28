export interface StockInfo {
  ticker: string;
  name: string;
  sector?: string;
  dividendYield: number;
  dividendGrowthRate: number;
  priceGrowthRate: number;
}

// Mock stock data for demonstration
export const MOCK_STOCK_DATA: Record<string, StockInfo> = {
  SCHD: {
    ticker: "SCHD",
    name: "Schwab U.S. Dividend Equity ETF",
    sector: "Financial Services",
    dividendYield: 3.5,
    dividendGrowthRate: 12.0,
    priceGrowthRate: 10.0,
  },
  VTI: {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    sector: "Diversified",
    dividendYield: 1.8,
    dividendGrowthRate: 7.0,
    priceGrowthRate: 12.0,
  },
  SPY: {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    sector: "Diversified",
    dividendYield: 1.6,
    dividendGrowthRate: 6.0,
    priceGrowthRate: 11.0,
  },
  QQQ: {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    sector: "Technology",
    dividendYield: 0.8,
    dividendGrowthRate: 10.0,
    priceGrowthRate: 15.0,
  },
  VYM: {
    ticker: "VYM",
    name: "Vanguard High Dividend Yield ETF",
    sector: "Diversified",
    dividendYield: 2.9,
    dividendGrowthRate: 5.5,
    priceGrowthRate: 9.0,
  },
  VXUS: {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    sector: "International",
    dividendYield: 2.1,
    dividendGrowthRate: 4.0,
    priceGrowthRate: 8.0,
  },
};

export function getStockInfo(ticker: string): StockInfo | null {
  return MOCK_STOCK_DATA[ticker.toUpperCase()] || null;
}

export function getAllStocks(): StockInfo[] {
  return Object.values(MOCK_STOCK_DATA);
}

export function searchStocks(query: string): StockInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(MOCK_STOCK_DATA).filter(
    stock => 
      stock.ticker.toLowerCase().includes(lowercaseQuery) ||
      stock.name.toLowerCase().includes(lowercaseQuery)
  );
}
