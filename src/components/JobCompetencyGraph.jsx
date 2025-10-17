import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

// 样式和颜色常量，确保与大屏主题一致
const colors = {
    header: '#4a90e2',      // 蓝色 (默认节点/辅助)
    accent: '#00c5c7',       // 青色 (次要强调)
    text: '#ffffff',         // 白色
    acquired: '#27ae60',     // 绿色 (已掌握)
    gap: '#e74c3c',          // 红色 (缺失/待补)
    recommended: '#f1c40f',  // 黄色 (推荐路径高亮)
    jobRole: '#3498db',      // 蓝色 (岗位中心)
    link: 'rgba(255, 255, 255, 0.3)', // 默认连接线
    recommendedLink: '#f1c40f'
};

/**
 * JobCompetencyGraph 组件：渲染岗位能力知识图谱力导向图
 */
const JobCompetencyGraph = ({ jobRole, studentId }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    // [修正 1] 使用完整的 useState 声明
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 数据获取函数
    const fetchGraphData = useCallback(async () => {
        // [修正 2] 使用正确的逻辑或操作符 ||
        const currentJobRole = jobRole || "前端开发工程师";
        const currentStudentId = studentId || 22010101;

        setLoading(true);
        setError(null);
        setGraphData(null);

        try {
            const response = await axios.get(`/api/jobs/graph`, {
                params: { jobRole: currentJobRole, studentId: currentStudentId }
            });
            setGraphData(response.data);
        } catch (err) {
            setError(`无法加载岗位图谱数据。请检查后端 /api/v1/jobs/graph 接口。`);
            console.error("KG Fetch Error:", err);
        } finally {
            setLoading(false);
        }
        // [修正 3] 添加正确的 useCallback 依赖项
    }, [jobRole, studentId]);

    useEffect(() => {
        fetchGraphData();
        // [修正 3] 添加正确的 useEffect 依赖项
    }, [fetchGraphData]);


    // 2. ECharts 渲染逻辑
    useEffect(() => {
        if (!chartRef.current || !graphData) {
            // 如果 graphData 为空，也确保清空画布
            if (chartInstance.current) {
                chartInstance.current.clear();
            }
            return;
        }

        // 确保只初始化一次 ECharts 实例
        chartInstance.current = chartInstance.current || echarts.init(chartRef.current, 'dark');
        const instance = chartInstance.current;

        const formattedNodes = graphData.nodes.map(node => ({
            ...node,
            itemStyle: {
                color: node.id === '101' ? colors.jobRole :
                    node.isUserAcquired ? colors.acquired :
                        node.isGap ? colors.gap :
                            colors.header,
            },
            fixed: node.nodeType === 'JobRole',
            x: node.nodeType === 'JobRole' ? instance.getWidth() / 2 : null,
            y: node.nodeType === 'JobRole' ? instance.getHeight() / 2 : null,
        }));

        const formattedLinks = graphData.links.map(link => ({
            ...link,
            lineStyle: {
                width: link.isRecommendedPath ? 4 : 1,
                color: link.isRecommendedPath ? colors.recommendedLink : colors.link,
                type: link.isRecommendedPath ? 'solid' : 'dotted',
                shadowBlur: link.isRecommendedPath ? 10 : 0,
                shadowColor: link.isRecommendedPath ? colors.recommendedLink : 'transparent'
            },
            symbol: ['none', 'arrow'],
            // [修正 4] 补全三元运算符
            symbolSize: link.isRecommendedPath ? 12 : 8,
            label: {
                show: link.isRecommendedPath,
                formatter: `{b}\n(成本: ${link.weight})`,
                color: colors.recommendedLink
            }
        }));

        const option = {
            backgroundColor: 'transparent', // 确保背景透明
            title: {
                text: `${graphData.jobTitle} 岗位能力图谱`,
                subtext: `学生ID: ${studentId || 'N/A'}`,
                left: 'center',
                top: 10,
                textStyle: { color: colors.text, fontSize: 18 }
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'node') {
                        const acquiredStatus = params.data.isUserAcquired ? '✅ 已掌握' : params.data.isGap ? '❌ 缺失 (待学习)' : '要求';
                        return `<strong>${params.name}</strong><br/>类型: ${params.data.category}<br/>状态: ${acquiredStatus}`;
                    }
                    if (params.dataType === 'edge') {
                        return `${params.name}<br/>关系: <strong>${params.data.name}</strong><br/>学习成本: ${params.data.weight}`;
                    }
                    return params.name;
                }
            },
            legend: {
                data: graphData.categories.map(c => c.name),
                bottom: 10,
                textStyle: { color: colors.text }
            },
            series: [{
                type: 'graph',
                layout: 'force',
                roam: true,
                draggable: true,
                force: {
                    repulsion: 150,
                    edgeLength: 120,
                    gravity: 0.1,
                    layoutAnimation: true
                },
                data: formattedNodes,
                links: formattedLinks,
                categories: graphData.categories,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    color: colors.text,
                    fontSize: 10
                },
                emphasis: {
                    focus: 'adjacency',
                    label: {
                        show: true
                    }
                }
            }]
        };

        instance.setOption(option, true);

        const resizeChart = () => instance.resize();
        window.addEventListener('resize', resizeChart);

        return () => {
            window.removeEventListener('resize', resizeChart);
            // 不在数据变化时销毁实例，只在组件卸载时销毁
            // instance.dispose();
        };
        // [修正 3] 添加正确的 useEffect 依赖项
    }, [graphData, studentId]);

    // 组件卸载时清理 ECharts 实例
    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        }
    }, []);


    const loadingStyle = {
        color: colors.accent,
        textAlign: 'center',
        padding: '20px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    if (error) return <div style={{...loadingStyle, color: colors.danger}}>{error}</div>;
    if (loading) return <div style={loadingStyle}>知识图谱与路径计算中...</div>;

    return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default JobCompetencyGraph;