import React, { useRef, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import { Loader } from 'lucide-react';
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts';
import { useShop } from '../../context/ShopContext';

interface GlobalProductGridProps {
    userId: string;
    currency?: string;
    enableStock?: boolean;
    searchTerm?: string;
    category?: string;
    viewMode: 'grid' | 'list';
    pageSize?: number;
}

export const GlobalProductGrid: React.FC<GlobalProductGridProps> = ({
    userId,
    currency = '₹',
    enableStock = true,
    searchTerm = '',
    viewMode,
    pageSize = 20
}) => {
    const { products, loading, hasMore, loadMore } = useInfiniteProducts({
        userId,
        searchTerm,
        initialPageSize: pageSize
    });

    // Access Global Cart
    const { cart, addToCart, updateQuantity } = useShop();

    const observer = useRef<IntersectionObserver | null>(null);

    // Infinite Scroll Observer
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // Helper to get quantity for a specific product
    const getProductQuantity = (productId: string) => {
        const item = cart.find(i => i.product.id === productId);
        return item ? item.quantity : 0;
    };

    // Helper to handle quantity updates
    const handleUpdateQuantity = (product: any, qty: number) => {
        if (qty === 0) {
            // Remove
            updateQuantity(product.id, 0);
        } else {
            // If item exists, update. If not, add (but ProductCard logic handles this via qty check usually)
            // Simpler: Just map to Context functions
            const currentQty = getProductQuantity(product.id);
            if (currentQty === 0 && qty > 0) {
                addToCart(product, qty);
            } else {
                updateQuantity(product.id, qty);
            }
        }
    }

    return (
        <div className={`
      grid gap-4 
      ${viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1 md:grid-cols-2 gap-y-4'}
    `}>
            {products.map((product, index) => {
                const isLast = index === products.length - 1;
                return (
                    <div key={product.id} ref={isLast ? lastElementRef : null} className="h-full">
                        <ProductCard
                            product={product}
                            quantity={getProductQuantity(product.id)}
                            onUpdateQuantity={(qty) => handleUpdateQuantity(product, qty)}
                            currency={currency}
                            enableStock={enableStock}
                            layout={viewMode}
                        />
                    </div>
                );
            })}

            {loading && (
                <div className="col-span-full flex justify-center p-8">
                    <Loader className="animate-spin text-blue-500" size={32} />
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                    <p>No products found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};
