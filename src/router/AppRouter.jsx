import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// === 1. 引入通用组件 ===
import Login from '../pages/Login';
import AssessmentForm from '../pages/AssessmentForm';
import UserProfile from '../pages/UserProfile';
import PrivateRoute from '../components/PrivateRoute';
import DataDashboard from '../components/DataDashboard';

// === 2. 引入后台管理组件 ===
// 确保这些文件在你项目中存在，且路径正确
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import StudentList from '../pages/admin/StudentList';
import AlumniList from '../pages/admin/AlumniList';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- 公开路由 --- */}
                <Route path="/login" element={<Login />} />

                {/* --- 受保护的学生端路由 --- */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DataDashboard />
                    </PrivateRoute>
                } />

                <Route path="/assessment" element={
                    <PrivateRoute>
                        <AssessmentForm />
                    </PrivateRoute>
                } />

                <Route path="/profile" element={
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                } />

                {/* --- 受保护的后台管理路由 (核心修改) --- */}
                <Route path="/admin" element={
                    <PrivateRoute>
                        {/* 这里加载 Layout，Layout 内部通过 Outlet 渲染子路由 */}
                        <AdminLayout />
                    </PrivateRoute>
                }>
                    {/* 默认跳转：使用相对路径 "dashboard"，不要写成 "/admin/dashboard" */}
                    <Route index element={<Navigate to="dashboard" replace />} />

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="alumni" element={<AlumniList />} />
                </Route>

                {/* --- 根路径与异常处理 --- */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="*" element={
                    <div style={{color:'white', textAlign:'center', marginTop:'50px', background:'#0a0b1f', height:'100vh', paddingTop:'100px'}}>
                        <h1>404 Not Found</h1>
                        <a href="/" style={{color:'#00c5c7'}}>返回首页</a>
                    </div>
                } />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;