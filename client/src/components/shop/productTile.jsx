/* eslint react/prop-types: 0 */

import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { brandOptionsMap, categoryOptionsMap } from '@/config'

export default function ShppingProductTile({ product, handleGetProductDetails, handleAddToCart }) {


    return (
        <Card className="w-full max-w-sm mx-auto cursor-pointer hover-lift border-0 shadow-premium bg-white overflow-hidden group rounded-3xl" onClick={() => handleGetProductDetails(product?._id)}>
            <div className="relative overflow-hidden aspect-[4/5]">
                <img 
                    src={product.image} 
                    alt={product?.title} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {
                    product?.salePrice > 0 &&
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl border-0">
                        Sale
                    </Badge>
                }
            </div>
            
            <CardContent className="p-6 bg-white relative">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {categoryOptionsMap[product?.category]}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {brandOptionsMap[product?.brand]}
                    </span>
                </div>
                
                <h2 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                    {product?.title || "Premium Component"}
                </h2>
                
                <div className="flex items-end gap-3">
                    {product?.salePrice > 0 ? (
                        <>
                            <span className="text-2xl font-black text-primary">${product?.salePrice}</span>
                            <span className="text-sm font-medium text-slate-300 line-through mb-1">${product?.price}</span>
                        </>
                    ) : (
                        <span className="text-2xl font-black text-primary">${product?.price}</span>
                    )}
                </div>
            </CardContent>
            
            <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto">
                <Button 
                    className="w-full font-extrabold py-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white text-slate-800 border-slate-200 border hover:bg-primary hover:text-white hover:border-primary" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id);
                    }}
                >
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}
