import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import CommonForm from '../common/form'
import { addressFormControl } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import { addNewAddress, deleteAddress, editAddress, fetchAllAddress } from '@/store/shop/address-slice';
import AddressCard from './address-card';
import {  useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export default function Address({setCurrentSelectedAddress}) {

  const {toast}  = useToast();
  const initialFormData = {
    address : "",
    city : "",
    phone : '',
    pincode : "",
    notes : "",
    gstNumber : "",
  };
  
  const {user} = useSelector(state=>state.auth);
  const {addressList} = useSelector(state=>state.shopAddress);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditId,setCurrentEditId] = useState(null);
  const [wantsGstBill, setWantsGstBill] = useState(false);

  // Submit Address 
  const handleAddress = async(e)=>{
    try{
      console.log("Address List >3",addressList.length);
      e.preventDefault();
      
      // Validate GST number if user wants GST bill
      if(wantsGstBill && (!formData.gstNumber || formData.gstNumber.trim() === "")) {
        toast({
          title : "GST Number Required",
          description: "Please enter a valid GST number to get GST bill",
          variant : "destructive"
        });
        return;
      }
      
      if(addressList.length >=3 && currentEditId===null){
        toast({
          title : "You Can Add Max 3 Address",
          variant : "destructive"
        });
        setFormData(initialFormData);
        return;
      }

      const addressData = {
        ...formData,
        wantsGstBill: wantsGstBill,
        gstNumber: wantsGstBill ? formData.gstNumber.trim() : ""
      };

      if(currentEditId!==null){

        const response = await dispatch(editAddress({
          userId : user?.id,
          addressId : currentEditId,
          formData : addressData,
        }));



        // console.log("response Edit : ",response);
        if(response?.payload?.success){
          
          setCurrentEditId(null);
          setWantsGstBill(false);

          const fetchAddress = await dispatch(fetchAllAddress(user?.id));
          // console.log("fetching address : ",fetchAddress);
          setFormData(initialFormData);
        }


      }
      else{
        const response = await dispatch(addNewAddress({
          ...addressData,
          userId : user?.id
        }));
  
        // console.log("response Address : ",response);
        if(response?.payload?.success){
          const fetchAddress = await dispatch(fetchAllAddress(user?.id));
          console.log("fetching address : ",fetchAddress);
          setFormData(initialFormData);
          setWantsGstBill(false);
        }
      }
    }catch(error){
      console.log(error);
    }
  }

  // is Form Valid
  const isFormValid = ()=>{
    try{
      // GST number is optional, so exclude it from required fields check
      const requiredFields = ['address', 'city', 'pincode', 'phone', 'notes'];
      const isRequired = requiredFields.every(key => formData[key] && formData[key].trim() !== "");
      
      // If wants GST bill, GST number must be filled
      if(wantsGstBill && (!formData.gstNumber || formData.gstNumber.trim() === "")) {
        return false;
      }
      
      return isRequired;
    }catch(error){
      console.log(error);
      return false;
    } 
  }
 
  useEffect(()=>{
    const getAddresses = async()=>{   
      try{
        const response = await dispatch(fetchAllAddress(user?.id));
        console.log("Address On Load : ",response);
      }catch(error){
        console.log(error);
      }
    }
    getAddresses();
  },[dispatch,user?.id]);

  // Handle Delete Address
  const handleDeleteAddress = async(address)=>{
    try{  
      if(address._id===currentEditId){
        setCurrentEditId(null);
      }
      const response = await dispatch(deleteAddress({userId : user?.id,addressId : address._id}));
      if(response?.payload?.success){
        const data  = await dispatch(fetchAllAddress(user?.id));
        setFormData(initialFormData);
      }
    }
    catch(error){
      console.log(error);
    }
  }


  // Handle Edit Address
  const handleEditAddress = async(address)=>{
    try{
      setCurrentEditId(address?._id);
      setFormData({
        ...formData,
        address : address?.address || "",
        city : address?.city || "",
        phone : address?.phone || "",
        pincode : address?.pincode || "",
        notes : address?.notes || "",
        gstNumber : address?.gstNumber || "",
      });
      setWantsGstBill(address?.wantsGstBill || false);
    }catch(error){
      console.log(error);
    }
  }
 
 

  // console.log("Address List : ",addressList);

  return (
    <Card>

      <div className='mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2 hover:shadow-sm'>
        {
          addressList && 
          addressList.length > 0 ?
          addressList.map((addr, index) => {
           
            return <AddressCard key={index} addressInfo={addr} 
              handleDeleteAddress = {handleDeleteAddress}
              handleEditAddress = {handleEditAddress}
              setCurrentSelectedAddress = {setCurrentSelectedAddress}
            />
          
          })
          :
          null
        }
      </div>
      <CardHeader>
        <CardTitle>
          {currentEditId!==null ? "Edit Your Address" :  "Add Your Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControl.filter(control => 
            control.name !== 'gstNumber' || wantsGstBill
          )}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditId!==null ? "Edit Address" : "Add Address"}
          onSubmit={handleAddress}
          isBtnDisabled={!isFormValid()} 
        />
        
        {/* GST Bill Checkbox */}
        <div className="flex items-center space-x-3 pt-2 pb-4 border-t mt-4">
          <Checkbox 
            id="gstBill" 
            checked={wantsGstBill}
            onCheckedChange={(checked) => {
              setWantsGstBill(checked);
              if(!checked) {
                setFormData({...formData, gstNumber: ""});
              }
            }}
          />
          <Label 
            htmlFor="gstBill" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I want GST Bill (Enter GST Number above if checked)
          </Label>
        </div>
        
        {wantsGstBill && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <strong>Note:</strong> Please enter a valid 15-digit GST number (e.g., 22AAAAA0000A1Z5) to receive a GST invoice.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
