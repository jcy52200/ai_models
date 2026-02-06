import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authService';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../services/authService';
import { getToken, getStoredUser } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化时检查登录状态
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token) {
                // 尝试从本地存储获取用户信息
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                }

                // 尝试从服务器刷新用户信息
                try {
                    const freshUser = await getCurrentUser();
                    setUser(freshUser);
                } catch (error) {
                    // Token 无效，清除登录状态
                    console.error('Token 验证失败:', error);
                    apiLogout();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        const result = await apiLogin(data);
        setUser(result.user);
        return result;
    };

    const register = async (data: RegisterRequest) => {
        const result = await apiRegister(data);
        setUser(result.user);
        return result;
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const freshUser = await getCurrentUser();
            setUser(freshUser);
        } catch (error) {
            console.error('刷新用户信息失败:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
