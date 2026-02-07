import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DataDashboard from './components/DataDashboard';
import useAppStore from './store/appStore';

// --- 私有路由封装 ---
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAppStore();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 登录页面 */}
                <Route path="/login" element={<Login />} />

                {/* 核心大屏 (受保护) */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DataDashboard />
                        </PrivateRoute>
                    }
                />

                {/* 根路径默认跳转 */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 捕获 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;