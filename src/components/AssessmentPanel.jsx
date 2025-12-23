import React, { useEffect } from 'react';
import RadarChart from './RadarChart';
import useAppStore from '../store/appStore';

// 颜色常量，供组件内部元素使用 (保持不变)
const colors = {
    header: '#4a90e2',
    accent: '#00c5c7',
    text: '#ffffff',
    danger: '#e74c3c',
    border: '#005f73',
    inputBg: '#1a1b30'
};

// 仅保留组件内部布局和元素样式 (保持不变)
const styles = {
    contentWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    selectorGroup: {
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexShrink: 0,
    },
    select: {
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: colors.inputBg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        flexGrow: 1
    },
    button: {
        padding: '8px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    },
    assessmentPrompt: {
        padding: '20px',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        border: `1px solid ${colors.danger}`,
        borderRadius: '8px',
        marginTop: '10px',
        textAlign: 'center'
    },
    profileDisplay: {
        flexGrow: 1,
        overflowY: 'auto',
        marginTop: '10px'
    },
    loading: {
        color: colors.accent,
        textAlign: 'center',
        padding: '20px'
    }
};

const MAX_SCORE = 5;

const INDICATORS_MAP = [
    { label: 'Python能力', key: 'pythonScore' },
    { label: 'Java能力', key: 'javaScore' },
    { label: 'SQL数据库', key: 'sqlScore' },
    { label: '大数据框架', key: 'bigdataFrameworksScore' },
    { label: '解决问题能力', key: 'problemSolvingScore' },
    { label: '团队协作能力', key: 'teamworkScore' },
    { label: '沟通能力', key: 'communicationScore' },
    { label: '抗压与适应性', key: 'resilienceScore' }
];

const transformToRadarData = (assessment) => {
    if (!assessment) return { indicator: [], value: [] };

    const indicator = [];
    const value = [];

    INDICATORS_MAP.forEach(item => {
        indicator.push({ name: item.label, max: MAX_SCORE });
        let score = assessment[item.key] || 0;
        value.push(score);
    });

    return { indicator, value };
};

const AssessmentPanel = () => {
    // 1. 使用全局 Store 替换本地 State
    const {
        studentList,
        fetchStudentList,
        selectStudent,
        selectedStudentId,
        studentProfile,
        loading
    } = useAppStore();

    // 初始化加载列表
    useEffect(() => {
        fetchStudentList();
    }, [fetchStudentList]);

    // 处理学生选择
    const handleStudentChange = (e) => {
        selectStudent(e.target.value);
    };

    // 处理跳转逻辑 (基于 Store 中的状态)
    const handleRedirectToAssessment = () => {
        if (studentProfile?.status?.redirectUrl) {
            alert(`数据缺失！即将跳转到评测问卷：${studentProfile.status.redirectUrl}`);
        }
    };

    const renderContent = () => {
        // 使用 Store 中的 loading 状态
        if (loading.studentProfile) return <div style={styles.loading}>正在加载和分析数据...</div>;

        // 如果没有选择学生
        if (!selectedStudentId) return <div style={{ ...styles.loading, color: colors.text }}>请选择一位学生进行分析。</div>;

        // 如果没有 Profile 数据 (可能是加载失败或初始状态)
        if (!studentProfile) return null;

        // 检查数据是否完整 (Store 中如果数据不完整会设置 incomplete: true)
        if (studentProfile.incomplete) {
            return (
                <div style={styles.assessmentPrompt}>
                    <p style={{ color: colors.danger, fontWeight: 'bold' }}>当前学生评测数据不完整！</p>
                    <p>请先完成最新的能力评测问卷。</p>
                    <button
                        onClick={handleRedirectToAssessment}
                        style={{ ...styles.button, backgroundColor: colors.danger, color: colors.text }}
                    >
                        立即跳转至评测问卷
                    </button>
                </div>
            );
        }

        // 数据完整，渲染原有的图表内容
        const assessment = studentProfile.assessment || {};
        const radarData = transformToRadarData(assessment);

        return (
            <div style={styles.profileDisplay}>
                {/* 雷达图容器 (保持原有样式) */}
                <div style={{ height: 'calc(100% - 80px)', width: '100%' }}>
                    <RadarChart chartData={radarData} />
                </div>
                {/* 其他信息 (保持原有样式) */}
                <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '10px', flexShrink: 0}}>
                    <p><strong>主修GPA:</strong> <span style={{ color: colors.accent }}>{assessment.gpaMajor || 'N/A'}</span></p>
                    <p><strong>DISC倾向:</strong> <span style={{ color: colors.accent }}>{assessment.discType || 'N/A'}</span></p>
                </div>
            </div>
        );
    };

    return (
        <div style={styles.contentWrapper}>
            <div style={styles.selectorGroup}>
                <label style={{ minWidth: '80px', fontSize: '0.9vw' }}>选择学生:</label>
                <select
                    style={styles.select}
                    value={selectedStudentId || ''}
                    onChange={handleStudentChange}
                    disabled={loading.studentList}
                >
                    <option value="">-- 请选择一位在读学生 --</option>
                    {(studentList || []).map(student => (
                        <option key={student.studentId} value={student.studentId}>
                            {student.name} ({student.studentId})
                        </option>
                    ))}
                </select>
            </div>
            {renderContent()}
        </div>
    );
};

export default AssessmentPanel;