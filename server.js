const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: process.env.DB_PORT || 3306, // เปลี่ยนเป็น 3307 หากมีปัญหา port ซ้ำ
    user: 'root',
    password: '',
    database: 'buengkan_tourism',
    charset: 'utf8mb4'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.', {
    setHeaders: (res, path) => {
        // Set proper headers for Thai filenames
        if (path.includes('คาเฟ่') || path.includes('ที่พัก') || path.includes('ร้านอาหาร') || path.includes('สถานที่ท่องเที่ยว')) {
            res.setHeader('Content-Type', 'image/png');
        }
    }
}));

// Database connection
let db;
async function connectDB() {
    try {
        console.log('Attempting to connect to MySQL database...');
        console.log('Database config:', {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database
        });
        
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Successfully connected to MySQL database');
        
        // Test the connection
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM destinations');
        console.log(`📊 Found ${rows[0].count} destinations in database`);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('🔄 Using fallback mock data');
        db = null;
    }
}

// Mock data for fallback
const mockDestinations = [
    {
        id: 1,
        title: "หินสามวาฬ",
        description: "ชมวิวทิวทัศน์สุดอลังการที่จุดชมวิวหินสามวาฬ พร้อมบรรยากาศธรรมชาติที่สวยงาม",
        image: "1.png",
        category: "attraction",
        rating: 4.5,
        latitude: 18.3609,
        longitude: 103.6469,
        address: "ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000",
        opening_hours: "06:00 - 18:00 น. (ทุกวัน)",
        price: "ฟรี"
    }
];

// API Routes
app.get('/api/destinations', async (req, res) => {
    try {
        const { category, limit } = req.query;
        let query = 'SELECT * FROM destinations';
        let params = [];
        
        if (category && category !== 'all') {
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        query += ' ORDER BY created_at DESC';
        
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        
        if (db) {
            const [rows] = await db.execute(query, params);
            res.json(rows);
        } else {
            // Fallback to mock data
            let filteredDestinations = mockDestinations;
            if (category && category !== 'all') {
                filteredDestinations = mockDestinations.filter(dest => dest.category === category);
            }
            if (limit) {
                filteredDestinations = filteredDestinations.slice(0, parseInt(limit));
            }
            res.json(filteredDestinations);
        }
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/destinations/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (db) {
            const [rows] = await db.execute('SELECT * FROM destinations WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Destination not found' });
            }
            res.json(rows[0]);
        } else {
            // Fallback to mock data
            const destination = mockDestinations.find(dest => dest.id === id);
            if (!destination) {
                return res.status(404).json({ error: 'Destination not found' });
            }
            res.json(destination);
        }
    } catch (error) {
        console.error('Error fetching destination:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Contact messages API
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
        }
        
        if (db) {
            const [result] = await db.execute(
                'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
                [name, email, message]
            );
            
            res.json({
                success: true,
                message: 'บันทึกข้อความเรียบร้อยแล้ว',
                id: result.insertId
            });
        } else {
            // Fallback - just return success
            res.json({
                success: true,
                message: 'บันทึกข้อความเรียบร้อยแล้ว (ฐานข้อมูลไม่พร้อมใช้งาน)'
            });
        }
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});

app.get('/api/contact', async (req, res) => {
    try {
        if (db) {
            const [rows] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
            res.json(rows);
        } else {
            // Fallback - return empty array
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

app.put('/api/contact/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        
        if (db) {
            await db.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
            res.json({ success: true, message: 'อัปเดตสถานะเรียบร้อยแล้ว' });
        } else {
            res.json({ success: true, message: 'อัปเดตสถานะเรียบร้อยแล้ว (ฐานข้อมูลไม่พร้อมใช้งาน)' });
        }
    } catch (error) {
        console.error('Error updating contact message:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

app.delete('/api/contact/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (db) {
            await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
            res.json({ success: true, message: 'ลบข้อความเรียบร้อยแล้ว' });
        } else {
            res.json({ success: true, message: 'ลบข้อความเรียบร้อยแล้ว (ฐานข้อมูลไม่พร้อมใช้งาน)' });
        }
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});

// Image serving route with proper Thai filename handling
app.get('/images/*', (req, res) => {
    const imagePath = decodeURIComponent(req.params[0]);
    const fullPath = path.join(__dirname, imagePath);
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        // Try with different encoding
        const alternativePath = path.join(__dirname, req.params[0]);
        if (fs.existsSync(alternativePath)) {
            res.sendFile(alternativePath);
        } else {
            res.status(404).send('Image not found');
        }
    }
});

// Weather API proxy
app.get('/api/weather', async (req, res) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bueng Kan,TH&appid=demo&units=metric&lang=th`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.json({
            name: "บึงกาฬ",
            main: { temp: 28, humidity: 65 },
            weather: [{ description: "อากาศดี", icon: "01d" }]
        });
    }
});

// Google Places API proxy for reviews
app.post('/api/places/reviews', async (req, res) => {
    try {
        const { name, address, lat, lng } = req.body;
        
        // ตรวจสอบว่ามี Google Places API Key หรือไม่
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.log('Google Places API key not found, using mock data');
            return res.json({ reviews: await generateMockReviews(name) });
        }

        // ค้นหาสถานที่ด้วย Text Search API
        const searchQuery = encodeURIComponent(`${name} ${address}`);
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}&language=th`;
        
        const fetch = (await import('node-fetch')).default;
        console.log(`Searching for: ${name} in ${address}`);
        console.log(`Search URL: ${searchUrl}`);
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        console.log('Search API Response:', searchData);
        
        if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
            const placeId = searchData.results[0].place_id;
            console.log(`Found place ID: ${placeId}`);
            
            // ดึงรายละเอียดสถานที่รวมถึงรีวิว
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}&language=th`;
            
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            
            console.log('Details API Response:', detailsData);
            
            if (detailsData.status === 'OK' && detailsData.result && detailsData.result.reviews) {
                const reviews = detailsData.result.reviews.map(review => ({
                    author: review.author_name,
                    rating: review.rating,
                    text: review.text,
                    relative_time_description: review.relative_time_description,
                    profile_photo_url: review.profile_photo_url,
                    time: review.time
                }));
                
                console.log(`✅ Found ${reviews.length} real reviews for ${name}`);
                return res.json({ 
                    reviews: reviews.slice(0, 5), // จำกัดแค่ 5 รีวิว
                    source: 'google_places_api'
                });
            } else {
                console.log(`❌ No reviews in details response for ${name}:`, detailsData.status);
            }
        } else {
            console.log(`❌ No search results for ${name}:`, searchData.status || 'No results');
        }
        
        // หากไม่พบข้อมูลจาก API ให้ใช้ mock data
        console.log(`No reviews found for ${name}, using mock data`);
        res.json({ reviews: await generateMockReviews(name) });
        
    } catch (error) {
        console.error('Google Places API error:', error);
        
        // หากเกิดข้อผิดพลาด ให้ใช้ mock data
        const { name } = req.body;
        res.json({ reviews: await generateMockReviews(name) });
    }
});

// ฟังก์ชันสำหรับสร้าง mock reviews
async function generateMockReviews(placeName) {
    const mockReviews = [
        {
            author: 'Google User',
            rating: 5,
            text: `${placeName} เป็นสถานที่ที่ยอดเยี่ยมมาก! แนะนำให้มาเยี่ยมชม บรรยากาศดี บริการประทับใจ`,
            relative_time_description: '1 เดือนที่แล้ว',
            profile_photo_url: null
        },
        {
            author: 'นักท่องเที่ยว',
            rating: 4,
            text: 'สถานที่สวยงาม บรรยากาศดี เหมาะสำหรับการพักผ่อน ราคาเหมาะสม จะกลับมาอีก',
            relative_time_description: '2 สัปดาห์ที่แล้ว',
            profile_photo_url: null
        },
        {
            author: 'Local Guide',
            rating: 4,
            text: 'ประทับใจมาก คุณภาพดี บริการเป็นกันเอง สถานที่สะอาด แนะนำเลย',
            relative_time_description: '3 สัปดาห์ที่แล้ว',
            profile_photo_url: null
        },
        {
            author: 'ผู้เยี่ยมชม',
            rating: 5,
            text: 'มาแล้วประทับใจมาก วิวสวย อาหารอร่อย พนักงานใจดี คุ้มค่าเงินที่จ่าย',
            relative_time_description: '1 สัปดาห์ที่แล้ว',
            profile_photo_url: null
        }
    ];
    
    // สุ่มจำนวนรีวิว 2-4 รีวิว
    const numReviews = Math.floor(Math.random() * 3) + 2;
    return mockReviews.slice(0, numReviews);
}

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize database connection and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});