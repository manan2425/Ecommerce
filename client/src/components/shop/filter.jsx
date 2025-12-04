import { filterOptions } from '@/config'
import React, { Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import { fetchShopCategories } from '@/store/shop/category-slice'
 

export default function ProductFilter({filters,handleFilter}) {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.shopCategories);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchShopCategories());
  }, [dispatch]);

  // Build dynamic filter options - categories from DB, brands from config
  const dynamicFilterOptions = {
    category: categories.map(cat => ({
      id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      label: cat.name
    })),
    brand: filterOptions.brand || []
  };
 
 
  return (
    <div className='bg-background rounded-lg shadow-md lg:sticky top-2  lg:h-fit   '>
        <div className='p-4 border-b'>
            <h2 className='text-lg font-semibold'>
                Filters
            </h2>
        </div>
        <div className='p-4 space-y-4'>
            {
                Object.keys(dynamicFilterOptions).map((keyItem,index)=>{
                  // Skip if no options available
                  if (!dynamicFilterOptions[keyItem] || dynamicFilterOptions[keyItem].length === 0) return null;
                  
                return <Fragment key={index}>
                    <div>
                        <h3 className = "text-base font-semibold capitalize">{keyItem}</h3>
                        <div className="grid gap-2 mt-2">
                            {
                                dynamicFilterOptions[keyItem].map((option,idx)=>{
                                    return(
                                        <Fragment key={idx}>
                                            <Label className="flex font-medium items-center gap-2   ">
                                                <Checkbox  onCheckedChange={(checked)=>handleFilter(keyItem,option.id,checked)}  
                                                    checked = {
                                                        filters && Object.keys(filters).length>0 && filters[keyItem] && filters[keyItem].indexOf(option.id) > -1
                                                    }
                                                />
                                                {option.label}
                                            </Label>
                                        </Fragment>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <Separator/>
                </Fragment>
                })
            }
        </div>
    </div>
  )
}
