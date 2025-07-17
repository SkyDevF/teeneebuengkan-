// src/components/ProfileModal.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, changePassword, updateUserProfile } = useAuth(); // สมมติว่ามีฟังก์ชัน updateUserProfile ใน AuthContext
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }

        if (newPassword.length < 6) {
            setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setIsLoading(true);
        try {
            const result = await changePassword(currentPassword, newPassword);
            setSuccess(result.message || 'เปลี่ยนรหัสผ่านสำเร็จ!');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'การเปลี่ยนรหัสผ่านล้มเหลว');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) {
            setError("กรุณาเลือกไฟล์รูปภาพก่อน");
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('profileImage', selectedFile);

        try {
            // For now, we handle the fetch here and update the context state.
            const response = await fetch('http://localhost:3001/api/auth/upload-profile-image', {
                method: 'POST',
                body: formData,
                // NOTE: Do not set 'Content-Type' header manually for FormData.
                // The browser sets it automatically with the correct boundary.
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'การอัปโหลดรูปภาพล้มเหลว');
            }

            setSuccess(result.message);
            // Use the function from AuthContext to update the user state locally
            updateUserProfile({ profileImageUrl: result.imageUrl });

        } catch (err) {
            setError(err.message || 'การอัปโหลดรูปภาพล้มเหลว');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // รีเซ็ตค่าทั้งหมดเมื่อปิดหน้าต่าง
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        onClose();
        setSelectedFile(null);
        setPreview(null);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={handleClose}>&times;</button>
                <h2>โปรไฟล์ของฉัน</h2>
                
                <div className="profile-section profile-picture-section">
                    <img 
                        src={preview || (user.profileImageUrl ? `http://localhost:3001${user.profileImageUrl}` : 'https://via.placeholder.com/150')} 
                        alt="Profile" 
                        className="profile-picture"
                    />
                    <input 
                        type="file" 
                        id="profile-upload" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                    />
                    <label htmlFor="profile-upload" className="upload-button">เลือกรูปภาพ</label>
                    {selectedFile && (
                        <button onClick={handleImageUpload} className="submit-button" disabled={isLoading}>
                            {isLoading ? 'กำลังอัปโหลด...' : 'บันทึกรูปภาพ'}
                        </button>
                    )}
                </div>

                <h3 className="section-title">เปลี่ยนรหัสผ่าน</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="current-password">รหัสผ่านปัจจุบัน</label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-password">รหัสผ่านใหม่</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="submit-button" disabled={isLoading || !currentPassword || !newPassword}>
                        {isLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;