import { useEffect } from 'react';

export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title || 'SHREE MARUTI TRADERS - Industrial Automation & Control Solutions';

    // Remove and re-add meta tags to ensure they're updated
    const updateMetaTag = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        if (name.startsWith('og:')) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Core Meta Tags
    if (description) updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);

    // Open Graph Meta Tags
    if (ogTitle) updateMetaTag('og:title', ogTitle);
    if (ogDescription) updateMetaTag('og:description', ogDescription);
    if (ogImage) updateMetaTag('og:image', ogImage);
    updateMetaTag('og:type', type);

    // Update canonical URL
    if (canonical) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) {
        canonicalTag.setAttribute('href', canonical);
      } else {
        canonicalTag = document.createElement('link');
        canonicalTag.rel = 'canonical';
        canonicalTag.href = canonical;
        document.head.appendChild(canonicalTag);
      }
    }

    // Cleanup
    return () => {
      // Optionally restore defaults on unmount
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, type]);
};
