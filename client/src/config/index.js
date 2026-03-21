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
        // NOTE: Brands are now fetched dynamically from the database
        // This static list is a fallback - the admin products page should fetch brands from API
        options : [
            { id: "siemens", label: "Siemens" },
            { id: "abb", label: "ABB" },
            { id: "schneider-electric", label: "Schneider Electric" },
            { id: "honeywell", label: "Honeywell" },
            { id: "rockwell-automation", label: "Rockwell Automation" },
            { id: "emerson", label: "Emerson" },
            { id: "yokogawa", label: "Yokogawa" },
            { id: "endresshauser", label: "Endress+Hauser" },
            { id: "wika", label: "WIKA" },
            { id: "pepperfuchs", label: "Pepperl+Fuchs" },
            { id: "turck", label: "Turck" },
            { id: "omron", label: "Omron" },
            { id: "mitsubishi-electric", label: "Mitsubishi Electric" },
            { id: "delta-electronics", label: "Delta Electronics" },
            { id: "bosch-rexroth", label: "Bosch Rexroth" },
            { id: "lt-electrical-automation", label: "L&T Electrical & Automation" },
            { id: "phoenix-contact", label: "Phoenix Contact" },
            { id: "weidmller", label: "Weidmüller" },
            { id: "te-connectivity", label: "TE Connectivity" },
            { id: "masibus", label: "Masibus" },
            { id: "keyence", label: "Keyence" },
            { id: "banner-engineering", label: "Banner Engineering" },
            { id: "sick", label: "SICK" },
            { id: "fuji-electric", label: "Fuji Electric" },
            { id: "panasonic-industrial", label: "Panasonic Industrial" },
            { id: "eaton", label: "Eaton" },
            { id: "gic-india", label: "GIC India" },
            { id: "harting", label: "HARTING" },
            { id: "wago", label: "WAGO" },
            { id: "murrelektronik", label: "Murrelektronik" },
            { id: "festo", label: "Festo" },
            { id: "parker-hannifin", label: "Parker Hannifin" },
            { id: "jumo", label: "JUMO" },
            { id: "multispan", label: "Multispan" },
            { id: "autonics", label: "Autonics" },
            { id: "danfoss", label: "Danfoss" },
            { id: "lenze", label: "Lenze" },
            { id: "sew-eurodrive", label: "SEW-EURODRIVE" },
            { id: "ifm-electronic", label: "ifm electronic" },
            { id: "beckhoff", label: "Beckhoff" }
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
    },
    {
        label : "GST Number (Optional - for GST Bill)",
        name : "gstNumber",
        componentType : "input",
        type : "text",
        placeholder : "Enter GST Number (e.g., 22AAAAA0000A1Z5)",
        optional : true
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
    "siemens": "Siemens",
    "abb": "ABB",
    "schneider-electric": "Schneider Electric",
    "honeywell": "Honeywell",
    "rockwell-automation": "Rockwell Automation",
    "emerson": "Emerson",
    "yokogawa": "Yokogawa",
    "endresshauser": "Endress+Hauser",
    "wika": "WIKA",
    "pepperfuchs": "Pepperl+Fuchs",
    "turck": "Turck",
    "omron": "Omron",
    "mitsubishi-electric": "Mitsubishi Electric",
    "delta-electronics": "Delta Electronics",
    "bosch-rexroth": "Bosch Rexroth",
    "lt-electrical-automation": "L&T Electrical & Automation",
    "phoenix-contact": "Phoenix Contact",
    "weidmller": "Weidmüller",
    "te-connectivity": "TE Connectivity",
    "masibus": "Masibus",
    "keyence": "Keyence",
    "banner-engineering": "Banner Engineering",
    "sick": "SICK",
    "fuji-electric": "Fuji Electric",
    "panasonic-industrial": "Panasonic Industrial",
    "eaton": "Eaton",
    "gic-india": "GIC India",
    "harting": "HARTING",
    "wago": "WAGO",
    "murrelektronik": "Murrelektronik",
    "festo": "Festo",
    "parker-hannifin": "Parker Hannifin",
    "jumo": "JUMO",
    "multispan": "Multispan",
    "autonics": "Autonics",
    "danfoss": "Danfoss",
    "lenze": "Lenze",
    "sew-eurodrive": "SEW-EURODRIVE",
    "ifm-electronic": "ifm electronic",
    "beckhoff": "Beckhoff"
}

// Filter Options - Categories are fetched dynamically from DB
// Brand filter removed from user side (admin can still manage brands for products)
export const filterOptions = {
    category : [
        {id : "men", label : "Men"},
        {id : "women", label : "Women"},
        {id : "kids", label : "Kids"},
        {id : "accessories", label : "Accessories"},
        {id : "footwear", label : "Footwear"}
    ]
    // brand filter removed - users filter by category only
}

// For sort Options
export const sortOptions = [
    {id : "price-lowtohigh", label : "Price Low to High"},
    {id : "price-hightolow", label : "Price High to Low"},
    {id : "title-atoz", label : "Title A to Z"},
    {id : "title-ztoa", label : "Title Z to A"},
];
