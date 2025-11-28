import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Dialog } from '../ui/dialog';
import ShopOrdersView from './order-details';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrderByUserId, getOrderDetails, resetOrderDetails } from '@/store/shop/order-slice';
 
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
                  <TableCell>{item?.orderStatus || ""}</TableCell>
                  <TableCell>{item?.totalAmount || ""}</TableCell>
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
