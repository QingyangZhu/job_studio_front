import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';
import axios from 'axios';

// ... (样式部分 styles 和 colors 保持不变，省略以节省空间，请保留原有的样式代码) ...
// === 1. 样式定义 (保持科技风) ===
const colors = {
    bg: '#0a0b1f',
    card: 'rgba(255, 255, 255, 0.05)',
    border: '#005f73',
    accent: '#00c5c7',
    text: '#ffffff',
    textSec: '#aaaaaa',
    danger: '#e74c3c',
    success: '#2ecc71',
    inputBg: '#0f1025'
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: colors.bg, color: colors.text, display: 'flex', fontFamily: 'Arial, sans-serif' },
    sidebar: { width: '260px', borderRight: `1px solid ${colors.border}`, padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box', position: 'relative' },
    userSummary: { textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px dashed ${colors.border}` },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: colors.accent, color: '#000', fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
    navItem: (isActive) => ({ padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: isActive ? '#fff' : colors.textSec, backgroundColor: isActive ? colors.accent + '22' : 'transparent', borderLeft: isActive ? `4px solid ${colors.accent}` : '4px solid transparent', transition: 'all 0.3s', fontSize: '15px' }),
    bottomSection: { marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '12px' },
    actionBtn: (type) => ({ width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s', backgroundColor: 'transparent', border: type === 'return' ? `1px solid ${colors.accent}` : `1px solid ${colors.danger}`, color: type === 'return' ? colors.accent : colors.danger }),
    mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
    sectionTitle: { fontSize: '24px', marginBottom: '20px', color: colors.accent, borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', color: colors.textSec },
    input: { padding: '12px', backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '6px', color: 'white', outline: 'none', fontSize: '15px' },
    select: { padding: '12px', backgroundColor: colors.inputBg, border: `1px solid ${colors.border}`, borderRadius: '6px', color: 'white', outline: 'none', fontSize: '15px', cursor: 'pointer' },
    buttonRow: { marginTop: '30px', display: 'flex', gap: '15px' },
    btnPrimary: { padding: '12px 30px', backgroundColor: colors.accent, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' },
    historyCard: { backgroundColor: colors.card, padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${colors.border}` }
};

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAppStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 表单状态 - 初始值可以设为空，等待 useEffect 填充
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        targetJob: 'Java Backend',
        github: '',
        bio: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // === 核心修改：从后端加载真实用户信息 ===
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await axios.get('/api/users/profile');
                const data = res.data;
                if (data) {
                    // 将后端数据映射到前端表单
                    setFormData({
                        email: data.contactEmail || '',
                        phone: data.phone || '',
                        targetJob: data.targetJob || 'Java Backend',
                        github: data.githubLink || '', // 注意：后端是 githubLink，前端表单用 github
                        bio: data.bio || ''
                    });
                }
            } catch (err) {
                console.error("加载个人资料失败", err);
                // 失败时保持默认空值
            }
        };
        fetchProfile();
    }, [user]);

    // === 处理函数 ===
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.post('/api/users/update', formData);
            setMessage({ type: 'success', text: '个人信息更新成功！AI 推荐模型已重新校准。' });
        } catch (err) {
            setMessage({ type: 'error', text: '更新失败，请重试。' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的新密码不一致！' });
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/users/password', passwordData);
            setMessage({ type: 'success', text: '密码修改成功！请重新登录。' });
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || '原密码错误或系统异常。';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            logout();
            navigate('/login');
        }
    };

    // === 渲染组件 (保持不变) ===
    const renderSidebar = () => (
        <div style={styles.sidebar}>
            <div style={styles.userSummary}>
                <div style={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                <h3 style={{color: 'white', margin: '5px 0'}}>{user?.username}</h3>
                <p style={{color: colors.accent, fontSize: '12px'}}>{user?.role === 'STUDENT' ? '2022级 软件工程' : '管理员'}</p>
            </div>
            <div style={styles.navItem(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>👤 个人与职业</div>
            <div style={styles.navItem(activeTab === 'security')} onClick={() => setActiveTab('security')}>🔒 账号安全</div>
            <div style={styles.navItem(activeTab === 'history')} onClick={() => setActiveTab('history')}>📈 成长档案</div>
            <div style={styles.bottomSection}>
                <button style={styles.actionBtn('return')} onClick={() => navigate('/dashboard')} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.accent; e.currentTarget.style.color = '#000'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.accent; }}>⬅️ 返回数据大屏</button>
                <button style={styles.actionBtn('logout')} onClick={handleLogout} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.danger; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.danger; }}>🚪 退出当前账号</button>
            </div>
        </div>
    );

    const renderProfileForm = () => (
        <form onSubmit={handleProfileUpdate}>
            <h2 style={styles.sectionTitle}>个人与职业偏好设置</h2>
            <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>常用邮箱</label>
                    <input style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>联系电话</label>
                    <input style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>🚩 目标岗位 (用于生成知识图谱)</label>
                    <select style={styles.select} value={formData.targetJob} onChange={e => setFormData({...formData, targetJob: e.target.value})}>
                        <option value="Java Backend">Java 后端开发工程师</option>
                        <option value="Frontend">Web 前端开发工程师</option>
                        <option value="Data Analyst">数据分析师</option>
                        <option value="Algorithm">算法工程师 (AI方向)</option>
                        <option value="Product Manager">互联网产品经理</option>
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>GitHub / 技术博客链接</label>
                    <input style={styles.input} placeholder="https://..." value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})}/>
                </div>
                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>个人简介 (Bio)</label>
                    <textarea style={{...styles.input, height: '80px', resize: 'none'}} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}/>
                </div>
            </div>
            <div style={styles.buttonRow}>
                <button type="submit" style={styles.btnPrimary} disabled={loading}>{loading ? '保存中...' : '保存修改'}</button>
            </div>
        </form>
    );

    const renderSecurityForm = () => (
        <form onSubmit={handlePasswordUpdate}>
            <h2 style={styles.sectionTitle}>修改登录密码</h2>
            <div style={{maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={styles.inputGroup}><label style={styles.label}>当前旧密码</label><input type="password" style={styles.input} value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required/></div>
                <div style={styles.inputGroup}><label style={styles.label}>新密码</label><input type="password" style={styles.input} placeholder="至少 6 位字符" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required/></div>
                <div style={styles.inputGroup}><label style={styles.label}>确认新密码</label><input type="password" style={styles.input} value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required/></div>
                <div style={styles.buttonRow}><button type="submit" style={styles.btnPrimary} disabled={loading}>{loading ? '提交中...' : '确认修改密码'}</button></div>
            </div>
        </form>
    );

    const renderHistory = () => (
        <div>
            <h2 style={styles.sectionTitle}>成长与测评档案</h2>
            <div style={styles.historyCard}>
                <div><div style={{color: 'white', fontWeight: 'bold'}}>2026年春季学期 综合能力测评</div><div style={{color: colors.textSec, fontSize: '12px'}}>测评时间: 2026-02-15</div></div>
                <div><span style={{color: colors.accent, fontWeight: 'bold', marginRight:'10px'}}>已完成</span><button style={{...styles.btnPrimary, padding: '5px 15px', fontSize: '12px'}}>查看报告</button></div>
            </div>
            <div style={{...styles.historyCard, borderLeft: '4px solid #666', opacity: 0.7}}>
                <div><div style={{color: 'white', fontWeight: 'bold'}}>2025年秋季学期 入学测评</div><div style={{color: colors.textSec, fontSize: '12px'}}>测评时间: 2025-09-10</div></div>
                <div><span style={{color: '#aaa', fontWeight: 'bold', marginRight:'10px'}}>已归档</span><button style={{...styles.btnPrimary, padding: '5px 15px', fontSize: '12px', background: '#333', color: '#ccc'}}>查看快照</button></div>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            {renderSidebar()}
            <div style={styles.mainContent}>
                {message.text && (
                    <div style={{padding: '10px 20px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.type === 'error' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)', border: `1px solid ${message.type === 'error' ? colors.danger : colors.success}`, color: message.type === 'error' ? colors.danger : colors.success}}>
                        {message.text}
                    </div>
                )}
                {activeTab === 'profile' && renderProfileForm()}
                {activeTab === 'security' && renderSecurityForm()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </div>
    );
};

export default UserProfile;