import yfinance as yf
import pandas as pd
import os

def download_historical_data(symbol, start_date, end_date, filename):
    """
    Downloads historical data for a given symbol and saves it to a CSV file.
    """
    print(f"Downloading data for {symbol}...")
    try:
        # Download data from Yahoo Finance
        data = yf.download(symbol, start=start_date, end=end_date)

        if data.empty:
            print(f"No data found for {symbol}. It might be an incorrect ticker.")
            return

        # สร้าง path ให้ถูกต้อง
        output_path = os.path.join(os.path.dirname(__file__), filename)
        # Save to CSV
        data.to_csv(output_path)
        print(f"Successfully downloaded and saved data to {output_path}")
        print("-" * 30)
    except Exception as e:
        print(f"An error occurred while downloading {symbol}: {e}")

if __name__ == "__main__":
    # --- Configuration ---
    start_date = "2019-01-01"
    end_date = "2024-01-01"

    # --- Download Data ---
    # For Gold, we use GC=F (Gold Futures)
    download_historical_data("GC=F", start_date, end_date, "xau_usd_historical_data.csv")

    # For EUR/USD
    download_historical_data("EURUSD=X", start_date, end_date, "eur_usd_historical_data.csv")

    # You can add more symbols here
    # download_historical_data("GBPUSD=X", start_date, end_date, "gbp_usd_historical_data.csv")
