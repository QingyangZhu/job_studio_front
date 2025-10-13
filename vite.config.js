// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // =====================================
    // 核心：开发服务器代理配置
    // =====================================
    server: {
        proxy: {
            // 匹配所有以 /api 开头的请求
            '/api': {
                // 目标后端地址（您的 Spring Boot 运行端口）
                target: 'http://localhost:8080',

                // 更改请求头中的 Host 字段为目标 URL，这是推荐做法
                changeOrigin: true,

                // 关键：重写路径，将请求中的 /api 前缀移除后再转发给后端
                // 例如：/api/alumni/all -> /alumni/all
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});