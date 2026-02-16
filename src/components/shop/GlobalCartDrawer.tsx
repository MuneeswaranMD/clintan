import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, User, Phone, MapPin, Mail, Loader } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface GlobalCartDrawerProps {
    currency?: string;
    onCheckout: (customerDetails: {
        name: string;
        phone: string;
        email: string;
        address: string;
        notes: string;
    }) => Promise<void>;
}

export const GlobalCartDrawer: React.FC<GlobalCartDrawerProps> = ({
    currency = '₹',
    onCheckout
}) => {
    const { isCartOpen, setIsCartOpen, cart, updateQuantity, cartTotal, mode } = useShop();
    const [step, setStep] = useState<'cart' | 'details'>('cart');
    const [submitting, setSubmitting] = useState(false);

    // Customer Details State
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    if (!isCartOpen) return null;

    const handleBack = () => {
        if (step === 'details') setStep('cart');
        else setIsCartOpen(false);
    };

    const handleProceed = () => {
        setStep('details');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onCheckout(customerDetails);
        } catch (error) {
            console.error("Checkout failed:", error);
        } finally {
            setSubmitting(false);
            // Verify if we should close or reset step based on success - usually parent component handles success state/closing
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">
                            {step === 'cart' ? 'Your Cart' : 'Checkout Details'}
                        </h2>
                        {step === 'cart' && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {step === 'cart' ? (
                    /* Step 1: Cart Items */
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                                    <ShoppingCart size={64} strokeWidth={1} className="opacity-20" />
                                    <p>Your cart is empty</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
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
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded hover:text-red-500 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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
                        {cart.length > 0 && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-xl font-black text-gray-900">{currency}{cartTotal.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={handleProceed}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Step 2: Customer Details Form */
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                                    <span className="font-bold">Total to Pay:</span>
                                    {currency}{cartTotal.toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <User size={14} /> Full Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        value={customerDetails.name}
                                        onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Phone size={14} /> Phone Number
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        value={customerDetails.phone}
                                        onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Mail size={14} /> Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        value={customerDetails.email}
                                        onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <MapPin size={14} /> Delivery Address
                                    </label>
                                    <textarea
                                        required
                                        placeholder="Enter your full address..."
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium min-h-[100px]"
                                        value={customerDetails.address}
                                        onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
                                    <textarea
                                        placeholder="Any special instructions..."
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium h-20"
                                        value={customerDetails.notes}
                                        onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('cart')}
                                className="col-span-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader className="animate-spin" size={20} /> : (
                                    <>
                                        <span>{mode === 'estimate' ? 'Request Estimate' : 'Place Order'}</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};
