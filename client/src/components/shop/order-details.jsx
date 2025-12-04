import React from 'react'
import { DialogContent, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { cancelOrder, getAllOrderByUserId, getOrderDetails } from '@/store/shop/order-slice'
import { generateInvoicePDF } from '@/utils/pdf-generator'
import { useToast } from '@/hooks/use-toast'

export default function ShopOrdersView({ orderDetails }) {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { toast } = useToast();

    const handleCancelOrder = (e) => {
        e.preventDefault();
        dispatch(cancelOrder(orderDetails?._id)).then((data) => {
            if (data?.payload?.success) {
                dispatch(getOrderDetails(orderDetails?._id));
                dispatch(getAllOrderByUserId(user?.id));
                toast({
                    title: data?.payload?.message,
                })
            } else {
                toast({
                    title: data?.payload?.message || "Something went wrong",
                    variant: "destructive"
                })
            }
        })
    }

    // console.log("Order Details : ",orderDetails)

    return (

        <DialogContent className="productModal sm:max-w-[600px] h-[95%] overflow-y-scroll">
            <div className="sr-only">
                <DialogDescription>Order Details</DialogDescription>
            </div>

            <div className="grid gap-2">
                {/* Order Data */}
                <div className="grid gap-1">

                    <div className="flex items-center justify-between mt-4">
                        <p className="font-medium">
                            Order ID
                        </p>
                        <Label>
                            {orderDetails?._id || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <p className="font-medium">
                            Order Date
                        </p>
                        <Label>
                            {orderDetails?.orderDate.split("T")[0] || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <p className="font-medium">
                            Order Status
                        </p>
                        <Label>
                            {orderDetails?.orderStatus || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <p className="font-medium">
                            Order Price
                        </p>
                        <Label>
                            {orderDetails?.totalAmount || ""}
                        </Label>
                    </div>

                    <Separator />

                    <div className="grid gap-4">

                        <div className='font-medium'>Order Details</div>
                        <ul className="grid gap-3">
                            {
                                orderDetails && orderDetails.cartItems && orderDetails.cartItems.map((item, index) => (
                                    <li className="flex items-center justify-between" key={index}>
                                        <span>{item?.title || ""}</span>
                                        <span>{item?.price * item?.quantity || ""}</span>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="grid gap-4 mt-4">
                        <div className="grid gap-2">
                            <div className='font-medium'>Order Address</div>
                            <div className='grid gap-0.5 text-muted-foreground'>
                                <span className='flex justify-between'>
                                    <span className='font-semibold'>
                                        City :
                                    </span>
                                    <span >
                                        {orderDetails?.addressInfo?.city || ""}
                                    </span>
                                </span>
                                <span className='flex justify-between'>
                                    <span className='font-semibold'>
                                        Address :
                                    </span>
                                    <span >
                                        {orderDetails?.addressInfo?.address || ""}
                                    </span>
                                </span>
                                <span className='flex justify-between'>
                                    <span className='font-semibold'>
                                        PinCode :
                                    </span>
                                    <span >
                                        {orderDetails?.addressInfo?.pincode || ""}
                                    </span>
                                </span>
                                <span className='flex justify-between'>
                                    <span className='font-semibold'>
                                        Contact :
                                    </span>
                                    <span >
                                        {orderDetails?.addressInfo?.phone || ""}
                                    </span>
                                </span>

                                {
                                    orderDetails?.addressInfo?.notes !== "" &&
                                    <span className='flex justify-between'>
                                        <span className='font-semibold'>
                                            Notes :
                                        </span>
                                        <span >
                                            {orderDetails?.addressInfo?.notes || ""}
                                        </span>
                                    </span>
                                }
                            </div>
                        </div>

                    </div>
                </div>
                {
                    orderDetails?.orderStatus?.toLowerCase() === 'pending' &&
                    <div className='mt-4'>
                        <Button onClick={handleCancelOrder} className="w-full bg-red-600 hover:bg-red-700 text-white">Cancel Order</Button>
                    </div>
                }
                <div className='mt-4'>
                    <Button onClick={() => generateInvoicePDF(orderDetails)} className="w-full">
                        Download Invoice
                    </Button>
                </div>
            </div>
        </DialogContent>
    )
}
