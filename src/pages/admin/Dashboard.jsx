import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        axios.get('/api/admin/dashboard').then(res => {
            setStats(res.data);
        });
    }, []);

    useEffect(() => {
        if (!stats || !chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        // 渲染专业分布柱状图
        const majors = Object.keys(stats.studentMajorDistribution || {});
        const counts = Object.values(stats.studentMajorDistribution || {});

        chart.setOption({
            title: { text: '学生专业分布' },
            tooltip: {},
            xAxis: { data: majors },
            yAxis: {},
            series: [{ type: 'bar', data: counts, itemStyle: { color: '#1890ff' } }]
        });

        return () => chart.dispose();
    }, [stats]);

    if (!stats) return <div>加载中...</div>;

    const cardStyle = { background: 'white', padding: '24px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };

    return (
        <div>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <h3>Total Students</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalStudents}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Total Alumni</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalAlumni}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Assessment Rate</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {(stats.completionRate * 100).toFixed(1)}%
                    </p>
                </div>
            </div>

            <div style={{ ...cardStyle, height: '400px' }} ref={chartRef}></div>
        </div>
    );
};

export default Dashboard;