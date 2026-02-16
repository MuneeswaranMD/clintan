import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../types';
import { productService } from '../services/firebaseService';
import { DocumentSnapshot } from 'firebase/firestore';

interface UseInfiniteProductsProps {
    userId: string;
    searchTerm?: string;
    initialPageSize?: number;
}

export const useInfiniteProducts = ({
    userId,
    searchTerm = '',
    initialPageSize = 20
}: UseInfiniteProductsProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

    const loadProducts = useCallback(async (isNewSearch = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const currentLastDoc = isNewSearch ? undefined : lastDoc;
            const { products: newProducts, lastDoc: newLastDoc } = await productService.getProductsPaginated(
                userId,
                initialPageSize,
                // @ts-ignore
                currentLastDoc
            );

            if (isNewSearch) {
                setProducts(newProducts);
            } else {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            }

            setLastDoc(newLastDoc);
            setHasMore(newProducts.length === initialPageSize);

        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    }, [userId, lastDoc, loading, initialPageSize]);

    useEffect(() => {
        setLastDoc(null);
        setProducts([]);
        setHasMore(true);
        loadProducts(true);
    }, [userId]); // Reset on User ID change. Search term filtering is client side for now.

    // Client-side filtering as fallback for small datasets
    // For large datasets, this hook should accept a search query and pass it to firebaseService
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        products: filteredProducts,
        loading,
        hasMore,
        loadMore: () => loadProducts(false),
        refresh: () => loadProducts(true)
    };
};
