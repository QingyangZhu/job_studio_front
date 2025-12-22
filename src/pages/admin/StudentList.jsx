import React, { useEffect, useState } from 'react';
import axios from 'axios';
// 引入两个模态框组件
import DataModal from '../../components/admin/DataModal';
import AssessmentModal from '../../components/admin/AssessmentModal';

const StudentList = () => {
    // --- 状态管理 ---
    const [students, setStudents] = useState([]);

    // 状态：学生基础信息编辑 Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({});
    const [isEdit, setIsEdit] = useState(false);

    // 状态：测评管理 Modal (新增部分)
    const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    // --- 数据获取 ---
    const fetchList = () => {
        axios.get('/api/students/list')
            .then(res => setStudents(res.data))
            .catch(err => console.error("获取列表失败", err));
    };

    useEffect(() => { fetchList(); }, []);

    // --- 基础信息管理逻辑 (CRUD) ---

    // 打开新增窗口
    const handleAdd = () => {
        setCurrentStudent({
            studentId: '',
            name: '',
            major: '',
            className: '',
            enrollmentYear: 2022,
            contactEmail: ''
        });
        setIsEdit(false);
        setIsModalOpen(true);
    };

    // 打开编辑窗口
    const handleEdit = (student) => {
        setCurrentStudent({ ...student });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    // 删除学生
    const handleDelete = async (id) => {
        if (window.confirm('确定要删除该学生吗？')) {
            try {
                await axios.delete(`/api/students/${id}`);
                fetchList();
            } catch (err) {
                alert("删除失败，请稍后重试");
            }
        }
    };

    // 保存学生基础信息
    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put('/api/students', currentStudent);
            } else {
                await axios.post('/api/students', currentStudent);
            }
            setIsModalOpen(false);
            fetchList();
        } catch (err) {
            alert('操作失败，请检查输入或ID冲突');
        }
    };

    // 基础表单输入处理
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    // --- 测评管理逻辑 (新增部分) ---

    const handleAssessment = (studentId) => {
        setSelectedStudentId(studentId);
        setIsAssessModalOpen(true);
    };

    // --- 样式定义 (CSS-in-JS) ---
    const styles = {
        container: { background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        addBtn: { padding: '8px 16px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
        th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #f0f0f0', background: '#fafafa', color: '#555', fontWeight: '600' },
        tr: { transition: 'background 0.2s' },
        td: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#333' },
        actionBtn: { marginRight: '12px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
        formItem: { marginBottom: '16px' },
        label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' },
        input: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }
    };

    return (
        <div style={styles.container}>
            {/* 顶部标题区 */}
            <div style={styles.header}>
                <h2 style={styles.title}>学生信息管理</h2>
                <button style={styles.addBtn} onClick={handleAdd}>+ 新增学生</button>
            </div>

            {/* 数据表格区 */}
            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>学号 (ID)</th>
                    <th style={styles.th}>姓名</th>
                    <th style={styles.th}>专业</th>
                    <th style={styles.th}>班级</th>
                    <th style={styles.th}>操作</th>
                </tr>
                </thead>
                <tbody>
                {students.length > 0 ? students.map(stu => (
                    <tr key={stu.studentId} style={styles.tr}>
                        <td style={styles.td}>{stu.studentId}</td>
                        <td style={styles.td}>{stu.name}</td>
                        <td style={styles.td}>{stu.major}</td>
                        <td style={styles.td}>{stu.className}</td>
                        <td style={styles.td}>
                            {/* 编辑基础信息 */}
                            <button
                                style={{...styles.actionBtn, color: '#1890ff'}}
                                onClick={() => handleEdit(stu)}
                            >
                                编辑
                            </button>

                            {/* 测评管理 (新增) */}
                            <button
                                style={{...styles.actionBtn, color: '#722ed1'}}
                                onClick={() => handleAssessment(stu.studentId)}
                                title="查看或录入学生能力测评"
                            >
                                测评
                            </button>

                            {/* 删除 */}
                            <button
                                style={{...styles.actionBtn, color: '#ff4d4f'}}
                                onClick={() => handleDelete(stu.studentId)}
                            >
                                删除
                            </button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#999', padding: '30px'}}>
                            暂无数据
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 1. 基础信息编辑/新增 模态框 */}
            <DataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSave}
                title={isEdit ? "编辑学生信息" : "新增学生"}
            >
                <div style={styles.formItem}>
                    <label style={styles.label}>学号 (ID) <span style={{color: 'red'}}>*</span></label>
                    <input
                        name="studentId"
                        style={styles.input}
                        value={currentStudent.studentId || ''}
                        onChange={handleChange}
                        disabled={isEdit} // 编辑时ID不可改
                        placeholder="请输入唯一学号"
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>姓名</label>
                    <input
                        name="name"
                        style={styles.input}
                        value={currentStudent.name || ''}
                        onChange={handleChange}
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>专业</label>
                    <input
                        name="major"
                        style={styles.input}
                        value={currentStudent.major || ''}
                        onChange={handleChange}
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>班级</label>
                    <input
                        name="className"
                        style={styles.input}
                        value={currentStudent.className || ''}
                        onChange={handleChange}
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>入学年份</label>
                    <input
                        type="number"
                        name="enrollmentYear"
                        style={styles.input}
                        value={currentStudent.enrollmentYear || ''}
                        onChange={handleChange}
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>联系邮箱</label>
                    <input
                        name="contactEmail"
                        style={styles.input}
                        value={currentStudent.contactEmail || ''}
                        onChange={handleChange}
                    />
                </div>
            </DataModal>

            {/* 2. 测评管理 模态框 (新增) */}
            <AssessmentModal
                isOpen={isAssessModalOpen}
                studentId={selectedStudentId}
                onClose={() => setIsAssessModalOpen(false)}
                onSaveSuccess={() => {
                    // 如果需要在保存测评后刷新列表（例如显示"已测评"标记），可以在此调用 fetchList()
                    // 目前仅关闭弹窗即可
                }}
            />
        </div>
    );
};

export default StudentList;