import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAllProducts } from "@/store/admin/product-slice";
import { getAllOrders } from "@/store/shop/order-slice";
import { Activity, CreditCard, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.adminProducts || {});
  const { allOrders } = useSelector((state) => state.shopOrderSlice || {});
  const { user } = useSelector((state) => state.auth || {});

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(getAllOrders());

    // Polling every 10 seconds for auto-updates
    const intervalId = setInterval(() => {
      dispatch(fetchAllProducts());
      dispatch(getAllOrders());
    }, 10000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Calculate Metrics
  const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const totalOrders = allOrders?.length || 0;
  const totalProducts = products?.length || 0;
  const totalStock = products?.reduce((acc, product) => acc + (product.totalStock || 0), 0) || 0;

  // Time-based Metrics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weeklyRevenue = allOrders
    ?.filter(o => new Date(o.orderDate) >= oneWeekAgo)
    .reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;

  const monthlyRevenue = allOrders
    ?.filter(o => new Date(o.orderDate) >= oneMonthAgo)
    .reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;

  // Get Recent Orders (Last 10)
  // Assuming orders are sorted by date on backend or we sort here
  // If backend doesn't sort, we can sort here: .slice().sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate))
  const recentOrders = allOrders && allOrders.length > 0
    ? [...allOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 10)
    : [];

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-green-600 font-bold';
      case 'pending': return 'text-yellow-600 font-bold';
      case 'rejected': return 'text-red-600 font-bold';
      case 'delivered': return 'text-blue-600 font-bold';
      default: return 'text-gray-600';
    }
  };

  const handleExportExcel = () => {
    import('xlsx').then(XLSX => {
      const wb = XLSX.utils.book_new();

      // 1. Summary Sheet
      const summaryData = [
        ["Metric", "Value"],
        ["Total Revenue", `$${totalRevenue.toFixed(2)}`],
        ["Monthly Revenue", `$${monthlyRevenue.toFixed(2)}`],
        ["Weekly Revenue", `$${weeklyRevenue.toFixed(2)}`],
        ["Total Orders", totalOrders],
        ["Total Products", totalProducts],
        ["Total Stock", totalStock],
        ["Delivered Orders", allOrders?.filter(o => o.orderStatus === 'delivered').length || 0],
        ["Pending Orders", allOrders?.filter(o => o.orderStatus === 'pending').length || 0],
        ["In Process Orders", allOrders?.filter(o => o.orderStatus === 'inProcess').length || 0],
        ["Rejected Orders", allOrders?.filter(o => o.orderStatus === 'rejected').length || 0],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // 2. Orders Sheet
      const ordersData = allOrders?.map(order => ({
        "Order ID": order._id,
        "Date": new Date(order.orderDate).toLocaleDateString(),
        "Status": order.orderStatus,
        "Total Amount": `$${order.totalAmount}`,
        "Payment Method": order.paymentMethod,
        "Payment Status": order.paymentStatus,
      })) || [];
      const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, ordersSheet, "Orders");

      // 3. Products Sheet
      const productsData = products?.map(product => ({
        "Product ID": product._id,
        "Title": product.title,
        "Category": product.category,
        "Brand": product.brand,
        "Price": `$${product.price}`,
        "Sale Price": `$${product.salePrice}`,
        "Total Stock": product.totalStock,
      })) || [];
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, productsSheet, "Products");

      // Generate File
      XLSX.writeFile(wb, `Admin_Stats_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white">
          Export to Excel
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime revenue
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime orders
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items in stock
            </p>
          </CardContent>
        </Card>

        {/* Delivery Status Stats */}
        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Orders</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {allOrders?.filter(o => o.orderStatus === 'delivered').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {allOrders?.filter(o => o.orderStatus === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Process</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {allOrders?.filter(o => o.orderStatus === 'inProcess').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently shipping
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-none hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Orders</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {allOrders?.filter(o => o.orderStatus === 'rejected').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cancelled/Rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-primary font-semibold">Order ID</TableHead>
                  <TableHead className="text-primary font-semibold">Date</TableHead>
                  <TableHead className="text-primary font-semibold">Status</TableHead>
                  <TableHead className="text-primary font-semibold">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className={statusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </TableCell>
                      <TableCell className="font-bold">${order.totalAmount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
