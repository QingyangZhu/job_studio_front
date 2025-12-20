import React, { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import useAppStore from './store/appStore';
import './App.css';

function App() {
    // 依然保留全局数据预加载逻辑
    const fetchStudentList = useAppStore((state) => state.fetchStudentList);
    const fetchAlumniList = useAppStore((state) => state.fetchAlumniList);

    useEffect(() => {
        fetchStudentList();
        fetchAlumniList();
    }, [fetchStudentList, fetchAlumniList]);

    return (
        <AppRouter />
    );
}

export default App;