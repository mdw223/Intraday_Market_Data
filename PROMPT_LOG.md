# Prompt

1. explain to me module, target,lib moduleResolution in tsconfig.json and what options do i have

I wanted to properly architect my project so even small details in my tsconfig.json file make a difference. I was trying to understand the differences in how I can configure the backend in typescript. 

I learned that `target` controls what javascript version typescript complies my code to, which affects the syntax. I chose `ESNext` because it always supports the latest features.

`module` controls the module format of the emitted JS files, so how import/export statements are compiled. `ESNext`/`ES2022` is what I am familiar with with.

`moduleResolution` controls how ts finds a module when you write an import statement. `Bundler` is used for Vite, which allows extentionless imports, with no .js required.

`lib` defines the built-in type definitions of typescript, what affects what APIs typescript lets me use. I learned that it is optional, but if you want DOM tupes alongside a node target or more control then you can add it.
`ESNext` allows you to use the latest proposals, `DOM` is used for Brower APIs, and `dom.iterable` is for NodeList iteration.

-----

I utilized this website to do part of the set up: https://www.robinwieruch.de/typescript-node-js/

I utilized then https://medium.com/@sinharohit3333/step-by-step-guide-building-a-typescript-to-do-app-using-react-frontend-and-node-js-backend-d56c9bcd0e57 to complete the file structure 

-----

2. curl "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?
interval=15m" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36"  Explain this stock API to me: what does TSLA mean? what does the interval here do, provide me the actual API documentation link for this endpoint

I wanted to know what TSLA meant in the API request then it jogged my memory that it is a stock name. I wanted to further understand how to call this API endpoint so I wanted to see the documentation and understand the parameters for it.

`interval` is a parameter that controls the size of each candle. It will return a data point representing an interval in minutes of trading activity.

For API documentation, Yahoo Finance doesn't publish their own official API documentation, so people reverse engineer undocumented internal APIs. 

----

I tested calling the endpoint to see what type of data it returns.

```bash
curl "localhost:3000/api/stocks"
{"chart":{"result":[{"meta":{"currency":"USD","symbol":"TSLA",...}]}}
```
I added the data into stock-data.json to format it and examine it.

3. can you make a data interface for @Intraday_Market_Data/data/stock-data.json  in @Intraday_Market_Data/api/src/types/types.ts  ensuring that it has the correct data types

I wanted to convert this data I got into a data interface so that I can ensure that I know what data I can get and not run into accidental errors.

4. How can we validate the symbol so it is a string and it is a known symbol because I don't want to hit limits when calling yahoo's api if users miss type a symbol. Maybe there is a library that has all of the known symbols.

I wanted to know what is the best way to handle validating the symbol a user inputs to make sure that it's an actual name of a stock to avoid hitting limits, as well as validating that it is a string and not a wrong data type for example.

I learned that stock symbols have a certain format that can be represented in REGEX format, thus making it easier and more efficient that querying a database of known symbols.

5. @Intraday_Market_Data/api/src/controllers/controller.ts:15-31 what other common errors could we receive and what more error handling can we do to think about other cases?

I wanted to get all of the error codes that will allow me to handle different errors from the yahoo api. I also wanted to know if I had any unhandled parsing that could cause errors. 

I then added the error messages for different error codes that are common and added try/catch for unhandled network and data parsing.

6. explain to me the significance of grouping the @Intraday_Market_Data/data/month-stock-data.json by day, and how that would occur given our model? Go more into depth about what trading periods, the timestamps, and the indicators (volume, low, high, close, open) represent and why are they grouped in the data types they are in. how would we use these different data variables to represent the performance of a stock over month, grouped by day?

I wanted to understand what a candle represents in stocks. And how I must parse this stock data to be able to represent this data in the front end UI.

I learned that every entry in the data represents one 15 minute candle, which is a snapshot of everything that happened to a stock's price during a 15 minute window. There are 5 indicators.
    1. open: the price of the first trade at the start of the 15 minute window. 
    2. close: the price of the last trade before the window ended
    3. high/low: extremes reached within the window, the difference is called spread, candle range, or wick. It measures the viotility.
    4. volume - shares traded 

They are all numbers. 

Here is a shorter representation of the data to better understand.
```json
{
  "timestamp": [1786973400, 1786974300],
  "open":      [337.5,      341.2     ],
  "high":      [342.1,      343.0     ],
  "low":       [336.9,      340.5     ],
  "close":     [341.2,      342.8     ],
  "volume":    [850000,     620000    ]
}
```

9:30am ──────────────────── 9:45am
  │                            │
open                         close
(first trade)             (last trade)

        ▲ high (peak price reached)
        │
  ──────┤
        │
        ▼ low (lowest price reached)

volume = total shares that changed hands

A month of 15 minute intervals is roughly 570 candles, so there would 570 entries in each array of numbers in those indicators.
And thus the index i is the same moment acrross all arrays.

The 900-second gaps (1786974300 - 1786973400 = 900) confirm 15-minute intervals. The timestamp array only contains candles for minutes when the market was actually open, weekends, holidays, and overnight hours are absent entirely. So there are gaps of time in between 2 intervals like overnight.

`tradingPeriods` represents where each trading day boundaries are. Each entry contains a single array with the start and end timestamp, and time zone. So the number of entries is the number of trading days in the 1 month range, so it might not be 30 as there are weekends and holidays that are excluded.

`currentTradingPeriod` is the most recent session split into pre/regular/post for the "today" view. 

Grouping by day allows us to then ask questions based on the several 15 minute candle/intervals within a day like:


Day summary derived from all candles in that day:

  dayOpen   = candles[0].open         ← first candle's open price
  dayClose  = candles[last].close     ← last candle's close price
  dayHigh   = Math.max(...candles.map(c => c.high))   ← highest high of the day
  dayLow    = Math.min(...candles.map(c => c.low))    ← lowest low of the day
  dayVolume = candles.reduce((sum, c) => sum + c.volume, 0)  ← total shares traded

  dailyReturn = ((dayClose - dayOpen) / dayOpen) * 100  ← % change for the day

Which day had the biggest price swing?
dayHigh - dayLow

Which day had the strongest upward move?
dailyReturn sorted descending

Was the volume unusually high on a down day?
dayVolume + dailyReturn < 0

How volatile was this month vs. last?
avg of (dayHigh - dayLow) per day

Where did the stock close vs where it opened?
dayClose - dayOpen per day

So in the data model:

StockData
  └── chart: ChartData
        └── result[0]: ChartResult
              ├── meta: ChartMeta
              │     ├── tradingPeriods: TradingPeriod[][]  ← one entry per trading DAY
              │     │                                         use this as your grouping key
              │     └── currentTradingPeriod               ← today's pre/regular/post
              │
              ├── timestamp: number[]   ← one entry per 15m CANDLE (~570 for 1mo)
              │                           index i here = index i in all indicator arrays
              └── indicators
                    └── quote[0]: Quote
                          ├── open:   number[]  ─┐
                          ├── high:   number[]   │  all same length as timestamp[]
                          ├── low:    number[]   │  index i = same candle
                          ├── close:  number[]   │
                          └── volume: number[]  ─┘

----

This means in the UI, for a symbol the user enters, I can have the main display be a chart, table (can switch views), which gets the grouped by day data.
    We can thus iterate `tradingPeriods` once, for each day, use its `start` and `end` to match the indices in `timestamp[]` and the 5 indicators, to make a list of candles for that day, which will then amount to a month of daily summaries.
I can have a second smaller part of the UI show todays information from the currentTradingPeriod.
I can also nicely display the other stock info in the data model with (i) indicators next to each label that when hovered, over, explains to the user what they represent.

------

7.  @Intraday_Market_Data/api/src/services/services.ts:22-23 what is the relatioship between a trading period and a candle? dont we still have to group the candles by day within the tradingPeriods?

I got confused in the process of writing the logic so I needed a clarification as to how the two loops need to constructed as the relate to each other. 

I learned that each trading period represents a trading day.
```bash
tradingPeriods[0][0] = { start: 1784727000, end: 1784750400 }  // Day 1: 9:30am–4:00pm
tradingPeriods[1][0] = { start: 1784813400, end: 1784836800 }  // Day 2: 9:30am–4:00pm
```

and there can be multiple timestamps per day. Each timestamp represents a candle.

```bash
timestamps = [
  1784727000,  // Day 1, candle 1  (9:30am)
  1784727900,  // Day 1, candle 2  (9:45am)
  ...
  1784749500,  // Day 1, candle 26 (3:45pm)
  1784813400,  // Day 2, candle 1  (9:30am) ← big jump overnight
  ...
]
```

I needed to make it so instead each day, `DailyDay` has a subset of candles for that day. 
And the dayOpen.. need to over the candls of that day, not all the candles.

8. could we optomize this loop. explain different ways @Intraday_Market_Data/api/src/services/services.ts:26-30 

I wanted to see how to optomize the double loop because the inner loop would iterate through all of the timestamps for each period.

I found that a two pointer solution is the most efficient. A prepartition is also the same complexity.

9. How can I refactor for allowing custom error codes instead of only returning 500 in the error handler?

I want to make so if there is an error, the front end can differentiate errors instead of always being 500.
I learned we can extend the Error class to add a status field.
