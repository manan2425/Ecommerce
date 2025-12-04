import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/dashboard');

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching analytics:', error);
      toast({
        title: 'Error fetching analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Export analytics data to Excel
  const exportToExcel = () => {
    if (!analytics) return;

    const workbook = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString('en-IN');

    // Sheet 1: Summary Statistics
    const summaryData = [
      ['Automation & Control Design - Analytics Report'],
      ['Generated on:', today],
      [''],
      ['=== USER STATISTICS ==='],
      ['Total Users', analytics.totalUsers || 0],
      ["Today's Registrations", analytics.todayRegistrations || 0],
      ["Today's Logins", analytics.todayLogins || 0],
      ['Active Users Today', analytics.activeUsersToday || 0],
      [''],
      ['=== PRODUCT STATISTICS ==='],
      ['Total Products', analytics.totalProducts || 0],
      [''],
      ['=== ORDER STATISTICS ==='],
      ['Total Orders', analytics.totalOrders || 0],
      ["Today's Orders", analytics.todayOrdersCount || 0],
      [''],
      ['=== REVENUE STATISTICS ==='],
      ['Total Revenue (All Time)', analytics.totalRevenue || 0],
      ["Today's Revenue", analytics.todayRevenue || 0],
      ['Weekly Revenue (Last 7 Days)', analytics.weeklyRevenue || 0],
      ['Monthly Revenue (Last 30 Days)', analytics.monthlyRevenue || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Order Status Breakdown
    const orderStatusData = [
      ['Order Status', 'Count'],
      ['Pending', analytics.orderStatusCounts?.pending || 0],
      ['Confirmed', analytics.orderStatusCounts?.confirmed || 0],
      ['Processing', analytics.orderStatusCounts?.inProcess || 0],
      ['Shipping', analytics.orderStatusCounts?.inShipping || 0],
      ['Delivered', analytics.orderStatusCounts?.delivered || 0],
      ['Rejected', analytics.orderStatusCounts?.rejected || 0],
      ['Cancelled', analytics.orderStatusCounts?.cancelled || 0],
    ];
    const orderStatusSheet = XLSX.utils.aoa_to_sheet(orderStatusData);
    orderStatusSheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, orderStatusSheet, 'Order Status');

    // Sheet 3: Revenue Trend (Last 7 Days)
    if (analytics.revenuePerDay && analytics.revenuePerDay.length > 0) {
      const revenueTrendData = [
        ['Date', 'Revenue', 'Orders'],
        ...analytics.revenuePerDay.map(item => [
          item._id,
          item.revenue || 0,
          item.count || 0
        ])
      ];
      const revenueTrendSheet = XLSX.utils.aoa_to_sheet(revenueTrendData);
      revenueTrendSheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(workbook, revenueTrendSheet, 'Revenue Trend');
    }

    // Sheet 4: Registration & Login Trends
    const trendsData = [['Date', 'Registrations', 'Logins']];
    const allDates = new Set();
    (analytics.registrationsPerDay || []).forEach(item => allDates.add(item._id));
    (analytics.loginsPerDay || []).forEach(item => allDates.add(item._id));
    
    const sortedDates = Array.from(allDates).sort();
    sortedDates.forEach(date => {
      const regItem = (analytics.registrationsPerDay || []).find(r => r._id === date);
      const loginItem = (analytics.loginsPerDay || []).find(l => l._id === date);
      trendsData.push([date, regItem?.count || 0, loginItem?.count || 0]);
    });
    
    if (trendsData.length > 1) {
      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      trendsSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'User Trends');
    }

    // Sheet 5: Most Viewed Products
    if (analytics.mostViewedProducts && analytics.mostViewedProducts.length > 0) {
      const viewedProductsData = [
        ['Product Name', 'Views', 'Price'],
        ...analytics.mostViewedProducts.map(item => [
          item.product?.title || 'Unknown',
          item.viewCount || 0,
          item.product?.price || 0
        ])
      ];
      const viewedSheet = XLSX.utils.aoa_to_sheet(viewedProductsData);
      viewedSheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, viewedSheet, 'Most Viewed');
    }

    // Sheet 6: Most Purchased Products
    if (analytics.mostPurchasedProducts && analytics.mostPurchasedProducts.length > 0) {
      const purchasedProductsData = [
        ['Product Name', 'Purchases', 'Price'],
        ...analytics.mostPurchasedProducts.map(item => [
          item.product?.title || 'Unknown',
          item.purchaseCount || 0,
          item.product?.price || 0
        ])
      ];
      const purchasedSheet = XLSX.utils.aoa_to_sheet(purchasedProductsData);
      purchasedSheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, purchasedSheet, 'Most Purchased');
    }

    // Generate filename with date
    const filename = `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download the file
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: 'Excel exported successfully',
      description: `Downloaded as ${filename}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lg text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">No analytics data available</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  const orderStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    inProcess: 'bg-purple-100 text-purple-800 border-purple-300',
    inShipping: 'bg-orange-100 text-orange-800 border-orange-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const orderStatusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProcess: 'Processing',
    inShipping: 'Shipping',
    delivered: 'Delivered',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to Automation & Control Design Admin</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{analytics.totalUsers || 0}</div>
            <p className="text-xs text-blue-600 mt-1">+{analytics.todayRegistrations || 0} today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Products</CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{analytics.totalProducts || 0}</div>
            <p className="text-xs text-purple-600 mt-1">Active products</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{analytics.totalOrders || 0}</div>
            <p className="text-xs text-orange-600 mt-1">+{analytics.todayOrdersCount || 0} today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats - Row 2 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.todayRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">{analytics.todayOrdersCount || 0} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.weeklyRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.monthlyRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(analytics.orderStatusCounts || {}).map(([status, count]) => (
              <div 
                key={status} 
                className={`p-4 rounded-lg border-2 text-center ${orderStatusColors[status] || 'bg-gray-100'}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium mt-1">{orderStatusLabels[status] || status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.todayRegistrations || 0}</div>
            <p className="text-xs text-gray-500 mt-1">New users today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.todayLogins || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Login activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.activeUsersToday || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Unique active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.todayOrdersCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Orders placed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.revenuePerDay && analytics.revenuePerDay.length > 0 ? (
              analytics.revenuePerDay.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24">{day._id}</span>
                  <div className="flex-1 mx-4">
                    <div 
                      className="bg-green-400 h-8 rounded transition-all" 
                      style={{ width: `${Math.min(100, Math.max(5, (day.revenue / (analytics.weeklyRevenue || 1)) * 100))}%` }}
                    ></div>
                  </div>
                  <div className="text-right w-32">
                    <span className="font-semibold">{formatCurrency(day.revenue)}</span>
                    <span className="text-xs text-gray-500 ml-2">({day.count} orders)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No revenue data for this period</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.registrationsPerDay && analytics.registrationsPerDay.length > 0 ? (
                analytics.registrationsPerDay.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-200 h-6 rounded" style={{ width: `${Math.max(20, day.count * 15)}px` }}></div>
                      <span className="font-semibold w-8">{day.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No registration data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Login Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.loginsPerDay && analytics.loginsPerDay.length > 0 ? (
                analytics.loginsPerDay.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-200 h-6 rounded" style={{ width: `${Math.max(20, day.count * 10)}px` }}></div>
                      <span className="font-semibold w-8">{day.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No login data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Viewed Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Viewed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostViewedProducts && analytics.mostViewedProducts.length > 0 ? (
                analytics.mostViewedProducts.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
                    {item.product?.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">{formatCurrency(item.product?.price)}</span>
                        <Badge variant="secondary" className="text-xs">{item.viewCount} views</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No view data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Purchased Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Purchased Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostPurchasedProducts && analytics.mostPurchasedProducts.length > 0 ? (
                analytics.mostPurchasedProducts.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
                    {item.product?.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">{formatCurrency(item.product?.price)}</span>
                        <Badge variant="default" className="text-xs">{item.purchaseCount} sold</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No purchase data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
