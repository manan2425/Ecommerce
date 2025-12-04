import Address from "@/components/shop/address";
import image from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import CartItemsContent from "@/components/shop/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/hooks/use-toast";
import { clearCart } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";

export default function ShopCheckout() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems } = useSelector(state => state.shopCart);
  const { user } = useSelector(state => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);

  console.log("Current Address : ", currentSelectedAddress);
  console.log("Cart Items : ", cartItems);


  const totalCartAmount = cartItems && cartItems.items && cartItems.items.length > 0
    ? cartItems.items.reduce(
      (sum, currentItem) => {
        const unit = (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) || 0;
        const addon = currentItem?.selectedPart?.price || 0;
        return sum + ((unit + addon) * (currentItem?.quantity || 1));
      },
      0
    )
    : 0;


  const handleInitiatePayment = async () => {

    try {
      if (currentSelectedAddress === null) {

        toast({
          title: "Failed",
          description: "Address is Required,Please Select Address",
          variant: "destructive"
        })
        return;

      }

      if (cartItems === null) {

        toast({
          title: "Failed",
          description: "Cart is Empty ",
          variant: "destructive"
        })
        return;
      }

      const orderData = {
        userId: user?.id,
        cartItems: cartItems.items.map(item => ({
          productId: item?.productId,
          title: item?.title,
          image: item?.image,
          // include selected 3D part info in order payload
          selectedPart: item?.selectedPart || null,
          price: item?.salePrice > 0 ? item?.salePrice : item?.price,
          unitPrice: item?.salePrice > 0 ? item?.salePrice : item?.price,
          quantity: item?.quantity
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address || "",
          city: currentSelectedAddress?.city || "",
          pincode: currentSelectedAddress?.pincode || "",
          phone: currentSelectedAddress?.phone,
          notes: currentSelectedAddress?.noted || ""
        },
        orderStatus: "pending",
        paymentMethod: "Paypal",
        paymentStatus: "pending",
        totalAmount: totalCartAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        paymentId: "paymentId",
        payerId: "payerId"
      }

      console.log("Order Data : ", orderData);
      const order = await dispatch(createNewOrder(orderData));

      if (order?.payload?.success) {
        dispatch(clearCart());
        toast({
          title: "Order Placed",
          description: "Your Order Placed Successfully!"
        });
        navigate("/shop/account");
      }


    } catch (error) {
      console.log(error)
    }


  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={image}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 p-5 ">
        <Address
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-5">
          {
            cartItems && cartItems.items && cartItems.items.length > 0 ?
              cartItems.items.map((cartItem, index) => {
                return <CartItemsContent key={index} cartItem={cartItem} />
              })
              :
              null
          }
          <div className="flex justify-between mt-8">
            <span className="font-bold">
              Total Amount :
            </span>
            <span className="font-bold">
              $ {totalCartAmount}
            </span>
          </div>
          <div className="mt-4 w-full">
            <Button className="w-full" onClick={() => handleInitiatePayment()}>
              Checkout With PayPal
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
