import Product from "../../models/Product.js";

// Helper function to calculate similarity between two strings (Levenshtein distance based)
const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Calculate Levenshtein distance
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 1 : 1 - matrix[s1.length][s2.length] / maxLen;
};

// Search products with fuzzy matching
export const searchProducts = async (req, res) => {
    try {
        const { q = "", limit = 20 } = req.query;
        
        if (!q || q.trim() === "") {
            return res.status(200).json({
                success: true,
                data: [],
                suggestions: [],
                message: "Please enter a search term"
            });
        }

        const searchTerm = q.trim();
        const searchRegex = new RegExp(searchTerm, "i");
        
        // First, try exact/partial match
        let products = await Product.find({
            isActive: true,
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { brand: searchRegex }
            ]
        }).limit(parseInt(limit));

        // If no exact matches, try fuzzy search
        let suggestions = [];
        if (products.length === 0) {
            // Get all products and find similar ones
            const allProducts = await Product.find({ isActive: true }).select('title description category brand price salePrice image');
            
            const scoredProducts = allProducts.map(product => {
                // Calculate similarity scores
                const titleScore = calculateSimilarity(searchTerm, product.title || '');
                const descScore = calculateSimilarity(searchTerm, product.description || '') * 0.5;
                const categoryScore = calculateSimilarity(searchTerm, product.category || '') * 0.7;
                const brandScore = calculateSimilarity(searchTerm, product.brand || '') * 0.7;
                
                // Also check individual words
                const searchWords = searchTerm.toLowerCase().split(/\s+/);
                const titleWords = (product.title || '').toLowerCase().split(/\s+/);
                
                let wordMatchScore = 0;
                for (const sw of searchWords) {
                    for (const tw of titleWords) {
                        const sim = calculateSimilarity(sw, tw);
                        if (sim > 0.6) wordMatchScore += sim;
                    }
                }
                wordMatchScore = Math.min(wordMatchScore / searchWords.length, 1);
                
                const maxScore = Math.max(titleScore, descScore, categoryScore, brandScore, wordMatchScore);
                
                return {
                    product,
                    score: maxScore
                };
            });

            // Filter products with similarity > 0.3 and sort by score
            const similarProducts = scoredProducts
                .filter(p => p.score > 0.3)
                .sort((a, b) => b.score - a.score)
                .slice(0, parseInt(limit));

            products = similarProducts.map(p => p.product);
            
            // Generate suggestions based on what we found
            if (products.length > 0) {
                suggestions = [...new Set(products.slice(0, 5).map(p => p.title))];
            }
        }

        return res.status(200).json({
            success: true,
            data: products,
            suggestions,
            exactMatch: suggestions.length === 0 && products.length > 0,
            message: products.length > 0 
                ? `Found ${products.length} products` 
                : "No products found"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error searching products",
            error: error.message
        });
    }
};

// Get search suggestions (autocomplete)
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q = "" } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(200).json({
                success: true,
                suggestions: []
            });
        }

        const searchRegex = new RegExp(q.trim(), "i");
        
        // Get matching products
        const products = await Product.find({
            isActive: true,
            $or: [
                { title: searchRegex },
                { category: searchRegex },
                { brand: searchRegex }
            ]
        }).select('title category brand').limit(10);

        // Extract unique suggestions
        const titleSuggestions = products.map(p => p.title);
        const categorySuggestions = [...new Set(products.map(p => p.category))];
        const brandSuggestions = [...new Set(products.map(p => p.brand))];

        const suggestions = [
            ...titleSuggestions.slice(0, 5),
            ...categorySuggestions.filter(c => searchRegex.test(c)),
            ...brandSuggestions.filter(b => searchRegex.test(b))
        ].slice(0, 8);

        return res.status(200).json({
            success: true,
            suggestions: [...new Set(suggestions)]
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error getting suggestions"
        });
    }
};


export const getFilteredProducts = async(req,res)=>{
    try{

        const {category = [],brand = [],sortBy = "price-lowtohigh", keyword = ""} = req.query;
        let filters = { isActive: true };
        if(category.length > 0){
            filters.category = {$in : category.split(",")};
        } 
        if(brand.length > 0){
            filters.brand = {$in : brand.split(",")};
        } 

        if(keyword){
            const regEx = new RegExp(keyword, "i");
            filters.$or = [
                {title : regEx},
                {description : regEx},
                {category : regEx},
                {brand : regEx}
            ]
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


        const products = await Product.find(filters).sort(sort).limit(50);
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
        if(!product || !product.isActive){
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