import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RadarChart from './RadarChart'; // 导入雷达图组件

// 假设后端基础 API 版本为 v1
const BASE_API = '/api/students';

// 样式常量
const colors = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '#005f73',
    header: '#4a90e2',
    accent: '#00c5c7',
    text: '#ffffff',
    danger: '#e74c3c'
};

const styles = {
    panel: {
        height: '100%',
        backgroundColor: colors.background,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 197, 199, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    panelTitle: {
        fontSize: '1.2vw',
        color: colors.header,
        marginBottom: '10px',
        borderBottom: `1px dashed ${colors.border}`,
        paddingBottom: '5px'
    },
    selectorGroup: {
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    select: {
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: '#1a1b30',
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

// 最大评分：所有K/S/Q指标都是5分制
const MAX_SCORE = 5;

// **[修正 1]** 补全指标映射表 (这是核心)
// key: 对应后端 assessment 对象中的字段名
// label: 显示在雷达图上的名称
const INDICATORS_MAP = [
    { label: '编程与算法', key: 'programmingAbility' },
    { label: '软件工程实践', key: 'engineeringPractice' },
    { label: '专业GPA', key: 'gpaMajor' },
    { label: '解决问题能力', key: 'problemSolving' },
    { label: '学习与适应性', key: 'learningAdaptability' },
    { label: '沟通与协作', key: 'communicationCooperation' },
    { label: '项目管理', key: 'projectManagement' },
    { label: '创新思维', key: 'innovativeThinking' }
];

/**
 * 将后端返回的 AssessmentResult 数据转换为 ECharts 雷达图格式
 * @param {object} assessment 后端 AssessmentResult 实体
 * @returns {object} { indicator: Array, value: Array }
 */
const transformToRadarData = (assessment) => {
    // **[修正 2]** 补全返回值和内部变量的初始化
    if (!assessment) return { indicator: [], value: [] };

    const indicator = [];
    const value = [];

    INDICATORS_MAP.forEach(item => {
        indicator.push({ name: item.label, max: MAX_SCORE });

        // **[修正 3]** 使用正确的逻辑或操作符 ||
        let score = assessment[item.key] || 0;

        if (item.key === 'gpaMajor' && assessment.gpaMajor) {
            // 假设后端传来的 gpaMajor 是 4.0 分制，我们映射到 5 分制
            score = parseFloat((assessment.gpaMajor * MAX_SCORE / 4.0).toFixed(2));
        }

        value.push(score);
    });

    return { indicator, value };
};


const AssessmentPanel = () => {
    // **[修正 4]** 修正了所有 useState 的声明语法
    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [status, setStatus] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentList = async () => {
            try {
                const response = await axios.get(`${BASE_API}/list`);
                setStudents(response.data);
            } catch (err) {
                setError("无法加载学生列表。请检查后端 /api/v1/students/list 接口。");
                console.error("Fetch Student List Error:", err);
            }
        };
        fetchStudentList();
    }, []); // **[修正 5]** 修正了 useEffect 的依赖项数组

    const checkStatusAndFetch = useCallback(async (id) => {
        if (!id) {
            setStatus(null);
            setProfile(null);
            return;
        }
        setLoading(true);
        setError(null);
        setProfile(null);
        try {
            const statusResponse = await axios.get(`${BASE_API}/${id}/status`);
            setStatus(statusResponse.data);
            if (statusResponse.data.isComplete) {
                const profileResponse = await axios.get(`${BASE_API}/${id}/profile`);
                setProfile(profileResponse.data);
            }
        } catch (err) {
            setError(`获取学生ID ${id} 状态失败。`);
            console.error("Status Check Error:", err);
        } finally {
            setLoading(false);
        }
    }, []); // **[修正 5]** 修正了 useCallback 的依赖项数组

    useEffect(() => {
        checkStatusAndFetch(selectedId);
    }, [selectedId, checkStatusAndFetch]); // **[修正 5]** 修正了 useEffect 的依赖项数组


    const handleRedirectToAssessment = () => {
        if (status && status.redirectUrl) {
            console.log(`目标URL: http://localhost:3000${status.redirectUrl}`);
            alert(`数据缺失！即将跳转到评测问卷：${status.redirectUrl}`);
        }
    };

    const renderContent = () => {
        if (loading) return <div style={styles.loading}>正在加载和分析数据...</div>;
        if (error) return <div style={{...styles.loading, color: colors.danger}}>{error}</div>;
        if (!selectedId) return <div style={{...styles.loading, color: colors.text}}>请选择一位在读学生进行能力评测与分析。</div>;

        if (status && !status.isComplete) {
            return (
                <div style={styles.assessmentPrompt}>
                    <p style={{ color: colors.danger, fontWeight: 'bold' }}>
                        当前学生 {status.studentId} 的评测数据不完整或已过期！
                    </p>
                    <p>请先完成最新的能力评测问卷。</p>
                    <button
                        onClick={handleRedirectToAssessment}
                        style={{...styles.button, backgroundColor: colors.danger, color: colors.text }}
                    >
                        立即跳转至评测问卷 >>
                    </button>
                </div>
            );
        }

        if (profile) {
            // **[修正 3]** 使用正确的逻辑或操作符 ||
            const assessment = profile.assessment || {};
            const radarData = transformToRadarData(assessment);

            return (
                <div style={styles.profileDisplay}>
                    <h4 style={{ color: colors.accent, borderBottom: `1px solid ${colors.border}` }}>
                        学生画像摘要 ({profile.info?.name} - {profile.info?.major})
                    </h4>

                    <div style={{ height: '300px', width: '100%', margin: '15px 0' }}>
                        <RadarChart chartData={radarData} />
                    </div>

                    <p><strong>主修GPA:</strong> <span style={{ color: colors.accent }}>{assessment.gpaMajor || 'N/A'}</span></p>
                    <p><strong>DISC倾向:</strong> {assessment.discType || 'N/A'}</p>

                    <h5 style={{ color: colors.header, marginTop: '15px' }}>各项能力得分 (5分制)</h5>
                    <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {radarData.indicator.map((item, index) => (
                            <li key={item.name} style={{ width: '45%', border: `1px dashed ${colors.border}`, padding: '8px', borderRadius: '4px', fontSize: '0.85vw' }}>
                                <span>{item.name}: </span>
                                <span style={{ color: colors.accent, fontWeight: 'bold' }}>
                                    {/* **[修正 3]** 使用正确的逻辑或操作符 || */}
                                    {radarData.value[index] || 'N/A'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        return null;
    };


    return (
        <div style={styles.panel}>
            <h3 style={styles.panelTitle}>【左栏-上】学生筛选与能力评测 (2:1)</h3>

            <div style={styles.selectorGroup}>
                <label style={{ minWidth: '80px', fontSize: '0.9vw' }}>选择学生:</label>
                <select
                    style={styles.select}
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    <option value="" disabled>-- 请选择一位在读学生 --</option>
                    {(students || []).map(student => (
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