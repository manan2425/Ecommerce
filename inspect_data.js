
async function checkProductData() {
    try {
        // 1. Get all products
        console.log("Fetching products...");
        const listRes = await fetch('http://localhost:5001/api/shop/products/get');
        const listData = await listRes.json();
        const products = listData.data;
        
        if (!products || products.length === 0) {
            console.log("No products found.");
            return;
        }

        console.log(`Found ${products.length} products.`);

        // 2. Find a product with parts
        const productWithParts = products.find(p => p.parts && p.parts.length > 0);
        
        if (!productWithParts) {
            console.log("No product with parts found.");
            return;
        }

        console.log(`Inspecting product: ${productWithParts.title} (${productWithParts._id})`);
        
        // 3. Get full details
        const detailRes = await fetch(`http://localhost:5001/api/shop/products/get/${productWithParts._id}`);
        const detailData = await detailRes.json();
        const product = detailData.data;

        // 4. Inspect parts structure
        console.log("Parts structure:");
        if (product.parts) {
            product.parts.forEach((part, i) => {
                console.log(`Part ${i}: ${part.name}`);
                if (part.subparts && part.subparts.length > 0) {
                    console.log(`  Has ${part.subparts.length} subparts.`);
                    part.subparts.forEach((sub, j) => {
                        console.log(`    Subpart ${j}: ${sub.name}`);
                        if (sub.subparts && sub.subparts.length > 0) {
                            console.log(`      Has ${sub.subparts.length} nested subparts.`);
                            sub.subparts.forEach((nested, k) => {
                                console.log(`        Nested ${k}: ${nested.name}`);
                            });
                        } else {
                            console.log(`      No nested subparts.`);
                        }
                    });
                } else {
                    console.log(`  No subparts.`);
                }
            });
        } else {
            console.log("Product has no parts array.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkProductData();
