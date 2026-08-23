import type { MonthlyStockData, StockData } from "../types/types";
import { mapToMonthlyStockData } from "../mapper/mapper";
import { AppError } from "../middleware/AppError";

export const getStockData = (data: StockData): MonthlyStockData => {
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
}