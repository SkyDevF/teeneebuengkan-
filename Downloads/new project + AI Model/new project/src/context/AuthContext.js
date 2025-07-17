import React, { createContext, useState, useContext } from 'react';

// 1. สร้าง Context ขึ้นมาเพื่อเก็บข้อมูลเกี่ยวกับการล็อกอิน
const AuthContext = createContext(null);

// 2. สร้าง Provider Component เพื่อครอบแอปพลิเคชันของเรา
//    Provider จะทำหน้าที่จัดการ state และส่งฟังก์ชันต่างๆ ผ่าน context
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const isLoggedIn = !!user; // <-- วิธีตรวจสอบสถานะล็อกอินที่รัดกุมกว่า คือการเช็คว่ามี object user อยู่หรือไม่

    // ฟังก์ชัน login (จำลอง)
    // ในแอปจริง ส่วนนี้จะมีการเรียก API เพื่อตรวจสอบข้อมูล
    const login = (username, password) => {
        console.log(`กำลังพยายามล็อกอินด้วยชื่อผู้ใช้: ${username}`);
        // สำหรับตัวอย่างนี้, เราจะยอมรับทุก username/password
        setUser({ name: username }); // ในแอปจริง, เราอาจจะเก็บ token ไว้ใน localStorage
    };

    // ฟังก์ชัน register (จำลอง)
    const register = (username, password) => {
        console.log(`กำลังลงทะเบียนผู้ใช้ใหม่: ${username}`);
        // สำหรับตัวอย่างนี้, เราจะให้ login ทันทีหลังสมัคร
        setUser({ name: username });
    };

    const changePassword = async (currentPassword, newPassword) => {
        // ในแอปพลิเคชันจริง ส่วนนี้จะเรียก API ไปยัง Backend
        // เพื่อตรวจสอบรหัสผ่านปัจจุบันและอัปเดตรหัสผ่านใหม่
        console.log(`กำลังพยายามเปลี่ยนรหัสผ่านสำหรับผู้ใช้: ${user.name}`);
        console.log(`รหัสผ่านปัจจุบัน: ${currentPassword}`); // ไม่ควร log รหัสผ่านในแอปจริง
        console.log(`รหัสผ่านใหม่: ${newPassword}`);
        // จำลองการดีเลย์ของ API
        await new Promise(resolve => setTimeout(resolve, 500));
        // สำหรับการจำลอง จะคืนค่าว่าสำเร็จเสมอ
        // การใช้งานจริงจะจัดการกับสถานะสำเร็จ/ล้มเหลวจาก API
        return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ!' };
    };

    const logout = () => {
        setUser(null);
    };

    // ค่าที่จะส่งผ่าน context
    const value = { isLoggedIn, user, login, register, logout, changePassword };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. สร้าง Custom Hook เพื่อให้เรียกใช้ context ได้ง่ายๆ
export const useAuth = () => {
    return useContext(AuthContext);
};
