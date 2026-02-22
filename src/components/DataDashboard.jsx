import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import axios from 'axios'; // 引入 axios

import AssessmentPanel from './AssessmentPanel';
import ChatAssistant from './ChatAssistant';
import JobCompetencyGraph from './JobCompetencyGraph';
import AlumniGrowthTimeline from './AlumniGrowthTimeline';
import JobDistributionMap from './JobDistributionMap';
import GapAnalysisPanel from './GapAnalysisPanel';

const colors = {
    background: '#0a0b1f', header: '#4a90e2', panelBg: 'rgba(255, 255, 255, 0.05)',
    border: '#005f73', text: '#ffffff', accent: '#00c5c7', danger: '#e74c3c'
};

const styles = {
    dashboardContainer: {
        position: 'relative', height: '100vh', backgroundColor: colors.background, color: colors.text,
        padding: '0 20px 20px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif',
        display: 'grid', gridTemplateRows: 'auto 1fr', overflow: 'hidden', gap: '10px'
    },
    headerBar: {
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '10px 0', borderBottom: `2px solid ${colors.border}`,
    },
    mainTitle: { fontSize: '2.5vw', color: colors.accent, margin: '0 0 5px 0' },
    mainContent: { display: 'flex', gap: '20px', height: '100%', overflow: 'hidden' },
    sideColumn: { flex: 2, display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' },
    centerColumn: { flex: 3, display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' },

    // 面板通用
    sidePanel: { flex: 1, backgroundColor: colors.panelBg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '15px', boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 },
    centerTopPanel: { flex: 7, backgroundColor: colors.panelBg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '15px', boxShadow: '0 0 15px rgba(0, 197, 199, 0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 },
    centerBottomPanel: { flex: 4, backgroundColor: colors.panelBg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '15px', boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 },
    panelTitle: { fontSize: '1.2vw', color: colors.header, marginBottom: '8px', paddingBottom: '5px', borderBottom: `1px dashed ${colors.border}`, flexShrink: 0 },
    panelDesc: { margin: '0 0 10px 0', fontSize: '0.8rem', color: '#ccc', flexShrink: 0 },
    chartContainer: { flex: 1, width: '100%', minHeight: 0, position: 'relative' },

    // 齿轮与菜单
    gearIcon: {
        position: 'absolute', top: '20px', right: '25px', cursor: 'pointer',
        color: 'rgba(255, 255, 255, 0.6)', transition: 'all 0.3s ease', zIndex: 1001, padding: '5px'
    },
    dropdownMenu: {
        position: 'absolute', top: '60px', right: '25px', width: '220px', // 稍微宽一点以容纳长名字
        backgroundColor: '#0f1025', border: `1px solid ${colors.border}`, borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden',
        backdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease-out'
    },
    menuHeader: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', color: '#ccc', backgroundColor: 'rgba(255,255,255,0.02)' },
    menuUserName: { display: 'block', fontSize: '16px', fontWeight: 'bold', color: colors.accent, marginTop: '5px' },
    menuItem: { display: 'block', width: '100%', padding: '12px 15px', border: 'none', background: 'transparent', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    menuItemDanger: { color: colors.danger, fontWeight: 'bold' }
};

const DataDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // 新增：真实姓名状态
    const [realName, setRealName] = useState('');

    const toggleMenu = (e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            logout();
            navigate('/login');
        }
    };

    // 监听点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    // === 新增：加载真实姓名 ===
    useEffect(() => {
        if (user && user.role === 'STUDENT') {
            axios.get('/api/users/profile')
                .then(res => {
                    if (res.data && res.data.name) {
                        setRealName(res.data.name);
                    } else {
                        setRealName(user.username); // 降级显示用户名
                    }
                })
                .catch(err => {
                    console.error("无法获取用户姓名", err);
                    setRealName(user.username);
                });
        }
    }, [user]);

    if (!user) return null;

    return (
        <div style={styles.dashboardContainer} onClick={() => setIsMenuOpen(false)}>
            {/* 齿轮图标 */}
            <div
                style={styles.gearIcon}
                onClick={toggleMenu}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.accent; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isMenuOpen ? colors.accent : 'rgba(255, 255, 255, 0.6)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                title="设置与账户"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>

            {/* 下拉菜单 */}
            {isMenuOpen && (
                <div style={styles.dropdownMenu} ref={menuRef} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.menuHeader}>
                        你好!
                        <span style={styles.menuUserName}>
                            {user.role === 'ADMIN' ? '管理员' : (realName ? `${realName} 同学` : '同学')}
                        </span>
                    </div>
                    {user.role === 'ADMIN' && (
                        <button style={styles.menuItem} onClick={() => handleNavigation('/admin')}>🛠 后台管理</button>
                    )}
                    {user.role === 'STUDENT' && (
                        <button style={styles.menuItem} onClick={() => handleNavigation('/profile')}>⚙️ 个人设置</button>
                    )}
                    <button style={{...styles.menuItem, ...styles.menuItemDanger}} onClick={handleLogout}>🚪 退出登录</button>
                </div>
            )}

            {/* 顶栏 */}
            <div style={styles.headerBar}>
                <h1 style={styles.mainTitle}>大数据与软件学院就业工作室</h1>
            </div>

            {/* 主内容 */}
            <div style={styles.mainContent}>
                <div style={styles.sideColumn}>
                    <div style={styles.sidePanel}><h3 style={styles.panelTitle}>学生筛选与能力评测</h3><AssessmentPanel /></div>
                    <div style={styles.sidePanel}><h3 style={styles.panelTitle}>AI 助手</h3><ChatAssistant /></div>
                </div>
                <div style={styles.centerColumn}>
                    <div style={styles.centerTopPanel}><h3 style={styles.panelTitle}>岗位能力知识图谱与路径推荐</h3><p style={styles.panelDesc}>核心图谱展示区: 节点链接图、岗位-能力-发展路径关联</p><div style={styles.chartContainer}><JobCompetencyGraph/></div></div>
                    <div style={styles.centerBottomPanel}><h3 style={styles.panelTitle}>能力差距分析与补救措施</h3><p style={styles.panelDesc}>分析区: 对比学生当前能力与目标岗位要求，给出提升建议</p><div style={styles.chartContainer}><GapAnalysisPanel /></div></div>
                </div>
                <div style={styles.sideColumn}>
                    <div style={styles.sidePanel}><h3 style={styles.panelTitle}>校友生涯成长曲线</h3><div style={styles.chartContainer}><AlumniGrowthTimeline/></div></div>
                    <div style={styles.sidePanel}><h3 style={styles.panelTitle}>就业地域与行业分布</h3><p style={styles.panelDesc}>数据展示: 城市地图分布（地理视图）、行业占比饼图</p><div style={styles.chartContainer}><JobDistributionMap/></div></div>
                </div>
            </div>
        </div>
    );
};

export default DataDashboard;