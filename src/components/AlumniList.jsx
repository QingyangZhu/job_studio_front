import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 使用 Vite 代理配置的路径，转发到 Spring Boot 后端的 /alumni/all
const API_URL = '/api/alumni/all';

const AlumniList = () => {
    // 【已修正】正确使用 useState 钩子
    const [alumniData, setAlumniData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                // Axios 发送 GET 请求到代理路径 /api/alumni/all
                const response = await axios.get(API_URL);

                if (Array.isArray(response.data)) {
                    setAlumniData(response.data);
                } else {
                    // 如果后端返回的不是数组，设置错误信息
                    setError("后端数据结构不符合预期，返回的不是数组。");
                }

            } catch (err) {
                // 捕获网络错误、超时等信息
                console.error("数据获取失败:", err);
                setError(`连接后端失败。错误信息: ${err.message}。请确保后端服务(http://localhost:8080)正在运行。`);
            } finally {
                setLoading(false);
            }
        };

        fetchAlumni();
    }, []); // 依赖项数组为空，确保只在组件挂载时运行一次

    if (loading) {
        return <div style={styles.message}>数据加载中，请稍候...</div>;
    }

    if (error) {
        return <div style={{...styles.message, color: 'red' }}>错误: {error}</div>;
    }

    if (alumniData.length === 0) {
        return <div style={styles.message}>未找到校友数据。请检查后端数据库或接口。</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>后端数据连接成功 ({alumniData.length} 条记录)</h2>
            <p style={styles.subtitle}>正在展示从 Spring Boot 接口获取的前辈基本信息：</p>

            <ul style={styles.list}>
                {alumniData.map((alumnus) => (
                    // 必须使用唯一的 key 属性 [1]
                    <li key={alumnus.alumniId} style={styles.listItem}>
                        <div style={styles.itemDetail}>
                            <strong>ID:</strong> {alumnus.alumniId} |
                            <strong>姓名:</strong> {alumnus.name}
                        </div>
                        <div style={styles.itemDetail}>
                            <strong>专业:</strong> {alumnus.major} |
                            <strong>毕业年份:</strong> {alumnus.graduationYear}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// 样式定义
const styles = {
    container: {
        padding: '30px',
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    header: {
        color: '#0056b3',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        textAlign: 'center'
    },
    subtitle: {
        color: '#555',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '1.1rem'
    },
    list: {
        listStyleType: 'none',
        padding: 0
    },
    listItem: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }
    },
    itemDetail: {
        flex: 1,
        minWidth: '45%',
        lineHeight: '1.6'
    },
    message: {
        textAlign: 'center',
        padding: '40px',
        color: '#888',
        fontSize: '1.2rem'
    }
};

export default AlumniList;