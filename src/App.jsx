import React, { useEffect } from 'react';
import DataDashboard from './components/DataDashboard';
import useAppStore from './store/appStore';
import './App.css'; // 确保 App.css 被导入

function App() {
    // 获取 actions
    const fetchStudentList = useAppStore((state) => state.fetchStudentList);
    const fetchAlumniList = useAppStore((state) => state.fetchAlumniList);

    // App 加载时，全局获取一次列表数据
    useEffect(() => {
        fetchStudentList();
        fetchAlumniList();
    }, [fetchStudentList, fetchAlumniList]);

    return <DataDashboard />;
}

export default App;