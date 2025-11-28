import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({ title, description, schema }) => {
  const location = useLocation();
  // Using location.hash because of HashRouter for canonical URL
  const canonicalUrl = `https://git-rover.vercel.app/${location.hash || '#/'}`;

  useEffect(() => {
    const defaultDescription = 'Explore GitHub repositories with AI-powered insights, file exploration, and a minimalist interface.';
    const currentDescription = description || defaultDescription;

    // Update Title
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title);

    // Update Meta Description
    document.querySelector('meta[name="description"]')?.setAttribute('content', currentDescription);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', currentDescription);
    document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', currentDescription);

    // Update Canonical URL
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="twitter:url"]')?.setAttribute('content', canonicalUrl);
    
    // Handle Structured Data (JSON-LD)
    let scriptTag = document.getElementById('json-ld-schema');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-schema';
        // FIX: Cast HTMLElement to HTMLScriptElement to access the 'type' property.
        (scriptTag as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema, null, 2);
    } else if (scriptTag) {
      // Remove schema if not provided for the current page
      scriptTag.remove();
    }
  }, [title, description, schema, canonicalUrl]);

  return null;
};

export default SEO;