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

                    {/* Price Breakdown */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between py-1">
                            <p className="text-gray-600">Subtotal</p>
                            <Label>${orderDetails?.subtotal?.toFixed(2) || orderDetails?.totalAmount || ""}</Label>
                        </div>
                        {orderDetails?.gstAmount > 0 && (
                            <div className="flex items-center justify-between py-1">
                                <p className="text-gray-600">GST (18%)</p>
                                <Label className="text-orange-600">+ ${orderDetails?.gstAmount?.toFixed(2)}</Label>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-1 pt-2 border-t mt-2">
                            <p className="font-bold">Total Amount</p>
                            <Label className="text-green-600 font-bold">
                                ${orderDetails?.totalAmount?.toFixed(2) || ""}
                            </Label>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">

                        <div className='font-medium'>Order Details</div>
                        <ul className="grid gap-3">
                            {
                                orderDetails && orderDetails.cartItems && orderDetails.cartItems.map((item, index) => (
                                    <li className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg" key={index}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{item?.title || ""}</span>
                                            <span className="font-semibold">${(item?.price * item?.quantity) || ""}</span>
                                        </div>
                                        
                                        {/* Show selected options (Color, Size, etc.) */}
                                        {item?.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                    <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Show selected part info */}
                                        {item?.selectedPart && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {/* Show if it's a subpart */}
                                                {item.selectedPart.isSubpart && item.selectedPart.parentName && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mr-2">
                                                        Subpart of: {item.selectedPart.parentName}
                                                    </span>
                                                )}
                                                <div>
                                                    <strong>Part:</strong> {item.selectedPart.name}
                                                    {item.selectedPart.price > 0 && ` · $${item.selectedPart.price}`}
                                                    {item.selectedPart.depth > 0 && (
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            (Level {item.selectedPart.depth + 1})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-muted-foreground">
                                            Qty: {item?.quantity}
                                        </div>
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
                    <Button onClick={async () => await generateInvoicePDF(orderDetails)} className="w-full">
                        Download Invoice
                    </Button>
                </div>
            </div>
        </DialogContent>
    )
}
