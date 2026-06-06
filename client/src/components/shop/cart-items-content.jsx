/* eslint react/prop-types: 0 */
import React from 'react'
import { Button } from '../ui/button'
import { Minus, Plus, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteCartItem, updateCartQuantity } from '@/store/shop/cart-slice';
import { useToast } from '@/hooks/use-toast';

export default function CartItemsContent({ cartItem, totalCartAmount }) {

  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector(state => state.auth);

  const handleCartItemDelete = async (cartItem) => {
    try {
      const data = await dispatch(deleteCartItem({ userId: user?.id, itemId: cartItem?.itemId }));
      console.log("DeleteCart   : ", data);

      if (data?.payload?.success === true) {
        toast({
          title: data?.payload?.message,
        })
      }
      else {

        toast({
          title: data?.payload?.message || "Something Went Wrong",
          variant: "destructive"
        })
      }


    } catch (error) {
      console.log(error);
    }
  }

  const handleUpdateItem = async (cartItem, operation) => {
    try {

      const newQuantity = operation === "add" ? cartItem?.quantity + 1 : cartItem?.quantity - 1;

      const response = await dispatch(
        updateCartQuantity({
          userId: user?.id,
          itemId: cartItem?.itemId,
          quantity: newQuantity
        })
      );




    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.selectedPart?.partImage || cartItem?.selectedPart?.thumbnail || cartItem?.image || '/placeholder.png'}
        alt={cartItem?.selectedPart?.name || cartItem?.title}
        className='w-20 h-20 rounded-md object-cover'
      />

      <div className="flex-1">
        <h3 className="font-bold">
          {/* Show subpart name if selected, otherwise product/service name */}
          {cartItem?.selectedPart?.name || cartItem?.title || "Title"}
        </h3>
        {/* Show service badge */}
        {cartItem?.isService && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Service
          </span>
        )}
        {/* Show product name if buying a part */}
        {cartItem?.selectedPart && (
          <p className="text-xs text-gray-500">from: {cartItem?.title}</p>
        )}
        {/* Display selected variant options */}
        {cartItem?.selectedOptions && Object.keys(cartItem.selectedOptions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(cartItem.selectedOptions).map(([key, value]) => (
              <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        {cartItem?.selectedPart && (
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Show if it's a subpart with parent info */}
            {cartItem?.selectedPart?.isSubpart && cartItem?.selectedPart?.parentName && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                ↳ {cartItem.selectedPart.parentName}
              </span>
            )}
            {/* Show price */}
            {cartItem?.selectedPart?.price > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                ₹{cartItem.selectedPart.price}
              </span>
            )}
            {/* Show depth level if nested */}
            {cartItem?.selectedPart?.depth > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Level {cartItem.selectedPart.depth + 1}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center mt-1 gap-3">

          <Button variant="outline" className="w-8 h-8 rounded-full" size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateItem(cartItem, "minus")}
          >
            <Minus />
          </Button>

          <span className='font-semibold'>
            {cartItem?.quantity || "Quantity"}
          </span>

          <Button variant="outline" className="w-8 h-8 rounded-full" size="icon"
            onClick={() => handleUpdateItem(cartItem, "add")}
          >
            <Plus />
          </Button>

        </div>
      </div>

      <div className="flex flex-col items-end">
        <p className="font-semibold">
          ₹ {(() => {
            // Handle service pricing
            if (cartItem?.isService) {
              return (cartItem?.price * (cartItem?.quantity || 1)).toLocaleString();
            }
            
            // Calculate price considering: variant > part > product
            let basePrice = 0;
            
            // If variant selected with its own price, use that
            if (cartItem?.selectedVariant?.salePrice > 0) {
              basePrice = cartItem.selectedVariant.salePrice;
            } else if (cartItem?.selectedVariant?.price > 0) {
              basePrice = cartItem.selectedVariant.price;
            } else if (cartItem?.selectedPart?.price > 0) {
              // If part has its own price, use that
              basePrice = cartItem.selectedPart.price;
            } else {
              // Use product price
              basePrice = (cartItem?.salePrice > 0 && cartItem?.salePrice < cartItem?.price) 
                ? cartItem?.salePrice 
                : cartItem?.price || 0;
            }
            
            return (basePrice * (cartItem?.quantity || 1)).toLocaleString();
          })()}
        </p>
        <Trash className="cursor-pointer mt-2" color='red' size={20} onClick={() => handleCartItemDelete(cartItem)} />
      </div>

    </div>
  )
}
