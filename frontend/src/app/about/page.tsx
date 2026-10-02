import type { Metadata } from 'next'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { PageHeader } from '@/components/ui/page-header'
import { OwnerImage } from '@/components/owner-image'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'QuikSpit Auto Detailing is a Boise-area detailing business working by appointment out of a private garage. Learn about our approach and the owner behind it.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About QuikSpit Auto Detailing',
    description: 'A Boise detailing business built on efficient work, fair prices, and cars treated like our own.',
    url: '/about',
  },
}

export default function About() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageHeader
        title="About QuikSpit"
        lede="A Boise detailer working out of a private garage, run by an Idaho native who likes a job done right the first time."
      />

      {/* Owner */}
      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <figure className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900">
              <OwnerImage />
            </div>
            <figcaption className="mt-3 text-sm text-neutral-500">Garret, owner</figcaption>
          </figure>

          <div className="lg:col-span-7 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase">Meet Garret</h2>
            <div className="mt-6 space-y-5 text-lg text-neutral-300 leading-relaxed text-pretty">
              <p>
                Garret was born and raised in Idaho and works in healthcare, where doing right by people is the whole job. He brings that same standard to QuikSpit: show up on time, do the work well, charge fairly for it.
              </p>
              <p>
                He started the business because he saw how much time people lose waiting on car care. Booking a set time and getting the car back when promised fixes that, and it lets him build something of his own in the community he grew up in.
              </p>
            </div>

            <h2 className="mt-14 font-display text-3xl sm:text-4xl text-white uppercase">How we work</h2>
            <div className="mt-6 space-y-5 text-lg text-neutral-300 leading-relaxed text-pretty">
              <p>
                QuikSpit exists to save you time. You book a set time, drop the car off, and we detail it indoors, out of the sun, wind, and dust that make outdoor work harder to get right.
              </p>
              <p>
                We keep the work efficient without cutting corners, so a detail costs less than you might expect and still holds up when you look closely. Every vehicle gets the same care we would give our own.
              </p>
              <p>
                Most of our customers come back and send their neighbors. That matters more to us than any single job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-white/[0.07] bg-linear-to-b from-red-950/30 to-transparent">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl text-white uppercase text-balance">Book a detail</h2>
            <p className="mt-4 max-w-lg text-neutral-400 text-pretty">
              We&apos;re in the Boise area, and the garage address comes with your booking. Pick a package and a time, or send a question first.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <MagneticButton href="/booking#design-your-detail" size="lg">Book a detail</MagneticButton>
            <MagneticButton href="/contact" variant="secondary" size="lg">Ask a question</MagneticButton>
          </div>
        </div>
      </section>
    </main>
  )
}
