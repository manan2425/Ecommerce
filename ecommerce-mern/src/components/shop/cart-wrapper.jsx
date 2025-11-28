/* eslint react/prop-types: 0 */
import React from 'react'
import { SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import CartItemsContent from './cart-items-content'
import { useNavigate } from 'react-router-dom'

export default function CartWrapper({cartItems,setOpenCartSheet}) {

    const navigate = useNavigate();

        const totalCartAmount = cartItems && cartItems.length > 0 
        ? cartItems.reduce(
                (sum, currentItem) => {
                    const unit = (currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) || 0;
                    const addon = currentItem?.selectedPart?.price || 0;
                    return sum + ((unit + addon) * (currentItem?.quantity || 1));
                },
                0
            ) 
    : 0;
  


  return (
    <SheetContent className="sm:max-w-md overflow-y-scroll">
        <SheetHeader>
            <SheetTitle>
                <span className="font-extrabold">Your Wishlist Hope You Purchase It</span>
            </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
            {
                cartItems && cartItems.length>0 && cartItems.map((item,index)=>{
                    return <CartItemsContent key={index} cartItem={item}    />
                })
            }
        </div>
        <div className="flex justify-between mt-8">
            <span className="font-bold">
                Total Amount :
            </span>
            <span className="font-bold">
                ${totalCartAmount}
            </span>
        </div>
 
        <Button className="w-full mt-6" onClick={()=>{navigate("/shop/checkout");
        setOpenCartSheet(false)}}>
            Check Out
        </Button>
    </SheetContent>
  )
}
