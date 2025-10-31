import React from 'react';
import AssessmentPanel from './AssessmentPanel';
import ChatAssistant from './ChatAssistant';
import JobCompetencyGraph from './JobCompetencyGraph'
import AlumniGrowthTimeline from './AlumniGrowthTimeline';
import JobDistributionMap from './JobDistributionMap';
import useAppStore from '../store/appStore';

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
    // 这是“展柜”样式，负责背景、边框、边距等
    sidePanel: {
        flex: 1,
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)',
        display: 'flex', // 添加flex布局，为了让子组件能撑满
        flexDirection: 'column' // 垂直排列标题和内容
    },

    // 中间栏的 上下区域 (高度 3:1 划分)
    centerTopPanel: {
        flex: 7,
        backgroundColor: colors.panelBg,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 15px rgba(0, 197, 199, 0.3)'
    },
    centerBottomPanel: {
        flex: 4,
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
        paddingBottom: '5px', // 增加一点下边距
        borderBottom: `1px dashed ${colors.border}`,
        flexShrink: 0 // 防止标题在flex布局中被压缩
    }
};

const GapAnalysisPanel = () => {
    // 直接在组件内部从 store 获取状态
    const { selectedStudentId, selectedAlumniId } = useAppStore();

    let content = '请先在左侧选择学生，并在右侧选择学长学姐以进行能力差距分析。';

    if (selectedStudentId && selectedAlumniId) {
        content = `正在分析学生 ${selectedStudentId} 与目标岗位的能力差距...`;
    } else if (selectedStudentId) {
        content = '请在右侧选择一位学长学姐作为目标。';
    } else if (selectedAlumniId) {
        content = '请在左侧选择一名学生进行分析。';
    }

    return (
        <div>
            <p>{content}</p>
        </div>
    );
};

const DataDashboard = () => {
    return (
        <div style={styles.dashboardContainer}>
            {/* 1. 顶栏：标题与核心概览 */}
            <div style={styles.headerBar}>
                <h1 style={styles.mainTitle}>大数据与软件学院就业工作室</h1>
            </div>

            {/* 2. 主体内容区：左(2) | 中(3) | 右(2) */}
            <div style={styles.mainContent}>

                {/* === 左栏 (2/7) === */}
                <div style={styles.sideColumn}>
                    {/* 左栏 - 上 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>学生筛选与能力评测</h3>
                        <AssessmentPanel />
                    </div>

                    {/* 左栏 - 下 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>AI 助手</h3>
                        <ChatAssistant />
                    </div>
                </div>

                {/* === 中栏 (3/7) - 核心展示区 === */}
                <div style={styles.centerColumn}>
                    {/* 中栏 - 上 */}
                    <div style={styles.centerTopPanel}>
                        <h3 style={styles.panelTitle}>岗位能力知识图谱与路径推荐</h3>
                        <p>核心图谱展示区: 节点链接图、岗位-能力-发展路径关联</p>
                        <JobCompetencyGraph/>
                    </div>

                    {/* 中栏 - 下 */}
                    <div style={styles.centerBottomPanel}>
                        <h3 style={styles.panelTitle}>能力差距分析与补救措施</h3>
                        <p>分析区: 对比学生当前能力与目标岗位要求，给出提升建议</p>
                    </div>
                </div>

                {/* === 右栏 (2/7) === */}
                <div style={styles.sideColumn}>
                    {/* 右栏 - 上 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>校友生涯成长曲线</h3>
                        <AlumniGrowthTimeline/>
                    </div>

                    {/* 右栏 - 下 */}
                    <div style={styles.sidePanel}>
                        <h3 style={styles.panelTitle}>就业地域与行业分布</h3>
                        <p>数据展示: 城市地图分布（地理视图）、行业占比饼图</p>
                        <JobDistributionMap/>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DataDashboard;