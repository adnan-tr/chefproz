import React, { useState, useEffect, useMemo } from 'react';
import { CategoryFilters } from '@/components/product/CategoryFilters';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductModal } from '@/components/product/ProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageConfig } from '@/contexts/PageConfigContext';
import { Product } from '@/types';
import { Search, X } from 'lucide-react';
import { dbService } from '@/lib/supabase';

const HotelEquipmentPage: React.FC = () => {
  const { t } = useLanguage();
  const { isPageActive, shouldShowPrices } = usePageConfig();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get current page status
  const pageActive = isPageActive('hotel-equipment');
  const showPrices = shouldShowPrices('hotel-equipment');

  // Check if page is active
  if (!pageActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Available</h1>
          <p className="text-slate-600">This page is currently disabled.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await dbService.getProducts('hotel-equipment');
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        
        // Filter for hotel-related products
        const productName = (product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        const productCode = (product.code || '').toLowerCase();
        
        const isHotelProduct = 
          productName.includes('hotel') ||
          productName.includes('banquet') ||
          productName.includes('serving') ||
          productName.includes('trolley') ||
          productName.includes('cart') ||
          productName.includes('dish') ||
          productName.includes('tray') ||
          productName.includes('collect') ||
          productName.includes('transport') ||
          productDescription.includes('hotel') ||
          productDescription.includes('banquet') ||
          productDescription.includes('serving') ||
          productDescription.includes('trolley') ||
          productCode.includes('tr') ||
          productCode.includes('cart') ||
          product.category === 'Trolley';
        
        const searchTermLower = searchTerm.toLowerCase().trim();
        const matchesSearch = searchTermLower === '' || 
                             productName.includes(searchTermLower) ||
                             productDescription.includes(searchTermLower) ||
                             productCode.includes(searchTermLower);
        
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
        
        return isHotelProduct && matchesSearch && matchesCategory && matchesSubcategory;
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      return products; // Return all products if filtering fails
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
            {t('nav.hotel_equipment')}
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            {t('products.hotel_equipment_description')}
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
                  placeholder={t('products.search_hotel_equipment')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default HotelEquipmentPage;