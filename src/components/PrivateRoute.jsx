import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAppStore();

    // 如果已认证，渲染子组件(页面)；否则重定向到登录页
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;