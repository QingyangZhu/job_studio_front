import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// 样式常量，确保与大屏主题一致
const colors = {
    radarLine: 'rgba(0, 197, 199, 0.5)', // 雷达图网格线颜色
    indicatorText: '#ffffff', // 指标文字颜色
    dataFill: 'rgba(74, 144, 226, 0.6)', // 数据填充颜色 (Header Blue)
    dataBorder: '#4a90e2', // 数据边框颜色
    avgFill: 'rgba(255, 255, 255, 0.2)', // 平均值填充颜色 (浅色透明)
    avgBorder: 'rgba(255, 255, 255, 0.4)', // 平均值边框颜色
    text: '#ffffff',
    accent: '#00c5c7',
};

/**
 * RadarChart 组件：用于渲染学生的能力雷达图
 * @param {object} chartData - 包含指标 (indicator) 和数值 (value) 的数据
 * @param {Array<object>} chartData.indicator - e.g., [{ name: '编程能力', max: 5 }, ...]
 * @param {Array<number>} chartData.value - e.g., [4, 5, 3.5, ...]
 */
const RadarChart = ({ chartData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null); // 用于存储 ECharts 实例

    useEffect(() => {
        if (chartRef.current) {
            // 使用 'dark' 主题初始化实例
            chartInstance.current = chartInstance.current || echarts.init(chartRef.current, 'dark');
        } else {
            return;
        }

        const instance = chartInstance.current;

        // **[修正 1]** 使用正确的逻辑或 ||，并增加更严谨的判断
        if (!chartData || !chartData.indicator || chartData.indicator.length === 0 || !chartData.value) {
            instance.clear(); // 如果数据无效，清空图表
            return;
        }

        // 假设行业平均水平 (用于对比)
        const industryAverage = [3.5, 3.8, 3.5, 3.2, 4.0, 4.2, 3.8, 4.0];

        const option = {
            title: {
                text: 'K-S-Q 综合能力评测',
                subtext: '（与行业平均水平对比）',
                left: 'center',
                top: 10,
                textStyle: { color: colors.text, fontSize: 16 },
                subtextStyle: { color: '#aaa', fontSize: 12 }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                data: ['学生当前能力', '行业平均水平'],
                left: 'center',
                top: 50,
                textStyle: { color: colors.text }
            },
            radar: {
                indicator: chartData.indicator,
                center: ['50%', '65%'],
                radius: '60%', // 使用百分比更好地适应容器
                name: {
                    textStyle: {
                        color: colors.indicatorText,
                        fontSize: 12 // 适当调大字体
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: colors.radarLine,
                    }
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(11, 23, 40, 0.2)', 'rgba(11, 23, 40, 0.5)'],
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: colors.radarLine
                    }
                }
            },
            // **[修正 2]** 补全了 series 属性，这是图表数据的核心
            series: [{
                name: '能力对比',
                type: 'radar',
                data: [{
                    value: chartData.value,
                    name: '学生当前能力',
                    areaStyle: {
                        color: colors.dataFill
                    },
                    lineStyle: {
                        color: colors.dataBorder
                    },
                    itemStyle: {
                        color: colors.dataBorder
                    }
                }, {
                    value: industryAverage,
                    name: '行业平均水平',
                    areaStyle: {
                        color: colors.avgFill
                    },
                    lineStyle: {
                        color: colors.avgBorder
                    },
                    itemStyle: {
                        color: colors.avgBorder
                    }
                }]
            }]
        };

        // 绘制图表
        instance.setOption(option, true);

        // 响应窗口大小变化
        const resizeChart = () => {
            instance.resize();
        };
        window.addEventListener('resize', resizeChart);

        // 销毁函数：在组件卸载时销毁图表实例，释放内存
        return () => {
            instance.dispose();
            chartInstance.current = null;
            window.removeEventListener('resize', resizeChart);
        };
        // **[修正 3]** 使用正确的 useEffect 依赖项数组
    }, [chartData]);

    return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default RadarChart;