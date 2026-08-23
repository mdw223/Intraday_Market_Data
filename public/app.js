const form = document.getElementById('symbol-form');
const symbolInput = document.getElementById('symbol');
const statusEl = document.getElementById('status');
const table = document.getElementById('data-table');
const tbody = table.querySelector('tbody');

function formatNumber(value) {
  return value === null ? '-' : Number(value).toFixed(2);
}

function renderRows(points) {
  tbody.innerHTML = '';
  points.slice(-30).reverse().forEach((point) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${point.time}</td>
      <td>${formatNumber(point.open)}</td>
      <td>${formatNumber(point.high)}</td>
      <td>${formatNumber(point.low)}</td>
      <td>${formatNumber(point.close)}</td>
      <td>${point.volume ?? '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function load(symbol) {
  statusEl.textContent = `Loading ${symbol}...`;
  table.hidden = true;

  try {
    const response = await fetch(`/api/intraday?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load data');
    }

    renderRows(data.points);
    statusEl.textContent = `Showing latest ${Math.min(data.points.length, 30)} points for ${data.symbol}`;
    table.hidden = false;
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const symbol = symbolInput.value.trim().toUpperCase();
  if (symbol) {
    load(symbol);
  }
});

load(symbolInput.value);
