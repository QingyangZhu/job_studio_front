import React, { useEffect } from 'react';
import RadarChart from './RadarChart';
import useAppStore from '../store/appStore';

// --- 常量定义 (保持不变) ---
const colors = {
    header: '#4a90e2',
    accent: '#00c5c7',
    text: '#ffffff',
    danger: '#e74c3c',
    border: '#005f73',
    inputBg: '#1a1b30'
};

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
    { label: '解决问题', key: 'problemSolvingScore' },
    { label: '团队协作', key: 'teamworkScore' },
    { label: '沟通能力', key: 'communicationScore' },
    { label: '抗压能力', key: 'resilienceScore' }
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

// --- 组件主体 ---
const AssessmentPanel = () => {
    const {
        studentList,
        fetchStudentList,
        selectStudent,
        selectedStudentId,
        studentProfile,
        loading,
        user // 获取当前登录用户
    } = useAppStore();

    // 1. 初始化与权限控制逻辑
    useEffect(() => {
        if (!user) return;

        if (user.role === 'ADMIN') {
            // 管理员：获取列表供选择
            fetchStudentList();
        } else if (user.role === 'STUDENT' && user.studentId) {
            // 学生：强制选中自己
            // 注意：这里把 user.studentId 转为字符串比较，防止类型不一致导致的无限循环
            if (String(selectedStudentId) !== String(user.studentId)) {
                selectStudent(user.studentId);
            }
        }
    }, [user, fetchStudentList, selectStudent, selectedStudentId]);

    const handleStudentChange = (e) => {
        selectStudent(e.target.value);
    };

    const handleRedirectToAssessment = () => {
        alert("请联系辅导员获取测评链接。");
    };

    // 2. 动态渲染头部选择器
    const renderSelector = () => {
        if (user?.role === 'STUDENT') {
            // === 学生视图：只显示欢迎语 ===
            return (
                <div style={{
                    padding: '10px',
                    borderBottom: `1px solid ${colors.border}`,
                    marginBottom: '10px',
                    backgroundColor: 'rgba(0, 197, 199, 0.05)',
                    borderRadius: '4px'
                }}>
                    <div style={{ color: colors.accent, fontWeight: 'bold', fontSize: '1.1em' }}>
                        👋 你好, {studentProfile?.info?.name || user.username}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                        {studentProfile?.info?.major || '学生'} | 个人能力画像
                    </div>
                </div>
            );
        } else {
            // === 管理员视图：显示下拉框 ===
            return (
                <div style={styles.selectorGroup}>
                    <label style={{ minWidth: '60px', fontSize: '14px' }}>学生:</label>
                    <select
                        style={styles.select}
                        value={selectedStudentId || ''}
                        onChange={handleStudentChange}
                        disabled={loading.studentList}
                    >
                        <option value="">-- 请选择 --</option>
                        {(studentList || []).map(student => (
                            <option key={student.studentId} value={student.studentId}>
                                {student.name} ({student.studentId})
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
    };

    const renderContent = () => {
        if (loading.studentProfile) return <div style={styles.loading}>正在分析数据...</div>;

        // 如果没有选中 ID (且不是加载中)
        if (!selectedStudentId) return <div style={{ ...styles.loading, color: colors.text }}>请选择一位学生。</div>;

        if (!studentProfile) return null;

        if (studentProfile.incomplete) {
            return (
                <div style={styles.assessmentPrompt}>
                    <p style={{ color: colors.danger, fontWeight: 'bold' }}>尚未完成能力评测</p>
                    <p style={{ fontSize: '12px', marginBottom: '10px' }}>暂无数据展示</p>
                    <button
                        onClick={handleRedirectToAssessment}
                        style={{ ...styles.button, backgroundColor: colors.danger, color: colors.text }}
                    >
                        去测评
                    </button>
                </div>
            );
        }

        const assessment = studentProfile.assessment || {};
        const radarData = transformToRadarData(assessment);

        return (
            <div style={styles.profileDisplay}>
                <div style={{ height: '240px', width: '100%' }}>
                    <RadarChart chartData={radarData} />
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '12px', color: '#ccc'}}>
                    <span>GPA: <b style={{color: 'white'}}>{assessment.gpaMajor || 'N/A'}</b></span>
                    <span>DISC: <b style={{color: 'white'}}>{assessment.discType || 'N/A'}</b></span>
                </div>
            </div>
        );
    };

    return (
        <div style={styles.contentWrapper}>
            {renderSelector()}
            {renderContent()}
        </div>
    );
};

export default AssessmentPanel;