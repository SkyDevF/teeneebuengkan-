import React, { useState } from 'react';
import './TradeSignalDetails.css';

function TradeSignalDetails({ aiSignal, livePrice, isLoading, timeframe, onExecuteTrade }) {
    const [lotSize, setLotSize] = useState('0.01');

    if (isLoading) {
        return (
            <div className="trade-details-container loading">

                <p>กำลังวิเคราะห์สัญญาณซื้อขาย...</p>
            </div>);
    }
    // กำหนดแหล่งที่มาราคาเริ่มต้นจาก timeframe และตรวจสอบความถูกต้องของข้อมูล
    let entryPriceSource;
    switch (timeframe) 
    {
        case '15m':
            entryPriceSource = livePrice || aiSignal.lastPrice_15m;
            break;
        case '1h':
            entryPriceSource = livePrice || aiSignal.lastPrice_1h;
            break;
        default:
            entryPriceSource = livePrice || aiSignal.lastKnownPrice;
            break;
    }
   if (!aiSignal || aiSignal.signal === 'HOLD' || aiSignal.signal === 'ERROR' || !entryPriceSource || entryPriceSource === 'N/A') 
    {
        return (
            <div className="trade-details-container no-signal">
                <p>ยังไม่มีสัญญาณซื้อขายที่ชัดเจนในขณะนี้</p>
            </div>
        );
    }

    const { signal, symbol } = aiSignal; 

    const isJpyPair = symbol && symbol.toUpperCase().includes('JPY');
    const isGoldPair = symbol && symbol.toUpperCase().includes('XAU');
    const decimalPlaces = (isJpyPair || isGoldPair) ? 2 : 4; // ปรับเป็น 2 ตำแหน่งสำหรับ JPY, XAU และ 4 สำหรับอื่นๆ

    // --- คำนวณระยะ TP/SL ตาม Timeframe ---
    let stopLossPoints, takeProfitPoints;
    const pointValue = isJpyPair ? 0.01 : 0.0001; // ค่าของ 1 pip

    switch (timeframe) {
        case '15m':
         stopLossPoints = 20 * pointValue; // 20 pips
         takeProfitPoints = 40 * pointValue; // 40 pips
            break;
        case '1h':
        case '4h':
        case '1d':
        default:

            stopLossPoints = 150 * pointValue; // 150 pips
            takeProfitPoints = 300 * pointValue; // 300 pips
            break;
    }

    // พิเศษสำหรับทอง (XAU) ที่มีความผันผวนสูง เราจึงขยายระยะ TP/SL ให้มากขึ้น
    if (isGoldPair) {
        const goldVolatilityMultiplier = 10; // ปรับตัวคูณความผันผวนสำหรับทองได้ที่นี่
        stopLossPoints *= goldVolatilityMultiplier;
        takeProfitPoints *= goldVolatilityMultiplier;
    }

    const riskRewardRatio = (takeProfitPoints / stopLossPoints).toFixed(1);

    const lastPriceFloat = parseFloat(entryPriceSource);
    const entryPrice = lastPriceFloat.toFixed(decimalPlaces);

    const takeProfitPrice = (signal === 'BUY' ? lastPriceFloat + takeProfitPoints : lastPriceFloat - takeProfitPoints).toFixed(decimalPlaces);
    const stopLossPrice = (signal === 'BUY' ? lastPriceFloat - stopLossPoints : lastPriceFloat + stopLossPoints).toFixed(decimalPlaces);

    const handleExecuteTrade = () => {
        const tradeData = {
            symbol: aiSignal.symbol,
            signal: aiSignal.signal,
            entryPrice: lastPriceFloat,
            takeProfit: parseFloat(takeProfitPrice),
            stopLoss: parseFloat(stopLossPrice),
         lotSize: parseFloat(lotSize)
        };
        // เรียกใช้ฟังก์ชันที่ได้รับมาจาก App.js เพื่ออัปเดต state
        onExecuteTrade(tradeData);
    };

    const signalClass = signal.toLowerCase(); // 'buy' or 'sell'
    return (
        <div className={`trade-details-container ${signalClass}`}>
            <h3 className="trade-details-title">สัญญาณซื้อขายสำหรับ {symbol}</h3>
            <div className="trade-details-grid">
                <div className="trade-detail-item">
                    <span className="trade-detail-label">สัญญาณ</span>
                    <span className={`trade-detail-value signal-${signalClass}`}>{signal}</span>
                </div>
                <div className="trade-detail-item">
                    <span className="trade-detail-label">ราคาเข้า (Entry Price)</span>
                    <span className="trade-detail-value">{entryPrice}</span>
              </div>
                <div className="trade-detail-item">
                    <span className="trade-detail-label">ราคาทำกำไร (Take Profit)</span>
                    <span className="trade-detail-value positive">{takeProfitPrice}</span>
                </div>
                <div className="trade-detail-item">
                    <span className="trade-detail-label">ราคาตัดขาดทุน (Stop Loss)</span>
                 <span className="trade-detail-value negative">{stopLossPrice}</span>
               </div>
                <div className="trade-detail-item">
                    <span className="trade-detail-label">Risk:Reward</span>
                    <span className="trade-detail-value">1 : {riskRewardRatio}</span>
                </div>
            </div>

            {/* ส่วนจำลองการส่งคำสั่ง */}
            <div className="trade-execution-section">
                <div className="lot-size-input-group">
                    <label htmlFor="lot-size">Lot Size:</label>
                    <input 
                        type="number" 
                        id="lot-size" 
                        value={lotSize} 
                       onChange={(e) => setLotSize(e.target.value)} 
                        step="0.01" 
                        min="0.01" />
                </div>
                <button onClick={handleExecuteTrade} className={`execute-trade-button ${signalClass}`}>
                    Execute {signal}
                </button>
            </div>
        </div>
    );
}


export default TradeSignalDetails;