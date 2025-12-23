import React, { useEffect } from 'react';
import useAppStore from '../store/appStore'; // 1. 引入全局 Store

const AlumniList = () => {
    // 2. 从 Store 获取数据和操作方法
    const {
        alumniList,
        fetchAlumniList,
        selectAlumni,
        selectedAlumniId,
        loading,
        error
    } = useAppStore();

    // 3. 初始化加载 (如果 Store 里还没数据)
    useEffect(() => {
        if (alumniList.length === 0) {
            fetchAlumniList();
        }
    }, [fetchAlumniList, alumniList.length]);

    // 4. 处理点击交互：更新全局选中 ID
    const handleSelect = (id) => {
        selectAlumni(id);
    };

    // 渲染加载状态
    if (loading.alumniList && alumniList.length === 0) {
        return <div style={styles.message}>数据加载中，请稍候...</div>;
    }

    if (error) {
        return <div style={{...styles.message, color: 'red' }}>错误: {error}</div>;
    }

    if (!alumniList || alumniList.length === 0) {
        return <div style={styles.message}>未找到校友数据。</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>校友名录 ({alumniList.length} 人)</h2>
            <p style={styles.subtitle}>点击列表项可将该校友设为“全局分析对象”</p>

            <ul style={styles.list}>
                {alumniList.map((alumnus) => {
                    // 判断是否被选中
                    const isSelected = String(alumnus.alumniId) === String(selectedAlumniId);

                    return (
                        <li
                            key={alumnus.alumniId}
                            style={{
                                ...styles.listItem,
                                // 选中时的高亮样式
                                borderColor: isSelected ? '#00c5c7' : '#ddd',
                                backgroundColor: isSelected ? '#f0f9ff' : '#fff',
                                transform: isSelected ? 'scale(1.02)' : 'none',
                                boxShadow: isSelected ? '0 0 10px rgba(0, 197, 199, 0.4)' : 'none'
                            }}
                            onClick={() => handleSelect(alumnus.alumniId)}
                        >
                            <div style={styles.itemDetail}>
                                <strong>姓名:</strong> {alumnus.name}
                                {isSelected && <span style={styles.badge}>当前选中</span>}
                            </div>
                            <div style={styles.itemDetail}>
                                <strong>岗位:</strong> {alumnus.jobTitle || '未知'} <br/>
                                <span style={{fontSize: '0.85em', color: '#666'}}>
                                    {alumnus.graduationYear}届 | {alumnus.major}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// 样式定义
const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        // 适配大屏风格，或者保持原来的亮色风格皆可，这里做了一点微调使其更紧凑
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '100%',
        overflowY: 'auto' // 允许列表滚动
    },
    header: {
        color: '#0056b3',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        textAlign: 'center',
        margin: '0 0 10px 0',
        fontSize: '1.2rem'
    },
    subtitle: {
        color: '#888',
        marginBottom: '15px',
        textAlign: 'center',
        fontSize: '0.9rem'
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0
    },
    listItem: {
        border: '1px solid #ddd',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer', // 鼠标变手型
        transition: 'all 0.2s',
    },
    itemDetail: {
        flex: 1,
        lineHeight: '1.4',
        color: '#333'
    },
    badge: {
        display: 'inline-block',
        marginLeft: '8px',
        padding: '2px 6px',
        backgroundColor: '#00c5c7',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.7rem'
    },
    message: {
        textAlign: 'center',
        padding: '20px',
        color: '#888'
    }
};

export default AlumniList;