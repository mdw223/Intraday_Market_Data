import { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, type UTCTimestamp } from "lightweight-charts";
import type { MonthlyStockData, DailyData } from "../../api/src/types/types";
import { ApiClient } from "./apiClient";
import "./dashboard.css";

const CHART_OPTIONS = {
  autoSize: true,
  height: 420,
  layout: {
    background: { color: '#161b22' },
    textColor: '#8b949e',
  },
  grid: {
    vertLines: { color: '#21262d' },
    horzLines: { color: '#21262d' },
  },
  crosshair: {
    vertLine: { color: '#30363d' },
    horzLine: { color: '#30363d' },
  },
};

export default function Dashboard() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<MonthlyStockData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyChartRef = useRef<HTMLDivElement>(null);
  const intradayChartRef = useRef<HTMLDivElement>(null);

  const monthlyChartData = stockData?.dailyData.map(d => ({
    time: d.date,
    open: d.dayOpen,
    high: d.dayHigh,
    low: d.dayLow,
    close: d.dayClose,
  })) ?? [];

  const monthlyVolumeData = stockData?.dailyData.map(d => ({
    time: d.date,
    value: d.dayVolume,
    color: d.dayClose >= d.dayOpen ? '#26a69a' : '#ef5350',
  })) ?? [];

  const intradayChartData = selectedDay?.candles.map(c => ({
    time: c.timestamp as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  })) ?? [];

  const intradayVolumeData = selectedDay?.candles.map(c => ({
    time: c.timestamp as UTCTimestamp,
    value: c.volume,
    color: c.close >= c.open ? '#26a69a' : '#ef5350',
  })) ?? [];

  async function handleSearch() {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedDay(null);
    try {
      const data = await ApiClient.getStockData(symbol.toUpperCase());
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  // Monthly chart
  useEffect(() => {
    if (!monthlyChartRef.current || monthlyChartData.length === 0) return;

    const chart = createChart(monthlyChartRef.current, CHART_OPTIONS);

    const candleSeries = chart.addSeries(CandlestickSeries);
    candleSeries.setData(monthlyChartData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceFormat: { type: 'volume' },
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(monthlyVolumeData);

    chart.subscribeClick(param => {
      if (!param.time || !stockData) return;
      const clicked = stockData.dailyData.find(d => d.date === param.time);
      if (clicked) setSelectedDay(clicked);
    });

    return () => chart.remove();
  }, [monthlyChartData]);

  // Intraday chart
  useEffect(() => {
    if (!intradayChartRef.current || intradayChartData.length === 0) return;

    const chart = createChart(intradayChartRef.current, CHART_OPTIONS);

    const candleSeries = chart.addSeries(CandlestickSeries);
    candleSeries.setData(intradayChartData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceFormat: { type: 'volume' },
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(intradayVolumeData);

    return () => chart.remove();
  }, [intradayChartData]);

  const isBull = selectedDay ? selectedDay.dayReturnPercentage >= 0 : true;

  return (
    <>
      {/* Navbar */}
      <nav className="db-navbar">
        <div className="db-navbar__brand">
          IMD <span>Intraday Market Data</span>
        </div>
        <div className="db-navbar__search">
          <input
            className="db-input"
            type="text"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ticker symbol — e.g. AAPL"
          />
          <button
            className={`db-btn${loading ? ' db-btn--loading' : ''}`}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Search'}
          </button>
        </div>
      </nav>

      {/* Page body */}
      <main className="db-page">
        <div className="db-content">

          {error && <p className="db-error">{error}</p>}

          {/* Stock stats panel */}
          {stockData && (
            <div className="db-stats">
              <div className="db-stat db-stat--price">
                <div className="db-stat__label">Symbol</div>
                <div className="db-stat__value db-stat__value--large">{stockData.metaData.symbol}</div>
              </div>
              <div className="db-stat" style={{ flex: 2 }}>
                <div className="db-stat__label">Name</div>
                <div className="db-stat__value">{stockData.metaData.longName}</div>
              </div>
              <div className="db-stat db-stat--price">
                <div className="db-stat__label">Price</div>
                <div className="db-stat__value db-stat__value--large">
                  {stockData.metaData.regularMarketPrice.toFixed(2)}
                </div>
              </div>
              <div className="db-stat">
                <div className="db-stat__label">52W High</div>
                <div className="db-stat__value db-stat__value--bull">
                  {stockData.metaData.fiftyTwoWeekHigh.toFixed(2)}
                </div>
              </div>
              <div className="db-stat">
                <div className="db-stat__label">52W Low</div>
                <div className="db-stat__value db-stat__value--bear">
                  {stockData.metaData.fiftyTwoWeekLow.toFixed(2)}
                </div>
              </div>
              <div className="db-stat">
                <div className="db-stat__label">Exchange</div>
                <div className="db-stat__value">{stockData.metaData.fullExchangeName}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat__label">Currency</div>
                <div className="db-stat__value">{stockData.metaData.currency}</div>
              </div>
            </div>
          )}

          {/* Monthly chart */}
          {monthlyChartData.length > 0 && (
            <div className="db-section">
              <div className="db-section__header">
                <span className="db-section__label">Monthly Overview</span>
                <div className="db-section__rule" />
                <span className="db-section__label" style={{ opacity: 0.45 }}>click a candle to drill into that day</span>
              </div>
              <div ref={monthlyChartRef} style={{ width: '100%' }} />
            </div>
          )}

          {/* Intraday chart */}
          {selectedDay && (
            <div className="db-section">
              <div className="db-section__header">
                <span className="db-section__label">Intraday — {selectedDay.date}</span>
                <div className="db-section__rule" />
                <span className={`db-section__badge ${isBull ? 'db-section__badge--bull' : 'db-section__badge--bear'}`}>
                  {isBull ? '+' : ''}{selectedDay.dayReturnPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="db-intraday-panel">
                <div className="db-intraday-panel__chart" ref={intradayChartRef} />
                <div className={`db-intraday-stats ${isBull ? 'db-intraday-stats--bull' : 'db-intraday-stats--bear'}`}>
                  <IntradayStat label="Open"   value={selectedDay.dayOpen.toFixed(2)} />
                  <IntradayStat label="Close"  value={selectedDay.dayClose.toFixed(2)} />
                  <IntradayStat label="High"   value={selectedDay.dayHigh.toFixed(2)} />
                  <IntradayStat label="Low"    value={selectedDay.dayLow.toFixed(2)} />
                  <IntradayStat label="Volume" value={formatVolume(selectedDay.dayVolume)} />
                  <div className="db-intraday-stat">
                    <div className="db-intraday-stat__label">Return</div>
                    <div className={`db-intraday-stat__value ${isBull ? 'db-intraday-stat__value--bull' : 'db-intraday-stat__value--bear'}`}>
                      {isBull ? '+' : ''}{selectedDay.dayReturnPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!stockData && !loading && !error && (
            <div className="db-empty">
              <div className="db-empty__icon">📈</div>
              <div className="db-empty__text">Search for a ticker to get started</div>
              <div className="db-empty__hint">e.g. AAPL · TSLA · MSFT · NVDA</div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

function IntradayStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="db-intraday-stat">
      <div className="db-intraday-stat__label">{label}</div>
      <div className="db-intraday-stat__value">{value}</div>
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + 'B';
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(2) + 'M';
  if (v >= 1_000)         return (v / 1_000).toFixed(1) + 'K';
  return String(v);
}
