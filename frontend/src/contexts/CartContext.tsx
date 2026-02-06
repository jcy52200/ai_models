import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartCount, setCartCount] = useState(0);
    const { isAuthenticated } = useAuth();

    const refreshCart = async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        try {
            const data = await getCart();
            const count = data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [isAuthenticated]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
