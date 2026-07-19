import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MarketingShell } from '@/layouts/MarketingShell'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { Eyebrow, Card } from '@/components/common/atoms'

const comingSoonFeatures = [
  ['Early access', 'Be the first to test new features before public release'],
  ['Priority support', 'Direct line to our engineering team for critical issues'],
  ['Custom integrations', 'Connect with your favorite tools and platforms'],
  ['Advanced analytics', 'Deep insights into your placement trajectory'],
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
                <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand animate-pulse">
                  Coming soon
                </span>
              </div>
              <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-ink tracking-tight max-w-[22ch] mx-auto text-center">
                PlacementPilot Pro
              </h1>
              <p className="mt-6 max-w-[55ch] mx-auto text-lg text-ink-3 text-center">
                Pricing plans are on the way. We are engineering flexible tiers for every stage of your placement journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FEATURES TEASER */}
        <section className="py-24 border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 max-w-2xl mx-auto text-center">
              <Eyebrow>What to expect</Eyebrow>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
                Premium capabilities in development
              </h2>
            </div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
            >
              {comingSoonFeatures.map(([title, desc]) => (
                <motion.div key={title} variants={staggerItem}>
                  <Card className="h-full">
                    <div className="size-10 rounded-lg bg-brand/10 grid place-items-center mb-4">
                      <div className="size-2 rounded-full bg-brand" />
                    </div>
                    <h3 className="text-ink font-medium mb-2">{title}</h3>
                    <p className="text-sm text-ink-3">{desc}</p>
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
              Ready to begin your ascent?
            </h2>
            <p className="text-ink-3 mb-8 max-w-lg mx-auto">
              Start with the free tier today. Upgrade when Pro launches.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                to="/sign-up"
                className="bg-brand text-[#05130d] px-6 py-3 rounded-md font-semibold hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Start pre-flight
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