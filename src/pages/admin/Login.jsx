import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 调用之前在 AdminController 中定义的接口
            const res = await axios.post('/api/admin/login', credentials);

            if (res.status === 200 && res.data.token) {
                // 1. 存储 Token (用于后续 AdminLayout 的鉴权)
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', res.data.username);

                // 2. 跳转到仪表盘
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError('登录失败：用户名或密码错误，请重试。');
        } finally {
            setLoading(false);
        }
    };

    // 简单的内联样式对象
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0f172a', // 深色背景，与大屏风格保持一致
            color: '#e2e8f0'
        },
        card: {
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
        },
        title: {
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#38bdf8' // 亮蓝色强调色
        },
        inputGroup: {
            marginBottom: '20px',
            textAlign: 'left'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#94a3b8'
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box' // 确保 padding 不会撑破宽度
        },
        button: {
            width: '100%',
            padding: '12px',
            marginTop: '10px',
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background-color 0.2s'
        },
        errorMsg: {
            color: '#ef4444',
            marginBottom: '20px',
            fontSize: '14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '10px',
            borderRadius: '4px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Job Studio 管理后台</h1>

                {error && <div style={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>管理员账号</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>密码</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? '登录中...' : '登 录'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;