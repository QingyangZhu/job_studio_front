import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { login, loading, error } = useAppStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        const result = await login(username, password);

        if (result.success) {
            const { role, assessmentCompleted } = result.data;

            // === 路由跳转逻辑 ===
            if (role === 'ADMIN') {
                navigate('/dashboard');
            } else if (role === 'STUDENT') {
                // 如果学生还没做测评，这里可以跳转到测评页
                // 目前假设都先去 dashboard，由 dashboard 内部处理提示
                if (assessmentCompleted) {
                    navigate('/dashboard');
                } else {
                    // 如果没做测评，跳转到测评页
                    navigate('/assessment');
                }
            }
        }
    };

    // 样式定义
    const styles = {
        container: {
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at center, #1a1b30 0%, #0a0b1f 100%)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        },
        card: {
            width: '380px',
            padding: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #005f73',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(0, 197, 199, 0.1)',
            backdropFilter: 'blur(10px)'
        },
        title: {
            textAlign: 'center',
            color: '#00c5c7',
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: 'bold'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: '#ccc',
            fontSize: '14px'
        },
        input: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#0f1025',
            border: '1px solid #005f73',
            borderRadius: '6px',
            color: 'white',
            outline: 'none',
            boxSizing: 'border-box',
            fontSize: '16px'
        },
        button: {
            width: '100%',
            padding: '12px',
            marginTop: '10px',
            backgroundColor: '#00c5c7',
            color: '#0a0b1f',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading.auth ? 'not-allowed' : 'pointer',
            opacity: loading.auth ? 0.7 : 1,
            transition: '0.3s'
        },
        error: {
            color: '#ff4d4f',
            fontSize: '14px',
            marginBottom: '15px',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Job Studio 登录</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>账号 / 学号</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="请输入账号"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>密码</label>
                        <input
                            type="password"
                            style={styles.input}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="请输入密码"
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" style={styles.button} disabled={loading.auth}>
                        {loading.auth ? '登录中...' : '登 录'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;