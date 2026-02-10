import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

import AssessmentPanel from './AssessmentPanel';
import ChatAssistant from './ChatAssistant';
import JobCompetencyGraph from './JobCompetencyGraph';
import AlumniGrowthTimeline from './AlumniGrowthTimeline';
import JobDistributionMap from './JobDistributionMap';
import GapAnalysisPanel from './GapAnalysisPanel';

// 定义全局样式和颜色变量
const colors = {
    background: '#0a0b1f', // 深蓝色背景
    header: '#4a90e2',     // 蓝色高亮
    panelBg: 'rgba(255, 255, 255, 0.05)', // 面板背景，轻微透明
    border: '#005f73',     // 边框颜色
    text: '#ffffff',       // 白色文本
    accent: '#00c5c7'      // 强调色
};

// 整个大屏的布局样式
const styles = {
    // 容器：修复高度溢出问题，增加 position: relative 用于定位齿轮
    dashboardContainer: {
        position: 'relative',
        height: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
        padding: '0 20px 20px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        overflow: 'hidden',
        gap: '10px'
    },

    // 顶部标题栏
    headerBar: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `2px solid ${colors.border}`,
    },
    mainTitle: {
        fontSize: '2.5vw',
        color: colors.accent,
        margin: '0 0 5px 0'
    },

    // 主体内容区
    mainContent: {
        display: 'flex',
        gap: '20px',
        height: '100%',
        overflow: 'hidden'
    },

    // 左栏 (2/7 宽度) 和 右栏 (2/7 宽度)
    sideColumn: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%'
    },

    // 中栏 (3/7 宽度)
    centerColumn: {
        flex: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%'
    },

    // 通用面板样式
    sidePanel: {
        flex: 1,
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
    },

    // 中间栏 - 上 (知识图谱)
    centerTopPanel: {
        flex: 7,
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 15px rgba(0, 197, 199, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
    },

    // 中间栏 - 下 (差距分析)
    centerBottomPanel: {
        flex: 4,
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
    },

    panelTitle: {
        fontSize: '1.2vw',
        color: colors.header,
        marginBottom: '8px',
        paddingBottom: '5px',
        borderBottom: `1px dashed ${colors.border}`,
        flexShrink: 0
    },

    panelDesc: {
        margin: '0 0 10px 0',
        fontSize: '0.8rem',
        color: '#ccc',
        flexShrink: 0
    },

    // 图表专用容器
    chartContainer: {
        flex: 1,
        width: '100%',
        minHeight: 0,
        position: 'relative'
    },

    // 齿轮图标样式
    gearIcon: {
        position: 'absolute',
        top: '20px',
        right: '25px',
        cursor: 'pointer',
        color: 'rgba(255, 255, 255, 0.3)', // 默认暗淡
        transition: 'all 0.3s ease',
        zIndex: 1000
    }
};

const DataDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();

    // 点击齿轮跳转逻辑
    const handleSettingsClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'ADMIN') {
            navigate('/admin');
        } else {
            navigate('/profile');
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* === 右上角齿轮入口 === */}
            <div
                style={styles.gearIcon}
                onClick={handleSettingsClick}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.accent} // 悬停变亮
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                title={user?.role === 'ADMIN' ? "进入后台管理" : "个人设置"}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>

            {/* 1. 顶栏 */}
            <div style={styles.headerBar}>
                <h1 style={styles.mainTitle}>大数据与软件学院就业工作室</h1>
            </div>

            {/* 2. 主体内容区 */}
            <div style={styles.mainContent}>

                {/* === 左栏 === */}
                <div style={styles.sideColumn}>
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>学生筛选与能力评测</h3>
                        <AssessmentPanel />
                    </div>
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>AI 助手</h3>
                        <ChatAssistant />
                    </div>
                </div>

                {/* === 中栏 === */}
                <div style={styles.centerColumn}>
                    <div style={styles.centerTopPanel}>
                        <h3 style={styles.panelTitle}>岗位能力知识图谱与路径推荐</h3>
                        <p style={styles.panelDesc}>核心图谱展示区: 节点链接图、岗位-能力-发展路径关联</p>
                        <div style={styles.chartContainer}>
                            <JobCompetencyGraph/>
                        </div>
                    </div>
                    <div style={styles.centerBottomPanel}>
                        <h3 style={styles.panelTitle}>能力差距分析与补救措施</h3>
                        <p style={styles.panelDesc}>分析区: 对比学生当前能力与目标岗位要求，给出提升建议</p>
                        <div style={styles.chartContainer}>
                            <GapAnalysisPanel />
                        </div>
                    </div>
                </div>

                {/* === 右栏 === */}
                <div style={styles.sideColumn}>
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>校友生涯成长曲线</h3>
                        <div style={styles.chartContainer}>
                            <AlumniGrowthTimeline/>
                        </div>
                    </div>
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>就业地域与行业分布</h3>
                        <p style={styles.panelDesc}>数据展示: 城市地图分布（地理视图）、行业占比饼图</p>
                        <div style={styles.chartContainer}>
                            <JobDistributionMap/>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DataDashboard;