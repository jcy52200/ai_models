import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { getFavorites } from '../../services/favoriteService';
import type { Favorite } from '../../services/favoriteService';

export default function Favorites() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('加载收藏失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-gray-3 mb-4" />
                <h2 className="font-display text-xl text-black">暂无收藏</h2>
                <p className="text-gray-1 font-body mt-2">快去发现心仪的商品吧</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-3 border border-black text-sm font-body hover:bg-black hover:text-white transition-all duration-300"
                >
                    去逛逛
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl text-black">我的收藏</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favorites.map((fav) => (
                    <div
                        key={fav.id}
                        onClick={() => navigate(`/product/${fav.product.id}`)}
                        className="group cursor-pointer"
                    >
                        <div className="aspect-square bg-gray-2 overflow-hidden relative">
                            <img
                                src={fav.product.main_image_url || '/placeholder.jpg'}
                                alt={fav.product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </div>
                        <div className="mt-4">
                            <h3 className="font-body text-sm text-black group-hover:text-gray-600 transition-colors">
                                {fav.product.name}
                            </h3>
                            <p className="mt-1 font-display text-lg text-black">
                                ¥{fav.product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
