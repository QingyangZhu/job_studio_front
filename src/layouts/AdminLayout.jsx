import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();

    // 简单鉴权保护
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="admin-layout">
            {/* 左侧侧边栏 */}
            <aside className="sidebar">
                <div className="logo-area">Job Studio Admin</div>
                <nav className="menu">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                        📊 数据概览
                    </NavLink>
                    <NavLink to="/admin/students" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                        🎓 学生管理
                    </NavLink>
                    <NavLink to="/admin/alumni" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                        🤝 校友管理
                    </NavLink>
                </nav>
                <div className="logout-area">
                    <button onClick={handleLogout}>退出登录</button>
                </div>
            </aside>

            {/* 右侧内容区 */}
            <main className="main-content">
                <header className="top-header">
                    <span>管理员控制台</span>
                </header>
                <div className="content-body">
                    {/* 子路由出口 */}
                    <Outlet />
                </div>
            </main>

            {/* 内联样式 (建议单独提取为 admin.css) */}
            <style>{`
                .admin-layout { display: flex; height: 100vh; background: #f0f2f5; }
                .sidebar { width: 240px; background: #001529; color: white; display: flex; flex-direction: column; }
                .logo-area { height: 64px; line-height: 64px; text-align: center; font-size: 20px; font-weight: bold; background: #002140; }
                .menu { flex: 1; padding-top: 20px; }
                .menu-item { display: block; padding: 15px 24px; color: #a6adb4; text-decoration: none; transition: 0.3s; }
                .menu-item:hover { color: white; background: #1890ff; }
                .menu-item.active { color: white; background: #1890ff; }
                .logout-area { padding: 20px; border-top: 1px solid #333; }
                .logout-area button { width: 100%; padding: 8px; cursor: pointer; background: #ff4d4f; color: white; border: none; border-radius: 4px; }
                .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .top-header { height: 64px; background: white; padding: 0 24px; display: flex; align-items: center; box-shadow: 0 1px 4px rgba(0,21,41,0.08); }
                .content-body { flex: 1; padding: 24px; overflow-y: auto; }
            `}</style>
        </div>
    );
};

export default AdminLayout;