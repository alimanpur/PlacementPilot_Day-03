import { motion } from 'framer-motion'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow, Card } from '@/components/common/atoms'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'

const stages = [
  {
    stage: 'Ground',
    weeks: 'Weeks 0-4',
    color: '#10b981',
    heading: 'Diagnose. Chart the runway.',
    lines: [
      'Baseline diagnostic across DSA, system design, and behavioral.',
      "Target companies and tiers loaded into the radar.",
      "First week's plan generated automatically.",
    ],
  },
  {
    stage: 'Climb',
    weeks: 'Weeks 5-12',
    color: '#10b981',
    heading: 'Build altitude, one topic at a time.',
    lines: [
      'Adaptive DSA queue keeps you on the weakest topic just long enough.',
      'First mocks scheduled; debriefs written by rubric, not vibes.',
      'System design ladder unlocks a rung a week.',
    ],
  },
  {
    stage: 'Cruise',
    weeks: 'Weeks 13-20',
    color: '#f59e0b',
    heading: 'Applications open. Pipelines fill.',
    lines: [
      'Company profiles guide targeted prep per loop.',
      'Resume iterations tracked by version and callback rate.',
      'Weekly review nudges when momentum slips.',
    ],
  },
  {
    stage: 'Approach',
    weeks: 'Weeks 21+',
    color: '#10b981',
    heading: 'Land clean. Decide well.',
    lines: [
      'Interview loops are logged live; debriefs are written same-day.',
      'Offer comparison tool weighs comp, growth, and culture signals.',
      'Post-decision reflection archives the season for future you.',
    ],
  },
]

export default function Story() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <Eyebrow>The preparation journey</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight max-w-[20ch]">
              Four altitudes. One continuous ascent.
            </h1>
          </div>
        </section>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stages.map((s, i) => (
            <motion.section
              key={s.stage}
              variants={staggerItem}
              className="border-b border-hairline py-20"
            >
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-12">
                <div>
                  <div className="eyebrow" style={{ color: s.color }}>
                    Stage 0{i + 1} · {s.weeks}
                  </div>
                  <div className="mt-2 font-display text-3xl text-ink font-semibold">
                    {s.stage}
                  </div>
                </div>
                <Card>
                  <h3 className="font-display text-2xl text-ink mb-4">{s.heading}</h3>
                  <ul className="space-y-3" role="list">
                    {s.lines.map((l) => (
                      <li key={l} className="flex gap-3 text-ink-2 text-sm">
                        <span
                          className="mt-1.5 size-1 rounded-full bg-brand shrink-0"
                          aria-hidden="true"
                        />
                        {l}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </motion.section>
          ))}
        </motion.div>
      </MarketingShell>
    </PageTransition>
  )
}
