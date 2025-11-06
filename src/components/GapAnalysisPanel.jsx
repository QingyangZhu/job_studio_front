import React from 'react';
import useAppStore from '../store/appStore';

const GapAnalysisPanel = () => {
    const { graphData, loading, error, selectedStudentId, selectedAlumniId } = useAppStore();

    const renderContent = () => {
        if (loading.graph) {
            return "正在生成能力差距分析报告...";
        }

        if (error) {
            return <p style={{ color: '#ff6b6b' }}>{error}</p>;
        }

        // 后端 /api/jobs/graph 响应中应包含 recommendPath 字段
        if (graphData && graphData.recommendPath) {
            return (
                <div>
                    <h5>智能分析与建议：</h5>
                    <p>{graphData.recommendPath}</p>
                </div>
            );
        }

        if (graphData && !graphData.recommendPath) {
            return <p>图谱已加载，但后端未提供推荐路径。</p>;
        }

        if (!selectedStudentId) {
            return "请在左侧选择一名学生。";
        }

        if (!selectedAlumniId) {
            return "请在右侧选择一位学长作为目标。";
        }

        return "准备就绪，待图谱加载...";
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            {renderContent()}
        </div>
    );
};

export default GapAnalysisPanel;