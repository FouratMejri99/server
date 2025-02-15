const puppeteer = require("puppeteer");

const tickers = ["GOOGL", "AAPL", "MSFT", "AMZN", "TSLA", "NVDA"];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let stocksData = {};

  for (let ticker of tickers) {
    const url = `https://finance.yahoo.com/quote/${ticker}`;

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

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
