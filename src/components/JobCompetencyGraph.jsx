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
    recommendedLink: '#f1c40f',
    danger: '#e74c3c'       // 错误提示颜色
};

/**
 * JobCompetencyGraph 组件：渲染岗位能力知识图谱力导向图
 */
const JobCompetencyGraph = ({ jobRole, studentId }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 数据获取函数
    const fetchGraphData = useCallback(async () => {
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
            setError(`无法加载岗位图谱数据。请检查后端 /api/jobs/graph 接口。`);
            console.error("KG Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [jobRole, studentId]);

    useEffect(() => {
        fetchGraphData();
    }, [fetchGraphData]);


    // 2. ECharts 渲染逻辑
    useEffect(() => {
        if (!chartRef.current || !graphData) {
            if (chartInstance.current) {
                chartInstance.current.clear();
            }
            return;
        }

        chartInstance.current = chartInstance.current || echarts.init(chartRef.current, 'dark');
        const instance = chartInstance.current;

        // 【核心修正 ①】: 创建从后端 category 字符串到前端显示名称的映射
        const categoryNameMapping = {
            'JobRole': '岗位角色',
            'Threshold': '门槛技能',
            'Differentiating': '核心技能',
            'SoftSkill': '软技能',
            'Book/Doc': '学习资源',
            'HardSkill': '专业指标'
        };

        // 【核心修正 ②】: 创建从前端显示名称到其在 categories 数组中索引的映射
        const categoryIndexMap = new Map(
            graphData.categories.map((c, i) => [c.name, i])
        );

        // 【核心修正 ③】: 在格式化节点时，将字符串 category 转换为数字索引
        const formattedNodes = graphData.nodes.map(node => {
            const mappedCategoryName = categoryNameMapping[node.category] || node.category;
            const categoryIndex = categoryIndexMap.get(mappedCategoryName);

            return {
                ...node,
                category: categoryIndex, // 使用数字索引代替字符串
                itemStyle: {
                    color: node.category === 'JobRole' ? colors.jobRole :
                        node.isUserAcquired ? colors.acquired :
                            node.isGap ? colors.gap :
                                colors.header,
                },
                fixed: node.category === 'JobRole', // 使用 category 字段判断
                x: node.category === 'JobRole' ? instance.getWidth() / 2 : null,
                y: node.category === 'JobRole' ? instance.getHeight() / 2 : null,
            };
        });

        const formattedLinks = graphData.links.map(link => ({
            ...link,
            lineStyle: {
                width: link.isRecommendedPath ? 4 : 1.5,
                color: link.isRecommendedPath ? colors.recommendedLink : colors.link,
                type: link.isRecommendedPath ? 'solid' : 'dotted',
                curveness: 0.05 // 给线条一点弧度，避免重叠
            },
            symbol: ['none', 'arrow'],
            symbolSize: link.isRecommendedPath ? 10 : 8,
            label: {
                show: link.isRecommendedPath,
                formatter: `{b}`,
                color: colors.recommendedLink,
                fontSize: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: [2, 4],
                borderRadius: 2
            }
        }));

        const option = {
            backgroundColor: 'transparent',
            title: {
                text: `${graphData.jobTitle} 岗位能力图谱`,
                subtext: `学生ID: ${studentId || 'N/A'}`,
                left: 'center',
                top: 10,
                textStyle: { color: colors.text, fontSize: 18, fontWeight: 'bold' }
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'node') {
                        const acquiredStatus = params.data.isUserAcquired ? '✅ 已掌握' : params.data.isGap ? '❌ 缺失 (待学习)' : '要求';
                        const categoryName = graphData.categories[params.data.category]?.name || '未知分类';
                        return `<strong>${params.name}</strong><br/>类型: ${categoryName}<br/>状态: ${acquiredStatus}`;
                    }
                    if (params.dataType === 'edge') {
                        return `关系: <strong>${params.data.name}</strong><br/>学习成本: ${params.data.weight}`;
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
                    repulsion: 200,
                    edgeLength: [100, 150],
                    gravity: 0.1,
                    layoutAnimation: true
                },
                data: formattedNodes,
                links: formattedLinks,
                categories: graphData.categories, // 这里保持不变，作为图例的定义
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    color: colors.text,
                    fontSize: 11
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 4
                    }
                }
            }]
        };

        instance.setOption(option, true);

        const resizeChart = () => instance.resize();
        window.addEventListener('resize', resizeChart);

        return () => {
            window.removeEventListener('resize', resizeChart);
        };
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
        justifyContent: 'center',
        fontSize: '1.2vw'
    };

    if (error) return <div style={{...loadingStyle, color: colors.danger}}>{error}</div>;
    if (loading) return <div style={loadingStyle}>知识图谱与路径计算中...</div>;

    return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default JobCompetencyGraph;