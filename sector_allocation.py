import json
import sys

import yfinance as yf

# Get ticker symbol from the command-line argument
symbol = sys.argv[1]

# Fetch stock data for the given symbol
stock = yf.Ticker(symbol)

# Get sector, industry, and market cap
sector = stock.info.get('sector', 'N/A')
industry = stock.info.get('industry', 'N/A')
market_cap = stock.info.get('marketCap', 'N/A')

# Prepare the data to return as JSON
sector_allocation = {
    "sector": sector,
    "industry": industry,
    "marketCap": market_cap
}

# Output the result as a JSON string
print(json.dumps(sector_allocation))
