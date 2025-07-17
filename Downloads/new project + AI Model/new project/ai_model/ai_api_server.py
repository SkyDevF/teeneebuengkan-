# c:\Users\LENOVO\Desktop\new project\ai_model\ai_api_server.py
from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
import joblib
import os

# --- Initialization ---
app = Flask(__name__)

# --- Load Model and Scaler ---
# This part runs only once when the server starts.
MODEL_DIR = 'saved_lstm_model'
MODEL_PATH = os.path.join(MODEL_DIR, 'lstm_model_from_10k.h5')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler_from_10k.pkl')
SEQUENCE_LENGTH = 60 # This must match the training script

print("Loading LSTM model and scaler...")
try:
    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("Model and scaler loaded successfully.")
except Exception as e:
    print(f"FATAL: Error loading model or scaler: {e}")
    model = None
    scaler = None

# --- API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model or scaler not loaded on the server'}), 500

    # Get data from the POST request sent by Node.js
    data = request.get_json()
    if not data or 'historical_data' not in data:
        return jsonify({'error': 'Missing "historical_data" in request body'}), 400

    # The Node.js server should send the last 60 close prices
    close_prices = data['historical_data']

    if len(close_prices) < SEQUENCE_LENGTH:
        return jsonify({'error': f'Insufficient data. Need at least {SEQUENCE_LENGTH} data points, but got {len(close_prices)}'}), 400

    try:
        # 1. Preprocess the input data
        # Use the last SEQUENCE_LENGTH points
        last_sequence_raw = np.array(close_prices[-SEQUENCE_LENGTH:]).reshape(-1, 1)
        
        # Scale the data using the loaded scaler
        last_sequence_scaled = scaler.transform(last_sequence_raw)
        
        # Reshape for the model
        input_for_model = last_sequence_scaled.reshape(1, SEQUENCE_LENGTH, 1)

        # 2. Make a prediction
        predicted_scaled_price = model.predict(input_for_model, verbose=0)

        # 3. Inverse transform the prediction
        predicted_price = scaler.inverse_transform(predicted_scaled_price)[0][0]

        # --- Generate a simple signal based on the prediction ---
        last_actual_price = close_prices[-1]
        signal = "HOLD"
        if predicted_price > last_actual_price * 1.0005: # Threshold for BUY
            signal = "BUY"
        elif predicted_price < last_actual_price * 0.9995: # Threshold for SELL
            signal = "SELL"

        # Return the result as JSON
        return jsonify({ 'predicted_price': float(predicted_price), 'signal': signal, 'last_known_price': float(last_actual_price) })
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'An error occurred during prediction.'}), 500

# --- Run the server ---
if __name__ == '__main__':
    # Use port 5000 for the AI server to avoid conflict with Node.js (3001) and React (3000)
    app.run(port=5000, debug=False)