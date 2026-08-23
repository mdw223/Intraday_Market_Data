import type { DailyData, TradingPeriod, Indicators, MontlyStockData, Candle } from "../types/types";

function groupByDay(tradingPeriods: TradingPeriod[][], timestamps: number[], indicators: Indicators): DailyData[] {
    const dailyData: DailyData[] = [];

    if (!tradingPeriods || !timestamps || !indicators || !indicators.quote) {
        throw new Error("Invalid data");
    }

    // contains the 5 indicators per timestamp
    const quote = indicators.quote[0];
    if (!quote) {
        throw new Error("Invalid quote");
    }

    // Build once outside the outer loop — O(M)
    const candlesByDate = new Map<string, Candle[]>();

    for (let i = 0; i < timestamps.length; i++) {
        // get the date of the timestamp
        const date = new Date(timestamps[i]! * 1000).toISOString().slice(0, 10);
        // if the date is not in the map, add it
        if (!candlesByDate.has(date)) {
            candlesByDate.set(date, []);
        }
        // add the candle to the date
        const candle: Candle = {
            open: quote.open[i] ?? 0,
            high: quote.high[i] ?? 0,
            low: quote.low[i] ?? 0,
            close: quote.close[i] ?? 0,
            volume: quote.volume[i] ?? 0,
            timestamp: timestamps[i]!,
        }
        candlesByDate.get(date)!.push(candle);
    }

    // Each day is now a O(1) map lookup
    for (const period of tradingPeriods) {
        const date = new Date(period[0]!.start * 1000).toISOString().slice(0, 10);
        const aDayOfCandles = candlesByDate.get(date) ?? [];
        const start = period[0]?.start ?? 0;

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
        oneDayData.dayReturnPercentage = oneDayData.dayOpen !== 0 ? ((oneDayData.dayClose - oneDayData.dayOpen) / oneDayData.dayOpen) * 100 : 0;
        dailyData.push(oneDayData);
    }

    return dailyData;
}


export const getStockData = (data: any) => {
    // TODO validate the data with types 
    // TODO handle Null values

    const tradingPeriods: TradingPeriod[][] = data.chart.result[0].meta.tradingPeriods;
    const timestamps: number[] = data.chart.result[0].timestamp;
    const indicators: Indicators = data.chart.result[0].indicators;
    const dailyData = groupByDay(tradingPeriods, timestamps, indicators);

    const metaData = {
        currency: data.chart.result[0].meta.currency,
        symbol: data.chart.result[0].meta.symbol,
        exchangeName: data.chart.result[0].meta.exchangeName,
        fullExchangeName: data.chart.result[0].meta.fullExchangeName,
        instrumentType: data.chart.result[0].meta.instrumentType,
        firstTradeDate: data.chart.result[0].meta.firstTradeDate,
        regularMarketTime: data.chart.result[0].meta.regularMarketTime,
        hasPrePostMarketData: data.chart.result[0].meta.hasPrePostMarketData,
        gmtoffset: data.chart.result[0].meta.gmtoffset,
        timezone: data.chart.result[0].meta.timezone,
        exchangeTimezoneName: data.chart.result[0].meta.exchangeTimezoneName,
        regularMarketPrice: data.chart.result[0].meta.regularMarketPrice,
        fiftyTwoWeekHigh: data.chart.result[0].meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: data.chart.result[0].meta.fiftyTwoWeekLow,
        regularMarketDayHigh: data.chart.result[0].meta.regularMarketDayHigh,
        regularMarketDayLow: data.chart.result[0].meta.regularMarketDayLow,
        regularMarketVolume: data.chart.result[0].meta.regularMarketVolume,
        longName: data.chart.result[0].meta.longName,
        shortName: data.chart.result[0].meta.shortName,
        chartPreviousClose: data.chart.result[0].meta.chartPreviousClose,
        previousClose: data.chart.result[0].meta.previousClose,
        scale: data.chart.result[0].meta.scale,
        priceHint: data.chart.result[0].meta.priceHint,
        dataGranularity: data.chart.result[0].meta.dataGranularity,
        range: data.chart.result[0].meta.range,
    }
    const currentData = data.chart.result[0].meta.currentTradingPeriod;
    const stockData: MontlyStockData = {dailyData, currentData, metaData};
    return stockData;
}