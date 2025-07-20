# การติดตั้งเว็บไซต์บึงกาฬบน GitHub Pages พร้อม Google Places API

## ขั้นตอนการติดตั้ง

### 1. เตรียม Repository
```bash
git add .
git commit -m "Add Google Places API integration for reviews"
git push origin main
```

### 2. เปิดใช้งาน GitHub Pages
1. ไปที่ Settings ของ Repository
2. เลื่อนลงไปที่ส่วน "Pages"
3. เลือก Source: "Deploy from a branch"
4. เลือก Branch: "main" หรือ "master"
5. เลือก Folder: "/ (root)"
6. คลิก "Save"

### 3. ตั้งค่า Google Places API

#### สร้าง Google Cloud Project
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน Google Places API:
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Places API"
   - คลิก "Enable"

#### สร้าง API Key
1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "API Key"
3. คัดลอก API Key ที่ได้

#### ตั้งค่าข้อจำกัดของ API Key (แนะนำ)
1. คลิกที่ API Key ที่สร้างขึ้น
2. ในส่วน "Application restrictions":
   - เลือก "HTTP referrers (web sites)"
   - เพิ่ม URL ของเว็บไซต์: `https://yourusername.github.io/repository-name/*`
3. ในส่วน "API restrictions":
   - เลือก "Restrict key"
   - เลือก "Places API"
4. คลิก "Save"

### 4. อัปเดต API Key ในโค้ด

API Key ได้ถูกตั้งค่าไว้แล้วในไฟล์ `.env` และ `script.js`:
```
GOOGLE_PLACES_API_KEY=AIzaSyCmhI9UFvQxJmptzDcobDb8i-7v0dr9AJk
```

หากต้องการเปลี่ยน API Key ให้แก้ไขในไฟล์:
- `.env`
- `.env.example` 
- `script.js` (ฟังก์ชัน `getGooglePlacesApiKey()`)

### 5. ทดสอบการทำงาน

เมื่อ Deploy เสร็จแล้ว:
1. เปิดเว็บไซต์ที่ `https://skydevf.github.io/teeneebuengkan-/`
2. คลิกดูรายละเอียดสถานที่ใดๆ
3. ตรวจสอบว่ามีการโหลดรีวิวจาก Google Places API

### 6. การแก้ไขปัญหา

#### หากรีวิวไม่แสดง:
1. เปิด Developer Tools (F12)
2. ดูใน Console Tab หาข้อผิดพลาด
3. ตรวจสอบว่า API Key ถูกต้องและมีสิทธิ์เข้าถึง Places API

#### หาก CORS Error:
- เว็บไซต์ใช้ CORS Proxy หลายตัวเป็น fallback
- หากยังมีปัญหา ให้ตรวจสอบ Console เพื่อดูว่า Proxy ไหนทำงาน

#### หากรูปภาพไม่แสดง:
- ตรวจสอบว่าโฟลเดอร์รูปภาพมีชื่อภาษาไทยถูกต้อง
- ตรวจสอบว่าไฟล์รูปภาพอยู่ในโฟลเดอร์ที่ถูกต้อง

## คุณสมบัติที่ได้เพิ่ม

### Google Places API Integration
- ดึงรีวิวจริงจาก Google Places
- แสดงรูปโปรไฟล์ของผู้รีวิว
- แสดงเวลาที่รีวิว
- Fallback เป็นข้อมูล mock หาก API ไม่พร้อมใช้งาน

### CORS Proxy Support
- ใช้หลาย CORS proxy เป็น fallback
- รองรับการใช้งานบน GitHub Pages

### Enhanced Error Handling
- จัดการข้อผิดพลาดของ API อย่างเหมาะสม
- แสดงข้อความแจ้งเตือนที่เข้าใจง่าย

## การใช้งานในอนาคต

### การอัปเดต API Key
หากต้องการเปลี่ยน API Key:
1. แก้ไขในไฟล์ `script.js`
2. Commit และ Push การเปลี่ยนแปลง
3. GitHub Pages จะอัปเดตอัตโนมัติ

### การเพิ่มสถานที่ใหม่
1. แก้ไขข้อมูลในไฟล์ `api.js`
2. เพิ่มรูปภาพในโฟลเดอร์ที่เหมาะสม
3. Commit และ Push การเปลี่ยนแปลง

## หมายเหตุสำคัญ

- Google Places API มีข้อจำกัดการใช้งานฟรี 
- ควรตั้งค่าข้อจำกัดของ API Key เพื่อความปลอดภัย
- เว็บไซต์จะทำงานได้แม้ไม่มี API Key (ใช้ข้อมูล mock)
- รองรับการใช้งานทั้งบน localhost และ GitHub Pages