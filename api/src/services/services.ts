import type { DailyData, TradingPeriod, Indicators, MontlyStockData } from "../types/types";

function groupByDay(tradingPeriods: TradingPeriod[], timestamps: number[], indicators: Indicators[]): DailyData[] {
    const dailyData: DailyData[] = [];

    if (!tradingPeriods || !timestamps || !indicators) {
        throw new Error("Invalid data");
    }

    // TODO: Implement the logic to group the data by day

    return dailyData;
}


export const getStockData = (data: any) => {
    // TODO validate the data with types 
    // TODO handle Null values

    const tradingPeriods = data.chart.result[0].meta.tradingPeriods;
    const timestamps = data.chart.result[0].timestamp;
    const indicators = data.chart.result[0].indicators;
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