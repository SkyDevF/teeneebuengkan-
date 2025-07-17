import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) { // ส่ง password ไปด้วย
            login(username, password); // เรียกใช้ฟังก์ชัน login จาก context
            onClose(); // ปิด Modal เมื่อล็อกอินสำเร็จ
        } else {
            alert('Please enter username and password.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="login-submit-button">Sign In</button>
                </form>
                <p className="switch-form-prompt">Don't have an account? <button onClick={onSwitchToRegister} className="switch-link">Register here</button></p>
            </div>
        </div>
    );
}

export default LoginModal;
