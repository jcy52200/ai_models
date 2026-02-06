import React, { useEffect, useState } from 'react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../services/adminService';
import type { Category } from '../../services/adminService';
import { Loader2, Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [parentCategory, setParentCategory] = useState<Category | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            sort_order: 0,
            is_active: true
        }
    });

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await getAdminCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreate = (parent: Category | null) => {
        setEditingCategory(null);
        setParentCategory(parent);
        reset({ name: '', description: '', sort_order: 0, is_active: true });
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setParentCategory(null); // Parent handling is complex in edit, simplifying for now
        reset({
            name: category.name,
            description: category.description || '',
            sort_order: category.sort_order,
            is_active: category.is_active
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除该分类吗？')) return;
        try {
            await deleteCategory(id);
            loadCategories();
        } catch (error: any) {
            alert(error.message || '删除失败');
        }
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
            } else {
                await createCategory({
                    ...data,
                    parent_id: parentCategory ? parentCategory.id : 0
                });
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error: any) {
            alert(error.message || '操作失败');
        }
    };

    // Recursive render
    const renderCategory = (category: Category, level = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expanded[category.id];

        return (
            <React.Fragment key={category.id}>
                <div className={`flex items-center py-3 px-4 border-b hover:bg-gray-50 transition-colors ${level > 0 ? 'bg-gray-50/50' : ''}`} style={{ paddingLeft: `${level * 24 + 16}px` }}>
                    <div className="flex-1 flex items-center">
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(category.id)} className="mr-2 text-gray-500 hover:text-black">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-6 mr-2" />
                        )}
                        <span className="font-medium text-gray-900 font-sans">{category.name}</span>
                        {!category.is_active && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">禁用</span>}
                    </div>
                    <div className="text-sm text-gray-500 font-sans w-24 text-center">{category.sort_order}</div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleCreate(category)} className="text-gray-500 hover:text-black" title="添加子分类">
                            <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(category)} className="text-gray-500 hover:text-black" title="编辑">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="text-red-400 hover:text-red-600" title="删除">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {hasChildren && isExpanded && category.children!.map(child => renderCategory(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-normal text-gray-900 font-serif">分类管理</h2>
                <button
                    onClick={() => handleCreate(null)}
                    className="flex items-center px-6 py-3 bg-black text-white hover:bg-gray-900 transition-colors rounded-none font-sans tracking-wide"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    新建分类
                </button>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="flex items-center py-3 px-4 bg-gray-50 border-b font-sans text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex-1 pl-8">分类名称</div>
                    <div className="w-24 text-center">排序</div>
                    <div className="w-24 text-right pr-4">操作</div>
                </div>
                {loading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    categories.length > 0 ? categories.map(c => renderCategory(c)) : <div className="p-8 text-center text-gray-500">暂无分类</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-normal font-serif mb-6">
                            {editingCategory ? '编辑分类' : '新建分类'}
                            {parentCategory && <span className="text-sm font-sans text-gray-500 block mt-1">父级：{parentCategory.name}</span>}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">名称</label>
                                <input
                                    {...register('name', { required: '请输入分类名称' })}
                                    className="block w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans"
                                />
                                {errors.name && <span className="text-red-500 text-xs">必填</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">描述</label>
                                <textarea
                                    {...register('description')}
                                    className="block w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">排序</label>
                                    <input
                                        type="number"
                                        {...register('sort_order')}
                                        className="block w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans"
                                    />
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('is_active')}
                                            className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black"
                                        />
                                        <span className="text-sm font-medium font-sans">启用</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-sans"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-black text-white hover:bg-gray-900 transition-colors font-sans"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
