import { filterOptions } from '@/config'
import React, { Fragment, useEffect } from 'react'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
 

export default function ProductFilter({filters,handleFilter}) {
 
 
 
  return (
    <div className='bg-background rounded-lg shadow-md lg:sticky top-2  lg:h-fit   '>
        <div className='p-4 border-b'>
            <h2 className='text-lg font-semibold'>
                Filters
            </h2>
        </div>
        <div className='p-4 space-y-4'>
            {
                Object.keys(filterOptions).map((keyItem,index)=>{
                return <Fragment key={index}>
                    <div>
                        <h3 className = "text-base font-semibold">{keyItem}</h3>
                        <div className="grid gap-2 mt-2">
                            {
                                filterOptions[keyItem].map((option,index)=>{
                                    return(
                                        <Fragment key={index}>
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
