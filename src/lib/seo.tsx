import * as React from 'react';
import { usePathname } from './router';

export const CANONICAL_ORIGIN = 'https://makeqrr.com';

export interface RouteSEOConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
  robots: string;
  ogType: 'website' | 'article';
  breadcrumbName: string;
}

export const ROUTE_SEO_MAP: Record<string, RouteSEOConfig> = {
  '/': {
    path: '/',
    title: 'Free Custom QR Code Generator – Create & Design QR Codes Online | makeqrr',
    description:
      'Create free custom QR codes online with beautiful designs, colors, patterns, logos and 50+ templates. Generate and download QR codes instantly without signing up.',
    keywords:
      'Free QR Code Generator, Custom QR Code Generator, QR Code Maker, Create QR Code Online, QR Code Generator Free, Customizable QR Code Generator, QR Code Designer, QR Code Generator Without Login, Custom QR Code with Logo, Download QR Code PNG, Download QR Code SVG, makeqrr',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Home'
  },
  '/create': {
    path: '/create',
    title: 'Create Your Custom QR Code Online – Free QR Code Designer & Maker | makeqrr',
    description:
      'Generate custom QR codes for URLs, Wi-Fi, WhatsApp with country codes, vCard contacts, Google Maps locations, email, phone and SMS. Customize colors, logos and download PNG or SVG.',
    keywords:
      'Create QR Code Online, Custom QR Code Generator, WiFi QR Code Generator, WhatsApp QR Code Generator, URL QR Code Generator, vCard QR Code Generator, Contact QR Code Generator, Location QR Code Generator, Google Maps QR Code Generator, Custom QR Code with Logo, QR Code with Image, QR Code with Emoji, Download QR Code SVG, Download QR Code PNG, makeqrr',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Create QR Code'
  },
  '/templates': {
    path: '/templates',
    title: '50+ Free QR Code Templates – Custom Business, Menu, Wi-Fi & vCard Designs | makeqrr',
    description:
      'Explore 50+ ready-to-use QR code templates for business cards, restaurant menus, Wi-Fi access, social media, events and payments. Apply any design in one click for free.',
    keywords:
      'QR Code Templates, Custom QR Code Designs, Restaurant Menu QR Code Template, WiFi QR Code Template, Business Card vCard QR Template, Customizable QR Code Generator, Free QR Code Maker, makeqrr templates',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'QR Code Templates'
  },
  '/about': {
    path: '/about',
    title: 'About makeqrr – Private, Client-Side Free QR Code Generator',
    description:
      'Learn how makeqrr generates permanent, high-contrast QR codes 100% locally in your browser with zero sign-up, no tracking and instant vector SVG and PNG exports.',
    keywords:
      'About makeqrr, makeqrr, QR Code Generator Without Login, Private QR Code Maker, Permanent Static QR Codes, Browser-Based QR Generator',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'About'
  },
  '/help': {
    path: '/help',
    title: 'QR Code Help, Guides & Frequently Asked Questions (FAQ) | makeqrr',
    description:
      'Find answers and step-by-step guides on creating custom QR codes, adding center logos safely, formatting WhatsApp country codes, scanning QR codes and printing vector SVGs.',
    keywords:
      'QR Code Help, QR Code FAQ, How to Create a QR Code, How to Add Logo to QR Code, How to Scan QR Codes, Print QR Code Guide, WhatsApp QR Code Help, makeqrr help',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Help & FAQ'
  },
  '/privacy': {
    path: '/privacy',
    title: 'Privacy Policy – 100% Local Browser QR Code Generation | makeqrr',
    description:
      'Read the makeqrr Privacy Policy. All QR codes, Wi-Fi credentials, vCard contacts and uploaded logos are processed locally in your browser with zero server storage.',
    keywords:
      'makeqrr Privacy Policy, Private QR Code Generator, No Tracking QR Maker, Client-Side QR Code Privacy',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Privacy Policy'
  },
  '/terms': {
    path: '/terms',
    title: 'Terms of Service – Free Personal & Commercial QR Code Usage | makeqrr',
    description:
      'Review the Terms of Service for makeqrr. Create, download and print custom QR codes free for personal and commercial projects with no watermarks or scan limits.',
    keywords:
      'makeqrr Terms of Service, Commercial QR Code License, Free QR Code Generator Terms',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Terms of Service'
  },
  '/sponsor': {
    path: '/sponsor',
    title: 'Become a Sponsor – Support Free & Independent QR Tools | makeqrr',
    description:
      'Support makeqrr to help keep custom QR code creation, 50+ designer templates and high-resolution PNG and SVG downloads 100% free and private for everyone.',
    keywords:
      'Sponsor makeqrr, Support Open Web Tools, Brand Collaboration makeqrr',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType: 'website',
    breadcrumbName: 'Become a Sponsor'
  }
};

export const NOT_FOUND_SEO: RouteSEOConfig = {
  path: '/404',
  title: '404 Page Not Found | makeqrr',
  description:
    'The page you requested could not be found. Return to makeqrr to create free custom QR codes online.',
  keywords: 'makeqrr, Free QR Code Generator',
  robots: 'noindex, nofollow',
  ogType: 'website',
  breadcrumbName: 'Page Not Found'
};

export function normalizeCanonicalPath(rawPathname: string): string {
  if (!rawPathname || rawPathname === '/' || rawPathname === '/index.html') return '/';
  const cleaned = rawPathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
  if (!cleaned || cleaned === '/index.html') return '/';
  if (cleaned === '/faq') return '/help';
  if (cleaned === '/template') return '/templates';
  return cleaned;
}

export function getCanonicalBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin.startsWith('http://') || origin.startsWith('https://')) {
      return origin.replace(/\/+$/, '');
    }
  }
  return CANONICAL_ORIGIN;
}

function upsertMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function buildStructuredDataGraph(
  normalizedPath: string,
  seoConfig: RouteSEOConfig,
  baseUrl: string,
  isNotFound: boolean
) {
  if (isNotFound) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoConfig.title,
      description: seoConfig.description,
      url: `${baseUrl}${normalizedPath}`
    };
  }

  const canonicalUrl =
    normalizedPath === '/' ? `${baseUrl}/` : `${baseUrl}${normalizedPath}`;
  const logoUrl = `${baseUrl}/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png`;
  const ogImageUrl = logoUrl;

  const brandSchema = {
    '@type': 'Brand',
    '@id': `${baseUrl}/#brand`,
    name: 'makeqrr',
    url: `${baseUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 1254,
      height: 1254
    },
    description:
      'Free, privacy-first online QR code generator and customization studio for creating scannable QR codes with custom patterns, colors, frames, and logos.'
  };

  const websiteSchema = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: 'makeqrr',
    publisher: {
      '@id': `${baseUrl}/#brand`
    },
    inLanguage: 'en'
  };

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${baseUrl}/`
    }
  ];

  if (normalizedPath !== '/') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: seoConfig.breadcrumbName,
      item: canonicalUrl
    });
  }

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbItems
  };

  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: seoConfig.title,
    description: seoConfig.description,
    isPartOf: {
      '@id': `${baseUrl}/#website`
    },
    about: {
      '@id': `${baseUrl}/#brand`
    },
    breadcrumb: {
      '@id': `${canonicalUrl}#breadcrumb`
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImageUrl,
      width: 1254,
      height: 1254
    },
    inLanguage: 'en'
  };

  const graph: Record<string, unknown>[] = [
    brandSchema,
    websiteSchema,
    breadcrumbSchema,
    webPageSchema
  ];

  if (normalizedPath === '/' || normalizedPath === '/create') {
    graph.push({
      '@type': ['WebApplication', 'SoftwareApplication'],
      '@id': `${baseUrl}/#webapp`,
      name: 'makeqrr',
      url: `${baseUrl}/create`,
      image: ogImageUrl,
      description:
        'Create free custom QR codes online with custom dot patterns, corner eyes, color gradients, frames, center logos, built-in icons, emojis, and 50+ templates. Instant PNG, JPG, and vector SVG download without login.',
      applicationCategory: 'DesignApplication',
      applicationSubCategory: 'QR Code Generator',
      operatingSystem: 'All',
      browserRequirements: 'Requires HTML5 Canvas and JavaScript',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'Free custom QR code generator without login',
        'Website URL, Wi-Fi, WhatsApp with country code, vCard Contact, Email, Phone, SMS, Google Maps Location, Event, and Text QR codes',
        'Custom QR code with center logo, uploaded image, built-in icon, or emoji',
        '50+ scan-safe QR code templates',
        'High-resolution PNG, JPG, and print-ready vector SVG downloads',
        'Built-in camera and image QR code scanner'
      ]
    });

    graph.push({
      '@type': 'HowTo',
      '@id': `${canonicalUrl}#howto`,
      name: 'How to Create a Custom QR Code Online for Free',
      description:
        'Follow these four steps to create, customize, test, and download a permanent custom QR code in your browser.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Select Your QR Code Type and Enter Information',
          text: 'Choose a QR code type such as Website URL, Wi-Fi network, WhatsApp with country code, vCard contact, Google Maps location, email, phone, or plain text, and enter your details.'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Customize Colors, Patterns, Frames, and Center Logo',
          text: 'Pick a ready-made template or customize dot patterns, corner eye shapes, solid or gradient colors, call-to-action frames, and upload a center brand logo, icon, or emoji.'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Verify Contrast and Test Scan',
          text: 'Check the live contrast and scan-safety indicator and test your QR code with your smartphone camera or the built-in QR scanner.'
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Download High-Resolution PNG or Vector SVG',
          text: 'Download your finished QR code as a crisp PNG or JPG for digital screens and social media, or as a scalable SVG vector file for professional printing.'
        }
      ]
    });
  }

  if (normalizedPath === '/help') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faqpage`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is makeqrr completely free and do QR codes ever expire?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. makeqrr is 100% free with no account or sign-up required. All generated QR codes are static QR codes that encode your information directly into the pattern, meaning they never expire and have unlimited scans.'
          }
        },
        {
          '@type': 'Question',
          name: 'How do I create a custom QR code with my own logo or emoji?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open the Create QR studio, select the Logo tab, and upload a PNG, JPG, or SVG logo, or choose a built-in icon or emoji. Use the size slider or plus/minus controls to adjust the center logo size; the studio automatically clamps the maximum size and upgrades error correction so your QR code remains easy to scan.'
          }
        },
        {
          '@type': 'Question',
          name: 'How do I create a WhatsApp QR code with a country code?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Select the WhatsApp QR type in the generator, choose your mandatory country dialing code (such as India +91 or United States +1) from the searchable country selector, enter your phone number and optional pre-filled message, and download your wa.me QR code.'
          }
        },
        {
          '@type': 'Question',
          name: 'Should I download my QR code as PNG or SVG?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Download PNG for websites, social media posts, emails, and digital screens. Download SVG (Scalable Vector Graphics) for business cards, restaurant menus, flyers, product packaging, signage, and any professional print job because SVG scales to any size without losing sharpness.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is my Wi-Fi password or contact information sent to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. makeqrr runs 100% in your web browser. Your Wi-Fi credentials, vCard contacts, phone numbers, URLs, and uploaded logos never leave your device.'
          }
        }
      ]
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

/**
 * Dynamically synchronizes document title, meta description, keywords, robots directives,
 * self-referencing canonical URL, Open Graph tags, Twitter/X Cards, and JSON-LD structured data
 * on every route transition.
 */
export const SEOHead: React.FC = () => {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const normalizedPath = normalizeCanonicalPath(pathname);
    const matchedConfig = ROUTE_SEO_MAP[normalizedPath];
    const isNotFound = !matchedConfig;
    const seoConfig = matchedConfig || NOT_FOUND_SEO;

    const baseUrl = getCanonicalBaseUrl();
    const canonicalUrl =
      normalizedPath === '/' ? `${baseUrl}/` : `${baseUrl}${normalizedPath}`;
    const ogImageUrl = `${baseUrl}/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png`;

    // 1. Document Language & Title
    document.documentElement.lang = 'en';
    document.title = seoConfig.title;

    // 2. Standard SEO Meta Tags
    upsertMetaTag('name', 'description', seoConfig.description);
    upsertMetaTag('name', 'keywords', seoConfig.keywords);
    upsertMetaTag('name', 'robots', seoConfig.robots);
    upsertMetaTag('name', 'googlebot', seoConfig.robots);
    upsertMetaTag('name', 'author', 'makeqrr');
    upsertMetaTag('name', 'application-name', 'makeqrr');

    // 3. Canonical URL (Self-referencing for indexable routes)
    upsertCanonicalLink(isNotFound ? `${baseUrl}/` : canonicalUrl);

    // 4. Open Graph Metadata
    upsertMetaTag('property', 'og:type', seoConfig.ogType);
    upsertMetaTag('property', 'og:site_name', 'makeqrr');
    upsertMetaTag('property', 'og:locale', 'en_US');
    upsertMetaTag('property', 'og:title', seoConfig.title);
    upsertMetaTag('property', 'og:description', seoConfig.description);
    upsertMetaTag('property', 'og:url', isNotFound ? `${baseUrl}/` : canonicalUrl);
    upsertMetaTag('property', 'og:image', ogImageUrl);
    upsertMetaTag(
      'property',
      'og:image:alt',
      'makeqrr – Free Custom QR Code Generator & Designer'
    );
    upsertMetaTag('property', 'og:image:width', '1254');
    upsertMetaTag('property', 'og:image:height', '1254');

    // 5. Twitter / X Card Metadata
    upsertMetaTag('name', 'twitter:card', 'summary');
    upsertMetaTag('name', 'twitter:title', seoConfig.title);
    upsertMetaTag('name', 'twitter:description', seoConfig.description);
    upsertMetaTag('name', 'twitter:image', ogImageUrl);
    upsertMetaTag(
      'name',
      'twitter:image:alt',
      'makeqrr – Free Custom QR Code Generator & Designer'
    );

    // 6. Dynamic Schema.org JSON-LD Structured Data
    const structuredData = buildStructuredDataGraph(
      normalizedPath,
      seoConfig,
      baseUrl,
      isNotFound
    );
    let scriptEl = document.head.querySelector<HTMLScriptElement>(
      'script#dynamic-seo-jsonld[type="application/ld+json"]'
    );
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-seo-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(structuredData);
  }, [pathname]);

  return null;
};

