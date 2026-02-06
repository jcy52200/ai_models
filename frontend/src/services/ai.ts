import api from './api';

export interface ChatSession {
    id: number;
    session_token: string;
    title: string;
    created_at: string;
}

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export const aiService = {
    getSessions: async (): Promise<ChatSession[]> => {
        const response = await api.get<ChatSession[]>('/ai/sessions');
        return response.data;
    },

    createSession: async (title?: string): Promise<ChatSession> => {
        const response = await api.post<ChatSession>('/ai/sessions', { title });
        return response.data;
    },

    deleteSession: async (id: number): Promise<void> => {
        await api.delete(`/ai/sessions/${id}`);
    },

    getMessages: async (sessionToken: string): Promise<ChatMessage[]> => {
        const response = await api.get<ChatMessage[]>(`/ai/sessions/${sessionToken}/messages`);
        return response.data;
    },

    sendMessage: async (sessionToken: string, content: string): Promise<ChatMessage> => {
        const response = await api.post<ChatMessage>('/ai/chat', { session_token: sessionToken, content });
        return response.data;
    },
};
