import Product from "../../models/Product.js";


export const getFilteredProducts = async(req,res)=>{
    try{

        const {category = [],brand = [],sortBy = "price-lowtohigh", keyword = ""} = req.query;
        let filters = {};
        if(category.length > 0){
            filters.category = {$in : category.split(",")};
        } 
        if(brand.length > 0){
            filters.brand = {$in : brand.split(",")};
        } 
        let sort = {};

        switch(sortBy){
            case "price-lowtohigh":
                sort.price = 1;
            break;

            case "price-hightolow":
                sort.price = -1;
            break;
            
            case "title-atoz":
                sort.title = 1;
            break;
            
            case "title-ztoa":
                sort.title = -1;
            break;

            default:
                sort.price = 1;
                 
               
              
        }


        const products = await Product.find(filters).sort(sort);
        return res.status(200).json({
            success : true,
            message : "Products Data Found Successfully",
            data : products
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"

        })
    }
}

export const getProductDetails = async(req,res)=>{
    try{

        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                success : false,
                message : "Product not found"
            });
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Product found",
                data : product
            });
        }


    }
    catch(error){
        console.log(error);    
        return res.status(500).json({
            success : false,
            message : "Some Error Occured"

        })
    }
}