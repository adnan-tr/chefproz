import React, { useState } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  showSupplierCode?: boolean;
  showDiscountInput?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  open,
  onClose,
  showSupplierCode = false,
  showDiscountInput = false,
}) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  if (!product) return null;

  const discountedPrice = product.price * (1 - discount / 100);

  const handleAddToInquiry = () => {
    // Add to inquiry logic here
    console.log('Adding to inquiry:', { 
      product, 
      quantity, 
      discount: showDiscountInput ? discount : undefined 
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center p-4">
            <img
              src={product.image_url || '/placeholder-product.svg'}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">{t('products.description')}</Label>
              <p className="text-gray-900 mt-1 leading-relaxed">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">{t('products.category')}</Label>
                <p className="text-gray-900 mt-1">{product.category}</p>
              </div>
              
              {product.subcategory && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">{t('products.subcategory')}</Label>
                  <p className="text-gray-900 mt-1">{product.subcategory}</p>
                </div>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {showSupplierCode ? t('products.supplier_code') : t('products.product_code')}
              </Label>
              <p className="text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                {showSupplierCode ? product.supplier_code : product.code}
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">{t('products.price')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {showDiscountInput && discount > 0 && (
                    <span className="text-lg line-through text-gray-500">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-blue-600">
                    ${(showDiscountInput ? discountedPrice : product.price).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {showDiscountInput && (
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium text-gray-600">
                    {t('products.discount')}
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="mt-1"
                    min="0"
                    max="100"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-600">{t('products.quantity')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleAddToInquiry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('products.add_to_inquiry')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};