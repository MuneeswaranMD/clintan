import React from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { Product, CartItem } from '../../types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    currency: string;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onCheckout: () => void;
    total: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen,
    onClose,
    cartItems,
    currency,
    onUpdateQuantity,
    onCheckout,
    total
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {cartItems.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                            <ShoppingCart size={64} strokeWidth={1} className="opacity-20" />
                            <p>Your cart is empty</p>
                            <button
                                onClick={onClose}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div
                                key={item.product.id}
                                className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-100 transition-colors shadow-sm"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 bg-gray-50 rounded-lg shrink-0 overflow-hidden">
                                    {item.product.imageUrl ? (
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingCart size={20} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h3>
                                        <p className="text-sm text-gray-500">{item.product.category}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-gray-900">
                                            {currency}{((item.product.pricing?.sellingPrice || 0) * item.quantity).toLocaleString()}
                                        </span>

                                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded hover:text-red-500 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded hover:text-blue-500 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-xl font-black text-gray-900">{currency}{total.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={onCheckout}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
