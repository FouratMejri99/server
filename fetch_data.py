import json
import sys
import yfinance as yf
import requests
from bs4 import BeautifulSoup

# Get ticker symbol from command-line argument
ticker = "AAPL"

# Use yfinance to get stock data
data = yf.Ticker(ticker)
historical_data = data.history(period="1d", interval="1m")

# Convert Timestamp to string
historical_data = historical_data.reset_index()
historical_data["Datetime"] = historical_data["Datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

# Format numbers to 2 decimal places
result = [
    {
        "Datetime": row["Datetime"],
        "Open": round(float(row["Open"]), 2),
        "High": round(float(row["High"]), 2),
        "Low": round(float(row["Low"]), 2),
        "Close": round(float(row["Close"]), 2),
        "Volume": int(row["Volume"]),
    }
    for _, row in historical_data.iterrows()
]

# Scrape additional data (for example, news headlines) using BeautifulSoup
url = f'https://finance.yahoo.com/quote/{ticker}'  # Yahoo Finance webpage for the ticker
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Example: Get stock news headlines
news_headlines = []
for article in soup.find_all('li', {'class': 'js-stream-content'}):
    headline = article.find('h3')
    if headline:
        news_headlines.append(headline.get_text())

# Add news headlines to the result
result.append({"News": news_headlines})

# Output as JSON
print(json.dumps(result))
sys.stdout.flush()
