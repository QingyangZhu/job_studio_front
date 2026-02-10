import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DataDashboard from './components/DataDashboard';
import AssessmentForm from './pages/AssessmentForm'; // 引入新页面
import useAppStore from './store/appStore';

// 私有路由
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAppStore();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* 核心大屏 */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DataDashboard />
                        </PrivateRoute>
                    }
                />

                {/* 测评页面 (新增) */}
                <Route
                    path="/assessment"
                    element={
                        <PrivateRoute>
                            <AssessmentForm />
                        </PrivateRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;