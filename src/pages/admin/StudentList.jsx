import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataModal from '../../components/admin/DataModal';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({}); // 当前编辑的对象
    const [isEdit, setIsEdit] = useState(false); // 标记是新增还是编辑

    // 获取列表
    const fetchList = () => {
        axios.get('/api/students/list').then(res => setStudents(res.data));
    };

    useEffect(() => { fetchList(); }, []);

    // 打开新增窗口
    const handleAdd = () => {
        setCurrentStudent({ studentId: '', name: '', major: '', className: '', enrollmentYear: 2022, contactEmail: '' });
        setIsEdit(false);
        setIsModalOpen(true);
    };

    // 打开编辑窗口
    const handleEdit = (student) => {
        setCurrentStudent({ ...student });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    // 删除
    const handleDelete = async (id) => {
        if (window.confirm('确定要删除该学生吗？')) {
            await axios.delete(`/api/students/${id}`);
            fetchList();
        }
    };

    // 保存 (新增或更新)
    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put('/api/students', currentStudent);
            } else {
                await axios.post('/api/students', currentStudent);
            }
            setIsModalOpen(false);
            fetchList(); // 刷新列表
        } catch (err) {
            alert('操作失败，请检查输入或ID冲突');
        }
    };

    // 表单输入处理
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    // 样式
    const styles = {
        container: { background: 'white', padding: '24px', borderRadius: '8px' },
        header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
        addBtn: { padding: '8px 16px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
        td: { padding: '12px', borderBottom: '1px solid #f0f0f0' },
        actionBtn: { marginRight: '8px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
        formItem: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>学生信息管理</h2>
                <button style={styles.addBtn} onClick={handleAdd}>+ 新增学生</button>
            </div>

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
                {students.map(stu => (
                    <tr key={stu.studentId}>
                        <td style={styles.td}>{stu.studentId}</td>
                        <td style={styles.td}>{stu.name}</td>
                        <td style={styles.td}>{stu.major}</td>
                        <td style={styles.td}>{stu.className}</td>
                        <td style={styles.td}>
                            <button style={{...styles.actionBtn, color: '#1890ff'}} onClick={() => handleEdit(stu)}>编辑</button>
                            <button style={{...styles.actionBtn, color: '#ff4d4f'}} onClick={() => handleDelete(stu.studentId)}>删除</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 弹窗表单 */}
            <DataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSave}
                title={isEdit ? "编辑学生信息" : "新增学生"}
            >
                <div style={styles.formItem}>
                    <label style={styles.label}>学号 (ID) *</label>
                    <input
                        name="studentId"
                        style={styles.input}
                        value={currentStudent.studentId}
                        onChange={handleChange}
                        disabled={isEdit} // 编辑时不可修改ID
                        placeholder="请输入学号"
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>姓名</label>
                    <input name="name" style={styles.input} value={currentStudent.name} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>专业</label>
                    <input name="major" style={styles.input} value={currentStudent.major} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>班级</label>
                    <input name="className" style={styles.input} value={currentStudent.className} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>入学年份</label>
                    <input type="number" name="enrollmentYear" style={styles.input} value={currentStudent.enrollmentYear} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>邮箱</label>
                    <input name="contactEmail" style={styles.input} value={currentStudent.contactEmail} onChange={handleChange} />
                </div>
            </DataModal>
        </div>
    );
};

export default StudentList;