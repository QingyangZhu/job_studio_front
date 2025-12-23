import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const JobCompetencyGraph = ({ studentId }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 状态管理
    const [jobList, setJobList] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [loading, setLoading] = useState(false);

    // 1. 初始化：获取所有可用岗位
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('/api/jobs/list');
                if (res.data && res.data.length > 0) {
                    setJobList(res.data);
                    // 默认选中第一个岗位
                    setSelectedJob(res.data[0]);
                }
            } catch (err) {
                console.error("获取岗位列表失败", err);
            }
        };
        fetchJobs();
    }, []);

    // 2. 数据加载：当岗位或学生变化时，加载新图谱
    useEffect(() => {
        if (!selectedJob) return;

        const fetchGraph = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/jobs/graph', {
                    params: { jobRole: selectedJob, studentId: studentId }
                });
                // 数据加载完成后再渲染
                renderChart(res.data);
            } catch (err) {
                console.error("图谱数据加载失败", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGraph();
    }, [selectedJob, studentId]);

    // 监听窗口大小变化，调整图表尺寸
    useEffect(() => {
        const handleResize = () => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. 图表渲染
    const renderChart = (data) => {
        if (!chartRef.current) return;

        // 销毁旧实例
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        chartInstance.current = echarts.init(chartRef.current, 'dark');

        const option = {
            backgroundColor: 'transparent',
            // 修改标题位置，避免太靠上被遮挡
            title: {
                text: `${data.jobTitle} 技能图谱`,
                subtext: studentId ? `关联学生ID: ${studentId}` : '标准岗位能力模型',
                left: 'center',
                top: '5%', // 改为百分比，稍微往下一点
                textStyle: { color: '#fff', fontSize: 18 }
            },
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    if (params.dataType === 'edge') {
                        return `关系: ${params.data.value}`;
                    }
                    return `${params.name}<br/>类型: ${data.categories[params.data.category].name}`;
                }
            },
            // 修改图例位置
            legend: {
                bottom: '5%',
                textStyle: { color: '#ccc' },
                data: data.categories.map(c => c.name)
            },
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    // 调整图表在容器中的位置和大小，留出边距
                    top: '15%',
                    bottom: '15%',
                    data: data.nodes,
                    links: data.links,
                    categories: data.categories,
                    roam: true,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                        fontSize: 12,
                        color: '#eee'
                    },
                    lineStyle: {
                        color: 'source',
                        curveness: 0.3,
                        width: 2
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: { width: 5 }
                    },
                    force: {
                        repulsion: 300,
                        edgeLength: [50, 200], // 弹性边长
                        gravity: 0.1
                    },
                    color: ['#ee6666', '#5470c6', '#91cc75', '#fac858', '#73c0de']
                }
            ]
        };

        chartInstance.current.setOption(option);
    };

    // --- 样式修改核心区域 ---
    const styles = {
        // 最外层容器：设置为 Flex 列布局
        container: {
            position: 'relative',
            width: '100%',
            height: '100%', // 严格占满父容器高度
            display: 'flex', // 启用 Flex 布局
            flexDirection: 'column', // 垂直排列子元素
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden' // 关键：强制隐藏溢出内容
        },
        // 顶部控制区（下拉框和加载提示）
        controlsHeader: {
            flexShrink: 0, // 防止被压缩
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
        },
        select: {
            padding: '6px 12px',
            backgroundColor: '#1a1b30',
            color: '#00c5c7',
            border: '1px solid #005f73',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        },
        loadingText: {
            color: '#00c5c7',
            fontSize: '14px'
        },
        // 图表占据剩余空间的容器
        chartWrapper: {
            flex: 1, // 占据剩余所有垂直空间
            width: '100%',
            minHeight: 0, // 关键：允许 Flex 子项在必要时收缩，防止溢出
            position: 'relative' // 用于定位 ECharts canvas
        }
    };

    return (
        <div style={styles.container}>
            {/* 顶部控制区 */}
            <div style={styles.controlsHeader}>
                <select
                    style={styles.select}
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                >
                    {jobList.map(job => (
                        <option key={job} value={job}>{job}</option>
                    ))}
                </select>
                {loading && <span style={styles.loadingText}>加载数据中...</span>}
            </div>

            {/* 图表区域 */}
            <div style={styles.chartWrapper}>
                <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

export default JobCompetencyGraph;