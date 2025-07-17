# price_forecaster.py
# price_forecaster.py
import matplotlib
matplotlib.use('TkAgg') # หรือ 'Qt5Agg' หรือ 'Agg' (ถ้าไม่ต้องการแสดงผลหน้าต่าง)
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
# ... (โค้ดส่วนที่เหลือ)
# ข้อมูลราคาปิดหุ้นย้อนหลัง 50 วัน
historical_prices = [
    100.0, 101.5, 102.3, 100.8, 99.5, 98.7, 99.9, 101.2, 103.0, 102.5,
    100.3, 99.1, 98.0, 97.5, 98.2, 99.0, 100.5, 102.0, 103.5, 104.0,
    103.2, 102.8, 101.9, 100.7, 99.8, 99.0, 98.5, 97.9, 98.3, 99.1,
    100.0, 101.0, 102.0, 103.0, 104.0, 103.5, 102.9, 101.5, 100.5, 99.5,
    98.8, 97.7, 96.9, 97.0, 97.5, 98.0, 99.0, 100.0, 101.0, 102.0
]

# --- กำหนดค่าพารามิเตอร์หลัก ---
lookback_periods = [3, 5, 10]
sma_periods = [5, 10]

def create_features_and_target(prices, lookback_periods=[3, 5, 10], sma_periods=[5, 10]):
    """
    สร้างฟีเจอร์ (features) และตัวแปรเป้าหมาย (target variable)
    จากลิสต์ของราคาปิด

    Args:
        prices (list): ลิสต์ของราคาปิดหุ้น
        lookback_periods (list): จำนวนวันที่ย้อนกลับไปใช้เป็นฟีเจอร์ราคาปิด
        sma_periods (list): จำนวนวันที่ใช้คำนวณ Simple Moving Average (SMA)

    Returns:
        pd.DataFrame: DataFrame ที่มีฟีเจอร์ (X) และตัวแปรเป้าหมาย (y)
    """
    df = pd.DataFrame(prices, columns=['close'])
    
    # --- สร้างฟีเจอร์ ---
    
    # 1. ราคาปิดย้อนหลัง (Lagged Prices)
    for i in lookback_periods:
        df[f'close_lag_{i}'] = df['close'].shift(i)
        
    # 2. Simple Moving Average (SMA)
    for period in sma_periods:
        df[f'sma_{period}'] = df['close'].rolling(window=period).mean()
        
    # --- สร้างตัวแปรเป้าหมาย (Target Variable) ---
    # target คือ ราคาปิดของวันถัดไป
    df['target'] = df['close'].shift(-1)
    
    # ลบแถวที่มีค่า NaN ที่เกิดจากการ shift หรือ rolling (SMA)
    # เนื่องจากฟีเจอร์ในแถวเหล่านั้นไม่สมบูรณ์
    df = df.dropna()
    
    return df

# ทดสอบฟังก์ชัน
processed_df = create_features_and_target(historical_prices, lookback_periods, sma_periods)
print("Processed DataFrame with Features and Target:")
print(processed_df.head())
print(f"\nShape of Processed DataFrame: {processed_df.shape}")
print(f"Columns: {processed_df.columns.tolist()}")

# แยก X (features) และ y (target)
# เราจะเลือกคอลัมน์ที่เป็นฟีเจอร์ทั้งหมด ยกเว้น 'close' และ 'target'
features_columns = [col for col in processed_df.columns if col not in ['close', 'target']]
X = processed_df[features_columns]
y = processed_df['target']

print(f"\nExample of Features (X) head:\n{X.head()}")
print(f"\nExample of Target (y) head:\n{y.head()}")

from sklearn.model_selection import train_test_split 

# --- ขั้นตอนที่ 2: การแบ่งข้อมูล (Train-Test Split) ---

# กำหนดสัดส่วนการแบ่งข้อมูล (เช่น 80% train, 20% test)
train_split_ratio = 0.8
split_index = int(len(processed_df) * train_split_ratio)

# แบ่งข้อมูลโดยใช้ index
X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]
y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print(f"\n--- Data Split Summary ---")
print(f"Total samples after dropping NaNs: {len(processed_df)}")
print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")
print(f"Shape of X_train: {X_train.shape}, y_train: {y_train.shape}")
print(f"Shape of X_test: {X_test.shape}, y_test: {y_test.shape}")

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# --- ขั้นตอนที่ 3: การสร้างและฝึกโมเดล (Model Training) ---

print(f"\n--- Model Training ---")

# สร้าง Instance ของ RandomForestRegressor
# n_estimators คือจำนวน Decision Trees ใน Forest (ปรับได้)
# random_state เพื่อให้ผลลัพธ์ repeatable
model = RandomForestRegressor(n_estimators=100, random_state=42)

# ฝึกโมเดลด้วยข้อมูลชุดฝึก
model.fit(X_train, y_train)

print(f"RandomForestRegressor model trained successfully.")

# --- การประเมินประสิทธิภาพของโมเดล (Evaluation on Test Set) ---
print(f"\n--- Model Evaluation on Test Set ---")

# ทำนายราคาจากชุดทดสอบ
y_pred = model.predict(X_test)

# คำนวณ Mean Squared Error (MSE) - ค่าเฉลี่ยของกำลังสองของความแตกต่างระหว่างค่าจริงกับค่าทำนาย
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error (MSE) on Test Set: {mse:.4f}")

# คำนวณ R-squared (R2 Score) - อธิบายว่าโมเดลสามารถอธิบายความแปรปรวนของข้อมูลได้ดีแค่ไหน (0-1, ยิ่งใกล้ 1 ยิ่งดี)
r2 = r2_score(y_test, y_pred)
print(f"R-squared (R2 Score) on Test Set: {r2:.4f}")

# --- ขั้นตอนที่ 4: การทำนายแบบ Multi-Step Ahead ---

print(f"\n--- Multi-Step Ahead Price Prediction ---")

# จำนวนวันที่ต้องการทำนายล่วงหน้า
num_prediction_days = 5

# ฟังก์ชันสำหรับสร้างฟีเจอร์จากลิสต์ราคาล่าสุด
def create_prediction_features(prices, lookback_periods, sma_periods, feature_columns):
    """
    สร้างฟีเจอร์จากลิสต์ของราคาปิดล่าสุดเพื่อใช้ในการทำนาย

    Args:
        prices (list): ลิสต์ของราคาปิดล่าสุด
        lookback_periods (list): จำนวนวันที่ย้อนกลับไปใช้เป็นฟีเจอร์ราคาปิด
        sma_periods (list): จำนวนวันที่ใช้คำนวณ Simple Moving Average (SMA)
        feature_columns (list): ชื่อคอลัมน์ฟีเจอร์ที่โมเดลคาดหวัง

    Returns:
        pd.DataFrame: DataFrame ที่มีฟีเจอร์สำหรับทำนาย (ควรมีเพียง 1 แถว)
    """
    df_temp = pd.DataFrame(prices, columns=['close'])
    
    for i in lookback_periods:
        df_temp[f'close_lag_{i}'] = df_temp['close'].shift(i)
        
    for period in sma_periods:
        df_temp[f'sma_{period}'] = df_temp['close'].rolling(window=period).mean()
        
    features_row = df_temp.dropna().iloc[-1:] 
    
    return features_row[feature_columns]

predicted_prices = []
current_prices_for_prediction = list(historical_prices)

required_history_length = max(max(lookback_periods), max(sma_periods)) + 1 

for i in range(num_prediction_days):
    print(f"Predicting Day {i+1}...")
    
    if len(current_prices_for_prediction) < required_history_length:
        print(f"Error: Not enough historical data to create features for prediction. Need at least {required_history_length} prices. Current: {len(current_prices_for_prediction)}")
        break 

    recent_prices_for_features = current_prices_for_prediction[-required_history_length:]

    current_features_df = create_prediction_features(
        recent_prices_for_features,
        lookback_periods=lookback_periods, # ส่งค่าจากตัวแปร global
        sma_periods=sma_periods,          # ส่งค่าจากตัวแปร global
        feature_columns=features_columns  # ส่งค่าจากตัวแปร global
    )
    
    if current_features_df.empty:
        print("Warning: Could not create valid features for prediction. Skipping this day.")
        break 
        
    next_price_prediction = model.predict(current_features_df)[0]
    predicted_prices.append(next_price_prediction)
    
    current_prices_for_prediction.append(next_price_prediction)
    
    print(f"  Predicted Price for Day {i+1}: {next_price_prediction:.2f}")

# --- ผลลัพธ์สุดท้าย (Final Result) ---
print(f"\n--- Final Predicted Prices for the next {num_prediction_days} days ---")
for i, price in enumerate(predicted_prices):
    print(f"Day {i+1}: {price:.2f}")

import matplotlib.pyplot as plt

# --- ขั้นตอนที่ 5: การแสดงผลด้วยกราฟ (Visualization) ---

print(f"\n--- Plotting Price Trend ---")

# สร้างแกน X สำหรับราคาในอดีตและราคาที่ทำนาย
historical_indices = range(len(historical_prices))
predicted_indices = range(len(historical_prices), len(historical_prices) + num_prediction_days)

plt.figure(figsize=(12, 6)) 

# พล็อตราคาจริงในอดีต
plt.plot(historical_indices, historical_prices, label='Historical Prices', color='blue', marker='o', linestyle='-')

# พล็อตราคาที่ทำนาย
plt.plot(
    [historical_indices[-1], predicted_indices[0]],
    [historical_prices[-1], predicted_prices[0]],
    color='red', linestyle='--', marker='o', alpha=0.7
)
plt.plot(
    predicted_indices,
    predicted_prices,
    label='Predicted Prices',
    color='red',
    marker='x',
    linestyle='--',
    alpha=0.7
)


plt.title('Stock Price Trend: Historical vs. Predicted') 
plt.xlabel('Days') 
plt.ylabel('Price') 
plt.legend() 
plt.grid(True) 
plt.show() 
print("Graph plotted successfully. Check the pop-up window.")

# --- NEW: บันทึกโมเดลและชื่อฟีเจอร์สำหรับ Backend ---
MODEL_DIR = 'models' # โฟลเดอร์สำหรับเก็บโมเดล
os.makedirs(MODEL_DIR, exist_ok=True) # สร้างโฟลเดอร์ถ้ายังไม่มี

model_path = os.path.join(MODEL_DIR, 'random_forest_model.pkl')
features_path = os.path.join(MODEL_DIR, 'random_forest_features.json')

# บันทึกโมเดล
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
print(f"\nRandom Forest model saved to: {model_path}")

# บันทึกชื่อฟีเจอร์
with open(features_path, 'w') as f:
    json.dump(features_columns, f)
print(f"Feature columns saved to: {features_path}")