import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  Eye,
  Edit,
  Calendar,
  User,
  Building,
  FileText,
  AlertCircle,
  CheckSquare,
  Filter as FilterIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
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

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get all orders from the orders table
      const ordersData = await dbService.getOrders();
      
      // Transform orders data to match the expected interface
      const transformedOrders: Order[] = await Promise.all(
        ordersData.map(async (order: any) => {
          // Fetch order items for each order
          let orderItems: OrderItem[] = [];
          try {
            const items = await dbService.getOrderItems(order.id);
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
            console.error(`Error fetching items for order ${order.id}:`, error);
          }

          return {
            id: order.id,
            quotation_number: order.quotation?.quotation_number || order.order_number,
            client_name: order.client?.contact_person || 'Unknown',
            client_email: order.client?.email || '',
            client_company: order.client?.company_name || 'Unknown Company',
            title: order.title || order.quotation?.title || '',
            total_amount: order.total_amount || 0,
            final_amount: order.final_amount || 0,
            order_status: order.order_status || 'waiting_payment',
            payment_status: order.payment_status || 'pending',
            supplier_status: order.supplier_status || 'pending',
            shipment_status: order.shipment_status || 'pending',
            order_date: order.order_date || order.created_at,
            expected_delivery: order.expected_delivery || '',
            notes: order.notes || '',
            created_at: order.created_at,
            updated_at: order.updated_at,
            items: orderItems,
          };
        })
      );
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!editingOrder) return;

    try {
      // Filter out empty date strings to prevent database errors
      const cleanedFormData = { ...formData };
      if (cleanedFormData.expected_delivery === '') {
        delete cleanedFormData.expected_delivery;
      }
      
      // Update the order in the database
      await dbService.updateOrder(editingOrder.id, cleanedFormData);
      
      // Update the local state
      const updatedOrder = { ...editingOrder, ...cleanedFormData };
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ));
      
      setEditingOrder(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      order_status: order.order_status,
      payment_status: order.payment_status,
      supplier_status: order.supplier_status,
      shipment_status: order.shipment_status,
      expected_delivery: order.expected_delivery,
      notes: order.notes,
    });
  };
  
  // Handle selecting an order row
  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id === selectedOrderId ? null : id);
  };

  // Get the selected order object
  const selectedOrderObj = selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null;

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = orders.reduce(
    (acc, order) => {
      acc.total++;
      if (order.order_status === 'waiting_payment') acc.waitingPayment++;
      if (order.order_status === 'confirming_supplier') acc.confirmingSupplier++;
      if (order.order_status === 'shipment_ready') acc.shipmentReady++;
      if (order.order_status === 'delivered') acc.delivered++;
      acc.totalValue += order.final_amount;
      return acc;
    },
    { total: 0, waitingPayment: 0, confirmingSupplier: 0, shipmentReady: 0, delivered: 0, totalValue: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-2 truncate">Orders Management Dashboard</h1>
          <p className="text-slate-600 text-sm lg:text-lg">Track and manage confirmed quotations through their lifecycle</p>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.total}</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 shadow-sm flex-shrink-0">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Waiting Payment</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.waitingPayment}</p>
              </div>
              <div className="p-2 rounded-xl bg-yellow-50 shadow-sm flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">With Supplier</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.confirmingSupplier}</p>
              </div>
              <div className="p-2 rounded-xl bg-purple-50 shadow-sm flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Ready to Ship</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.shipmentReady}</p>
              </div>
              <div className="p-2 rounded-xl bg-green-50 shadow-sm flex-shrink-0">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Delivered</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.delivered}</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 shadow-sm flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Total Value</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">${orderStats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 shadow-sm flex-shrink-0">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Orders Table */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Orders List</CardTitle>
          <CardDescription className="text-sm lg:text-base">
            Track the progress of all confirmed orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showFilters && (
            <div className="bg-muted/50 p-4 rounded-md mb-6 border border-border">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                Advanced Filters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount-min">Min Amount</Label>
                  <Input
                    id="amount-min"
                    type="number"
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Order #</TableHead>
                    <TableHead className="min-w-[120px] hidden sm:table-cell">Client</TableHead>
                    <TableHead className="min-w-[150px]">Company</TableHead>
                    <TableHead className="min-w-[200px] hidden lg:table-cell">Title</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Order Date</TableHead>
                    <TableHead className="min-w-[120px] hidden xl:table-cell">Expected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      isSelectable
                      isSelected={selectedOrderId === order.id}
                      onSelect={handleSelectOrder}
                      onClick={() => {
                        const editUrl = `/secure-mgmt-portal-x7f9q2/orders/edit/${order.id}`;
                        window.open(editUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                      }}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium truncate">{order.quotation_number}</TableCell>
                      <TableCell className="truncate hidden sm:table-cell">{order.client_name}</TableCell>
                      <TableCell className="truncate">{order.client_company}</TableCell>
                      <TableCell className="truncate hidden lg:table-cell">{order.title}</TableCell>
                      <TableCell className="truncate">${order.final_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                      <TableCell className="truncate hidden md:table-cell">{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell className="truncate hidden xl:table-cell">
                        {order.expected_delivery ? 
                          new Date(order.expected_delivery).toLocaleDateString() : 
                          'TBD'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - {selectedOrder?.quotation_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedOrder.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                      <span>{selectedOrder.client_company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedOrder.client_email}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(selectedOrder.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Amount:</span>
                      <span>${selectedOrder.final_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Expected Delivery:</span>
                      <span>
                        {selectedOrder.expected_delivery ? 
                          new Date(selectedOrder.expected_delivery).toLocaleDateString() : 
                          'TBD'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Order Status</span>
                      <div className="mt-1">{getStatusBadge(selectedOrder.order_status)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Payment Status</span>
                      <div className="mt-1">
                        <Badge variant={selectedOrder.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {selectedOrder.payment_status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Supplier Status</span>
                      <div className="mt-1">
                        <Badge variant={selectedOrder.supplier_status === 'confirmed' ? 'default' : 'secondary'}>
                          {selectedOrder.supplier_status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Shipment Status</span>
                      <div className="mt-1">
                        <Badge variant={selectedOrder.shipment_status === 'delivered' ? 'default' : 'secondary'}>
                          {selectedOrder.shipment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Title and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Title</span>
                      <p className="mt-1">{selectedOrder.title}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <span className="font-medium text-sm text-muted-foreground">Notes</span>
                        <p className="mt-1 text-sm">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ${item.unit_price.toLocaleString()}
                            </p>
                            {item.discount_percentage > 0 && (
                              <p className="text-sm text-green-600">
                                Discount: {item.discount_percentage}%
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.total_price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Amount:</span>
                          <span>${selectedOrder.final_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No items found for this order.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Modal */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Order Status - {editingOrder?.quotation_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            
            <div>
              <Label htmlFor="expected_delivery">Expected Delivery Date</Label>
              <Input
                id="expected_delivery"
                type="date"
                value={formData.expected_delivery}
                onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes about this order..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrderStatus}>
              Update Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;