const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chrome-aws-lambda");

const tickers = ["GOOGL", "AAPL", "MSFT", "AMZN", "TSLA", "NVDA"];

exports.handler = async (event, context) => {
  let browser = null;

  try {
    // Launch the browser
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const stocksData = {};

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    await page.setUserAgent(userAgent);

    for (let ticker of tickers) {
      const url = `https://finance.yahoo.com/quote/${ticker}`;

      try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        console.log(`Scraping data for ${ticker}...`);
        const stockData = await page.evaluate(() => {
          const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerText.trim() : "N/A";
          };

          return {
            "Current Price": getText(
              'fin-streamer[data-field="regularMarketPrice"]'
            ),
            Open: getText('fin-streamer[data-field="regularMarketOpen"]'),
            Volume: getText('fin-streamer[data-field="regularMarketVolume"]'),
            "Market Cap": getText('fin-streamer[data-field="marketCap"]'),
          };
        });

        console.log(`Data for ${ticker}:`, stockData);
        stocksData[ticker] = { "Price Data": stockData };
      } catch (error) {
        console.error(`Error fetching data for ${ticker}: ${error.message}`);
      }

      // Add a random delay between 2 and 5 seconds
      const delay = Math.floor(Math.random() * 3000) + 2000; // Random delay between 2-5 seconds
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return {
      statusCode: 200,
      body: JSON.stringify(stocksData, null, 4),
    };
  } catch (error) {
    console.error(`Error during scraping: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
};
