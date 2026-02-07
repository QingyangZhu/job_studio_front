import { create } from 'zustand';
import axios from 'axios';

// 辅助函数：处理 API 响应
const handleResponse = (response) => {
    if (response.data) {
        return response.data.data || response.data;
    }
    return response.data;
};

// 初始化：如果本地有 Token，直接设置到 Axios
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const useAppStore = create((set, get) => ({
    // ================== 1. 用户认证状态 (新增) ==================
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: token || null,
    isAuthenticated: !!token,

    // ================== 2. 核心业务状态 ==================
    selectedStudentId: null,
    selectedAlumniId: null,
    selectedJobRole: null,

    // ================== 3. 数据列表 ==================
    studentList: [],
    alumniList: [],

    // ================== 4. 详情数据 ==================
    studentProfile: null,
    graphData: null,
    mapData: null,
    chatMessages: [],

    // ================== 5. UI 状态 ==================
    loading: {
        auth: false,
        studentList: false,
        alumniList: false,
        studentProfile: false,
        graph: false,
        map: false,
        chat: false,
    },
    error: null,

    // ================== Actions: 认证相关 (新增) ==================

    login: async (username, password) => {
        set(state => ({ loading: { ...state.loading, auth: true }, error: null }));
        try {
            const response = await axios.post('/api/api/auth/login', { username, password });
            const data = handleResponse(response);

            // data 结构: { token, role, studentId, assessmentCompleted }

            // 1. 持久化
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            // 2. 设置 Axios Header
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            set({
                user: data,
                token: data.token,
                isAuthenticated: true,
                error: null
            });

            return { success: true, data };
        } catch (err) {
            console.error("登录失败:", err);
            const errMsg = err.response?.data?.message || "用户名或密码错误";
            set({ error: errMsg });
            return { success: false, message: errMsg };
        } finally {
            set(state => ({ loading: { ...state.loading, auth: false } }));
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            selectedStudentId: null,
            studentProfile: null
        });
    },

    // ================== Actions: 业务逻辑 ==================

    fetchStudentList: async () => {
        set(state => ({ loading: { ...state.loading, studentList: true } }));
        try {
            const response = await axios.get('/api/students/list');
            set({ studentList: handleResponse(response), error: null });
        } catch (err) {
            console.error("获取学生列表失败:", err);
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
        } finally {
            set(state => ({ loading: { ...state.loading, alumniList: false } }));
        }
    },

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
            // 先获取状态
            const statusResponse = await axios.get(`/api/students/${studentId}/status`);
            const status = handleResponse(statusResponse);

            if (status.isComplete) {
                // 如果已完成测评，获取详细画像
                const profileResponse = await axios.get(`/api/students/${studentId}/profile`);
                const profile = handleResponse(profileResponse);
                set({ studentProfile: profile });

                // 自动触发图谱获取 (如果画像里有目标岗位)
                if (profile.info && profile.info.targetJob) {
                     // 临时设置 jobRole 触发图谱，或者等用户手动选
                     // 这里我们简单处理，仅加载画像
                }
            } else {
                set({ studentProfile: { incomplete: true, status: status } });
            }
        } catch (err) {
            console.error("获取学生画像失败:", err);
            set({ error: "获取学生数据失败" });
        } finally {
            set(state => ({ loading: { ...state.loading, studentProfile: false } }));
        }
    },

    selectAlumni: (alumniId) => {
        if (!alumniId) {
            set({ selectedAlumniId: null, selectedJobRole: null, graphData: null });
            return;
        }

        const { alumniList } = get();
        // 兼容处理 alumniId 和 id 字段
        const alumni = alumniList.find(a => {
            const aId = a.alumniId || a.id;
            return aId && aId.toString() === alumniId.toString();
        });

        if (alumni) {
            set({
                selectedAlumniId: alumniId,
                selectedJobRole: alumni.jobTitle || null,
                graphData: null,
            });
            if (alumni.jobTitle) {
                get().triggerGraphFetch();
            }
        }
    },

    triggerGraphFetch: async () => {
        const { selectedStudentId, selectedJobRole } = get();
        if (selectedStudentId && selectedJobRole) {
            set(state => ({ loading: { ...state.loading, graph: true }, graphData: null }));
            try {
                const response = await axios.get(`/api/jobs/graph`, {
                    params: { studentId: selectedStudentId, jobRole: selectedJobRole }
                });
                set({ graphData: handleResponse(response) });
            } catch (err) {
                console.error("获取图谱失败:", err);
            } finally {
                set(state => ({ loading: { ...state.loading, graph: false } }));
            }
        }
    },

    // ... 其他方法 (sendChatMessage 等) 保持原样 ...
    sendChatMessage: async (message) => {
        // ... (此处代码省略，保持原有逻辑即可)
    }
}));

export default useAppStore;