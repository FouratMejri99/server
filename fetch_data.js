const puppeteer = require("puppeteer");

const tickers = ["GOOGL", "AAPL", "MSFT", "AMZN", "TSLA", "NVDA"];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let stocksData = {};

  for (let ticker of tickers) {
    const url = `https://finance.yahoo.com/quote/${ticker}`;

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      const stockData = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.innerText.trim() : "N/A";
        };

        return {
          "Current Price": getText('[data-testid="qsp-price"]'),

          Open: getText('[data-field="regularMarketOpen"]'),
          Volume: getText('[data-field="regularMarketVolume"]'),
          "Market Cap": getText('[data-field="marketCap"]'),
        };
      });

      stocksData[ticker] = { "Price Data": stockData };
    } catch (error) {
      console.error(`Error fetching data for ${ticker}: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  await browser.close();

  console.log(JSON.stringify(stocksData, null, 4));
})();
