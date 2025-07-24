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
  FileText,
  Eye,
  MousePointer,
  Timer,
  MapPin,
  Calendar,
  Star
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

  const [websiteStats, setWebsiteStats] = useState({
    pageViews: 12543,
    uniqueVisitors: 3421,
    bounceRate: 32.5,
    avgSessionDuration: 245, // in seconds
    topPages: [
      { page: '/products', views: 3421 },
      { page: '/hotel-equipment', views: 2156 },
      { page: '/kitchen-tools', views: 1876 }
    ],
    fromCountries: [
      { country: 'Germany', visitors: 1245, flag: '🇩🇪' },
      { country: 'France', visitors: 987, flag: '🇫🇷' },
      { country: 'Italy', visitors: 756, flag: '🇮🇹' },
      { country: 'Spain', visitors: 543, flag: '🇪🇸' },
      { country: 'Netherlands', visitors: 432, flag: '🇳🇱' }
    ],
    timeStats: {
      peakHour: '14:00',
      peakDay: 'Tuesday',
      avgVisitTime: '3m 45s',
      lastUpdated: new Date().toLocaleTimeString()
    },
    topProductsViewed: [
      { name: 'Commercial Oven Pro', views: 2341, category: 'Ovens' },
      { name: 'Industrial Mixer XL', views: 1876, category: 'Mixers' },
      { name: 'Stainless Steel Prep Table', views: 1654, category: 'Tables' },
      { name: 'Professional Fryer', views: 1432, category: 'Fryers' },
      { name: 'Blast Chiller Unit', views: 1298, category: 'Refrigeration' }
    ]
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
      title: 'Manage Clients',
      description: 'View and manage client accounts',
      icon: Users,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      textColor: 'text-purple-900',
      descColor: 'text-purple-600',
      href: '/secure-mgmt-portal-x7f9q2/clients',
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
                <p className="text-xl sm:text-2xl font-bold text-slate-900">€{stats.totalRevenue.toLocaleString()}</p>
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

      {/* Website Statistics */}
      <Card className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg lg:text-xl text-slate-800">
            <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
            <span className="truncate">Website Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 min-w-0">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-50 shadow-sm flex-shrink-0">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-blue-900 text-sm lg:text-base truncate">Page Views</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{websiteStats.pageViews.toLocaleString()}</p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0">
              <div className="p-2 sm:p-3 rounded-xl bg-green-50 shadow-sm flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-green-900 text-sm lg:text-base truncate">Unique Visitors</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{websiteStats.uniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 min-w-0">
              <div className="p-2 sm:p-3 rounded-xl bg-orange-50 shadow-sm flex-shrink-0">
                <MousePointer className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-orange-900 text-sm lg:text-base truncate">Bounce Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-900">{websiteStats.bounceRate}%</p>
                <p className="text-xs text-orange-600">Average</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 min-w-0">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-50 shadow-sm flex-shrink-0">
                <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-purple-900 text-sm lg:text-base truncate">Avg. Session</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{Math.floor(websiteStats.avgSessionDuration / 60)}m {websiteStats.avgSessionDuration % 60}s</p>
                <p className="text-xs text-purple-600">Duration</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-red-600" />
              Top Pages
            </h4>
            <div className="space-y-2">
              {websiteStats.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{page.page}</span>
                  <span className="text-sm text-slate-600">{page.views.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Statistics Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
            {/* From Countries Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                From Countries
              </h4>
              <div className="space-y-2">
                {websiteStats.fromCountries.slice(0, 3).map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium text-indigo-900">{country.country}</span>
                    </div>
                    <span className="text-sm text-indigo-700 font-semibold">{country.visitors.toLocaleString()}</span>
                  </div>
                ))}
                <div className="text-xs text-indigo-600 text-center mt-2">
                  +{websiteStats.fromCountries.length - 3} more countries
                </div>
              </div>
            </div>

            {/* Time Analytics Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                Time Analytics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-amber-200">
                  <span className="text-sm font-medium text-amber-900">Peak Hour</span>
                  <span className="text-sm text-amber-700 font-semibold">{websiteStats.timeStats.peakHour}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-amber-200">
                  <span className="text-sm font-medium text-amber-900">Peak Day</span>
                  <span className="text-sm text-amber-700 font-semibold">{websiteStats.timeStats.peakDay}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-amber-200">
                  <span className="text-sm font-medium text-amber-900">Avg. Visit</span>
                  <span className="text-sm text-amber-700 font-semibold">{websiteStats.timeStats.avgVisitTime}</span>
                </div>
                <div className="text-xs text-amber-600 text-center">
                  Updated: {websiteStats.timeStats.lastUpdated}
                </div>
              </div>
            </div>

            {/* Top Products Viewed Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-emerald-600" />
                Top Products Viewed
              </h4>
              <div className="space-y-2">
                {websiteStats.topProductsViewed.slice(0, 3).map((product, index) => (
                  <div key={index} className="p-2 bg-white/70 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-900 truncate">{product.name}</span>
                      <span className="text-sm text-emerald-700 font-semibold">{product.views.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">{product.category}</div>
                  </div>
                ))}
                <div className="text-xs text-emerald-600 text-center mt-2">
                  +{websiteStats.topProductsViewed.length - 3} more products
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <p className="text-xs lg:text-sm font-medium text-slate-900">€{order.final_amount?.toLocaleString() || 0}</p>
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