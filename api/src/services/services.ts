import type { MonthlyStockData, StockData } from "../types/types";
import { mapToMonthlyStockData } from "../mapper/mapper";
import { AppError } from "../middleware/AppError";
import { fetchStockData } from "../clients/yahooFinanceClient";
import redisClient from "../clients/redisClient";
import { TTL_SECONDS } from "../config/config";

const toCacheKey = (symbol: string) => `stock:${symbol}`;

export const getMonthlyStockData = async (symbol: string): Promise<MonthlyStockData> => {
    // 1. Check cache — fail gracefully if Redis is down
    try {
        const cached = await redisClient.get(toCacheKey(symbol));
        if (cached) return JSON.parse(cached) as MonthlyStockData;
    } catch (err) {
        console.error(`Cache read failed for ${symbol}:`, err);
    }

    // 2. Fetch from Yahoo and parse
    const rawData = await fetchStockData(symbol);
    const processed = parseStockData(rawData);

    // 3. Write to cache — fail gracefully so a Redis outage doesn't block the response
    try {
        await redisClient.set(toCacheKey(symbol), JSON.stringify(processed), { EX: TTL_SECONDS });
    } catch (err) {
        console.error(`Cache write failed for ${symbol}:`, err);
    }

    return processed;
};

const parseStockData = (data: StockData): MonthlyStockData => {
    if (data?.chart?.error) {
        throw new AppError(`Yahoo Finance error: ${data.chart.error.description}`, 422);
    }

    if (!data?.chart?.result?.[0]) {
        throw new AppError("No data returned for this symbol and range", 422);
    }

    const result = data.chart.result[0];
    if (!result.meta?.tradingPeriods || !result.timestamp || !result.indicators) {
        throw new AppError("Incomplete data structure returned from Yahoo Finance", 422);
    }

    return mapToMonthlyStockData(result);
};