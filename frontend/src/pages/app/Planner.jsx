import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import {
  usePlannerTasks,
  usePlannerCalendar,
  useTodayFocus,
  useCreatePlannerTask,
  useMarkPlannerTaskComplete,
  useBulkUpdatePlannerTasks,
  usePlannerHabits,
  useCreatePlannerHabit,
  useCompletePlannerHabit,
  usePlannerGoals,
  useCreatePlannerGoal,
  usePlannerAnalytics,
  usePlannerStats,
  useGenerateSmartTasks,
  useSmartTasks,
} from '@/hooks/api'
import { cn } from '@/lib/utils'
import { format, subWeeks, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'habits', label: 'Habits' },
  { id: 'goals', label: 'Goals' },
  { id: 'analytics', label: 'Analytics' },
]

const CATEGORIES = [
  { value: 'placement', label: 'Placement', color: 'bg-brand' },
  { value: 'interview_prep', label: 'Interview Prep', color: 'bg-accent' },
  { value: 'dsa', label: 'DSA', color: 'bg-blue-500' },
  { value: 'projects', label: 'Projects', color: 'bg-purple-500' },
  { value: 'resume', label: 'Resume', color: 'bg-green-500' },
  { value: 'applications', label: 'Applications', color: 'bg-orange-500' },
  { value: 'mock_interview', label: 'Mock Interview', color: 'bg-pink-500' },
  { value: 'revision', label: 'Revision', color: 'bg-yellow-500' },
  { value: 'personal', label: 'Personal', color: 'bg-gray-500' },
  { value: 'custom', label: 'Custom', color: 'bg-ink-3' },
]

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

function PriorityDot({ priority }) {
  const colors = { low: 'bg-gray-400', medium: 'bg-blue-400', high: 'bg-orange-400', urgent: 'bg-red-500' }
  return <span className={cn('size-2 rounded-full', colors[priority] || 'bg-gray-400')} aria-hidden="true" />
}

export default function Planner() {
  const [activeTab, setActiveTab] = useState('today')
  const generateSmartTasksMutation = useGenerateSmartTasks()

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Adaptive planner"
          title="Planner"
          meta="Your personal placement operating system."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => generateSmartTasksMutation.mutate()}>
                Sync All
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('tasks')}>
                + Task
              </Button>
            </div>
          }
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

          {activeTab === 'today' && <TodayTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'habits' && <HabitsTab />}
          {activeTab === 'goals' && <GoalsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}

function TodayTab() {
  const { data: focus, isLoading } = useTodayFocus()
  const { data: smartTasks } = useSmartTasks()
  const completeMutation = useMarkPlannerTaskComplete()

  if (isLoading && !focus) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  const completionPct = focus?.totalTasks > 0 ? Math.round((focus?.completedToday / focus?.totalTasks) * 100) : 0

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Completed today" value={focus?.completedToday || 0} delta={`${completionPct}% of ${focus?.totalTasks || 0} tasks`} />
          <StatCard label="Overdue" value={focus?.overdue?.length || 0} delta="Needs attention" tone={focus?.overdue?.length > 0 ? 'danger' : 'brand'} />
          <StatCard label="Upcoming" value={focus?.upcomingDeadlines?.length || 0} delta="Next 5 days" />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Priority queue</Eyebrow>
          <div className="space-y-2">
            {focus?.priorityQueue?.length === 0 && <EmptyState icon="" title="All caught up" description="No pending tasks for today." />}
            {focus?.priorityQueue?.map((task) => (
              <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 hover:bg-surface-2/80 transition">
                <PriorityDot priority={task.priority} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{task.title}</div>
                  <div className="text-xs text-ink-3">{task.category} · {task.estimatedTime ? `${task.estimatedTime}m` : 'No estimate'}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => completeMutation.mutate(task._id)} loading={completeMutation.isPending}>
                  Done
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Smart tasks</Eyebrow>
          <div className="space-y-2">
            {smartTasks?.length === 0 && <EmptyState icon="" title="No smart tasks" description="Click Sync All to generate tasks from your interviews, DSA, and applications." />}
            {smartTasks?.map((task) => (
              <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{task.title}</div>
                  <div className="text-xs text-ink-3">{task.linkedType} · {task.linkedModule}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function TasksTab() {
  const [showForm, setShowForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    linkedModule: '',
    tags: '',
  })
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'custom',
    estimatedTime: 60,
    dueDate: new Date(),
    startDate: new Date(),
  })

  const { data: tasksData } = usePlannerTasks(filters)
  const createMutation = useCreatePlannerTask()
  const bulkMutation = useBulkUpdatePlannerTasks()
  const markCompleteMutation = useMarkPlannerTaskComplete()

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate(form, {
      onSuccess: () => {
        setForm({ title: '', description: '', priority: 'medium', category: 'custom', estimatedTime: 60, dueDate: new Date(), startDate: new Date() })
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
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            + Task
          </Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <Eyebrow className="mb-4">Create new task</Eyebrow>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
                required
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <Button type="submit" variant="primary" loading={createMutation.isPending}>Save</Button>
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
                  <th className="p-3">Task</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {tasksData?.tasks?.map((task) => (
                  <tr key={task._id} className="hover:bg-surface-2 transition">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(task._id)}
                        onChange={() => toggleSelect(task._id)}
                        className="rounded border-hairline"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-ink">{task.title}</div>
                      <div className="text-xs text-ink-3">{task.description ? task.description.substring(0, 60) : ''}</div>
                    </td>
                    <td className="p-3">
                      <StatusPill tone="muted">{task.category?.replace('_', ' ')}</StatusPill>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <PriorityDot priority={task.priority} />
                        <span className="text-ink-2 capitalize">{task.priority}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusPill tone={task.status === 'completed' ? 'brand' : task.status === 'overdue' ? 'danger' : 'muted'}>
                        {task.status?.replace('_', ' ')}
                      </StatusPill>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => markCompleteMutation.mutate(task._id)} loading={markCompleteMutation.isPending}>
                        Done
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!tasksData?.tasks?.length && (
              <EmptyState icon="📝" title="No tasks found" description="Create your first task to get started." />
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const { data: events } = usePlannerCalendar(monthStart.toISOString(), monthEnd.toISOString())

  const eventsByDate = useMemo(() => {
    const map = {}
    events?.forEach((event) => {
      const dateStr = format(new Date(event.start), 'yyyy-MM-dd')
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(event)
    })
    return map
  }, [events])

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(subWeeks(currentMonth, 1))}>← Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(addWeeks(currentMonth, 1))}>Next →</Button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-hairline">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-3 text-center text-xs font-medium text-ink-3 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDate[dateStr] || []
              const isCurrentDay = isToday(day)
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'min-h-[100px] p-2 border-r border-b border-hairline last:border-r-0 transition',
                    isCurrentDay && 'bg-brand/5',
                  )}
                >
                  <div className={cn('text-sm font-medium mb-1', isCurrentDay ? 'text-brand' : 'text-ink-2')}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div key={i} className="text-[10px] p-1 rounded bg-brand/10 text-brand truncate">
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-ink-3">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function HabitsTab() {
  const { data: habits } = usePlannerHabits()
  const createMutation = useCreatePlannerHabit()
  const completeMutation = useCompletePlannerHabit()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'dsa', frequency: 'daily', target: 1, unit: 'times' })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    createMutation.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ name: '', category: 'dsa', frequency: 'daily', target: 1, unit: 'times' }) } })
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-between items-center">
        <Eyebrow>Habit tracker</Eyebrow>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>New Habit</Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Habit name"
                required
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 1 })}
                placeholder="Target"
                min="1"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Button type="submit" variant="primary" loading={createMutation.isPending}>Create</Button>
            </form>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits?.map((habit) => (
            <Card key={habit._id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-ink">{habit.name}</h4>
                  <p className="text-xs text-ink-3 mt-1">{habit.category} · {habit.frequency}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display text-ink">{habit.streak}d</div>
                  <div className="text-[10px] text-ink-3">streak</div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${habit.completionRate}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-3">{habit.completionRate}% completion</span>
                <Button variant="secondary" size="sm" onClick={() => completeMutation.mutate({ id: habit._id, date: new Date() })} loading={completeMutation.isPending}>
                  Complete
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {!habits?.length && <EmptyState icon="🎯" title="No habits yet" description="Create a habit to start tracking your daily consistency." />}
      </motion.div>
    </motion.div>
  )
}

function GoalsTab() {
  const { data: goals } = usePlannerGoals()
  const createMutation = useCreatePlannerGoal()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'custom', target: 0, unit: '', deadline: new Date() })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ title: '', category: 'custom', target: 0, unit: '', deadline: new Date() }) } })
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>New Goal</Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Goal title"
                required
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="target_company">Target Company</option>
                <option value="solved_problems">Solved Problems</option>
                <option value="interview">Interview</option>
                <option value="application">Application</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 0 })}
                placeholder="Target"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="Unit (e.g., problems, interviews)"
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Button type="submit" variant="primary" loading={createMutation.isPending}>Create</Button>
            </form>
          </Card>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals?.map((goal) => (
            <Card key={goal._id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-ink">{goal.title}</h4>
                  <p className="text-xs text-ink-3 mt-1">{goal.category} · {goal.unit || 'progress'}</p>
                </div>
                <StatusPill tone={goal.status === 'completed' ? 'brand' : 'muted'}>{goal.status}</StatusPill>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${goal.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                <span>{goal.progress}%</span>
              </div>
            </Card>
          ))}
        </div>
        {!goals?.length && <EmptyState icon="🎯" title="No goals yet" description="Set goals to track your placement progress." />}
      </motion.div>
    </motion.div>
  )
}

function AnalyticsTab() {
  const { data: analytics } = usePlannerAnalytics()
  const { data: stats } = usePlannerStats()

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total tasks" value={stats?.totalTasks || 0} delta={`${stats?.completedToday || 0} completed today`} />
          <StatCard label="Completion rate" value={`${analytics?.completionRate || 0}%`} delta="Last 30 days" />
          <StatCard label="Active habits" value={stats?.activeHabits || 0} delta={`${stats?.activeGoals || 0} active goals`} />
          <StatCard label="Overdue" value={stats?.overdueCount || 0} delta="Needs attention" tone={stats?.overdueCount > 0 ? 'danger' : 'brand'} />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Productivity trends</Eyebrow>
          <div className="space-y-3">
            {analytics?.productivityTrends?.map((week) => (
              <div key={week.week} className="flex items-center gap-4">
                <span className="text-sm text-ink-2 w-12">W{week.week}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-brand transition-all" style={{ width: `${week.rate}%` }} />
                </div>
                <span className="text-xs text-ink-3 w-16 text-right">{week.completed}/{week.created}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Weekly report</Eyebrow>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-display text-ink">{analytics?.weeklyReport?.total || 0}</div>
              <div className="text-xs text-ink-3">Total tasks</div>
            </div>
            <div>
              <div className="text-2xl font-display text-ink">{analytics?.weeklyReport?.completed || 0}</div>
              <div className="text-xs text-ink-3">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-display text-ink">{analytics?.weeklyReport?.completionRate || 0}%</div>
              <div className="text-xs text-ink-3">Completion rate</div>
            </div>
            <div>
              <div className="text-2xl font-display text-ink">{analytics?.weeklyReport?.totalTime || 0}m</div>
              <div className="text-xs text-ink-3">Time spent</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, delta, tone = 'brand' }) {
  const colors = { brand: 'text-brand', accent: 'text-accent', danger: 'text-red-400', muted: 'text-ink-3' }
  return (
    <Card>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-display text-3xl text-ink mt-2 tabular-nums">{value}</div>
      <div className={cn('text-xs mt-1 font-mono', colors[tone])}>{delta}</div>
    </Card>
  )
}
