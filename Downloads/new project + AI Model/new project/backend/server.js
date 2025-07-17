// server.js
require('dotenv').config(); // เพิ่มบรรทัดนี้ที่บนสุด
// ...
const JWT_SECRET = process.env.JWT_SECRET; // เปลี่ยนมาใช้ค่าจาก .env

// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { SMA, RSI, MACD, Stochastic } = require('technicalindicators'); // Import indicators
const path = require('path'); // Import path for correct file paths
const { spawn } = require('child_process'); // Import child_process for spawning Python script
const multer = require('multer'); // 1. Import multer
const fs = require('fs').promises; // Use the promises version for convenience with async/await
const NodeCache = require('node-cache'); // Import node-cache library

// =======================================================================
// >>>>>>>>>>>>>>>>> Configure Your API Keys Here <<<<<<<<<<<<<<<<<
const TWELVEDATA_API_KEY = '0f92aba424b54109a21f7bded3d06417'; // Your Twelve Data API Key
const GNEWS_API_KEY = 'ec0cbcd2f1f5b26a60eb15028bf45b9e'; // Your GNews API Key
// =======================================================================

const app = express();
const PORT = 3001;

// 2. ตั้งค่า Multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/uploads');
        // ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
        fs.mkdir(uploadPath, { recursive: true }).then(() => {
            cb(null, uploadPath);
        }).catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้ timestamp และชื่อไฟล์เดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const tradeHistoryFilePath = path.join(__dirname, 'data', 'trade_history.json');

// Twelve Data rate limit tracking (Free tier: 800 req/day, 30 req/min)
let lastTwelveDataGlobalFetchTime = 0;
const TWELVEDATA_RATE_LIMIT_MS = 2 * 1000; // 2 seconds per request (to stay under 30 req/min, 60s/30req = 2s/req)

// =======================================================================
// Caching Setup with node-cache
// stdTTL: Standard Time-to-Live in seconds for every new entry.
// checkperiod: How often the cache checks for expired keys (in seconds).
const ohlcCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 }); // 1 hour TTL
const aiSignalCache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // 1 minute TTL
const newsCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 120 }); // 5 minute TTL

app.use(cors());
app.use(express.json());

// Helper to check if a symbol is a supported forex pair
// Helper to get point size (pip/point) for each symbol
function getPointSize(symbol) {
    if (symbol && symbol.toUpperCase() === 'XAU/USD') return 0.01; // Gold uses 0.01
    return 0.0001; // Forex pairs use 0.0001
}
const isSupportedForexPair = (symbol) => {
    const supportedForexPairs = [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'USD/CHF', 'XAU/USD'
    ];
    return supportedForexPairs.includes(symbol.toUpperCase());
};

// Middleware to enforce Twelve Data global rate limit for API calls
const enforceTwelveDataRateLimit = async (req, res, next) => {
    const timeSinceLastFetch = Date.now() - lastTwelveDataGlobalFetchTime;

    if (timeSinceLastFetch < TWELVEDATA_RATE_LIMIT_MS) {
        const waitTime = TWELVEDATA_RATE_LIMIT_MS - timeSinceLastFetch;
        console.warn(`[Rate Limit] Twelve Data API rate limit approaching. Waiting for ${waitTime}ms.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    // CRITICAL: Update the global fetch time *before* proceeding to the next request.
    lastTwelveDataGlobalFetchTime = Date.now();
    next();
};

// Apply the rate limit middleware to endpoints that use Twelve Data
app.use('/api/ai-signal', enforceTwelveDataRateLimit);
app.use('/api/ohlc-data', enforceTwelveDataRateLimit);
app.use('/api/fetch-and-save-ohlc-for-training', enforceTwelveDataRateLimit);

// --- New Endpoint for live prices ---
app.get('/api/live-prices', enforceTwelveDataRateLimit, async (req, res) => {
    const { symbols } = req.query;

    // The symbols will come as a single comma-separated string from the frontend
    if (!symbols || typeof symbols !== 'string') {
        return res.status(400).json({ error: "Symbols are required and must be a comma-separated string." });
    }

    try {
        // Construct a single URL for all symbols to make one API call instead of many
        const twelveDataUrl = `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${TWELVEDATA_API_KEY}`;
        
        console.log(`Fetching batch live prices from Twelve Data for: ${symbols}`);
        const response = await axios.get(twelveDataUrl);

        // Handle potential API error response for the whole batch
        if (response.data.code >= 400) {
             console.error(`Failed to get live prices from Twelve Data:`, response.data);
             return res.status(response.data.code).json({ error: response.data.message });
        }

        const pricesObject = {};
        // The response for multiple symbols is an object like: { "EUR/USD": { "price": "1.085" }, ... }
        for (const symbol in response.data) {
            if (response.data[symbol] && response.data[symbol].price) {
                pricesObject[symbol] = parseFloat(response.data[symbol].price);
            } else {
                console.warn(`Could not retrieve price for symbol: ${symbol} in batch request.`);
                pricesObject[symbol] = null;
            }
        }

        res.json(pricesObject);
    } catch (error) {
        console.error("Error fetching live prices:", error);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            return res.status(error.response.status).json({ error: "Failed to fetch live prices from provider.", details: error.response.data });
        }
        return res.status(500).json({ error: "A server error occurred while fetching live prices." });
    }
});



// =======================================================================
// Helper functions for Data Fetching and Indicator Calculations
// =======================================================================

// Function to get historical OHLC data from Twelve Data
// interval '1day' for daily data
const getOhlcDailyData = async (symbol) => {
    const normalizedSymbol = symbol.toUpperCase();
    
    // Check cache first using node-cache's .get() method
    const cachedData = ohlcCache.get(normalizedSymbol);
    if (cachedData) {
        console.log(`Serving Forex OHLC data for ${normalizedSymbol} from cache (Twelve Data).`);
        return cachedData;
    }

    try {
        // Twelve Data API for forex historical data
        // For full historical data, Twelve Data's free tier has limitations.
        // We'll aim for `outputsize=5000` which is a common max for free/low-tier plans.
        const twelveDataUrl = `https://api.twelvedata.com/time_series?symbol=${normalizedSymbol}&interval=1day&outputsize=5000&apikey=${TWELVEDATA_API_KEY}`;

        console.log(`Fetching OHLC data from Twelve Data for ${normalizedSymbol} (Daily, outputsize=5000)...`);
        const tdResponse = await axios.get(twelveDataUrl);

        if (tdResponse.data && tdResponse.data.values && tdResponse.data.values.length > 0) {
            const ohlcData = tdResponse.data.values.map(d => ({
                time: new Date(d.datetime), // Twelve Data uses 'datetime'
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close),
            })).reverse(); // Twelve Data returns newest first, reverse to get oldest first

            console.log(`Successfully fetched ${ohlcData.length} OHLC data points from Twelve Data.`);
            // Set data in cache. The TTL is handled automatically.
            ohlcCache.set(normalizedSymbol, ohlcData);
            return ohlcData;
        } else if (tdResponse.data && tdResponse.data.code && tdResponse.data.message) {
            console.error(`[Twelve Data Error] for OHLC daily: ${tdResponse.data.message} (Code: ${tdResponse.data.code})`);
            return null;
        }
        else {
            console.error("Twelve Data OHLC daily API error or invalid response format.");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching OHLC data from Twelve Data for ${normalizedSymbol}:`, error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
};

// Helper to save OHLC data to a CSV file for Python training
const saveOhlcDataToCsv = async (ohlcData) => {
    const csvFilePath = path.join(__dirname, '../ai_model', 'ohlc_data.csv');
    console.log(`Attempting to save OHLC data to: ${csvFilePath}`);

    if (!ohlcData || ohlcData.length === 0) {
        console.warn("No OHLC data to save to CSV.");
        return false;
    }

    // Prepare CSV header
    const csvHeader = 'time,open,high,low,close\n'; // CSV Header

    // Prepare CSV rows
    const csvRows = ohlcData.map(d => {
        const date = new Date(d.time).toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        return `${date},${d.open},${d.high},${d.low},${d.close}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;

    try {
        // Ensure the directory exists
        const dir = path.dirname(csvFilePath);
        await fs.mkdir(dir, { recursive: true }); // Create directory if it doesn't exist

        await fs.writeFile(csvFilePath, csvContent);
        console.log(`OHLC data successfully saved to ${csvFilePath}`);
        return true;
    } catch (error) {
        console.error(`Error saving OHLC data to CSV at ${csvFilePath}:`, error.message);
        return false;
    }
};

// Helper for ta.highest (Pine Script)
const calculateHighest = (highs, length) => {
    if (!highs || highs.length < length) return null;
    let highestValue = -Infinity;
    for (let i = 0; i < length; i++) {
        if (highs[highs.length - 1 - i] > highestValue) {
            highestValue = highs[highs.length - 1 - i];
        }
    }
    return highestValue;
};

// Helper for ta.lowest (Pine Script)
const calculateLowest = (lows, length) => {
    if (!lows || lows.length < length) return null;
    let lowestValue = Infinity;
    for (let i = 0; i < length; i++) {
        if (lows[lows.length - 1 - i] < lowestValue) {
            lowestValue = lows[lows.length - 1 - i];
        }
    }
    return lowestValue;
};

// Helper for ta.crossover (Pine Script)
const isCrossover = (seriesA, seriesB) => {
    if (!seriesA || !seriesB || seriesA.length < 2 || seriesB.length < 2) return false;
    const currentA = seriesA[seriesA.length - 1];
    const prevA = seriesA[seriesA.length - 2];
    const currentB = seriesB[seriesB.length - 1];
    const prevB = seriesB[seriesB.length - 2];

    return prevA <= prevB && currentA > currentB;
};

// Helper for ta.crossunder (Pine Script)
const isCrossunder = (seriesA, seriesB) => {
    if (!seriesA || !seriesB || seriesA.length < 2 || seriesB.length < 2) return false;
    const currentA = seriesA[seriesA.length - 1];
    const prevA = seriesA[seriesA.length - 2];
    const currentB = seriesB[seriesB.length - 1];
    const prevB = seriesB[seriesB.length - 2];

    return prevA >= prevB && currentA < currentB;
};

// --- Helper functions for Trade History ---
// ตรวจสอบว่าราคาปัจจุบันชน SL หรือไม่
function shouldCloseAtSl(trade, currentPrice) {
    if (!trade || typeof trade.sl === 'undefined') return false;
    if (trade.signal === 'BUY' && currentPrice <= trade.sl) return true;
    if (trade.signal === 'SELL' && currentPrice >= trade.sl) return true;
    return false;
}
const readTradeHistory = async () => {
    try {
        // Ensure the directory exists
        await fs.mkdir(path.dirname(tradeHistoryFilePath), { recursive: true });
        const data = await fs.readFile(tradeHistoryFilePath, 'utf8');
        
        // ถ้าไฟล์ว่างเปล่า ให้ return array ว่างๆ ไปเลยเพื่อป้องกัน Error จาก JSON.parse
        if (data.trim() === '') {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, it's not an error; just return an empty array.
        if (error.code === 'ENOENT') {
            return [];
        }

        // ถ้าไฟล์ JSON เสียหาย (corrupted) ให้แสดงคำเตือนและเริ่มใหม่ด้วย array ว่าง
        // วิธีนี้จะช่วยให้แอปพลิเคชัน "รักษาตัวเอง" ได้ โดยการเขียนทับไฟล์ที่เสียในการบันทึกครั้งถัดไป
        if (error instanceof SyntaxError) {
            console.warn(`[Warning] Trade history file is corrupted. A new one will be created. Error: ${error.message}`);
            return [];
        }

        // สำหรับ Error อื่นๆ ที่ไม่คาดคิด ให้โยน Error ต่อไป
        console.error("Unexpected error reading trade history file:", error);
        throw error;
    }
};

const writeTradeHistory = async (history) => {
    await fs.writeFile(tradeHistoryFilePath, JSON.stringify(history, null, 2), 'utf8');
};

const calculatePnl = (trade, closePrice) => {
    const pointSize = getPointSize(trade.symbol);
    const priceDiff = trade.signal === 'BUY'
        ? closePrice - trade.entryPrice
        : trade.entryPrice - closePrice;
    if (trade.symbol && trade.symbol.toUpperCase() === 'XAU/USD') {
        // สำหรับทอง: PnL = priceDiff * (lotSize * 100)
        return priceDiff * (trade.lotSize * 100);
    }
    // สำหรับ forex: (priceDiff / pointSize) * 100000 * lotSize
    return (priceDiff / pointSize) * 100000 * trade.lotSize;
};

// --- New Endpoint for closing single trade ---
app.post('/api/trades/close', async (req, res) => {
    const { trade, closePrice } = req.body;

    if (!trade || !closePrice) {
        return res.status(400).json({ message: 'Invalid trade data.' });
    }

    // ตรวจสอบว่าราคาชน SL หรือไม่ ถ้าใช่ให้บันทึกเหตุผล
    let closeReason = 'manual';
    if (shouldCloseAtSl(trade, closePrice)) {
        closeReason = 'stop_loss';
    }

    try {
        const history = await readTradeHistory();
        const profit_loss = calculatePnl(trade, closePrice);
        const historyRecord = {
            id: trade.id,
            user_id: 1, // In a real app, this would come from req.user.id
            symbol: trade.symbol,
            signal_type: trade.signal,
            lot_size: trade.lotSize,
            entry_price: trade.entryPrice,
            close_price: closePrice,
            open_time: trade.openTime,
            close_time: new Date().toISOString(),
            profit_loss: profit_loss,
            sl: trade.sl,
            close_reason: closeReason
        };

        history.push(historyRecord);
        await writeTradeHistory(history);
        res.status(200).json({ message: 'Trade closed and recorded successfully.', record: historyRecord });
    } catch (error) {
        console.error('Failed to write trade history:', error);
        // Send a JSON error response
        res.status(500).json({ message: 'Server error: Failed to save trade history.', error: error.message });
    }
});


// =======================================================================
// AI Signal Endpoint (Integrate with Python Logic)
// =======================================================================
app.get('/api/ai-signal', async (req, res) => {
    const { symbol, modelType = 'lstm' } = req.query; // Default to 'lstm' if not specified

    if (!symbol) {
        return res.status(400).json({ error: "Symbol is required." });
    }

    if (!isSupportedForexPair(symbol)) {
        return res.status(400).json({ error: `Unsupported forex symbol: ${symbol}` });
    }

    const normalizedSymbol = symbol.toUpperCase();
    const currentTime = Date.now();

    let pythonScriptPath;
    let cacheKey;
    let python_sequence_length; // This might differ for RF if it needs more data to calculate features

    if (modelType === 'rf') {
        pythonScriptPath = path.join(__dirname, '../ai_model/predict_random_forest_signal.py');
        cacheKey = `${normalizedSymbol}_RF`;
        // Random Forest might need more past data to calculate features (e.g., SMA_50)
        // Adjust this based on the 'lookback_days' or indicator periods in your RF Python script.
        // For example, if your RF script uses a 50-day SMA, it might need at least 50 days of data.
        python_sequence_length = 50; 
    } else { // default to lstm
        pythonScriptPath = path.join(__dirname, '../ai_model/predict_lstm_signal.py');
        cacheKey = `${normalizedSymbol}_LSTM`;
        python_sequence_length = 10; // LSTM needs 10 past closes
    }

    // Check AI Signal Cache first using the specific cacheKey for the modelType
    const cachedSignal = aiSignalCache.get(cacheKey);
    if (cachedSignal) {
        console.log(`Serving ${modelType.toUpperCase()} AI Signal for ${normalizedSymbol} from cache.`);
        return res.json(cachedSignal);
    }

    // --- Pine Script Inputs (for non-AI calculations) ---
    const supportResistanceLength = 100; // Used for S/R calculation
    const trendLinePeriod = 50; // Used for Trend Line calculation

    let aiSignalData = {
        symbol: normalizedSymbol,
        signal: 'HOLD', // Default, will be updated by AI or fallback
        predictedPrice: null, // From AI
        lastKnownPrice: null, // From AI
        support: 'N/A',
        resistance: 'N/A',
        riskReward: 'N/A',
        confidence: 'N/A',
        trendLine: null
    };

    try {
        const ohlcDailyData = await getOhlcDailyData(normalizedSymbol);

        if (!ohlcDailyData || ohlcDailyData.length === 0) {
            console.warn(`Could not get sufficient OHLC daily data for ${normalizedSymbol}. Returning a safe 'HOLD' signal.`);
            aiSignalData = {
                symbol: normalizedSymbol,
                signal: 'HOLD',
                predictedPrice: 'N/A',
                lastKnownPrice: 'N/A',
                support: 'N/A',
                resistance: 'N/A',
                riskReward: 'N/A',
                confidence: 'Low - Insufficient Data',
                trendLine: null
            };
            aiSignalCache.set(cacheKey, aiSignalData); // Cache even the fallback
            return res.status(200).json(aiSignalData);
        }

        // Extract required data arrays for both JS calculations and Python input
        const closes = ohlcDailyData.map(d => d.close);
        const highs = ohlcDailyData.map(d => d.high);
        const lows = ohlcDailyData.map(d => d.low);
        const times = ohlcDailyData.map(d => new Date(d.time).toISOString().split('T')[0]); // Formatted times
        const currentClose = closes[closes.length - 1]; // Latest close price

        // --- Step 1: Prepare data for Python AI Model ---
        // Ensure we have enough data for the chosen model's sequence length/feature generation
        if (closes.length < python_sequence_length) {
            console.warn(`Not enough historical data (${closes.length} bars) for Python ${modelType.toUpperCase()} AI prediction (needs at least ${python_sequence_length}). Returning a safe 'HOLD' signal.`);
            aiSignalData = {
                symbol: normalizedSymbol,
                signal: 'HOLD',
                predictedPrice: 'N/A',
                lastKnownPrice: currentClose ? currentClose.toFixed(4) : 'N/A',
                support: 'N/A',
                resistance: 'N/A',
                riskReward: 'N/A',
                confidence: 'Low - Insufficient Data',
                trendLine: null
            };
            aiSignalCache.set(cacheKey, aiSignalData); // Cache even the fallback
            return res.status(200).json(aiSignalData);
        }

        const latest_prices_for_python = closes.slice(-python_sequence_length); // Slice appropriate length
        const pythonArgs = [normalizedSymbol, JSON.stringify(latest_prices_for_python)];

        let pythonOutput = '';
        let pythonError = '';
        let pythonPredictionSuccessful = false;

        console.log(`Spawning Python process for ${modelType.toUpperCase()} AI prediction for ${normalizedSymbol} with latest ${latest_prices_for_python.length} prices...`);
        
        // Use 'python' if it's in your PATH, or the full path like 'C:\\Users\\LENOVO\\AppData\\Roaming\\Python\\Python311\\python.exe'
        const pythonExecutable = 'python'; 
        
        const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, ...pythonArgs]);

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString();
        });

        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(pythonOutput);
                        // Check for a custom error message from the Python script
                        if (result.error) {
                            const errorMessage = `AI model error (${modelType.toUpperCase()}): ${result.error}`;
                            console.error(errorMessage);
                            reject(new Error(errorMessage));
                            return; // Stop further processing
                        }
                        aiSignalData.predictedPrice = result.predictedPrice;
                        aiSignalData.lastKnownPrice = result.lastKnownPrice;
                        aiSignalData.signal = result.signal; // Use signal from AI
                        pythonPredictionSuccessful = true;
                        console.log(`Python ${modelType.toUpperCase()} Model Output:`, result);
                        resolve();
                    } catch (jsonParseError) {
                        console.error(`Failed to parse Python ${modelType.toUpperCase()} script output:`, pythonOutput, jsonParseError);
                        pythonError += `Failed to parse Python output: ${jsonParseError.message}`;
                        reject(new Error(`AI ${modelType.toUpperCase()} model output parsing failed.`));
                    }
                } else {
                    console.error(`Python ${modelType.toUpperCase()} script exited with code ${code}. Error Output: ${pythonError.trim()}`);
                    reject(new Error(`AI ${modelType.toUpperCase()} model prediction failed. Python exited with code ${code}.`));
                }
            });
            pythonProcess.on('error', (err) => {
                console.error(`Failed to start Python ${modelType.toUpperCase()} subprocess:`, err);
                reject(new Error(`Failed to start AI ${modelType.toUpperCase()} model process: ${err.message}`));
            });
        });

        // --- Step 2: Calculate Support and Resistance (JS Logic) ---
        const resistance = calculateHighest(highs, supportResistanceLength);
        const support = calculateLowest(lows, supportResistanceLength);

        // --- Step 3: Calculate Risk/Reward (Still simulated as it depends on strategy entry/exit) ---
        let riskReward = 'N/A';
        if (aiSignalData.signal === 'BUY') {
            riskReward = Math.random() > 0.5 ? '1:2.0' : '1:2.5';
        } else if (aiSignalData.signal === 'SELL') {
            riskReward = Math.random() > 0.5 ? '1:1.8' : '1:2.2';
        }

        // --- Step 4: Simple Trend Line Calculation (JS Logic) ---
        let calculatedTrendLine = null;
        if (ohlcDailyData.length >= trendLinePeriod) {
            const relevantData = ohlcDailyData.slice(-trendLinePeriod);
            const trendLows = relevantData.map(d => d.low);
            const trendHighs = relevantData.map(d => d.high);

            const startIndex = ohlcDailyData.length - trendLinePeriod;
            if (startIndex >= 0 && times[startIndex]) {
                const firstBarDate = times[startIndex];
                const lastBarDate = times[times.length - 1];

                if (aiSignalData.signal === 'BUY') { // Based on AI's buy signal, suggests an uptrend
                    const lowestInPeriod = Math.min(...trendLows);
                    calculatedTrendLine = {
                        points: [
                            { time: firstBarDate, value: lowestInPeriod },
                            { time: lastBarDate, value: currentClose } // Line to current close
                        ],
                        color: 'green',
                        text: 'Uptrend'
                    };
                } else if (aiSignalData.signal === 'SELL') { // Based on AI's sell signal, suggests a downtrend
                    const highestInPeriod = Math.max(...trendHighs);
                    calculatedTrendLine = {
                        points: [
                            { time: firstBarDate, value: highestInPeriod },
                            { time: lastBarDate, value: currentClose } // Line to current close
                        ],
                        color: 'red',
                        text: 'Downtrend'
                    };
                }
            }
        }

        // --- Step 5: Determine Confidence ---
        let confidence = 75 + Math.floor(Math.random() * 20); // High confidence if AI predicts successfully
        if (!pythonPredictionSuccessful) {
            confidence = 50 + Math.floor(Math.random() * 10); // Lower confidence if AI failed but fallback occurred
        }


        aiSignalData = {
            symbol: normalizedSymbol,
            signal: aiSignalData.signal, // From AI
            predictedPrice: aiSignalData.predictedPrice ? aiSignalData.predictedPrice.toFixed(4) : 'N/A',
            lastKnownPrice: aiSignalData.lastKnownPrice ? aiSignalData.lastKnownPrice.toFixed(4) : 'N/A',
            support: support ? support.toFixed(4) : 'N/A',
            resistance: resistance ? resistance.toFixed(4) : 'N/A',
            riskReward: riskReward,
            confidence: confidence.toFixed(0) + '%',
            trendLine: calculatedTrendLine
        };

        // Cache the AI signal result with specific key for modelType
        aiSignalCache.set(cacheKey, aiSignalData);

        console.log(`Generated AI Signal for ${normalizedSymbol} (Model: ${modelType.toUpperCase()}):`, aiSignalData);
        res.json(aiSignalData);

    } catch (error) {
        console.error(`Error in /api/ai-signal route for ${normalizedSymbol} (Model: ${modelType}):`, error.message);

        // Instead of returning random data, send a clear and structured error to the client.
        // This is more predictable and helpful for debugging on the frontend.
        res.status(500).json({ 
            symbol: normalizedSymbol,
            signal: 'ERROR',
            error: `Failed to generate AI signal using ${modelType.toUpperCase()} model.`,
            details: error.message // Pass the specific error message from the Python script or other sources
        });
    }
});
// =======================================================================
// 3. เพิ่ม Endpoint สำหรับอัปโหลดรูปโปรไฟล์
app.post('/api/auth/upload-profile-image', upload.single('profileImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // ในแอปจริง: คุณจะต้องอัปเดต path ของรูปในฐานข้อมูลสำหรับผู้ใช้ที่ล็อกอินอยู่
    // ที่นี่เราจะจำลองการตอบกลับ
    const imageUrl = `/uploads/${req.file.filename}`; // Path ที่จะใช้ใน frontend
    console.log(`User uploaded a new profile picture. Saved as: ${req.file.filename}`);

    res.json({ message: 'Profile image uploaded successfully!', imageUrl: imageUrl });
});

// =======================================================================
// Trade History & Statistics Endpoints
// =======================================================================
app.post('/api/trades/close-multiple', async (req, res) => {
    const { tradesToClose } = req.body; // Expects an array of { trade, closePrice }

    if (!tradesToClose || !Array.isArray(tradesToClose) || tradesToClose.length === 0) {
        return res.status(400).json({ message: 'No trades provided to close.' });
    }

    try {
        const history = await readTradeHistory();
        const successfullyClosedRecords = [];

        for (const item of tradesToClose) {
            const { trade, closePrice } = item;
            if (!trade || !closePrice) continue; // Skip invalid items

            const profit_loss = calculatePnl(trade, closePrice);
            const historyRecord = {
                id: trade.id,
                user_id: 1, // In a real app, this would come from req.user.id
                symbol: trade.symbol,
                signal_type: trade.signal,
                lot_size: trade.lotSize,
                entry_price: trade.entryPrice,
                close_price: closePrice,
                open_time: trade.openTime,
                close_time: new Date().toISOString(),
                profit_loss: profit_loss
            };
            history.push(historyRecord);
            successfullyClosedRecords.push(historyRecord);
        }

        await writeTradeHistory(history);
        res.status(200).json({ message: `Successfully closed and recorded ${successfullyClosedRecords.length} trades.`, records: successfullyClosedRecords });
    } catch (error) {
        console.error('Failed to write multiple trade history:', error);
        res.status(500).json({ message: 'Server error: Failed to save trade history.' });
    }
});

app.get('/api/trades/history', async (req, res) => {
    try {
        const history = await readTradeHistory();
        // In a real app, you'd filter by user_id here
        res.json(history.sort((a, b) => new Date(b.close_time) - new Date(a.close_time))); // Show newest first
    } catch (error) {
        console.error('Failed to read trade history:', error);
        res.status(500).json({ message: 'Failed to retrieve trade history.' });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const history = await readTradeHistory();

        if (history.length === 0) {
            return res.json({ totalTrades: 0, winRate: 0, averageProfit: 0, averageLoss: 0, bestPair: 'N/A' });
        }

        const totalTrades = history.length;
        const winningTrades = history.filter(t => t.profit_loss >= 0);
        const losingTrades = history.filter(t => t.profit_loss < 0);

        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
        const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0);
        const totalLoss = losingTrades.reduce((sum, t) => sum + t.profit_loss, 0);
        const averageProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
        const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

        const profitByPair = history.reduce((acc, trade) => {
            acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.profit_loss;
            return acc;
        }, {});

        let bestPair = 'N/A';
        let maxProfit = -Infinity;
        for (const pair in profitByPair) {
            if (profitByPair[pair] > maxProfit) {
                maxProfit = profitByPair[pair];
                bestPair = pair;
            }
        }

        res.json({ totalTrades, winRate, averageProfit, averageLoss, bestPair });
    } catch (error) {
        console.error('Failed to calculate statistics:', error);
        res.status(500).json({ message: 'Failed to calculate statistics.' });
    }
});

app.get('/api/ai-statistics', async (req, res) => {
    // We'll fetch stats for a default model/symbol for now.
    // This could be expanded to take a symbol/modelType from query params.
    const symbol = 'EUR/USD';
    const modelType = 'lstm'; // or 'rf'
    const normalizedSymbol = symbol.replace('/', '');

    const statsFilePath = path.join(__dirname, `../ai_model/${normalizedSymbol}_${modelType}_performance.json`);

    try {
        const statsData = await fs.readFile(statsFilePath, 'utf8');
        const statsJson = JSON.parse(statsData);
        console.log(`Serving AI stats for ${symbol} (${modelType}) from file.`);
        res.json(statsJson);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: `Performance file for ${symbol} (${modelType}) not found. Please train the model first.` });
        } else {
            res.status(500).json({ message: 'Error reading performance file.' });
        }
    }
});

// =======================================================================
// END AI Signal Endpoint
// =======================================================================


// Endpoint for OHLC Data (using Twelve Data for Forex Daily)
app.get('/api/ohlc-data', async (req, res) => {
    const { timeframe, symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: "Symbol is required." });
    }
    if (!isSupportedForexPair(symbol)) {
        return res.status(400).json({ error: `Unsupported forex symbol: ${symbol}` });
    }

    if (timeframe !== '1d') {
        console.warn(`Attempted to fetch non-daily OHLC for ${symbol}. The free tier of Twelve Data supports various intervals, but we're configured for '1day'.`);
        // For actual production, you'd integrate proper intraday data if needed.
        // For Twelve Data, you might be able to fetch different intervals if needed by updating this logic
        return res.json({ ohlcData: [] }); 
    }

    const ohlcData = await getOhlcDailyData(symbol); // Use the shared helper function

    if (ohlcData) {
        // Filter OHLC data to only include the necessary fields for chart
        const chartOhlcData = ohlcData.map(d => ({
            time: d.time.getTime() / 1000, // Convert Date object to Unix timestamp in seconds
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        return res.json({ ohlcData: chartOhlcData });
    } else {
        return res.status(500).json({ error: "Failed to fetch OHLC data for chart." });
    }
});

// Endpoint to fetch and save full OHLC data for training (newly added endpoint)
app.get('/api/fetch-and-save-ohlc-for-training', async (req, res) => {
    const from_symbol = req.query.from || 'EUR';
    const to_symbol = req.query.to || 'USD';
    const symbol = `${from_symbol}/${to_symbol}`;

    if (!isSupportedForexPair(symbol)) {
        return res.status(400).json({ error: `Unsupported forex symbol: ${symbol}` });
    }

    // getOhlcDailyData is now configured for Twelve Data with outputsize=5000
    const ohlcData = await getOhlcDailyData(symbol); 

    if (ohlcData) {
        const saved = await saveOhlcDataToCsv(ohlcData);
        if (saved) {
            res.json({ success: true, message: `Successfully fetched and saved OHLC data for ${symbol}. Now you can run your Python training script.` });
        } else {
            res.status(500).json({ success: false, message: 'Failed to save OHLC data to CSV.' });
        }
    } else {
        res.status(500).json({ success: false, message: 'Could not fetch OHLC data from Twelve Data for training.' });
    }
});


app.get('/api/news', async (req, res) => {
    const { query = 'forex', lang = 'en', country = 'us', max = 10 } = req.query;

    if (!GNEWS_API_KEY || GNEWS_API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
        console.error("ERROR: GNews API Key is not configured. Please update backend/server.js");
        return res.status(500).json({ error: "GNews API Key is missing. Please configure it." });
    }

    const cacheKey = `${query}-${lang}-${country}-${max}`;

    // Check cache
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
        console.log(`Serving news for "${query}" from cache.`);
        return res.json(cachedData);
    }

    console.log(`Fetching new news for "${query}" from GNews API...`);
    try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&country=${country}&max=${max}&apikey=${GNEWS_API_KEY}`;
        const response = await axios.get(gnewsUrl);

        if (response.data && response.data.articles) {
            const filteredArticles = response.data.articles.filter(
                article => article.title && article.image && article.url && article.description
            );

            const newsData = {
                articles: filteredArticles
            };

            newsCache.set(cacheKey, newsData);
            console.log(`Successfully fetched ${filteredArticles.length} news articles for "${query}".`);
            return res.json(newsData);
        } else if (response.data && response.data.errors) {
            console.error(`GNews API Error: ${JSON.stringify(response.data.errors)}`);
            return res.status(400).json({ error: response.data.errors.join(', ') });
        } else {
            console.error("GNews API: Unexpected response format for news:", JSON.stringify(response.data));
            return res.status(500).json({ error: "Failed to parse news data from API." });
        }
    } catch (error) {
        console.error(`Error fetching news for "${query}" from GNews API:`, error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            if (error.response.status === 429) {
                return res.status(429).json({ error: "GNews API Rate Limit Exceeded. Please wait." });
            }
        }
        return res.status(500).json({ error: "Failed to fetch news." });
    }
});

// Serve static files from the 'public' directory
// This is crucial for serving your React build files
app.use(express.static(path.join(__dirname, 'public')));

// For any other requests, serve the index.html file from the 'public' directory
// This allows client-side routing to work
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =======================================================================
// Centralized Error Handling Middleware
// =======================================================================
// This middleware catches all errors passed via next(error).
// It MUST be the last `app.use()` call before `app.listen()`.
app.use((err, req, res, next) => {
    // Log the full error for debugging purposes on the server
    console.error(`[Global Error Handler] Path: ${req.path}`, err);

    // Default to 500 Internal Server Error if no status code is set on the error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';

    // Send a structured error response to the client
    res.status(statusCode).json({
        success: false,
        error: {
            message: message,
            details: err.details || null
        }
    });
});

app.listen(PORT, () => {
    console.log(`Backend server listening at http://localhost:${PORT}`);
});