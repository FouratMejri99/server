import json
import sys
import time

import requests
from bs4 import BeautifulSoup

# List of ticker symbols to fetch
tickers = ["GOOGL", "AAPL", "MSFT", "AMZN", "TSLA", "NVDA"]

# User-Agent header to mimic a real browser
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Function to safely extract text from an element
def safe_find_text(soup, tag, attrs):
    element = soup.find(tag, attrs)
    return element.text.strip() if element else "N/A"

# Dictionary to store stock data for all tickers
stocks_data = {}

# Loop through each ticker symbol and scrape data
for ticker in tickers:
    url = f'https://finance.yahoo.com/quote/{ticker}'
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {ticker}: {e}", file=sys.stderr)
        continue  # Skip to the next ticker

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract stock price data
    price_data = {
        "Current Price": safe_find_text(soup, 'span', {'data-testid': 'qsp-price'}),
        "Previous Close": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketPreviousClose'}),
        "Open": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketOpen'}),
        "Volume": safe_find_text(soup, 'fin-streamer', {'data-field': 'regularMarketVolume'}),
        "Market Cap": safe_find_text(soup, 'fin-streamer', {'data-field': 'marketCap'}),
    }


    # Store data in dictionary
    stocks_data[ticker] = {
        "Price Data": price_data,
        
    }

    time.sleep(2)  # Add a 2-second delay between requests

# Output the results as JSON
print(json.dumps(stocks_data, indent=4))
sys.stdout.flush()