import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import * as d3 from 'd3';

// --- 地图数据导入与注册 ---
// 1. 只在初始时导入并注册全国地图。省份地图将按需动态加载。
import chinaMapGeoJson from '../assets/geo_maps/china.json';
echarts.registerMap('china', chinaMapGeoJson);

// 2. 从外部工具文件导入中文-拼音映射表
import { PROVINCE_PINYIN_MAP } from '../utils/mapUtils';


// --- 样式与常量定义 ---
const COLORS = {
    background: 'transparent',
    mapArea: '#0b1d31',
    mapBorder: '#00c5c7',
    pieSlice: ['#4a90e2', '#2ecc71', '#f1c40f', '#9b59b6', '#ff7f0e', '#e74c3c'],
    text: '#ffffff',
    loading: '#00c5c7',
    danger: '#e74c3c',
    border: '#005f73',
    header: '#4a90e2',
};

const styles = {
    contentWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    mapCanvas: {
        width: '100%',
        height: '100%',
    },
    loading: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.loading,
        fontSize: '1.2vw'
    },
    backButton: {
        position: 'absolute',
        top: '5px',
        left: '5px',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: COLORS.text,
        border: `1px solid ${COLORS.border}`,
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8vw',
        transition: 'background-color 0.3s'
    }
};

// 定义一个阈值，决定何时使用散点图 vs 饼图
const SCATTER_PIE_THRESHOLD = 5; // 当总人数 > 5 时，才使用饼图

const JobDistributionMap = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [provinceData, setProvinceData] = useState([]);
    const [cityDetailsMap, setCityDetailsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMapName, setCurrentMapName] = useState('china');
    const [currentLevel, setCurrentLevel] = useState('province');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/jobs/distribution');
            setProvinceData(response.data.provinceData || []);
            setCityDetailsMap(response.data.cityDetailsMap || {});
        } catch (err) {
            setError('数据加载失败，请检查后端接口。');
            console.error("Distribution Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleZoomOut = useCallback(() => {
        if (currentLevel === 'city') {
            setCurrentLevel('province');
            setCurrentMapName('china');
        }
    }, [currentLevel]);

    useEffect(() => {
        if (!chartRef.current || (provinceData.length === 0 && !loading)) {
            if (chartInstance.current) chartInstance.current.clear();
            return;
        }

        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current, 'dark');
        }
        const instance = chartInstance.current;

        const dataToRender = currentLevel === 'province'
            ? provinceData
            : (provinceData.find(p => p.name === currentMapName)?.cityNames || [])
                .map(cityName => cityDetailsMap[cityName])
                .filter(Boolean);

        const validDataToRender = dataToRender.filter(item => item && typeof item.coord === 'string' && item.coord.includes(','));

        const scatterData = [];
        const pieData = [];
        validDataToRender.forEach(item => {
            if (item.total <= SCATTER_PIE_THRESHOLD) {
                scatterData.push(item);
            } else {
                pieData.push(item);
            }
        });

        const scatterSeries = {
            type: 'scatter',
            coordinateSystem: 'geo',
            geoIndex: 0,
            zlevel: 3,
            symbol: 'circle',
            data: scatterData.map(item => ({
                name: item.name,
                value: [...(item.coord || '0,0').split(',').map(Number), item.total],
                jobDetails: item.data
            })),
            symbolSize: (value) => Math.sqrt(value[2]) * 10 + 5,
            itemStyle: {
                color: COLORS.mapBorder,
                shadowBlur: 10,
                shadowColor: COLORS.mapBorder,
            },
            emphasis: {
                scale: 1.5,
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(20, 29, 51, 0.9)',
                borderColor: COLORS.mapBorder,
                borderWidth: 1,
                textStyle: { color: '#fff' },
                formatter: (params) => {
                    const { name, value, data } = params;
                    const total = value[2];
                    const jobDetailsHtml = (data.jobDetails || [])
                        .map(job => `<li>${job.name}: ${job.value}人</li>`)
                        .join('');
                    return `
                        <div style="font-size: 14px; font-weight: bold;">${name} (${total}人)</div>
                        <ul style="padding-left: 20px; margin: 5px 0 0;">${jobDetailsHtml}</ul>
                    `;
                }
            }
        };

        const radiusScale = d3.scaleSqrt().domain([SCATTER_PIE_THRESHOLD + 1, d3.max(pieData, d => d.total) || SCATTER_PIE_THRESHOLD + 1]).range([20, 40]);
        const pieSeries = pieData.map((item) => {
            const coordArray = (item.coord || '0,0').split(',').map(Number);
            return {
                type: 'pie', id: item.name, name: item.name, seriesName: item.name, coordinateSystem: 'geo', geoIndex: 0, zlevel: 2, center: coordArray, data: item.data || [],
                radius: `${radiusScale(item.total)}px`,
                emphasis: {
                    focus: 'series',
                    scale: 1.2,
                    label: {
                        show: true,
                        formatter: '{b}\n{d}%',
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    formatter: (params) => {
                        const cityTotal = item.total || 0;
                        const jobName = params.name;
                        const jobValue = params.value;
                        const percentage = cityTotal > 0 ? (jobValue / cityTotal * 100).toFixed(1) : 0;
                        return `<strong>${item.name} (${cityTotal}人)</strong><br/>${jobName}: ${jobValue}人 (${percentage}%)`;
                    }
                },
                label: { show: false }, labelLine: { show: false },
            };
        });

        const option = {
            title: { show: false },
            tooltip: { trigger: 'item' },
            color: COLORS.pieSlice,
            geo: { map: currentMapName, roam: true, selectedMode: 'single', itemStyle: { areaColor: COLORS.mapArea, borderColor: COLORS.mapBorder }, emphasis: { itemStyle: { areaColor: '#2a333d' }, label: { color: COLORS.text }}, label: { show: false } },
            series: [scatterSeries, ...pieSeries]
        };

        instance.setOption(option, true);

        instance.off('click');
        instance.on('click', async (params) => {
            if (currentLevel !== 'province') return;
            let provinceName = '';
            if (params.seriesType === 'map' || params.seriesType === 'pie' || params.seriesType === 'scatter') {
                provinceName = params.name;
            }

            if (!provinceName) return;

            const pinyinFilename = PROVINCE_PINYIN_MAP[provinceName];
            if (!pinyinFilename) {
                console.warn(`在 PROVINCE_PINYIN_MAP 中找不到 "${provinceName}" 的映射。`);
                alert(`暂无 "${provinceName}" 的详细地图数据。`);
                return;
            }

            if (echarts.getMap(provinceName)) {
                setCurrentLevel('city');
                setCurrentMapName(provinceName);
                return;
            }

            try {
                instance.showLoading();
                const mapJson = await import(`../assets/geo_maps/${pinyinFilename}.json`);
                echarts.registerMap(provinceName, mapJson.default);
                setCurrentLevel('city');
                setCurrentMapName(provinceName);
            } catch (e) {
                console.error(`加载地图文件 "${pinyinFilename}.json" 失败: `, e);
                alert(`暂无 "${provinceName}" 的详细地图数据。`);
            } finally {
                instance.hideLoading();
            }
        });

        const resizeChart = () => instance.resize();
        window.addEventListener('resize', resizeChart);
        return () => window.removeEventListener('resize', resizeChart);
    }, [provinceData, cityDetailsMap, currentMapName, currentLevel, loading, handleZoomOut]);

    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    const renderContent = () => {
        if (loading) return <div style={styles.loading}>数据加载中...</div>;
        if (error) return <div style={{...styles.loading, color: COLORS.danger}}>{error}</div>;
        return <div ref={chartRef} style={styles.mapCanvas} />;
    };

    return (
        <div style={styles.contentWrapper}>
            {currentLevel === 'city' && (
                <button
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor='rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor='rgba(255, 255, 255, 0.1)'}
                    onClick={handleZoomOut} style={styles.backButton}>
                    ← 返回全国
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default JobDistributionMap;