// Register
export const registerFormControls = [
    {
        name : "userName",
        label : "Name",
        placeholder : "Enter Your User Name",
        componentType : "input",
        type : "text",
        value : ""
    },
    {
        name : "email",
        label : "Email",
        placeholder : "Enter Your Emai",
        componentType : "input",
        type : "email",
    },
    {
        name : "password",
        label : "Password",
        placeholder : "Enter Your Password",
        componentType : "input",
        type : "password",
    }
];

// Login
export const loginFormControls = [
    {
        name : "email",
        label : "Email",
        placeholder : "Enter Your Emai",
        componentType : "input",
        type : "email",
    },
    {
        name : "password",
        label : "Password",
        placeholder : "Enter Your Password",
        componentType : "input",
        type : "password",
    }

];

// For Productas
export const addProductFormElements = [

    {
        name : "title",
        label : "Title",
        placeholder : "Enter Product Title",
        componentType : "input",
        type : "text",
        value : ""
    },
    {
        name : "description",
        label : "Description",
        placeholder : "Enter Product Description",
        componentType : "textarea",
    },
    {
        name : "category",
        label : "category",
        placeholder : "Select Category",
        componentType : "select",
        options : [
            {
                id : "men",label : "Men"
            },
            {
                id : "women",label : "Women"
            },
            {
                id : "accessories",label : "Accessories"
            },
            {
                id : "footwear", label : "Footwear"    
            }
        ]
    },
    {
        name : "brand",
        label : "brand",
        placeholder : "Select Brand",
        componentType : "select",
        options : [
            {
                id : "nike",label : "Nike"
            },
            {
                id : "addidas",label : "Addidas"
            },
            {
                id : "puma",label : "Puma"
            },
            {
                id : "zara", label : "Zara"    
            },
            {
                id : "H&M", label : "H&M"
            }
        ]

    },
    {
        name : "price",
        label : "Price",
        type : "text",
        componentType : "input",
        placeholder : "Enter Product Price"
    },
    {
        label : "Sale Price",
        name : "salePrice",
        type : "text",
        componentType : "input",
        placeholder : "Enter Sale Price(optional)"
    },
    {
        label : "Total Stock",
        name : "totalStock",
        componentType : "input",
        type : "text",
        placeholder : "Enter Total Stock"
    },
    {
        label : "Red Stock Threshold",
        name : "redThreshold",
        componentType : "input",
        type : "text",
        placeholder : "Stock level for RED color (e.g., 5)"
    },
    {
        label : "Yellow Stock Threshold",
        name : "yellowThreshold",
        componentType : "input",
        type : "text",
        placeholder : "Stock level for YELLOW color (e.g., 20)"
    }
];

// Address Form Controls
export const addressFormControl = [
    {
        label : "Address",
        name : "address",
        componentType : "input",
        type : "text",
        placeholder : "Enter Address"
    },
    {
        label : "City",
        name : "city",
        componentType : "input",
        type : 'text',
        placeholder : "Enter City"
    },
    {
        label : 'PinCode',
        name : 'pincode',
        componentType : "input",
        type : "text",
        placeholder : "Enter PinCode"
    },
    {
        label : "Phone",
        name : "phone",
        componentType : "input",
        type : "text",
        placeholder : "Enter Phone"
    },
    {
        label : "Notes",
        name : "notes",
        componentType : "textarea",
        placeholder : "Enter any additional notes"
    }
];

// For Menu Items
export const shoppingViewHeaderMenuItems = [
    {
        id : "home",
        label : "Home",
        path  : "/shop/home"
    },
    {
        id : "men",
        label : "Men",
        path : "/shop/listing"    
    },
    {
        id : "women",
        label : "Women",
        path : "/shop/listing" 
    },
    {
        id : "kids",
        label : "Kids",
        path : "/shop/listing" 
    },
    {
        id : "footwear",
        label : "Footwear",
        path : "/shop/listing" 
    },
    {
        id : "accessories",
        label : "Accessories",
        path : "/shop/listing" 
    }
]

export const categoryOptionsMap = {
    men : "Men",
    women : "Women",
    kids : "Kids",
    accessories : "Accessories",
    footwear : 'Footwear'
}

export const brandOptionsMap = {
    nike : "Nike",
    adidas : "Adidas",
    puma : "Puma",
    levi : "Levi",
    zara : "Zara",
    "h&m" : 'H&M'
}

// Filter Options
export const filterOptions = {
    category : [
        {id : "men", label : "Men"},
        {id : "women", label : "Women"},
        {id : "kids", label : "Kids"},
        {id : "accessories", label : "Accessories"},
        {id : "footwear", label : "Footwear"}
    ],
    brand : [
        {id : "nike", label : "Nike"},
        {id : "adidas", label : "Adidas"},
        {id : "puma", label : "Puma"},
        {id : "levi", label : "Levi"},
        {id : "zara", label : "Zara"},
        {id : "h&m", label : "H&M"}
    ]   
}

// For sort Options
export const sortOptions = [
    {id : "price-lowtohigh", label : "Price Low to High"},
    {id : "price-hightolow", label : "Price High to Low"},
    {id : "title-atoz", label : "Title A to Z"},
    {id : "title-ztoa", label : "Title Z to A"},
];
