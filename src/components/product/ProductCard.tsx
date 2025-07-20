import React from 'react';
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

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails, 
  className,
  showPrices = true
}) => {
  const { t } = useLanguage();

  return (
    <Card 
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
        
        <div className="aspect-square rounded-lg bg-white mb-4 overflow-hidden border border-gray-200">
          <img
            src={product.image_url || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-2"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {product.category}
              {product.subcategory && ` / ${product.subcategory}`}
            </span>
            {showPrices && (
              <span className="text-sm font-medium text-gray-900">
                €{product.price.toLocaleString()}
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 group-hover:bg-red-50 group-hover:border-red-300"
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
};