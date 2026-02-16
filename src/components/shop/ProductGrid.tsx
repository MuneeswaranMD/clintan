import React, { useRef, useCallback } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Loader } from 'lucide-react';
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts';

interface ProductGridProps {
    userId: string;
    cart: { [key: string]: number };
    onUpdateCart: (product: Product, quantity: number) => void;
    currency?: string;
    enableStock?: boolean;
    searchTerm?: string;
    category?: string;
    viewMode: 'grid' | 'list';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
    userId,
    cart,
    onUpdateCart,
    currency = '₹',
    enableStock = true,
    searchTerm = '',
    viewMode
}) => {
    const { products, loading, hasMore, loadMore } = useInfiniteProducts({
        userId,
        searchTerm
    });

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

    return (
        <div className={`
      grid gap-4 
      ${viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' // Mobile: 2 cols, Desktop: 4+ cols
                : 'grid-cols-1 md:grid-cols-2 gap-y-4'}
    `}>
            {products.map((product, index) => {
                const isLast = index === products.length - 1;
                return (
                    <div key={product.id} ref={isLast ? lastElementRef : null} className="h-full">
                        <ProductCard
                            product={product}
                            quantity={cart[product.id] || 0}
                            onUpdateQuantity={(qty) => onUpdateCart(product, qty)}
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
