import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  schema?: Record<string, any>;
}

/** Create (if missing) and set a meta tag looked up by attrName="attrValue" */
function setMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function SEO({ title, description, image, schema }: SEOProps) {
  useEffect(() => {
    // Set dynamic document title
    document.title = title;

    // Standard description
    setMeta('name', 'description', description);

    // Open Graph (Facebook, WhatsApp, LinkedIn, iMessage previews)
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Albatross Goods India');
    setMeta('property', 'og:url', window.location.href);

    // Twitter Card
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    // Only set image tags when a real image is available — a broken/missing
    // og:image often renders worse in link previews than no image at all.
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    } else {
      if (ogImageTag) ogImageTag.remove();
      if (twitterImageTag) twitterImageTag.remove();
    }

    // Manage JSON-LD structured schema script
    let scriptTag = document.querySelector('script[id="ld-json-schema"]');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('id', 'ld-json-schema');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup schema script on page unmount
      const existing = document.querySelector('script[id="ld-json-schema"]');
      if (existing) existing.remove();
    };
  }, [title, description, image, schema]);

  return null;
}
