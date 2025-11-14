import { Metadata } from 'next'

export const siteConfig = {
  name: 'Ramen Bae',
  description: 'Enhance your noods with the first ever dried ramen toppings. Premium quality, small batch, whole ingredients.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ramenbae.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/ramenbae',
    instagram: 'https://instagram.com/ramenbae',
  },
}

export function generateMetadata({
  title,
  description,
  image,
  path = '',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const url = `${siteConfig.url}${path}`

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      'ramen toppings',
      'dried ramen toppings',
      'ramen ingredients',
      'noodle toppings',
      'japanese food',
      'ramen accessories',
      'instant ramen',
      'ramen seasoning',
    ],
    authors: [{ name: 'Ramen Bae' }],
    creator: 'Ramen Bae',
    publisher: 'Ramen Bae',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@ramenbae',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
