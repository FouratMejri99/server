import json
import sys

import yfinance as yf

# Get ticker symbol from command-line argument
ticker = sys.argv[1]
data = yf.Ticker(ticker)

# Get today's data (1-minute intervals)
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
        "Volume": int(row["Volume"]),  # Convert volume to integer
    }
    for _, row in historical_data.iterrows()
]

# Output as JSON
print(json.dumps(result))
sys.stdout.flush()
