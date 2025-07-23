import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { dbService } from "../lib/supabase";

interface UseProductsOptions {
  brand?: string;
  pageReference?: string;
  filterFunction?: (products: Product[]) => Product[];
  limit?: number;
}

export const useProducts = ({
  brand,
  pageReference,
  filterFunction,
  limit = 50000
}: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Shuffle array function (Fisher-Yates algorithm)
  const shuffleArray = useCallback((array: Product[]) => {
    if (array.length <= 1) return array;
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Fetch all products
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
        let fetchedProducts = data || [];
        
        // Apply custom filter if provided
        if (filterFunction) {
          fetchedProducts = filterFunction(fetchedProducts);
        }
        
        // Apply limit if specified
        if (limit && fetchedProducts.length > limit) {
          fetchedProducts = fetchedProducts.slice(0, limit);
        }
        
        // Shuffle the products
        const shuffledProducts = shuffleArray(fetchedProducts);
        setProducts(shuffledProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [brand, pageReference, filterFunction, limit, shuffleArray]);

  return useMemo(() => ({
    products,
    loading
  }), [products, loading]);
};