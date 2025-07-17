import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './RegisterModal.css'; // ใช้ CSS แยกสำหรับ Register
import './LoginModal.css'; // นำ style บางส่วนจาก Login มาใช้

function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register } = useAuth();

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        if (username && password) {
            register(username, password);
            onClose();
        } else {
            alert('Please fill in all fields.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="reg-username">Username</label>
                        <input type="text" id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="register-submit-button">Sign Up</button>
                </form>
                <p className="switch-form-prompt">Already have an account? <button onClick={onSwitchToLogin} className="switch-link">Login here</button></p>
            </div>
        </div>
    );
}

export default RegisterModal;