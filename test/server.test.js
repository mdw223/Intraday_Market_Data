const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, normalizeIntradayData } = require('../server');

test('normalizeIntradayData returns rows with close prices', () => {
  const payload = {
    chart: {
      result: [
        {
          timestamp: [1700000000, 1700000300],
          indicators: {
            quote: [
              {
                open: [100, 101],
                high: [102, 103],
                low: [99, 100],
                close: [101, null],
                volume: [1000, 1500],
              },
            ],
          },
        },
      ],
    },
  };

  const rows = normalizeIntradayData(payload);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].close, 101);
  assert.equal(rows[0].open, 100);
});

test('GET /api/intraday returns normalized payload', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({
      chart: {
        result: [
          {
            timestamp: [1700000000],
            indicators: {
              quote: [
                { open: [100], high: [101], low: [99], close: [100.5], volume: [1000] },
              ],
            },
          },
        ],
      },
    }),
  });

  const server = createServer(mockFetch);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const res = await fetch(`http://127.0.0.1:${port}/api/intraday?symbol=MSFT`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.symbol, 'MSFT');
  assert.equal(body.points.length, 1);

  await new Promise((resolve) => server.close(resolve));
});
