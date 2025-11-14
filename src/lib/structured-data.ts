import { Product } from '@/lib/supabase/types'
import { siteConfig } from './seo'

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: any
}

export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.instagram,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@ramenbae.com',
    },
  }
}

export function generateWebsiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProductSchema(product: Product & { review_stats?: any }): StructuredData {
  const availability = product.inventory > 0 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock'

  const reviewStats = product.review_stats
  const hasReviews = reviewStats && reviewStats.total_reviews > 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: (product.images as any[])?.map((img: any) => img.url) || [],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    },
    aggregateRating: hasReviews ? {
      '@type': 'AggregateRating',
      ratingValue: reviewStats.averageRating?.toFixed(1) || reviewStats.average_rating?.toFixed(1),
      reviewCount: reviewStats.totalReviews || reviewStats.total_reviews,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateProductListSchema(products: Product[], category?: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category ? `${category} Products` : 'All Products',
    description: category 
      ? `Browse our ${category.toLowerCase()} collection` 
      : 'Browse all our premium ramen toppings',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteConfig.url}/products/${product.slug}`,
      name: product.name,
    })),
  }
}

export function renderStructuredData(data: StructuredData | StructuredData[]): string {
  const dataArray = Array.isArray(data) ? data : [data]
  return dataArray.map(item => JSON.stringify(item)).join('\n')
}
