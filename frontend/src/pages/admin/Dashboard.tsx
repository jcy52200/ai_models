import React, { useEffect, useState } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Package, AlertCircle, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err: any) {
                setError(err.message || '加载失败');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-red-500">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    if (!stats) return null;


    return (
        <div className="space-y-6 font-serif">
            <h2 className="text-3xl font-normal text-gray-900 font-serif">仪表盘</h2>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="总销售额"
                    value={`¥${stats.total_sales.toFixed(2)}`}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-black"
                />
                <StatCard
                    title="总订单数"
                    value={stats.total_orders}
                    icon={<ShoppingBag className="w-6 h-6 text-white" />}
                    color="bg-gray-800"
                />
                <StatCard
                    title="总用户数"
                    value={stats.total_users}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-gray-600"
                />
                <StatCard
                    title="总商品数"
                    value={stats.total_products}
                    icon={<Package className="w-6 h-6 text-white" />}
                    color="bg-gray-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 待办事项 */}
                <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-xl font-normal text-gray-900 mb-6 font-serif">待办事项</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                            <div className="flex items-center">
                                <ShoppingBag className="w-5 h-5 text-gray-800 mr-3" />
                                <span className="text-gray-700 font-sans">待发货订单</span>
                            </div>
                            <span className="font-bold text-gray-900 font-serif text-lg">{stats.pending_orders}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-gray-800 mr-3" />
                                <span className="text-gray-700 font-sans">待审核评价</span>
                            </div>
                            <span className="font-bold text-gray-900 font-serif text-lg">{stats.pending_reviews}</span>
                        </div>
                    </div>
                </div>

                {/* 销售趋势图表 */}
                <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-xl font-normal text-gray-900 mb-6 font-serif">本周销售趋势</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.sales_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: 0 }}
                                    itemStyle={{ color: '#000' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: '#000' }} activeDot={{ r: 6 }} name="销售额" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 border border-gray-200 flex items-center hover:shadow-lg transition-shadow duration-300">
        <div className={`p-4 ${color} mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 mb-1 font-sans tracking-wider uppercase">{title}</p>
            <h3 className="text-3xl font-medium text-gray-900 font-serif">{value}</h3>
        </div>
    </div>
);

export default Dashboard;
