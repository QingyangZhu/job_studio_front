import React from 'react';
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
    // 容器：修复高度溢出问题
    dashboardContainer: {
        height: '100vh', // 强制固定屏幕高度
        backgroundColor: colors.background,
        color: colors.text,
        padding: '0 20px 20px',
        boxSizing: 'border-box', // 关键：包含 padding 在 height 内
        fontFamily: 'Arial, sans-serif',
        display: 'grid',
        // 顶部自适应(auto)，主体占满剩余空间(1fr)
        gridTemplateRows: 'auto 1fr',
        overflow: 'hidden', // 禁止出现滚动条
        gap: '10px' // 各区域间距
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
        gap: '20px', // 列间距
        height: '100%', // 占满 grid 的 1fr 区域
        overflow: 'hidden' // 防止内部组件撑开
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

    // 通用面板样式 (左/右栏)
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
        minHeight: 0 // 关键：允许 flex item 收缩
    },

    // 中间栏 - 上 (知识图谱)
    centerTopPanel: {
        flex: 7, // 7:4 比例
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
        flex: 4, // 7:4 比例
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
        flexShrink: 0 // 防止标题被压缩
    },

    // 文本描述样式 (防止占用过多空间)
    panelDesc: {
        margin: '0 0 10px 0',
        fontSize: '0.8rem',
        color: '#ccc',
        flexShrink: 0
    },

    // 图表专用容器 (关键修复)
    // 强制图表只占用标题下方的剩余空间
    chartContainer: {
        flex: 1,
        width: '100%',
        minHeight: 0, // 允许 ECharts 容器在空间不足时自动缩小
        position: 'relative'
    }
};

const DataDashboard = () => {
    return (
        <div style={styles.dashboardContainer}>
            {/* 1. 顶栏 */}
            <div style={styles.headerBar}>
                <h1 style={styles.mainTitle}>大数据与软件学院就业工作室</h1>
            </div>

            {/* 2. 主体内容区 */}
            <div style={styles.mainContent}>

                {/* === 左栏 === */}
                <div style={styles.sideColumn}>
                    {/* 左上：学生筛选 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>学生筛选与能力评测</h3>
                        {/* AssessmentPanel 内部已处理好布局，直接放入 */}
                        <AssessmentPanel />
                    </div>

                    {/* 左下：AI 助手 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>AI 助手</h3>
                        <ChatAssistant />
                    </div>
                </div>

                {/* === 中栏 === */}
                <div style={styles.centerColumn}>
                    {/* 中上：知识图谱 */}
                    <div style={styles.centerTopPanel}>
                        <h3 style={styles.panelTitle}>岗位能力知识图谱与路径推荐</h3>
                        <p style={styles.panelDesc}>核心图谱展示区: 节点链接图、岗位-能力-发展路径关联</p>

                        {/* 使用 chartContainer 包裹图表 */}
                        <div style={styles.chartContainer}>
                            <JobCompetencyGraph/>
                        </div>
                    </div>

                    {/* 中下：差距分析 */}
                    <div style={styles.centerBottomPanel}>
                        <h3 style={styles.panelTitle}>能力差距分析</h3>
                        <p style={styles.panelDesc}>分析区: 对比学生当前能力与目标岗位要求，给出提升建议</p>

                        <div style={styles.chartContainer}>
                            <GapAnalysisPanel />
                        </div>
                    </div>
                </div>

                {/* === 右栏 === */}
                <div style={styles.sideColumn}>
                    {/* 右上：校友时间轴 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>校友生涯成长曲线</h3>
                        <div style={styles.chartContainer}>
                            <AlumniGrowthTimeline/>
                        </div>
                    </div>

                    {/* 右下：就业地图 */}
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