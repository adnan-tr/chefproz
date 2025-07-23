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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  FileText, 
  Download,
  Search,
  Calendar
} from 'lucide-react';
import { dbService } from '@/lib/supabase';

interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_amount: number;
  client_count: number;
}

interface ClientReport {
  client_id: string;
  company_name: string;
  total_quotations: number;
  total_orders: number;
  total_quotation_amount: number;
  total_order_amount: number;
  conversion_rate: number;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('top-quoted-products');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  
  // Data states
  const [topQuotedProducts, setTopQuotedProducts] = useState<TopProduct[]>([]);
  const [topOrderedProducts, setTopOrderedProducts] = useState<TopProduct[]>([]);
  const [clientReports, setClientReports] = useState<ClientReport[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [dateRange, selectedClient]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [clientsData, quotationsData, ordersData, quotationItemsData, orderItemsData] = await Promise.all([
        dbService.getClients(),
        dbService.getQuotations(),
        dbService.getOrders(),
        dbService.getAllQuotationItems(),
        dbService.getAllOrderItems()
      ]);

      setClients(clientsData || []);
      
      // Process top quoted products
      const quotedProductsMap = new Map<string, TopProduct>();
      quotationItemsData?.forEach((item: any) => {
        const key = item.product_id;
        if (quotedProductsMap.has(key)) {
          const existing = quotedProductsMap.get(key)!;
          existing.total_quantity += item.quantity;
          existing.total_amount += item.quantity * item.unit_price;
        } else {
          quotedProductsMap.set(key, {
            product_id: item.product_id,
            product_name: item.product_name,
            total_quantity: item.quantity,
            total_amount: item.quantity * item.unit_price,
            client_count: 1
          });
        }
      });
      
      const topQuoted = Array.from(quotedProductsMap.values())
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 20);
      setTopQuotedProducts(topQuoted);

      // Process top ordered products
      const orderedProductsMap = new Map<string, TopProduct>();
      orderItemsData?.forEach((item: any) => {
        const key = item.product_id;
        if (orderedProductsMap.has(key)) {
          const existing = orderedProductsMap.get(key)!;
          existing.total_quantity += item.quantity;
          existing.total_amount += item.quantity * item.unit_price;
        } else {
          orderedProductsMap.set(key, {
            product_id: item.product_id,
            product_name: item.product_name,
            total_quantity: item.quantity,
            total_amount: item.quantity * item.unit_price,
            client_count: 1
          });
        }
      });
      
      const topOrdered = Array.from(orderedProductsMap.values())
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 20);
      setTopOrderedProducts(topOrdered);

      // Process client reports
      const clientReportsMap = new Map<string, ClientReport>();
      clientsData?.forEach((client: any) => {
        const clientQuotations = quotationsData?.filter((q: any) => q.client_id === client.id) || [];
        const clientOrders = ordersData?.filter((o: any) => o.client_id === client.id) || [];
        
        const totalQuotationAmount = clientQuotations.reduce((sum: number, q: any) => sum + (q.final_amount || 0), 0);
        const totalOrderAmount = clientOrders.reduce((sum: number, o: any) => sum + (o.final_amount || 0), 0);
        
        clientReportsMap.set(client.id, {
          client_id: client.id,
          company_name: client.company_name,
          total_quotations: clientQuotations.length,
          total_orders: clientOrders.length,
          total_quotation_amount: totalQuotationAmount,
          total_order_amount: totalOrderAmount,
          conversion_rate: clientQuotations.length > 0 ? (clientOrders.length / clientQuotations.length) * 100 : 0
        });
      });
      
      setClientReports(Array.from(clientReportsMap.values()));
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientReports = clientReports.filter(report =>
    report.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'top-quoted-products', label: 'Top Quoted Products', icon: TrendingUp },
    { id: 'top-ordered-products', label: 'Top Ordered Products', icon: Package },
    { id: 'client-summary', label: 'Client Summary', icon: Users }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-600">Analytics and insights for your business</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Quotations</p>
                <p className="text-2xl font-bold">{clientReports.reduce((sum, r) => sum + r.total_quotations, 0)}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold">{clientReports.reduce((sum, r) => sum + r.total_orders, 0)}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Conversion</p>
                <p className="text-2xl font-bold">
                  {clientReports.length > 0 
                    ? (clientReports.reduce((sum, r) => sum + r.conversion_rate, 0) / clientReports.length).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'top-quoted-products' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Quoted Products</CardTitle>
            <CardDescription>
              Products with the highest quotation volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQuotedProducts.map((product, index) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>{product.total_quantity}</TableCell>
                    <TableCell>€{product.total_amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'top-ordered-products' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Ordered Products</CardTitle>
            <CardDescription>
              Products with the highest order volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOrderedProducts.map((product, index) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>{product.total_quantity}</TableCell>
                    <TableCell>€{product.total_amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'client-summary' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Summary Report</CardTitle>
            <CardDescription>
              Quotation and order history summary by client
            </CardDescription>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Quotations</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Quotation Value</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientReports.map((report) => (
                  <TableRow key={report.client_id}>
                    <TableCell className="font-medium">{report.company_name}</TableCell>
                    <TableCell>{report.total_quotations}</TableCell>
                    <TableCell>{report.total_orders}</TableCell>
                    <TableCell>€{report.total_quotation_amount.toLocaleString()}</TableCell>
                    <TableCell>€{report.total_order_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={report.conversion_rate >= 50 ? 'default' : 
                                report.conversion_rate >= 25 ? 'secondary' : 'outline'}
                      >
                        {report.conversion_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;