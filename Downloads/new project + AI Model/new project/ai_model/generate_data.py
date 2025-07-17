# c:\Users\LENOVO\Desktop\new project\ai_model\generate_data.py
import pandas as pd
import numpy as np
import datetime

def generate_ohlc_data(n_points=10000, start_price=1.2000, volatility=0.005):
    """
    Generates synthetic OHLC (Open, High, Low, Close) data for a specified number of points.

    Args:
        n_points (int): The number of data points (days) to generate.
        start_price (float): The starting price for the simulation.
        volatility (float): The volatility factor to control price fluctuations.

    Returns:
        pandas.DataFrame: A DataFrame containing the synthetic OHLC data.
    """
    print(f"Generating {n_points} data points...")

    # Create a date range using business day frequency
    start_date = datetime.datetime.now() - datetime.timedelta(days=n_points * 1.5) # Go back further to ensure enough business days
    dates = pd.to_datetime(pd.date_range(start=start_date, periods=n_points, freq='B'))

    # Initialize data list
    data = []
    close_price = start_price

    for i in range(n_points):
        open_price = close_price
        
        # Generate random change for the day using a normal distribution
        change = np.random.normal(0, volatility)
        
        # Calculate close price
        close_price = open_price * (1 + change)
        
        # Determine high and low for the day
        high_price = max(open_price, close_price) * (1 + np.random.uniform(0, volatility / 2))
        low_price = min(open_price, close_price) * (1 - np.random.uniform(0, volatility / 2))
        
        # Ensure OHLC logic is sound (high >= max(open, close), low <= min(open, close))
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)

        data.append({
            'time': dates[i].strftime('%Y-%m-%d'),
            'open': round(open_price, 5),
            'high': round(high_price, 5),
            'low': round(low_price, 5),
            'close': round(close_price, 5)
        })

    df = pd.DataFrame(data)
    print("Data generation complete.")
    return df

if __name__ == "__main__":
    NUM_POINTS = 10000
    OUTPUT_FILENAME = 'ohlc_data_10k.csv'
    ohlc_df = generate_ohlc_data(n_points=NUM_POINTS)
    ohlc_df.to_csv(OUTPUT_FILENAME, index=False)
    print(f"Successfully saved {NUM_POINTS} data points to '{OUTPUT_FILENAME}'.")