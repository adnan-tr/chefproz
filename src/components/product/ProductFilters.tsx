import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (value: string) => void;
  categories: string[];
  subcategories: string[];
  onClearFilters: () => void;
  showDiscountInput?: boolean;
  discount?: number;
  onDiscountChange?: (value: number) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  categories,
  subcategories,
  onClearFilters,
  showDiscountInput = false,
  discount = 0,
  onDiscountChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.search')}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder={t('products.search')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.category')}
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('products.all_categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('products.all_categories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Filter */}
        <div className="w-full lg:w-48">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.subcategory')}
          </Label>
          <Select value={selectedSubcategory} onValueChange={onSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('products.all_subcategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('products.all_subcategories')}</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Discount Input (Inoksan page only) */}
        {showDiscountInput && (
          <div className="w-full lg:w-32">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.discount')}
            </Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => onDiscountChange?.(Number(e.target.value))}
              min="0"
              max="100"
              placeholder="0"
            />
          </div>
        )}

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full lg:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          {t('products.clear')}
        </Button>
      </div>
    </div>
  );
};