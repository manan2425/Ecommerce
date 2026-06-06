import AdminOrderDetailsView from "@/components/admin/order-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders, getOrderDetails, resetOrderDetails } from "@/store/shop/order-slice";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { subscribeToOrderUpdates, initSocket } from '@/lib/socket';
import { Printer } from "lucide-react";

import * as XLSX from "xlsx";

// Helper function to get status style object
const getStatusStyle = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'confirmed':
    case 'delivered':
      return { backgroundColor: '#22c55e', color: 'white' }; // green-500
    case 'pending':
      return { backgroundColor: '#eab308', color: 'white' }; // yellow-500
    case 'processing':
    case 'inprocess':
    case 'in process':
      return { backgroundColor: '#3b82f6', color: 'white' }; // blue-500
    case 'shipped':
    case 'inshipping':
    case 'in shipping':
      return { backgroundColor: '#a855f7', color: 'white' }; // purple-500
    case 'rejected':
    case 'cancelled':
    case 'canceled':
      return { backgroundColor: '#ef4444', color: 'white' }; // red-500
    default:
      return { backgroundColor: '#6b7280', color: 'white' }; // gray-500
  }
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { allOrders, orderDetails } = useSelector((state) => state.shopOrderSlice || {});

  useEffect(() => {
    dispatch(getAllOrders());

    // Real-time order updates via Socket.io (replaces polling)
    initSocket();
    const unsubscribe = subscribeToOrderUpdates((data) => {
      console.log('🔄 Admin: Refreshing orders due to update:', data);
      dispatch(getAllOrders());
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  const handleFetchOrderDetails = (id) => {
    dispatch(getOrderDetails(id));
  };

  const handleDownloadExcel = () => {
    if (!allOrders || allOrders.length === 0) return;

    const orderData = allOrders.map((order) => ({
      "Order ID": order._id,
      "Order Date": order.orderDate ? order.orderDate.split("T")[0] : "",
      "Order Status": order.orderStatus,
      "Total Amount": order.totalAmount,
      "Payment Method": order.paymentMethod,
      "Payment Status": order.paymentStatus,
      "Customer Name": order.addressInfo?.name || "N/A", // Assuming addressInfo has name
      "Customer Address": order.addressInfo?.address || "N/A",
      "Customer City": order.addressInfo?.city || "N/A",
      "Customer Pincode": order.addressInfo?.pincode || "N/A",
      "Customer Phone": order.addressInfo?.phone || "N/A",
      "Customer Notes": order.addressInfo?.notes || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(orderData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders_data.xlsx");
  };

  // Sort orders by date (newest first)
  const sortedOrders = allOrders && allOrders.length > 0
    ? [...allOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    : [];

  // Print order details
  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsList = order.cartItems?.map(item => {
      const itemName = item.selectedPart?.name || item.title;
      const itemPrice = item.selectedPart?.salePrice || item.selectedPart?.price || item.salePrice || item.price;
      return `<tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${itemName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹{itemPrice}</td>
      </tr>`;
    }).join('') || '';

    const customerName = order.addressInfo?.name || 'N/A';
    const customerPhone = order.addressInfo?.phone || 'N/A';
    const customerAddress = `${order.addressInfo?.address || ''}, ${order.addressInfo?.city || ''} - ${order.addressInfo?.pincode || ''}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .section h3 { margin: 0 0 10px 0; color: #374151; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #2563eb; color: white; padding: 10px; text-align: left; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>🛒 Order Details</h1>
          
          <div class="section">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString('en-IN')}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          </div>

          <div class="section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Address:</strong> ${customerAddress}</p>
            ${order.addressInfo?.gstNumber ? `<p><strong>GST Number:</strong> ${order.addressInfo.gstNumber}</p>` : ''}
            ${order.addressInfo?.notes ? `<p><strong>Notes:</strong> ${order.addressInfo.notes}</p>` : ''}
          </div>

          <div class="section">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>

          <div class="total">
            ${order.gstAmount ? `<p>GST: ₹${order.gstAmount}</p>` : ''}
            <p>Total Amount: ₹${order.totalAmount}</p>
          </div>

          <p style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px;">
            SHREE MARUTI TRADERS - Thank you for your order!
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="glass border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          All Orders
        </CardTitle>
        <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
          Download Excel
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
              <TableHead className="text-primary font-bold">Order ID</TableHead>
              <TableHead className="text-primary font-bold">Customer Name</TableHead>
              <TableHead className="text-primary font-bold">Order Date</TableHead>
              <TableHead className="text-primary font-bold">Order Status</TableHead>
              <TableHead className="text-primary font-bold">Order Price</TableHead>
              <TableHead className="text-primary font-bold">Print</TableHead>
              <TableHead>
                <span className="sr-only">Buttons</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders && sortedOrders.length > 0 ? (
              sortedOrders.map((item) => (
                <TableRow key={item._id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-medium">{item?._id}</TableCell>
                  <TableCell className="font-medium">{item?.addressInfo?.name || 'N/A'}</TableCell>
                  <TableCell>{item?.orderDate?.split("T")[0]}</TableCell>
                  <TableCell>
                    <span
                      className="py-1 px-3 rounded-full text-xs font-semibold inline-block shadow-sm"
                      style={getStatusStyle(item?.orderStatus)}
                    >
                      {item?.orderStatus}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">₹{item?.totalAmount}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handlePrintOrder(item)}
                      title="Print Order"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={() => {
                        setOpenDetailsDialog(false);
                        dispatch(resetOrderDetails());
                      }}
                    >
                      <Button onClick={() => handleFetchOrderDetails(item?._id)} variant="outline" className="hover:bg-primary hover:text-white transition-colors">
                        View Details
                      </Button>
                      <AdminOrderDetailsView
                        orderDetails={orderDetails}
                        setOpenDetailsDialog={setOpenDetailsDialog}
                      />
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
