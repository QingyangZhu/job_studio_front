import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAppStore from '../store/appStore';

// === 样式定义 ===
const colors = {
    bg: '#0a0b1f',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    accent: '#00c5c7',
    text: '#fff',
    textSec: '#aaa',
    border: '#005f73'
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.text,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
    },
    card: {
        width: '800px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        padding: '40px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
    },
    progressBar: {
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: '30px',
        borderRadius: '2px',
        overflow: 'hidden'
    },
    progressFill: (step) => ({
        height: '100%',
        width: `${(step / 3) * 100}%`,
        backgroundColor: colors.accent,
        transition: 'width 0.5s ease'
    }),
    title: { fontSize: '28px', color: colors.accent, marginBottom: '10px', textAlign: 'center' },
    subtitle: { fontSize: '14px', color: colors.textSec, marginBottom: '30px', textAlign: 'center' },

    // 题目样式
    questionGroup: { marginBottom: '25px' },
    questionLabel: { display: 'block', marginBottom: '10px', fontSize: '16px' },
    sliderContainer: { display: 'flex', alignItems: 'center', gap: '15px' },
    slider: { flex: 1, accentColor: colors.accent, cursor: 'pointer' },
    scoreDisplay: { width: '40px', textAlign: 'right', color: colors.accent, fontWeight: 'bold' },

    // 岗位选择卡片
    jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
    jobCard: (selected) => ({
        padding: '15px',
        border: `1px solid ${selected ? colors.accent : 'rgba(255,255,255,0.2)'}`,
        backgroundColor: selected ? 'rgba(0, 197, 199, 0.1)' : 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.3s',
        color: selected ? colors.accent : '#fff'
    }),

    // 底部按钮
    btnRow: { display: 'flex', justifyContent: 'space-between', marginTop: '40px' },
    btn: (primary) => ({
        padding: '12px 30px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: primary ? colors.accent : 'rgba(255,255,255,0.1)',
        color: primary ? '#000' : '#fff',
        transition: '0.3s'
    })
};

// === 题库配置 ===
const QUESTIONS = {
    general: [
        { id: 'algo_base', label: '数据结构与算法基础 (Data Structures & Algo)' },
        { id: 'cs_network', label: '计算机网络与操作系统 (CS Fundamentals)' },
        { id: 'english', label: '技术英语阅读能力 (Technical English)' },
        { id: 'communication', label: '团队沟通与协作 (Communication)' }
    ],
    // 针对特定岗位的专项题库
    specific: {
        'Java Backend': [
            { id: 'java_se', label: 'Java 核心基础 (集合, 多线程, JVM)' },
            { id: 'spring_boot', label: 'Spring Boot / Cloud 框架应用' },
            { id: 'mysql_redis', label: 'MySQL & Redis 数据库设计' },
            { id: 'distributed', label: '分布式系统理解 (MQ, Docker)' }
        ],
        'Frontend': [
            { id: 'js_ts', label: 'JavaScript / TypeScript 深度' },
            { id: 'react_vue', label: 'React / Vue 框架掌握程度' },
            { id: 'css_html', label: 'HTML5 & CSS3 & 响应式布局' },
            { id: 'browser', label: '浏览器原理与性能优化' }
        ],
        'Data Analyst': [
            { id: 'python_data', label: 'Python 数据分析库 (Pandas, NumPy)' },
            { id: 'sql_advanced', label: 'SQL 高级查询与优化' },
            { id: 'visualization', label: '数据可视化 (ECharts, Tableau)' },
            { id: 'stats_ml', label: '统计学与机器学习基础' }
        ]
    }
};

const AssessmentForm = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // === 状态管理 ===
    const [generalScores, setGeneralScores] = useState({
        algo_base: 50, cs_network: 50, english: 50, communication: 50
    });
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [specificScores, setSpecificScores] = useState({});

    // === 事件处理 ===

    // 切换岗位选择
    const toggleJob = (job) => {
        if (selectedJobs.includes(job)) {
            setSelectedJobs(selectedJobs.filter(j => j !== job));
            // 清理该岗位对应的分数
            const newSpecifics = { ...specificScores };
            QUESTIONS.specific[job].forEach(q => delete newSpecifics[q.id]);
            setSpecificScores(newSpecifics);
        } else {
            setSelectedJobs([...selectedJobs, job]);
        }
    };

    // 提交最终结果
    const handleSubmit = async () => {
        setSubmitting(true);
        const payload = {
            generalScores,
            targetJobs: selectedJobs,
            specificScores
        };

        try {
            // === 修复点：拼接正确的 URL ===
            // 1. 确保 user 对象里有 studentId (登录接口返回的)
            // 2. 如果 user.studentId 为空，可能需要先调用 /api/users/profile 获取一下，或者使用 user.username (取决于你之前是用 ID 还是 username 绑定的)

            // 假设 user.studentId 存在：
            let targetId = user.studentId;

            // 容错处理：如果 store 里没存 studentId，但存了 username 且 username 就是学号
            if (!targetId && !isNaN(user.username)) {
                targetId = user.username;
            }

            if (!targetId) {
                alert("无法获取学生ID，请尝试重新登录");
                setSubmitting(false);
                return;
            }

            // 发送请求
            await axios.post(`/api/students/${targetId}/assessment/submit`, payload);

            alert('🎉 测评完成！知识图谱将根据您的最新数据生成。');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('提交失败: ' + (err.response?.data || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    // === 渲染步骤内容 ===

    // Step 1: 通用能力
    const renderStep1 = () => (
        <div>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>第一阶段：计算机通用素养</h3>
            {QUESTIONS.general.map(q => (
                <div key={q.id} style={styles.questionGroup}>
                    <label style={styles.questionLabel}>{q.label}</label>
                    <div style={styles.sliderContainer}>
                        <span style={{color: '#666', fontSize:'12px'}}>入门</span>
                        <input
                            type="range" min="0" max="100"
                            style={styles.slider}
                            value={generalScores[q.id]}
                            onChange={(e) => setGeneralScores({...generalScores, [q.id]: parseInt(e.target.value)})}
                        />
                        <span style={{color: '#666', fontSize:'12px'}}>精通</span>
                        <span style={styles.scoreDisplay}>{generalScores[q.id]}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    // Step 2: 目标岗位
    const renderStep2 = () => (
        <div>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>第二阶段：选择您的目标方向 (可多选)</h3>
            <div style={styles.jobGrid}>
                {Object.keys(QUESTIONS.specific).map(job => (
                    <div
                        key={job}
                        style={styles.jobCard(selectedJobs.includes(job))}
                        onClick={() => toggleJob(job)}
                    >
                        {selectedJobs.includes(job) ? '✅ ' : ''}{job}
                    </div>
                ))}
            </div>
            {selectedJobs.length === 0 && (
                <p style={{color: colors.danger, marginTop: '20px', fontSize: '14px'}}>* 请至少选择一个方向</p>
            )}
        </div>
    );

    // Step 3: 专项能力
    const renderStep3 = () => (
        <div>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>第三阶段：专项技术栈自评</h3>
            {selectedJobs.map(job => (
                <div key={job} style={{marginBottom: '30px'}}>
                    <h4 style={{color: colors.accent, borderBottom: '1px dashed #333', paddingBottom: '10px'}}>{job} 专项</h4>
                    {QUESTIONS.specific[job].map(q => (
                        <div key={q.id} style={styles.questionGroup}>
                            <label style={styles.questionLabel}>{q.label}</label>
                            <div style={styles.sliderContainer}>
                                <input
                                    type="range" min="0" max="100"
                                    style={styles.slider}
                                    value={specificScores[q.id] || 0} // 默认为0
                                    onChange={(e) => setSpecificScores({...specificScores, [q.id]: parseInt(e.target.value)})}
                                />
                                <span style={styles.scoreDisplay}>{specificScores[q.id] || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* 顶部进度条 */}
                <div style={styles.progressBar}>
                    <div style={styles.progressFill(step)}></div>
                </div>

                <div style={styles.title}>能力全景测评</div>
                <div style={styles.subtitle}>Step {step} / 3</div>

                {/* 动态内容区 */}
                <div style={{minHeight: '300px'}}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                {/* 底部按钮 */}
                <div style={styles.btnRow}>
                    {step > 1 ? (
                        <button style={styles.btn(false)} onClick={() => setStep(step - 1)}>上一步</button>
                    ) : (
                        <div></div> // 占位
                    )}

                    {step < 3 ? (
                        <button
                            style={{...styles.btn(true), opacity: (step === 2 && selectedJobs.length === 0) ? 0.5 : 1}}
                            disabled={step === 2 && selectedJobs.length === 0}
                            onClick={() => setStep(step + 1)}
                        >
                            下一步
                        </button>
                    ) : (
                        <button style={styles.btn(true)} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? '提交中...' : '生成知识图谱'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentForm;