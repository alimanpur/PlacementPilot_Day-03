import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow } from '@/components/common/atoms'
import { Input } from '@/components/forms/FormField'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'

const topics = [
  { title: 'Getting started', desc: 'Six-minute tour of your deck.', to: '/app/dashboard' },
  { title: 'Application tracking', desc: 'How pipeline stages work.', to: '/app/applications' },
  { title: 'DSA calibration', desc: 'How the adaptive queue picks problems.', to: '/app/dsa' },
  { title: 'Readiness score', desc: 'What goes into the number.', to: '/app/analytics' },
  { title: 'Interview logs', desc: 'Rubrics, debriefs, and follow-ups.', to: '/app/interviews' },
  { title: 'Data & privacy', desc: 'Export, delete, and permissions.', to: '/app/settings' },
]

export default function Help() {
  const [query, setQuery] = useState('')

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Help center"
          title="How can we help you land?"
          meta="Short guides for every instrument on your deck."
        />
        <PageBody className="space-y-8">
          <Card>
            <div className="max-w-lg">
              <Eyebrow className="mb-3">Search the manual</Eyebrow>
              <Input
                placeholder="Type a keyword…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search help topics"
              />
            </div>
          </Card>

          {filtered.length === 0 ? (
            <div className="ring-hairline rounded-2xl bg-surface/40 border border-dashed border-white/5 p-12 text-center">
              <h3 className="font-display text-lg font-medium text-ink mb-1">No results.</h3>
              <p className="text-sm text-ink-3">Try a different keyword or browse all topics.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              key={query}
            >
              {filtered.map((t) => (
                <motion.div key={t.title} variants={staggerItem}>
                  <Link
                    to={t.to}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl"
                  >
                    <Card className="hover:ring-brand/30 transition h-full">
                      <h3 className="font-display text-lg text-ink">{t.title}</h3>
                      <p className="text-sm text-ink-3 mt-2">{t.desc}</p>
                      <div className="mt-4 text-xs text-brand">Open →</div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
