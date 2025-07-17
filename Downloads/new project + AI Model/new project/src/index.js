import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // 1. Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. ครอบ App ทั้งหมดด้วย AuthProvider เพื่อให้ระบบ Login ทำงานได้ */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
