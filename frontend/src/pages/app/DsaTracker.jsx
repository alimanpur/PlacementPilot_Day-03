import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { ConsistencyHeatmap, ReadinessBars, Spark } from '@/components/charts/instruments'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import {
  useDsaProblems,
  useLogDsaProblem,
  useBulkUpdateDsaProblems,
  useToggleDsaFavorite,
  useToggleDsaBookmark,
  useToggleDsaStar,
  useDsaDashboardStats,
  useDsaInsights,
  useDsaDailyRevisions,
  useDsaMissedRevisions,
  useCompleteDsaRevision,
  useSkipDsaRevision,
  useCreateDsaSession,
  useDsaSessions,
  useDsaRoadmaps,
  useCreateDsaRoadmap,
  useDsaHeatmap,
  useDsaStreak,
  useDsaWeakTopics,
  useDsaStrongTopics,
} from '@/hooks/api'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'problems', label: 'Problems' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'roadmaps', label: 'Roadmaps' },
  { id: 'revisions', label: 'Revisions' },
  { id: 'analytics', label: 'Analytics' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']
const STATUSES = ['not_started', 'started', 'solved', 'reviewed', 'mastered']
const PLATFORMS = ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'gfg', 'other']

function StatCard({ label, value, delta }) {
  return (
    <Card>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-display text-3xl text-ink mt-2 tabular-nums">{value}</div>
      <div className="text-xs text-brand mt-1 font-mono">{delta}</div>
    </Card>
  )
}

function ActionButton({ icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-md transition text-sm',
        active ? 'bg-brand/20 text-brand' : 'hover:bg-surface-2 text-ink-3',
      )}
    >
      {icon}
    </button>
  )
}

export default function DsaTracker() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Altitude mapping"
          title="DSA tracker"
          meta={`Adaptive review queue, roadmaps, and analytics.`}
        />
        <PageBody>
          <div className="flex gap-1 border-b border-hairline mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-3 hover:text-ink-2',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'problems' && <ProblemsTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'roadmaps' && <RoadmapsTab />}
          {activeTab === 'revisions' && <RevisionsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}

function DashboardTab() {
  const { data: stats } = useDsaDashboardStats()
  const { data: heatmap } = useDsaHeatmap(84)
  const { data: streakData } = useDsaStreak()
  const { data: weakTopics } = useDsaWeakTopics(3)

  const streak = streakData?.streak || streakData || 0
  const totalSolved = stats?.totalSolved || 0
  const weeklySolved = stats?.weeklySolved || 0

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total solved" value={`${totalSolved}`} delta={`${weeklySolved} this week`} />
          <StatCard label="Current streak" value={`${streak || 0}d`} delta={streak > 0 ? 'Active' : 'Start today'} />
          <StatCard label="Revision queue" value={`${stats?.revisionQueueCount || 0}`} delta="Pending revisions" />
          <StatCard label="Sessions" value={`${stats?.sessionsThisWeek || 0}`} delta="This week" />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Eyebrow>Practice consistency</Eyebrow>
              <h3 className="font-display text-lg text-ink font-medium mt-1">Signal strength</h3>
            </div>
            <StatusPill tone="brand">{streak || 0} day streak</StatusPill>
          </div>
          <ConsistencyHeatmap data={heatmap || []} />
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Weak topics</Eyebrow>
          <div className="space-y-3">
            {!weakTopics?.length && <EmptyState icon="🎯" title="No weak topics" description="Keep practicing to identify areas for improvement." />}
            {Array.isArray(weakTopics) && weakTopics.map((t) => (
              <div key={t.topic} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{t.topic}</div>
                  <div className="text-xs text-ink-3">{t.solved}/{t.total} solved</div>
                </div>
                <div className="text-sm font-mono text-ink-2">{t.mastery}%</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function ProblemsTab() {
  const [showForm, setShowForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    topic: '',
    status: '',
    platform: '',
    bookmarked: false,
    favorite: false,
    starred: false,
  })
  const [form, setForm] = useState({
    title: '',
    topic: '',
    difficulty: 'medium',
    platform: 'other',
    status: 'not_started',
  })

  const { data: problemsData } = useDsaProblems(filters)
  const logMutation = useLogDsaProblem()
  const bulkMutation = useBulkUpdateDsaProblems()

  const handleLog = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    logMutation.mutate(form, {
      onSuccess: () => {
        setForm({ title: '', topic: '', difficulty: 'medium', platform: 'other', status: 'not_started' })
        setShowForm(false)
      },
    })
  }

  const handleBulkDelete = () => {
    if (!selectedIds.length) return
    bulkMutation.mutate({ ids: selectedIds, action: 'delete' }, {
      onSuccess: () => setSelectedIds([]),
    })
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-ink-2">
            <input type="checkbox" checked={filters.favorite} onChange={(e) => setFilters({ ...filters, favorite: e.target.checked })} />
            Favorites
          </label>
          <label className="flex items-center gap-1.5 text-sm text-ink-2">
            <input type="checkbox" checked={filters.bookmarked} onChange={(e) => setFilters({ ...filters, bookmarked: e.target.checked })} />
            Bookmarked
          </label>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            Log problem
          </Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <Eyebrow className="mb-4">Log a new problem</Eyebrow>
            <form onSubmit={handleLog} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Problem title"
                required
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="Topic"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <Button type="submit" variant="primary" loading={logMutation.isPending}>Save</Button>
            </form>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-ink-3">
                  <th className="p-3 w-10" />
                  <th className="p-3">Problem</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {Array.isArray(problemsData?.problems) && problemsData.problems.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-2 transition">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="rounded border-hairline"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-ink">{p.title}</div>
                      <div className="text-xs text-ink-3">{p.platform}</div>
                    </td>
                    <td className="p-3 text-ink-2">{p.topic}</td>
                    <td className="p-3">
                      <StatusPill tone={p.difficulty === 'easy' ? 'brand' : p.difficulty === 'medium' ? 'accent' : 'danger'}>
                        {p.difficulty}
                      </StatusPill>
                    </td>
                    <td className="p-3">
                      <StatusPill tone={p.status === 'solved' ? 'brand' : p.status === 'mastered' ? 'brand' : 'muted'}>
                        {p.status.replace('_', ' ')}
                      </StatusPill>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <ActionButton icon="☆" onClick={() => useToggleDsaStar().mutate(p._id)} active={p.starred} />
                        <ActionButton icon="♡" onClick={() => useToggleDsaFavorite().mutate(p._id)} active={p.favorite} />
                        <ActionButton icon="🔖" onClick={() => useToggleDsaBookmark().mutate(p._id)} active={p.bookmarked} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!problemsData?.problems?.length && (
              <EmptyState icon="📝" title="No problems found" description="Log your first DSA problem to get started." />
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function SessionsTab() {
  const { data: sessionsData } = useDsaSessions()
  const startMutation = useCreateDsaSession()
  const [title, setTitle] = useState('')

  const handleStart = () => {
    startMutation.mutate({ title: title || 'Practice Session', startTime: new Date() }, {
      onSuccess: () => setTitle(''),
    })
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Practice session</Eyebrow>
              <h3 className="font-display text-lg text-ink font-medium mt-1">Start a new session</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Session title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Button variant="primary" size="sm" onClick={handleStart} loading={startMutation.isPending}>
                Start Session
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="p-0 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-hairline">
            <Eyebrow>Recent sessions</Eyebrow>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-ink-3">
                  <th className="p-3">Title</th>
                  <th className="p-3">Start</th>
                  <th className="p-3">End</th>
                  <th className="p-3">Solved</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Focus</th>
                  <th className="p-3">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {Array.isArray(sessionsData?.sessions) && sessionsData.sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-surface-2 transition">
                    <td className="p-3 font-medium text-ink">{s.title || 'Untitled'}</td>
                    <td className="p-3 text-ink-2">{new Date(s.startTime).toLocaleString()}</td>
                    <td className="p-3 text-ink-2">{s.endTime ? new Date(s.endTime).toLocaleString() : 'Active'}</td>
                    <td className="p-3 text-ink-2">{s.problemsSolved}/{s.problemsAttempted}</td>
                    <td className="p-3 text-ink-2">{s.accuracy ? `${s.accuracy}%` : '-'}</td>
                    <td className="p-3 text-ink-2">{s.focusScore ? `${s.focusScore}%` : '-'}</td>
                    <td className="p-3 text-ink-2">{s.mood || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!sessionsData?.sessions?.length && (
              <EmptyState icon="⏱️" title="No sessions yet" description="Start a practice session to track your performance." />
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function RoadmapsTab() {
  const { data: roadmaps } = useDsaRoadmaps()
  const createMutation = useCreateDsaRoadmap()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'custom', description: '', company: '' })

  const handleCreate = (e) => {
    e.preventDefault()
    createMutation.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ name: '', type: 'custom', description: '', company: '' }) } })
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>New Roadmap</Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <Eyebrow className="mb-4">Create roadmap</Eyebrow>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Roadmap name"
                required
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="blind75">Blind 75</option>
                <option value="neetCode150">NeetCode 150</option>
                <option value="striverSDE">Striver SDE Sheet</option>
                <option value="loveBabbar">Love Babbar Sheet</option>
                <option value="companySpecific">Company Specific</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company (optional)"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Button type="submit" variant="primary" loading={createMutation.isPending}>Create</Button>
            </form>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Array.isArray(roadmaps) ? roadmaps : []).map((r) => (
            <Card key={r._id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-ink">{r.name}</h4>
                  <p className="text-xs text-ink-3 mt-1">{r.type} {r.company ? `· ${r.company}` : ''}</p>
                </div>
                <StatusPill tone={r.isActive ? 'brand' : 'muted'}>{r.isActive ? 'Active' : 'Inactive'}</StatusPill>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${r.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span>{r.completedProblems}/{r.totalProblems} completed</span>
                <span>{r.progress}%</span>
              </div>
            </Card>
          ))}
        </div>
        {!roadmaps?.length && <EmptyState icon="🗺️" title="No roadmaps yet" description="Create a roadmap to track your progress." />}
      </motion.div>
    </motion.div>
  )
}

function RevisionsTab() {
  const { data: dailyRevisions } = useDsaDailyRevisions()
  const { data: missedRevisions } = useDsaMissedRevisions()
  const completeMutation = useCompleteDsaRevision()
  const skipMutation = useSkipDsaRevision()

  const revisions = useMemo(() => {
    const dailyList = Array.isArray(dailyRevisions)
      ? dailyRevisions
      : (dailyRevisions?.revisions || dailyRevisions?.data || [])
    const all = [...dailyList]
    missedRevisions?.forEach((r) => {
      if (!all.find((x) => x._id === r._id)) all.push(r)
    })
    return all.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [dailyRevisions, missedRevisions])

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Daily revision queue</Eyebrow>
          <div className="space-y-3">
            {revisions.length === 0 && <EmptyState icon="📚" title="No revisions due" description="Complete problems to generate revision schedule." />}
            {revisions.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div>
                  <div className="text-sm font-medium text-ink">{r.problemTitle}</div>
                  <div className="text-xs text-ink-3">{r.problemTopic} · Due {new Date(r.dueDate).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => skipMutation.mutate(r._id)}>Skip</Button>
                  <Button variant="primary" size="sm" onClick={() => completeMutation.mutate(r._id)} loading={completeMutation.isPending}>
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function AnalyticsTab() {
  const { data: insights } = useDsaInsights()
  const { data: weakTopics } = useDsaWeakTopics(5)
  const { data: strongTopics } = useDsaStrongTopics(5)

  const breakdown = useMemo(() => {
    const total = insights?.difficultyBreakdown?.total || 0
    const easy = insights?.difficultyBreakdown?.easy || 0
    const medium = insights?.difficultyBreakdown?.medium || 0
    const hard = insights?.difficultyBreakdown?.hard || 0
    return [
      { label: 'Easy', value: total > 0 ? Math.round((easy / total) * 100) : 0 },
      { label: 'Medium', value: total > 0 ? Math.round((medium / total) * 100) : 0 },
      { label: 'Hard', value: total > 0 ? Math.round((hard / total) * 100) : 0 },
    ]
  }, [insights])

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total solved" value={insights?.totalSolved || 0} delta={`${insights?.weeklySolved || 0} this week`} />
          <StatCard label="Current streak" value={`${insights?.streak || 0}d`} delta={`Longest: ${insights?.longestStreak || 0}d`} />
          <StatCard label="Acceptance rate" value={`${insights?.acceptanceRate || 0}%`} delta="Solved / total" />
          <StatCard label="Avg solve time" value={`${insights?.averageSolveTime || 0}m`} delta="Average" />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Difficulty distribution</Eyebrow>
          <ReadinessBars items={breakdown} />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Weak topics</Eyebrow>
          <div className="space-y-3">
            {!weakTopics?.length && <EmptyState icon="📉" title="No weak topics" description="Keep practicing." />}
            {Array.isArray(weakTopics) && weakTopics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <div className="text-sm text-ink">{t.topic}</div>
                  <div className="text-sm font-mono text-ink-2">{t.mastery}%</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Strong topics</Eyebrow>
          <div className="space-y-3">
            {!strongTopics?.length && <EmptyState icon="📈" title="No strong topics yet" description="Solve more problems to build strength." />}
            {Array.isArray(strongTopics) && strongTopics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <div className="text-sm text-ink">{t.topic}</div>
                  <div className="text-sm font-mono text-ink-2">{t.mastery}%</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Monthly trends</Eyebrow>
            <div className="space-y-3">
              {(Array.isArray(insights?.monthlyTrends) ? insights.monthlyTrends : []).map((t) => (
              <div key={t.month} className="flex items-center justify-between">
                <span className="text-sm text-ink-2 w-24">{t.month}</span>
                <div className="flex-1 mx-4">
                  <Spark values={[t.easy || 0, t.medium || 0, t.hard || 0, t.solved || 0]} />
                </div>
                <span className="text-sm font-mono text-ink w-12 text-right">{t.solved}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
