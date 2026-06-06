import Address from "@/components/shop/address";
import { useDispatch, useSelector } from "react-redux";
import CartItemsContent from "@/components/shop/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/hooks/use-toast";
import { clearCart } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";
import { logProductPurchase } from "@/lib/activityTracker";

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
        // Calculate price considering: variant > part > product
        let basePrice = 0;
        
        if (currentItem?.selectedVariant?.salePrice > 0) {
          basePrice = currentItem.selectedVariant.salePrice;
        } else if (currentItem?.selectedVariant?.price > 0) {
          basePrice = currentItem.selectedVariant.price;
        } else if (currentItem?.selectedPart?.price > 0) {
          basePrice = currentItem.selectedPart.price;
        } else {
          basePrice = (currentItem?.salePrice > 0 && currentItem?.salePrice < currentItem?.price) 
            ? currentItem?.salePrice 
            : currentItem?.price || 0;
        }
        
        return sum + (basePrice * (currentItem?.quantity || 1));
      },
      0
    )
    : 0;

  // GST Calculation (18%)
  const GST_RATE = 0.18;
  const subtotal = totalCartAmount;
  const gstAmount = subtotal * GST_RATE;
  const grandTotal = subtotal + gstAmount;


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
        cartItems: cartItems.items.map(item => {
          // Calculate the actual price for this item
          let itemPrice = 0;
          if (item?.selectedVariant?.salePrice > 0) {
            itemPrice = item.selectedVariant.salePrice;
          } else if (item?.selectedVariant?.price > 0) {
            itemPrice = item.selectedVariant.price;
          } else if (item?.selectedPart?.price > 0) {
            itemPrice = item.selectedPart.price;
          } else {
            itemPrice = item?.salePrice > 0 ? item?.salePrice : item?.price;
          }
          
          return {
            productId: item?.productId,
            title: item?.title,
            image: item?.image,
            // include selected part info (with subpart hierarchy)
            selectedPart: item?.selectedPart || null,
            // include selected variant and options
            selectedVariant: item?.selectedVariant || null,
            selectedOptions: item?.selectedOptions || null,
            price: itemPrice,
            unitPrice: itemPrice,
            quantity: item?.quantity
          };
        }),
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
        totalAmount: grandTotal,
        subtotal: subtotal,
        gstAmount: gstAmount,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        paymentId: "paymentId",
        payerId: "payerId"
      }

      console.log("Order Data : ", orderData);
      const order = await dispatch(createNewOrder(orderData));

      if (order?.payload?.success) {
        // Track product purchases
        cartItems.items.forEach(item => {
          logProductPurchase(item.productId, item.quantity);
        });
        
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
      <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 flex items-center px-8 shadow-inner">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="relative z-10 container mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <span className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Review Your <span className="text-primary font-light">Order</span>
          </h1>
        </div>
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
          
          {/* Price Breakdown */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>
            
            {/* Subtotal */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹ {subtotal.toFixed(2)}</span>
            </div>
            
            {/* GST */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium text-orange-600">+ ₹ {gstAmount.toFixed(2)}</span>
            </div>
            
            {/* Grand Total */}
            <div className="flex justify-between py-3 mt-2">
              <span className="font-bold text-lg">Grand Total</span>
              <span className="font-bold text-lg text-green-600">₹ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md text-sm text-center font-medium">
              Payment system is currently down for maintenance. We are updating our systems and will be back shortly.
            </div>
            <Button className="w-full opacity-50 cursor-not-allowed" disabled>
              Checkout Temporarily Unavailable
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
