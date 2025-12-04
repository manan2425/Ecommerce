import React, { useState } from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import img from "../../assets/ImgIcon.png";
import { Button } from '../ui/button';
import { Trash2, FilePenLine, Package, MousePointer2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteProduct, fetchAllProducts } from '@/store/admin/product-slice';
import { useToast } from "@/hooks/use-toast";
import { getStockStatusColor } from '@/lib/stockStatus';
import PartsManagement from './parts-management';

export default function ProductTile({ product, onEdit, onOpenBuilder, onPartsSaved }) {
    const { toast } = useToast();
    const dispatch = useDispatch();
    const [isPartsSheetOpen, setIsPartsSheetOpen] = useState(false);

    const DeleteById = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            console.log("Delete By ID : ", id);
            const data = await dispatch(deleteProduct({ id: id }));
            if (data?.payload?.success === true) {
                toast({
                    title: data?.payload?.message || "Product Deleted Successfully",
                });
                await dispatch(fetchAllProducts());
            } else {
                console.log("Error :", data);
                toast({
                    title: data?.payload?.message || "Something Went Wrong",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handlePartsSaved = (updatedParts) => {
      if (onPartsSaved) {
        onPartsSaved(product?._id, updatedParts);
      }
      setIsPartsSheetOpen(false);
      toast({
        title: "Parts updated successfully"
      });
    }

    // Get stock status color based on thresholds
    const stockStatusColor = getStockStatusColor(
      product?.totalStock,
      product?.redThreshold,
      product?.yellowThreshold
    );

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
                    
                    {/* Stock Status Display */}
                    <div className="mb-3 p-2 rounded border">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">Stock: </span>
                            <span className="text-sm font-bold">{product?.totalStock || 0} units</span>
                        </div>
                        <div className={`${stockStatusColor.color} ${stockStatusColor.textColor} py-1 px-2 rounded text-center text-sm font-semibold`}>
                            {stockStatusColor.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 text-center">
                            Red: ≤{product?.redThreshold || 5} | Yellow: ≤{product?.yellowThreshold || 20}
                        </div>
                    </div>

                    {/* Parts Info */}
                    {product?.parts && product?.parts.length > 0 && (
                        <div className="mb-3 p-2 rounded border border-orange-200 bg-orange-50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-orange-900">
                                    {product.parts.length} Parts Available
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="flex w-full gap-2">
                        <Button 
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700" 
                            onClick={() => setIsPartsSheetOpen(true)}
                            title="Manage Parts (List View)"
                        >
                            <Package className="h-4 w-4" />
                        </Button>
                        <Button 
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 flex-1" 
                            onClick={() => onOpenBuilder && onOpenBuilder()}
                            title="Visual Parts Builder"
                        >
                            <MousePointer2 className="h-4 w-4 mr-1" />
                            Visual Builder
                        </Button>
                    </div>
                    <div className="flex w-full gap-2">
                        <Button className="bg-sky-700 flex-1" onClick={() => onEdit && onEdit()}>
                            <FilePenLine className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button className="bg-red-500 flex-1" onClick={() => DeleteById(product?._id)}> 
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </CardFooter>
            </div>
        </Card>

        {/* Parts Management Modal */}
        <PartsManagement 
            product={product}
            isOpen={isPartsSheetOpen}
            onClose={() => setIsPartsSheetOpen(false)}
            onSave={handlePartsSaved}
        />
    </>
  )
}