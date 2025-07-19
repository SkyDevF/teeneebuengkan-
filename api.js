// API สำหรับดึงข้อมูลสถานที่ท่องเที่ยว
class BuengkanAPI {
    constructor() {
        this.cache = new Map();
        // Unsplash API for fallback images
        this.unsplashAPI = 'https://source.unsplash.com';
        
        // พิกัดบึงกาฬ
        this.buengkanCenter = {
            lat: 18.3609,
            lng: 103.6469
        };
        
        this.initializeData();
    }

    initializeData() {
        // ข้อมูลสถานที่ท่องเที่ยวจริงในบึงกาฬ
        this.attractionsData = [
            {
                id: 1,
                title: 'หินสามวาฬ',
                description: 'จุดชมวิวที่สวยงามริมแม่น้ำโขง ชมพระอาทิตย์ตกดินและพระอาทิตย์ขึ้น บรรยากาศโรแมนติก',
                image: '1.png',
                category: 'attraction',
                rating: 4.5,
                latitude: 18.3609,
                longitude: 103.6469,
                address: 'ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '06:00 - 18:00 น. (ทุกวัน)',
                price: 'ฟรี'
            },
            {
                id: 2,
                title: 'วัดอาฮงศิลาวาส',
                description: 'วัดเก่าแก่ที่มีประวัติศาสตร์ยาวนาน สถาปัตยกรรมงดงาม มีพระพุทธรูปโบราณ',
                image: '2.png',
                category: 'attraction',
                rating: 4.3,
                latitude: 18.3709,
                longitude: 103.6569,
                address: 'ตำบลหนองเข็ง อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '06:00 - 18:00 น. (ทุกวัน)',
                price: 'ฟรี'
            },
            {
                id: 3,
                title: 'ภูวัว',
                description: 'ภูเขาที่มีวิวทิวทัศน์สวยงาม เหมาะสำหรับเดินป่าและชมธรรมชาติ อากาศเย็นสบาย',
                image: '3.png',
                category: 'attraction',
                rating: 4.4,
                latitude: 18.4109,
                longitude: 103.7069,
                address: 'ตำบลโนนสง่า อำเภอบึงโขงหลง จังหวัดบึงกาฬ 38220',
                openingHours: '06:00 - 18:00 น. (ทุกวัน)',
                price: 'ฟรี'
            },
            {
                id: 4,
                title: 'น้ำตกห้วยลึก',
                description: 'น้ำตกธรรมชาติที่สวยงาม น้ำใสเย็นสบาย เหมาะสำหรับพักผ่อนและเล่นน้ำ',
                image: '4.png',
                category: 'attraction',
                rating: 4.2,
                latitude: 18.2909,
                longitude: 103.5869,
                address: 'ตำบลโพนทอง อำเภอโซ่พิสัย จังหวัดบึงกาฬ 38170',
                openingHours: '08:00 - 17:00 น. (ทุกวัน)',
                price: '20 บาท'
            },
            {
                id: 5,
                title: 'ภูทอก',
                description: 'ยอดเขาที่สูงที่สุดในบึงกาฬ วิวพาโนรามา 360 องศา ชมทะเลหมอกยามเช้า',
                image: '1.png',
                category: 'attraction',
                rating: 4.6,
                latitude: 18.1509,
                longitude: 103.4569,
                address: 'ตำบลโคกก่อง อำเภอปากคาด จังหวัดบึงกาฬ 38140',
                openingHours: '05:00 - 19:00 น. (ทุกวัน)',
                price: '30 บาท'
            },
            {
                id: 6,
                title: 'วัดป่าบ้านตาด',
                description: 'วัดป่าที่เงียบสงบ เหมาะสำหรับทำสมาธิ มีพระอาจารย์ที่เป็นที่เคารพ',
                image: '2.png',
                category: 'attraction',
                rating: 4.1,
                latitude: 18.2209,
                longitude: 103.5269,
                address: 'ตำบลบ้านตาด อำเภอศรีวิไล จังหวัดบึงกาฬ 38210',
                openingHours: '06:00 - 18:00 น. (ทุกวัน)',
                price: 'ฟรี'
            },
            {
                id: 7,
                title: 'ตลาดน้ำบึงกาฬ',
                description: 'ตลาดน้ำที่มีสินค้าท้องถิ่นและอาหารอร่อยมากมาย บรรยากาศแบบดั้งเดิม',
                image: '3.png',
                category: 'attraction',
                rating: 4.0,
                latitude: 18.3509,
                longitude: 103.6369,
                address: 'ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '06:00 - 12:00 น. (เสาร์-อาทิตย์)',
                price: 'ฟรี'
            },
            {
                id: 8,
                title: 'พิพิธภัณฑ์บึงกาฬ',
                description: 'พิพิธภัณฑ์ที่รวบรวมประวัติศาสตร์และวัฒนธรรมของบึงกาฬ',
                image: '4.png',
                category: 'attraction',
                rating: 3.9,
                latitude: 18.3609,
                longitude: 103.6469,
                address: 'ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '09:00 - 16:00 น. (จันทร์-ศุกร์)',
                price: '50 บาท'
            }
        ];

        this.cafesData = [
            {
                id: 101,
                title: 'คาเฟ่ริมโขง',
                description: 'จิบกาแฟสบายๆ ริมแม่น้ำโขง บรรยากาศดี วิวสวยงาม เมนูหลากหลาย',
                image: '1.png',
                category: 'cafe',
                rating: 4.3,
                latitude: 18.3609,
                longitude: 103.6469,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '08:00 - 20:00 น. (ทุกวัน)',
                price: '80-250 บาท/คน'
            },
            {
                id: 102,
                title: 'บึงกาฬ คอฟฟี่',
                description: 'กาแฟคุณภาพดี บรรยากาศอบอุ่น เหมาะสำหรับนั่งทำงานหรือพบปะเพื่อน',
                image: '2.png',
                category: 'cafe',
                rating: 4.1,
                latitude: 18.3709,
                longitude: 103.6569,
                address: 'ถนนเจริญเมือง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '07:00 - 21:00 น. (ทุกวัน)',
                price: '60-200 บาท/คน'
            },
            {
                id: 103,
                title: 'ลมหายใจ คาเฟ่',
                description: 'คาเฟ่ในสวน อากาศดี เงียบสงบ เหมาะสำหรับผ่อนคลาย',
                image: '3.png',
                category: 'cafe',
                rating: 4.4,
                latitude: 18.3509,
                longitude: 103.6369,
                address: 'ตำบลหนองเข็ง อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '09:00 - 19:00 น. (ทุกวัน)',
                price: '70-220 บาท/คน'
            },
            {
                id: 104,
                title: 'สวนกาแฟ',
                description: 'กาแฟสดใหม่ ขนมหวานอร่อย บรรยากาศธรรมชาติ',
                image: '4.png',
                category: 'cafe',
                rating: 4.2,
                latitude: 18.3409,
                longitude: 103.6269,
                address: 'ตำบลโนนทัน อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '08:30 - 18:30 น. (ทุกวัน)',
                price: '50-180 บาท/คน'
            },
            {
                id: 105,
                title: 'โขง วิว คาเฟ่',
                description: 'วิวแม่น้ำโขงสวยงาม กาแฟหอมกรุ่น อาหารว่างอร่อย',
                image: '1.png',
                category: 'cafe',
                rating: 4.5,
                latitude: 18.3809,
                longitude: 103.6669,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '07:30 - 20:30 น. (ทุกวัน)',
                price: '90-280 บาท/คน'
            },
            {
                id: 106,
                title: 'ธรรมชาติ คาเฟ่',
                description: 'คาเฟ่ท่ามกลางธรรมชาติ ผ่อนคลาย อากาศดี',
                image: '2.png',
                category: 'cafe',
                rating: 4.0,
                latitude: 18.3309,
                longitude: 103.6169,
                address: 'ตำบลวิศิษฐ์ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '08:00 - 19:00 น. (ทุกวัน)',
                price: '65-210 บาท/คน'
            }
        ];

        this.accommodationsData = [
            {
                id: 201,
                title: 'โรงแรมบึงกาฬ ริเวอร์ไซด์',
                description: 'โรงแรมริมแม่น้ำโขง วิวสวยงาม สิ่งอำนวยความสะดวกครบครัน ห้องพักสะอาด',
                image: '3.png',
                category: 'accommodation',
                rating: 4.3,
                latitude: 18.3609,
                longitude: 103.6469,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '24 ชั่วโมง',
                price: '1,800-3,500 บาท/คืน'
            },
            {
                id: 202,
                title: 'รีสอร์ทภูทอก',
                description: 'รีสอร์ทบนภูเขา อากาศเย็นสบาย วิวทิวทัศน์สวยงาม',
                image: '4.png',
                category: 'accommodation',
                rating: 4.5,
                latitude: 18.1509,
                longitude: 103.4569,
                address: 'ภูทอก ตำบลโคกก่อง อำเภอปากคาด จังหวัดบึงกาฬ 38140',
                openingHours: '24 ชั่วโมง',
                price: '2,200-4,000 บาท/คืน'
            },
            {
                id: 203,
                title: 'โฮมสเตย์บ้านไผ่',
                description: 'โฮมสเตย์บรรยากาศอบอุ่น ใกล้ชิดธรรมชาติ เจ้าของใจดี',
                image: '1.png',
                category: 'accommodation',
                rating: 4.2,
                latitude: 18.3409,
                longitude: 103.6269,
                address: 'ตำบลโนนทัน อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '24 ชั่วโมง',
                price: '800-1,500 บาท/คืน'
            },
            {
                id: 204,
                title: 'โรงแรมโขงวิว',
                description: 'โรงแรมวิวแม่น้ำโขง ห้องพักสะอาด บริการดี',
                image: '2.png',
                category: 'accommodation',
                rating: 4.1,
                latitude: 18.3709,
                longitude: 103.6569,
                address: 'ถนนเจริญเมือง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '24 ชั่วโมง',
                price: '1,200-2,800 บาท/คืน'
            },
            {
                id: 205,
                title: 'รีสอร์ทธรรมชาติ',
                description: 'รีสอร์ทท่ามกลางธรรมชาติ เงียบสงบ ผ่อนคลาย',
                image: '3.png',
                category: 'accommodation',
                rating: 4.4,
                latitude: 18.2909,
                longitude: 103.5869,
                address: 'ตำบลโพนทอง อำเภอโซ่พิสัย จังหวัดบึงกาฬ 38170',
                openingHours: '24 ชั่วโมง',
                price: '1,600-3,200 บาท/คืน'
            },
            {
                id: 206,
                title: 'บ้านพักริมน้ำ',
                description: 'บ้านพักริมน้ำ บรรยากาศดี เหมาะสำหรับครอบครัว',
                image: '4.png',
                category: 'accommodation',
                rating: 4.0,
                latitude: 18.3509,
                longitude: 103.6369,
                address: 'ตำบลหนองเข็ง อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '24 ชั่วโมง',
                price: '1,000-2,000 บาท/คืน'
            }
        ];

        this.restaurantsData = [
            {
                id: 301,
                title: 'ร้านอาหารริมโขง',
                description: 'อาหารไทยอีสาน รสชาติแซ่บ วิวแม่น้ำโขง บรรยากาศดี',
                image: '1.png',
                category: 'restaurant',
                rating: 4.4,
                latitude: 18.3609,
                longitude: 103.6469,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '10:00 - 22:00 น. (ทุกวัน)',
                price: '150-400 บาท/คน'
            },
            {
                id: 302,
                title: 'ครัวบึงกาฬ',
                description: 'อาหารท้องถิ่นบึงกาฬ รสชาติดั้งเดิม วัตถุดิบสด',
                image: '2.png',
                category: 'restaurant',
                rating: 4.2,
                latitude: 18.3709,
                longitude: 103.6569,
                address: 'ถนนเจริญเมือง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '11:00 - 21:00 น. (ทุกวัน)',
                price: '120-350 บาท/คน'
            },
            {
                id: 303,
                title: 'ร้านส้มตำป้าแดง',
                description: 'ส้มตำรสเด็ด เผ็ดร้อนแซ่บ ตำตามสั่ง ราคาถูก',
                image: '3.png',
                category: 'restaurant',
                rating: 4.5,
                latitude: 18.3509,
                longitude: 103.6369,
                address: 'ตลาดเก่า ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '09:00 - 20:00 น. (ทุกวัน)',
                price: '50-150 บาท/คน'
            },
            {
                id: 304,
                title: 'ลาบเป็ดป้าจันทร์',
                description: 'ลาบเป็ดสูตรโบราณ รสชาติเข้มข้น เครื่องเทศหอม',
                image: '4.png',
                category: 'restaurant',
                rating: 4.3,
                latitude: 18.3409,
                longitude: 103.6269,
                address: 'ตำบลโนนทัน อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '16:00 - 23:00 น. (ทุกวัน)',
                price: '80-200 บาท/คน'
            },
            {
                id: 305,
                title: 'ร้านปลาย่าง',
                description: 'ปลาย่างสดใหม่ จากแม่น้ำโขง ย่างถ่าน หอมกรุ่น',
                image: '1.png',
                category: 'restaurant',
                rating: 4.6,
                latitude: 18.3809,
                longitude: 103.6669,
                address: 'ริมแม่น้ำโขง ตำบลบึงกาฬ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '17:00 - 24:00 น. (ทุกวัน)',
                price: '200-500 บาท/คน'
            },
            {
                id: 306,
                title: 'ครัวไทยโบราณ',
                description: 'อาหารไทยโบราณ รสชาติต้นตำรับ บรรยากาศแบบดั้งเดิม',
                image: '2.png',
                category: 'restaurant',
                rating: 4.1,
                latitude: 18.3309,
                longitude: 103.6169,
                address: 'ตำบลวิศิษฐ์ อำเภอเมืองบึงกาฬ จังหวัดบึงกาฬ 38000',
                openingHours: '11:30 - 21:30 น. (ทุกวัน)',
                price: '100-300 บาท/คน'
            }
        ];
    }

    // ดึงข้อมูลจาก API ทั่วไป
    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
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

    // ดึงข้อมูลจาก Google Places API
    async searchGooglePlaces(query, type = 'tourist_attraction') {
        if (this.googleApiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
            console.warn('กรุณาใส่ Google Places API Key ที่ถูกต้อง');
            return null;
        }

        try {
            const url = `${this.placesApiUrl}/textsearch/json?query=${encodeURIComponent(query + ' บึงกาฬ')}&type=${type}&key=${this.googleApiKey}&language=th&region=th`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results.length > 0) {
                return data.results;
            }
            return null;
        } catch (error) {
            console.error('Error fetching from Google Places:', error);
            return null;
        }
    }

    // ดึงรูปภาพจาก Google Places
    getGooglePlacePhoto(photoReference, maxWidth = 400) {
        if (!photoReference || this.googleApiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
            return null;
        }
        return `${this.placesApiUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.googleApiKey}`;
    }

    // ดึงรายละเอียดสถานที่จาก Google Places
    async getPlaceDetails(placeId) {
        if (this.googleApiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
            return null;
        }

        try {
            const url = `${this.placesApiUrl}/details/json?place_id=${placeId}&fields=name,rating,formatted_address,opening_hours,price_level,photos,geometry,formatted_phone_number,website&key=${this.googleApiKey}&language=th`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK') {
                return data.result;
            }
            return null;
        } catch (error) {
            console.error('Error fetching place details:', error);
            return null;
        }
    }

    // แปลง Google Places data เป็นรูปแบบของเรา
    convertGooglePlaceToLocal(place, category, id) {
        const photos = place.photos || [];
        const mainPhoto = photos.length > 0 ? this.getGooglePlacePhoto(photos[0].photo_reference) : null;
        
        // แปลงระดับราคาจาก Google (0-4) เป็นข้อความไทย
        const getPriceText = (priceLevel) => {
            switch(priceLevel) {
                case 0: return 'ฟรี';
                case 1: return '฿';
                case 2: return '฿฿';
                case 3: return '฿฿฿';
                case 4: return '฿฿฿฿';
                default: return 'ไม่ระบุราคา';
            }
        };

        return {
            id: id,
            title: place.name,
            description: place.editorial_summary?.overview || `${place.name} - สถานที่น่าสนใจในบึงกาฬ`,
            image: mainPhoto || this.getDefaultImage(category),
            category: category,
            rating: place.rating || 4.0,
            latitude: place.geometry?.location?.lat || this.buengkanCenter.lat,
            longitude: place.geometry?.location?.lng || this.buengkanCenter.lng,
            address: place.formatted_address || 'บึงกาฬ, ประเทศไทย',
            openingHours: this.formatOpeningHours(place.opening_hours),
            price: getPriceText(place.price_level),
            phone: place.formatted_phone_number,
            website: place.website,
            placeId: place.place_id
        };
    }

    // จัดรูปแบบเวลาเปิด-ปิด
    formatOpeningHours(openingHours) {
        if (!openingHours || !openingHours.weekday_text) {
            return 'ไม่ระบุเวลาเปิด-ปิด';
        }
        
        // ใช้เฉพาะวันจันทร์เป็นตัวอย่าง
        const mondayHours = openingHours.weekday_text[0];
        if (mondayHours.includes('24 ชั่วโมง')) {
            return '24 ชั่วโมง';
        }
        
        return mondayHours.replace('วันจันทร์: ', '') || 'ไม่ระบุเวลาเปิด-ปิด';
    }

    // รูปภาพเริ่มต้นสำหรับแต่ละประเภท
    getDefaultImage(category) {
        const defaultImages = {
            'attraction': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
            'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&auto=format',
            'accommodation': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format',
            'restaurant': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format'
        };
        return defaultImages[category] || defaultImages['attraction'];
    }

    // ดึงข้อมูลสถานที่ท่องเที่ยว
    async getAttractions() {
        if (this.cache.has('attractions')) {
            return this.cache.get('attractions');
        }
        
        // ลองดึงจาก Google Places API ก่อน
        try {
            const queries = [
                'สถานที่ท่องเที่ยว',
                'วัด',
                'ภูเขา',
                'น้ำตก',
                'พิพิธภัณฑ์',
                'ตลาด'
            ];
            
            let googlePlaces = [];
            for (const query of queries) {
                const places = await this.searchGooglePlaces(query, 'tourist_attraction');
                if (places) {
                    googlePlaces = googlePlaces.concat(places.slice(0, 2)); // เอา 2 สถานที่ต่อ query
                }
            }
            
            if (googlePlaces.length > 0) {
                const attractions = googlePlaces.map((place, index) => 
                    this.convertGooglePlaceToLocal(place, 'attraction', index + 1)
                ).slice(0, 8); // จำกัดไว้ที่ 8 สถานที่
                
                this.cache.set('attractions', attractions);
                return attractions;
            }
        } catch (error) {
            console.error('Error fetching from Google Places:', error);
        }
        
        // ถ้าไม่สามารถดึงจาก Google ได้ ใช้ข้อมูลที่เตรียมไว้
        this.cache.set('attractions', this.attractionsData);
        return this.attractionsData;
    }

    // ดึงข้อมูลคาเฟ่
    async getCafes() {
        if (this.cache.has('cafes')) {
            return this.cache.get('cafes');
        }
        
        // ลองดึงจาก Google Places API ก่อน
        try {
            const queries = ['คาเฟ่', 'ร้านกาแฟ', 'coffee shop'];
            let googlePlaces = [];
            
            for (const query of queries) {
                const places = await this.searchGooglePlaces(query, 'cafe');
                if (places) {
                    googlePlaces = googlePlaces.concat(places.slice(0, 2));
                }
            }
            
            if (googlePlaces.length > 0) {
                const cafes = googlePlaces.map((place, index) => 
                    this.convertGooglePlaceToLocal(place, 'cafe', index + 101)
                ).slice(0, 6);
                
                this.cache.set('cafes', cafes);
                return cafes;
            }
        } catch (error) {
            console.error('Error fetching cafes from Google Places:', error);
        }
        
        // ถ้าไม่สามารถดึงจาก Google ได้ ใช้ข้อมูลที่เตรียมไว้
        this.cache.set('cafes', this.cafesData);
        return this.cafesData;
    }

    // ดึงข้อมูลที่พัก
    async getAccommodations() {
        if (this.cache.has('accommodations')) {
            return this.cache.get('accommodations');
        }
        
        // ใช้ข้อมูลที่เตรียมไว้แล้ว
        this.cache.set('accommodations', this.accommodationsData);
        return this.accommodationsData;
    }

    // ดึงข้อมูลร้านอาหาร
    async getRestaurants() {
        if (this.cache.has('restaurants')) {
            return this.cache.get('restaurants');
        }
        
        // ใช้ข้อมูลที่เตรียมไว้แล้ว
        this.cache.set('restaurants', this.restaurantsData);
        return this.restaurantsData;
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