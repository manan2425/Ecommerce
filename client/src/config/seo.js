// SEO configurations for different pages
export const SEO_CONFIG = {
  baseURL: 'https://shreemarutitraders.com',
  companyName: 'SHREE MARUTI TRADERS',
  companyDescription: 'Industrial Automation & Control Solutions',
  defaultImage: 'https://shreemarutitraders.com/company_logo.png',
  
  home: {
    title: 'SHREE MARUTI TRADERS - Industrial Automation & Control Solutions',
    description: 'Premium industrial automation parts, control solutions, and services in Anand, Gujarat. Quality products for automation equipment.',
    keywords: 'industrial automation, control solutions, parts distributor, automation equipment, Anand, Gujarat, India',
    ogTitle: 'SHREE MARUTI TRADERS - Quality Automation Solutions',
    ogImage: 'https://shreemarutitraders.com/company_logo.png',
    canonical: 'https://shreemarutitraders.com/',
  },

  shop: {
    title: 'Shop - SHREE MARUTI TRADERS',
    description: 'Browse our wide selection of industrial automation parts and control equipment.',
    keywords: 'buy automation parts, industrial equipment, control solutions, automation products',
    canonical: 'https://shreemarutitraders.com/shop',
  },

  services: {
    title: 'Services - SHREE MARUTI TRADERS',
    description: 'Professional automation services and technical support for industrial solutions.',
    keywords: 'automation services, technical support, installation, maintenance',
    canonical: 'https://shreemarutitraders.com/services',
  },

  about: {
    title: 'About Us - SHREE MARUTIL TRADERS',
    description: 'Learn about SHREE MARUTI TRADERS, your trusted partner in industrial automation since our establishment.',
    keywords: 'about us, company history, automation services, GIDC Anand',
    canonical: 'https://shreemarutitraders.com/about',
  },

  contact: {
    title: 'Contact Us - SHREE MARUTI TRADERS',
    description: 'Get in touch with SHREE MARUTI TRADERS. Located in GIDC, V.U. Nagar, Anand, Gujarat.',
    keywords: 'contact us, customer service, automation support, GIDC Anand',
    canonical: 'https://shreemarutitraders.com/contact',
  },
};

/**
 * Merge specific page config with defaults
 * @param {string} page - Page key from SEO_CONFIG
 * @param {object} overrides - Custom overrides
 * @returns {object} Complete SEO config
 */
export const getSEOConfig = (page, overrides = {}) => {
  const pageConfig = SEO_CONFIG[page] || {};
  
  return {
    title: pageConfig.title || SEO_CONFIG.home.title,
    description: pageConfig.description || SEO_CONFIG.home.description,
    keywords: pageConfig.keywords || '',
    ogTitle: pageConfig.ogTitle || pageConfig.title,
    ogDescription: pageConfig.description,
    ogImage: pageConfig.ogImage || SEO_CONFIG.defaultImage,
    canonical: pageConfig.canonical,
    type: 'website',
    ...overrides,
  };
};
