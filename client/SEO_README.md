# SEO Meta Tags Implementation - Quick Reference

## 📋 What Was Added

### 1. **Enhanced index.html** (`client/index.html`)
- Essential meta tags (viewport, description, keywords)
- Open Graph tags for social media sharing
- Twitter Card tags
- Canonical URL
- Business contact information schema
- Theme color optimization

### 2. **SEO Hook** (`client/src/hooks/use-seo.js`)
Dynamic meta tag management hook that updates page-specific SEO on component mount.

**Usage:**
```javascript
import { useSEO } from '@/hooks/use-seo';

export default function Page() {
  useSEO({
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
    ogTitle: 'Social Share Title',
    ogDescription: 'Social share description',
    ogImage: 'url-to-image',
    canonical: 'https://shreemarutitraders.com/page'
  });
  
  return <div>Content</div>;
}
```

### 3. **SEO Configuration** (`client/src/config/seo.js`)
Centralized SEO metadata for all pages with easy-to-use helper function.

**Usage:**
```javascript
import { getSEOConfig } from '@/config/seo';

const seoConfig = getSEOConfig('home', {
  // optional overrides
  ogImage: 'custom-image.jpg'
});

useSEO(seoConfig);
```

### 4. **Structured Data** (`client/src/lib/structured-data.js`)
JSON-LD generators for rich snippets:
- Organization schema
- Product schema  
- Breadcrumb schema

**Usage:**
```javascript
import { JsonLd, generateOrganizationSchema } from '@/lib/structured-data';

<JsonLd schema={generateOrganizationSchema()} />
```

### 5. **Robots.txt** (`client/public/robots.txt`)
Instructs search engines which pages to crawl/index.

### 6. **Sitemap.xml** (`client/public/sitemap.xml`)
List of all pages for search engine discovery.

## 🚀 Quick Start

### Step 1: Update Company Details
Edit `src/config/seo.js`:
```javascript
baseURL: 'https://your-domain.com',
// ... update other details
```

### Step 2: Add to Homepage
In `src/pages/shop/home.jsx`:
```javascript
import { useSEO } from '@/hooks/use-seo';
import { getSEOConfig } from '@/config/seo';
import { JsonLd, generateOrganizationSchema } from '@/lib/structured-data';

export default function ShopHome() {
  useSEO(getSEOConfig('home'));
  
  return (
    <>
      <JsonLd schema={generateOrganizationSchema()} />
      {/* Your existing content */}
    </>
  );
}
```

### Step 3: Add to Other Pages
Apply same pattern to:
- `src/pages/shop/listing.jsx`
- `src/pages/shop/services.jsx`
- `src/pages/shop/about.jsx`
- `src/pages/shop/contact.jsx`

### Step 4: Dynamic Product Pages
```javascript
export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState();

  useEffect(() => {
    fetchProduct(productId).then(setProduct);
  }, [productId]);

  product && useSEO({
    title: `${product.name} - SHREE MARUTI TRADERS`,
    description: product.description,
    ogImage: product.image,
    canonical: `https://shreemarutitraders.com/product/${productId}`,
  });

  return (
    <>
      {product && <JsonLd schema={generateProductSchema(product)} />}
      {/* Product content */}
    </>
  );
}
```

## 🧪 Testing & Validation

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Check Core Web Vitals

2. **Google Search Console**
   - https://search.google.com/search-console/
   - Submit sitemap and verify domain

3. **Schema.org Validator**
   - https://validator.schema.org/
   - Validate JSON-LD markup

4. **Open Graph Debugger**
   - https://developers.facebook.com/tools/debug/
   - Test social sharing preview

5. **Chrome DevTools - Lighthouse**
   - Audit > SEO
   - Check for common issues

## 📊 Key SEO Metrics to Track

- **Click-Through Rate (CTR)** - Monitor in Google Search Console
- **Core Web Vitals** - LCP, FID, CLS in PageSpeed Insights
- **Indexing Status** - Check in Google Search Console
- **Keyword Rankings** - Track in Google Search Console

## 📝 SEO Configuration Fields Explained

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Page title (50-60 chars) | "Automation Parts - SHREE MARUTI" |
| `description` | Meta description (150-160 chars) | "Buy quality industrial automation..." |
| `keywords` | Relevant search terms | "automation, parts, control, equipment" |
| `ogTitle` | Social media title | "Quality Automation Solutions" |
| `ogImage` | Social sharing image | Image URL for OG tag |
| `canonical` | Preferred URL version | Full URL to prevent duplicates |

## 🔗 Useful Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org Documentation](https://schema.org/)
- [Web Vitals Guide](https://web.dev/vitals/)

## ✅ Checklist Before Launch

- [ ] Updated all company details in `seo.js`
- [ ] Added `useSEO()` to homepage
- [ ] Added `useSEO()` to all main pages
- [ ] Added JSON-LD structured data
- [ ] Updated `robots.txt` URLs
- [ ] Added dynamic URLs to `sitemap.xml`
- [ ] Tested with Google PageSpeed Insights
- [ ] Verified structured data in validator
- [ ] Submitted sitemap to Google Search Console
- [ ] Added domain to Google Search Console

---

For questions or updates, refer to `src/lib/SEO_IMPLEMENTATION_GUIDE.js`
