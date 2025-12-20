import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 引入组件
import DataDashboard from '../components/DataDashboard'; // 原来的大屏
import AdminLogin from '../pages/admin/Login';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import StudentList from '../pages/admin/StudentList';
import AlumniList from '../pages/admin/AlumniList';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. 公开路由：大屏展示 */}
                <Route path="/" element={<DataDashboard />} />

                {/* 2. 登录页 */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* 3. 后台管理路由 (嵌套路由) */}
                <Route path="/admin" element={<AdminLayout />}>
                    {/* 默认跳转到 dashboard */}
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="alumni" element={<AlumniList />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;