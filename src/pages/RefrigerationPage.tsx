import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductModal } from '../components/product/ProductModal';
import { CategoryFilters } from '../components/product/CategoryFilters';
import { PaginationControls } from '../components/product/PaginationControls';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageConfig } from '../contexts/PageConfigContext';
import { useProducts } from '../hooks/useProducts';

const RefrigerationPage: React.FC = () => {
  const { t } = useLanguage();
  const { isPageActive, shouldShowPrices } = usePageConfig();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [filteredDisplayCount, setFilteredDisplayCount] = useState(50);
  const [viewMode, setViewMode] = useState<'infinite' | 'pagination'>('pagination');
  const [currentPage, setCurrentPage] = useState(1);

  // Get current page status
  const pageActive = isPageActive('refrigeration');
  const showPrices = shouldShowPrices('refrigeration');

  // Fetch all products with page_reference 'refrigeration'
  const { products: allProducts, loading } = useProducts({
    pageReference: 'refrigeration',
    limit: 50000
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



  // Categories derived from all products
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
  }, [allProducts]);

  // Subcategories derived from all products based on selected category
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
      setCurrentPage(1);
    }
  }, [searchTerm, selectedCategory, selectedSubcategory, viewMode]);

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

  // Pagination functions
  const totalPages = Math.ceil(filteredAllProducts.length / 50);
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const nextPage = () => goToPage(currentPage + 1);
  const previousPage = () => goToPage(currentPage - 1);

  // Custom load more function for filtered products
  const loadMoreFiltered = () => {
    if (viewMode === 'infinite' && filteredDisplayCount < filteredAllProducts.length) {
      setFilteredDisplayCount(prev => Math.min(prev + 30, filteredAllProducts.length));
    }
  };

  // Check if there are more filtered products to load
  const hasMoreFiltered = viewMode === 'infinite' && filteredDisplayCount < filteredAllProducts.length;

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
  }, [viewMode, hasMoreFiltered, loading]);

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
      <section className="hero-refrigeration text-white py-20">
        <div className="relative px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl font-bold mb-6">
            {t('products.refrigeration_title')}
          </h1>
          <p className="text-xl leading-relaxed opacity-90">
            {t('products.refrigeration_description')}
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
                  placeholder={t('products.search_refrigeration')}
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
              
              {/* Pagination Controls */}
              {viewMode === 'pagination' && (
                <div className="mt-8">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    onPrevious={previousPage}
                    onNext={nextPage}
                  />
                </div>
              )}
              
              {/* Infinite Scroll Loading Indicator */}
              {viewMode === 'infinite' && hasMoreFiltered && (
                <div className="flex justify-center items-center mt-8 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-3" />
                  <span className="text-slate-600 font-medium">{t('products.loading_more')}</span>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {viewMode === 'infinite' && !hasMoreFiltered && (
                <div className="text-center mt-8 py-8 border-t border-slate-200">
                  <div className="text-slate-400 text-2xl mb-2">✨</div>
                  <p className="text-slate-600 font-medium">{t('products.end_of_results')}</p>
                  <p className="text-slate-500 text-sm mt-1">{t('products.total_products_shown').replace('{count}', filteredProducts.length.toString())}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-slate-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('products.no_products_found')}</h3>
              <p className="text-slate-500 mb-6">{t('products.try_different_search')}</p>
              <Button onClick={handleClearFilters} className="btn-primary">
                {t('products.clear_filters')}
              </Button>
            </div>
          )}
        </div>

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default RefrigerationPage;