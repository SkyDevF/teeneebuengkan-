import numpy as np # type: ignore
import pandas as pd # type: ignore
from sklearn.preprocessing import MinMaxScaler # type: ignore
from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import LSTM, Dense, Dropout # type: ignore

print("Step 1: Generating Dummy Time Series Data...")

# Seed for reproducibility
np.random.seed(42)

# Generate a simple sine wave with some noise to simulate price movement
# เราจะสร้างข้อมูล 300 จุด เพื่อจำลองราคาในช่วงเวลาหนึ่ง
data_points = 300
time = np.arange(data_points)
amplitude = 10 * np.sin(time / 20) + 5 * np.cos(time / 10) # Sine/Cosine wave for trend
noise = np.random.normal(0, 0.5, data_points) # Adding some random noise
dummy_prices = 50 + amplitude + noise # Base price + trend + noise

# Convert to pandas Series for better handling
df = pd.DataFrame(dummy_prices, columns=['Price'])

print(f"Generated {len(df)} dummy price data points.")
print("First 5 data points:\n", df.head())
print("\n" + "="*50 + "\n")

# --- Continue to Step 2 in the same file ---

print("Step 2: Preprocessing Data for LSTM...")

# Normalize the data
# การ Normalize สำคัญมากสำหรับ Neural Network เพื่อให้ข้อมูลอยู่ในช่วงเดียวกัน (0 ถึง 1)
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(df['Price'].values.reshape(-1, 1))

# Define sequence length (timesteps)
# sequence_length คือจำนวนข้อมูลย้อนหลังที่ LSTM จะใช้ในการทำนายจุดถัดไป
# เช่น ถ้า sequence_length = 10, โมเดลจะดูข้อมูล 10 จุดที่แล้ว เพื่อทำนายจุดที่ 11
sequence_length = 10

# Create sequences for LSTM
X = [] # Features (input sequences)
y = [] # Target (output - the next price)

for i in range(sequence_length, len(scaled_data)):
    X.append(scaled_data[i-sequence_length:i, 0]) # 10 ราคาที่แล้ว
    y.append(scaled_data[i, 0]) # ราคาปัจจุบัน (ที่เราต้องการทำนาย)

X = np.array(X)
y = np.array(y)

# Reshape X for LSTM input (samples, timesteps, features)
# LSTM ต้องการ input ในรูป 3D: [จำนวนตัวอย่าง, จำนวนข้อมูลย้อนหลัง, จำนวนฟีเจอร์ต่อจุด]
# ในกรณีนี้ จำนวนฟีเจอร์ต่อจุดคือ 1 (เพราะเรามีแค่ราคา)
X = np.reshape(X, (X.shape[0], X.shape[1], 1))

print(f"Original data points: {len(df)}")
print(f"Sequence length: {sequence_length}")
print(f"Number of samples (X): {X.shape[0]}")
print(f"X shape (samples, timesteps, features): {X.shape}")
print(f"y shape (samples): {y.shape}")
print("\n" + "="*50 + "\n")

# --- Continue to Step 3 in the same file ---

print("Step 3: Building the LSTM Model...")

# Initialize the model
model = Sequential()

# Adding the first LSTM layer and some Dropout regularization
# units: จำนวนหน่วยความจำของ LSTM layer
# return_sequences=True: ต้องใช้ True ถ้ามี LSTM layer ถัดไปซ้อนกัน
# input_shape: กำหนดรูปทรงของ input (จำนวนข้อมูลย้อนหลัง, จำนวนฟีเจอร์)
model.add(LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], 1)))
model.add(Dropout(0.2)) # Dropout เพื่อลด Overfitting (สุ่มปิด Neurons บางส่วน)

# Adding a second LSTM layer and some Dropout regularization
model.add(LSTM(units=50, return_sequences=True))
model.add(Dropout(0.2))

# Adding a third LSTM layer and some Dropout regularization
model.add(LSTM(units=50)) # ไม่ต้อง return_sequences=True แล้ว เพราะเป็น LSTM layer สุดท้าย
model.add(Dropout(0.2))

# Adding the output layer
# Dense layer: ชั้นที่เชื่อมต่อกันทั้งหมด
# units=1 เพราะเราต้องการทำนายค่าเดียว (ราคาถัดไป)
model.add(Dense(units=1))

# Compiling the model
# optimizer: Adam เป็น optimizer ที่นิยมและทำงานได้ดี
# loss: mean_squared_error (MSE) เหมาะสำหรับการทำนายค่าตัวเลข (Regression)
model.compile(optimizer='adam', loss='mean_squared_error')

# Print model summary
model.summary()

print("\n" + "="*50 + "\n")

# --- Continue to Step 4 in the same file ---

print("Step 4: Training the LSTM Model...")

# Training the model
# epochs: จำนวนรอบที่โมเดลจะเรียนรู้จากข้อมูลทั้งหมด
# batch_size: จำนวนตัวอย่างที่จะประมวลผลในแต่ละครั้งก่อนที่จะปรับน้ำหนักโมเดล
# verbose=1: แสดงความคืบหน้าของการฝึก
history = model.fit(X, y, epochs=50, batch_size=32, verbose=1)

print("\nModel training complete.")
print("Final training loss:", history.history['loss'][-1])
print("\n" + "="*50 + "\n")

# --- Continue to Step 5 in the same file ---

print("Step 5: Making Predictions with the Trained Model...")

# Use the last 'sequence_length' data points to make a prediction
# เพื่อทำนายค่าถัดไป เราต้องเตรียม input ที่มีขนาดเท่ากับ sequence_length
last_sequence = scaled_data[-sequence_length:].reshape(1, sequence_length, 1)

# Make a prediction
predicted_scaled_price = model.predict(last_sequence)

# Inverse transform the prediction to get the actual price scale
# แปลงค่าที่ทำนายได้กลับไปเป็น Scale ราคาจริง
predicted_price = scaler.inverse_transform(predicted_scaled_price)[0][0]

print(f"Last actual price in dummy data: {df['Price'].iloc[-1]:.4f}")
print(f"Predicted next price: {predicted_price:.4f}")

# Example: Make predictions for a few steps into the future
print("\nPredicting next 5 steps:")
current_sequence = scaled_data[-sequence_length:].copy()
future_predictions = []

for _ in range(5):
    # Reshape current_sequence for model input
    input_seq = current_sequence.reshape(1, sequence_length, 1)
    
    # Predict the next value
    next_scaled_val = model.predict(input_seq)[0][0]
    future_predictions.append(next_scaled_val)
    
    # Update the sequence: remove the first element, add the predicted next element
    current_sequence = np.append(current_sequence[1:], next_scaled_val)


# Inverse transform future predictions
future_prices = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))

for i, price in enumerate(future_prices):
    print(f"Step {i+1} future predicted price: {price[0]:.4f}")

print("\nDummy LSTM model development complete!")
# --- Continue from Step 5 in the same file (ai_model/train_lstm.py) ---

import os
import joblib # type: ignore # For saving/loading the scaler

print("\n" + "="*50 + "\n")
print("Step 6: Saving the Trained Model and Scaler...")

# Create directories to save models and scalers if they don't exist
model_save_dir = 'saved_models'
scaler_save_dir = 'scalers'

os.makedirs(model_save_dir, exist_ok=True)
os.makedirs(scaler_save_dir, exist_ok=True)

# Define file paths
model_path = os.path.join(model_save_dir, 'lstm_price_predictor.h5')
scaler_path = os.path.join(scaler_save_dir, 'price_scaler.pkl')

# Save the trained model
# Keras models can be saved in HDF5 format
model.save(model_path)
print(f"Model saved successfully to: {model_path}")

# Save the MinMaxScaler
# We use joblib for saving scikit-learn objects
joblib.dump(scaler, scaler_path)
print(f"Scaler saved successfully to: {scaler_path}")

print("\nModel and Scaler saving complete.")
print("\n" + "="*50 + "\n")