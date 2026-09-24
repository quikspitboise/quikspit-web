import Link from 'next/link'
import { VideoHero } from '@/components/ui/video-hero'
import { AnimatedHeadline, FadeHeadline } from '@/components/ui/animated-headline'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ReviewsSection } from '@/components/reviews-section'
import { HomeStructuredData } from '@/components/home-structured-data'
import { packageCategories, ceramicServices } from '@/components/booking/booking-data'
import InstagramEmbed from '@/components/InstagramEmbedWithSkeleton'
import TikTokEmbed from '@/components/TikTokEmbedWithSkeleton'

function fromPrice(categoryId: string) {
  const category = packageCategories.find((c) => c.id === categoryId)
  return category ? Math.min(...category.packages.map((p) => p.basePrice)) : 0
}

const services = [
  {
    name: 'Exterior and interior',
    description: 'Hand wash, wheels, glass, and trim, plus a full clean of the cabin.',
    from: fromPrice('combo'),
    href: '/pricing#packages',
  },
  {
    name: 'Interior only',
    description: 'Vacuum, shampoo, and wipe-down of every surface you touch.',
    from: fromPrice('interior'),
    href: '/pricing#packages',
  },
  {
    name: 'Exterior only',
    description: 'Wash, decontamination, and a coat of protection on the paint.',
    from: fromPrice('exterior'),
    href: '/pricing#packages',
  },
  {
    name: 'Ceramic coating',
    description: 'Graphene coating applied over a paint correction. Lasts five to seven years.',
    from: ceramicServices.find((s) => s.id === 'graphene-coating')?.price ?? 0,
    href: '/pricing#ceramic',
  },
]

const steps = [
  {
    title: 'Build your detail',
    body: 'Pick a package and any extras. The price updates as you go, then you choose a time.',
  },
  {
    title: 'Bring the car in',
    body: 'Your confirmation email has the garage address. Drop the car off at your time and we work on it indoors.',
  },
  {
    title: 'Pay when it’s done',
    body: 'Look the car over when you pick it up, then pay. Card, cash, and Venmo all work.',
  },
]

const heroFacts = [
  { term: 'Where', detail: 'A private garage in the Boise area' },
  { term: 'Address', detail: 'Sent once you book' },
  { term: 'Scheduling', detail: 'Same-day slots when open' },
]

export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <main id="main-content">
        <VideoHero>
          <div className="container mx-auto w-full px-5 sm:px-6 lg:px-8 pb-10 lg:pb-14">
            <div>
              <AnimatedHeadline
                lines={['Detailed', 'indoors']}
                as="h1"
                className="text-[clamp(2.75rem,8.5vw,7rem)] text-white uppercase"
                delay={0.1}
              />
              <FadeHeadline delay={0.45} className="mt-6 max-w-xl text-lg sm:text-xl text-white/80 text-pretty">
                Car detailing by appointment in a private Boise-area garage. Out of the sun and weather, we clean the car inside and out and protect the paint.
              </FadeHeadline>
              <FadeHeadline as="div" delay={0.6} className="mt-8 flex flex-col sm:flex-row gap-3">
                <MagneticButton href="/booking#design-your-detail" size="lg">
                  Book a detail
                </MagneticButton>
                <MagneticButton href="/pricing" variant="secondary" size="lg" className="bg-black/30">
                  See prices
                </MagneticButton>
              </FadeHeadline>
            </div>

            <FadeHeadline as="div" delay={0.8} className="mt-12 lg:mt-16 border-t border-white/15 pt-5">
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                {heroFacts.map((fact) => (
                  <div key={fact.term}>
                    <dt className="text-sm text-white/55">{fact.term}</dt>
                    <dd className="text-white">{fact.detail}</dd>
                  </div>
                ))}
              </dl>
            </FadeHeadline>
          </div>
        </VideoHero>

        {/* Services, as a price list */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-4xl sm:text-5xl text-white uppercase">Services</h2>
              <p className="mt-5 max-w-sm text-neutral-400 text-pretty">
                Every service comes in Silver, Gold, and Platinum tiers. Prices here are for cars and sedans. SUVs and trucks cost a little more.
              </p>
              <Link
                href="/pricing"
                className="mt-6 inline-flex text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-400/40 hover:decoration-red-300 transition-colors"
              >
                Full price list
              </Link>
            </div>

            <ul className="lg:col-span-8 border-t border-white/10">
              {services.map((service) => (
                <li key={service.name} className="border-b border-white/10">
                  <Link
                    href={service.href}
                    className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 sm:py-7 transition-colors hover:bg-white/[0.02] -mx-3 px-3 rounded-md"
                  >
                    <span className="text-xl sm:text-2xl font-semibold text-white">{service.name}</span>
                    <span className="text-right tabular text-neutral-400">
                      from{' '}
                      <span className="font-display text-2xl sm:text-3xl text-white group-hover:text-red-400 transition-colors">
                        ${service.from}
                      </span>
                    </span>
                    <span className="col-span-2 sm:col-span-1 text-neutral-400 text-pretty">{service.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works: a real sequence, so it is numbered */}
        <section className="py-20 lg:py-28 bg-[#0a0a0a] border-y border-white/[0.06]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase max-w-2xl">How booking works</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => (
                <li key={step.title} className="relative border-t-2 border-red-600 pt-6">
                  <span className="font-display text-5xl text-white/15 tabular" aria-hidden="true">{i + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-neutral-400 text-pretty">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12">
              <MagneticButton href="/booking#design-your-detail">Start booking</MagneticButton>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <ReviewsSection />
        </section>

        {/* Social */}
        <section className="pb-20 lg:pb-28">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
              <h2 className="font-display text-4xl sm:text-5xl text-white uppercase">Recent work</h2>
              <Link
                href="/gallery"
                className="text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-400/40 transition-colors"
              >
                Before and after photos
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <InstagramEmbed />
              <TikTokEmbed />
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="border-t border-white/[0.06] bg-linear-to-b from-red-950/30 to-transparent">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-28 grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <h2 className="font-display text-4xl sm:text-6xl text-white uppercase text-balance">Not sure what your car needs?</h2>
              <p className="mt-5 max-w-lg text-lg text-neutral-400 text-pretty">
                Call or text and describe it. We reply within a day, usually sooner.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <a
                href="tel:+12089604970"
                className="font-display text-4xl sm:text-5xl text-white tabular hover:text-red-400 transition-colors"
              >
                (208) 960-4970
              </a>
              <div className="flex flex-col sm:flex-row gap-3">
                <MagneticButton href="/booking#design-your-detail" size="lg">Book a detail</MagneticButton>
                <MagneticButton href="/contact" variant="secondary" size="lg">Send a message</MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
