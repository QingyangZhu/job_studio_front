import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const CHAT_API = '/api/chat/ask';

// 样式常量，与大屏主题保持一致
const colors = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '#005f73',
    header: '#4a90e2',
    accent: '#00c5c7',
    text: '#ffffff',
    userBubble: '#4a90e2', // 用户消息颜色
    aiBubble: '#2c3e50', // AI 消息颜色
    inputBg: '#1a1b30'
};

const styles = {
    panel: {
        height: '100%',
        backgroundColor: colors.background,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 防止内容溢出
    },
    // **[修正 4]** 添加缺失的 panelTitle 样式
    panelTitle: {
        color: colors.header,
        marginBottom: '10px',
        borderBottom: `1px dashed ${colors.border}`,
        paddingBottom: '5px',
        flexShrink: 0
    },
    chatWindow: {
        flexGrow: 1,
        overflowY: 'auto',
        marginBottom: '10px',
        paddingRight: '5px', // 留出滚动条空间
    },
    messageContainer: {
        display: 'flex',
        flexDirection: 'column', // 让消息垂直排列
        marginBottom: '10px',
    },
    userMessage: {
        alignSelf: 'flex-end', // 用户消息靠右
        backgroundColor: colors.userBubble,
        borderRadius: '10px 10px 0 10px',
        padding: '8px 12px',
        wordBreak: 'break-word',
        maxWidth: '80%',
    },
    aiMessage: {
        alignSelf: 'flex-start', // AI 消息靠左
        backgroundColor: colors.aiBubble,
        borderRadius: '10px 10px 10px 0',
        padding: '8px 12px',
        wordBreak: 'break-word',
        color: colors.accent,
        maxWidth: '80%',
    },
    inputArea: {
        display: 'flex',
        borderTop: `1px solid ${colors.border}`,
        paddingTop: '10px',
        flexShrink: 0
    },
    input: {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '4px',
        backgroundColor: colors.inputBg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        marginRight: '10px'
    },
    button: {
        padding: '10px 15px',
        backgroundColor: colors.accent,
        color: '#0a0b1f', // 使用深色背景以提高对比度
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

const ChatAssistant = () => {
    // **[修正 1]** 使用完整的 useState 声明
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null); // 用于自动滚动

    // 默认欢迎消息
    useEffect(() => {
        setMessages([
            { role: 'ai', content: '您好！我是 MCP 助手，您的大数据与软件学院生涯规划导师。请问您有什么职业发展、岗位匹配或技能提升的问题吗？' }
        ]);
    }, []); // **[修正 2]** 使用空数组依赖，确保只运行一次

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]); // **[修正 2]** 依赖 messages 数组，每次消息更新时触发

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage || isSending) return;

        // 1. 添加用户消息到聊天记录
        const newMessage = { role: 'user', content: trimmedMessage };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsSending(true);

        // 2. 调用后端 API
        try {
            const response = await axios.post(CHAT_API, { message: trimmedMessage });
            const aiResponse = response.data.response;

            // **[修正 3]** 补全添加 AI 助手的回复逻辑
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

        } catch (error) {
            console.error("AI Assistant API Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: '抱歉，AI 服务连接失败或出现内部错误。' }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={styles.panel}>
            <h3 style={{...styles.panelTitle, fontSize: '1.2vw'}}>MCP 助手 - AI 生涯规划</h3>

            {/* 聊天消息窗口 */}
            <div style={styles.chatWindow}>
                {messages.map((msg, index) => (
                    // 容器不再需要 flex，由消息自身对齐
                    <div key={index} style={styles.messageContainer}>
                        <div style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {/* 滚动锚点 */}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入框和发送按钮 */}
            <form style={styles.inputArea} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    style={styles.input}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isSending ? "等待AI回复..." : "请输入您的问题..."}
                    disabled={isSending}
                />
                <button
                    type="submit"
                    style={{...styles.button, opacity: isSending ? 0.6 : 1}}
                    disabled={isSending}
                >
                    {isSending ? '发送中' : '发送'}
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;