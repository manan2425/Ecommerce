import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { 
  Eye, 
  ShoppingCart, 
  LogIn, 
  LogOut, 
  CreditCard, 
  RefreshCw, 
  Search,
  User,
  Package,
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Monitor
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ACTIVITY_TYPES = {
  login: { label: 'Login', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: LogIn },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: LogOut },
  product_view: { label: 'Product View', color: 'bg-green-100 text-green-800 border-green-300', icon: Eye },
  product_add_to_cart: { label: 'Add to Cart', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: ShoppingCart },
  product_purchase: { label: 'Purchase', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: CreditCard }
};

export default function UserActivities() {
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [limit] = useState(25);
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const fetchActivities = async (pageNum = 1, activityType = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit
      });
      
      if (activityType && activityType !== 'all') {
        params.append('activityType', activityType);
      }

      const response = await api.get(`/admin/analytics/activities?${params}`);

      if (response.data.success) {
        setActivities(response.data.data);
        setPagination(response.data.pagination);
        setPage(pageNum);
        
        // Calculate stats from activities
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching activities:', error);
      toast({
        title: 'Error fetching activities',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const counts = {
      login: 0,
      logout: 0,
      product_view: 0,
      product_add_to_cart: 0,
      product_purchase: 0,
      uniqueUsers: new Set(),
      uniqueProducts: new Set()
    };
    
    data.forEach(activity => {
      if (counts[activity.activityType] !== undefined) {
        counts[activity.activityType]++;
      }
      if (activity.userId?._id) {
        counts.uniqueUsers.add(activity.userId._id);
      }
      if (activity.productId?._id) {
        counts.uniqueProducts.add(activity.productId._id);
      }
    });
    
    setStats({
      ...counts,
      uniqueUsers: counts.uniqueUsers.size,
      uniqueProducts: counts.uniqueProducts.size
    });
  };

  const fetchUserDetails = async (userId, userName) => {
    try {
      const response = await api.get(`/admin/analytics/activities?userId=${userId}&limit=50`);
      if (response.data.success) {
        setUserActivities(response.data.data);
        setSelectedUser({ id: userId, name: userName });
        setUserDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: 'Error fetching user details',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchActivities(1, filter);
  }, [filter]);

  const getActivityIcon = (type) => {
    const IconComponent = ACTIVITY_TYPES[type]?.icon || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityBadgeClass = (type) => {
    return ACTIVITY_TYPES[type]?.color || 'bg-gray-100 text-gray-800';
  };

  const getActivityLabel = (type) => {
    return ACTIVITY_TYPES[type]?.label || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      activity.userId?.userName?.toLowerCase().includes(search) ||
      activity.userId?.email?.toLowerCase().includes(search) ||
      activity.productId?.title?.toLowerCase().includes(search)
    );
  });

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const exportData = activities.map(activity => ({
      'Date & Time': formatDate(activity.createdAt),
      'User Name': activity.userId?.userName || 'Unknown',
      'Email': activity.userId?.email || 'N/A',
      'Activity Type': getActivityLabel(activity.activityType),
      'Product': activity.productId?.title || 'N/A',
      'Product Price': activity.productId?.price || 'N/A',
      'IP Address': activity.ipAddress || 'N/A',
      'User Agent': activity.userAgent || 'N/A'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, 
      { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 40 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Activities');
    XLSX.writeFile(workbook, `User_Activities_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Exported successfully',
      description: 'User activities exported to Excel'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Activities</h1>
          <p className="text-gray-500 mt-1">Track all user interactions and product visits</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={() => fetchActivities(page, filter)} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">Logins</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.login || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Views</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.product_view || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700">Add to Cart</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.product_add_to_cart || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">Purchases</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">{stats.product_purchase || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-indigo-700">Users</span>
            </div>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.uniqueUsers || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              <span className="text-sm text-pink-700">Products</span>
            </div>
            <p className="text-2xl font-bold text-pink-900 mt-1">{stats.uniqueProducts || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by user name, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="product_view">Product View</SelectItem>
            <SelectItem value="product_add_to_cart">Add to Cart</SelectItem>
            <SelectItem value="product_purchase">Purchase</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Activity className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-500">No activities found</p>
            <p className="text-sm text-gray-400">Try changing filters or search term</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log ({pagination.total || filteredActivities.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{formatTimeAgo(activity.createdAt)}</p>
                            <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => fetchUserDetails(activity.userId?._id, activity.userId?.userName)}
                          className="text-left hover:bg-gray-100 p-2 rounded-lg transition"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{activity.userId?.userName || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{activity.userId?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActivityBadgeClass(activity.activityType)} flex items-center gap-1 w-fit`}>
                          {getActivityIcon(activity.activityType)}
                          {getActivityLabel(activity.activityType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activity.productId ? (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{activity.productId.title}</p>
                              {activity.productId.price && (
                                <p className="text-xs text-green-600">₹{activity.productId.price}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {activity.ipAddress && (
                          <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                            <Monitor className="w-3 h-3" />
                            {activity.ipAddress}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && filteredActivities.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.total || 0)} of {pagination.total || 0}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities(Math.max(1, page - 1), filter)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm px-3 py-1 bg-gray-100 rounded">
              {page} / {pagination.pages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities(Math.min(pagination.pages || 1, page + 1), filter)}
              disabled={page >= (pagination.pages || 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Activity: {selectedUser?.name || 'Unknown User'}
            </DialogTitle>
          </DialogHeader>
          
          {userActivities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activities found for this user</p>
          ) : (
            <div className="space-y-4">
              {/* User Activity Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-900">
                    {userActivities.filter(a => a.activityType === 'login').length}
                  </p>
                  <p className="text-xs text-blue-600">Logins</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-900">
                    {userActivities.filter(a => a.activityType === 'product_view').length}
                  </p>
                  <p className="text-xs text-green-600">Views</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-yellow-900">
                    {userActivities.filter(a => a.activityType === 'product_add_to_cart').length}
                  </p>
                  <p className="text-xs text-yellow-600">Cart Adds</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-purple-900">
                    {userActivities.filter(a => a.activityType === 'product_purchase').length}
                  </p>
                  <p className="text-xs text-purple-600">Purchases</p>
                </div>
              </div>

              {/* Products Viewed */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Products Viewed
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userActivities
                    .filter(a => a.activityType === 'product_view' && a.productId)
                    .map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{activity.productId?.title || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    ))}
                  {userActivities.filter(a => a.activityType === 'product_view').length === 0 && (
                    <p className="text-sm text-gray-400">No products viewed</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Activity Timeline
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userActivities.slice(0, 20).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 border-l-2 border-gray-200 pl-4">
                      <Badge className={`${getActivityBadgeClass(activity.activityType)} text-xs`}>
                        {getActivityLabel(activity.activityType)}
                      </Badge>
                      <span className="text-sm flex-1">
                        {activity.productId?.title || '-'}
                      </span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
