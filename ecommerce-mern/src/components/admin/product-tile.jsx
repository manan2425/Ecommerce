import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import img from "../../assets/ImgIcon.png";
import { Button } from '../ui/button';
import { Trash2,FilePenLine } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteProduct, fetchAllProducts } from '@/store/admin/product-slice';
import { useToast } from "@/hooks/use-toast";
export default function ProductTile({product,setFormData,setOpenCreateProducts,setCurrentEditedId,setUploadedImageUrl,currentEditedId}) {
    const {toast} = useToast();
    const dispatch = useDispatch();

    const DeleteById = async(id)=>{
        try{
            console.log("Delete By ID : ", id);
            const data = await dispatch(deleteProduct({id : id}));
            if(data?.payload?.success===true){
                toast({
                  title : data?.payload?.message || "Product Edited Successfully",
                });
      
                try{
                  const getProducts = await dispatch(fetchAllProducts());
                }catch(error){
                  console.log(error);
                }
                setOpenCreateProducts(false)
                setFormData({
                  image : "",
                  title : "",
                  description : "",
                  category : "",
                  brand : "",
                  price : "",
                  salePrice : "",
                  totalStock : ""
                });
              }
              else{
                console.log("Error :",data)
                toast({
                  title : data?.payload?.message || "Something Went Wrong",
                  variant : "destructive"
                })
              }

        }catch(error){
            console.log(error);
        }
    }


  return (
    <>
        <Card className="w-ful max-w-sm mx-auto">
            <div>
                <div className="relative">
                    <img src={product?.image || img} 
                        alt={product?.title} 
                        className='w-full h-[300px] object-cover rounded-t-lg'
                    />
                </div>
                <CardContent>
                    <h2 className='text-xl font-bold my-2'>
                        {product?.title || "title"}
                    </h2>
                    <div className="flex justify-between items-center mb-2">
                        <span className={` ${(product?.salePrice>0 &&  product?.salePrice<product?.price) ? 'line-through': ''}  text-lg font-semibold text-primary`}>${product?.price || "price"}</span>
                        {
                            (product?.salePrice>0  &&  product?.salePrice<product?.price) && <span className="text-lg font-bold">${product?.salePrice || "sale price"}</span>
                        }
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button className="bg-sky-700" onClick={()=>{setOpenCreateProducts(true) 
                      setCurrentEditedId(product?._id)
                      setFormData(product)
                      setUploadedImageUrl(product?.image)
                    }}>
                  
                        <FilePenLine />
                    </Button>
                    <Button className="bg-red-500" onClick={()=>DeleteById(product?._id)}> 
                        <Trash2  />
                    </Button>
                </CardFooter>
            </div>
        </Card>   
    </>
  )
}