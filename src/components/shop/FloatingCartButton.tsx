import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
    currency?: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
    currency = '₹'
}) => {
    const { cart, cartTotal, isCartOpen, setIsCartOpen } = useShop();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(cart.length > 0);
    }, [cart.length]);

    if (!isVisible || isCartOpen) return null;

    return (
        <button
            onClick={() => setIsCartOpen(true)}
            className={`
        fixed bottom-6 right-6 z-50 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-between gap-3 min-w-[160px]
        animate-fade-in-up border border-gray-700 backdrop-blur-md bg-opacity-90
      `}
        >
            <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                    {cart.length}
                </span>
            </div>
            <div className="flex flex-col items-start leading-none">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                <span className="font-bold text-lg">{currency}{cartTotal.toLocaleString()}</span>
            </div>
        </button>
    );
};
