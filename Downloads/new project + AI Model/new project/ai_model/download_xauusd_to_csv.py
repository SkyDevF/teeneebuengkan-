import yfinance as yf
import pandas as pd

# กำหนดสัญลักษณ์ทองคำ (Gold Futures)
symbol = 'GC=F'  # XAU/USD (COMEX Gold Futures)

# ดาวน์โหลดข้อมูลย้อนหลัง 5000 วัน (ประมาณ 20 ปี)
data = yf.download(symbol, period='5000d', interval='1d')

# ตรวจสอบและบันทึกเฉพาะคอลัมน์ที่ต้องการ
if not data.empty:
    data = data.reset_index()
    data = data[['Date', 'Close', 'High', 'Low', 'Open', 'Volume']]
    data.to_csv('xau_usd_historical_data.csv', index=False)
    print('ดาวน์โหลดและบันทึกข้อมูลสำเร็จ: xau_usd_historical_data.csv')
else:
    print('ไม่พบข้อมูลสำหรับสัญลักษณ์นี้')
