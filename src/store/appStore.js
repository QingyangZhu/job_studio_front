// src/store/appStore.js
import { create } from 'zustand';
import axios from 'axios';

const useAppStore = create((set) => ({
    // 状态变量
    selectedStudentId: null,
    selectedAlumniId: null,
    studentData: null, // 存储当前学生的能力数据
    alumniJobData: null, // 存储校友的岗位能力数据
    gapAnalysisResult: '', // 存储能力差距分析结果

    // Actions
    setSelectedStudentId: (studentId) => {
        set({ selectedStudentId: studentId, gapAnalysisResult: '' });
        // 异步获取学生数据
        if (studentId) {
            axios.get(`/api/students/${studentId}/abilities`)
                .then(response => {
                    set({ studentData: response.data });
                })
                .catch(error => console.error("获取学生数据失败:", error));
        } else {
            set({ studentData: null });
        }
    },

    setSelectedAlumniId: (alumniId) => {
        set({ selectedAlumniId: alumniId, gapAnalysisResult: '' });
        // 异步获取校友岗位数据
        if (alumniId) {
            axios.get(`/api/alumni/${alumniId}/job-competency`)
                .then(response => {
                    set({ alumniJobData: response.data });
                })
                .catch(error => console.error("获取校友岗位数据失败:", error));
        } else {
            set({ alumniJobData: null });
        }
    },

    // 进行能力差距分析的 Action
    analyzeCompetencyGap: async () => {
        const { selectedStudentId, selectedAlumniId } = useAppStore.getState();
        if (selectedStudentId && selectedAlumniId) {
            try {
                set({ gapAnalysisResult: '正在分析中...' });
                const response = await axios.post('/api/analysis/competency-gap', {
                    studentId: selectedStudentId,
                    alumniId: selectedAlumniId,
                });
                set({ gapAnalysisResult: response.data.analysis });
            } catch (error) {
                console.error("能力差距分析失败:", error);
                set({ gapAnalysisResult: '分析失败，请稍后再试。' });
            }
        }
    },
}));

export default useAppStore;