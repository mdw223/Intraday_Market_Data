import type { Request, Response, NextFunction } from "express";
import { getMonthlyStockData } from "../services/services";

const SYMBOL_REGEX = /^[A-Z0-9][A-Z0-9.\-]{0,9}$/;

export const getStocks = async (req: Request, res: Response, next: NextFunction) => {
    const symbol = (req.params.symbol as string)?.toUpperCase().trim();
    if (!symbol || !SYMBOL_REGEX.test(symbol)) {
        res.status(400).json({
            error: "Invalid symbol. Must be 1-10 characters: letters, digits, hyphens, or dots (e.g. TSLA, BRK-B, BF.B).",
        });
        return;
    }

    try {
        const stockData = await getMonthlyStockData(symbol);
        return res.json(stockData);
    } catch (error) {
        return next(error);
    }
};