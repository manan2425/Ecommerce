/* eslint react/prop-types: 0 */
import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
 

export default function AddressCard({addressInfo,handleDeleteAddress,handleEditAddress,setCurrentSelectedAddress}) {
//   console.log("Addr : " ,addressInfo)
    return (
    <Card onClick = {()=>setCurrentSelectedAddress(addressInfo)} >
        <CardContent className="p-4 cursor-pointer ">
            <div className='flex flex-col gap-2'>
                <div className="font-semibold">
                    Address : {addressInfo?.address}
                </div>
                <div className="font-semibold">
                   City : {addressInfo?.city}
                </div>
                <div className="font-semibold">
                    PinCode : {addressInfo?.pincode}
                </div>
                <div className="font-semibold"> 
                    Phone : { addressInfo?.phone}
                </div>
                <div className="font-semibold">
                    Notes : {addressInfo?.notes}
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <div className="w-full flex justify-between">
                <Button onClick={()=>handleEditAddress(addressInfo)}>
                    <Pencil/>
                </Button>
                <Button onClick = {()=>handleDeleteAddress(addressInfo)}>
                    <Trash2/>
                </Button>
            </div>
        </CardFooter>
    </Card>
  )
}
