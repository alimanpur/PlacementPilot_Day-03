import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { ReadinessDial, ReadinessBars, ConsistencyHeatmap, TrajectoryRow, Spark } from '@/components/charts/instruments'
import {
  useAnalyticsOverview,
  useReadiness,
  useApplicationStats,
  useApplicationTrends,
  useApplicationFunnel,
  useApplicationSources,
  useStageDistribution,
  useOfferConversion,
  useCompanyAnalytics,
  useIndustryDistribution,
  useLocationDistribution,
  useEligibilityAnalysis,
  useInterviewStats,
  useInterviewTrends,
  useInterviewTypeDistribution,
  useUpcomingSchedule,
  useDsaOverview,
  useDsaDifficultyBreakdown,
  useDsaTopicMastery,
  useDsaTrends,
  usePlannerOverview,
  usePlannerAnalytics,
  useInsights,
  useRecommendations,
  useWeeklyReport,
  useMonthlyReport,
  usePlacementReport,
  useWeeklyTrend,
  useHeatmap,
} from '@/hooks/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Lightbulb,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'applications', label: 'Applications', icon: Target },
  { id: 'companies', label: 'Companies', icon: TrendingUp },
  { id: 'interviews', label: 'Interviews', icon: Calendar },
  { id: 'dsa', label: 'DSA', icon: CheckCircle2 },
  { id: 'planner', label: 'Planner', icon: Lightbulb },
  { id: 'insights', label: 'Insights', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
]

function KPICard({ label, value, delta, tone = 'muted' }) {
  const toneColors = {
    brand: 'text-brand',
    accent: 'text-accent',
    danger: 'text-red-400',
    muted: 'text-ink-2',
  }
  return (
    <Card>
      <div className="text-xs text-ink-4 uppercase tracking-widest mb-2">{label}</div>
      <div className={cn('text-2xl font-display font-semibold tabular-nums', toneColors[tone] || toneColors.muted)}>
        {typeof value === 'number' ? value.toLocaleString() : value || '—'}
      </div>
      {delta && <div className="text-xs text-ink-4 mt-1">{delta}</div>}
    </Card>
  )
}

function Section({ eyebrow, title, children, className }) {
  return (
    <motion.div variants={staggerItem} className={cn('space-y-4', className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        {title && <h3 className="font-display text-lg text-ink">{title}</h3>}
      </div>
      {children}
    </motion.div>
  )
}

function OverviewTab() {
  const { data: overview, isLoading } = useAnalyticsOverview()
  const { data: readiness } = useReadiness()
  const { data: trend } = useWeeklyTrend(12)
  const { data: heatmap } = useHeatmap(84)

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  const codingValues = trend?.map((w) => w.problems) || []
  const interviewValues = trend?.map((w) => w.interviews) || []
  const appValues = trend?.map((w) => w.applications) || []

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Readiness" value={`${readiness?.overall || 0}%`} delta="Placement score" tone={readiness?.overall >= 60 ? 'brand' : 'accent'} />
          <KPICard label="Applications" value={overview?.applications?.total || 0} delta={`${overview?.applications?.offers || 0} offers`} tone="brand" />
          <KPICard label="Interviews" value={overview?.interviews?.total || 0} delta={`${overview?.interviews?.passRate || 0}% pass rate`} tone="accent" />
          <KPICard label="DSA solved" value={overview?.dsa?.totalSolved || 0} delta={`${overview?.dsa?.completionRate || 0}% completion`} tone="brand" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Readiness</Eyebrow>
            <div className="flex flex-col items-center">
              <ReadinessDial value={readiness?.overall || 0} size={180} />
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <Eyebrow className="mb-4">Breakdown</Eyebrow>
            <ReadinessBars
              items={[
                { label: 'Coding', value: readiness?.coding || 0 },
                { label: 'Interview readiness', value: readiness?.interviewReadiness || 0 },
                { label: 'Goal progress', value: readiness?.goalReadiness || 0 },
                { label: 'Profile', value: readiness?.profileScore || 0 },
              ]}
            />
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Coding heatmap · last 12 weeks</Eyebrow>
          <ConsistencyHeatmap data={heatmap || []} cols={14} />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          ['Coding velocity', 'Problems per week', codingValues],
          ['Interviews per week', 'Interview volume', interviewValues],
          ['Applications sent', 'Weekly volume', appValues],
        ].map(([title, desc, values]) => (
          <motion.div key={title} variants={staggerItem}>
            <Card>
              <Eyebrow>{title}</Eyebrow>
              <p className="text-xs text-ink-4 mt-1">{desc}</p>
              <div className="mt-6">
                <Spark values={values || []} className="h-16" />
              </div>
              <div className="mt-4 flex justify-between text-[10px] font-mono text-ink-4 uppercase tracking-widest">
                <span>12w ago</span>
                <span>Today</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ApplicationsTab() {
  const { data: stats } = useApplicationStats()
  const { data: trends } = useApplicationTrends(6)
  const { data: funnel } = useApplicationFunnel()
  const { data: sources } = useApplicationSources()
  const { data: stages } = useStageDistribution()
  const { data: conversion } = useOfferConversion()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total applications" value={stats?.total || 0} tone="brand" />
          <KPICard label="Offers" value={stats?.offers || 0} delta={conversion ? `${conversion.rate}% conversion` : ''} tone="brand" />
          <KPICard label="In progress" value={stats?.inProgress || 0} tone="accent" />
          <KPICard label="Hot leads" value={stats?.hot || 0} tone="brand" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Pipeline funnel</Eyebrow>
            <div className="space-y-3">
              {funnel?.map((item) => {
                const maxCount = Math.max(...(funnel?.map((f) => f.count) || [1]))
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-2">{item.label}</span>
                      <span className="font-mono text-ink-4 tabular-nums">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Monthly trends</Eyebrow>
            <div className="space-y-3">
              {trends?.map((t) => (
                <div key={t.month} className="flex items-center gap-4">
                  <span className="w-20 text-xs text-ink-3 shrink-0">{t.month}</span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${t.applied > 0 ? Math.min(100, t.applied * 10) : 0}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-ink-3 tabular-nums">{t.applied}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Stage distribution</Eyebrow>
            <div className="space-y-2">
              {stages?.map((s) => {
                const total = stages?.reduce((a, b) => a + b.count, 0) || 1
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-ink-2 truncate">{s._id?.replace(/_/g, ' ') || s._id}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${(s.count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-3 tabular-nums">{s.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Application sources</Eyebrow>
            <div className="space-y-2">
              {sources?.map((s) => {
                const total = sources?.reduce((a, b) => a + b.count, 0) || 1
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-ink-2 truncate">{s._id || 'Other'}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: `${(s.count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-3 tabular-nums">{s.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function CompaniesTab() {
  const { data: analytics } = useCompanyAnalytics()
  const { data: industry } = useIndustryDistribution()
  const { data: location } = useLocationDistribution()
  const { data: eligibility } = useEligibilityAnalysis()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total companies" value={analytics?.stats?.total || 0} tone="brand" />
          <KPICard label="Active hiring" value={analytics?.stats?.active || 0} tone="accent" />
          <KPICard label="With offers" value={analytics?.stats?.withOffers || 0} tone="brand" />
          <KPICard label="Industries" value={industry?.length || 0} tone="muted" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Industry distribution</Eyebrow>
            <div className="space-y-2">
              {industry?.map((item) => {
                const total = industry?.reduce((a, b) => a + b.count, 0) || 1
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-ink-2 truncate">{item._id}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: `${(item.count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-3 tabular-nums">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Location distribution</Eyebrow>
            <div className="space-y-2">
              {location?.map((item) => {
                const total = location?.reduce((a, b) => a + b.count, 0) || 1
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-ink-2 truncate">{item._id}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${(item.count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-3 tabular-nums">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Eligibility analysis</Eyebrow>
          <div className="space-y-3">
            {eligibility?.map((company) => (
              <TrajectoryRow
                key={company.name}
                code={company.name}
                progress={company.matchScore}
                stage={company.matchScore >= 60 ? 'Ready' : 'Prepare'}
                tone={company.matchScore >= 60 ? 'brand' : company.matchScore >= 30 ? 'accent' : 'muted'}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function InterviewsTab() {
  const { data: stats } = useInterviewStats()
  const { data: trends } = useInterviewTrends(6)
  const { data: types } = useInterviewTypeDistribution()
  const { data: schedule } = useUpcomingSchedule()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total interviews" value={stats?.total || 0} tone="brand" />
          <KPICard label="Upcoming" value={stats?.upcoming || 0} tone="accent" />
          <KPICard label="Completed" value={stats?.completed || 0} tone="brand" />
          <KPICard label="Pass rate" value={`${stats?.passRate || 0}%`} delta={`${stats?.passed || 0} passed`} tone={stats?.passRate >= 60 ? 'brand' : 'accent'} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Interview trends</Eyebrow>
            <div className="space-y-3">
              {trends?.map((t) => (
                <div key={t.month} className="flex items-center gap-4">
                  <span className="w-20 text-xs text-ink-3 shrink-0">{t.month}</span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${t.completed > 0 ? Math.min(100, t.completed * 20) : 0}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-ink-3 tabular-nums">{t.completed}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Interview types</Eyebrow>
            <div className="space-y-2">
              {types?.map((item) => {
                const total = types?.reduce((a, b) => a + b.count, 0) || 1
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-ink-2 truncate">{item._id?.replace(/_/g, ' ') || item._id}</span>
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${(item.count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-3 tabular-nums">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Upcoming schedule</Eyebrow>
          <div className="space-y-3">
            {schedule?.map((interview) => (
              <div key={interview._id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-ink">{interview.company}</div>
                  <div className="text-xs text-ink-3">{interview.type?.replace(/_/g, ' ')} · {interview.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-2">{format(new Date(interview.scheduledDate), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-ink-3">{interview.scheduledTime}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function DsaTab() {
  const { data: overview } = useDsaOverview()
  const { data: breakdown } = useDsaDifficultyBreakdown()
  const { data: topics } = useDsaTopicMastery()
  const { data: trends } = useDsaTrends(6)

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Problems solved" value={overview?.totalSolved || 0} tone="brand" />
          <KPICard label="Total problems" value={overview?.totalProblems || 0} tone="muted" />
          <KPICard label="Completion rate" value={`${overview?.completionRate || 0}%`} tone="brand" />
          <KPICard label="Avg mastery" value={`${overview?.avgMastery || 0}%`} tone="accent" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Difficulty breakdown</Eyebrow>
            <div className="space-y-2">
              {breakdown?.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-ink-2 capitalize">{item._id}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${item.total > 0 ? (item.solved / item.total) * 100 : 0}%` }} />
                  </div>
                  <span className="w-16 text-right font-mono text-xs text-ink-3 tabular-nums">{item.solved}/{item.total}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Monthly trends</Eyebrow>
            <div className="space-y-3">
              {trends?.map((t) => (
                <div key={t.month} className="flex items-center gap-4">
                  <span className="w-20 text-xs text-ink-3 shrink-0">{t.month}</span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${t.solved > 0 ? Math.min(100, t.solved * 5) : 0}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-ink-3 tabular-nums">{t.solved}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Topic mastery</Eyebrow>
          <div className="space-y-3">
            {topics?.map((topic) => (
              <TrajectoryRow
                key={topic.topic}
                code={topic.topic}
                progress={topic.mastery}
                stage={`${topic.solved}/${topic.total}`}
                tone={topic.mastery >= 70 ? 'brand' : topic.mastery >= 40 ? 'accent' : 'muted'}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function PlannerTab() {
  const { data: overview } = usePlannerOverview()
  const { data: plannerAnalytics } = usePlannerAnalytics()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total tasks" value={overview?.totalTasks || 0} tone="brand" />
          <KPICard label="Completed today" value={overview?.completedToday || 0} tone="brand" />
          <KPICard label="Completion rate" value={`${overview?.completionRate || 0}%`} tone="accent" />
          <KPICard label="Active habits" value={overview?.activeHabits || 0} tone="muted" />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Weekly productivity</Eyebrow>
          <div className="space-y-3">
            {plannerAnalytics?.productivityTrends?.map((week) => (
              <div key={week.week} className="flex items-center gap-4">
                <span className="w-12 text-xs text-ink-3 shrink-0">W{week.week}</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-brand" style={{ width: `${week.rate}%` }} />
                </div>
                <span className="w-16 text-right font-mono text-xs text-ink-3 tabular-nums">{week.completed}/{week.created}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function InsightsTab() {
  const { data: insights } = useInsights()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <Eyebrow className="mb-4">Cross-module insights</Eyebrow>
        <p className="text-sm text-ink-3 mb-6">Data-driven observations from your applications, interviews, DSA, and planner activity.</p>
      </motion.div>
      <div className="space-y-4">
        {insights?.map((insight) => (
          <motion.div key={insight.title} variants={staggerItem}>
            <Card className={cn(
              'border-l-4',
              insight.type === 'opportunity' && 'border-l-brand',
              insight.type === 'warning' && 'border-l-orange-400',
              insight.type === 'action' && 'border-l-accent',
              insight.type === 'success' && 'border-l-green-400',
            )}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {insight.type === 'opportunity' && <ArrowUpRight className="size-5 text-brand" />}
                  {insight.type === 'warning' && <AlertTriangle className="size-5 text-orange-400" />}
                  {insight.type === 'action' && <Lightbulb className="size-5 text-accent" />}
                  {insight.type === 'success' && <CheckCircle2 className="size-5 text-green-400" />}
                </div>
                <div>
                  <div className="font-medium text-ink">{insight.title}</div>
                  <div className="text-sm text-ink-3 mt-1">{insight.message}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function RecommendationsTab() {
  const { data: recommendations } = useRecommendations()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <Eyebrow className="mb-4">Recommendations</Eyebrow>
        <p className="text-sm text-ink-3 mb-6">Actionable next steps based on your current placement data.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations?.map((rec) => (
          <motion.div key={rec.title} variants={staggerItem}>
            <Card>
              <div className="flex items-start justify-between mb-2">
                <StatusPill tone={rec.priority === 'high' ? 'brand' : rec.priority === 'medium' ? 'accent' : 'muted'}>
                  {rec.priority}
                </StatusPill>
                <span className="text-[10px] font-mono text-ink-4 uppercase tracking-widest">{rec.type}</span>
              </div>
              <div className="font-medium text-ink mb-1">{rec.title}</div>
              <div className="text-sm text-ink-3 mb-3">{rec.description}</div>
              <Button variant="secondary" size="sm">{rec.action}</Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ReportsTab() {
  const { data: weekly } = useWeeklyReport()
  const { data: monthly } = useMonthlyReport()
  const { data: placement } = usePlacementReport()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard label="Weekly applications" value={weekly?.summary?.applications || 0} tone="brand" />
          <KPICard label="Monthly applications" value={monthly?.summary?.applications || 0} tone="accent" />
          <KPICard label="Readiness score" value={`${placement?.readiness?.overall || 0}%`} tone="brand" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: 'Weekly report', data: weekly, period: weekly?.period },
          { label: 'Monthly report', data: monthly, period: monthly?.period },
          { label: 'Placement report', data: placement },
        ].map((report) => (
          <motion.div key={report.label} variants={staggerItem}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <Eyebrow>{report.label}</Eyebrow>
                {report.period && (
                  <span className="text-[10px] font-mono text-ink-4">
                    {format(new Date(report.period.start), 'MMM d')} - {format(new Date(report.period.end), 'MMM d')}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-3">Applications</span>
                  <span className="font-mono text-ink tabular-nums">{report.data?.summary?.applications || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-3">Interviews</span>
                  <span className="font-mono text-ink tabular-nums">{report.data?.summary?.interviews || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-3">DSA solved</span>
                  <span className="font-mono text-ink tabular-nums">{report.data?.summary?.dsaProblems || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-3">Tasks</span>
                  <span className="font-mono text-ink tabular-nums">{report.data?.summary?.tasks || 0}</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                <Download className="size-3 mr-2" /> Export JSON
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Signal analytics"
          title="Analytics"
          meta="Placement intelligence across every module."
        />
        <PageBody>
          <div className="flex gap-1 border-b border-hairline mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
                  activeTab === tab.id
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-3 hover:text-ink-2',
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'applications' && <ApplicationsTab />}
          {activeTab === 'companies' && <CompaniesTab />}
          {activeTab === 'interviews' && <InterviewsTab />}
          {activeTab === 'dsa' && <DsaTab />}
          {activeTab === 'planner' && <PlannerTab />}
          {activeTab === 'insights' && <InsightsTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
