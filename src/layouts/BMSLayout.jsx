import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const styles = {
    // 使用 CSS Grid 进行两栏布局：左侧固定 250px，右侧自适应
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        minHeight: '100vh',
        backgroundColor: '#f4f7f9',
    },
    sidebar: {
        backgroundColor: '#2c3e50', // 深色主题
        color: 'white',
        padding: '20px 0',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    },
    menuItem: {
        display: 'block',
        padding: '10px 20px',
        color: '#ecf0f1',
        textDecoration: 'none',
        transition: 'background-color 0.2s',
        fontSize: '14px',
    },
    menuActive: {
        backgroundColor: '#3498db', // 激活状态
        fontWeight: 'bold',
    },
    contentArea: {
        padding: '20px',
        overflowY: 'auto',
    },
    menuTitle: {
        padding: '0 20px 15px',
        margin: '0',
        fontSize: '18px',
        borderBottom: '1px solid #34495e',
        marginBottom: '15px'
    }
};

const Sidebar = () => (
    <div style={styles.sidebar}>
        <h2 style={styles.menuTitle}>Job Studio BMS</h2>
        <nav>
            <NavLink to="/bms/dashboard" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                系统概览
            </NavLink>
            <h4 style={{ padding: '10px 20px', color: '#bdc3c7', margin: 0, marginTop: '10px' }}>在校学生管理</h4>
            <NavLink to="/bms/students/info" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                &nbsp;&nbsp;学生基本信息
            </NavLink>
            <NavLink to="/bms/students/experiences" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                &nbsp;&nbsp;经历记录管理
            </NavLink>
            <NavLink to="/bms/students/assessments" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                &nbsp;&nbsp;综合能力测评
            </NavLink>

            <h4 style={{ padding: '10px 20px', color: '#bdc3c7', margin: 0, marginTop: '10px' }}>校友信息管理</h4>
            <NavLink to="/bms/alumni/info" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                &nbsp;&nbsp;校友基础数据
            </NavLink>
            <NavLink to="/bms/alumni/careers" style={({ isActive }) => ({...styles.menuItem,...(isActive? styles.menuActive : {}) })}>
                &nbsp;&nbsp;就业履历管理
            </NavLink>
        </nav>
    </div>
);

const BMSLayout = () => (
    <div style={styles.gridContainer}>
        <Sidebar />
        <div style={styles.contentArea}>
            {/* Outlet 渲染匹配到的子路由组件 */}
            <Outlet />
        </div>
    </div>
);

export default BMSLayout;