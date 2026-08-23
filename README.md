# Intraday_Market_Data

A minimal full-stack application that consumes a public stock API and displays intraday market data.

## Features
- Backend API endpoint: `GET /api/intraday?symbol=AAPL`
- Uses Yahoo Finance public chart API for intraday 5-minute data
- Frontend ticker input and intraday table view

## Run locally
1. Ensure Node.js 18+ is installed.
2. From the repository root:
   - `npm start`
3. Open `http://localhost:3000`

## Test
- `npm test`
