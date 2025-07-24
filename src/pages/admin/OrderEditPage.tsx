import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, ArrowLeft, Save, Trash2, Plus, Search } from 'lucide-react';
import { dbService } from '@/lib/supabase';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage: number;
}

interface Order {
  id: string;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_company: string;
  title: string;
  total_amount: number;
  final_amount: number;
  order_status: string;
  payment_status: string;
  supplier_status: string;
  shipment_status: string;
  order_date: string;
  expected_delivery: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

const ORDER_STATUSES = [
  { value: 'waiting_payment', label: 'Waiting Payment', color: 'bg-yellow-500' },
  { value: 'payment_received', label: 'Payment Received', color: 'bg-blue-500' },
  { value: 'confirming_supplier', label: 'Confirming with Supplier', color: 'bg-purple-500' },
  { value: 'supplier_confirmed', label: 'Supplier Confirmed', color: 'bg-indigo-500' },
  { value: 'sending_money', label: 'Sending Money to Supplier', color: 'bg-orange-500' },
  { value: 'money_sent', label: 'Money Sent', color: 'bg-cyan-500' },
  { value: 'production_started', label: 'Production Started', color: 'bg-teal-500' },
  { value: 'shipment_ready', label: 'Shipment Ready', color: 'bg-green-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-emerald-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-600' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const OrderEditPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Order>>({});
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editingItems, setEditingItems] = useState<{[key: string]: Partial<OrderItem>}>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const ordersData = await dbService.getOrders();
      const orderData = ordersData.find((o: any) => o.id === id);
      
      if (orderData) {
        // Fetch order items
        let orderItems: OrderItem[] = [];
        try {
          const items = await dbService.getOrderItems(orderData.id);
          orderItems = items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            discount_percentage: item.discount_percentage || 0,
          }));
        } catch (error) {
          console.error(`Error fetching items for order ${orderData.id}:`, error);
        }

        const transformedOrder: Order = {
          id: orderData.id,
          quotation_number: orderData.quotation?.quotation_number || orderData.order_number,
          client_name: orderData.client?.contact_person || 'Unknown',
          client_email: orderData.client?.email || '',
          client_company: orderData.client?.company_name || 'Unknown Company',
          title: orderData.title || orderData.quotation?.title || '',
          total_amount: orderData.total_amount || 0,
          final_amount: orderData.final_amount || 0,
          order_status: orderData.order_status || 'waiting_payment',
          payment_status: orderData.payment_status || 'pending',
          supplier_status: orderData.supplier_status || 'pending',
          shipment_status: orderData.shipment_status || 'pending',
          order_date: orderData.order_date || orderData.created_at,
          expected_delivery: orderData.expected_delivery || '',
          notes: orderData.notes || '',
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          items: orderItems,
        };
        
        setOrder(transformedOrder);
        setFormData({
          order_status: transformedOrder.order_status,
          payment_status: transformedOrder.payment_status,
          supplier_status: transformedOrder.supplier_status,
          shipment_status: transformedOrder.shipment_status,
          expected_delivery: transformedOrder.expected_delivery,
          notes: transformedOrder.notes,
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      
      // Filter out empty date strings to prevent database errors
      const cleanedFormData = { ...formData };
      if (cleanedFormData.expected_delivery === '') {
        delete cleanedFormData.expected_delivery;
      }
      
      // Update the order in the database
      await dbService.updateOrder(order.id, cleanedFormData);
      
      // Update local state
      setOrder({ ...order, ...cleanedFormData });
      
      // Show success message
      alert('Order updated successfully!');
      
      // Optional: Navigate back to orders page instead of closing window
      // window.history.back();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleItemEdit = (itemId: string, field: string, value: number) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleRemoveItem = async (itemId: string, productName: string) => {
    const reason = prompt(`Please provide a reason for removing "${productName}" from this order:`);
    if (!reason) return;
    
    if (!order) return;

    try {
      setSaving(true);
      
      // Remove item from database using the correct method
      await dbService.deleteOrderItem(itemId);
      
      // Recalculate order total
      const remainingItems = order.items?.filter(item => item.id !== itemId) || [];
      const newTotal = remainingItems.reduce((sum, item) => sum + item.total_price, 0);
      await dbService.updateOrder(order.id, { final_amount: newTotal });
      
      // Refresh order data
      await fetchOrder(order.id);
      
      alert(`Item removed successfully. Reason: ${reason}`);
    } catch (error) {
      console.error('Error removing order item:', error);
      alert('Failed to remove order item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItemChanges = async () => {
    if (!order) return;

    try {
      setSaving(true);
      
      // Update each edited item
      for (const [itemId, changes] of Object.entries(editingItems)) {
        const originalItem = order.items?.find(item => item.id === itemId);
        if (originalItem && Object.keys(changes).length > 0) {
          const updatedItem = {
            ...changes,
            total_price: (changes.quantity || originalItem.quantity) * 
                        (changes.unit_price || originalItem.unit_price) * 
                        (1 - ((changes.discount_percentage || originalItem.discount_percentage) / 100))
          };
          
          // Update in database using the correct method
          await dbService.updateOrderItem(itemId, updatedItem);
        }
      }
      
      // Recalculate order total
       const newTotal = calculateTotalAmount();
       await dbService.updateOrder(order.id, { final_amount: newTotal });
      
      // Refresh order data
      await fetchOrder(order.id);
      
      // Reset editing state
      setIsEditingItems(false);
      setEditingItems({});
      
      alert('Order items updated successfully!');
    } catch (error) {
      console.error('Error updating order items:', error);
      alert('Failed to update order items. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!order?.items) return 0;
    return order.items.reduce((total, item) => {
      const quantity = editingItems[item.id]?.quantity || item.quantity;
      const unitPrice = editingItems[item.id]?.unit_price || item.unit_price;
      const discount = editingItems[item.id]?.discount_percentage || item.discount_percentage;
      return total + (quantity * unitPrice * (1 - discount / 100));
    }, 0);
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsData = await dbService.getProducts();
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = async (product: any) => {
    try {
      setSaving(true);
      const orderItem = {
        order_id: order!.id,
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price || 0,
        discount_percentage: 0
      };

      await dbService.addOrderItems([orderItem]);
      
      // Reload order data to get updated items
      await fetchOrder(order!.id);
      setShowProductModal(false);
      setProductSearchTerm('');
    } catch (error) {
      console.error('Error adding product to order:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return (
      <Badge 
        className={`${statusConfig?.color || 'bg-gray-500'} text-white hover:bg-gray-800 hover:text-white transition-colors duration-200 cursor-default`}
        variant="secondary"
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Edit Order - {order.quotation_number}
          </h1>
          <p className="text-muted-foreground">
            Update order status and details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.close()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Number</Label>
                <Input value={order.quotation_number} disabled />
              </div>
              <div>
                <Label>Order Date</Label>
                <Input value={new Date(order.order_date).toLocaleDateString()} disabled />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={order.title} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input value={`€${order.total_amount.toLocaleString()}`} disabled />
              </div>
              <div>
                <Label>Final Amount</Label>
                <Input value={`€${order.final_amount.toLocaleString()}`} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company</Label>
              <Input value={order.client_company} disabled />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={order.client_name} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={order.client_email} disabled />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>
            Update the various status fields for this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_status">Order Status</Label>
              <Select 
                value={formData.order_status} 
                onValueChange={(value) => setFormData({...formData, order_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value) => setFormData({...formData, payment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="supplier_status">Supplier Status</Label>
              <Select 
                value={formData.supplier_status} 
                onValueChange={(value) => setFormData({...formData, supplier_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="production">In Production</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="shipment_status">Shipment Status</Label>
              <Select 
                value={formData.shipment_status} 
                onValueChange={(value) => setFormData({...formData, shipment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="expected_delivery">Expected Delivery Date</Label>
            <Input
              id="expected_delivery"
              type="date"
              value={formData.expected_delivery}
              onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
            />
          </div>
          
          <div className="mt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any notes about this order..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium text-sm text-muted-foreground">Order Status</span>
              <div className="mt-1">{getStatusBadge(formData.order_status || order.order_status)}</div>
            </div>
            <div>
              <span className="font-medium text-sm text-muted-foreground">Payment Status</span>
              <div className="mt-1">
                <Badge variant={formData.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {formData.payment_status || order.payment_status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="font-medium text-sm text-muted-foreground">Supplier Status</span>
              <div className="mt-1">
                <Badge variant={formData.supplier_status === 'confirmed' ? 'default' : 'secondary'}>
                  {formData.supplier_status || order.supplier_status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="font-medium text-sm text-muted-foreground">Shipment Status</span>
              <div className="mt-1">
                <Badge variant={formData.shipment_status === 'delivered' ? 'default' : 'secondary'}>
                  {formData.shipment_status || order.shipment_status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Items
            <div className="flex gap-2">
              <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadProducts}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Product to Order</DialogTitle>
                    <DialogDescription>
                      Select a product to add to this order
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products by name or code..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {loadingProducts ? (
                      <div className="text-center py-8">
                        <p>Loading products...</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                  No products found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-mono text-sm">
                                    {product.code || 'N/A'}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {product.name}
                                  </TableCell>
                                  <TableCell>
                                    {product.category || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    €{(product.price || 0).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddProduct(product)}
                                      disabled={saving}
                                    >
                                      {saving ? 'Adding...' : 'Add'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {order.items && order.items.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingItems(!isEditingItems)}
                >
                  {isEditingItems ? 'Done Editing' : 'Edit Items'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!order.items || order.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this order yet.</p>
              <p className="text-sm">Use the "Add Product" button to add items.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    {isEditingItems ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editingItems[item.id]?.quantity || item.quantity}
                            onChange={(e) => handleItemEdit(item.id, 'quantity', parseInt(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingItems[item.id]?.unit_price || item.unit_price}
                            onChange={(e) => handleItemEdit(item.id, 'unit_price', parseFloat(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Discount (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editingItems[item.id]?.discount_percentage || item.discount_percentage}
                            onChange={(e) => handleItemEdit(item.id, 'discount_percentage', parseFloat(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × €{item.unit_price.toLocaleString()}
                      </p>
                    )}
                    {item.discount_percentage > 0 && !isEditingItems && (
                      <p className="text-sm text-green-600">
                        Discount: {item.discount_percentage}%
                      </p>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-medium">
                        €{(
                          (editingItems[item.id]?.quantity || item.quantity) * 
                          (editingItems[item.id]?.unit_price || item.unit_price) * 
                          (1 - ((editingItems[item.id]?.discount_percentage || item.discount_percentage) / 100))
                        ).toFixed(2)}
                      </p>
                    </div>
                    {isEditingItems && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.product_name)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Amount:</span>
                  <span>€{calculateTotalAmount().toFixed(2)}</span>
                </div>
              </div>
              {isEditingItems && (
                <div className="flex gap-2 pt-3">
                  <Button 
                    onClick={handleSaveItemChanges}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingItems({});
                      setIsEditingItems(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderEditPage;