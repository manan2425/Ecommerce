/**
 * JSON-LD Structured Data for SEO
 * Generates structured data for Google Rich Snippets
 */

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'LocalBusiness',
    'name': 'SHREE MARUTI TRADERS',
    'image': 'https://shreemarutitraders.com/company_logo.png',
    'description': 'Industrial Automation & Control Solutions Provider',
    'url': 'https://shreemarutitraders.com',
    'telephone': '+91-XXXXXXXXXX', // Update with actual phone
    'email': 'contact@shreemarutitraders.com', // Update with actual email
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'GIDC, V.U. Nagar',
      'addressLocality': 'Anand',
      'addressRegion': 'Gujarat',
      'postalCode': 'XXXXX', // Update with actual postal code
      'addressCountry': 'IN'
    },
    'priceRange': '$$',
    'sameAs': [
      'https://www.facebook.com/shreemarutitraders', // Update with actual URLs
      'https://www.linkedin.com/company/shreemarutitraders',
      'https://www.instagram.com/shreemarutitraders'
    ]
  };
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': item.url
    }))
  };
};

export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'SHREE MARUTI TRADERS'
    },
    'offers': {
      '@type': 'Offer',
      'url': product.url,
      'priceCurrency': 'INR',
      'price': product.price,
      'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    'aggregateRating': product.rating ? {
      '@type': 'AggregateRating',
      'ratingValue': product.rating.value,
      'reviewCount': product.rating.count
    } : undefined
  };
};

/**
 * Insert JSON-LD script into document head
 * @param {object} schema - Schema object
 */
export const insertJsonLd = (schema) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
};

/**
 * Component to render JSON-LD in React
 * Usage: <JsonLd schema={organizationSchema} />
 */
export const JsonLd = ({ schema }) => {
  if (!schema) return null;
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
