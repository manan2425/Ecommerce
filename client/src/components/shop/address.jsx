import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import CommonForm from '../common/form'
import { addressFormControl } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import { addNewAddress, deleteAddress, editAddress, fetchAllAddress } from '@/store/shop/address-slice';
import AddressCard from './address-card';
import {  useToast } from '@/hooks/use-toast';

export default function Address({setCurrentSelectedAddress}) {

  const {toast}  = useToast();
  const initialFormData = {
    address : "",
    city : "",
    phone : '',
    pincode : "",
    notes : "",
  };
  
  const {user} = useSelector(state=>state.auth);
  const {addressList} = useSelector(state=>state.shopAddress);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditId,setCurrentEditId] = useState(null);

  // Submit Address 
  const handleAddress = async(e)=>{
    try{
      console.log("Address List >3",addressList.length);
      e.preventDefault();
      if(addressList.length >=3 && currentEditId===null){
        toast({
          title : "You Can Add Max 3 Address",
          variant : "destructive"
        });
        setFormData(initialFormData);
        return;
      }

      if(currentEditId!==null){

        const response = await dispatch(editAddress({
          userId : user?.id,
          addressId : currentEditId,
          formData : formData,
        }));



        // console.log("response Edit : ",response);
        if(response?.payload?.success){
          
          setCurrentEditId(null);

          const fetchAddress = await dispatch(fetchAllAddress(user?.id));
          // console.log("fetching address : ",fetchAddress);
          setFormData(initialFormData);
        }


      }
      else{
        const response = await dispatch(addNewAddress({
          ...formData,
          userId : user?.id
        }));
  
        // console.log("response Address : ",response);
        if(response?.payload?.success){
          const fetchAddress = await dispatch(fetchAllAddress(user?.id));
          console.log("fetching address : ",fetchAddress);
          setFormData(initialFormData);
        }
      }
    }catch(error){
      console.log(error);
    }
  }

  // is Form Valid
  const isFormValid = ()=>{
    try{
      return Object.keys(formData).map(key=>formData[key].trim()!=="").every(item=>item);
    }catch(error){
      console.log(error);
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
      });
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
          formControls={addressFormControl}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditId!==null ? "Edit Address" : "Add Address"}
          onSubmit={handleAddress}
          isBtnDisabled={!isFormValid()} 
        />
      </CardContent>
    </Card>
  )
}
