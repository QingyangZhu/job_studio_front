import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAppStore from '../store/appStore';

// 样式配置
const colors = {
    bg: '#0a0b1f',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    accent: '#00c5c7',
    text: '#ffffff',
    secondaryText: '#aaaaaa',
    border: '#005f73',
    button: '#00c5c7'
};

const AssessmentForm = () => {
    const navigate = useNavigate();
    const { user, login } = useAppStore(); // 获取当前登录用户
    const [submitting, setSubmitting] = useState(false);

    // 表单状态
    const [formData, setFormData] = useState({
        // 硬技能 (1-5)
        javaScore: 3,
        pythonScore: 3,
        sqlScore: 3,
        bigdataFrameworksScore: 1,
        // 软技能 (1-5)
        teamworkScore: 3,
        communicationScore: 3,
        problemSolvingScore: 3,
        resilienceScore: 3,
        // 基础信息
        gpaMajor: '',
        discType: 'D'
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.studentId) {
            alert("用户信息丢失，请重新登录");
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            // 1. 提交数据
            await axios.post(`/api/students/${user.studentId}/assessment/submit`, formData);

            alert("测评提交成功！正在生成您的能力画像...");

            // 2. 关键步骤：更新本地用户状态为“已测评”
            // 我们可以简单地更新 localStorage，或者重新触发一次 login 流程来刷新状态
            // 这里我们手动更新 store 中的 user 对象 (如果 store 有 setUser 方法最好，没有则重新登录或手动修改)
            const updatedUser = { ...user, assessmentCompleted: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // 3. 跳转到大屏
            // 稍微延迟一下，让用户看到成功提示
            setTimeout(() => {
                navigate('/dashboard');
                // 强制刷新一下页面以确保 Store 重新加载最新的 User 状态
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.error(err);
            alert("提交失败，请检查网络或联系管理员。");
        } finally {
            setSubmitting(false);
        }
    };

    // --- 组件：评分滑块 ---
    const ScoreSlider = ({ label, name, value }) => (
        <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
                <label style={styles.label}>{label}</label>
                <span style={styles.scoreValue}>{value} / 5</span>
            </div>
            <input
                type="range"
                min="1" max="5" step="1"
                value={value}
                onChange={(e) => handleChange(name, parseInt(e.target.value))}
                style={styles.range}
            />
            <div style={styles.scaleLabels}>
                <span>入门</span>
                <span>熟练</span>
                <span>精通</span>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h1 style={styles.title}>个人能力综合测评</h1>
                <p style={styles.subtitle}>为了让 AI 助手更精准地为您规划职业路径，请如实填写以下信息。</p>

                <form onSubmit={handleSubmit}>

                    {/* 第一部分：硬技能 */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>🛠 专业技能 (Hard Skills)</h3>
                        <div style={styles.grid}>
                            <ScoreSlider label="Java 开发能力" name="javaScore" value={formData.javaScore} />
                            <ScoreSlider label="Python 数据处理" name="pythonScore" value={formData.pythonScore} />
                            <ScoreSlider label="SQL 数据库" name="sqlScore" value={formData.sqlScore} />
                            <ScoreSlider label="大数据框架 (Hadoop/Spark)" name="bigdataFrameworksScore" value={formData.bigdataFrameworksScore} />
                        </div>
                    </div>

                    {/* 第二部分：软技能 */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>💡 综合素质 (Soft Skills)</h3>
                        <div style={styles.grid}>
                            <ScoreSlider label="团队协作能力" name="teamworkScore" value={formData.teamworkScore} />
                            <ScoreSlider label="沟通表达能力" name="communicationScore" value={formData.communicationScore} />
                            <ScoreSlider label="问题解决能力" name="problemSolvingScore" value={formData.problemSolvingScore} />
                            <ScoreSlider label="抗压与适应性" name="resilienceScore" value={formData.resilienceScore} />
                        </div>
                    </div>

                    {/* 第三部分：基础信息 */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>📝 基础概况</h3>
                        <div style={styles.grid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>专业主修 GPA (4.0制)</label>
                                <input
                                    type="number" step="0.1" min="0" max="4.0"
                                    style={styles.textInput}
                                    value={formData.gpaMajor}
                                    onChange={(e) => handleChange('gpaMajor', parseFloat(e.target.value))}
                                    placeholder="例如: 3.5"
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>DISC 性格测试结果</label>
                                <select
                                    style={styles.select}
                                    value={formData.discType}
                                    onChange={(e) => handleChange('discType', e.target.value)}
                                >
                                    <option value="D">D - 支配型 (Dominance)</option>
                                    <option value="I">I - 影响型 (Influence)</option>
                                    <option value="S">S - 稳健型 (Steadiness)</option>
                                    <option value="C">C - 谨慎型 (Compliance)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{...styles.submitBtn, opacity: submitting ? 0.6 : 1}}
                        disabled={submitting}
                    >
                        {submitting ? '提交中...' : '提交测评并生成画像'}
                    </button>

                </form>
            </div>
        </div>
    );
};

// CSS-in-JS 样式
const styles = {
    container: {
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.bg} 0%, #151632 100%)`,
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        color: colors.text,
        fontFamily: 'Arial, sans-serif'
    },
    formCard: {
        width: '100%',
        maxWidth: '800px',
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 0 30px rgba(0, 197, 199, 0.1)',
        backdropFilter: 'blur(10px)'
    },
    title: {
        textAlign: 'center',
        color: colors.accent,
        marginBottom: '10px'
    },
    subtitle: {
        textAlign: 'center',
        color: colors.secondaryText,
        marginBottom: '40px'
    },
    section: {
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: `1px dashed ${colors.border}`
    },
    sectionTitle: {
        fontSize: '18px',
        color: colors.text,
        marginBottom: '20px',
        borderLeft: `4px solid ${colors.accent}`,
        paddingLeft: '10px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        // 响应式处理：屏幕小的时候单列
        '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr'
        }
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    labelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },
    label: {
        fontSize: '14px',
        color: '#ddd'
    },
    scoreValue: {
        color: colors.accent,
        fontWeight: 'bold'
    },
    range: {
        width: '100%',
        cursor: 'pointer',
        accentColor: colors.accent // 现代浏览器支持
    },
    scaleLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#666',
        marginTop: '5px'
    },
    textInput: {
        padding: '12px',
        backgroundColor: '#0f1025',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        color: 'white',
        fontSize: '16px',
        outline: 'none'
    },
    select: {
        padding: '12px',
        backgroundColor: '#0f1025',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        color: 'white',
        fontSize: '16px',
        outline: 'none'
    },
    submitBtn: {
        width: '100%',
        padding: '15px',
        backgroundColor: colors.button,
        color: '#0a0b1f',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px',
        transition: 'all 0.3s'
    }
};

export default AssessmentForm;