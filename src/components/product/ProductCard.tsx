import React, { memo } from 'react';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  className?: string;
  showPrices?: boolean;
}

const ProductCardComponent = React.forwardRef<HTMLDivElement, ProductCardProps>(({ 
  product, 
  onViewDetails, 
  className,
  showPrices = true
}, ref) => {
  const { t } = useLanguage();

  return (
    <Card 
      ref={ref}
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-200 hover:border-red-200",
        className
      )}
      onClick={() => onViewDetails(product)}
    >
      <CardContent className="p-4">
        {/* Product Code Above Image */}
        <div className="text-xs font-mono text-slate-500 mb-2 bg-slate-100 px-2 py-1 rounded">
          {product.page_reference === 'inoksan' ? (product.supplier_code || product.code) : product.code}
        </div>
        
        {/* Product Image - Optimized with lazy loading and centered */}
        <div className="aspect-square rounded-lg bg-white mb-4 overflow-hidden border border-gray-200 flex items-center justify-center p-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center text-gray-400 ${product.image_url ? 'hidden' : ''}`}>
            <img
              src="/placeholder-product.svg"
              alt={product.name}
              className="w-full h-full object-contain opacity-50"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-gray-500 text-center">
              {product.category}
              {product.subcategory && ` / ${product.subcategory}`}
            </span>
            {showPrices && (
              <span className="text-lg font-bold text-gray-900 text-center">
                €{product.price.toLocaleString()}
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
          >
            {t('products.view_details')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCardComponent.displayName = 'ProductCard';

export const ProductCard = memo(ProductCardComponent);