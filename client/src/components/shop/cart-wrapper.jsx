/* eslint react/prop-types: 0 */
import React from 'react'
import { SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import CartItemsContent from './cart-items-content'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function CartWrapper({cartItems,setOpenCartSheet}) {

    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(state => state.auth);

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

    const handleCheckout = () => {
      if (!isAuthenticated) {
        setOpenCartSheet(false);
        navigate("/auth/login");
        return;
      }
      navigate("/shop/checkout");
      setOpenCartSheet(false);
    }
  

  return (
    <>
      <SheetContent className="sm:max-w-md overflow-y-scroll flex flex-col h-full">
        <SheetHeader>
            <SheetTitle>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Your Cart</span>
            </SheetTitle>
        </SheetHeader>

        {cartItems && cartItems.length > 0 ? (
          <div className="flex flex-col flex-1 mt-4">
            <div className="flex-1 space-y-4 pr-2">
                {
                    cartItems.map((item,index)=>{
                        return <CartItemsContent key={index} cartItem={item}    />
                    })
                }
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 pb-4">
              <div className="flex justify-between mb-4">
                  <span className="font-bold text-slate-500">Total Amount:</span>
                  <span className="font-bold text-lg text-slate-900">${totalCartAmount.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-slate-900">Your cart is empty</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <Button 
              className="mt-4 px-8" 
              onClick={() => {
                setOpenCartSheet(false);
                navigate('/shop/listing');
              }}
            >
              Start Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </>
  )
}
