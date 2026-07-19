import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow } from '@/components/common/atoms'
import { PageTransition } from '@/components/common/PageTransition'

const faqs = [
  ['Is PlacementPilot really free to start?', 'Yes. The Ground tier is free forever. Cruise starts with a two-week trial and requires no credit card.'],
  ['Do you support candidates from all institutions?', 'Yes. PlacementPilot is built for any candidate, regardless of institution. For cohort dashboards and mentor visibility, ask about our Squadron tier.'],
  ['Where does my data live?', 'In an encrypted, regionally-appropriate database. Export any time. Delete on request.'],
  ['Can I use it just for DSA?', 'You can. But most candidates find the application tracker and interview log the reason they stay.'],
  ['Is there a mobile app?', 'PlacementPilot is a responsive web app today. Native mobile is on the roadmap for early 2027.'],
  ['How is the readiness score calculated?', 'A weighted composite of coding velocity, topic mastery, mock scores, application activity, and consistency. Full formula visible in Settings.'],
]

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-4xl mx-auto px-6 py-24">
            <Eyebrow>Frequent questions</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
              Everything you'd think to ask.
            </h1>
          </div>
        </section>
        <section className="py-20">
          <div
            className="max-w-3xl mx-auto px-6 divide-y divide-hairline"
            role="list"
            aria-label="Frequently asked questions"
          >
            {faqs.map(([q, a], i) => (
              <div key={q} className="py-6" role="listitem">
                <button
                  className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <h3 className="font-display text-lg text-ink">{q}</h3>
                  <motion.span
                    className="text-ink-3 text-xl leading-none shrink-0"
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`faq-question-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-ink-3 text-sm leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
