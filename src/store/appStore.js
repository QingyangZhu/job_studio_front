import { create } from 'zustand';
import axios from 'axios';

// 辅助函数：处理 API 响应
// 假设你的后端统一返回 { code: 200, msg: "...", data: ... } 格式
// 如果不是，请直接使用 response.data
const handleResponse = (response) => {
    if (response.data) {
        // 检查是否有 data 字段，如果有，优先返回 data
        // 这能兼容 { code: 200, data: [...] } 和 [...] 两种格式
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
    studentList: [], // (来自 /api/students/list)
    alumniList: [],  // (来自 /api/alumni/all)

    // 3. 联动数据
    studentProfile: null, // (来自 /api/students/{id}/profile)
    graphData: null,      // (来自 /api/jobs/graph)
    mapData: null,        // (来自 /api/jobs/distribution)
    chatMessages: [],     // (用于 /api/chat/ask)

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

    // --- 1. 初始化加载 (获取列表) ---
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
            // 步骤 1: 检查状态
            const statusResponse = await axios.get(`/api/students/${studentId}/status`);
            const status = handleResponse(statusResponse);

            if (status.isComplete) {
                // 步骤 2: 获取完整画像
                const profileResponse = await axios.get(`/api/students/${studentId}/profile`);
                set({ studentProfile: handleResponse(profileResponse) });
                // 步骤 3: 尝试触发图谱
                get().triggerGraphFetch();
            } else {
                // 如果数据不完整
                set({ studentProfile: { incomplete: true, status: status } });
            }
        } catch (err) {
            console.error("获取学生画像失败:", err);
            set({ error: "获取学生画像失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, studentProfile: false } }));
        }
    },

    // --- 3. 核心联动：选择学长 ---
    selectAlumni: (alumniId) => {
        if (!alumniId) {
            set({ selectedAlumniId: null, selectedJobRole: null, graphData: null });
            return;
        }

        const { alumniList } = get();
        // 假设后端 /api/alumni/all 返回的对象中有 jobTitle 字段
        const alumni = alumniList.find(a => a.id.toString() === alumniId.toString());

        if (alumni && alumni.jobTitle) { // 确保 jobTitle 存在
            set({
                selectedAlumniId: alumniId,
                selectedJobRole: alumni.jobTitle, // 提取岗位名称
                graphData: null,
            });
            // 尝试触发图谱
            get().triggerGraphFetch();
        } else {
            console.warn(`未能在学长 (ID: ${alumniId}) 数据中找到 'jobTitle' 字段`);
            set({ selectedAlumniId: alumniId, selectedJobRole: null, graphData: null });
        }
    },

    // --- 4. 内部动作：触发图谱 ---
    triggerGraphFetch: async () => {
        const { selectedStudentId, selectedJobRole } = get();

        // 必须同时有学生ID和目标岗位
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