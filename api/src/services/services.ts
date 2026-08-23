import type { StockData } from "../types/types";

export const getStockData = (data: any) => {
    const stockData = data.chart.result[0];
    // TODO: parse...
    return stockData;
}