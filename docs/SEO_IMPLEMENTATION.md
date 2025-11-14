# SEO Implementation Guide

This document describes the SEO metadata and structured data implementation for the Ramen Bae e-commerce site.

## Overview

The SEO implementation includes:
- Meta tags for all pages (title, description, Open Graph, Twitter Cards)
- Structured data (JSON-LD) for products, organization, website, FAQs, and breadcrumbs
- Dynamic sitemap generation
- Robots.txt configuration

## Files Structure

```
src/
├── lib/
│   ├── seo.ts                    # SEO metadata utilities
│   └── structured-data.ts        # Structured data generators
├── app/
│   ├── layout.tsx                # Root layout with organization schema
│   ├── page.tsx                  # Homepage metadata
│   ├── sitemap.ts                # Dynamic sitemap generator
│   ├── robots.ts                 # Robots.txt configuration
│   ├── about/page.tsx            # About page metadata
│   ├── faq/page.tsx              # FAQ page with FAQ schema
│   ├── contact/layout.tsx        # Contact page metadata
│   └── products/
│       ├── layout.tsx            # Products listing metadata
│       └── [slug]/
│           └── metadata.ts       # Product detail metadata helper
└── components/
    └── product/
        └── ProductDetailLayout.tsx # Product schema & breadcrumbs
```

## Meta Tags Implementation

### Site Configuration

The `src/lib/seo.ts` file contains the site configuration and metadata generator:

```typescript
export const siteConfig = {
  name: 'Ramen Bae',
  description: 'Enhance your noods with the first ever dried ramen toppings...',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ramenbae.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/ramenbae',
    instagram: 'https://instagram.com/ramenbae',
  },
}
```

### Metadata Generator

The `generateMetadata()` function creates consistent metadata across all pages:

- **Title**: Automatically appends site name
- **Description**: Falls back to site description
- **Open Graph**: Includes title, description, image, and URL
- **Twitter Cards**: Summary large image format
- **Robots**: Configurable indexing rules
- **Keywords**: SEO-relevant keywords for ramen products

### Page-Specific Metadata

Each page has customized metadata:

- **Homepage**: Focus on brand and main value proposition
- **Products Listing**: Category-specific descriptions
- **Product Details**: Dynamic metadata based on product data
- **About**: Brand story and mission
- **FAQ**: Common questions focus
- **Contact**: Customer service emphasis

## Structured Data (JSON-LD)

### Organization Schema

Added to root layout (`src/app/layout.tsx`):
- Organization name and URL
- Logo and description
- Social media profiles
- Contact information

### Website Schema

Added to root layout with search action:
- Site name and description
- Search functionality endpoint

### Product Schema

Added to product detail pages (`src/components/product/ProductDetailLayout.tsx`):
- Product name, description, and images
- Price and availability
- Brand information
- Aggregate ratings (when reviews exist)

### Breadcrumb Schema

Added to product detail pages:
- Navigation path: Home → Products → Product Name
- Helps search engines understand site structure

### FAQ Schema

Added to FAQ page (`src/app/faq/page.tsx`):
- All questions and answers
- Improves rich snippet eligibility

### Product List Schema

Available for category pages (can be added to products listing):
- List of products in a category
- Product names and URLs

## Sitemap Generation

The `src/app/sitemap.ts` file dynamically generates a sitemap including:

### Static Pages
- Homepage (priority: 1.0, daily updates)
- Products listing (priority: 0.9, daily updates)
- About (priority: 0.7, monthly updates)
- FAQ (priority: 0.7, monthly updates)
- Contact (priority: 0.6, monthly updates)

### Dynamic Pages
- Category pages (priority: 0.8, daily updates)
- Product pages (priority: 0.8, weekly updates)
  - Uses actual product `updated_at` timestamps
  - Automatically includes all products from database

### Access
The sitemap is available at: `/sitemap.xml`

## Robots.txt

The `src/app/robots.ts` file configures crawler access:

### Allowed
- All pages by default (`/`)

### Disallowed
- API routes (`/api/`)
- Admin pages (`/admin/`)
- Next.js internals (`/_next/`)

### Sitemap Reference
Points crawlers to `/sitemap.xml`

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://ramenbae.com
```

For local development:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing SEO Implementation

### 1. Meta Tags
Use browser dev tools or extensions:
- [Meta SEO Inspector](https://chrome.google.com/webstore/detail/meta-seo-inspector)
- View page source and check `<head>` section

### 2. Structured Data
Test with Google's tools:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### 3. Sitemap
- Visit `/sitemap.xml` in browser
- Verify all pages are included
- Check timestamps are correct

### 4. Robots.txt
- Visit `/robots.txt` in browser
- Verify rules are correct

### 5. Open Graph Preview
Test social sharing:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Best Practices

### Meta Descriptions
- Keep between 150-160 characters
- Include primary keywords naturally
- Make them compelling for click-through

### Titles
- Keep under 60 characters
- Include brand name
- Front-load important keywords

### Images
- Use descriptive alt text
- Optimize file sizes
- Use appropriate dimensions (1200x630 for OG images)

### Structured Data
- Keep data accurate and up-to-date
- Don't mark up content not visible to users
- Test regularly with validation tools

### Sitemap
- Update when adding new pages
- Keep under 50,000 URLs per sitemap
- Use sitemap index if needed for large sites

## Future Enhancements

### Potential Additions
1. **Article Schema**: For blog posts (if blog is added)
2. **Review Schema**: Individual review markup
3. **Video Schema**: For product videos
4. **Local Business Schema**: If physical location is added
5. **Offer Schema**: For special promotions
6. **Multilingual Support**: hreflang tags for international versions

### Performance Optimizations
1. **Prerender**: Consider prerendering for better SEO
2. **Image Optimization**: Ensure all images have proper alt text
3. **Core Web Vitals**: Monitor and optimize page speed
4. **Mobile Optimization**: Ensure mobile-friendly design

## Monitoring

### Tools to Use
1. **Google Search Console**: Monitor indexing and search performance
2. **Google Analytics**: Track organic traffic
3. **Bing Webmaster Tools**: Monitor Bing indexing
4. **Ahrefs/SEMrush**: Track rankings and backlinks

### Key Metrics
- Organic traffic
- Click-through rate (CTR)
- Average position in search results
- Indexed pages count
- Core Web Vitals scores

## Troubleshooting

### Pages Not Indexed
1. Check robots.txt isn't blocking
2. Verify sitemap is submitted to Search Console
3. Check for `noindex` meta tags
4. Ensure pages are linked from other pages

### Structured Data Errors
1. Validate with Google's Rich Results Test
2. Check for required fields
3. Ensure data types are correct
4. Verify URLs are absolute, not relative

### Sitemap Issues
1. Verify sitemap is accessible at `/sitemap.xml`
2. Check for XML syntax errors
3. Ensure all URLs are absolute
4. Verify timestamps are valid ISO 8601 format

## References

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
