
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "AI Image Transformation | Turn Photos into Superheroes & Professional Product Images",
  description = "Transform kids into superheroes, enhance product photos for e-commerce, and create stunning visual content with our AI-powered image transformation platform. Free trial available.",
  keywords = "AI image transformation, photo editing, superhero transformation, product photography, kids photo editor, e-commerce images, cartoon transformation",
  ogImage = "https://imagerefresh.com/images/Cover photo.png",
  canonical
}) => {
  const [location] = useLocation();

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', `https://imagerefresh.com${location}`, true);

    // Update Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', ogImage, true);
    updateMetaTag('twitter:url', `https://imagerefresh.com${location}`, true);

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || `https://imagerefresh.com${location}`);

    // Add structured data for organization
    let structuredDataScript = document.querySelector('#structured-data-org');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      structuredDataScript.setAttribute('id', 'structured-data-org');
      document.head.appendChild(structuredDataScript);
    }
    
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Image Refresh",
      "url": "https://imagerefresh.com",
      "logo": "https://imagerefresh.com/favicon.png",
      "description": "AI-powered image transformation platform for personal and commercial use",
      "sameAs": [
        "https://imagerefresh.com"
      ]
    };
    
    structuredDataScript.textContent = JSON.stringify(organizationData);

  }, [title, description, keywords, ogImage, canonical, location]);

  return null;
};

export default SEO;
