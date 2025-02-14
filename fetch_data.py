import json
import sys

import requests
from bs4 import BeautifulSoup

# Read symbols from command-line arguments
if len(sys.argv) < 2:
    print(json.dumps({"error": "No stock symbols provided."}))
    sys.exit(1)

tickers = sys.argv[1].split(",")  # Get symbols from arguments (comma-separated)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def safe_find_text(soup, tag, attrs):
    element = soup.find(tag, attrs)
    return element.text.strip() if element else "N/A"

stocks_data = {}

for ticker in tickers:
    url = f'https://finance.yahoo.com/quote/{ticker}'
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        stocks_data[ticker] = {"error": "Failed to fetch data"}
        continue

    soup = BeautifulSoup(response.text, 'html.parser')

    price_data = {
        "Current Price": safe_find_text(soup, 'span', {'data-testid': 'qsp-price'}),
        "Previous Close": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketPreviousClose'}),
        "Open": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketOpen'}),
        "Volume": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketVolume'}),
        "Market Cap": safe_find_text(soup, 'fin-streamer', {'data-field': 'marketCap'}),
    }

    news_headlines = []
    news_section = soup.find('div', {'id': 'mrt-node-quoteNewsStream-0-Stream'})
    if news_section:
        for article in news_section.find_all('li', {'class': 'js-stream-content'}):
            headline = article.find('h3')
            if headline:
                news_headlines.append(headline.get_text().strip())

    stocks_data[ticker] = {
        "Price Data": price_data,
        "News": news_headlines
    }

print(json.dumps(stocks_data, indent=4))
sys.stdout.flush()
