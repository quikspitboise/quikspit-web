import type { Metadata } from 'next'
import { publicCategories, categoryFromPriceCents } from './catalog'
import { readTextList } from './fields'
import { pagePath, type ContentSnapshot, type PageContent } from './types'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quikspitboise.com'

/** Site-wide defaults; pages override title, description, and social fields. */
export function buildSiteMetadata(content: ContentSnapshot): Metadata {
  const { business, metadata } = content.site
  const image = metadata.socialImageUrl
  const index = !metadata.noIndex

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: metadata.title,
      template: `%s | ${business.name}`,
    },
    description: metadata.description,
    keywords: readTextList(content.site.copy.seo as Record<string, unknown> | undefined, 'keywords'),
    authors: [{ name: business.name }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: business.name,
      title: metadata.socialTitle || metadata.title,
      description: metadata.socialDescription || metadata.description,
      ...(image ? { images: [{ url: image, alt: business.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.socialTitle || metadata.title,
      description: metadata.socialDescription || metadata.description,
      ...(image ? { images: [image] } : {}),
    },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: false,
      statusBarStyle: 'default',
      title: business.name,
    },
    formatDetection: {
      telephone: true,
    },
  }
}

export function buildPageMetadata(content: ContentSnapshot, slug: string, page: PageContent): Metadata {
  const { metadata } = page
  const path = pagePath(slug)
  const site = content.site.metadata
  // The home page is the site's front door, so it keeps the site-wide title
  // rather than "Home | Business".
  const title = slug === 'home' ? { absolute: site.title } : metadata.title
  const image = metadata.socialImageUrl || site.socialImageUrl
  const noIndex = metadata.noIndex || site.noIndex

  return {
    title,
    description: metadata.description,
    alternates: { canonical: path },
    openGraph: {
      title: metadata.socialTitle || (slug === 'home' ? site.title : metadata.title),
      description: metadata.socialDescription || metadata.description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/** schema.org LocalBusiness built from the same business facts and prices the site shows. */
export function buildLocalBusinessData(content: ContentSnapshot) {
  const { business, metadata, socialLinks } = content.site
  const { catalog } = content
  const image = metadata.socialImageUrl ? new URL(metadata.socialImageUrl, SITE_URL).toString() : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    ...(image ? { image } : {}),
    description: metadata.description,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: business.phone,
    email: business.email,
    areaServed: business.serviceArea,
    sameAs: socialLinks.map((link) => link.href).filter((href) => href.startsWith('https://')),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${business.name} services`,
      itemListElement: publicCategories(catalog).map((category) => {
        const fromCents = categoryFromPriceCents(catalog, category.id)
        return {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: category.label,
            description: category.blurb,
          },
          ...(fromCents !== null
            ? {
                priceSpecification: {
                  '@type': 'PriceSpecification',
                  minPrice: (fromCents / 100).toFixed(2),
                  priceCurrency: catalog.currency,
                },
              }
            : {}),
        }
      }),
    },
  }
}
