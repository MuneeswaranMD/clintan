import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartProps {
    itemCount: number;
    total: number;
    currency: string;
    onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
    itemCount,
    total,
    currency,
    onClick
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (itemCount > 0) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [itemCount]);

    if (!isVisible) return null;

    return (
        <button
            onClick={onClick}
            className={`
        fixed bottom-6 right-6 z-30 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-between gap-3 min-w-[160px]
        animate-fade-in-up
      `}
        >
            <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                    {itemCount}
                </span>
            </div>
            <div className="flex flex-col items-start leading-none">
                <span className="text-xs text-gray-400 font-medium">Total</span>
                <span className="font-bold text-lg">{currency}{total.toLocaleString()}</span>
            </div>
        </button>
    );
};
