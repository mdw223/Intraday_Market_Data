import type { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { getStockData } from "../services/services";

export const getStocks = async (req: Request, res: Response) => {
    const response = await fetch(
        "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=15m&range=5d",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );
    if (!response.ok) {
        errorHandler(new Error(`HTTP error! status: ${response.status} ${response.statusText}`), req as Request, res as Response);
    }
    const data = await response.json();
    res.json(getStockData(data));
    // use a service to parse the data to get the day, lowAverage, highAverage, and volume
};