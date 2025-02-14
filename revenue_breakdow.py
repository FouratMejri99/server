import json

import yfinance as yf

# Fetch data for a company (e.g., Apple)
ticker = "AAPL"
company = yf.Ticker(ticker)

# Get revenue breakdown by segment (if available)
revenue_breakdown = company.info.get("sectorWeightings", {})  # Replace with actual key if available

# Prepare data for pie chart
pie_chart_data = {
    "labels": list(revenue_breakdown.keys()),  # Segments
    "data": list(revenue_breakdown.values())   # Revenue percentages
}

# Print the data as JSON
print(json.dumps(pie_chart_data, indent=4))