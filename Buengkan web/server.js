const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Mock data for destinations
const destinations = [
    {
        id: 1,
        name: "หินสามวาฬ",
        description: "ชมวิวทิวทัศน์สุดอลังการที่จุดชมวิวหินสามวาฬ พร้อมบรรยากาศธรรมชาติที่สวยงาม",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        category: "attraction",
        location: "บึงกาฬ",
        rating: 4.5
    },
    {
        id: 2,
        name: "คาเฟ่ริมโขงบึงกาฬ",
        description: "จิบกาแฟสบายๆ ริมแม่น้ำโขง พร้อมวิวสวยงามและบรรยากาศผ่อนคลาย",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
        category: "cafe",
        location: "บึงกาฬ",
        rating: 4.3
    },
    {
        id: 3,
        name: "ที่พักใกล้หนองคาย",
        description: "ผ่อนคลายกับที่พักท่ามกลางธรรมชาติ บรรยากาศดีและสะดวกสบาย",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        category: "accommodation",
        location: "บึงกาฬ",
        rating: 4.2
    },
    {
        id: 4,
        name: "วัดพระธาตุบึงพลาญชัย",
        description: "วัดเก่าแก่ที่มีประวัติศาสตร์ยาวนาน สถาปัตยกรรมสวยงาม",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        category: "attraction",
        location: "บึงกาฬ",
        rating: 4.4
    },
    {
        id: 5,
        name: "ร้านอาหารท้องถิ่น",
        description: "ลิ้มรสอาหารพื้นเมืองบึงกาฬ รสชาติต้นตำรับที่หาไม่ได้ที่ไหน",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        category: "restaurant",
        location: "บึงกาฬ",
        rating: 4.6
    },
    {
        id: 6,
        name: "ตลาดน้ำบึงกาฬ",
        description: "ตลาดน้ำที่มีสินค้าท้องถิ่นและอาหารอร่อยมากมาย",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        category: "attraction",
        location: "บึงกาฬ",
        rating: 4.1
    }
];

// API Routes
app.get('/api/destinations', (req, res) => {
    const { category, limit } = req.query;
    let filteredDestinations = destinations;
    
    if (category && category !== 'all') {
        filteredDestinations = destinations.filter(dest => dest.category === category);
    }
    
    if (limit) {
        filteredDestinations = filteredDestinations.slice(0, parseInt(limit));
    }
    
    res.json(filteredDestinations);
});

app.get('/api/destinations/:id', (req, res) => {
    const destination = destinations.find(dest => dest.id === parseInt(req.params.id));
    if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
    }
    res.json(destination);
});

// Weather API proxy (using OpenWeatherMap free API)
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

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});