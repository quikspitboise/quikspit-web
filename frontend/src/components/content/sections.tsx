import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { VideoHero } from '@/components/ui/video-hero'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { PageHeader } from '@/components/ui/page-header'
import { FaqList } from '@/components/ui/faq-list'
import { ReviewsSection } from '@/components/reviews-section'
import { PackagesTabs } from '@/components/packages-tabs'
import { CeramicInfoPopover } from '@/components/ceramic-info-popover'
import { ContactForm } from '@/components/contact-form'
import { OwnerImage } from '@/components/owner-image'
import { GalleryGrid } from '@/components/gallery-grid'
import { GalleryGridSkeleton } from '@/components/gallery-loading-shell'
import InstagramEmbed from '@/components/InstagramEmbedWithSkeleton'
import TikTokEmbed from '@/components/TikTokEmbedWithSkeleton'
import { BookingSection } from '@/components/content/booking-section'
import { readCopyFields, resolveContactCopy } from '@/components/content/visitor-copy'
import {
  ContentButton,
  JsonLd,
  Paragraphs,
  PriceRow,
  SECTION_SCROLL_MARGIN,
  SectionHeading,
} from '@/components/content/primitives'
import { fetchPublicGalleryItems } from '@/lib/server/gallery-api'
import { hasBookingDeposit } from '@/lib/booking-settings'
import {
  categoryFromPriceCents,
  defaultVehicleSize,
  formatCents,
  includedCorrection,
  publicAddons,
  publicCategories,
  publicCeramicServices,
  serviceFromPriceCents,
} from '@/lib/content/catalog'
import {
  fillTokens,
  readBool,
  readLink,
  readObjectList,
  readText,
  readTextList,
  siteCopy,
  type TokenValues,
} from '@/lib/content/fields'
import { toPreviewHref, type ContentSnapshot, type PageSection, type SectionType } from '@/lib/content/types'

export type RenderContext = {
  content: ContentSnapshot
  slug: string
  depositAmount: number
  tokens: TokenValues
  /** Draft preview: skip live quotes, which only price published content. */
  preview: boolean
  previewBase?: string
}

type SectionProps = { section: PageSection; ctx: RenderContext }

const container = 'container mx-auto px-5 sm:px-6 lg:px-8'
const linkClass =
  'inline-flex text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-400/40 hover:decoration-red-300 transition-colors'

function isHome(ctx: RenderContext) {
  return ctx.slug === 'home'
}

/** Standard band between inner-page sections. */
function Band({ section, children, className = 'py-16 lg:py-24' }: { section: PageSection; children: ReactNode; className?: string }) {
  return (
    <section id={section.id} className={`${SECTION_SCROLL_MARGIN} border-t border-white/[0.07] ${className}`}>
      {children}
    </section>
  )
}

function HeroSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const lines = readTextList(fields, 'lines')
  const body = fillTokens(readText(fields, 'body'), ctx.tokens)

  if (lines.length === 0) {
    const heading = readText(fields, 'heading') || ctx.content.pages[ctx.slug]?.title || ''
    return <PageHeader title={heading} lede={body || undefined} />
  }

  const facts = readObjectList(fields, 'facts')
    .map((fact) => ({ term: readText(fact, 'term'), detail: readText(fact, 'detail') }))
    .filter((fact) => fact.term && fact.detail)
  const primary = readLink(fields, 'primaryLink')
  const secondary = readLink(fields, 'secondaryLink')

  return (
    <VideoHero>
      <div id={section.id} className={`${container} w-full pb-10 lg:pb-14`}>
        <div>
          <AnimatedHeadline
            lines={lines}
            as="h1"
            className="text-[clamp(2.75rem,8.5vw,7rem)] text-white uppercase"
            delay={0.1}
          />
          {body && (
            <FadeHeadline delay={0.45} className="mt-6 max-w-xl text-lg sm:text-xl text-white/80 text-pretty">
              {body}
            </FadeHeadline>
          )}
          {(primary || secondary) && (
            <FadeHeadline as="div" delay={0.6} className="mt-8 flex flex-col sm:flex-row gap-3">
              <ContentButton previewBase={ctx.previewBase} link={primary} />
              <ContentButton previewBase={ctx.previewBase} link={secondary} variant="secondary" className="bg-black/30" />
            </FadeHeadline>
          )}
        </div>

        {facts.length > 0 && (
          <FadeHeadline as="div" delay={0.8} className="mt-12 lg:mt-16 border-t border-white/15 pt-5">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              {facts.map((fact, index) => (
                <div key={index}>
                  <dt className="text-sm text-white/55">{fact.term}</dt>
                  <dd className="text-white">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </FadeHeadline>
        )}
      </div>
    </VideoHero>
  )
}

function RichTextSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const heading = readText(fields, 'heading')
  const paragraphs = readTextList(fields, 'paragraphs').map((text) => fillTokens(text, ctx.tokens))
  const link = readLink(fields, 'link')

  return (
    <Band section={section}>
      <div className={`${container} grid gap-8 lg:grid-cols-12`}>
        {heading && <SectionHeading>{heading}</SectionHeading>}
        <div className={heading ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Paragraphs items={paragraphs} className="max-w-2xl space-y-5 text-lg text-neutral-300 leading-relaxed text-pretty" />
          {link && (
            <Link href={toPreviewHref(link.href, ctx.previewBase)} className={`mt-6 ${linkClass}`}>
              {link.label}
            </Link>
          )}
        </div>
      </div>
    </Band>
  )
}

function ServiceListSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const { catalog } = ctx.content
  const link = readLink(fields, 'link')
  const items = readObjectList(fields, 'items').map((item) => {
    const categoryId = readText(item, 'categoryId')
    const serviceId = readText(item, 'serviceId')
    const fromCents = categoryId
      ? categoryFromPriceCents(catalog, categoryId)
      : serviceId
        ? serviceFromPriceCents(catalog, serviceId, readBool(item, 'includeEligiblePackage'))
        : null
    return {
      name: readText(item, 'name'),
      description: fillTokens(readText(item, 'description'), ctx.tokens),
      href: readText(item, 'href') || '/pricing',
      fromCents,
      // An item tied to a disabled offering has nothing left to sell.
      available: (!categoryId && !serviceId) || fromCents !== null,
    }
  }).filter((item) => item.name && item.available)

  return (
    <section id={section.id} className={`${SECTION_SCROLL_MARGIN} py-20 lg:py-28 ${isHome(ctx) ? '' : 'border-t border-white/[0.07]'}`}>
      <div className={`${container} grid gap-10 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase">{readText(fields, 'heading')}</h2>
          {readText(fields, 'body') && (
            <p className="mt-5 max-w-sm text-neutral-400 text-pretty">{fillTokens(readText(fields, 'body'), ctx.tokens)}</p>
          )}
          {link && (
            <Link href={toPreviewHref(link.href, ctx.previewBase)} className={`mt-6 ${linkClass}`}>
              {link.label}
            </Link>
          )}
        </div>

        <ul className="lg:col-span-8 border-t border-white/10">
          {items.map((item, index) => (
            <li key={index} className="border-b border-white/10">
              <Link
                href={toPreviewHref(item.href, ctx.previewBase)}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 sm:py-7 transition-colors hover:bg-white/[0.02] -mx-3 px-3 rounded-md"
              >
                <span className="text-xl sm:text-2xl font-semibold text-white">{item.name}</span>
                {item.fromCents !== null ? (
                  <span className="text-right tabular text-neutral-400">
                    from{' '}
                    <span className="font-display text-2xl sm:text-3xl text-white group-hover:text-red-400 transition-colors">
                      {formatCents(item.fromCents)}
                    </span>
                  </span>
                ) : (
                  <span />
                )}
                <span className="col-span-2 sm:col-span-1 text-neutral-400 text-pretty">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ServicesSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const { catalog, site } = ctx.content
  const group = readText(fields, 'catalogGroup')
  const heading = readText(fields, 'heading')
  const body = fillTokens(readText(fields, 'body'), ctx.tokens)

  if (group === 'categories') {
    const note = fillTokens(readText(fields, 'priceNote'), ctx.tokens)
    return (
      <Band section={section}>
        <div className={container}>
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase mb-8">{heading}</h2>
          {body && <p className="-mt-4 mb-8 max-w-2xl text-neutral-400 text-pretty">{body}</p>}
          <PackagesTabs categories={publicCategories(catalog)} vehicleSizeLabel={defaultVehicleSize(catalog)?.label} />
          {note && <p className="text-neutral-500 text-sm mt-8">{note}</p>}
        </div>
      </Band>
    )
  }

  if (group === 'addons') {
    return (
      <Band section={section}>
        <div className={`${container} grid gap-8 lg:grid-cols-12`}>
          <SectionHeading aside={body || undefined}>{heading}</SectionHeading>
          <ul className="lg:col-span-8 border-t border-white/10">
            {publicAddons(catalog).map((addon) => (
              <PriceRow key={addon.id} name={addon.name} description={addon.description} price={`+${formatCents(addon.priceCents)}`} />
            ))}
          </ul>
        </div>
      </Band>
    )
  }

  if (group === 'ceramicServices') {
    return (
      <Band section={section}>
        <div className={`${container} grid gap-8 lg:grid-cols-12`}>
          <SectionHeading
            aside={
              <>
                {body && <p>{body}</p>}
                <div className="mt-5">
                  <CeramicInfoPopover
                    title={siteCopy(site, 'ceramicInfo.title')}
                    body={siteCopy(site, 'ceramicInfo.body')}
                  />
                </div>
              </>
            }
          >
            {heading}
          </SectionHeading>
          <ul className="lg:col-span-8 border-t border-white/10">
            {publicCeramicServices(catalog).map((service) => {
              const included = includedCorrection(catalog, service)
              return (
                <PriceRow key={service.id} name={service.name} description={service.description} price={`${formatCents(service.priceCents)}+`}>
                  {included && (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-600/10 px-3 py-1.5 text-sm text-red-200">
                      <svg className="h-4 w-4 shrink-0 text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                      Includes {included.name}, normally {formatCents(included.priceCents)}
                    </p>
                  )}
                  {service.note && <p className="mt-2 text-sm text-neutral-500">{service.note}</p>}
                </PriceRow>
              )
            })}
          </ul>
        </div>
      </Band>
    )
  }

  return <ServiceListSection section={section} ctx={ctx} />
}

function StepsSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const steps = readObjectList(fields, 'items')
    .map((item) => ({ title: readText(item, 'title'), body: fillTokens(readText(item, 'body'), ctx.tokens) }))
    .filter((step) => step.title)

  return (
    <section id={section.id} className={`${SECTION_SCROLL_MARGIN} py-20 lg:py-28 bg-[#0a0a0a] border-y border-white/[0.06]`}>
      <div className={container}>
        <h2 className="font-display text-4xl sm:text-5xl text-white uppercase max-w-2xl">{readText(fields, 'heading')}</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <li key={i} className="relative border-t-2 border-red-600 pt-6">
              <span className="font-display text-5xl text-white/15 tabular" aria-hidden="true">{i + 1}</span>
              <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-neutral-400 text-pretty">{step.body}</p>
            </li>
          ))}
        </ol>
        {readLink(fields, 'link') && (
          <div className="mt-12">
            <ContentButton previewBase={ctx.previewBase} link={readLink(fields, 'link')} size="md" />
          </div>
        )}
      </div>
    </section>
  )
}

function ReviewsContentSection({ section, ctx }: SectionProps) {
  const { site } = ctx.content
  const heading = readText(section.fields, 'heading')
  return (
    <section
      id={section.id}
      className={`${SECTION_SCROLL_MARGIN} ${isHome(ctx) ? 'py-20 lg:py-28' : 'border-t border-white/[0.07] py-16 lg:py-24'}`}
    >
      <ReviewsSection
        labels={{
          heading: heading || siteCopy(site, 'reviews.heading', 'Google reviews'),
          unavailable: siteCopy(site, 'reviews.unavailable', 'Reviews could not be loaded here.'),
          readLabel: siteCopy(site, 'reviews.readLabel', 'Read them on Google'),
          fallbackUrl: toPreviewHref(siteCopy(site, 'reviews.fallbackUrl'), ctx.previewBase),
          leaveLabel: siteCopy(site, 'reviews.leaveLabel', 'Leave a review'),
        }}
      />
    </section>
  )
}

function SocialSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const heading = readText(fields, 'heading')
  const body = readText(fields, 'body')
  const link = readLink(fields, 'link')

  return (
    <section
      id={section.id}
      className={`${SECTION_SCROLL_MARGIN} ${isHome(ctx) ? 'pb-20 lg:pb-28' : 'border-t border-white/[0.07] py-16 lg:py-24'}`}
    >
      <div className={container}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase">{heading}</h2>
            {body && <p className="mt-4 max-w-xl text-neutral-400">{body}</p>}
          </div>
          {link && (
            <Link href={toPreviewHref(link.href, ctx.previewBase)} className={linkClass}>
              {link.label}
            </Link>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <InstagramEmbed />
          <TikTokEmbed />
        </div>
      </div>
    </section>
  )
}

function CtaSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const { business } = ctx.content.site
  const heading = readText(fields, 'heading')
  const body = fillTokens(readText(fields, 'body'), ctx.tokens)
  const primary = readLink(fields, 'primaryLink')
  const secondary = readLink(fields, 'secondaryLink')
  const showPhone = readBool(fields, 'showPhone')
  const phoneHref = `tel:${business.phone}`

  // With two buttons the phone number stands on its own; with one it
  // becomes the second button.
  if (showPhone && secondary) {
    return (
      <section id={section.id} className={`${SECTION_SCROLL_MARGIN} border-t border-white/[0.06] bg-linear-to-b from-red-950/30 to-transparent`}>
        <div className={`${container} py-20 lg:py-28 grid gap-10 lg:grid-cols-2 lg:items-end`}>
          <div>
            <h2 className="font-display text-4xl sm:text-6xl text-white uppercase text-balance">{heading}</h2>
            {body && <p className="mt-5 max-w-lg text-lg text-neutral-400 text-pretty">{body}</p>}
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <a href={phoneHref} className="font-display text-4xl sm:text-5xl text-white tabular hover:text-red-400 transition-colors">
              {business.phoneDisplay}
            </a>
            <div className="flex flex-col sm:flex-row gap-3">
              <ContentButton previewBase={ctx.previewBase} link={primary} />
              <ContentButton previewBase={ctx.previewBase} link={secondary} variant="secondary" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  const second = secondary ?? (showPhone ? { label: `Call ${business.phoneDisplay}`, href: phoneHref } : null)
  return (
    <section id={section.id} className={`${SECTION_SCROLL_MARGIN} border-t border-white/[0.07] bg-linear-to-b from-red-950/30 to-transparent`}>
      <div className={`${container} py-16 lg:py-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between`}>
        <div>
          <h2 className="font-display text-3xl sm:text-5xl text-white uppercase text-balance">{heading}</h2>
          {body && <p className="mt-4 max-w-lg text-neutral-400 text-pretty">{body}</p>}
        </div>
        {(primary || second) && (
          <div className="flex flex-col sm:flex-row gap-3">
            <ContentButton previewBase={ctx.previewBase} link={primary} />
            <ContentButton previewBase={ctx.previewBase} link={second} variant="secondary" />
          </div>
        )}
      </div>
    </section>
  )
}

/** FAQ items with tokens filled, choosing the deposit variant when one applies. */
export function resolveFaqs(section: PageSection, ctx: Pick<RenderContext, 'tokens' | 'depositAmount'>) {
  const withDeposit = hasBookingDeposit(ctx.depositAmount)
  return readObjectList(section.fields, 'items')
    .map((item) => ({
      q: readText(item, 'q'),
      a: fillTokens((withDeposit && readText(item, 'depositAnswer')) || readText(item, 'a'), ctx.tokens),
    }))
    .filter((faq) => faq.q && faq.a)
}

function FaqSection({ section, ctx }: SectionProps) {
  const faqs = resolveFaqs(section, ctx)
  if (faqs.length === 0) return null

  return (
    <Band section={section}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }}
      />
      <div className={`${container} grid gap-8 lg:grid-cols-12`}>
        <SectionHeading>{readText(section.fields, 'heading')}</SectionHeading>
        <div className="lg:col-span-8">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </Band>
  )
}

async function GalleryContent({ fallbackMessage }: { fallbackMessage: string }) {
  const { items, source } = await fetchPublicGalleryItems()
  return (
    <>
      {source === 'fallback' && fallbackMessage && (
        <p className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
          {fallbackMessage}
        </p>
      )}
      <GalleryGrid items={items} />
    </>
  )
}

function GallerySection({ section }: SectionProps) {
  return (
    <Band section={section} className="py-12 lg:py-16">
      <div className={container}>
        <Suspense fallback={<GalleryGridSkeleton />}>
          <GalleryContent fallbackMessage={readText(section.fields, 'fallbackMessage')} />
        </Suspense>
      </div>
    </Band>
  )
}

function ContactSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const { business, socialLinks } = ctx.content.site
  const label = (key: string, fallback: string) => readText(fields, key) || fallback

  return (
    <Band section={section}>
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          <dl className="space-y-8">
            <div>
              <dt className="text-sm text-neutral-500">{label('phoneLabel', 'Phone')}</dt>
              <dd className="mt-1">
                <a href={`tel:${business.phone}`} className="font-display text-3xl sm:text-4xl text-white tabular transition-colors hover:text-red-400">
                  {business.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">{label('emailLabel', 'Email')}</dt>
              <dd className="mt-1">
                <a href={`mailto:${business.email}`} className="text-lg text-white underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-red-400 break-all">
                  {business.email}
                </a>
              </dd>
            </div>
            {business.hours && (
              <div>
                <dt className="text-sm text-neutral-500">{label('hoursLabel', 'Hours')}</dt>
                <dd className="mt-1 text-lg text-white">{business.hours}</dd>
              </div>
            )}
            {business.serviceArea && (
              <div>
                <dt className="text-sm text-neutral-500">{label('locationLabel', 'Location')}</dt>
                <dd className="mt-1 text-lg text-white">{business.serviceArea}</dd>
                {business.locationNote && <dd className="mt-1 text-sm text-neutral-500">{business.locationNote}</dd>}
              </div>
            )}
            {socialLinks.length > 0 && (
              <div>
                <dt className="text-sm text-neutral-500">{label('socialLabel', 'Elsewhere')}</dt>
                <dd className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.href}
                      href={toPreviewHref(social.href, ctx.previewBase)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1 text-white underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-red-400"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="panel p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">{label('formHeading', 'Send a message')}</h2>
            {readText(fields, 'formDescription') && (
              <p className="mt-2 mb-8 text-neutral-400 text-pretty">{readText(fields, 'formDescription')}</p>
            )}
            <ContactForm copy={resolveContactCopy(fields)} />
          </div>
        </div>
      </div>
    </Band>
  )
}

function BookingContentSection({ section, ctx }: SectionProps) {
  return (
    <Band section={section} className="py-10 lg:py-16">
      <div className={container}>
        <h2 className="sr-only">{readText(section.fields, 'heading') || 'Design your detail'}</h2>
        <BookingSection
          catalog={ctx.content.catalog}
          catalogRevisionId={ctx.content.catalogRevisionId}
          depositAmount={ctx.depositAmount}
          depositPolicy={fillTokens(readText(section.fields, 'depositPolicy'), ctx.tokens)}
          preview={ctx.preview}
          copy={readCopyFields(section.fields, 'copy')}
        />
      </div>
    </Band>
  )
}

function OwnerSection({ section, ctx }: SectionProps) {
  const { fields } = section
  const caption = readText(fields, 'caption')
  const approachHeading = readText(fields, 'approachHeading')
  const prose = 'mt-6 space-y-5 text-lg text-neutral-300 leading-relaxed text-pretty'

  return (
    <Band section={section}>
      <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start`}>
        <figure className="lg:col-span-5">
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900">
            <OwnerImage alt={readText(fields, 'imageAlt') || `${caption || 'Owner'}, ${ctx.content.site.business.name}`} />
          </div>
          {caption && <figcaption className="mt-3 text-sm text-neutral-500">{caption}</figcaption>}
        </figure>

        <div className="lg:col-span-7 max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl text-white uppercase">{readText(fields, 'heading')}</h2>
          <Paragraphs items={readTextList(fields, 'paragraphs')} className={prose} />
          {approachHeading && (
            <h2 className="mt-14 font-display text-3xl sm:text-4xl text-white uppercase">{approachHeading}</h2>
          )}
          <Paragraphs items={readTextList(fields, 'approachParagraphs')} className={prose} />
        </div>
      </div>
    </Band>
  )
}

const RENDERERS: Record<SectionType, (props: SectionProps) => ReactNode> = {
  hero: HeroSection,
  'rich-text': RichTextSection,
  services: ServicesSection,
  steps: StepsSection,
  reviews: ReviewsContentSection,
  social: SocialSection,
  cta: CtaSection,
  faq: FaqSection,
  gallery: GallerySection,
  contact: ContactSection,
  booking: BookingContentSection,
  owner: OwnerSection,
}

export function ContentSection({ section, ctx }: SectionProps) {
  const Renderer = RENDERERS[section.type]
  return Renderer ? <Renderer section={section} ctx={ctx} /> : null
}
