import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/page-header'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with QuikSpit Auto Detailing for a quote, to schedule a service, or to ask a question. Car detailing by appointment in the Boise, Idaho area.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact QuikSpit Auto Detailing',
    description: 'Call, text, or send a message to get a quote for detailing in the Boise area.',
    url: '/contact',
  },
}

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/quikspitboise/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@quikspitboise' },
  { label: 'Facebook', href: 'https://www.facebook.com/people/QuikSpit-Auto-Detailing/61577268493375/' },
]

export default function Contact() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageHeader
        title="Contact"
        lede="Call, text, or send a note. We reply within a day, usually sooner."
      />

      <section className="border-t border-white/[0.07] py-16 lg:py-24">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <dl className="space-y-8">
              <div>
                <dt className="text-sm text-neutral-500">Phone, call or text</dt>
                <dd className="mt-1">
                  <a href="tel:+12089604970" className="font-display text-3xl sm:text-4xl text-white tabular transition-colors hover:text-red-400">
                    (208) 960-4970
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Email</dt>
                <dd className="mt-1">
                  <a href="mailto:contact@quikspitboise.com" className="text-lg text-white underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-red-400 break-all">
                    contact@quikspitboise.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Hours</dt>
                <dd className="mt-1 text-lg text-white">By appointment. Same-day slots when open.</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Location</dt>
                <dd className="mt-1 text-lg text-white">A private garage in the Boise area.</dd>
                <dd className="mt-1 text-sm text-neutral-500">The address comes with your booking confirmation.</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-500">Elsewhere</dt>
                <dd className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1 text-white underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-red-400"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="panel p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">Send a message</h2>
              <p className="mt-2 mb-8 text-neutral-400 text-pretty">
                Ask about a service or get a quote. A photo of the car helps us quote accurately.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
