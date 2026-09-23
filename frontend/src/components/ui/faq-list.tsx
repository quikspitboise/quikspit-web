interface Faq {
  q: string
  a: string
}

/** Question list built on <details>, so it works without JavaScript. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-t border-white/10">
      {faqs.map((faq) => (
        <details key={faq.q} className="faq-item group border-b border-white/10">
          <summary className="flex items-start justify-between gap-6 py-5 text-lg font-medium text-white transition-colors hover:text-red-300">
            <span>{faq.q}</span>
            <svg
              className="faq-icon mt-1.5 h-4 w-4 shrink-0 text-neutral-400"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M8 2v12M2 8h12" />
            </svg>
          </summary>
          <p className="pb-6 pr-10 max-w-2xl text-neutral-400 text-pretty">{faq.a}</p>
        </details>
      ))}
    </div>
  )
}
