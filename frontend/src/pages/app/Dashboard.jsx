import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, KeyStat, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import {
  ReadinessDial,
  ConsistencyHeatmap,
  TrajectoryRow,
  ReadinessBars,
} from '@/components/charts/instruments'
import {
  useDashboard,
  useDashboardActivity,
  useDashboardQuickActions,
  useDsaTopics,
  useGoals,
  useTodayFocus,
  useProfile,
} from '@/hooks/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboard()
  const { data: activity } = useDashboardActivity(10)
  const { data: quickActions } = useDashboardQuickActions()
  
  const { data: dsaTopics } = useDsaTopics()
  const { data: goals } = useGoals()
  const { data: todayFocusData } = useTodayFocus()
  const { data: profile } = useProfile()

  const {
    readiness,
    companies: activeCompanies,
    hotCompanies,
    interviews: dashboardInterviews,
    todayFocus,
    dsaStats,
    stats,
    user,
    streak,
    heatmap,
  } = data || {}
  
  const upcomingInterviews = dashboardInterviews?.filter((i) => i.status === 'upcoming') || []

  const weakTopics = useMemo(() => {
    return (dsaTopics || [])
      .filter((t) => t.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4)
  }, [dsaTopics])

  const isNewUser = useMemo(() => {
    const hasCompanies = (activeCompanies?.length || 0) === 0
    const hasDsa = (dsaStats?.totalSolved || 0) === 0
    const hasGoals = (goals?.length || 0) === 0
    const hasPlanner = (todayFocusData?.tasks?.length || 0) === 0
    return hasCompanies && hasDsa && hasGoals && hasPlanner
  }, [activeCompanies, dsaStats, goals, todayFocusData])

  const onboardingProgress = useMemo(() => {
    if (!user?.onboarding || user.onboarding.completed) return { steps: [], completed: 0, total: 5 }
    
    const steps = [
      { key: 'profileComplete', done: user.onboarding.steps?.profileComplete || false, label: 'Complete Profile' },
      { key: 'firstCompany', done: user.onboarding.steps?.firstCompany || false, label: 'Add Target Company' },
      { key: 'firstGoal', done: user.onboarding.steps?.firstGoal || false, label: 'Create First Goal' },
      { key: 'firstDsaLog', done: user.onboarding.steps?.firstDsaLog || false, label: 'Log First DSA Problem' },
      { key: 'firstPlannerTask', done: user.onboarding.steps?.firstPlannerTask || false, label: 'Add First Planner Task' },
    ]
    const completed = steps.filter((s) => s.done).length
    return { steps, completed, total: steps.length }
  }, [user])

  const todayDate = useMemo(() => {
    try {
      return format(new Date(), 'EEEE, MMM d')
    } catch {
      return 'Today'
    }
  }, [])

  const userName = user?.name?.split(' ')[0] || profile?.name?.split(' ')[0] || 'there'
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }, [])

  const getOnboardingRoute = (stepKey) => {
    const routes = {
      profileComplete: '/app/profile',
      firstCompany: '/app/applications',
      firstGoal: '/app/goals',
      firstDsaLog: '/app/dsa',
      firstPlannerTask: '/app/planner',
    }
    return routes[stepKey] || '/app/profile'
  }

  const getOnboardingDescription = (stepKey) => {
    const descriptions = {
      profileComplete: 'Help recruiters understand your background and skills.',
      firstCompany: 'Start tracking your placement pipeline.',
      firstGoal: 'Measure progress toward your dream placement.',
      firstDsaLog: 'Begin tracking your coding consistency.',
      firstPlannerTask: 'Plan your daily preparation schedule.',
    }
    return descriptions[stepKey] || ''
  }

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Command deck" title="Loading..." />
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
          <PageHeader eyebrow="Command deck" title="Error" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load dashboard data.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (isNewUser && onboardingProgress.completed < onboardingProgress.total) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader
            eyebrow="Command deck"
            title={`Welcome, ${userName}.`}
            meta="Let's build your placement workspace."
          />
          <PageBody>
            <div className="max-w-2xl mx-auto">
              <Card className="mb-8">
                <Eyebrow className="mb-4">Getting Started</Eyebrow>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${(onboardingProgress.completed / onboardingProgress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-ink-4 tabular-nums">
                    {onboardingProgress.completed}/{onboardingProgress.total}
                  </span>
                </div>
                <ul className="space-y-3" role="list">
                  {onboardingProgress.steps.map((step) => (
                    <li
                      key={step.key}
                      className={cn(
                        'flex items-start justify-between gap-4 rounded-md px-4 py-3 transition',
                        step.done ? 'bg-brand/5' : 'bg-surface-2',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={cn('text-sm font-medium block', step.done ? 'text-ink-4 line-through' : 'text-ink')}>
                          {step.label}
                        </span>
                        {!step.done && (
                          <span className="text-xs text-ink-3 mt-1 block">
                            {getOnboardingDescription(step.key)}
                          </span>
                        )}
                      </div>
                      {step.done ? (
                        <span className="text-brand text-xs font-mono shrink-0">✓ Done</span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          as={Link}
                          to={getOnboardingRoute(step.key)}
                          className="shrink-0"
                        >
                          Go →
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
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
          eyebrow={`Command deck · ${todayDate}`}
          title={`Good ${greeting}, ${userName}.`}
          meta={
            readiness
              ? `Placement readiness: ${Math.round(readiness.overall)}% · ${stats?.applications || 0} applications · ${streak || 0}d streak`
              : 'Welcome to PlacementPilot.'
          }
          action={
            <div className="flex gap-2 flex-wrap">
              {quickActions?.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant={action.id === 'add-application' ? 'primary' : 'secondary'}
                  size="sm"
                  as={Link}
                  to={action.route}
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </div>
          }
        />
        <PageBody className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <KeyStat
                label="Applications"
                value={stats?.applications || 0}
                delta={`${stats?.offers || 0} offers`}
                tone="brand"
              />
            </Card>
            <Card>
              <KeyStat
                label="Interviews"
                value={stats?.interviews || 0}
                delta={`${upcomingInterviews.length} upcoming`}
                tone="accent"
              />
            </Card>
            <Card>
              <KeyStat
                label="Problems"
                value={stats?.problemsSolved || 0}
                delta={`${dsaStats?.weeklySolved || 0} this week`}
                tone="brand"
              />
            </Card>
            <Card>
              <KeyStat
                label="Goals"
                value={stats?.goalsCompleted || 0}
                delta={`${goals?.length || 0} active`}
                tone="accent"
              />
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Readiness Card */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="col-span-12 lg:col-span-4">
              <motion.div variants={staggerItem}>
                <Card className="flex flex-col items-center h-full">
                  <div className="flex items-center justify-between w-full mb-4">
                    <Eyebrow>Placement Readiness</Eyebrow>
                    <StatusPill tone={readiness?.overall >= 50 ? 'brand' : 'accent'}>
                      {readiness?.overall >= 50 ? 'On track' : 'Building'}
                    </StatusPill>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-display font-bold text-ink mb-2">
                      {Math.round(readiness?.overall || 0)}%
                    </div>
                    <div className="text-xs text-ink-3">Placement Readiness</div>
                  </div>
                  <div className="mt-6 w-full pt-6 border-t border-hairline">
                    <ReadinessBars
                      items={[
                        { label: 'Coding', value: readiness?.coding || 0 },
                        { label: 'Interview', value: readiness?.interviewReadiness || 0 },
                        { label: 'Goals', value: readiness?.goalReadiness || 0 },
                        { label: 'Profile', value: readiness?.profileScore || 0 },
                      ]}
                    />
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Today's Focus & Activity */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="col-span-12 lg:col-span-8 grid grid-rows-[auto_1fr] gap-6"
            >
              {/* Today's Focus */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Eyebrow>Today's Focus</Eyebrow>
                    <h3 className="font-display text-lg text-ink font-medium mt-1">
                      {todayFocus?.length ? 'Priorities for today' : 'No recommendations yet'}
                    </h3>
                  </div>
                </div>
                {todayFocus?.length ? (
                  <ul className="space-y-2" role="list">
                    {todayFocus.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 rounded-md px-3 py-3 hover:bg-surface-2 transition"
                      >
                        <div
                          className={cn(
                            'mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0',
                            item.priority === 'high' ? 'bg-brand/20 text-brand' : 'bg-accent/20 text-accent'
                          )}
                        >
                          <span className="text-xs">!</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-ink font-medium">{item.title}</div>
                          <div className="text-xs text-ink-3 mt-0.5">{item.description}</div>
                        </div>
                        <StatusPill tone={item.priority === 'high' ? 'brand' : 'accent'}>
                          {item.priority}
                        </StatusPill>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="Start building your profile"
                    description="Complete these steps to get personalized recommendations"
                    action={
                      <Button variant="primary" size="sm" as={Link} to="/app/profile">
                        Update Profile
                      </Button>
                    }
                  />
                )}
              </Card>

              {/* Recent Activity */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Eyebrow>Recent Activity</Eyebrow>
                    <h3 className="font-display text-lg text-ink font-medium mt-1">
                      Your trajectory
                    </h3>
                  </div>
                </div>
                {activity?.length ? (
                  <ul className="space-y-3" role="list">
                    {activity.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 text-sm">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-ink">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-ink-3 mt-0.5">{item.description}</div>
                          )}
                        </div>
                        <span className="text-xs text-ink-4 font-mono shrink-0">{item.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="No activity yet"
                    description="Start by adding companies, logging problems, or creating goals"
                  />
                )}
              </Card>
            </motion.div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Active Applications */}
            <Card className="col-span-12 lg:col-span-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Eyebrow>Active Trajectories</Eyebrow>
                  <h3 className="font-display text-lg text-ink font-medium mt-1">
                    {activeCompanies?.length || 0} companies in transit
                  </h3>
                </div>
                <Link to="/app/applications" className="text-xs text-brand hover:underline">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {activeCompanies?.slice(0, 5).map((c) => (
                  <TrajectoryRow
                    key={c._id || c.code}
                    code={c.code}
                    progress={c.progress}
                    stage={c.stage}
                    tone={
                      c.status === 'offer'
                        ? 'brand'
                        : c.status === 'hot'
                          ? 'brand'
                          : c.status === 'queued'
                            ? 'muted'
                            : 'accent'
                    }
                  />
                ))}
                {(!activeCompanies || activeCompanies.length === 0) && (
                  <EmptyState
                    title="No applications yet"
                    description="Track every company you target. Start by adding your first application."
                    action={
                      <Button variant="primary" size="sm" as={Link} to="/app/applications">
                        Add application
                      </Button>
                    }
                  />
                )}
              </div>
            </Card>

            {/* Upcoming Tasks & Quick Stats */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Upcoming Interviews */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <Eyebrow>Upcoming</Eyebrow>
                  <StatusPill tone="accent">{upcomingInterviews.length} this week</StatusPill>
                </div>
                <ul className="space-y-3" role="list">
                  {upcomingInterviews.slice(0, 3).map((i) => (
                    <li key={i._id || i.company + i.when} className="border-l-2 border-brand pl-3">
                      <div className="text-xs font-mono text-ink-4">{i.when}</div>
                      <div className="text-ink font-medium truncate">{i.company}</div>
                      <div className="text-xs text-ink-3 truncate">{i.round}</div>
                    </li>
                  ))}
                  {upcomingInterviews.length === 0 && (
                    <EmptyState
                      title="No upcoming interviews"
                      description="Log interview rounds as they get scheduled."
                      action={
                        <Button variant="primary" size="sm" as={Link} to="/app/interviews">
                          Log a round
                        </Button>
                      }
                    />
                  )}
                </ul>
              </Card>

              {/* Hot Companies */}
              {hotCompanies?.length > 0 && (
                <Card>
                  <Eyebrow className="mb-4">Hot Leads</Eyebrow>
                  <ul className="space-y-2" role="list">
                    {hotCompanies.slice(0, 3).map((c) => (
                      <li key={c._id} className="flex items-center justify-between text-sm">
                        <span className="text-ink truncate">{c.name}</span>
                        <StatusPill tone="brand">{c.stage}</StatusPill>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>

          {/* Coding Consistency & Weak Topics */}
          <div className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 lg:col-span-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Eyebrow>Coding Consistency</Eyebrow>
                  <h3 className="font-display text-lg text-ink font-medium mt-1">
                    Signal strength
                  </h3>
                </div>
                <span className="text-xs text-brand font-mono">{streak || 0} day streak</span>
              </div>
              <ConsistencyHeatmap data={heatmap || []} />
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-hairline">
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-ink">{data?.codingStats?.currentStreak || 0}</div>
                  <div className="text-xs text-ink-3">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-ink">{data?.codingStats?.longestStreak || 0}</div>
                  <div className="text-xs text-ink-3">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-ink">{data?.codingStats?.weeklySolved || 0}</div>
                  <div className="text-xs text-ink-3">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-ink">{data?.codingStats?.monthlySolved || 0}</div>
                  <div className="text-xs text-ink-3">This Month</div>
                </div>
              </div>
            </Card>

            <Card className="col-span-12 lg:col-span-4">
              <Eyebrow className="mb-4">Weak Topics</Eyebrow>
              {weakTopics?.length > 0 ? (
                <ul className="space-y-3" role="list">
                  {weakTopics.slice(0, 3).map((t) => (
                    <li key={t.topic} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-2 truncate">{t.topic}</span>
                        <span className="font-mono text-accent tabular-nums">{t.mastery}%</span>
                      </div>
                      <div className="text-xs text-ink-3">
                        {t.mastery < 30 ? 'Revise fundamentals' : t.mastery < 50 ? 'Practice more problems' : 'Strengthen concepts'}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No weak topics"
                  description="You're performing well across all topics. Keep practicing to maintain your skills."
                />
              )}
              <Link to="/app/dsa" className="mt-4 inline-block text-xs text-brand hover:underline">
                View all topics →
              </Link>
            </Card>
          </div>
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}