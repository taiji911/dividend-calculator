import { type User, type InsertUser, type StockData, type InsertStockData, type CalculationInput, type InsertCalculationInput, type CalculationResult, type InsertCalculationResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stock data methods
  getStockData(ticker: string): Promise<StockData | undefined>;
  getAllStocks(): Promise<StockData[]>;
  createStockData(stock: InsertStockData): Promise<StockData>;
  
  // Calculation methods
  saveCalculationInput(input: InsertCalculationInput): Promise<CalculationInput>;
  saveCalculationResults(results: InsertCalculationResult[]): Promise<CalculationResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stocks: Map<string, StockData>;
  private calculationInputs: Map<string, CalculationInput>;
  private calculationResults: Map<string, CalculationResult>;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.calculationInputs = new Map();
    this.calculationResults = new Map();
    
    // Initialize with mock stock data
    this.initializeMockStockData();
  }

  private initializeMockStockData() {
    const mockStocks: StockData[] = [
      {
        id: randomUUID(),
        ticker: "SCHD",
        name: "Schwab U.S. Dividend Equity ETF",
        sector: "Financial Services",
        dividendYield: 3.5,
        dividendGrowthRate: 12.0,
        priceGrowthRate: 10.0,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        ticker: "VTI",
        name: "Vanguard Total Stock Market ETF",
        sector: "Diversified",
        dividendYield: 1.8,
        dividendGrowthRate: 7.0,
        priceGrowthRate: 12.0,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        ticker: "SPY",
        name: "SPDR S&P 500 ETF Trust",
        sector: "Diversified",
        dividendYield: 1.6,
        dividendGrowthRate: 6.0,
        priceGrowthRate: 11.0,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        ticker: "QQQ",
        name: "Invesco QQQ Trust",
        sector: "Technology",
        dividendYield: 0.8,
        dividendGrowthRate: 10.0,
        priceGrowthRate: 15.0,
        lastUpdated: new Date(),
      },
    ];

    mockStocks.forEach(stock => {
      this.stocks.set(stock.ticker, stock);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStockData(ticker: string): Promise<StockData | undefined> {
    return this.stocks.get(ticker.toUpperCase());
  }

  async getAllStocks(): Promise<StockData[]> {
    return Array.from(this.stocks.values());
  }

  async createStockData(insertStock: InsertStockData): Promise<StockData> {
    const id = randomUUID();
    const stock: StockData = { 
      ...insertStock, 
      id, 
      lastUpdated: new Date(),
      ticker: insertStock.ticker.toUpperCase()
    };
    this.stocks.set(stock.ticker, stock);
    return stock;
  }

  async saveCalculationInput(insertInput: InsertCalculationInput): Promise<CalculationInput> {
    const id = randomUUID();
    const input: CalculationInput = { 
      ...insertInput, 
      id, 
      createdAt: new Date()
    };
    this.calculationInputs.set(id, input);
    return input;
  }

  async saveCalculationResults(insertResults: InsertCalculationResult[]): Promise<CalculationResult[]> {
    const results: CalculationResult[] = insertResults.map(insertResult => ({
      ...insertResult,
      id: randomUUID()
    }));
    
    results.forEach(result => {
      this.calculationResults.set(result.id, result);
    });
    
    return results;
  }
}

export const storage = new MemStorage();
