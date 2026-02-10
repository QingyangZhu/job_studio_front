import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

// 定义样式
const styles = {
    container: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0b1f', // 保持与大屏一致的深蓝背景
        color: 'white',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid #005f73',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 0 20px rgba(0, 197, 199, 0.1)',
        backdropFilter: 'blur(10px)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#00c5c7',
        borderBottom: '1px solid #005f73',
        paddingBottom: '15px'
    },
    infoRow: {
        marginBottom: '15px',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'space-between'
    },
    label: {
        color: '#aaa'
    },
    value: {
        fontWeight: 'bold',
        color: 'white'
    },
    divider: {
        height: '1px',
        backgroundColor: '#333',
        margin: '20px 0'
    },
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px'
    },
    backButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: 'transparent',
        border: '1px solid #00c5c7',
        color: '#00c5c7',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s'
    },
    logoutButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#e74c3c',
        border: 'none',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s'
    }
};

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAppStore();

    const handleLogout = () => {
        // 1. 清除 Store 和 LocalStorage
        logout();
        // 2. 跳转回登录页
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>个人中心</h2>

                {/* 用户基本信息展示区 */}
                <div style={styles.infoRow}>
                    <span style={styles.label}>当前用户:</span>
                    <span style={styles.value}>{user?.username || '未登录'}</span>
                </div>

                <div style={styles.infoRow}>
                    <span style={styles.label}>用户角色:</span>
                    <span style={styles.value}>
                        {user?.role === 'STUDENT' ? '学生 (Student)' :
                            user?.role === 'ADMIN' ? '管理员 (Admin)' : '未知'}
                    </span>
                </div>

                {user?.role === 'STUDENT' && (
                    <div style={styles.infoRow}>
                        <span style={styles.label}>测评状态:</span>
                        <span style={{
                            ...styles.value,
                            color: user?.assessmentCompleted ? '#2ecc71' : '#e74c3c'
                        }}>
                            {user?.assessmentCompleted ? '已完成' : '未完成'}
                        </span>
                    </div>
                )}

                <div style={styles.divider}></div>

                <div style={{textAlign: 'center', color: '#666', fontSize: '14px'}}>
                    <p>更多功能（修改密码、简历编辑）开发中...</p>
                </div>

                {/* 操作按钮区 */}
                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={styles.backButton}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,197,199,0.1)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        返回大屏
                    </button>

                    <button
                        onClick={handleLogout}
                        style={styles.logoutButton}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    >
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;