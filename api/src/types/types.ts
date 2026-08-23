/**
 * A single session window (start/end Unix timestamps + timezone) 
 * reused for pre, regular, post, and each entry in tradingPeriods
 */ 
export interface TradingPeriod {
    timezone: string;
    start: number;
    end: number;
    gmtoffset: number;
}

export interface CurrentTradingPeriod {
    pre: TradingPeriod;
    regular: TradingPeriod;
    post: TradingPeriod;
}

// All metadata in chart.result[0].meta — prices, exchange info, granularity, valid ranges, etc.
export interface ChartMeta {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    hasPrePostMarketData: boolean;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    longName: string;
    shortName: string;
    chartPreviousClose: number;
    previousClose: number;
    scale: number;
    priceHint: number;
    currentTradingPeriod: CurrentTradingPeriod;
    tradingPeriods: TradingPeriod[][];
    dataGranularity: string;
    range: string;
    validRanges: string[];
}

// The OHLCV arrays inside indicators.quote[0] — all number[] since the values are floats/integers
export interface Quote {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
}

export interface Indicators {
    quote: Quote[];
}

export interface ChartResult {
    meta: ChartMeta;
    timestamp: number[];
    indicators: Indicators;
}

export interface ChartError {
    code: string;
    description: string;
}

export interface ChartData {
    result: ChartResult[];
    error: ChartError;
}

export interface StockData {
    chart: ChartData;
}

/** Stock Data For the UI */

export interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}

export interface DailyData {
    date: string;
    candles: Candle[];
    dayOpen: number;
    dayClose: number;
    dayHigh: number;
    dayLow: number;
    dayVolume: number;
    dayReturnPercentage: number;
}

export interface MetaData {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    hasPrePostMarketData: boolean;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    longName: string;
    shortName: string;
    chartPreviousClose: number;
    previousClose: number;
    scale: number;
    priceHint: number;
    dataGranularity: string;
    range: string;
}

export interface MonthlyStockData {
    currentData: CurrentTradingPeriod;
    metaData: MetaData;
    dailyData: DailyData[];
}
 