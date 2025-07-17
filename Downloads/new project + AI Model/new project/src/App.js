// c:\Users\LENOVO\Desktop\new project\src\App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; 
import TradingViewChart from './components/TradingViewChart'; // เปลี่ยนมาใช้ TradingViewChart ที่ปรับปรุงแล้ว
import { useAuth } from './context/AuthContext'; // Import the useAuth hook
import RegisterModal from './components/RegisterModal'; // Import the RegisterModal
import LoginModal from './components/LoginModal'; // Import the LoginModal
import NewsModal from './components/NewsModal'; 
import ProfileModal from './components/ProfileModal'; // Import the ProfileModal
import StatisticsModal from './components/StatisticsModal'; // Import the StatisticsModal
import TradeSignalDetails from './components/TradeSignalDetails'; // เพิ่ม import สำหรับแสดงรายละเอียดสัญญาณ
import OpenTradesPanel from './components/OpenTradesPanel'; // เพิ่ม import สำหรับแสดงรายการเทรดที่เปิดอยู่
import ThemeSwitcher from './components/ThemeSwitcher'; // Import the ThemeSwitcher
import RealtimePriceTicker from './components/RealtimePriceTicker'; // Import RealtimePriceTicker

// 1. ย้าย forexSymbols มาไว้นอกคอมโพเนนต์
const forexSymbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'USD/CHF', 'XAU/USD'];

function App() {
    const defaultSymbol = 'EUR/USD';
    const defaultTimeframe = '1d';

    // --- State Management ---
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
    const [timeframe, setTimeframe] = useState(defaultTimeframe);
    const [signalsData, setSignalsData] = useState({}); // State สำหรับเก็บข้อมูล Signal ของทุก Symbol
    const [error, setError] = useState(null);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // State for Register Modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State for Profile Modal
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // State for Statistics Modal
    const [openTrades, setOpenTrades] = useState([]); // State for open trades
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for Login Modal
    const [livePrices, setLivePrices] = useState({}); // New state for live prices
    const [livePricesError, setLivePricesError] = useState(null); // New state for live price errors
    const { isLoggedIn, user, logout, isAuthLoading } = useAuth(); // Get auth state and functions from context

    // --- Theme Management ---
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = ''; // Clear existing classes
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);
    // --- End Theme Management ---

    const fetchSignals = useCallback(async (symbolsToFetch, tf) => {
        // ไม่ต้อง setIsLoading(true) ทุกครั้ง เพื่อให้เป็นการอัปเดตพื้นหลัง
        try {
            const newSignalsData = {};
            // Use a for...of loop to fetch signals sequentially to respect API rate limits.
            for (const symbol of symbolsToFetch) {
                // The backend has a rate limiter, so these calls will be spaced out automatically.
                const response = await fetch(`http://localhost:3001/api/ai-signal?symbol=${symbol}&timeframe=${tf}&_=${new Date().getTime()}`, {
                    cache: 'no-cache'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.symbol) {
                        newSignalsData[data.symbol] = data;
                    }
                } else {
                    console.error(`HTTP error for ${symbol}! status: ${response.status}`);
                    // We can continue to the next symbol even if one fails
                }
            }

            // อัปเดต state โดยรวมข้อมูลเก่าและใหม่เข้าด้วยกัน
            setSignalsData(prevData => ({ ...prevData, ...newSignalsData }));
            setError(null); // ล้าง error ถ้า fetch สำเร็จ
        } catch (err) {
            console.error("Failed to fetch AI signals:", err);
            setError(`Failed to load signals: ${err.message}`);
        } finally {
            // Only set loading to false after the very first batch of fetches is complete.
            if (isLoading) {
                setIsLoading(false);
            }
        }
    }, [isLoading, setIsLoading, setSignalsData, setError]);

    // --- Data Fetching Effects ---

    // Effect to fetch AI Signal for the *currently selected* symbol
    useEffect(() => {
        if (!isLoggedIn) return;

        const updateCurrentSignal = () => {
            console.log(`Fetching AI signal for selected symbol: ${selectedSymbol}`);
            fetchSignals([selectedSymbol], timeframe);
         };

        updateCurrentSignal(); // Fetch immediately when symbol or timeframe changes

        const interval = setInterval(updateCurrentSignal, 300000); // Refresh current signal every 5 minutes

        return () => clearInterval(interval);
    }, [selectedSymbol, timeframe, isLoggedIn, fetchSignals]); // Re-run only when these change
    
    // --- New Effect for fetching Live Prices ---
    useEffect(() => {
        if (!isLoggedIn) return;
 
        const fetchPrices = async () => {
            try {
                const symbolsToFetch = [...new Set([...forexSymbols, ...openTrades.map(t => t.symbol)])];
                if (symbolsToFetch.length === 0) return;
 
                const response = await fetch(`http://localhost:3001/api/live-prices?symbols=${symbolsToFetch.join(',')}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    // ส่งต่อ errorData ทั้งหมดเพื่อให้สามารถตรวจสอบ code ได้
                    const err = new Error(errorData.message || 'Failed to fetch live prices.');
                    err.code = errorData.code;
                    throw err;
                }
                const newPrices = await response.json();
                setLivePricesError(null);
                setLivePrices(currentPrices => ({ ...currentPrices, ...newPrices }));
            } catch (error) {
                // โยน error ออกไปเพื่อให้ fetchPricesWithRetry จัดการ
                throw error;
            }
        };
 
        const fetchPricesWithRetry = async (retries = 3) => {
            try {
                await fetchPrices();
                setLivePricesError(null);
            } catch (error) {
                console.error(`Failed to fetch prices: ${error.message}`);
                if (error.code === 429 && retries > 0) {
                    console.log(`Rate limit hit. Retrying in 60 seconds... (${retries} retries left)`);
                    setTimeout(() => fetchPricesWithRetry(retries - 1), 60000); // รอ 1 นาทีแล้วลองใหม่
                } else {
                    setLivePricesError(error.message); // แสดง error สุดท้าย
                }
            }
        };
 
        fetchPricesWithRetry();
        const intervalId = setInterval(fetchPricesWithRetry, 300000); // ปรับเป็น 5 นาที (300,000ms)
 
        return () => clearInterval(intervalId);
    }, [isLoggedIn, openTrades]);

    const handleSymbolChange = (symbol) => {
        setSelectedSymbol(symbol);
    };

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
    };

    const openNewsModal = () => setIsNewsModalOpen(true);
    const closeNewsModal = () => setIsNewsModalOpen(false);

    const openStatsModal = () => setIsStatsModalOpen(true);
    const closeStatsModal = () => setIsStatsModalOpen(false);

    const openProfileModal = () => setIsProfileModalOpen(true);
    const closeProfileModal = () => setIsProfileModalOpen(false);

    // --- ฟังก์ชันสำหรับฟีเจอร์ใหม่ ---
    const openLoginModal = () => {
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
    };

    const openRegisterModal = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
    };

    const handleAuthClick = () => {
        if (isLoggedIn) {
            logout();
            alert('ออกจากระบบสำเร็จ!');
        } else {
            openLoginModal();
        }
    };

    const handleContactSupport = () => {
        // สร้างลิงก์เพื่อเปิดโปรแกรมอีเมล
        window.location.href = "mailto:support@yourapp.com?subject=Support Request";
    };

    // --- ฟังก์ชันสำหรับจัดการ Open Trades ---
    const handleExecuteTrade = (tradeData) => {
        const newTrade = {
            ...tradeData,
            id: new Date().getTime(), // ใช้ timestamp เป็น ID ชั่วคราว
            openTime: new Date(),
        };
        setOpenTrades(prevTrades => [...prevTrades, newTrade]);
        // ไม่ใช้ alert แล้ว เพราะจะเห็นผลในหน้าจอ OpenTradesPanel ทันที
    };

    const handleCloseTrade = async (tradeId) => {
        const tradeToClose = openTrades.find(trade => trade.id === tradeId);
        if (!tradeToClose) return;

        // Use livePrices for the most accurate close price
        const currentPrice = livePrices[tradeToClose.symbol] ? parseFloat(livePrices[tradeToClose.symbol]) : null;

        if (currentPrice === null) {
            alert(`Could not get current price for ${tradeToClose.symbol} to close the trade. Please try again in a moment.`);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/trades/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trade: tradeToClose, closePrice: currentPrice }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to close trade on server.');
            }

            alert(result.message); // Or use a more subtle notification
            setOpenTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId));
        } catch (error) {
            console.error('Error closing trade:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleCloseAllTrades = async () => {
        if (openTrades.length === 0) return;

        if (window.confirm(`Are you sure you want to close all ${openTrades.length} trades?`)) {            
            // 1. รวบรวมข้อมูลเทรดทั้งหมดที่จะปิด
            const tradesToClosePayload = openTrades.map(trade => {
                // Use livePrices for the most accurate closing price
                const currentPrice = livePrices[trade.symbol] ? parseFloat(livePrices[trade.symbol]) : null;
                if (currentPrice === null) {
                    console.warn(`Skipping trade ${trade.id} (${trade.symbol}) in 'close all' because live price is unavailable.`);
                    return null;
                }
                return { trade, closePrice: currentPrice };
            }).filter(Boolean); // กรองรายการที่เป็น null ออก

            if (tradesToClosePayload.length !== openTrades.length) {
                alert("Could not get current prices for all trades. Only closing trades with available price data.");
            }

            if (tradesToClosePayload.length === 0) {
                alert("Could not close any trades due to missing price data.");
                return;
            }

            // 2. ส่งคำขอเดียวไปยัง API ใหม่
            try {
                const response = await fetch('http://localhost:3001/api/trades/close-multiple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tradesToClose: tradesToClosePayload }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to close trades on server.');
                }

                // 3. อัปเดต State ของหน้าเว็บตามข้อมูลที่ได้รับกลับมา
                const successfulIds = result.records.map(record => record.id);
                setOpenTrades(prevTrades => prevTrades.filter(trade => !successfulIds.includes(trade.id)));
                alert(result.message);
            } catch (error) {
                console.error('Error closing all trades:', error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const currentSignal = signalsData[selectedSymbol] || null;

    // --- จบส่วนฟังก์ชันสำหรับฟีเจอร์ใหม่ ---

    // แสดงหน้า Loading ขณะตรวจสอบ Session
    if (isAuthLoading) {
        return <div className="loading-fullscreen">
            <span>Loading Application...</span>
        </div>;
    }

    return (
        <div className={`App ${theme}-theme`}>
            <header className="App-header">
                <div className="header-left">
                    {isLoggedIn && <div className="ai-signal-display">
                        {error && !currentSignal && <p className="error-message">{error}</p>}
                        {currentSignal ? (
                            <>
                                <div className="signal-item">
                                    <span className="signal-label">Pair:</span>
                                    <span className="signal-value">{currentSignal.symbol}</span>
                                </div>
                                <div className="signal-item">
                                    <span className="signal-label">Signal:</span>
                                    <span className="signal-value" data-signal={currentSignal.signal.toLowerCase()}> 
                                        {currentSignal.signal}
                                    </span>
                                </div>
                                <div className="signal-item">
                                    <span className="signal-label">Support:</span>
                                    <span className="signal-value">{currentSignal.support}</span>
                                </div>
                                <div className="signal-item">
                                    <span className="signal-label">Resistance:</span>
                                    <span className="signal-value">{currentSignal.resistance}</span>
                                </div>
                                <div className="signal-item">
                                    <span className="signal-label">R:R:</span>
                                    <span className="signal-value">{currentSignal.riskReward}</span>
                                </div>
                                {currentSignal.confidence && (
                                    <div className="signal-item">
                                        <span className="signal-label">Confidence:</span>
                                        <span className="signal-value">{currentSignal.confidence}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span>Loading AI signal...</span>
                        )}
                    </div>}
                </div>

                <div className="header-right"> 
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                    {/* ปรับ className ของปุ่มต่างๆ ให้ตรงกับ App.css เพื่อความหมายที่ถูกต้องและสไตล์ที่เฉพาะเจาะจง */}
                    <button className="support-button" onClick={handleContactSupport}>Support</button>
                    {isLoggedIn && (
                        <button className="stats-button" onClick={openStatsModal}>Statistics</button>
                    )}
                    <button className="news-button" onClick={openNewsModal}>News</button>
                    
                    {isLoggedIn ? (
                        <>
                            <span className="user-greeting">Welcome, {user.name}!</span>
                            <img 
                                src={user.profileImageUrl ? `http://localhost:3001${user.profileImageUrl}` : 'https://via.placeholder.com/40'} 
                                alt="Profile" 
                                className="header-profile-pic" 
                            />
                            <button className="profile-button" onClick={openProfileModal}>Profile</button>
                            <button className="auth-button logout" onClick={handleAuthClick}>
                                Logout
                            </button>                        
                        </>
                    ) : (
                        <>
                            <button className="auth-button login" onClick={openLoginModal}>Login</button>
                            <button className="auth-button register" onClick={openRegisterModal}>Register</button>
                        </>
                    )}
                </div>
            </header>

            {isLoggedIn ? (
                <div className="app-container"> 
                    <aside className="App-sidebar"> 
                        <h2>Forex Pairs</h2>
                        {/* เปลี่ยนจากปุ่มเป็น Dropdown สำหรับเลือกคู่เงิน */}
                        <div className="selector-container">
                            <label htmlFor="symbol-select">Select Pair</label>
                            <select
                                id="symbol-select"
                                value={selectedSymbol}
                                onChange={(e) => handleSymbolChange(e.target.value)}
                                className="custom-select"
                            >
                                {forexSymbols.map((symbol) => (
                                    <option key={symbol} value={symbol}>
                                        {symbol}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* เพิ่มหน้าต่างแสดงราคาปัจจุบันที่นี่ */}
                        <RealtimePriceTicker 
                            symbols={forexSymbols} 
                            livePrices={livePrices} 
                            error={livePricesError} 
                        />
                    </aside>

                    <main className="App-main"> 
                        {/* เปลี่ยนจากปุ่มเป็น Dropdown สำหรับเลือก Timeframe */}
                        <div className="selector-container timeframe-selector">
                            <label htmlFor="timeframe-select">Timeframe</label>
                             <select
                                id="timeframe-select"
                                value={timeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="custom-select"
                            >
                                {['15m', '1h', '4h', '1d'].map((tf) => (
                                    <option key={tf} value={tf}>
                                        {tf.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <TradingViewChart
                            symbol={selectedSymbol.replace('/', '')}
                            timeframe={timeframe}
                            theme={theme} // Pass theme to chart
                        />
                        <TradeSignalDetails 
                            aiSignal={currentSignal}
                            livePrice={livePrices[selectedSymbol]}
                            isLoading={isLoading} 
                            timeframe={timeframe}
                            onExecuteTrade={handleExecuteTrade} 
                        />
                        <OpenTradesPanel
                            trades={openTrades}
                            livePrices={livePrices}
                            onCloseTrade={handleCloseTrade}
                            onCloseAllTrades={handleCloseAllTrades}
                        />
                    </main>
                </div>
            ) : (
                <div className="login-prompt-container">
                    <div className="login-prompt-box">
                        <h2>ปลดล็อกศักยภาพการเทรดของคุณ</h2>
                        <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงสัญญาณ AI, กราฟขั้นสูง และสถิติส่วนตัว</p>
                        <button className="auth-button login" onClick={handleAuthClick}>
                            เข้าสู่ระบบเพื่อเริ่มต้น
                        </button>
                        <p className="register-prompt">ยังไม่มีบัญชี? <button onClick={openRegisterModal} className="switch-link">สมัครสมาชิกที่นี่</button></p>
                    </div>
                </div>
            )}

            <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
            <NewsModal isOpen={isNewsModalOpen} onClose={closeNewsModal} />
            <StatisticsModal 
                isOpen={isStatsModalOpen} 
                onClose={closeStatsModal} 
                selectedSymbol={selectedSymbol}
            />
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
                onSwitchToRegister={openRegisterModal} 
            />
            <RegisterModal 
                isOpen={isRegisterModalOpen} 
                onClose={() => setIsRegisterModalOpen(false)} 
                onSwitchToLogin={openLoginModal}
            />
        </div>
    );
    
}
export default App;
