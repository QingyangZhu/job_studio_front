import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/appStore';

const AdminLayout = () => {
    const { user, logout } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // 简单的样式
    const styles = {
        container: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
        sidebar: { width: '250px', backgroundColor: '#001529', color: '#fff', display: 'flex', flexDirection: 'column' },
        logo: { height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#00c5c7', borderBottom: '1px solid #333' },
        menu: { flex: 1, padding: '20px 0' },
        menuItem: (isActive) => ({
            display: 'block', padding: '15px 24px', color: isActive ? '#fff' : '#a6adb4',
            backgroundColor: isActive ? '#1890ff' : 'transparent', textDecoration: 'none', transition: '0.3s'
        }),
        main: { flex: 1, backgroundColor: '#f0f2f5', display: 'flex', flexDirection: 'column' },
        header: { height: '64px', backgroundColor: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' },
        content: { padding: '24px', overflowY: 'auto' }
    };

    return (
        <div style={styles.container}>
            {/* 左侧边栏 */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>Job Studio Admin</div>
                <nav style={styles.menu}>
                    <Link to="/admin/dashboard" style={styles.menuItem(location.pathname.includes('dashboard'))}>
                        📊 仪表盘
                    </Link>
                    <Link to="/admin/students" style={styles.menuItem(location.pathname.includes('students'))}>
                        🎓 学生管理
                    </Link>
                    <Link to="/admin/alumni" style={styles.menuItem(location.pathname.includes('alumni'))}>
                        🏆 校友管理
                    </Link>
                    <div style={{ height: '1px', background: '#333', margin: '10px 20px' }}></div>
                    <Link to="/dashboard" style={styles.menuItem(false)}>
                        ⬅️ 返回大屏
                    </Link>
                </nav>
            </aside>

            {/* 右侧主体 */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <span style={{fontWeight: 'bold'}}>后台管理系统</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <span>管理员: {user?.username}</span>
                        <button
                            onClick={handleLogout}
                            style={{border: 'none', background: '#fff0f0', color: '#ff4d4f', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                        >
                            退出登录
                        </button>
                    </div>
                </header>

                {/* === 核心：子路由渲染出口 === */}
                <div style={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;