import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import useAppStore from '../store/appStore'; // 1. 引入 Store

// --- 样式与常量定义 (保持不变) ---
const COLORS = {
    background: 'transparent',
    line: '#00c5c7',
    axis: 'rgba(255, 255, 255, 0.7)',
    text: '#ffffff',
    tenure: 'rgba(74, 144, 226, 0.2)',
    danger: '#e74c3c',
    accent: '#00c5c7',
    header: '#4a90e2',
    border: '#005f73',
    inputBg: '#1a1b30',
    milestone: {
        '智育': '#f1c40f',
        '德育': '#9b59b6',
        '劳育': '#2ecc71',
        '其他': '#bdc3c7'
    }
};

const MARGIN = { top: 20, right: 40, bottom: 50, left: 60 };
const SYMBOL_MAP = {
    '智育': d3.symbolDiamond,
    '德育': d3.symbolSquare,
    '劳育': d3.symbolTriangle,
    '其他': d3.symbolCircle
};

const styles = {
    contentWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    selectorGroup: {
        marginBottom: '15px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexShrink: 0,
    },
    select: {
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: COLORS.inputBg,
        color: COLORS.text,
        border: `1px solid ${COLORS.border}`,
        flexGrow: 1
    },
    label: {
        minWidth: '80px',
        fontSize: '0.9vw',
        color: COLORS.text
    },
    chartContainer: {
        flexGrow: 1,
        width: '100%',
        height: '100%'
    },
    loading: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.accent,
        fontSize: '1.2vw'
    }
};

// --- 组件实现 ---
const AlumniGrowthTimeline = () => {
    // 2. 从 Store 获取状态和 Actions
    const {
        alumniList,
        fetchAlumniList,
        selectAlumni,
        selectedAlumniId,
        loading: appLoading
    } = useAppStore();

    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // 本地状态仅用于处理时间轴的具体数据加载
    const [timelineData, setTimelineData] = useState(null);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [error, setError] = useState(null);

    // 3. 初始化加载校友列表
    useEffect(() => {
        fetchAlumniList();
    }, [fetchAlumniList]);

    // 4. 当全局选中的校友ID变化时，加载其时间轴数据
    useEffect(() => {
        const fetchTimelineData = async () => {
            if (!selectedAlumniId) {
                setTimelineData(null);
                return;
            }
            setTimelineLoading(true);
            setError(null);
            setTimelineData(null);
            try {
                const response = await axios.get(`/api/alumni/${selectedAlumniId}/timeline`);
                setTimelineData(response.data);
            } catch (err) {
                setError(`无法加载校友ID ${selectedAlumniId} 的时间轴数据。`);
                console.error("Timeline Fetch Error:", err);
            } finally {
                setTimelineLoading(false);
            }
        };
        fetchTimelineData();
    }, [selectedAlumniId]);

    // 5. D3 绘图逻辑 (保持不变，依赖 timelineData)
    useEffect(() => {
        if (!timelineData || !containerRef.current || !svgRef.current) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        };

        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
        const width = containerWidth - MARGIN.left - MARGIN.right;
        const height = containerHeight - MARGIN.top - MARGIN.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const chart = svg.append("g").attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const parseDate = d3.timeParse("%Y-%m-%d");
        const gpaData = timelineData.gpaSeries.map(d => ({ date: parseDate(d.date), gpa: d.gpa })).filter(d => d.date && d.gpa != null).sort((a, b) => a.date - b.date);
        const durationTenures = timelineData.durationTenures.map(d => ({ ...d, startDate: parseDate(d.startDate), endDate: parseDate(d.endDate) })).filter(d => d.startDate && d.endDate);
        const milestones = timelineData.majorMilestones.map(d => ({ ...d, date: parseDate(d.date) })).filter(d => d.date != null);

        const allDates = [...gpaData.map(d => d.date), ...durationTenures.map(d => d.startDate), ...durationTenures.map(d => d.endDate), ...milestones.map(d => d.date)];
        const dateExtent = d3.extent(allDates);

        if (!dateExtent[0]) return;

        const xDomain = [d3.timeMonth.offset(dateExtent[0], -1), d3.timeMonth.offset(dateExtent[1], 1)];
        const xScale = d3.scaleTime().domain(xDomain).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 4.0]).range([height, 0]).nice();

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m")).tickSize(0).tickPadding(15);
        chart.append("g").attr("transform", `translate(0, ${height})`).call(xAxis).call(g => g.select(".domain").remove()).selectAll("text").style("fill", COLORS.axis);

        const yAxis = d3.axisLeft(yScale).tickValues([1.0, 2.0, 3.0, 4.0]).tickFormat(d => d.toFixed(1)).tickSize(-width);
        chart.append("g").call(yAxis).call(g => g.select(".domain").remove()).selectAll(".tick line").attr("stroke", COLORS.axis).attr("stroke-opacity", 0.2);
        chart.selectAll(".tick text").style("fill", COLORS.axis);

        chart.selectAll(".tenure-rect").data(durationTenures).enter().append("rect").attr("class", "tenure-rect").attr("x", d => xScale(d.startDate)).attr("y", 0).attr("width", d => Math.max(0, xScale(d.endDate) - xScale(d.startDate))).attr("height", height).style("fill", COLORS.tenure);

        if (gpaData.length > 0) {
            const gpaLine = d3.line().x(d => xScale(d.date)).y(d => yScale(d.gpa)).curve(d3.curveStepAfter);
            chart.append("path").datum(gpaData).attr("fill", "none").attr("stroke", COLORS.line).attr("stroke-width", 2.5).attr("d", gpaLine);
        }

        const milestoneGroup = chart.selectAll(".milestone-marker").data(milestones).enter().append("g").attr("class", "milestone-marker").attr("transform", d => `translate(${xScale(d.date)}, ${yScale(3.8)})`);
        milestoneGroup.append("path").attr("d", d3.symbol().type(d => SYMBOL_MAP[d.pillar] || d3.symbolCircle).size(120)).style("fill", d => COLORS.milestone[d.pillar] || COLORS.milestone['其他']).style("stroke", COLORS.background).style("stroke-width", 2);
        milestoneGroup.append("title").text(d => `[${d.pillar}] ${d.title}\n日期: ${d3.timeFormat("%Y-%m-%d")(d.date)}`);
    }, [timelineData]);

    const renderContent = () => {
        if (appLoading.alumniList || timelineLoading) {
            return <div style={styles.loading}>数据加载中...</div>;
        }
        if (error) {
            return <div style={{...styles.loading, color: COLORS.danger}}>{error}</div>;
        }
        if (!selectedAlumniId) {
            return <div style={styles.loading}>请选择一位校友查看成长轨迹。</div>;
        }
        if (timelineData) {
            return (
                <div ref={containerRef} style={styles.chartContainer}>
                    <svg ref={svgRef} width="100%" height="100%"></svg>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.contentWrapper}>
            <div style={styles.selectorGroup}>
                <label style={styles.label}>选择校友:</label>
                <select
                    style={styles.select}
                    value={selectedAlumniId || ''}
                    // 6. 触发全局 Action
                    onChange={(e) => selectAlumni(e.target.value)}
                    disabled={appLoading.alumniList}
                >
                    <option value="">-- 请选择一位校友 --</option>
                    {(alumniList || []).map(alumnus => (
                        // 注意：这里兼容 id 或 alumniId 字段
                        <option key={alumnus.alumniId || alumnus.id} value={alumnus.alumniId || alumnus.id}>
                            {alumnus.name} ({alumnus.graduationYear}届 - {alumnus.jobTitle || '校友'})
                        </option>
                    ))}
                </select>
            </div>
            {renderContent()}
        </div>
    );
};

export default AlumniGrowthTimeline;