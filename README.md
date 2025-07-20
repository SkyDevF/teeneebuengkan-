# ที่นี่บึงกาฬ - เว็บไซต์ท่องเที่ยวบึงกาฬ

## ฟีเจอร์หลัก

- 🏞️ แสดงสถานที่ท่องเที่ยวในบึงกาฬ
- ☕ คาเฟ่และร้านอาหารแนะนำ
- 🏨 ที่พักสะดวกสบาย
- ⭐ รีวิวจริงจาก Google Places API
- 🌤️ ข้อมูลสภาพอากาศแบบเรียลไทม์
- 📱 รองรับการใช้งานบนมือถือ
- 🗺️ แผนที่แสดงตำแหน่งสถานที่

## เทคโนโลยีที่ใช้

- HTML5, CSS3, JavaScript
- Node.js & Express.js
- Google Places API (รีวิวจาก Google Maps)
- Pixabay API (รูปภาพ)
- OpenWeatherMap API (สภาพอากาศ)
- Google Maps API (แผนที่)
- Font Awesome (ไอคอน)
- Google Fonts (ฟอนต์ Kanit)

## 🚀 การติดตั้งและใช้งาน

### ข้อกำหนดของระบบ
- Node.js (เวอร์ชัน 14 หรือใหม่กว่า)
- npm หรือ yarn
- MySQL (ถ้าต้องการใช้ฐานข้อมูล)
- Google Places API Key (สำหรับรีวิวจริงจาก Google Maps)

### การติดตั้ง
1. Clone repository
```bash
git clone [repository-url]
cd buengkan-tourism
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า Environment Variables
```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.example .env

# แก้ไขไฟล์ .env และใส่ Google Places API Key
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

4. ตั้งค่าฐานข้อมูล (ถ้าต้องการ)
```bash
# สร้างฐานข้อมูลจากไฟล์ database.sql
mysql -u root -p < database.sql
```

5. เริ่มต้นใช้งาน
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### การตั้งค่า Google Places API
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจ็กต์ใหม่หรือเลือกโปรเจ็กต์ที่มีอยู่
3. เปิดใช้งาน Places API
4. สร้าง API Key ใน Credentials
5. จำกัดการใช้งาน API Key (แนะนำ):
   - Application restrictions: HTTP referrers
   - API restrictions: Places API
6. ใส่ API Key ในไฟล์ `.env`

### ฟีเจอร์รีวิวจาก Google Maps
- ✅ ดึงรีวิวจริงจาก Google Places API
- ✅ แสดงรูปโปรไฟล์ของผู้รีวิว
- ✅ แสดงคะแนนและวันที่รีวิว
- ✅ Fallback เป็นข้อมูล mock หาก API ไม่พร้อมใช้งาน
- ✅ Loading state ขณะดึงข้อมูล

## 🌐 การ Deploy บน GitHub Pages

### ขั้นตอนการ Deploy
1. Push โค้ดขึ้น GitHub Repository
```bash
git add .
git commit -m "Add Google Places API integration"
git push origin main
```

2. เปิดใช้งาน GitHub Pages
   - ไปที่ Settings ของ Repository
   - เลื่อนลงไปที่ส่วน "Pages"
   - เลือก Source: "Deploy from a branch"
   - เลือก Branch: "main"
   - คลิก "Save"

3. เว็บไซต์จะพร้อมใช้งานที่ `https://yourusername.github.io/repository-name/`

### คุณสมบัติพิเศษสำหรับ GitHub Pages
- ✅ ใช้งาน Google Places API ผ่าน CORS Proxy
- ✅ รองรับไฟล์รูปภาพภาษาไทย
- ✅ Auto-deploy เมื่อมีการ Push โค้ดใหม่
- ✅ ทำงานได้โดยไม่ต้องมี Backend Server

สำหรับรายละเอียดเพิ่มเติม ดูได้ที่ [README_GITHUB_DEPLOYMENT.md](README_GITHUB_DEPLOYMENT.md)

## การติดต่อ

- Facebook: [ที่นี่บึงกาฬ](https://www.facebook.com/slo.sko.3/)
- Email: thitiwoot11111@gmail.com
- โทร: 065-991-0940