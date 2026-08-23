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