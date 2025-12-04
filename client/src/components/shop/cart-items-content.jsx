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
        src={cartItem?.selectedPart?.thumbnail || cartItem?.image}
        alt={cartItem?.title}
        className='w-20 h-20 rounded-md object-cover'
      />

      <div className="flex-1">
        <h3 className="font-bold">
          {cartItem?.title || "Title"}
        </h3>
        {cartItem?.selectedPart && (
          <div className="text-sm text-muted-foreground mt-1">
            <strong>Part:</strong> {cartItem?.selectedPart?.name} {cartItem?.selectedPart?.price ? `· $${cartItem.selectedPart.price}` : ''}
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
          $ {(
            (((cartItem?.salePrice > 0 && cartItem?.salePrice < cartItem?.price) ? cartItem?.salePrice : cartItem?.price) + (cartItem?.selectedPart?.price || 0)) * (cartItem?.quantity || 1)
          ).toFixed(2)}
        </p>
        <Trash className="cursor-pointer mt-2" color='red' size={20} onClick={() => handleCartItemDelete(cartItem)} />
      </div>

    </div>
  )
}
