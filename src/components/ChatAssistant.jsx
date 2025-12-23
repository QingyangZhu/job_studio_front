import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import useAppStore from '../store/appStore'; // 1. 引入 Store

const CHAT_API = '/api/chat/ask';

const colors = {
    border: '#005f73',
    accent: '#00c5c7',
    text: '#ffffff',
    userBubble: '#4a90e2',
    aiBubble: '#2c3e50',
    inputBg: '#1a1b30'
};

const styles = {
    contentWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    chatWindow: {
        flexGrow: 1,
        overflowY: 'auto',
        marginBottom: '10px',
        paddingRight: '5px',
    },
    messageContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '10px',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.userBubble,
        borderRadius: '10px 10px 0 10px',
        padding: '8px 12px',
        wordBreak: 'break-word',
        maxWidth: '80%',
        color: 'white' // 修正字体颜色
    },
    aiMessage: {
        alignSelf: 'flex-start',
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
        color: '#0a0b1f',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

const ChatAssistant = () => {
    // 2. 获取全局状态：学生画像 + 校友列表 + 选中校友ID
    const { studentProfile, alumniList, selectedAlumniId } = useAppStore();

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages([
            { role: 'ai', content: '您好！我是您的生涯规划助手。我可以结合在读学生的数据，以及优秀校友的成长经历为您提供建议。' }
        ]);
    }, []);

    // 3. 监听上下文变化，主动提示用户
    useEffect(() => {
        let tips = [];
        if (studentProfile && studentProfile.info) {
            tips.push(`当前分析学生：${studentProfile.info.name}`);
        }
        if (selectedAlumniId && alumniList.length > 0) {
            const alumni = alumniList.find(a => String(a.alumniId) === String(selectedAlumniId));
            if (alumni) {
                tips.push(`参考校友榜样：${alumni.name} (${alumni.jobTitle})`);
            }
        }

        if (tips.length > 0) {
            setMessages(prev => [
                ...prev,
                { role: 'ai', content: `[系统] 上下文已更新：\n${tips.join('\n')}` }
            ]);
        }
    }, [studentProfile, selectedAlumniId, alumniList]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage || isSending) return;

        const newMessage = { role: 'user', content: trimmedMessage };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsSending(true);

        // 4. 构建包含“学生”和“校友”双重上下文的 Prompt
        let contextParts = [];

        // (A) 学生信息
        if (studentProfile && studentProfile.info) {
            contextParts.push(`
【分析对象-在读学生】
姓名: ${studentProfile.info.name}
专业: ${studentProfile.info.major}
GPA: ${studentProfile.assessment?.gpaMajor || '未知'}
意向: ${studentProfile.info.targetJob || '未定'}
核心技能得分(5分制): Java=${studentProfile.assessment?.javaScore}, Python=${studentProfile.assessment?.pythonScore}
            `.trim());
        }

        // (B) 校友信息
        if (selectedAlumniId && alumniList.length > 0) {
            const alumni = alumniList.find(a => String(a.alumniId) === String(selectedAlumniId));
            if (alumni) {
                contextParts.push(`
【参考榜样-毕业校友】
姓名: ${alumni.name}
现任岗位: ${alumni.jobTitle || '未知'}
就职公司: ${alumni.company || '未知'}
毕业年份: ${alumni.graduationYear}
                `.trim());
            }
        }

        // 拼接最终消息
        let promptToSend = trimmedMessage;
        if (contextParts.length > 0) {
            promptToSend = `[上下文信息]\n${contextParts.join('\n\n')}\n\n[用户问题]\n${trimmedMessage}`;
        }

        try {
            const response = await axios.post(CHAT_API, { message: promptToSend });
            const aiResponse = response.data.response;
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error("AI API Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: '抱歉，服务暂时无法连接。' }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={styles.contentWrapper}>
            <div style={styles.chatWindow}>
                {messages.map((msg, index) => (
                    <div key={index} style={styles.messageContainer}>
                        <div style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form style={styles.inputArea} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    style={styles.input}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isSending ? "思考中..." : "请输入问题..."}
                    disabled={isSending}
                />
                <button
                    type="submit"
                    style={{ ...styles.button, opacity: isSending ? 0.6 : 1 }}
                    disabled={isSending}
                >
                    {isSending ? '发送' : '发送'}
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;