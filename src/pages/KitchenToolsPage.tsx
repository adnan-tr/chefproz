import React, { useState, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductModal } from '../components/product/ProductModal';
import { CategoryFilters } from '../components/product/CategoryFilters';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageSettings } from '../hooks/usePageSettings';
import { usePriceSettings } from '../hooks/usePriceSettings';
import { useLazyProducts } from '../hooks/useLazyProducts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const KitchenToolsPage: React.FC = () => {
  const { t } = useLanguage();
  const { isPageActive } = usePageSettings();
  const { shouldShowPrices } = usePriceSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get current page status
  const pageActive = isPageActive;
  const showPrices = shouldShowPrices;

  // Filter function for kitchen tools products
  // Use lazy loading for products - fetch products with page_reference 'kitchen-tools'
  const { products, loading, loadingMore, hasMore, loadMore } = useLazyProducts({
    pageReference: 'kitchen-tools',
    initialCount: 200,  // Show more products initially
    loadMoreCount: 100   // Load more products at once
  });

  // Enable infinite scroll
  useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
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



  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  }, [products]);

  const subcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return Array.from(new Set(products.map(p => p.subcategory).filter((subcat): subcat is string => subcat !== undefined)));
    }
    return Array.from(new Set(
      products
        .filter(p => p.category === selectedCategory)
        .map(p => p.subcategory)
        .filter((subcat): subcat is string => subcat !== undefined)
    ));
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    try {
      return products.filter(product => {
        if (!product) return false;
        
        const productName = (product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        const productCode = (product.code || '').toLowerCase();
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        const matchesSearch = searchTermLower === '' || 
                             productName.includes(searchTermLower) ||
                             productDescription.includes(searchTermLower) ||
                             productCode.includes(searchTermLower);
        
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
        
        return matchesSearch && matchesCategory && matchesSubcategory;
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [products, searchTerm, selectedCategory, selectedSubcategory]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
  };

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
      <section className="product-hero-abstract text-white py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl font-bold mb-6">
            {t('nav.kitchen_tools')}
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            {t('products.kitchen_tools_description')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="elegant-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('products.search_kitchen_tools')}
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
              
              {/* Load More Indicator */}
              {loadingMore && (
                <div className="flex justify-center items-center mt-8 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-3" />
                  <span className="text-slate-600 font-medium">{t('products.loading_more')}</span>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {!hasMore && !loadingMore && filteredProducts.length >= 35 && (
                <div className="text-center mt-8 py-8 border-t border-slate-200">
                  <p className="text-slate-500 font-medium">{t('products.all_loaded')}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {t('products.showing_count').replace('{count}', filteredProducts.length.toString())}
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
        />
      </div>
    </div>
  );
};

export default KitchenToolsPage;