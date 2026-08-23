const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PUBLIC_DIR = path.join(__dirname, 'public');

function buildYahooUrl(symbol) {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
}

function normalizeIntradayData(payload) {
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};

  return timestamps
    .map((ts, idx) => ({
      time: new Date(ts * 1000).toISOString(),
      open: quote.open?.[idx] ?? null,
      high: quote.high?.[idx] ?? null,
      low: quote.low?.[idx] ?? null,
      close: quote.close?.[idx] ?? null,
      volume: quote.volume?.[idx] ?? null,
    }))
    .filter((row) => row.close !== null);
}

function sendJson(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function serveStatic(reqPath, res) {
  const filePath = reqPath === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, reqPath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(normalized, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(normalized);
    const type = ext === '.js' ? 'text/javascript; charset=utf-8' : ext === '.css' ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8';

    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
}

function createServer(fetchImpl = fetch) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/intraday') {
      const symbol = (url.searchParams.get('symbol') || 'AAPL').toUpperCase();

      if (!/^[A-Z.\-]{1,10}$/.test(symbol)) {
        sendJson(res, 400, { error: 'Invalid symbol' });
        return;
      }

      try {
        const response = await fetchImpl(buildYahooUrl(symbol));
        if (!response.ok) {
          sendJson(res, 502, { error: 'Stock data provider unavailable' });
          return;
        }

        const payload = await response.json();
        const rows = normalizeIntradayData(payload);

        if (rows.length === 0) {
          sendJson(res, 404, { error: `No intraday data found for ${symbol}` });
          return;
        }

        sendJson(res, 200, { symbol, interval: '5m', points: rows });
      } catch (error) {
        sendJson(res, 502, { error: 'Failed to fetch intraday data' });
      }
      return;
    }

    serveStatic(url.pathname, res);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = { createServer, normalizeIntradayData, buildYahooUrl };
