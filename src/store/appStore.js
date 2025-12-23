import { create } from 'zustand';
import axios from 'axios';

// 辅助函数：处理 API 响应
const handleResponse = (response) => {
    if (response.data) {
        return response.data.data || response.data;
    }
    return response.data;
};

const useAppStore = create((set, get) => ({
    // ================== 状态 (State) ==================

    // 1. 核心选择
    selectedStudentId: null,
    selectedAlumniId: null,
    selectedJobRole: null, // 选中学长的岗位名称

    // 2. 列表数据
    studentList: [],
    alumniList: [],

    // 3. 联动数据
    studentProfile: null,
    graphData: null,
    mapData: null,
    chatMessages: [],

    // 4. 加载和错误状态
    loading: {
        studentList: false,
        alumniList: false,
        studentProfile: false,
        graph: false,
        map: false,
        chat: false,
    },
    error: null,

    // ================== 操作 (Actions) ==================

    // --- 1. 初始化加载 ---
    fetchStudentList: async () => {
        set(state => ({ loading: { ...state.loading, studentList: true } }));
        try {
            const response = await axios.get('/api/students/list');
            set({ studentList: handleResponse(response), error: null });
        } catch (err) {
            console.error("获取学生列表失败:", err);
            set({ error: "获取学生列表失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, studentList: false } }));
        }
    },

    fetchAlumniList: async () => {
        set(state => ({ loading: { ...state.loading, alumniList: true } }));
        try {
            const response = await axios.get('/api/alumni/all');
            set({ alumniList: handleResponse(response), error: null });
        } catch (err) {
            console.error("获取学长列表失败:", err);
            set({ error: "获取学长列表失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, alumniList: false } }));
        }
    },

    // --- 2. 核心联动：选择学生 ---
    selectStudent: async (studentId) => {
        if (!studentId) {
            set({ selectedStudentId: null, studentProfile: null, graphData: null });
            return;
        }

        set(state => ({
            selectedStudentId: studentId,
            studentProfile: null,
            graphData: null,
            loading: { ...state.loading, studentProfile: true },
            error: null
        }));

        try {
            const statusResponse = await axios.get(`/api/students/${studentId}/status`);
            const status = handleResponse(statusResponse);

            if (status.isComplete) {
                const profileResponse = await axios.get(`/api/students/${studentId}/profile`);
                set({ studentProfile: handleResponse(profileResponse) });
                // 自动触发图谱获取
                get().triggerGraphFetch();
            } else {
                set({ studentProfile: { incomplete: true, status: status } });
            }
        } catch (err) {
            console.error("获取学生画像失败:", err);
            set({ error: "获取学生画像失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, studentProfile: false } }));
        }
    },

    // --- 3. 核心联动：选择学长 (修复了 ID 匹配 Bug) ---
    selectAlumni: (alumniId) => {
        if (!alumniId) {
            set({ selectedAlumniId: null, selectedJobRole: null, graphData: null });
            return;
        }

        const { alumniList } = get();

        // 【修复点】：优先匹配 alumniId，如果不存在再尝试 id，且增加空值检查
        const alumni = alumniList.find(a => {
            const aId = a.alumniId || a.id;
            return aId && aId.toString() === alumniId.toString();
        });

        if (alumni) {
            set({
                selectedAlumniId: alumniId, // 确保 ID 被设置
                selectedJobRole: alumni.jobTitle || null, // 提取岗位名称，如果没有则为 null
                graphData: null, // 清空旧图谱
            });

            // 如果有岗位信息，尝试触发图谱更新
            if (alumni.jobTitle) {
                get().triggerGraphFetch();
            }
        } else {
            console.warn(`未能在列表里找到 ID 为 ${alumniId} 的校友`);
            // 即使没找到详细信息，也设置 ID，以便 ChatAssistant 或 Timeline 可以尝试独立加载详情
            set({ selectedAlumniId: alumniId, selectedJobRole: null, graphData: null });
        }
    },

    // --- 4. 内部动作：触发图谱 ---
    triggerGraphFetch: async () => {
        const { selectedStudentId, selectedJobRole } = get();

        // 只有当“学生”和“目标岗位”都存在时，才请求图谱
        // 这里的 selectedJobRole 可能来自选中的校友，也可能来自学生自己的意向
        if (selectedStudentId && selectedJobRole) {
            set(state => ({
                loading: { ...state.loading, graph: true },
                graphData: null,
                error: null
            }));
            try {
                const response = await axios.get(`/api/jobs/graph`, {
                    params: {
                        studentId: selectedStudentId,
                        jobRole: selectedJobRole,
                    }
                });
                set({ graphData: handleResponse(response) });
            } catch (err) {
                console.error("获取知识图谱失败:", err);
                set({ error: "获取知识图谱失败" });
            } finally {
                set(state => ({ loading: { ...state.loading, graph: false } }));
            }
        }
    },

    // --- 5. 其他组件 ---
    fetchMapData: async () => {
        set(state => ({ loading: { ...state.loading, map: true } }));
        try {
            const response = await axios.get('/api/jobs/distribution');
            set({ mapData: handleResponse(response), error: null });
        } catch (err) {
            console.error("获取地图数据失败:", err);
            set({ error: "获取地图数据失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, map: false } }));
        }
    },

    sendChatMessage: async (message) => {
        const userMessage = { sender: 'user', text: message };
        set(state => ({
            chatMessages: [...state.chatMessages, userMessage],
            loading: { ...state.loading, chat: true }
        }));

        try {
            const response = await axios.post('/api/chat/ask', { message });
            const aiMessage = { sender: 'ai', text: handleResponse(response).response };
            set(state => ({ chatMessages: [...state.chatMessages, aiMessage] }));
        } catch (err) {
            console.error("AI 聊天失败:", err);
            const errMessage = { sender: 'ai', text: "抱歉，我暂时无法回复..." };
            set(state => ({ chatMessages: [...state.chatMessages, errMessage] }));
        } finally {
            set(state => ({ loading: { ...state.loading, chat: false } }));
        }
    },

}));

export default useAppStore;