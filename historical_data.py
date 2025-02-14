import json
import sys

import yfinance as yf


def get_historical_data(symbol):
    stock = yf.Ticker(symbol)
    hist = stock.history(period="7d")  # Fetch last 7 days to ensure 5 trading days

    hist = hist.tail(5)  # Keep only the last 5 days
    data = [
        {"date": str(index.date()), "close": round(float(row["Close"]), 2)}  # Format price
        for index, row in hist.iterrows()
    ]

    print(json.dumps(data))  # Send JSON to Node.js
    sys.stdout.flush()

if __name__ == "__main__":
    symbol = sys.argv[1]
    get_historical_data(symbol)
