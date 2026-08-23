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
    let response: globalThis.Response;

    // try, catch if network error
    try {
        // fetches last month data for 15 minute intervals for the given symbol
        response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=15m&range=1mo`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            }
        );
    } catch (error) {
        return next(new Error("Failed to reach Yahoo Finance. Check network connectivity."));
    }

    if (!response.ok) {
        if (response.status === 404) {
            res.status(404).json({ error: `Symbol '${symbol}' not found.` });
            return;
        }
        if (response.status === 429) {
            res.status(429).json({
                error: "Rate limited by Yahoo Finance. Please wait before retrying.",
            });
            return;
        }
        if (response.status === 401 || response.status === 403) {
            return next(new Error(`Yahoo Finance rejected the request (${response.status}). The API may require authentication.`));
        }
        if (response.status >= 500) {
            return next(new Error(`Yahoo Finance is temporarily unavailable (${response.status}).`));
        }
        // pass the error to express error handler
        return next(new Error(`Yahoo Finance error: ${response.status} ${response.statusText}`));
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        return next(new Error("Failed to parse Yahoo Finance response as JSON."));
    }
    res.json(getStockData(data));
};