import type { Request, Response, NextFunction } from "express";
import { getStockData } from "../services/services";
import { fetchStockData } from "../clients/yahooFinanceClient";

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
        const rawStockData = await fetchStockData(symbol);
        const processedStockData = getStockData(rawStockData);
        return res.json(processedStockData);
    } catch (error) {
        return next(error);
    }
};