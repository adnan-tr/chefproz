import { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { dbService } from '../lib/supabase';

export type ViewMode = 'infinite' | 'pagination';

interface UseInoksanProductsReturn {
  allProducts: Product[];
  displayedProducts: Product[];
  categories: string[];
  loading: boolean;
  viewMode: ViewMode;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  setViewMode: (mode: ViewMode) => void;
  loadMore: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

const INITIAL_DISPLAY_COUNT = 50;
const LOAD_MORE_COUNT = 30;
const ITEMS_PER_PAGE = 50;

export const useInoksanProducts = (): UseInoksanProductsReturn => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('infinite');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all products on initial load
  useEffect(() => {
    const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const products = await dbService.getProducts('inoksan');
      setAllProducts(products || []);
      } catch (error) {
        console.error('Error fetching INOKSAN products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Derive categories from all products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allProducts.forEach(product => {
      if (product.category && product.category.trim() !== '') {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [allProducts]);

  // Calculate displayed products based on view mode
  const displayedProducts = useMemo(() => {
    if (viewMode === 'infinite') {
      return allProducts.slice(0, displayCount);
    } else {
      // Pagination mode
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return allProducts.slice(startIndex, endIndex);
    }
  }, [allProducts, viewMode, displayCount, currentPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
  const hasMore = viewMode === 'infinite' ? displayCount < allProducts.length : false;

  // Load more products for infinite scroll
  const loadMore = () => {
    if (viewMode === 'infinite' && hasMore) {
      setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, allProducts.length));
    }
  };

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Reset display when switching view modes
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'infinite') {
      setDisplayCount(INITIAL_DISPLAY_COUNT);
    } else {
      setCurrentPage(1);
    }
  };

  return {
    allProducts,
    displayedProducts,
    categories,
    loading,
    viewMode,
    currentPage,
    totalPages,
    hasMore,
    setViewMode: handleSetViewMode,
    loadMore,
    goToPage,
    nextPage,
    previousPage: prevPage,
  };
};