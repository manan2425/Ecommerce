/**
 * SEO Implementation Guide for Homepage
 * 
 * This file demonstrates how to use the SEO hooks and utilities
 */

// EXAMPLE 1: Basic usage in your ShopHome component
// ====================================================

// import { useSEO } from '@/hooks/use-seo';
// import { getSEOConfig } from '@/config/seo';
// import { JsonLd, generateOrganizationSchema } from '@/lib/structured-data';

// export default function ShopHome() {
//   const seoConfig = getSEOConfig('home');
//   useSEO(seoConfig);

//   return (
//     <>
//       <JsonLd schema={generateOrganizationSchema()} />
//       {/* Rest of your component */}
//     </>
//   );
// }

// ====================================================
// EXAMPLE 2: With custom overrides
// ====================================================

// export default function ShopHome() {
//   const seoConfig = getSEOConfig('home', {
//     title: 'SHREE MARUTI TRADERS - Buy Industrial Automation Parts Online',
//     ogImage: 'https://shreemarutitraders.com/hero-banner.jpg',
//   });
//   useSEO(seoConfig);
//   
//   return (
//     <>
//       <JsonLd schema={generateOrganizationSchema()} />
//       {/* ... */}
//     </>
//   );
// }

// ====================================================
// EXAMPLE 3: Dynamic product page SEO
// ====================================================

// import { useParams } from 'react-router-dom';
// import { useSEO } from '@/hooks/use-seo';
// import { JsonLd, generateProductSchema } from '@/lib/structured-data';

// export default function ProductDetail() {
//   const { productId } = useParams();
//   const [product, setProduct] = useState(null);

//   useEffect(() => {
//     // Fetch product...
//     setProduct({
//       name: 'PLC Controller',
//       description: 'Industrial PLCController with advanced automation features',
//       price: '25999',
//       // ... other fields
//     });
//   }, [productId]);

//   if (product) {
//     useSEO({
//       title: `${product.name} - SHREE MARUTI TRADERS`,
//       description: product.description,
//       keywords: `${product.name}, automation, industrial parts, buy online`,
//       ogTitle: product.name,
//       ogDescription: product.description,
//       ogImage: product.image,
//       canonical: `https://shreemarutitraders.com/product/${productId}`,
//     });
//   }

//   return (
//     <>
//       {product && <JsonLd schema={generateProductSchema(product)} />}
//       {/* Product details */}
//     </>
//   );
// }

// ====================================================
// IMPLEMENTATION CHECKLIST
// ====================================================

const IMPLEMENTATION_CHECKLIST = [
  {
    task: '1. Update SEO config with actual business details',
    file: 'src/config/seo.js',
    details: [
      '- Update baseURL to your actual domain',
      '- Add real phone number and email',
      '- Update social media URLs',
      '- Add postal code'
    ]
  },
  {
    task: '2. Add useSEO hook to homepage',
    file: 'src/pages/shop/home.jsx',
    example: `
      import { useSEO } from '@/hooks/use-seo';
      import { getSEOConfig } from '@/config/seo';
      
      export default function ShopHome() {
        useSEO(getSEOConfig('home'));
        return (/* ... */);
      }
    `
  },
  {
    task: '3. Add structured data to homepage',
    file: 'src/pages/shop/home.jsx',
    example: `
      import { JsonLd, generateOrganizationSchema } from '@/lib/structured-data';
      
      return (
        <>
          <JsonLd schema={generateOrganizationSchema()} />
          {/* Your content */}
        </>
      );
    `
  },
  {
    task: '4. Add SEO to other pages (Shop, Services, About, Contact)',
    file: 'src/pages/shop/*.jsx',
    details: [
      '- Use getSEOConfig() with page name',
      '- Add useSEO hook at component start',
      '- Add JsonLd for appropriate schema types'
    ]
  },
  {
    task: '5. Create sitemap.xml',
    file: 'public/sitemap.xml',
    details: [
      'Add static routes (home, shop, services, contact, about)',
      'Dynamically generate product/category URLs'
    ]
  },
  {
    task: '6. Create robots.txt',
    file: 'public/robots.txt',
    details: [
      'Point to sitemap',
      'Define crawl delays if needed'
    ]
  },
  {
    task: '7. Test SEO implementation',
    tools: [
      'Google PageSpeed Insights: https://pagespeed.web.dev/',
      'Google Search Console: https://search.google.com/search-console/',
      'Lighthouse (Chrome DevTools)',
      'Schema.org Validator: https://validator.schema.org/'
    ]
  }
];

export default IMPLEMENTATION_CHECKLIST;
