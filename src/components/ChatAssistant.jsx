import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

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
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages([
            { role: 'ai', content: '您好！我是您的生涯规划助手，请问有什么可以帮您？' }
        ]);
    }, []);

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

        try {
            const response = await axios.post(CHAT_API, { message: trimmedMessage });
            const aiResponse = response.data.response;
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error("AI Assistant API Error:", error);
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
                    placeholder={isSending ? "等待回复..." : "请输入您的问题..."}
                    disabled={isSending}
                />
                <button
                    type="submit"
                    style={{ ...styles.button, opacity: isSending ? 0.6 : 1 }}
                    disabled={isSending}
                >
                    {isSending ? '发送中' : '发送'}
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;