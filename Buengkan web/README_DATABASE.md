# คำแนะนำการติดตั้งและใช้งานฐานข้อมูล

## 📋 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง XAMPP
1. ดาวน์โหลด XAMPP จาก https://www.apachefriends.org/
2. ติดตั้งและเปิดใช้งาน Apache และ MySQL

### 2. สร้างฐานข้อมูล
1. เปิด phpMyAdmin ที่ http://localhost/phpmyadmin
2. สร้างฐานข้อมูลใหม่ชื่อ `buengkan_tourism`
3. นำเข้าไฟล์ `database.sql` หรือรันคำสั่ง SQL ในไฟล์

### 3. ติดตั้ง Dependencies
```bash
npm install
```

### 4. เริ่มใช้งาน
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🗄️ โครงสร้างฐานข้อมูล

### ตาราง `contact_messages`
- `id` - รหัสข้อความ (Primary Key)
- `name` - ชื่อผู้ส่ง
- `email` - อีเมลผู้ส่ง
- `message` - ข้อความ
- `status` - สถานะ (new/read)
- `created_at` - วันที่สร้าง
- `updated_at` - วันที่อัปเดต

### ตาราง `destinations`
- `id` - รหัสสถานที่ (Primary Key)
- `title` - ชื่อสถานที่
- `description` - รายละเอียด
- `image` - ชื่อไฟล์รูปภาพ
- `category` - หมวดหมู่ (attraction/cafe/accommodation/restaurant)
- `rating` - คะแนนรีวิว
- `latitude` - ละติจูด
- `longitude` - ลองจิจูด
- `address` - ที่อยู่
- `opening_hours` - เวลาเปิด-ปิด
- `price` - ราคา

### ตาราง `admin_users`
- `id` - รหัสผู้ใช้ (Primary Key)
- `username` - ชื่อผู้ใช้
- `password` - รหัสผ่าน (เข้ารหัส)

## 🔧 การกำหนดค่า

### ไฟล์ `config/database.php`
```php
$host = 'localhost';
$dbname = 'buengkan_tourism';
$username = 'root';
$password = '';
```

### ไฟล์ `server.js`
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'buengkan_tourism',
    charset: 'utf8mb4'
};
```

## 🚀 API Endpoints

### Contact Messages
- `POST /api/contact` - บันทึกข้อความใหม่
- `GET /api/contact` - ดึงข้อความทั้งหมด
- `PUT /api/contact/:id` - อัปเดตสถานะข้อความ
- `DELETE /api/contact/:id` - ลบข้อความ

### Destinations
- `GET /api/destinations` - ดึงสถานที่ทั้งหมด
- `GET /api/destinations?category=attraction` - ดึงตามหมวดหมู่
- `GET /api/destinations/:id` - ดึงสถานที่เฉพาะ

## 🔐 ข้อมูลเข้าสู่ระบบ Admin
- **Username:** admin
- **Password:** buengkan2025

## 🛠️ การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล
1. ตรวจสอบว่า MySQL ใน XAMPP เปิดอยู่
2. ตรวจสอบชื่อฐานข้อมูลและการตั้งค่า
3. ตรวจสอบ port MySQL (ปกติคือ 3306)

### ปัญหา Dependencies
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules
npm install
```

### Fallback Mode
หากฐานข้อมูลไม่พร้อมใช้งาน ระบบจะใช้ localStorage เป็นทางเลือก

## 📝 หมายเหตุ
- ระบบรองรับทั้งการใช้ฐานข้อมูลและ localStorage
- ข้อมูลจะถูกบันทึกในฐานข้อมูลหากเชื่อมต่อสำเร็จ
- หากเชื่อมต่อไม่สำเร็จ จะใช้ localStorage แทน