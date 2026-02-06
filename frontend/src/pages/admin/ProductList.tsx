import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/productService';
import { deleteProduct } from '../../services/adminService';
import type { ProductListItem } from '../../services/productService';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        loadProducts();
    }, [page]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ page, page_size: pageSize });
            setProducts(data.list);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除该商品吗？此操作不可恢复。')) return;
        try {
            await deleteProduct(id);
            loadProducts();
        } catch (error: any) {
            alert(error.message || '删除失败');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-normal text-gray-900 font-serif">商品管理</h2>
                <Link
                    to="/admin/products/new"
                    className="flex items-center px-6 py-3 bg-black text-white hover:bg-gray-900 transition-colors rounded-none font-sans tracking-wide"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    发布商品
                </Link>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">图片</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">价格</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">库存</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">销量</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">状态</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 font-sans">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">暂无商品</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-12 w-12 bg-gray-100 overflow-hidden">
                                            <img src={product.main_image_url} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs font-medium" title={product.name}>{product.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-serif">¥{Number(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sales_count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.is_published ? '已上架' : '已下架'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <Link to={`/admin/products/edit/${product.id}`} className="text-black hover:underline inline-block">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-800 inline-block"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
        </div>
    );
};

export default ProductList;
