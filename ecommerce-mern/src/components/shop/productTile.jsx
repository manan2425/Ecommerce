/* eslint react/prop-types: 0 */

import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { brandOptionsMap, categoryOptionsMap } from '@/config'

export default function ShppingProductTile({ product, handleGetProductDetails, handleAddToCart }) {


    return (
        <>
            <Card className="w-full mx-w-sm mx-auto cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-none overflow-hidden group">
                <div className="relative overflow-hidden" onClick={() => handleGetProductDetails(product?._id)} >
                    <img src={product.image} alt="Error" className="w-full h-[300px] object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-110"
                    />
                    {
                        product?.salePrice > 0 ?
                            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-md">Sale</Badge> : null
                    }
                    <CardContent className="p-5 bg-white">
                        <h2 className='text-xl font-bold mb-2 text-gray-800 line-clamp-1 group-hover:text-primary transition-colors'>
                            {product?.title || "Title"}
                        </h2>
                        <div className='flex justify-between items-center mb-3'>
                            <span className='text-sm text-muted-foreground font-medium bg-gray-100 px-2 py-1 rounded'>{categoryOptionsMap[product?.category]}</span>
                            <span className='text-sm text-muted-foreground font-medium'>{brandOptionsMap[product?.brand]}</span>
                        </div>
                        <div className='flex justify-between items-center mb-2'>
                            <span className={`${product?.salePrice > 0 ? "line-through text-gray-400 text-base" : "text-lg font-bold text-primary"} `}>${product?.price}</span>
                            {
                                product?.salePrice > 0 &&
                                <span className='text-xl font-bold text-red-600'>${product?.salePrice}</span>
                            }
                        </div>
                    </CardContent>
                </div>
                <CardFooter className="p-4 bg-white border-t border-gray-100">
                    <Button className="w-full font-bold py-5 rounded-lg shadow-md hover:shadow-lg transition-all" onClick={() => handleAddToCart(product._id)}>
                        Add to Cart
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
