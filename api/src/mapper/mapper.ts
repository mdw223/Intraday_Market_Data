import type { ChartResult, ChartMeta, TradingPeriod, Indicators, DailyData, Candle, MonthlyStockData } from "../types/types";
import { AppError } from "../middleware/AppError";

export function mapToMonthlyStockData(result: ChartResult): MonthlyStockData {
    const chartMeta: ChartMeta = result.meta;
    const tradingPeriods: TradingPeriod[][] = chartMeta.tradingPeriods;
    const timestamps: number[] = result.timestamp;
    const indicators: Indicators = result.indicators;
    const dailyData = groupByDay(tradingPeriods, timestamps, indicators);
    
    const metaData = {
        currency: chartMeta.currency,
        symbol: chartMeta.symbol,
        exchangeName: chartMeta.exchangeName,
        fullExchangeName: chartMeta.fullExchangeName,
        instrumentType: chartMeta.instrumentType,
        firstTradeDate: chartMeta.firstTradeDate,
        regularMarketTime: chartMeta.regularMarketTime,
        hasPrePostMarketData: chartMeta.hasPrePostMarketData,
        gmtoffset: chartMeta.gmtoffset,
        timezone: chartMeta.timezone,
        exchangeTimezoneName: chartMeta.exchangeTimezoneName,
        regularMarketPrice: chartMeta.regularMarketPrice,
        fiftyTwoWeekHigh: chartMeta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: chartMeta.fiftyTwoWeekLow,
        regularMarketDayHigh: chartMeta.regularMarketDayHigh,
        regularMarketDayLow: chartMeta.regularMarketDayLow,
        regularMarketVolume: chartMeta.regularMarketVolume,
        longName: chartMeta.longName,
        shortName: chartMeta.shortName,
        chartPreviousClose: chartMeta.chartPreviousClose,
        previousClose: chartMeta.previousClose,
        scale: chartMeta.scale,
        priceHint: chartMeta.priceHint,
        dataGranularity: chartMeta.dataGranularity,
        range: chartMeta.range,
    }
    const currentData = chartMeta.currentTradingPeriod;

    const monthlyStockData: MonthlyStockData = {
        currentData: currentData,
        metaData: metaData,
        dailyData: dailyData,
    }
    return monthlyStockData;
}

function groupByDay(tradingPeriods: TradingPeriod[][], timestamps: number[], indicators: Indicators): DailyData[] {
    const dailyData: DailyData[] = [];

    if (!tradingPeriods || !timestamps || !indicators || !indicators.quote) {
        throw new AppError("Invalid data structure: missing required fields", 422);
    }

    const quote = indicators.quote[0];
    if (!quote) {
        throw new AppError("Invalid data structure: missing quote indicators", 422);
    }

    // Build once outside the outer loop — O(M)
    const candlesByDate = new Map<string, Candle[]>();

    for (let i = 0; i < timestamps.length; i++) {
        const open   = quote.open[i];
        const high   = quote.high[i];
        const low    = quote.low[i];
        const close  = quote.close[i];
        const volume = quote.volume[i];
        const ts     = timestamps[i];

        // skip candle if any value is null/undefined — corrupt slot from Yahoo
        if (open == null || high == null || low == null || close == null || volume == null || ts == null) {
            continue;
        }

        const date = new Date(ts * 1000).toISOString().slice(0, 10);
        if (!candlesByDate.has(date)) {
            candlesByDate.set(date, []);
        }
        candlesByDate.get(date)!.push({ open, high, low, close, volume, timestamp: ts });
    }

    // Each day is now a O(1) map lookup
    for (const period of tradingPeriods) {
        const date = new Date(period[0]!.start * 1000).toISOString().slice(0, 10);
        const aDayOfCandles = candlesByDate.get(date) ?? [];

        const oneDayData: DailyData = {
            date: date,
            candles: aDayOfCandles,
            dayOpen: aDayOfCandles[0]?.open ?? 0,
            dayClose: aDayOfCandles[aDayOfCandles.length - 1]?.close ?? 0,
            dayHigh: aDayOfCandles.reduce((max, candle) => Math.max(max, candle.high), -Infinity),
            dayLow: aDayOfCandles.reduce((min, candle) => Math.min(min, candle.low), Infinity),
            dayVolume: aDayOfCandles.reduce((sum, candle) => sum + candle.volume, 0),
            dayReturnPercentage: 0,
        }
        oneDayData.dayReturnPercentage = oneDayData.dayOpen !== 0
            ? ((oneDayData.dayClose - oneDayData.dayOpen) / oneDayData.dayOpen) * 100
            : 0;
        dailyData.push(oneDayData);
    }

    return dailyData;
}