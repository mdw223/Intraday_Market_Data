import type { Request, Response, NextFunction } from "express";
import { getStockData } from "../services/services";

const SYMBOL_REGEX = /^[A-Z0-9][A-Z0-9.\-]{0,9}$/;

export const getStocks = async (req: Request, res: Response, next: NextFunction) => {
    const symbol = (req.params.symbol as string)?.toUpperCase().trim();
    if (!symbol || !SYMBOL_REGEX.test(symbol)) {
        res.status(400).json({
            error: "Invalid symbol. Must be 1-10 characters: letters, digits, hyphens, or dots (e.g. TSLA, BRK-B, BF.B).",
        });
        return;
    }

    // todo: get for last month
    // todo: groups results by day
    const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=15m&range=5d`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );
    if (!response.ok) {
        if (response.status === 404) {
            res.status(404).json({ error: `Symbol '${symbol}' not found.` });
            return;
        }
        // pass the error to express error handler
        return next(new Error(`Yahoo Finance error: ${response.status} ${response.statusText}`));
    }
    const data = await response.json();
    res.json(getStockData(data));
    // use a service to parse the data to get the day, lowAverage, highAverage, and volume
};