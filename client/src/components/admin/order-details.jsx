import CommonForm from "@/components/common/form";
import { DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getAllOrders, resetOrderDetails, updateOrderStatus, generateEwayBill } from "@/store/shop/order-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function AdminOrderDetailsView({ orderDetails, setOpenDetailsDialog }) {
    // console.log("Order Details : ",orderDetails);

    const dispatch = useDispatch();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        status: ""
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Update formData when orderDetails changes
    useEffect(() => {
        if (orderDetails?.orderStatus) {
            setFormData({ status: orderDetails.orderStatus });
        }
    }, [orderDetails]);
    
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        
        const { status } = formData;
        const id = orderDetails?._id;

        if (!id || !status) {
            toast({
                title: "Error",
                description: "Order ID or status is missing",
                variant: "destructive"
            });
            return;
        }

        setIsUpdating(true);
        
        try {
            await dispatch(updateOrderStatus({ id, orderStatus: status })).unwrap();

            toast({
                title: "Success",
                description: "Order status updated successfully"
            });

            dispatch(resetOrderDetails());
            setOpenDetailsDialog(false);
            dispatch(getAllOrders());

        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: error?.message || "Failed to update order status",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    }

    const handleGenerateEwayBill = async () => {
        const id = orderDetails?._id;
        if (!id) return;

        setIsUpdating(true);
        try {
            await dispatch(generateEwayBill(id)).unwrap();
            
            toast({
                title: "Success",
                description: "E-Way Bill generated successfully"
            });
            
            // Close the dialog and refresh orders to show new data
            setOpenDetailsDialog(false);
            dispatch(getAllOrders());
            
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: error?.message || "Failed to generate E-Way Bill",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <DialogContent className="productModal sm:max-w-[600px] h-[95%] overflow-y-scroll">
            <div className="sr-only">
                <DialogDescription>Order Details</DialogDescription>
            </div>
            <div className="grid gap-6">
                {/* Order Data */}
                <div className="grid gap-2">

                    <div className="flex items-center justify-between mt-6">
                        <p className="font-medium">
                            Order ID
                        </p>
                        <Label>
                            {orderDetails?._id || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <p className="font-medium">
                            Order Date
                        </p>
                        <Label>
                            {orderDetails?.orderDate.split("T")[0] || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <p className="font-medium">
                            Order Status
                        </p>
                        <Label>
                            {orderDetails?.orderStatus || ""}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <p className="font-medium">
                            Order Price
                        </p>
                        <Label>
                            {orderDetails?.totalAmount || ''}
                        </Label>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <p className="font-medium">
                            E-Way Bill
                        </p>
                        <div className="flex items-center gap-2">
                            {orderDetails?.ewayBillNumber ? (
                                <Label className="font-bold text-green-600">
                                    {orderDetails.ewayBillNumber}
                                </Label>
                            ) : (
                                <Button 
                                    size="sm" 
                                    onClick={handleGenerateEwayBill} 
                                    disabled={isUpdating}
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-white"
                                >
                                    {isUpdating ? "Generating..." : "Generate E-Way Bill"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                        <div className="grid gap-2"></div>
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

                    <div className="grid gap-4">
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

                    <div>
                        <CommonForm
                            formControls={[
                                {
                                    label: "Order Status",
                                    name: "status",
                                    placeholder: "Select Status",
                                    componentType: "select",
                                    options: [
                                        {
                                            id: "pending", label: "Pending",
                                        },
                                        {
                                            id: "inProcess", label: "In Process"
                                        },
                                        {
                                            id: "inShipping", label: "In Shipping"
                                        },
                                        {
                                            id: "rejected", label: "Rejected"
                                        },
                                        {
                                            id: "delivered", label: "Delivered"
                                        }
                                    ]
                                }
                            ]}
                            formData={formData}
                            setFormData={setFormData}
                            buttonText={isUpdating ? "Updating..." : "Update Order Status"}
                            onSubmit={handleUpdateStatus}
                            isBtnDisabled={isUpdating}
                        />
                    </div>

                </div>
            </div>
        </DialogContent>
    )
}
