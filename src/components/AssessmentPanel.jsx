import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RadarChart from './RadarChart'; // 确保你已创建此组件

const BASE_API = '/api/students';

// 颜色常量，供组件内部元素使用
const colors = {
    header: '#4a90e2',
    accent: '#00c5c7',
    text: '#ffffff',
    danger: '#e74c3c',
    border: '#005f73',
    inputBg: '#1a1b30'
};

// 仅保留组件内部布局和元素样式
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
        flexShrink: 0, // 防止被压缩
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
                setError("无法加载学生列表。");
                console.error("Fetch Student List Error:", err);
            }
        };
        fetchStudentList();
    }, []);

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
    }, []);

    useEffect(() => {
        checkStatusAndFetch(selectedId);
    }, [selectedId, checkStatusAndFetch]);

    const handleRedirectToAssessment = () => {
        if (status && status.redirectUrl) {
            alert(`数据缺失！即将跳转到评测问卷：${status.redirectUrl}`);
        }
    };

    const renderContent = () => {
        if (loading) return <div style={styles.loading}>正在加载和分析数据...</div>;
        if (error) return <div style={{ ...styles.loading, color: colors.danger }}>{error}</div>;
        if (!selectedId) return <div style={{ ...styles.loading, color: colors.text }}>请选择一位学生进行分析。</div>;

        if (status && !status.isComplete) {
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

        if (profile) {
            const assessment = profile.assessment || {};
            const radarData = transformToRadarData(assessment);

            return (
                <div style={styles.profileDisplay}>
                    {/* 雷达图容器 */}
                    <div style={{ height: 'calc(100% - 80px)', width: '100%' }}>
                        <RadarChart chartData={radarData} />
                    </div>
                    {/* 其他信息 */}
                    <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '10px', flexShrink: 0}}>
                        <p><strong>主修GPA:</strong> <span style={{ color: colors.accent }}>{assessment.gpaMajor || 'N/A'}</span></p>
                        <p><strong>DISC倾向:</strong> <span style={{ color: colors.accent }}>{assessment.discType || 'N/A'}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.contentWrapper}>
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