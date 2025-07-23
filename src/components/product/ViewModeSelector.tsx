import React from 'react';
import { Button } from '../ui/button';
import { Infinity, Grid3X3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ViewMode } from '../../hooks/useInoksanProducts';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalProducts: number;
  displayedProducts: number;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
  totalProducts,
  displayedProducts,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-sm text-slate-600">
          <span className="font-medium">
            {t('products.showing', 'Showing')} {displayedProducts} {t('products.of', 'of')} {totalProducts} {t('products.products', 'products')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {t('products.view_mode', 'View Mode')}:
          </span>
          
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <Button
              variant={viewMode === 'infinite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('infinite')}
              className={`rounded-none border-0 ${
                viewMode === 'infinite'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              <Infinity className="h-4 w-4 mr-2" />
              {t('products.infinite_scroll', 'Infinite Scroll')}
            </Button>
            
            <Button
              variant={viewMode === 'pagination' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('pagination')}
              className={`rounded-none border-0 ${
                viewMode === 'pagination'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              {t('products.pagination', 'Pagination')}
            </Button>
          </div>
        </div>
      </div>
      
      {viewMode === 'infinite' && displayedProducts < totalProducts && (
        <div className="text-sm text-slate-500">
          {t('products.scroll_for_more', 'Scroll down to load more products')}
        </div>
      )}
    </div>
  );
};