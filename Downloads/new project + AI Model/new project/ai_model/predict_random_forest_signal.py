def safe_symbol_filename(symbol):
    """Convert symbol to a safe filename (replace / with _)"""
    return symbol.replace('/', '_')
# c:\Users\LENOVO\Desktop\new project\ai_model\predict_random_forest_signal.py
import sys
import json
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

def create_features(df, lookback_periods, sma_periods):
    """
    สร้างฟีเจอร์ (Lagged Prices, SMAs, RSI) จาก DataFrame ของราคา
    """
    for i in lookback_periods:
        df[f'close_lag_{i}'] = df['close'].shift(i)
    for period in sma_periods:
        df[f'sma_{period}'] = df['close'].rolling(window=period).mean()

    # NEW: Add Relative Strength Index (RSI) as a feature
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi_14'] = 100 - (100 / (1 + rs))

    return df

def train_and_save_rf_model(symbol, csv_path, lookback_periods, sma_periods):
    """
    ฝึกโมเดล Random Forest, ประเมิน, และบันทึกไฟล์โมเดลกับฟีเจอร์
    """
    print(f"[{symbol}] Starting Random Forest model training from '{csv_path}'...", file=sys.stderr)
    # Improved data loading: skip the metadata rows for robustness.
    df = pd.read_csv(csv_path, skiprows=[1, 2])
    
    if 'Close' not in df.columns:
        raise ValueError(f"'Close' column not found in {csv_path}")

    # ใช้แค่ราคาปิด ('Close' column from yfinance) ในการฝึก
    df_close = pd.DataFrame(df['Close']).rename(columns={'Close': 'close'})
    # Convert 'close' to numeric, coerce errors to NaN, then drop NaN
    df_close['close'] = pd.to_numeric(df_close['close'], errors='coerce')
    df_close = df_close.dropna(subset=['close'])

    df_features = create_features(df_close.copy(), lookback_periods, sma_periods)
    df_features['target'] = df_features['close'].shift(-1)
    df_features = df_features.dropna()

    feature_columns = [col for col in df_features.columns if col not in ['close', 'target', 'time']]
    
    if df_features.empty or len(feature_columns) == 0:
        print(f"[{symbol}] Not enough data to create features for training.", file=sys.stderr)
        return None, None

    X = df_features[feature_columns]
    y = df_features['target']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, oob_score=True)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    print(f"[{symbol}] Random Forest Model R2 Score: {r2:.4f}", file=sys.stderr)


    safe_symbol = safe_symbol_filename(symbol)
    # If symbol is XAU/USD, save in ai_model/XAU/
    if symbol == 'XAU/USD':
        base_dir = os.path.join(os.path.dirname(__file__), 'XAU')
        os.makedirs(base_dir, exist_ok=True)
        model_path = os.path.join(base_dir, 'XAU_USD_rf_model.joblib')
        features_path = os.path.join(base_dir, 'XAU_USD_rf_features.json')
    else:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, f'{safe_symbol}_rf_model.joblib')
        features_path = os.path.join(base_dir, f'{safe_symbol}_rf_features.json')

    joblib.dump(model, model_path)
    with open(features_path, 'w') as f:
        json.dump(feature_columns, f)

    print(f"[{symbol}] Random Forest Model and Feature Names saved.", file=sys.stderr)
    return model, feature_columns

def predict_signal(symbol, latest_prices_raw):
    """
    ทำนายสัญญาณโดยใช้โมเดล Random Forest
    """

    safe_symbol = safe_symbol_filename(symbol)
    if symbol == 'XAU/USD':
        base_dir = os.path.join(os.path.dirname(__file__), 'XAU')
        model_path = os.path.join(base_dir, 'XAU_USD_rf_model.joblib')
        features_path = os.path.join(base_dir, 'XAU_USD_rf_features.json')
    else:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, f'{safe_symbol}_rf_model.joblib')
        features_path = os.path.join(base_dir, f'{safe_symbol}_rf_features.json')
    
    lookback_periods = [3, 5, 10]
    sma_periods = [5, 10]
    required_history_length = max(max(lookback_periods), max(sma_periods)) + 1

    try:
        if not os.path.exists(model_path) or not os.path.exists(features_path):
            print(f"[{symbol}] RF Model or features not found. Training new model...", file=sys.stderr)

            if symbol == 'XAU/USD':
                data_csv_path = os.path.join(os.path.dirname(__file__), 'XAU', 'xau_usd_historical_data.csv')
            else: # Default or other symbols
                data_csv_path = os.path.join(os.path.dirname(__file__), 'eur_usd_historical_data.csv')
            
            if not os.path.exists(data_csv_path) or os.path.getsize(data_csv_path) == 0:
                return {"error": f"Training data for {symbol} not found or empty at {data_csv_path}."}
            
            model, feature_columns = train_and_save_rf_model(symbol, data_csv_path, lookback_periods, sma_periods)
            if model is None:
                return {"error": f"Failed to train RF model for {symbol} due to insufficient data."}
        else:
            print(f"[{symbol}] Loading existing RF model and features...", file=sys.stderr)
            model = joblib.load(model_path)
            with open(features_path, 'r') as f:
                feature_columns = json.load(f)

        if len(latest_prices_raw) < required_history_length:
            return {"error": f"Not enough data for RF prediction. Need {required_history_length}, got {len(latest_prices_raw)}."}

        num_prediction_days = 5
        predicted_prices = []
        current_prices_for_prediction = list(latest_prices_raw)

        for i in range(num_prediction_days):
            df_temp = pd.DataFrame(current_prices_for_prediction, columns=['close'])
            df_temp = create_features(df_temp, lookback_periods, sma_periods)
            
            features_df = df_temp[feature_columns].tail(1)

            if features_df.isnull().values.any():
                break

            next_price_prediction = model.predict(features_df)[0]
            predicted_prices.append(next_price_prediction)
            current_prices_for_prediction.append(next_price_prediction)
        
        first_predicted_price = float(predicted_prices[0]) if predicted_prices else None
        last_known_price = float(latest_prices_raw[-1])

        signal = "HOLD"
        if first_predicted_price and first_predicted_price > last_known_price * 1.0005:
            signal = "BUY"
        elif first_predicted_price and first_predicted_price < last_known_price * 0.9995:
            signal = "SELL"

        result = {
            "predictedPrice": first_predicted_price,
            "lastKnownPrice": last_known_price,
            "signal": signal,
            "futurePredictedPrices": [float(p) for p in predicted_prices]
        }
        return result

    except Exception as e:
        print(f"[{symbol}] An unexpected error occurred in RF script: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing symbol argument. Usage: python predict_random_forest_signal.py <SYMBOL>"}))
        sys.exit(1)
        
    symbol_arg = sys.argv[1]

    if symbol_arg == 'XAU/USD':
        data_path = os.path.join(os.path.dirname(__file__), 'XAU', 'xau_usd_historical_data.csv')
    else:
        data_path = os.path.join(os.path.dirname(__file__), 'eur_usd_historical_data.csv')
    
    if not os.path.exists(data_path):
        print(json.dumps({"error": f"Data file not found for symbol {symbol_arg} at {data_path}"}))
        sys.exit(1)
        

    # Improved data loading: skip metadata rows for robustness
    df_main = pd.read_csv(data_path, skiprows=[1, 2])
    if 'Close' not in df_main.columns:
        print(json.dumps({"error": f"'Close' column not found in {data_path}"}))
        sys.exit(1)
    latest_prices_arg = df_main['Close'].tail(200).tolist()

    print(f"Running prediction for {symbol_arg} using last {len(latest_prices_arg)} prices from {data_path}...")
    final_result = predict_signal(symbol_arg, latest_prices_arg)
    print(json.dumps(final_result, indent=2))

