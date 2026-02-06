import React, { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/adminService';
import type { User } from '../../services/authService';
import { Loader2 } from 'lucide-react';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const pageSize = 20;

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ username: '', phone: '' });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers(page, pageSize);
            setUsers(data.list);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({ username: user.username, phone: user.phone || '' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除该用户吗？此操作不可恢复。')) return;
        try {
            await deleteUser(id);
            alert('用户已删除');
            loadUsers();
        } catch (error: any) {
            alert(error.message || '删除失败');
        }
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            await updateUser(editingUser.id, editForm);
            setEditingUser(null);
            loadUsers(); // 刷新列表
            alert('更新成功');
        } catch (error: any) {
            alert(error.message || '更新失败');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-normal text-gray-900 font-serif">用户管理</h2>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">用户</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">联系方式</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">注册时间</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">角色</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 font-sans">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    暂无用户
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 bg-black text-white flex items-center justify-center text-sm font-bold">
                                                    {user.avatar_url ? (
                                                        <img className="h-10 w-10 object-cover" src={user.avatar_url} alt="" />
                                                    ) : (
                                                        user.username[0].toUpperCase()
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_admin ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold bg-black text-white uppercase tracking-wider">
                                                管理员
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold bg-gray-100 text-gray-800 uppercase tracking-wider">
                                                用户
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-black hover:underline mr-4"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 分页 */}
            <div className="flex justify-between items-center bg-white px-4 py-3 sm:px-6 border border-gray-200">
                <div className="text-sm text-gray-700 font-sans">
                    显示 {(page - 1) * pageSize + 1} 到 {Math.min(page * pageSize, total)} 条，共 {total} 条
                </div>
                <div className="flex space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                    >
                        上一页
                    </button>
                    <button
                        disabled={page * pageSize >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                    >
                        下一页
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-normal font-serif mb-6">编辑用户</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">用户名</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    className="block w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">手机号</label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="block w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-2 bg-black text-white hover:bg-gray-900 transition-colors font-sans"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
