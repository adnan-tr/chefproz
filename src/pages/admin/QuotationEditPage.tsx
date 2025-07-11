import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Trash2, Plus, Save, X } from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface QuotationItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

interface Quotation {
  id: string;
  quotation_number: string;
  client_id: string;
  title: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  status: string;
  valid_until: string;
  notes?: string;
  created_at: string;
  customer_reference?: string;
}

const QuotationEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    customer_reference: '',
    discount: 0,
    valid_until: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      loadQuotationData();
    }
  }, [id]);

  const loadQuotationData = async () => {
    try {
      setLoading(true);
      
      // Load quotation
      const quotationData = await dbService.getQuotationById(id!);
      if (quotationData) {
        setQuotation(quotationData);
        setFormData({
          title: quotationData.title || '',
          customer_reference: quotationData.customer_reference || '',
          discount: quotationData.discount || 0,
          valid_until: quotationData.valid_until || '',
          notes: quotationData.notes || '',
          status: quotationData.status || 'draft'
        });
        
        // Load client
        const clientData = await dbService.getClientById(quotationData.client_id);
        setClient(clientData);
        
        // Load quotation items
        const items = await dbService.getQuotationItems(quotationData.id);
        if (items && items.length > 0) {
          const itemsWithProducts = await Promise.all(
            items.map(async (item: any) => {
              const product = await dbService.getProductById(item.product_id);
              return {
                ...item,
                product: product
              };
            })
          );
          setQuotationItems(itemsWithProducts);
        }
      }
      
      // Load products and clients for modals
      const [productsData] = await Promise.all([
        dbService.getProducts()
      ]);
      
      setProducts(productsData || []);
      
    } catch (error) {
      console.error('Error loading quotation data:', error);
      toast.error('Failed to load quotation data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quotation) return;
    
    try {
      setSaving(true);
      
      const updatedQuotation = {
        ...quotation,
        ...formData,
        final_amount: calculateFinalAmount()
      };
      
      await dbService.updateQuotation(quotation.id, updatedQuotation);
      toast.success('Quotation updated successfully');
      
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  const calculateSubtotal = () => {
    return quotationItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * formData.discount / 100);
  };

  const addProduct = (product: Product) => {
    const newItem: QuotationItem = {
      product_id: product.id,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
      product: product
    };
    setQuotationItems([...quotationItems, newItem]);
    setShowProductModal(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...quotationItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total_price = quantity * updatedItems[index].unit_price;
    setQuotationItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = quotationItems.filter((_, i) => i !== index);
    setQuotationItems(updatedItems);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quotation Not Found</h1>
          <p className="text-gray-600 mb-6">The quotation you're looking for doesn't exist.</p>
          <Button onClick={() => window.close()}>Close Window</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Quotation</h1>
            <p className="text-gray-600">{quotation.quotation_number}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.close()}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Quotation title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_reference">Customer Reference</Label>
                    <Input
                      id="customer_reference"
                      value={formData.customer_reference}
                      onChange={(e) => setFormData({ ...formData, customer_reference: e.target.value })}
                      placeholder="Customer reference"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Products</CardTitle>
                  <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Select Product</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button size="sm" onClick={() => addProduct(product)}>
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                {client ? (
                  <div className="space-y-2">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                    {client.company && (
                      <p className="text-sm text-gray-600">{client.company}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No client selected</p>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({formData.discount}%):</span>
                  <span>-${(calculateSubtotal() * formData.discount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateFinalAmount().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationEditPage;