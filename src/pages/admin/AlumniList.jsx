import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataModal from '../../components/admin/DataModal';

const AlumniList = () => {
    const [alumniList, setAlumniList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAlumni, setCurrentAlumni] = useState({});
    const [isEdit, setIsEdit] = useState(false);

    const fetchList = () => {
        axios.get('/api/alumni/all').then(res => setAlumniList(res.data));
    };

    useEffect(() => { fetchList(); }, []);

    const handleAdd = () => {
        setCurrentAlumni({
            alumniId: '', name: '', gender: '男', major: '',
            graduationYear: 2024, contactEmail: ''
        });
        setIsEdit(false);
        setIsModalOpen(true);
    };

    const handleEdit = (alumni) => {
        setCurrentAlumni({ ...alumni });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('确定要删除该校友吗？')) {
            try {
                await axios.delete(`/api/alumni/${id}`);
                fetchList();
            } catch(e) { alert("删除失败"); }
        }
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put('/api/alumni', currentAlumni);
            } else {
                await axios.post('/api/alumni', currentAlumni);
            }
            setIsModalOpen(false);
            fetchList();
        } catch (err) {
            alert('操作失败');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentAlumni(prev => ({ ...prev, [name]: value }));
    };

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
        input: { width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' },
        select: { width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>校友信息管理</h2>
                <button style={styles.addBtn} onClick={handleAdd}>+ 新增校友</button>
            </div>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>姓名</th>
                    <th style={styles.th}>性别</th>
                    <th style={styles.th}>专业</th>
                    <th style={styles.th}>毕业年份</th>
                    <th style={styles.th}>操作</th>
                </tr>
                </thead>
                <tbody>
                {alumniList.map(item => (
                    <tr key={item.alumniId}>
                        <td style={styles.td}>{item.alumniId}</td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={styles.td}>{item.gender}</td>
                        <td style={styles.td}>{item.major}</td>
                        <td style={styles.td}>{item.graduationYear}</td>
                        <td style={styles.td}>
                            <button style={{...styles.actionBtn, color: '#1890ff'}} onClick={() => handleEdit(item)}>编辑</button>
                            <button style={{...styles.actionBtn, color: '#ff4d4f'}} onClick={() => handleDelete(item.alumniId)}>删除</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <DataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSave}
                title={isEdit ? "编辑校友信息" : "新增校友"}
            >
                {/* 如果 ID 是自增的，新增时可以不填；如果是手填，则开放输入 */}
                <div style={styles.formItem}>
                    <label style={styles.label}>校友 ID</label>
                    <input
                        name="alumniId"
                        style={styles.input}
                        value={currentAlumni.alumniId}
                        onChange={handleChange}
                        disabled={isEdit}
                        placeholder="留空则自动生成 (如果数据库支持)"
                    />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>姓名</label>
                    <input name="name" style={styles.input} value={currentAlumni.name} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>性别</label>
                    <select name="gender" style={styles.select} value={currentAlumni.gender} onChange={handleChange}>
                        <option value="男">男</option>
                        <option value="女">女</option>
                    </select>
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>专业</label>
                    <input name="major" style={styles.input} value={currentAlumni.major} onChange={handleChange} />
                </div>
                <div style={styles.formItem}>
                    <label style={styles.label}>毕业年份</label>
                    <input type="number" name="graduationYear" style={styles.input} value={currentAlumni.graduationYear} onChange={handleChange} />
                </div>
            </DataModal>
        </div>
    );
};

export default AlumniList;