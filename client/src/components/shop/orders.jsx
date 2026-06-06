import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Dialog } from '../ui/dialog';
import ShopOrdersView from './order-details';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrderByUserId, getOrderDetails, resetOrderDetails } from '@/store/shop/order-slice';

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
 
export default function ShoppingOrders() {

  const dispatch = useDispatch();
  const {user} = useSelector(state=>state.auth);
  const {orderList,orderDetails} = useSelector(state=>state.shopOrderSlice);
  // console.log("User : ",user)

  useEffect(()=>{
    const getAllOrders = async()=>{
      try{
        dispatch(getAllOrderByUserId(user?.id))
      }catch(error){
        console.log(error)
      }
    }
    getAllOrders();

  },[dispatch,user?.id]);

  console.log("Shop Order : ",orderList)
  const [openDetailsDialog,setOpenDetailsDialog] = useState(false);

  const handleFetchOrderDetails = async(id)=>{
    try{
      const response = await dispatch(getOrderDetails(id));
      setOpenDetailsDialog(true)
    }catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    if(orderDetails!==null){
      setOpenDetailsDialog(true);
    }
  },[orderDetails]);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
         
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead><span className="sr-only">Buttons</span></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {
              orderList && orderList.length>0 ?
              orderList.map((item,index)=>{
                return(
                <TableRow key={index}>
                  <TableCell>{item?._id || ""}</TableCell>
                  <TableCell>{item?.orderDate.split("T")[0] || ""}</TableCell>
                  <TableCell>
                    <span 
                      className="py-1 px-3 rounded-full text-xs font-semibold inline-block"
                      style={getStatusStyle(item?.orderStatus)}
                    >
                      {item?.orderStatus || ""}
                    </span>
                  </TableCell>
                  <TableCell>₹{item?.totalAmount?.toFixed(2) || ""}</TableCell>
                  <TableCell>
                    <Dialog open={openDetailsDialog} onOpenChange = {()=>{
                      setOpenDetailsDialog(false);
                      dispatch(resetOrderDetails());
                    }} >
                      <Button  onClick = {()=>handleFetchOrderDetails(item?._id)}>
                        View Details
                      </Button>
                      <ShopOrdersView orderDetails = {orderDetails}/>
                    </Dialog>
                  </TableCell>
                </TableRow>
                )
              })
              :
              null
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
