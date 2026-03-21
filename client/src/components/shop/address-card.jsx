/* eslint react/prop-types: 0 */
import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Pencil, Trash2, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
 

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
                {/* GST Information */}
                {addressInfo?.wantsGstBill && addressInfo?.gstNumber && (
                    <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <FileText className="w-3 h-3 mr-1" />
                                GST Bill
                            </Badge>
                            <span className="text-sm font-mono text-gray-600">
                                {addressInfo?.gstNumber}
                            </span>
                        </div>
                    </div>
                )}
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
