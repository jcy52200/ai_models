import React, { useEffect, useState, useRef } from 'react';
import { aiService } from '../../services/ai';
import type { ChatSession, ChatMessage } from '../../services/ai';
import { Send, Plus, Trash2, MessageSquare, Loader2, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import { useNavigate } from 'react-router-dom';

const AiChat: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 默认欢迎语
    const welcomeMessage: ChatMessage = {
        id: -1,
        role: 'assistant',
        content: '你好！我是素居智能助手，有什么可以帮您？您可以询问商品详情或查询订单状态。',
        created_at: new Date().toISOString()
    };
    // const navigate = useNavigate();

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSessions = async () => {
        setSessionLoading(true);
        try {
            const list = await aiService.getSessions();
            setSessions(list);
            if (list.length > 0 && !currentSessionToken) {
                selectSession(list[0].session_token);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSessionLoading(false);
        }
    };

    const selectSession = async (token: string) => {
        setCurrentSessionToken(token);
        setLoading(true);
        try {
            const history = await aiService.getMessages(token);
            setMessages(history);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewSession = async () => {
        try {
            const newSession = await aiService.createSession("新对话");
            setSessions([newSession, ...sessions]);
            selectSession(newSession.session_token);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('确定要删除这个对话吗？')) return;
        try {
            await aiService.deleteSession(id);
            setSessions(sessions.filter(s => s.id !== id));
            if (currentSessionToken === sessions.find(s => s.id === id)?.session_token) {
                setMessages([]);
                setCurrentSessionToken(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentSessionToken) return;

        const userMsg: ChatMessage = {
            id: Date.now(), // temporary
            role: 'user',
            content: input,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.sendMessage(currentSessionToken, userMsg.content);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "抱歉，系统遇到了一点小问题，请稍后再试。",
                created_at: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex bg-white h-screen pt-20 border-t border-gray-200">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={handleNewSession}
                        className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="font-sans text-sm tracking-wider uppercase">新建对话</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sessionLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 font-sans text-sm">暂无对话记录</div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => selectSession(session.session_token)}
                                className={`group p-4 border-b border-gray-100 cursor-pointer transition-colors relative ${currentSessionToken === session.session_token ? 'bg-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <MessageSquare size={16} className={`mt-1 ${currentSessionToken === session.session_token ? 'text-black' : 'text-gray-400'}`} />
                                    <div className="flex-1 overflow-hidden">
                                        <p className={`text-sm font-sans truncate ${currentSessionToken === session.session_token ? 'text-black font-medium' : 'text-gray-600'}`}>
                                            {session.title || "新对话"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(session.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {currentSessionToken ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* 欢迎语 - 如果没有消息显示 */}
                            {messages.length === 0 && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-2xl flex-row items-start space-x-4">
                                        <div className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600 mr-4">
                                            <Bot size={16} />
                                        </div>
                                        <div className="p-4 text-sm font-sans whitespace-pre-wrap leading-relaxed bg-gray-50 text-gray-800 border border-gray-100">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{welcomeMessage.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-4 space-x-reverse`}>
                                        <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-black text-white ml-4' : 'bg-gray-100 text-gray-600 mr-4'}`}>
                                            {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 text-sm font-sans whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                            ? 'bg-black text-white'
                                            : 'bg-gray-50 text-gray-800 border border-gray-100'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="markdown-body">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="my-1" {...props} />,
                                                        p: ({ node, ...props }) => <p className="my-2 last:mb-0" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-black" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-purple-600 hover:underline" target="_blank" {...props} />,
                                                    }}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-2xl flex-row items-start space-x-4">
                                        <div className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center mr-4">
                                            <Bot size={16} />
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                                <textarea
                                    className="flex-1 p-4 border border-gray-300 focus:border-black focus:ring-0 font-sans text-sm resize-none h-[52px] min-h-[52px] max-h-32 transition-all"
                                    placeholder="输入您的问题..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="h-[52px] w-[52px] bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center font-sans">
                                AI助手可能会犯错，请核实重要信息。
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Bot size={48} className="mb-4 opacity-20" />
                        <p className="font-serif text-xl text-gray-300">请选择或新建一个对话</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiChat;
