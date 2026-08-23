import { YAHOO_BASE_URL, YAHOO_INTERVAL, YAHOO_RANGE } from "../config/config";
import { AppError } from "../middleware/AppError";
import type { StockData } from "../types/types";

export async function fetchStockData(symbol: string): Promise<StockData> {
    const url = `${YAHOO_BASE_URL}/${symbol}?interval=${YAHOO_INTERVAL}&range=${YAHOO_RANGE}`;
    let response: globalThis.Response;

    try {
        response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });
    } catch {
        throw new AppError("Failed to reach Yahoo Finance. Check network connectivity.", 502);
    }

    if (!response.ok) {
        if (response.status === 404) {
            throw new AppError(`Symbol '${symbol}' not found.`, 404);
        }
        if (response.status === 429) {
            throw new AppError("Rate limited by Yahoo Finance. Please wait before retrying.", 429);
        }
        if (response.status === 401 || response.status === 403) {
            throw new AppError(`Yahoo Finance rejected the request (${response.status}). The API may require authentication.`, 401);
        }
        if (response.status >= 500) {
            throw new AppError(`Yahoo Finance is temporarily unavailable (${response.status}).`, 503);
        }
        throw new AppError(`Yahoo Finance error: ${response.status} ${response.statusText}`, 502);
    }

    try {
        return await response.json() as StockData;
    } catch {
        throw new AppError("Failed to parse Yahoo Finance response as JSON.", 502);
    }
}