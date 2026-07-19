import { motion } from 'framer-motion'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow, Card } from '@/components/common/atoms'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'

const groups = [
  {
    label: 'Tracking',
    items: [
      ['Application pipeline', 'Kanban plus radar view. Every stage, every deadline, every debrief.'],
      ['Interview log', 'Structured records for every round. Attach notes, rubrics, and follow-ups.'],
      ['Company profiles', 'Prep guides, interview loops, comp bands, and past-round intel.'],
    ],
  },
  {
    label: 'Preparation',
    items: [
      ['DSA tracker', '18 topic tracks with mastery scoring. Adaptive review queue built in.'],
      ['System design ladder', 'Concepts, case studies, and rubric-scored practice.'],
      ['Behavioral studio', 'STAR templates, story bank, and mock recording review.'],
    ],
  },
  {
    label: 'Planning',
    items: [
      ['Adaptive planner', 'Weekly targets that respond to your consistency and pipeline heat.'],
      ['Coding calendar', 'One problem a day, calibrated to your weak topics.'],
      ['Deadline radar', 'OA windows, interview slots, and cohort deadlines in one view.'],
    ],
  },
  {
    label: 'Intelligence',
    items: [
      ['Readiness score', 'A single number that reflects your placement altitude, updated live.'],
      ['Trend analytics', 'Coding velocity, streaks, mock scores, and topic momentum.'],
      ['Debrief patterns', 'Recurring themes across mocks and real interviews, surfaced automatically.'],
    ],
  },
]

export default function Features() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <Eyebrow>Capabilities</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight max-w-[20ch]">
              Every instrument earns its place on the dashboard.
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg text-ink-3">
              We don't ship features to fill a comparison table. Each capability represents
              a real behavior our best candidates practice weekly.
            </p>
          </div>
        </section>

        {groups.map((g) => (
          <section key={g.label} className="border-b border-hairline py-20">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_2fr] gap-12">
              <div>
                <Eyebrow>{g.label}</Eyebrow>
                <h2 className="mt-3 font-display text-3xl text-ink font-semibold">
                  {g.label} instruments
                </h2>
              </div>
              <motion.div
                className="grid sm:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-60px' }}
              >
                {g.items.map(([title, desc]) => (
                  <motion.div key={title} variants={staggerItem}>
                    <Card className="h-full">
                      <h3 className="text-ink font-medium mb-2">{title}</h3>
                      <p className="text-sm text-ink-3">{desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        ))}
      </MarketingShell>
    </PageTransition>
  )
}
