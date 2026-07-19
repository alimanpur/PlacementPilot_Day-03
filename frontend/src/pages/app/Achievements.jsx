import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { useAchievements } from '@/hooks/api'

export default function Achievements() {
  const { data: achievements, isLoading, error, refetch } = useAchievements()

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Milestones" title="Achievements" />
          <PageBody>
            <div className="grid place-items-center min-h-[400px]">
              <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Milestones" title="Achievements" />
      <PageBody>
        <div className="text-center py-12 space-y-4">
          <p className="text-ink-3">Failed to load achievements.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Milestones"
          title="Achievements"
          meta="Moments worth marking. Signals worth remembering."
        />
        <PageBody>
          {achievements?.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {achievements.map((a) => (
                <motion.div key={a._id || a.title} variants={staggerItem}>
                  <Card className="relative overflow-hidden">
                    <div
                      className={
                        a.tier === 'gold'
                          ? 'absolute -right-8 -top-8 size-32 rounded-full bg-accent/10 pointer-events-none'
                          : a.tier === 'silver'
                            ? 'absolute -right-8 -top-8 size-32 rounded-full bg-brand/10 pointer-events-none'
                            : 'absolute -right-8 -top-8 size-32 rounded-full bg-white/[0.03] pointer-events-none'
                      }
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <StatusPill
                        tone={a.tier === 'gold' ? 'accent' : a.tier === 'silver' ? 'brand' : 'neutral'}
                      >
                        {a.tier}
                      </StatusPill>
                      <h3 className="font-display text-2xl text-ink mt-4">{a.title}</h3>
                      <p className="text-sm text-ink-3 mt-2">{a.meta}</p>
                      <div className="mt-6 eyebrow">{a.when}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No achievements yet"
              description="Achievements unlock as you hit milestones — first offer, streak records, mock interview clears."
            />
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
