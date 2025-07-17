def safe_symbol_filename(symbol):
    return symbol.replace('/', '_')
# c:\Users\LENOVO\Desktop\new project\ai_model\predict_lstm_signal.py
import sys
import json
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib

def create_dataset(data, look_back=1):
    X, Y = [], []
    for i in range(len(data) - look_back - 1):
        a = data[i:(i + look_back), 0]
        X.append(a)
        Y.append(data[i + look_back, 0])
    return np.array(X), np.array(Y)

def run_backtest_and_save_stats(model, scaler, X_test, y_test, symbol, look_back):
    """
    Run a simple backtest on the test data to evaluate model performance (win rate).
    """
    print(f"[{symbol}] Running backtest on test data...", file=sys.stderr)
    
    y_pred_scaled = model.predict(X_test, verbose=0)
    y_pred = scaler.inverse_transform(y_pred_scaled)
    y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))
    
    entry_prices_scaled = X_test[:, -1, 0]
    entry_prices = scaler.inverse_transform(entry_prices_scaled.reshape(-1, 1))

    wins = 0
    total_trades = len(y_pred)

    for i in range(total_trades):
        entry_price = entry_prices[i][0]
        predicted_price = y_pred[i][0]
        actual_outcome_price = y_test_actual[i][0]
        
        signal = "BUY" if predicted_price > entry_price else "SELL"
        
        if signal == "BUY" and actual_outcome_price > entry_price:
            wins += 1
        elif signal == "SELL" and actual_outcome_price < entry_price:
            wins += 1
            
    win_rate = (wins / total_trades) * 100 if total_trades > 0 else 0
    print(f"[{symbol}] Backtest complete. Win Rate: {win_rate:.2f}% ({wins}/{total_trades})", file=sys.stderr)
    return {"totalTrades": total_trades, "winRate": win_rate, "bestPair": symbol}

def train_and_save_model(data_csv_path, symbol, look_back=10, epochs=50, batch_size=1):
    print(f"[{symbol}] Starting model training from '{data_csv_path}'...", file=sys.stderr)
    
    df = pd.read_csv(data_csv_path)
    if 'Close' not in df.columns:
        raise ValueError(f"'Close' column not found in {data_csv_path}")

    df['Close'] = pd.to_numeric(df['Close'], errors='coerce')
    df = df.dropna(subset=['Close'])

    data = df['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    data_scaled = scaler.fit_transform(data)
        
    X, y = create_dataset(data_scaled, look_back)
    
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))

    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(look_back, 1)),
        Dropout(0.2),
        LSTM(50),
        Dropout(0.2),
        Dense(1)
    ])
    model.compile(loss='mean_squared_error', optimizer='adam')
    
    test_size = int(len(X) * 0.2)
    X_train, X_test = X[:-test_size], X[-test_size:]
    y_train, y_test = y[:-test_size], y[-test_size:]

    model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, validation_split=0.1, verbose=0)

    performance_stats = run_backtest_and_save_stats(model, scaler, X_test, y_test, symbol, look_back)
    safe_symbol = safe_symbol_filename(symbol)
    # If symbol is XAU/USD, save in ai_model/XAU/
    if symbol == 'XAU/USD':
        base_dir = os.path.join(os.path.dirname(__file__), 'XAU')
        os.makedirs(base_dir, exist_ok=True)
        stats_path = os.path.join(base_dir, 'USD_lstm_performance.json')
        model_path = os.path.join(base_dir, 'USD_lstm_model.h5')
        scaler_path = os.path.join(base_dir, 'USD_scaler.pkl')
    else:
        base_dir = os.path.dirname(__file__)
        stats_path = os.path.join(base_dir, f'{safe_symbol}_lstm_performance.json')
        model_path = os.path.join(base_dir, f'{safe_symbol}_lstm_model.h5')
        scaler_path = os.path.join(base_dir, f'{safe_symbol}_scaler.pkl')
    with open(stats_path, 'w') as f:
        json.dump(performance_stats, f)
    print(f"[{symbol}] Performance stats saved to {stats_path}", file=sys.stderr)
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    print(f"[{symbol}] Model and Scaler saved. Training complete.", file=sys.stderr)
    return model, scaler

def predict_signal(symbol, latest_prices_raw):
    try:
        safe_symbol = safe_symbol_filename(symbol)
        if symbol == 'XAU/USD':
            base_dir = os.path.join(os.path.dirname(__file__), 'XAU')
            model_path = os.path.join(base_dir, 'USD_lstm_model.h5')
            scaler_path = os.path.join(base_dir, 'USD_scaler.pkl')
        else:
            base_dir = os.path.dirname(__file__)
            model_path = os.path.join(base_dir, f'{safe_symbol}_lstm_model.h5')
            scaler_path = os.path.join(base_dir, f'{safe_symbol}_scaler.pkl')
        look_back = 10 

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            print(f"[{symbol}] Model or scaler not found. Attempting to train new model...", file=sys.stderr)
            
            # ** Logic to find the correct data file **
            if symbol == 'XAU/USD':
                data_csv_path = os.path.join(os.path.dirname(__file__), 'XAU', 'xau_usd_historical_data.csv')
            else: # Default or other symbols
                data_csv_path = os.path.join(os.path.dirname(__file__), 'eur_usd_historical_data.csv')
            
            if not os.path.exists(data_csv_path) or os.path.getsize(data_csv_path) == 0:
                return {"error": f"Training data for {symbol} not found or empty at {data_csv_path}."}

            model, scaler = train_and_save_model(data_csv_path, symbol, look_back=look_back)
        else:
            print(f"[{symbol}] Loading existing model and scaler...", file=sys.stderr)
            model = load_model(model_path)
            scaler = joblib.load(scaler_path)

        if len(latest_prices_raw) < look_back:
            return {"error": f"Not enough historical data for LSTM prediction. Need {look_back}, got {len(latest_prices_raw)}."}
        
        input_prices = np.array(latest_prices_raw[-look_back:]).reshape(-1, 1)
        
        num_prediction_days = 5
        predicted_prices = []
        current_sequence_scaled = scaler.transform(input_prices)

        for _ in range(num_prediction_days):
            X_predict = np.reshape(current_sequence_scaled, (1, look_back, 1))
            predicted_scaled_price = model.predict(X_predict, verbose=0)[0][0]
            predicted_price = scaler.inverse_transform(np.array([[predicted_scaled_price]]))[0][0]
            predicted_prices.append(predicted_price)
            current_sequence_scaled = np.append(current_sequence_scaled[1:], [[predicted_scaled_price]], axis=0)

        last_known_price = latest_prices_raw[-1]
        first_predicted_price = predicted_prices[0] if predicted_prices else None

        signal = "HOLD"
        if first_predicted_price and first_predicted_price > last_known_price * 1.0005:
            signal = "BUY"
        elif first_predicted_price and first_predicted_price < last_known_price * 0.9995:
            signal = "SELL"
        
        return {
            "predictedPrice": float(first_predicted_price) if first_predicted_price is not None else None,
            "lastKnownPrice": float(last_known_price),
            "signal": signal,
            "futurePredictedPrices": [float(p) for p in predicted_prices]
        }
    except Exception as e:
        print(f"[{symbol}] An unexpected error occurred in LSTM script: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing symbol argument. Usage: python predict_lstm_signal.py <SYMBOL>"}))
        sys.exit(1)
        
    symbol_arg = sys.argv[1]

    # Find the correct data file based on symbol
    if symbol_arg == 'XAU/USD':
        data_path = os.path.join(os.path.dirname(__file__), 'XAU', 'xau_usd_historical_data.csv')
    else:
        data_path = os.path.join(os.path.dirname(__file__), 'eur_usd_historical_data.csv')
    
    if not os.path.exists(data_path):
        print(json.dumps({"error": f"Data file not found for symbol {symbol_arg} at {data_path}"}))
        sys.exit(1)
        

    # More robust: skip metadata rows for robustness
    df_main = pd.read_csv(data_path, skiprows=[1, 2])
    if 'Close' not in df_main.columns:
        print(json.dumps({"error": f"'Close' column not found in {data_path}"}))
        sys.exit(1)
    latest_prices_arg = df_main['Close'].tail(200).tolist()

    print(f"Running prediction for {symbol_arg} using last {len(latest_prices_arg)} prices from {data_path}...", file=sys.stderr)
    result = predict_signal(symbol_arg, latest_prices_arg)
    print(json.dumps(result, indent=2))
