import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// 样式常量
const colors = {
    radarLine: 'rgba(0, 197, 199, 0.5)',
    dataFill: 'rgba(74, 144, 226, 0.6)',
    dataBorder: '#4a90e2',
    avgFill: 'rgba(255, 255, 255, 0.2)',
    avgBorder: 'rgba(255, 255, 255, 0.4)',
};

const RadarChart = ({ chartData }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = chartInstance.current || echarts.init(chartRef.current, 'dark');
        } else {
            return;
        }

        const instance = chartInstance.current;

        if (!chartData || !chartData.indicator || chartData.indicator.length === 0 || !chartData.value) {
            instance.clear();
            return;
        }

        const industryAverage = [3.5, 3.8, 3.5, 3.2, 4.0, 4.2, 3.8, 4.0];

        const option = {
            backgroundColor: 'transparent',
            title: {
                text: 'K-S-Q 能力模型',
                left: 'center',
                top: 5,
                textStyle: { color: '#ffffff', fontSize: 16, fontWeight: 'normal' },
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                data: ['学生当前能力', '行业平均水平'],
                left: 'center',
                top: 35,
                textStyle: { color: '#ffffff' }
            },
            radar: {
                indicator: chartData.indicator,
                center: ['50%', '62%'],
                radius: '70%',
                name: {
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 12,
                        backgroundColor: 'rgba(10, 11, 31, 0.5)', // 背景色，防止文字与线条重叠
                        borderRadius: 3,
                        padding: [3, 5]
                    }
                },
                splitLine: {
                    lineStyle: { color: colors.radarLine }
                },
                splitArea: {
                    areaStyle: { color: ['rgba(11, 23, 40, 0.2)', 'rgba(11, 23, 40, 0.5)'] }
                },
                axisLine: {
                    lineStyle: { color: colors.radarLine }
                }
            },
            series: [{
                name: '能力对比',
                type: 'radar',
                data: [{
                    value: chartData.value,
                    name: '学生当前能力',
                    areaStyle: { color: colors.dataFill },
                    lineStyle: { color: colors.dataBorder },
                    itemStyle: { color: colors.dataBorder }
                }, {
                    value: industryAverage,
                    name: '行业平均水平',
                    areaStyle: { color: colors.avgFill },
                    lineStyle: { color: colors.avgBorder },
                    itemStyle: { color: colors.avgBorder }
                }]
            }]
        };

        instance.setOption(option, true);

        const resizeChart = () => {
            instance.resize();
        };
        window.addEventListener('resize', resizeChart);

        return () => {
            instance.dispose();
            chartInstance.current = null;
            window.removeEventListener('resize', resizeChart);
        };
    }, [chartData]);

    return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default RadarChart;