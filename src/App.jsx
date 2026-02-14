import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// === 1. 引入通用页面 ===
import Login from './pages/Login';
import DataDashboard from './components/DataDashboard';
import AssessmentForm from './pages/AssessmentForm';
import UserProfile from './pages/UserProfile'; // <--- 记得引入个人中心
import useAppStore from './store/appStore';

// === 2. 引入后台管理组件 ===
import AdminLayout from './layouts/AdminLayout'; // <--- 记得引入布局
import Dashboard from './pages/admin/Dashboard'; // <--- 记得引入后台仪表盘
import StudentList from './pages/admin/StudentList';
import AlumniList from './pages/admin/AlumniList';

// 私有路由守卫
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAppStore();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- 公开路由 --- */}
                <Route path="/login" element={<Login />} />

                {/* --- 受保护的学生端/通用路由 --- */}

                {/* 1. 核心大屏 */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DataDashboard />
                        </PrivateRoute>
                    }
                />

                {/* 2. 测评页面 */}
                <Route
                    path="/assessment"
                    element={
                        <PrivateRoute>
                            <AssessmentForm />
                        </PrivateRoute>
                    }
                />

                {/* 3. 个人中心 (对应齿轮菜单的“个人设置”) */}
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <UserProfile />
                        </PrivateRoute>
                    }
                />

                {/* --- 受保护的后台管理路由 (对应齿轮菜单的“后台管理”) --- */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    }
                >
                    {/* 默认跳转到仪表盘 */}
                    <Route index element={<Navigate to="dashboard" replace />} />

                    {/* 子路由 */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="alumni" element={<AlumniList />} />
                </Route>

                {/* --- 默认跳转与 404 --- */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 处理 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;