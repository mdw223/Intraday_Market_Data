# Intraday Market Data

A full-stack trading dashboard that fetches one month of 15-minute intraday OHLCV data from Yahoo Finance, caches it in Redis, and renders interactive candlestick charts via TradingView Lightweight Charts.

## Architecture

```
Browser (React + Vite)  ←→  Express API  ←→  Redis cache
                                 ↕
                         Yahoo Finance API
```

| Service | Container | Port |
|---|---|---|
| Frontend (Vite + React) | `imd_app` | 5173 |
| Backend (Express + TypeScript) | `imd_api` | 3000 |
| Cache | `imd_redis` | 6379 |

### API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stocks/:symbol` | Fetch monthly intraday data for a ticker |

Cache TTL is 15 minutes per symbol (matches the candle granularity).

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2

That's it — Node.js does not need to be installed locally.

---

## Quick Start (Docker)

### 1. Clone the repo

```bash
git clone <repo-url>
cd Intraday_Market_Data
```

### 2. Create environment files

**`api/.env`**
```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://imd_redis:6379
ALLOWED_ORIGIN=http://localhost:5173
```

**`app/.env`**
```env
API_TARGET=http://imd_api:3000
```

> `API_TARGET` is consumed by `vite.config.ts` at build time to proxy `/api/*` requests
> to the backend container. It must use the Docker service name (`imd_api`), not `localhost`.

### 3. Build and start all services

```bash
docker compose up --build
```

On first run this downloads `node:22-alpine` and installs dependencies inside each container (~30–60 seconds).

### 4. Open the dashboard

```
http://localhost:5173
```

Type a ticker symbol (e.g. `AAPL`, `TSLA`, `NVDA`) and press **Search** or **Enter**.

---

## Stopping

```bash
# Stop containers, keep volumes
docker compose down

# Stop and remove the Redis volume (clears cache)
docker compose down -v
```

---

## Development Workflow

Source files are bind-mounted into the containers so changes take effect without rebuilding:

| Directory | Mounted to |
|---|---|
| `api/src/` | `/app/src` in `imd_api` |
| `app/src/` | `/app/src` in `imd_app` |

- **Backend** — `tsx --watch` restarts the process on any `.ts` change
- **Frontend** — Vite HMR updates the browser instantly on any `src/` change

If you add a new `npm` dependency to either `package.json`, you must rebuild that service:

```bash
# Rebuild only the API after adding a backend dependency
docker compose up --build api

# Rebuild only the frontend after adding a frontend dependency
docker compose up --build app
```

---

## Running Without Docker (Local)

If you prefer to run services natively:

**Requirements:** Node.js 22+, a running Redis instance

```bash
# Terminal 1 — Backend
cd api
npm install
# Create api/.env with REDIS_URL pointing to your local Redis
npm run dev        # starts tsx --watch on port 3000

# Terminal 2 — Frontend
cd app
npm install
# Create app/.env with API_TARGET=http://localhost:3000
npm run dev        # starts Vite on port 5173
```

---

## Project Structure

```
.
├── compose.yml
├── api/                        # Express backend
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── routes/routes.ts
│   │   ├── controllers/controller.ts
│   │   ├── services/services.ts
│   │   ├── clients/
│   │   │   ├── yahooFinanceClient.ts
│   │   │   └── redisClient.ts
│   │   ├── mapper/mapper.ts    # Yahoo response → MonthlyStockData
│   │   ├── middleware/
│   │   │   ├── AppError.ts
│   │   │   └── errorHandler.ts
│   │   ├── config/config.ts    # Intervals, TTL, base URLs
│   │   └── types/types.ts      # Shared TypeScript interfaces
└── app/                        # React frontend
    ├── Dockerfile
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── dashboard.tsx       # Main dashboard component
        ├── dashboard.css
        ├── apiClient.ts        # Domain-level API calls
        └── httpClient.ts       # Base HTTP transport
```
