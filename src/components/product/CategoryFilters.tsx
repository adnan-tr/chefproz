import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Factory, 
  Snowflake, 
  ChefHat, 
  Utensils,
  Thermometer,
  Zap,
  Settings,
  Package
} from 'lucide-react';

interface CategoryFiltersProps {
  categories: string[];
  subcategories: string[];
  selectedCategory: string;
  selectedSubcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'Cooking Equipment': ChefHat,
    'Preparation Equipment': Utensils,
    'Cleaning Equipment': Settings,
    'Walk-in Units': Factory,
    'Blast Chillers': Snowflake,
    'Display Units': Package,
    'Under-counter Units': Package,
    'Ice Equipment': Snowflake,
    'Specialty Units': Thermometer,
    'Cutlery': ChefHat,
    'Mixing Equipment': Settings,
    'Preparation Tools': Utensils,
    'Measuring Tools': Settings,
    'Blending Equipment': Zap,
    'Slicing Equipment': ChefHat,
    'Serving Equipment': Utensils,
    'Service Carts': Package,
    'Furniture': Factory,
    'Beverage Equipment': Package,
  };
  
  const IconComponent = iconMap[category] || Package;
  return IconComponent;
};

const getSubcategoryIcon = (subcategory: string) => {
  const iconMap: Record<string, any> = {
    'Gas Ranges': ChefHat,
    'Fryers': Zap,
    'Work Tables': Factory,
    'Ovens': Thermometer,
    'Dishwashers': Settings,
    'Food Processors': Utensils,
    'Coolers': Snowflake,
    'Rapid Cooling': Snowflake,
    'Refrigerated Display': Package,
    'Freezers': Snowflake,
    'Ice Makers': Snowflake,
    'Wine Storage': Package,
    'Chef Knives': ChefHat,
    'Stand Mixers': Settings,
    'Cutting Boards': Utensils,
    'Scales': Settings,
    'Hand Blenders': Zap,
    'Manual Slicers': ChefHat,
    'Buffet Stations': Utensils,
    'Room Service': Package,
    'Seating': Factory,
    'Chafing Dishes': Utensils,
    'Tables': Factory,
    'Dispensers': Package,
  };
  
  const IconComponent = iconMap[subcategory] || Package;
  return IconComponent;
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></span>
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          <Card
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
              selectedCategory === 'all' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white shadow-md' 
                : 'bg-white border-red-200 hover:border-red-300 text-slate-700'
            )}
            onClick={() => onCategoryChange('all')}
          >
            <CardContent className="p-2 flex items-center space-x-2">
              <Package className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">All Categories</span>
            </CardContent>
          </Card>
          
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <Card
                key={category}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white shadow-md' 
                    : 'bg-white border-red-200 hover:border-red-300 text-slate-700'
                )}
                onClick={() => onCategoryChange(category)}
              >
                <CardContent className="p-2 flex items-center space-x-2">
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">{category}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subcategories - Only show when a specific category is selected */}
      {selectedCategory !== 'all' && (
        <>
          {/* Elegant Separator */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center">
              <Badge 
                variant="outline" 
                className="bg-white px-4 py-1 text-slate-600 border-slate-300 shadow-sm font-medium text-xs"
              >
                Subcategories
              </Badge>
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <div className="flex flex-wrap gap-2">
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
                  selectedSubcategory === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-blue-200 hover:border-blue-300 text-slate-700'
                )}
                onClick={() => onSubcategoryChange('all')}
              >
                <CardContent className="p-2 flex items-center space-x-2">
                  <Package className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">All</span>
                </CardContent>
              </Card>
              
              {subcategories.map((subcategory) => {
                const Icon = getSubcategoryIcon(subcategory);
                return (
                  <Card
                    key={subcategory}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
                      selectedSubcategory === subcategory 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white border-blue-200 hover:border-blue-300 text-slate-700'
                    )}
                    onClick={() => onSubcategoryChange(subcategory)}
                  >
                    <CardContent className="p-2 flex items-center space-x-2">
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs font-medium whitespace-nowrap">{subcategory}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};