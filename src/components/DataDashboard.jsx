import React from 'react';
import AssessmentPanel from './AssessmentPanel';
import ChatAssistant from './ChatAssistant';


// 定义全局样式和颜色变量，便于后续维护
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
    // 容器：使用 Grid 划分顶部和内容区
    dashboardContainer: {
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
        padding: '0 20px 20px',
        fontFamily: 'Arial, sans-serif',
        display: 'grid',
        // 顶部占 10vh，主体占 90vh
        gridTemplateRows: '10vh 90vh',
        overflow: 'hidden'
    },

    // 顶部标题栏
    headerBar: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `2px solid ${colors.border}`,
        marginBottom: '10px'
    },
    mainTitle: {
        fontSize: '2.5vw',
        color: colors.accent,
        margin: '0 0 5px 0'
    },
    coreMetrics: {
        display: 'flex',
        gap: '40px',
        fontSize: '1.5vw',
        color: colors.header,
        // 这里可以放置“去向落实率、平均起薪”等关键指标
    },

    // 主体内容区：使用 Flexbox 实现 2:3:2 的横向划分
    mainContent: {
        display: 'flex',
        gap: '20px', // 列间距
        height: '100%',
    },

    // 左栏 (2/7 宽度) 和 右栏 (2/7 宽度)
    sideColumn: {
        flex: 2, // 占 2 份
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // 上下间距
    },

    // 中栏 (3/7 宽度)
    centerColumn: {
        flex: 3, // 占 3 份
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // 上下间距
    },

    // 左右两侧的 上下区域 (高度 1:1 划分)
    sidePanel: {
        flex: 1, // 确保上下区域各占 1 份，即 50%
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)'
    },

    // 中间栏的 上下区域 (高度 3:1 划分)
    centerTopPanel: {
        flex: 3, // 占 3 份
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 15px rgba(0, 197, 199, 0.3)'
    },
    centerBottomPanel: {
        flex: 1, // 占 1 份
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)'
    },
    panelTitle: {
        fontSize: '1.2vw',
        color: colors.header,
        marginBottom: '10px',
        borderBottom: `1px dashed ${colors.border}`
    }
};


const DataDashboard = () => {
    return (
        <div style={styles.dashboardContainer}>
            {/* 1. 顶栏：标题与核心概览 */}
            <div style={styles.headerBar}>
                <h1 style={styles.mainTitle}>大数据与软件学院就业工作室</h1>
                <div style={styles.coreMetrics}>
                    <span>去向落实率: 98.5%</span>
                    <span>核心行业就业占比: 85%</span>
                    <span>平均起薪: ¥15.5k</span>
                </div>
            </div>

            {/* 2. 主体内容区：左(2) | 中(3) | 右(2) */}
            <div style={styles.mainContent}>

                {/* === 左栏 (2/7) === */}
                <div style={styles.sideColumn}>
                    {/* 左栏 - 上 (1/2) */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>【左栏-上】学生筛选与能力评测 (2:1)</h3>
                        <p>功能区: 用户评测输入、目标岗位选择、能力雷达图展示 [4, 5, 2]</p>
                        <AssessmentPanel />
                    </div>

                    {/* 左栏 - 下 (1/2) */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>【左栏-下】AI助手 (2:1)</h3>
                        <p>结合页面上下文内容进行辅助分析（待实现） [6, 7, 8]</p>
                        <ChatAssistant />
                    </div>
                </div>

                {/* === 中栏 (3/7) - 核心展示区 === */}
                <div style={styles.centerColumn}>
                    {/* 中栏 - 上 (3/4) */}
                    <div style={styles.centerTopPanel}>
                        <h3 style={styles.panelTitle}>【中栏-上】岗位能力知识图谱与路径推荐 (3:3)</h3>
                        <p>核心图谱展示区: 节点链接图、岗位-能力-发展路径关联 [9, 1, 10, 11, 12]</p>
                    </div>

                    {/* 中栏 - 下 (1/4) */}
                    <div style={styles.centerBottomPanel}>
                        <h3 style={styles.panelTitle}>【中栏-下】能力差距分析与补救措施 (3:1)</h3>
                        <p>分析区: 对比学生当前能力与目标岗位要求，给出提升建议 </p>
                    </div>
                </div>

                {/* === 右栏 (2/7) === */}
                <div style={styles.sideColumn}>
                    {/* 右栏 - 上 (1/2) */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>【右栏-上】校友生涯成长曲线 (2:1)</h3>
                        <p>数据展示: 选定校友的 Major GPA 曲线、重要事件时间轴 [5, 13]</p>
                    </div>

                    {/* 右栏 - 下 (1/2) */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>【右栏-下】就业地域与行业分布 (2:1)</h3>
                        <p>数据展示: 城市地图分布（地理视图）、行业占比饼图 [14, 5, 15]</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DataDashboard;