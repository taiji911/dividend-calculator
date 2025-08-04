import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calculationInputs = pgTable("calculation_inputs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  initialInvestment: real("initial_investment").notNull(),
  monthlyInvestment: real("monthly_investment").notNull(),
  investmentPeriod: integer("investment_period").notNull(),
  dividendYield: real("dividend_yield").notNull(),
  dividendGrowthRate: real("dividend_growth_rate").notNull(),
  currency: text("currency").notNull().default("USD"),
  dripEnabled: boolean("drip_enabled").notNull().default(true),
  stockTicker: text("stock_ticker"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockData = pgTable("stock_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  dividendYield: real("dividend_yield").notNull(),
  dividendGrowthRate: real("dividend_growth_rate").notNull(),
  priceGrowthRate: real("price_growth_rate").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const calculationResults = pgTable("calculation_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inputId: varchar("input_id").references(() => calculationInputs.id).notNull(),
  year: integer("year").notNull(),
  totalAssets: real("total_assets").notNull(),
  cumulativeDividends: real("cumulative_dividends").notNull(),
  annualDividends: real("annual_dividends").notNull(),
  totalInvested: real("total_invested").notNull(),
});

// Zod schemas
export const insertCalculationInputSchema = createInsertSchema(calculationInputs).omit({
  id: true,
  createdAt: true,
});

export const insertStockDataSchema = createInsertSchema(stockData).omit({
  id: true,
  lastUpdated: true,
});

export const insertCalculationResultSchema = createInsertSchema(calculationResults).omit({
  id: true,
});

// Types
export type InsertCalculationInput = z.infer<typeof insertCalculationInputSchema>;
export type CalculationInput = typeof calculationInputs.$inferSelect;
export type InsertStockData = z.infer<typeof insertStockDataSchema>;
export type StockData = typeof stockData.$inferSelect;
export type InsertCalculationResult = z.infer<typeof insertCalculationResultSchema>;
export type CalculationResult = typeof calculationResults.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Dividend Calendar Types
export interface DividendEvent {
  symbol: string;
  date: string;
  label: string;
  adjDividend: number;
  dividend: number;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
}
