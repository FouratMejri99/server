const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chrome-aws-lambda");

const tickers = ["GOOGL", "AAPL", "MSFT", "AMZN", "TSLA", "NVDA"];

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();
    let stocksData = {};

    for (let ticker of tickers) {
      const url = `https://finance.yahoo.com/quote/${ticker}`;

      try {
        // Navigate to the Yahoo Finance page
        await page.goto(url, { waitUntil: "networkidle2" });

        // Scrape the data
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

      // Wait for 2 seconds before the next request
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(JSON.stringify(stocksData, null, 4));
  } catch (error) {
    console.error(`Error during scraping: ${error.message}`);
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
};
