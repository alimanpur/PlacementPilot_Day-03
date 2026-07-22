import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MarketingShell } from '@/layouts/MarketingShell'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { Eyebrow, Card } from '@/components/common/atoms'

const includedFeatures = [
  'Unlimited applications',
  'Unlimited interviews',
  'Unlimited DSA problems',
  'Unlimited planner tasks',
  'Unlimited goals',
  'Company tracking',
  'DSA analytics',
  'Placement readiness score',
  'Weekly and monthly reports',
  'Document management',
  'Achievements system',
  'Command palette',
  'Dark mode',
  'Data export',
  'Mobile responsive',
]

const roadmapItems = [
  { quarter: 'Q3 2026', title: 'Advanced Analytics', desc: 'Deeper insights, predictive readiness scoring, and custom report builder.' },
  { quarter: 'Q4 2026', title: 'Team Workspaces', desc: 'Share preparation progress with study groups and mentors.' },
  { quarter: 'Q1 2027', title: 'Interview Simulator', desc: 'AI-powered mock interviews with real-time feedback.' },
  { quarter: 'Future', title: 'API Access', desc: 'Integrate PlacementPilot with your own tools and workflows.' },
]

export default function Pricing() {
  return (
    <PageTransition>
      <MarketingShell>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-hairline">
          <div className="absolute inset-0 -z-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="inline-flex">
                <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                  Free during development
                </span>
              </div>
              <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-ink tracking-tight max-w-[22ch] mx-auto text-center">
                No cost. All features.
              </h1>
              <p className="mt-6 max-w-[55ch] mx-auto text-lg text-ink-3 text-center">
                PlacementPilot is completely free while it's in development. Use every feature, 
                give feedback, and help shape the future of placement preparation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* INCLUDED FEATURES */}
        <section className="py-24 border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 max-w-2xl mx-auto text-center">
              <Eyebrow>What's included</Eyebrow>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
                Everything you need, nothing you don't
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {includedFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3 px-4 py-3 rounded-md bg-surface">
                  <span className="text-brand text-xs">✓</span>
                  <span className="text-sm text-ink">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="py-24 border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 max-w-2xl mx-auto text-center">
              <Eyebrow>Looking ahead</Eyebrow>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
                Possible future directions
              </h2>
              <p className="mt-4 text-ink-3">
                These are ideas we are exploring. No guarantees. No paid tiers planned. 
                We will figure out sustainability together with the community.
              </p>
            </div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
            >
              {roadmapItems.map((item) => (
                <motion.div key={item.quarter} variants={staggerItem}>
                  <Card className="h-full">
                    <div className="eyebrow text-brand mb-3">{item.quarter}</div>
                    <h3 className="font-display text-lg text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-ink-3">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 border-t border-hairline">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">
              Start building your placement workspace
            </h2>
            <p className="text-ink-3 mb-8 max-w-lg mx-auto">
              Free during development. No credit card. No paywall. 
              Just the tools you need to prepare systematically.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                to="/sign-up"
                className="bg-brand text-[#05130d] px-6 py-3 rounded-md font-semibold hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Get started
              </Link>
              <Link
                to="/"
                className="ring-hairline bg-surface hover:bg-surface-2 text-ink px-6 py-3 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}