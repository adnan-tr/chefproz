import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  Users, 
  MessageSquare, 
  Package, 
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  DollarSign,

  FileText
} from 'lucide-react';
import { dbService } from '@/lib/supabase';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    contactRequests: 0,
    products: 0,
    languages: 5,
    totalClients: 0,
    totalQuotations: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingQuotations: 0,
    waitingPayment: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data
        const [usersResult, requestsResult, productsResult, clientsData, quotationsData, ordersData] = await Promise.all([
          dbService.getPortalUsers(),
          dbService.getContactRequests(),
          dbService.getProducts(),
          dbService.getClients(),
          dbService.getQuotations(),
          dbService.getOrders(),
        ]);

        // Calculate revenue and metrics
        const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.final_amount || 0), 0);
        const pendingQuotations = quotationsData.filter((q: any) => q.status === 'pending' || q.status === 'draft').length;
        const waitingPayment = ordersData.filter((o: any) => o.order_status === 'waiting_payment').length;

        setStats({
          totalUsers: usersResult?.length || 0,
          contactRequests: requestsResult?.length || 0,
          products: productsResult?.length || 0,
          languages: 5,
          totalClients: clientsData.length || 0,
          totalQuotations: quotationsData.length || 0,
          totalOrders: ordersData.length || 0,
          totalRevenue,
          pendingQuotations,
          waitingPayment,
        });

        // Set recent requests (last 3)
        setRecentRequests(requestsResult?.slice(0, 3) || []);
        
        // Set recent orders (last 3)
        setRecentOrders(ordersData.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: Package,
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
      textColor: 'text-red-900',
      descColor: 'text-red-600',
      href: '/secure-mgmt-portal-x7f9q2/products',
    },
    {
      title: 'Update Multilingual',
      description: 'Manage multilingual content',
      icon: Globe,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      textColor: 'text-blue-900',
      descColor: 'text-blue-600',
      href: '/secure-mgmt-portal-x7f9q2/translations',
    },
    {
      title: 'View Reports',
      description: 'Generate analytics reports',
      icon: BarChart3,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      textColor: 'text-green-900',
      descColor: 'text-green-600',
      href: '/secure-mgmt-portal-x7f9q2/quotations',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
            <p className="text-slate-600 text-lg">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-2 truncate">Dashboard</h1>
          <p className="text-slate-600 text-sm lg:text-lg">Welcome to the ChefGear management portal</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="px-3 lg:px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-xs lg:text-sm">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Total Clients</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalClients}</p>
                <p className="text-xs text-green-600 font-medium">Active</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-blue-50 shadow-sm flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Contact Requests</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.contactRequests}</p>
                <p className="text-xs text-green-600 font-medium">Total received</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-green-50 shadow-sm flex-shrink-0">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Quotations</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalQuotations}</p>
                <p className="text-xs text-yellow-600 font-medium">{stats.pendingQuotations} pending</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-purple-50 shadow-sm flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                <p className="text-xs text-yellow-600 font-medium">{stats.waitingPayment} waiting payment</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-orange-50 shadow-sm flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium">From orders</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 shadow-sm flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 truncate">Products</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.products}</p>
                <p className="text-xs text-green-600 font-medium">In catalog</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-indigo-50 shadow-sm flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Requests */}
        <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow min-w-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg lg:text-xl text-slate-800">
              <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
              <span className="truncate">Recent Contact Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-sm transition-all min-w-0">
                    <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm lg:text-base truncate">{request.name}</p>
                        <p className="text-xs lg:text-sm text-slate-600 truncate">{request.company}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs lg:text-sm font-medium text-slate-900 truncate">{request.request_type}</p>
                      <p className="text-xs text-slate-500">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent requests
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow min-w-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg lg:text-xl text-slate-800">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
              <span className="truncate">Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-sm transition-all min-w-0">
                    <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        order.order_status === 'waiting_payment' ? 'bg-yellow-500' :
                        order.order_status === 'delivered' ? 'bg-green-500' :
                        order.order_status === 'shipped' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm lg:text-base truncate">{order.quotation?.quotation_number || order.order_number}</p>
                        <p className="text-xs lg:text-sm text-slate-600 truncate">{order.client?.company_name || 'Unknown Client'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs lg:text-sm font-medium text-slate-900">${order.final_amount?.toLocaleString() || 0}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg lg:text-xl text-slate-800">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
            <span className="truncate">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.href}>
                  <button className={`w-full p-3 lg:p-4 text-left border-2 rounded-xl transition-all duration-300 hover:shadow-sm ${action.color} min-w-0`}>
                    <div className="flex items-start space-x-2 lg:space-x-3">
                      <Icon className={`h-4 w-4 lg:h-5 lg:w-5 mt-0.5 flex-shrink-0 ${action.textColor}`} />
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold text-sm lg:text-base truncate ${action.textColor}`}>{action.title}</div>
                        <div className={`text-xs lg:text-sm ${action.descColor}`}>{action.description}</div>
                      </div>
                    </div>
                  </button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg lg:text-xl text-slate-800">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
            <span className="truncate">System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0">
              <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-green-900 text-sm lg:text-base truncate">Database</p>
                <p className="text-xs lg:text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0">
              <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-green-900 text-sm lg:text-base truncate">Storage</p>
                <p className="text-xs lg:text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0">
              <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-green-900 text-sm lg:text-base truncate">API</p>
                <p className="text-xs lg:text-sm text-green-600">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;