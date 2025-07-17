// src/components/StatisticsModal.js
import React, { useState, useEffect, useCallback } from 'react';
import './StatisticsModal.css';

// Helper function to calculate stats from a list of trades
const calculateStatsFromHistory = (history) => {
    if (!history || history.length === 0) {
        return { totalTrades: 0, winRate: 0, averageProfit: 0, averageLoss: 0, profitLossRatio: 'N/A' };
    }

    const totalTrades = history.length;
    const winningTrades = history.filter(t => t.profit_loss >= 0);
    const losingTrades = history.filter(t => t.profit_loss < 0);

    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0);
    const totalLoss = losingTrades.reduce((sum, t) => sum + t.profit_loss, 0);
    const averageProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitLossRatio = (averageProfit && averageLoss && averageLoss !== 0) ? (averageProfit / Math.abs(averageLoss)).toFixed(2) : 'N/A';
    
    return { totalTrades, winRate, averageProfit, averageLoss, profitLossRatio };
};

// A reusable component to render a set of stats
const StatsGrid = ({ title, statsData }) => {
    if (!statsData || statsData.totalTrades === 0) {
        return (
            <div className="stats-section">
                <h4>{title}</h4>
                <div className="stats-message">No statistics available for this selection.</div>
            </div>
        );
    }
    const profitLossRatio = statsData.profitLossRatio || ((statsData.averageProfit && statsData.averageLoss && statsData.averageLoss !== 0) ? (statsData.averageProfit / Math.abs(statsData.averageLoss)).toFixed(2) : 'N/A');
    const totalTradesLabel = title.includes('AI') ? 'Total Signals' : 'Total Trades';

    return (
        <div className="stats-section">
            <h4>{title}</h4>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">{totalTradesLabel}</div>
                    <div className="stat-value">{statsData.totalTrades}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Win Rate</div>
                    <div className="stat-value win-rate">{statsData.winRate.toFixed(1)}%</div>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${statsData.winRate}%` }}></div>
                    </div>
                </div>
                {/* These might not be available for AI stats, so we check */}
                {statsData.averageProfit !== undefined && (
                     <div className="stat-card">
                        <div className="stat-label">Profit/Loss Ratio</div>
                        <div className="stat-value">{profitLossRatio}</div>
                    </div>
                )}
                {statsData.averageProfit !== undefined && (
                    <div className="stat-card">
                        <div className="stat-label">Avg. Profit</div>
                        <div className="stat-value positive">${statsData.averageProfit.toFixed(2)}</div>
                    </div>
                )}
                {statsData.averageLoss !== undefined && (
                    <div className="stat-card">
                        <div className="stat-label">Avg. Loss</div>
                        <div className="stat-value negative">${Math.abs(statsData.averageLoss).toFixed(2)}</div>
                    </div>
                )}
                {statsData.bestPair && (
                    <div className="stat-card">
                        <div className="stat-label">Best Performing Pair</div>
                        <div className="stat-value">{statsData.bestPair}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// New component for trade history with date filter
const TradeHistoryList = ({ history }) => {
    const [selectedDate, setSelectedDate] = useState(''); // State for the date filter

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const clearFilter = () => {
        setSelectedDate('');
    };

    const filteredHistory = history.filter(trade => {
        if (!selectedDate) return true; // If no date is selected, show all trades
        const tradeDate = new Date(trade.close_time).toISOString().split('T')[0];
        return tradeDate === selectedDate;
    });

    const renderHistoryList = () => {
        if (history.length === 0) {
            return <div className="stats-message">No closed trades to display.</div>;
        }
        if (filteredHistory.length === 0) {
            return <div className="stats-message">No trades found for the selected date.</div>;
        }
        return (
            <div className="trade-history-container">
                <div className="trade-history-list">
                    {/* Header */}
                    <div className="history-item header">
                        <span>Date</span>
                        <span>Pair</span>
                        <span>Type</span>
                        <span>Entry Price</span>
                        <span>Close Price</span>
                        <span>P/L ($)</span>
                    </div>
                    {/* Body */}
                    {filteredHistory.map(trade => (
                        <div key={trade.id} className="history-item">
                            <span>{new Date(trade.close_time).toLocaleDateString()}</span>
                            <span>{trade.symbol}</span>
                            <span className={`signal-${trade.signal_type.toLowerCase()}`}>{trade.signal_type}</span>
                            <span>{trade.entry_price.toFixed(5)}</span>
                            <span>{trade.close_price.toFixed(5)}</span>
                            <span className={trade.profit_loss >= 0 ? 'profit' : 'loss'}>
                                {trade.profit_loss.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="stats-section">
            <h4>Your Trade History</h4>
            <div className="history-filter-container">
                <label htmlFor="history-date-filter">Filter by Date:</label>
                <input
                    type="date"
                    id="history-date-filter"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-input"
                />
                {selectedDate && <button onClick={clearFilter} className="clear-filter-button">Clear Filter</button>}
            </div>
            {renderHistoryList()}
        </div>
    );
};

const StatisticsModal = ({ isOpen, onClose, selectedSymbol }) => {
    const [userStats, setUserStats] = useState(null);
    const [aiStats, setAiStats] = useState(null);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // New state for the stats filtered by the selected symbol
    const [filteredUserStats, setFilteredUserStats] = useState(null);

    const fetchAllStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [userStatsResponse, aiStatsResponse, historyResponse] = await Promise.all([
                fetch('http://localhost:3001/api/statistics'),
                fetch('http://localhost:3001/api/ai-statistics'),
                fetch('http://localhost:3001/api/trades/history')
            ]);

            if (userStatsResponse.ok) {
                const userData = await userStatsResponse.json();
                setUserStats(userData);
            } else {
                console.error(`Failed to fetch user statistics. Status: ${userStatsResponse.status}`);
            }

            if (aiStatsResponse.ok) {
                const aiData = await aiStatsResponse.json();
                setAiStats(aiData);
            } else {
                console.error(`Failed to fetch AI statistics. Status: ${aiStatsResponse.status}`);
            }

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setTradeHistory(historyData);
            } else {
                console.error(`Failed to fetch trade history. Status: ${historyResponse.status}`);
            }

        } catch (err) {
            console.error("Error fetching statistics:", err);
            setError("Could not load all statistics data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAllStats();
        }
    }, [isOpen, fetchAllStats]);

    // This new effect calculates stats for the selected symbol when data is ready
    useEffect(() => {
        if (tradeHistory.length > 0 && selectedSymbol) {
            const symbolHistory = tradeHistory.filter(trade => trade.symbol === selectedSymbol);
            const calculatedStats = calculateStatsFromHistory(symbolHistory);
            // Add the symbol to the title later, just set the data here
            setFilteredUserStats({ ...calculatedStats, bestPair: selectedSymbol });
        } else {
            // If no history or no symbol, clear the filtered stats
            setFilteredUserStats(null);
        }
    }, [tradeHistory, selectedSymbol]); // Re-calculate when history or symbol changes

    if (!isOpen) {
        return null;
    }

    const renderContent = () => {
        if (loading) {
            return <div className="stats-message">Loading statistics...</div>;
        }
        if (error) {
            return <div className="stats-message error">Error: {error}</div>;
        }
        return (
            <>
                <StatsGrid 
                    title={`Your Trading Statistics for ${selectedSymbol}`} 
                    statsData={filteredUserStats} 
                />
                <StatsGrid title="Your Overall Trading Statistics" statsData={userStats} />
                <StatsGrid title="AI Model Performance" statsData={aiStats} />
                <TradeHistoryList history={tradeHistory} />
            </>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stats-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Performance Statistics</h2>
                {renderContent()}
            </div>
        </div>
    );
};

export default StatisticsModal;
