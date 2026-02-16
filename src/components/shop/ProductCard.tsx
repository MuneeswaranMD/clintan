import React, { useState } from 'react';
import { Product } from '../../types';
import { ShoppingCart, Plus, Minus, AlertCircle } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    quantity: number;
    onUpdateQuantity: (quantity: number) => void;
    currency: string;
    enableStock?: boolean;
    layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    quantity,
    onUpdateQuantity,
    currency,
    enableStock,
    layout = 'grid'
}) => {
    const isOutOfStock = enableStock && product.inventory?.status === 'OUT_OF_STOCK';
    const maxStock = product.inventory?.stock || 0;

    // Animation state for "Add" button
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        setIsAdding(true);
        onUpdateQuantity(1);
        setTimeout(() => setIsAdding(false), 300);
    };

    const handleIncrement = () => {
        if (enableStock && quantity >= maxStock) return;
        onUpdateQuantity(quantity + 1);
    };

    const handleDecrement = () => {
        onUpdateQuantity(quantity - 1);
    };

    // Base card styles
    const cardClasses = `
    group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300
    ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}
    ${layout === 'list' ? 'flex flex-row items-center p-3 gap-4' : 'flex flex-col p-4 h-full'}
  `;

    // Image styles
    const imageContainerClasses = `
    relative overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center
    ${layout === 'list' ? 'w-24 h-24 shrink-0' : 'w-full aspect-square mb-4'}
  `;

    return (
        <div className={cardClasses}>
            {/* Badge */}
            {isOutOfStock && (
                <div className="absolute top-2 right-2 z-10 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    Out of Stock
                </div>
            )}

            {/* Product Image */}
            <div className={imageContainerClasses}>
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <ShoppingCart className="text-gray-300 w-1/3 h-1/3" />
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${layout === 'list' ? 'flex flex-col justify-center' : ''}`}>
                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base mb-1">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-black text-blue-600">
                        {currency}{(product.pricing?.sellingPrice || 0).toLocaleString()}
                    </span>
                    {enableStock && !isOutOfStock && product.inventory?.stock <= 5 && (
                        <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            Only {product.inventory?.stock} left
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className={`mt-auto ${layout === 'list' ? 'w-full sm:w-auto' : 'w-full'}`}>
                    {!isOutOfStock ? (
                        quantity > 0 ? (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-200">
                                <button
                                    onClick={handleDecrement}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-bold text-gray-900 w-8 text-center">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    disabled={enableStock && quantity >= maxStock}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className={`
                  w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${isAdding ? 'bg-green-500 scale-95' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20'}
                  text-white
                `}
                            >
                                <Plus size={18} strokeWidth={3} />
                                Add
                            </button>
                        )
                    ) : (
                        <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed">
                            Unavailable
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
