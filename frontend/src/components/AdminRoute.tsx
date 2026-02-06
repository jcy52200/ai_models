import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!isAuthenticated && !isLoading) {
                // 尝试检查一次认证状态
                await refreshUser();
            }
            setIsChecking(false);
        };
        init();
    }, [isAuthenticated, isLoading, refreshUser]);

    // Loading 状态
    if (isLoading || isChecking) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // 未登录跳转登录页
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // 非管理员显示无权限
    if (!user.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">访问被拒绝</h1>
                    <p className="text-gray-600 mb-6">您没有权限访问管理后台。</p>
                    <a href="/" className="text-primary hover:underline">
                        返回首页
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminRoute;
