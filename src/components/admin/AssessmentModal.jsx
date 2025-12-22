import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssessmentModal = ({ isOpen, onClose, studentId, onSaveSuccess }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // 初始化：打开时获取数据
    useEffect(() => {
        if (isOpen && studentId) {
            setLoading(true);
            axios.get(`/api/students/${studentId}/assessment/detail`)
                .then(res => {
                    setFormData(res.data);
                })
                .catch(err => console.error("加载测评失败", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // 注意：分数类字段需要转为数字
        const isNumberField = name.includes('Score') || name.includes('Gpa');
        setFormData(prev => ({
            ...prev,
            [name]: isNumberField ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async () => {
        try {
            await axios.post(`/api/students/${studentId}/assessment/save`, formData);
            alert("测评数据已保存！");
            if (onSaveSuccess) onSaveSuccess(); // 通知父组件刷新（可选）
            onClose();
        } catch (err) {
            alert("保存失败，请检查网络或数据格式");
        }
    };

    if (!isOpen) return null;

    // --- 样式定义 ---
    const styles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        },
        modal: {
            backgroundColor: '#fff', width: '700px', maxWidth: '95%',
            maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', padding: '24px'
        },
        section: { marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '6px' },
        sectionTitle: { marginTop: 0, fontSize: '16px', color: '#1890ff', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' },
        row: { display: 'flex', gap: '20px', marginBottom: '10px' },
        col: { flex: 1 },
        label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' },
        input: { width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px', boxSizing: 'border-box' },
        footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        btn: { padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
        cancelBtn: { background: '#f5f5f5', color: '#666' },
        saveBtn: { background: '#1890ff', color: 'white' }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={{ marginTop: 0 }}>测评结果管理 (Student ID: {studentId})</h2>

                {loading ? <div>数据加载中...</div> : (
                    <>
                        {/* 1. 知识 (Knowledge) */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>K - 学术基础 (Knowledge)</h3>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>专业 GPA</label>
                                    <input type="number" step="0.1" name="gpaMajor" value={formData.gpaMajor || ''} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>核心课绩点变动趋势</label>
                                    <input type="number" step="0.1" name="coreGpaChange" value={formData.coreGpaChange || ''} onChange={handleChange} style={styles.input} placeholder="例如: 0.2 或 -0.1" />
                                </div>
                            </div>
                        </div>

                        {/* 2. 技能 (Skills) - 1~5分制 */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>S - 专业技能 (Skills) [1-5分]</h3>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Python</label>
                                    <input type="number" min="1" max="5" name="pythonScore" value={formData.pythonScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Java</label>
                                    <input type="number" min="1" max="5" name="javaScore" value={formData.javaScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>SQL / Database</label>
                                    <input type="number" min="1" max="5" name="sqlScore" value={formData.sqlScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>大数据框架 (Hadoop/Spark)</label>
                                    <input type="number" min="1" max="5" name="bigdataFrameworksScore" value={formData.bigdataFrameworksScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                        </div>

                        {/* 3. 素质 (Qualities) */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Q - 综合素质 (Qualities) [1-5分]</h3>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>团队协作</label>
                                    <input type="number" min="1" max="5" name="teamworkScore" value={formData.teamworkScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>沟通能力</label>
                                    <input type="number" min="1" max="5" name="communicationScore" value={formData.communicationScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>问题解决</label>
                                    <input type="number" min="1" max="5" name="problemSolvingScore" value={formData.problemSolvingScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>抗压能力</label>
                                    <input type="number" min="1" max="5" name="resilienceScore" value={formData.resilienceScore || ''} onChange={handleChange} style={styles.input} />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>DISC 性格类型</label>
                                    <select name="discType" value={formData.discType || ''} onChange={handleChange} style={styles.input}>
                                        <option value="">请选择</option>
                                        <option value="D">D (支配型)</option>
                                        <option value="I">I (影响型)</option>
                                        <option value="S">S (稳健型)</option>
                                        <option value="C">C (谨慎型)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={styles.footer}>
                            <button style={{...styles.btn, ...styles.cancelBtn}} onClick={onClose}>关闭</button>
                            <button style={{...styles.btn, ...styles.saveBtn}} onClick={handleSubmit}>保存测评</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssessmentModal;