import { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, type UTCTimestamp } from "lightweight-charts";
import type { MonthlyStockData, DailyData } from "../../api/src/types/types";
import { ApiClient } from "./apiClient";

const CHART_OPTIONS = {
  autoSize: true,
  height: 400,
  layout: {
    background: { color: '#1a1a2e' },
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: { color: '#2a2a3e' },
    horzLines: { color: '#2a2a3e' },
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

  return (
    <div style={{ padding: '24px', background: '#0f0f1a', minHeight: '100vh', color: '#d1d4dc', fontFamily: 'monospace' }}>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter ticker symbol (e.g. AAPL)"
          style={{ padding: '10px 14px', background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#d1d4dc', borderRadius: '4px', width: '280px', fontSize: '14px' }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#26a69a', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {/* Inline error */}
      {error && (
        <p style={{ color: '#ef5350', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
      )}

      {/* Stats panel */}
      {stockData && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px', padding: '16px', background: '#1a1a2e', borderRadius: '6px' }}>
          <Stat label="Symbol" value={stockData.metaData.symbol} />
          <Stat label="Name" value={stockData.metaData.longName} />
          <Stat label="Exchange" value={stockData.metaData.fullExchangeName} />
          <Stat label="Currency" value={stockData.metaData.currency} />
          <Stat label="Price" value={`${stockData.metaData.regularMarketPrice.toFixed(2)}`} />
          <Stat label="52W High" value={`${stockData.metaData.fiftyTwoWeekHigh.toFixed(2)}`} />
          <Stat label="52W Low" value={`${stockData.metaData.fiftyTwoWeekLow.toFixed(2)}`} />
        </div>
      )}

      {/* Monthly chart */}
      {monthlyChartData.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Monthly Overview — click a candle to drill into that day
          </h2>
          <div ref={monthlyChartRef} style={{ width: '100%' }} />
        </div>
      )}

      {/* Intraday chart */}
      {selectedDay && (
        <div>
          <h2 style={{ marginBottom: '12px', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Intraday — {selectedDay.date}
          </h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div ref={intradayChartRef} style={{ flex: 1 }} />
            <div style={{ width: '160px', flexShrink: 0, background: '#1a1a2e', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Stat label="Open"   value={selectedDay.dayOpen.toFixed(2)} />
              <Stat label="Close"  value={selectedDay.dayClose.toFixed(2)} />
              <Stat label="High"   value={selectedDay.dayHigh.toFixed(2)} />
              <Stat label="Low"    value={selectedDay.dayLow.toFixed(2)} />
              <Stat label="Volume" value={formatVolume(selectedDay.dayVolume)} />
              <div>
                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Return</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: selectedDay.dayReturnPercentage >= 0 ? '#26a69a' : '#ef5350' }}>
                  {selectedDay.dayReturnPercentage >= 0 ? '+' : ''}{selectedDay.dayReturnPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!stockData && !loading && !error && (
        <p style={{ color: '#555', fontSize: '14px' }}>Search for a ticker symbol to get started.</p>
      )}
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + 'B';
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(2) + 'M';
  if (v >= 1_000)         return (v / 1_000).toFixed(1) + 'K';
  return String(v);
}

function Stat({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 600 }}>{value ?? '—'}</div>
    </div>
  );
}
