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
          
          {/* Price Breakdown */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-bold text-lg mb-4">Price Breakdown</h3>
            
            {/* Subtotal */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">$ {subtotal.toFixed(2)}</span>
            </div>
            
            {/* GST */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium text-orange-600">+ $ {gstAmount.toFixed(2)}</span>
            </div>
            
            {/* Grand Total */}
            <div className="flex justify-between py-3 mt-2">
              <span className="font-bold text-lg">Grand Total</span>
              <span className="font-bold text-lg text-green-600">$ {grandTotal.toFixed(2)}</span>
            </div>
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
