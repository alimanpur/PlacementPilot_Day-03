import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { useGoals, useCreateGoal, useUpdateOnboarding, useProfile } from '@/hooks/api'
import { useSearchParams } from 'react-router-dom'

export default function Goals() {
  const { data: goals, isLoading, error, refetch } = useGoals()
  const { data: profile } = useProfile()
  const createGoalMutation = useCreateGoal()
  const updateOnboarding = useUpdateOnboarding()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    progress: 0,
    deadline: '',
    cadence: 'Weekly',
    tone: 'brand',
  })
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Mission goals" title="Goals" />
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
          <PageHeader eyebrow="Mission goals" title="Goals" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load goals.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.deadline) return
    createGoalMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ title: '', progress: 0, deadline: '', cadence: 'Weekly', tone: 'brand' })
        setShowForm(false)
        if (profile?.onboarding && !profile.onboarding.completed) {
          updateOnboarding.mutate({ firstGoal: true })
        }
      },
    })
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Mission goals"
          title="Goals"
          meta="Commitments you set. Progress your dashboard actually respects."
          action={
            <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
              + New goal
            </Button>
          }
        />
        <PageBody>
          {showForm && (
            <Card>
              <Eyebrow className="mb-4">New goal</Eyebrow>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-ink mb-1.5">Goal title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Solve 500 DSA problems"
                    required
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Cadence</label>
                  <input
                    type="text"
                    value={formData.cadence}
                    onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                    placeholder="e.g. Weekly"
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" variant="primary" size="sm" loading={createGoalMutation.isPending}>
                    Create
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {goals?.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {goals.map((g) => (
                <motion.div key={g._id || g.title} variants={staggerItem}>
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <Eyebrow>{g.cadence}</Eyebrow>
                      <StatusPill
                        tone={
                          g.tone === 'brand' ? 'brand' : g.tone === 'accent' ? 'accent' : 'neutral'
                        }
                      >
                        {g.progress >= 80 ? 'On track' : g.progress >= 40 ? 'In progress' : 'Behind'}
                      </StatusPill>
                    </div>
                    <h3 className="font-display text-xl text-ink">{g.title}</h3>
                    <div className="mt-6 flex items-baseline gap-3">
                      <span className="font-display text-3xl text-ink tabular-nums">
                        {g.progress}%
                      </span>
                      <span className="text-xs text-ink-4 font-mono">due {g.deadline}</span>
                    </div>
                    <div
                      className="mt-4 h-2 rounded-full bg-white/[0.04] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={g.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${g.title}: ${g.progress}% complete`}
                    >
                      <div
                        className={
                          g.tone === 'brand'
                            ? 'h-full bg-brand transition-all duration-700'
                            : g.tone === 'accent'
                              ? 'h-full bg-accent transition-all duration-700'
                              : 'h-full bg-white/20 transition-all duration-700'
                        }
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No goals yet"
              description="Goals give your dashboard purpose. Create your first goal to start tracking progress."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                  Create goal
                </Button>
              }
            />
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
