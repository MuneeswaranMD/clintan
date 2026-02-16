import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, DollarSign, User, Barcode, Grid, List } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { Product } from '../../types';

interface CartItem {
    product: Product;
    quantity: number;
    subtotal: number;
}

export const POS: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const productsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];

            setProducts(productsList);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product.id === product.id);

        if (existingItem) {
            updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            const newItem: CartItem = {
                product,
                quantity: 1,
                subtotal: product.pricing?.sellingPrice || 0
            };
            setCart([...cart, newItem]);
        }
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item => {
            if (item.product.id === productId) {
                return {
                    ...item,
                    quantity: newQuantity,
                    subtotal: (item.product.pricing?.sellingPrice || 0) * newQuantity
                };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const calculateTax = () => {
        const total = calculateTotal();
        return total * 0.18; // 18% GST
    };

    const calculateGrandTotal = () => {
        return calculateTotal() + calculateTax();
    };

    const processCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        setProcessing(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            // Create order
            const orderData = {
                userId: user.uid,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || '',
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.pricing?.sellingPrice || 0,
                    subtotal: item.subtotal
                })),
                subtotal: calculateTotal(),
                tax: calculateTax(),
                total: calculateGrandTotal(),
                paymentMethod,
                status: 'completed',
                source: 'POS',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'orders'), orderData);

            // Update stock for each product
            for (const item of cart) {
                if (item.product.stock !== undefined) {
                    const productRef = doc(db, 'products', item.product.id);
                    await updateDoc(productRef, {
                        stock: item.product.stock - item.quantity
                    });
                }
            }

            alert('✅ Sale completed successfully!');
            clearCart();
        } catch (error) {
            console.error('Failed to process checkout:', error);
            alert('❌ Failed to process sale. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <ShoppingCart size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Point of Sale</h1>
                            <p className="text-blue-100 text-sm font-semibold">Quick checkout system</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Products Section */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-semibold"
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                            : 'space-y-3'
                        }>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'
                                        }`}
                                >
                                    <div className={`bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center ${viewMode === 'list' ? 'w-16 h-16' : 'w-full h-32 mb-3'
                                        }`}>
                                        <Barcode className="text-blue-600" size={viewMode === 'list' ? 24 : 32} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-blue-600">
                                                ₹{product.pricing?.sellingPrice || 0}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${(product.stock || 0) > 10
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                Stock: {product.stock || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                <div className="w-96 bg-white border-l-2 border-gray-200 flex flex-col">
                    {/* Cart Header */}
                    <div className="p-6 border-b-2 border-gray-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Current Sale</h2>

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    placeholder="Walk-in Customer"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="mx-auto text-gray-300 mb-3" size={48} />
                                <p className="text-gray-500 font-semibold">Cart is empty</p>
                                <p className="text-sm text-gray-400">Add products to start</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.product.id} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.product.name}</h4>
                                                <p className="text-sm text-gray-500">₹{item.product.pricing?.sellingPrice} each</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <span className="font-black text-blue-600">₹{item.subtotal}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t-2 border-gray-200 space-y-4">
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['cash', 'card', 'upi'] as const).map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-2 rounded-lg font-bold transition-all ${paymentMethod === method
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {method.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-semibold">Subtotal:</span>
                                    <span className="font-bold">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-semibold">Tax (18%):</span>
                                    <span className="font-bold">₹{calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t-2 border-gray-200">
                                    <span>Total:</span>
                                    <span className="text-blue-600">₹{calculateGrandTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={processCheckout}
                                    disabled={processing}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Complete Sale
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
