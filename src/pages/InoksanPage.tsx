import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductModal } from '../components/product/ProductModal';
import { CategoryFilters } from '../components/product/CategoryFilters';
import { PaginationControls } from '../components/product/PaginationControls';
import { ViewModeSelector } from '../components/product/ViewModeSelector';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageConfig } from '../contexts/PageConfigContext';
import { useInoksanProducts } from '../hooks/useInoksanProducts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const InoksanPage: React.FC = () => {
  const { t } = useLanguage();
  const { isPageActive, shouldShowPrices } = usePageConfig();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [filteredDisplayCount, setFilteredDisplayCount] = useState(50);

  // Get current page status
  const pageActive = isPageActive('inoksan');
  const showPrices = shouldShowPrices('inoksan');

  const {
    allProducts,
    categories,
    loading,
    viewMode,
    currentPage,
    hasMore,
    setViewMode,
    loadMore,
    goToPage
  } = useInoksanProducts();

  // Set up infinite scroll only when in infinite mode
  useInfiniteScroll({
    hasMore: viewMode === 'infinite' && hasMore,
    loading,
    onLoadMore: viewMode === 'infinite' ? loadMore : () => {},
    threshold: 300
  });

  // Check if page is active
  if (!pageActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">{t('common.page_not_available')}</h1>
          <p className="text-slate-600">{t('common.page_disabled')}</p>
        </div>
      </div>
    );
  }




  // Categories and subcategories are now derived from products
  const subcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const subcategorySet = new Set<string>();
    allProducts.forEach(product => {
      if (product.category === selectedCategory && product.subcategory && product.subcategory.trim() !== '') {
        subcategorySet.add(product.subcategory);
      }
    });
    return Array.from(subcategorySet).sort();
  }, [allProducts, selectedCategory]);

  // First filter all products based on search and category criteria
  const filteredAllProducts = useMemo(() => {
    try {
      return allProducts.filter(product => {
        if (!product) return false;
        
        const productName = (product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        const productCode = (product.code || '').toLowerCase();
        const productSupplierCode = (product.supplier_code || '').toLowerCase();
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        const matchesSearch = searchTermLower === '' || 
                             productName.includes(searchTermLower) ||
                             productDescription.includes(searchTermLower) ||
                             productCode.includes(searchTermLower) ||
                             productSupplierCode.includes(searchTermLower);
        
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
        
        return matchesSearch && matchesCategory && matchesSubcategory;
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      return allProducts;
    }
  }, [allProducts, searchTerm, selectedCategory, selectedSubcategory]);

  // Reset display count when filters change
  useEffect(() => {
    setFilteredDisplayCount(50);
    if (viewMode === 'pagination') {
      goToPage(1);
    }
  }, [searchTerm, selectedCategory, selectedSubcategory, viewMode, goToPage]);

  // Then apply display logic (pagination/infinite scroll) to filtered products
  const filteredProducts = useMemo(() => {
    if (viewMode === 'infinite') {
      return filteredAllProducts.slice(0, filteredDisplayCount);
    } else {
      // Pagination mode
      const startIndex = (currentPage - 1) * 50; // ITEMS_PER_PAGE
      const endIndex = startIndex + 50;
      return filteredAllProducts.slice(startIndex, endIndex);
    }
  }, [filteredAllProducts, viewMode, filteredDisplayCount, currentPage]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
  };

  // Custom load more function for filtered products
  const loadMoreFiltered = () => {
    if (viewMode === 'infinite' && filteredDisplayCount < filteredAllProducts.length) {
      setFilteredDisplayCount(prev => Math.min(prev + 30, filteredAllProducts.length));
    }
  };

  // Check if there are more filtered products to load
  const hasMoreFiltered = viewMode === 'infinite' && filteredDisplayCount < filteredAllProducts.length;

  // Pagination functions for filtered products
  const filteredTotalPages = Math.ceil(filteredAllProducts.length / 50);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= filteredTotalPages) {
      goToPage(page);
    }
  };

  const handleNextPage = () => {
    if (currentPage < filteredTotalPages) {
      goToPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Infinite scroll effect for filtered products
  useEffect(() => {
    if (viewMode !== 'infinite') return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasMoreFiltered && !loading) {
          loadMoreFiltered();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, hasMoreFiltered, loading, loadMoreFiltered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('products.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Abstract Background */}
      <section className="hero-inoksan text-white py-20">
        <div className="relative px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl font-bold mb-6">
            {t('products.inoksan_title')}
          </h1>
          <p className="text-xl leading-relaxed opacity-90">
            {t('products.inoksan_description')}
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="elegant-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('products.search_industrial')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="btn-secondary w-full lg:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              {t('products.clear_filters')}
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="elegant-card p-8 mb-8">
          <CategoryFilters
            categories={categories}
            subcategories={subcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={setSelectedCategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
        </div>

        {/* View Mode Selector */}
        <div className="mb-8">
          <ViewModeSelector
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalProducts={filteredAllProducts.length}
            displayedProducts={filteredProducts.length}
          />
        </div>

        {/* Products Grid */}
        <div className="elegant-card p-8">
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                    className="elegant-card"
                    showPrices={showPrices}
                  />
                ))}
              </div>
              
              {/* Pagination Controls - only show in pagination mode */}
              {viewMode === 'pagination' && filteredTotalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={filteredTotalPages}
                  onPageChange={handlePageChange}
                  onPrevious={handlePreviousPage}
                  onNext={handleNextPage}
                />
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  <span className="ml-2 text-slate-600">
                    {viewMode === 'infinite' ? t('products.loading_more', 'Loading more products...') : t('products.loading', 'Loading products...')}
                  </span>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {viewMode === 'infinite' && !hasMoreFiltered && !loading && filteredProducts.length >= 35 && (
                <div className="text-center mt-8 py-8 border-t border-slate-200">
                  <p className="text-slate-500 font-medium">{t('products.all_loaded', 'All products loaded')}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {t('products.showing_count', 'Showing {count} products').replace('{count}', filteredProducts.length.toString())}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-slate-400 text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('products.no_products_found')}</h3>
              <p className="text-slate-600 text-lg">{t('products.try_adjusting_filters')}</p>
            </div>
          )}
        </div>

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          showSupplierCode={true}
          showDiscountInput={true}
        />
      </div>
    </div>
  );
};

export default InoksanPage;