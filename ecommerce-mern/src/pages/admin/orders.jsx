import AdminOrderDetailsView from "@/components/admin/order-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders, getOrderDetails, resetOrderDetails } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as XLSX from "xlsx";

export default function AdminOrders() {
  const dispatch = useDispatch();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { allOrders, orderDetails } = useSelector((state) => state.shopOrderSlice || {});

  useEffect(() => {
    dispatch(getAllOrders());

    // Polling every 10 seconds for auto-updates
    const intervalId = setInterval(() => {
      dispatch(getAllOrders());
    }, 10000);

    return () => clearInterval(intervalId);
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
              <TableHead className="text-primary font-bold">Order Date</TableHead>
              <TableHead className="text-primary font-bold">Order Status</TableHead>
              <TableHead className="text-primary font-bold">Order Price</TableHead>
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
                  <TableCell>{item?.orderDate?.split("T")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 rounded-full shadow-sm ${item?.orderStatus === "confirmed"
                        ? "bg-green-500 hover:bg-green-600"
                        : item?.orderStatus === "rejected"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-black hover:bg-gray-800"
                        }`}
                    >
                      {item?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">${item?.totalAmount}</TableCell>
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
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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
