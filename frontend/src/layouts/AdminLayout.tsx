import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { siteConfig } from '../config/theme';
import { content } from '../config/content';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    Home,
    FolderTree,
    Star
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = content.admin.nav.map(item => {
        const iconMap: Record<string, any> = {
            '/admin': LayoutDashboard,
            '/admin/users': Users,
            '/admin/categories': FolderTree,
            '/admin/products': Package,
            '/admin/orders': ShoppingBag,
            '/admin/reviews': Star,
        };
        return { ...item, icon: iconMap[item.path] };
    });

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg z-10">
                <div className="p-6 border-b">
                    <h1 className="text-4xl font-bold text-primary">{content.admin.shortTitle}</h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {content.admin.logout}
                    </button>
                    <Link
                        to="/"
                        className="flex items-center w-full px-4 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {content.admin.backToShop}
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold text-primary">{content.admin.title}</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-lg ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {content.admin.logout}
                    </button>
                    <Link
                        to="/"
                        className="flex items-center w-full px-4 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {content.admin.backToShop}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-800">
                        {navItems.find(item => isActive(item.path))?.label || '后台管理'}
                    </span>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
