import json
import sys
import requests
from bs4 import BeautifulSoup

def get_historical_data(symbol):
    # URL for Yahoo Finance page of the stock
    url = f'https://finance.yahoo.com/quote/{symbol}/history'
    response = requests.get(url)

    # Print status code and part of the response for debugging
    print(f"Response status code: {response.status_code}")
    if response.status_code == 200:
        print(f"Page content preview: {response.text[:500]}")  # Preview the first 500 characters of the HTML

    # If the request was unsuccessful, exit
    if response.status_code != 200:
        print(f"Error: Could not fetch data for {symbol}")
        sys.exit(1)

    # Parse the page content using BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Try to find the historical data table
    table = soup.find('table', {'data-test': 'historical-prices'})
    
    if table is None:
        print("Error: Could not find the historical data table. The page structure may have changed.")
        sys.exit(1)
    
    # Get the rows of the table (excluding the header row)
    rows = table.find_all('tr')[1:6]  # Get only the last 5 rows (5 days)
    
    data = []
    for row in rows:
        cols = row.find_all('td')
        if len(cols) > 1:  # Ensure the row has data
            date = cols[0].text.strip()
            close_price = cols[4].text.strip().replace(",", "")  # Remove commas in the price
            try:
                # Format the data
                data.append({"date": date, "close": round(float(close_price), 2)})
            except ValueError:
                continue  # Skip rows where the price is not valid

    # Output the data as JSON
    print(json.dumps(data))
    sys.stdout.flush()

if __name__ == "__main__":
    symbol = "AAPL"  # Stock symbol passed as argument
    get_historical_data(symbol)
