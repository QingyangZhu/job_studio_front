import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// === 1. 引入组件 ===
import Login from '../pages/Login';
import AssessmentForm from '../pages/AssessmentForm';
import UserProfile from '../pages/UserProfile'; // <--- 新增引入
import PrivateRoute from '../components/PrivateRoute';

// === 2. 引入原有的组件 ===
import DataDashboard from '../components/DataDashboard';
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

                {/* 1. 数据大屏 */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DataDashboard />
                    </PrivateRoute>
                } />

                {/* 2. 能力测评页 */}
                <Route path="/assessment" element={
                    <PrivateRoute>
                        <AssessmentForm />
                    </PrivateRoute>
                } />

                {/* 3. 个人中心 (已替换为独立组件) */}
                <Route path="/profile" element={
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                } />

                {/* --- 受保护的后台管理路由 --- */}
                <Route path="/admin" element={
                    <PrivateRoute>
                        <AdminLayout />
                    </PrivateRoute>
                }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
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