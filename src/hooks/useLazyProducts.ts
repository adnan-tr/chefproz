import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { dbService } from "../lib/supabase";

interface UseLazyProductsOptions {
  brand?: string;
  pageReference?: string;
  filterFunction?: (products: Product[]) => Product[];
  initialCount?: number;
  loadMoreCount?: number;
}

export const useLazyProducts = ({
  brand,
  pageReference,
  filterFunction,
  initialCount = 100,  // Default value for other pages
  loadMoreCount = 50   // Default value for other pages
}: UseLazyProductsOptions = {}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shuffle array function (Fisher-Yates algorithm) - optimized
  const shuffleArray = useCallback((array: Product[]) => {
    if (array.length <= 1) return array;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Fetch all products initially
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (pageReference) {
          data = await dbService.getProducts(pageReference);
        } else if (brand) {
          // For brand filtering, we need to get all products and filter by brand
          const allData = await dbService.getProducts();
          data = allData?.filter(product => product.brand?.toLowerCase() === brand.toLowerCase()) || [];
        } else {
          data = await dbService.getProducts();
        }
        let products = data || [];
        
        // Apply custom filter if provided
        if (filterFunction) {
          products = filterFunction(products);
        }
        
        // Shuffle the products
        const shuffledProducts = shuffleArray(products);
        setAllProducts(shuffledProducts);
        
        // Set initial displayed products
        const initial = shuffledProducts.slice(0, initialCount);
        setDisplayedProducts(initial);
        setCurrentIndex(initialCount);
        setHasMore(shuffledProducts.length > initialCount);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [brand, pageReference, filterFunction, initialCount, shuffleArray]);

  // Load more products - optimized
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const nextProducts = allProducts.slice(currentIndex, currentIndex + loadMoreCount);
    setDisplayedProducts(prev => [...prev, ...nextProducts]);
    setCurrentIndex(prev => prev + loadMoreCount);
    setHasMore(currentIndex + loadMoreCount < allProducts.length);
    setLoadingMore(false);
  }, [allProducts, currentIndex, loadMoreCount, loadingMore, hasMore]);

  // Reset function to reshuffle and start over
  const reset = useCallback(() => {
    const shuffledProducts = shuffleArray(allProducts);
    setAllProducts(shuffledProducts);
    const initial = shuffledProducts.slice(0, initialCount);
    setDisplayedProducts(initial);
    setCurrentIndex(initialCount);
    setHasMore(shuffledProducts.length > initialCount);
  }, [allProducts, initialCount, shuffleArray]);

  return useMemo(() => ({
    products: displayedProducts,
    allProducts,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    reset
  }), [displayedProducts, allProducts, loading, loadingMore, hasMore, loadMore, reset]);
};