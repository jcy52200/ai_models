import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { createProduct, updateProduct, uploadImage, getAdminCategories } from '../../services/adminService';
import type { ProductInput, Category } from '../../services/adminService';
import { getProduct } from '../../services/productService';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductInput>({
        defaultValues: {
            stock: 0,
            price: 0,
            original_price: undefined,
            is_published: true,
            params: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "params"
    });

    useEffect(() => {
        // 加载分类 (Admin tree)
        getAdminCategories().then(setCategories);

        // 如果是编辑，加载商品详情
        if (isEdit && id) {
            getProduct(Number(id)).then(data => {
                reset({
                    name: data.name,
                    category_id: data.category?.id,
                    short_description: data.short_description,
                    description: data.description,
                    price: Number(data.price),
                    original_price: data.original_price ? Number(data.original_price) : undefined,
                    stock: data.stock,
                    main_image_url: data.main_image_url,
                    image_urls: data.image_urls,
                    params: data.params && Array.isArray(data.params) 
                        ? data.params.map(p => ({ name: p.name, value: p.value }))
                        : []
                });
                if (data.image_urls && Array.isArray(data.image_urls)) {
                    setImageUrls(data.image_urls);
                }
            });
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: ProductInput) => {
        setLoading(true);
        const payload = {
            ...data,
            category_id: Number(data.category_id),
            price: Number(data.price),
            stock: Number(data.stock),
            original_price: data.original_price ? Number(data.original_price) : undefined,
            image_urls: imageUrls
        };
        try {
            if (isEdit && id) {
                await updateProduct(Number(id), payload);
                alert('商品更新成功');
            } else {
                await createProduct(payload);
                alert('商品创建成功');
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error(error);
            alert(error.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/admin/products')} className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{isEdit ? '编辑商品' : '发布商品'}</h2>
            </div>

            <div className="bg-white border border-gray-200 p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">商品名称</label>
                            <input
                                {...register('name', { required: '请输入商品名称' })}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">分类</label>
                            <select
                                {...register('category_id', { required: '请选择分类' })}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            >
                                <option value="">选择分类</option>
                                {categories.map(c => (
                                    <React.Fragment key={c.id}>
                                        <option value={c.id}>{c.name}</option>
                                        {c.children && c.children.map((child: any) => (
                                            <option key={child.id} value={child.id}>&nbsp;&nbsp;-- {child.name}</option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">价格 (¥)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price', { required: '请输入价格', min: 0 })}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">原价 (¥) <span className="text-gray-400 text-xs">可选，用于显示划线价</span></label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('original_price', { min: 0 })}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                                placeholder="留空则不显示划线价"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">库存</label>
                            <input
                                type="number"
                                {...register('stock', { required: '请输入库存', min: 0 })}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            />
                        </div>

                        <div className="space-y-2 flex items-center pt-8">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('is_published')}
                                    className="w-5 h-5 rounded-none border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium font-sans">立刻发布</span>
                            </label>
                        </div>




                        <div className="space-y-4 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">商品图片</label>

                            {/* Main Image */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">主图</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            {...register('main_image_url')}
                                            className="flex-1 border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-2"
                                            placeholder="主图URL"
                                        />
                                        <label className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm">
                                            上传
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            const url = await uploadImage(file);
                                                            setValue('main_image_url', url);
                                                        } catch (err: any) {
                                                            alert(err.message);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Multiple Images */}
                            <div className="border border-gray-200 p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium">更多图片</span>
                                    <label className="cursor-pointer px-3 py-1 bg-black text-white text-xs hover:bg-gray-800">
                                        添加图片
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = e.target.files;
                                                if (files) {
                                                    try {
                                                        const newUrls = [...imageUrls];
                                                        for (let i = 0; i < files.length; i++) {
                                                            const url = await uploadImage(files[i]);
                                                            newUrls.push(url);
                                                        }
                                                        setImageUrls(newUrls);
                                                        setValue('image_urls', newUrls); // Update form state if needed, though we send manual payload
                                                    } catch (err: any) {
                                                        alert(err.message);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {imageUrls.map((url, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                            <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newUrls = imageUrls.filter((_, i) => i !== idx);
                                                    setImageUrls(newUrls);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">简短描述</label>
                            <input
                                {...register('short_description')}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 font-sans">详细描述</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className="w-full border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm font-sans px-4 py-3"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium font-serif">商品参数</h3>
                            <button
                                type="button"
                                onClick={() => append({ name: '', value: '' })}
                                className="flex items-center text-black hover:text-gray-700 text-sm font-medium hover:underline"
                            >
                                <Plus className="w-4 h-4 mr-1" /> 添加参数
                            </button>
                        </div>
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex space-x-4 items-center">
                                    <input
                                        {...register(`params.${index}.name` as const)}
                                        placeholder="参数名"
                                        className="border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm px-4 py-2 flex-1 font-sans"
                                    />
                                    <input
                                        {...register(`params.${index}.value` as const)}
                                        placeholder="参数值"
                                        className="border-gray-300 focus:border-black focus:ring-0 rounded-none shadow-sm px-4 py-2 flex-1 font-sans"
                                    />
                                    <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-sans">
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center font-sans tracking-wide"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            保存商品
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ProductForm;
