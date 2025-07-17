// src/components/RealtimePriceTicker.js
import React, { useState, useEffect } from 'react';
import './RealtimePriceTicker.css';

// The component now receives livePrices and error as props
function RealtimePriceTicker({ symbols, livePrices, error }) {
    // เปลี่ยน state ให้เก็บข้อมูลราคาและสถานะการเปลี่ยนแปลงใน object เดียวกัน
    const [priceData, setPriceData] = useState({});

    // This effect now reacts to changes in the livePrices prop
    useEffect(() => {
        if (!livePrices) return;
        
        // Update state by comparing new prices with old prices
        setPriceData(currentPriceData => {
            const updatedData = {}; // Start with a fresh object to ensure re-render
            // We iterate over the base symbols to maintain order
            for (const symbol of symbols) {
                const newPrice = livePrices[symbol];
                if (newPrice !== undefined) {
                    const oldPrice = currentPriceData[symbol] ? currentPriceData[symbol].price : null;
                    
                    let change = 'same';
                    if (oldPrice !== null && newPrice > oldPrice) {
                        change = 'positive';
                    } else if (oldPrice !== null && newPrice < oldPrice) {
                        change = 'negative';
                    }
                    
                    // Add flash: true for every update to trigger the animation
                    updatedData[symbol] = { price: newPrice, change: change, flash: true };
                }
            }
            return updatedData;
        });
    }, [livePrices, symbols]);

    // This new effect is responsible for removing the 'flash' state
    // after the animation has had time to complete.
    useEffect(() => {
        if (Object.keys(priceData).length === 0) return;

        const timer = setTimeout(() => {
            setPriceData(currentData => {
                const newData = { ...currentData };
                let needsUpdate = false;
                for (const symbol in newData) {
                    if (newData[symbol].flash) {
                        newData[symbol] = { ...newData[symbol], flash: false };
                        needsUpdate = true;
                    }
                }
                return needsUpdate ? newData : currentData;
            });
        }, 500); // This duration should match the CSS animation time

        return () => clearTimeout(timer);
    }, [priceData]);

    return (
        <div className="realtime-price-ticker">
            <h3>Live Prices</h3>
            {error && <div className="ticker-error">Could not load prices.</div>}
            <div className="price-list">
                {Object.entries(priceData).map(([symbol, data]) => {
                    // Combine all classes: 'price', the change direction, and the flash animation trigger
                    const priceClass = `price ${data.change || ''} ${data.flash ? 'flash-update' : ''}`;

                    // เพิ่ม Logic สำหรับกำหนดจำนวนทศนิยมที่ถูกต้อง
                    const isJpyOrGold = symbol.toUpperCase().includes('JPY') || symbol.toUpperCase().includes('XAU');
                    const decimalPlaces = isJpyOrGold ? 2 : 5; // ทองคำและ JPY ใช้ 2 ตำแหน่ง, อื่นๆ ใช้ 5
                    return (
                        <div key={symbol} className="price-item">
                            <span>{symbol}:</span>
                            <span className={priceClass}>{data.price !== null ? data.price.toFixed(decimalPlaces) : 'N/A'}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RealtimePriceTicker;