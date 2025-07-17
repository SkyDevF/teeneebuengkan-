// API สำหรับดึงข้อมูลสถานที่ท่องเที่ยว
class BuengkanAPI {
    constructor() {
        this.baseURL = 'https://jsonplaceholder.typicode.com';
        this.unsplashAPI = 'https://source.unsplash.com';
        this.pixabayAPI = 'https://pixabay.com/api/';
        this.pixabayKey = '9656065-a4094594c34f9ac14c7fc4c39'; // Free API key
        this.cache = new Map();
    }

    // ดึงรูปภาพจาก Pixabay API
    async getImageFromPixabay(query, category = 'places') {
        try {
            const response = await fetch(
                `${this.pixabayAPI}?key=${this.pixabayKey}&q=${encodeURIComponent(query)}&category=${category}&image_type=photo&orientation=horizontal&min_width=400&per_page=3&safesearch=true`
            );
            const data = await response.json();
            
            if (data.hits && data.hits.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.hits.length);
                return data.hits[randomIndex].webformatURL;
            }
        } catch (error) {
            console.error('Error fetching image from Pixabay:', error);
        }
        
        // Fallback to Unsplash
        return `${this.unsplashAPI}/400x300/?${query}&sig=${Math.random()}`;
    }

    // ดึงข้อมูลสถานที่ท่องเที่ยว
    async getAttractions() {
        if (this.cache.has('attractions')) {
            return this.cache.get('attractions');
        }

        try {
            const response = await fetch(`${this.baseURL}/posts?_limit=6`);
            const data = await response.json();
            
            const attractions = await Promise.all(data.map(async (item, index) => {
                const searchQueries = [
                    'thailand temple mountain',
                    'waterfall nature thailand',
                    'mountain view landscape',
                    'temple buddhist thailand',
                    'nature park thailand',
                    'scenic viewpoint thailand'
                ];
                
                const image = await this.getImageFromPixabay(
                    searchQueries[index] || 'thailand nature',
                    'places'
                );

                return {
                    id: item.id,
                    title: this.getThaiAttractionName(index),
                    description: this.getThaiAttractionDesc(index),
                    image: image,
                    category: 'attraction',
                    location: 'บึงกาฬ',
                    rating: (4 + Math.random()).toFixed(1)
                };
            }));

            this.cache.set('attractions', attractions);
            return attractions;
        } catch (error) {
            console.error('Error fetching attractions:', error);
            return this.getFallbackAttractions();
        }
    }

    // ดึงข้อมูลคาเฟ่
    async getCafes() {
        if (this.cache.has('cafes')) {
            return this.cache.get('cafes');
        }

        try {
            const response = await fetch(`${this.baseURL}/posts?_start=6&_limit=6`);
            const data = await response.json();
            
            const cafes = await Promise.all(data.map(async (item, index) => {
                const searchQueries = [
                    'coffee shop cafe interior',
                    'coffee cup latte art',
                    'cafe outdoor terrace',
                    'coffee beans barista',
                    'cozy cafe atmosphere',
                    'coffee shop garden'
                ];
                
                const image = await this.getImageFromPixabay(
                    searchQueries[index] || 'coffee cafe',
                    'food'
                );

                return {
                    id: item.id,
                    title: this.getThaiCafeName(index),
                    description: this.getThaiCafeDesc(index),
                    image: image,
                    category: 'cafe',
                    location: 'บึงกาฬ',
                    rating: (4 + Math.random()).toFixed(1),
                    price: '฿฿'
                };
            }));

            this.cache.set('cafes', cafes);
            return cafes;
        } catch (error) {
            console.error('Error fetching cafes:', error);
            return this.getFallbackCafes();
        }
    }

    // ดึงข้อมูลที่พัก
    async getAccommodations() {
        if (this.cache.has('accommodations')) {
            return this.cache.get('accommodations');
        }

        try {
            const response = await fetch(`${this.baseURL}/posts?_start=12&_limit=6`);
            const data = await response.json();
            
            const accommodations = await Promise.all(data.map(async (item, index) => {
                const searchQueries = [
                    'hotel resort luxury',
                    'mountain resort thailand',
                    'homestay traditional house',
                    'riverside hotel view',
                    'nature resort eco',
                    'waterfront accommodation'
                ];
                
                const image = await this.getImageFromPixabay(
                    searchQueries[index] || 'hotel resort',
                    'places'
                );

                return {
                    id: item.id,
                    title: this.getThaiHotelName(index),
                    description: this.getThaiHotelDesc(index),
                    image: image,
                    category: 'accommodation',
                    location: 'บึงกาฬ',
                    rating: (4 + Math.random()).toFixed(1),
                    price: '฿฿฿'
                };
            }));

            this.cache.set('accommodations', accommodations);
            return accommodations;
        } catch (error) {
            console.error('Error fetching accommodations:', error);
            return this.getFallbackAccommodations();
        }
    }

    // ดึงข้อมูลร้านอาหาร
    async getRestaurants() {
        if (this.cache.has('restaurants')) {
            return this.cache.get('restaurants');
        }

        try {
            const response = await fetch(`${this.baseURL}/posts?_start=18&_limit=6`);
            const data = await response.json();
            
            const restaurants = await Promise.all(data.map(async (item, index) => {
                const searchQueries = [
                    'thai food restaurant',
                    'som tam papaya salad',
                    'grilled fish thai',
                    'thai cuisine local',
                    'street food thailand',
                    'traditional thai restaurant'
                ];
                
                const image = await this.getImageFromPixabay(
                    searchQueries[index] || 'thai food',
                    'food'
                );

                return {
                    id: item.id,
                    title: this.getThaiRestaurantName(index),
                    description: this.getThaiRestaurantDesc(index),
                    image: image,
                    category: 'restaurant',
                    location: 'บึงกาฬ',
                    rating: (4 + Math.random()).toFixed(1),
                    price: '฿฿'
                };
            }));

            this.cache.set('restaurants', restaurants);
            return restaurants;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            return this.getFallbackRestaurants();
        }
    }

    // ชื่อสถานที่ท่องเที่ยวภาษาไทย
    getThaiAttractionName(index) {
        const names = [
            'หินสามวาฬ',
            'วัดอาฮงศิลาวาส',
            'ภูวัว',
            'น้ำตกห้วยลึก',
            'ภูทอก',
            'วัดป่าบ้านตาด'
        ];
        return names[index] || `สถานที่ท่องเที่ยว ${index + 1}`;
    }

    getThaiAttractionDesc(index) {
        const descriptions = [
            'จุดชมวิวที่สวยงามริมแม่น้ำโขง ชมพระอาทิตย์ตกดิน',
            'วัดเก่าแก่ที่มีประวัติศาสตร์ยาวนาน สถาปัตยกรรมงดงาม',
            'ภูเขาที่มีวิวทิวทัศน์สวยงาม เหมาะสำหรับเดินป่า',
            'น้ำตกธรรมชาติที่สวยงาม น้ำใสเย็นสบาย',
            'ยอดเขาที่สูงที่สุดในบึงกาฬ วิวพาโนรามา 360 องศา',
            'วัดป่าที่เงียบสงบ เหมาะสำหรับทำสมาธิ'
        ];
        return descriptions[index] || 'สถานที่ท่องเที่ยวที่น่าสนใจในบึงกาฬ';
    }

    getThaiCafeName(index) {
        const names = [
            'คาเฟ่ริมโขง',
            'บึงกาฬ คอฟฟี่',
            'ลมหายใจ คาเฟ่',
            'สวนกาแฟ',
            'โขง วิว คาเฟ่',
            'ธรรมชาติ คาเฟ่'
        ];
        return names[index] || `คาเฟ่ ${index + 1}`;
    }

    getThaiCafeDesc(index) {
        const descriptions = [
            'จิบกาแฟสบายๆ ริมแม่น้ำโขง บรรยากาศดี',
            'กาแฟคุณภาพดี บรรยากาศอบอุ่น',
            'คาเฟ่ในสวน อากาศดี เงียบสงบ',
            'กาแฟสดใหม่ ขนมหวานอร่อย',
            'วิวแม่น้ำโขงสวยงาม กาแฟหอมกรุ่น',
            'คาเฟ่ท่ามกลางธรรมชาติ ผ่อนคลาย'
        ];
        return descriptions[index] || 'คาเฟ่บรรยากาศดีในบึงกาฬ';
    }

    getThaiHotelName(index) {
        const names = [
            'โรงแรมบึงกาฬ ริเวอร์ไซด์',
            'รีสอร์ทภูทอก',
            'โฮมสเตย์บ้านไผ่',
            'โรงแรมโขงวิว',
            'รีสอร์ทธรรมชาติ',
            'บ้านพักริมน้ำ'
        ];
        return names[index] || `ที่พัก ${index + 1}`;
    }

    getThaiHotelDesc(index) {
        const descriptions = [
            'โรงแรมริมแม่น้ำโขง วิวสวยงาม สิ่งอำนวยความสะดวกครบครัน',
            'รีสอร์ทบนภูเขา อากาศเย็นสบาย',
            'โฮมสเตย์บรรยากาศอบอุ่น ใกล้ชิดธรรมชาติ',
            'โรงแรมวิวแม่น้ำโขง ห้องพักสะอาด',
            'รีสอร์ทท่ามกลางธรรมชาติ เงียบสงบ',
            'บ้านพักริมน้ำ บรรยากาศดี'
        ];
        return descriptions[index] || 'ที่พักสะดวกสบายในบึงกาฬ';
    }

    getThaiRestaurantName(index) {
        const names = [
            'ร้านอาหารริมโขง',
            'ครัวบึงกาฬ',
            'ร้านส้มตำป้าแดง',
            'ลาบเป็ดป้าจันทร์',
            'ร้านปลาย่าง',
            'ครัวไทยโบราณ'
        ];
        return names[index] || `ร้านอาหาร ${index + 1}`;
    }

    getThaiRestaurantDesc(index) {
        const descriptions = [
            'อาหารไทยอีสาน รสชาติแซ่บ วิวแม่น้ำโขง',
            'อาหารท้องถิ่นบึงกาฬ รสชาติดั้งเดิม',
            'ส้มตำรสเด็ด เผ็ดร้อนแซ่บ',
            'ลาบเป็ดสูตรโบราณ รสชาติเข้มข้น',
            'ปลาย่างสดใหม่ จากแม่น้ำโขง',
            'อาหารไทยโบราณ รสชาติต้นตำรับ'
        ];
        return descriptions[index] || 'ร้านอาหารรสชาติดีในบึงกาฬ';
    }

    // ข้อมูลสำรอง
    getFallbackAttractions() {
        return [
            {
                id: 1,
                title: 'หินสามวาฬ',
                description: 'จุดชมวิวที่สวยงามริมแม่น้ำโขง',
                image: '1.png',
                category: 'attraction',
                location: 'บึงกาฬ',
                rating: '4.5'
            }
        ];
    }

    getFallbackCafes() {
        return [
            {
                id: 1,
                title: 'คาเฟ่ริมโขง',
                description: 'จิบกาแฟสบายๆ ริมแม่น้ำโขง',
                image: '2.png',
                category: 'cafe',
                location: 'บึงกาฬ',
                rating: '4.3'
            }
        ];
    }

    getFallbackAccommodations() {
        return [
            {
                id: 1,
                title: 'โรงแรมบึงกาฬ',
                description: 'ที่พักสะดวกสบาย',
                image: '3.png',
                category: 'accommodation',
                location: 'บึงกาฬ',
                rating: '4.2'
            }
        ];
    }

    getFallbackRestaurants() {
        return [
            {
                id: 1,
                title: 'ร้านอาหารริมโขง',
                description: 'อาหารไทยอีสาน รสชาติแซ่บ',
                image: '4.png',
                category: 'restaurant',
                location: 'บึงกาฬ',
                rating: '4.4'
            }
        ];
    }
}

// สร้าง instance
const buengkanAPI = new BuengkanAPI();