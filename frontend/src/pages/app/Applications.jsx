import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import {
  Card,
  Eyebrow,
  StatusPill,
  EmptyState,
  PriorityPill,
  StagePill,
} from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
  useArchiveApplication,
  useBulkActionApplications,
  useUpcomingDeadlines,
  useNewApplicationStats,
} from '@/hooks/api'
import { cn, formatDate, getStageLabel } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Archive,
  Trash2,
  Copy,
  Edit,
  Eye,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Calendar,
  TrendingUp,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  Inbox,
  Target,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { PremiumKanbanColumn } from '@/components/applications/PremiumKanbanColumn'

const VIEW_MODES = ['kanban', 'table', 'list']

const STAGES = [
  { value: 'wishlist', label: 'Wishlist', color: 'neutral' },
  { value: 'ready_to_apply', label: 'Ready to Apply', color: 'accent' },
  { value: 'applied', label: 'Applied', color: 'brand' },
  { value: 'online_assessment', label: 'Online Assessment', color: 'warning' },
  { value: 'technical_interview', label: 'Technical Interview', color: 'accent' },
  { value: 'managerial_interview', label: 'Managerial Interview', color: 'accent' },
  { value: 'hr_interview', label: 'HR Interview', color: 'accent' },
  { value: 'offer', label: 'Offer', color: 'success' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'danger' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'neutral' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'neutral' },
  { value: 'medium', label: 'Medium', color: 'accent' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'urgent', label: 'Urgent', color: 'danger' },
]

const STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'on_hold', label: 'On Hold', color: 'neutral' },
  { value: 'completed', label: 'Completed', color: 'brand' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
]

export default function Applications() {
  const [view, setView] = useState('kanban')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    currentStage: '',
    priority: '',
    source: '',
    employmentType: '',
    workMode: '',
    location: '',
    tags: [],
    archived: false,
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useApplications({
    ...filters,
    search: searchQuery,
    sortBy,
    sortOrder,
    page,
    limit: 20,
  })

  const { data: deadlines } = useUpcomingDeadlines(5)
  const { data: stats } = useNewApplicationStats()
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()
  const deleteMutation = useDeleteApplication()
  const archiveMutation = useArchiveApplication()
  const bulkActionMutation = useBulkActionApplications()

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    department: '',
    jobId: '',
    employmentType: 'Full-time',
    workMode: 'Onsite',
    location: '',
    package: undefined,
    currency: 'INR',
    source: 'Other',
    recruiterName: '',
    recruiterEmail: '',
    recruiterLinkedIn: '',
    resumeVersion: '',
    coverLetter: '',
    portfolioLink: '',
    appliedDate: '',
    deadline: '',
    expectedJoining: '',
    reminderDate: '',
    priority: 'medium',
    currentStage: 'wishlist',
    status: 'active',
    notes: '',
    tags: [],
  })

  const applications = data?.applications || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.company || !formData.role) return

    createMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({
          company: '',
          role: '',
          department: '',
          jobId: '',
          employmentType: 'Full-time',
          workMode: 'Onsite',
          location: '',
          package: undefined,
          currency: 'INR',
          source: 'Other',
          recruiterName: '',
          recruiterEmail: '',
          recruiterLinkedIn: '',
          resumeVersion: '',
          coverLetter: '',
          portfolioLink: '',
          appliedDate: '',
          deadline: '',
          expectedJoining: '',
          reminderDate: '',
          priority: 'medium',
          currentStage: 'wishlist',
          status: 'active',
          notes: '',
          tags: [],
        })
        setShowCreateForm(false)
      },
    })
  }

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one application')
      return
    }

    bulkActionMutation.mutate(
      { ids: selectedIds, action, data: {} },
      {
        onSuccess: () => {
          setSelectedIds([])
          toast.success('Bulk action completed')
        },
      }
    )
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(applications.map((a) => a._id))
    }
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      currentStage: '',
      priority: '',
      source: '',
      employmentType: '',
      workMode: '',
      location: '',
      tags: [],
      archived: false,
    })
    setSearchQuery('')
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some((v) => {
    if (Array.isArray(v)) return v.length > 0
    return v !== '' && v !== false
  })

  const premiumStats = useMemo(() => {
    if (!stats) return []
    
    return [
      {
        label: 'Total Applications',
        value: stats.total || 0,
        icon: Briefcase,
        trend: 12,
        detail: `${stats.active || 0} active`,
      },
      {
        label: 'In Pipeline',
        value: (stats.applied || 0) + (stats.interviews || 0),
        icon: TrendingUp,
        trend: 8,
        detail: `${stats.interviews || 0} in interviews`,
      },
      {
        label: 'Offers Received',
        value: stats.offers || 0,
        icon: Check,
        trend: 25,
        detail: `${stats.accepted || 0} accepted`,
      },
      {
        label: 'Upcoming Deadlines',
        value: deadlines?.length || 0,
        icon: Calendar,
        detail: 'This week',
      },
    ]
  }, [stats, deadlines])

  const focusData = useMemo(() => {
    if (!stats || !deadlines) return null
    
    const upcomingInterviews = stats.interviews || 0
    const urgentDeadlines = deadlines.filter(d => {
      const days = Math.ceil((new Date(d.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      return days <= 7
    }).length

    if (upcomingInterviews > 0) {
      return {
        title: `${upcomingInterviews} Interview${upcomingInterviews !== 1 ? 's' : ''} This Week`,
        description: 'Prepare and practice your responses',
        action: 'View schedule →',
      }
    } else if (urgentDeadlines > 0) {
      return {
        title: `${urgentDeadlines} Urgent Deadline${urgentDeadlines !== 1 ? 's' : ''}`,
        description: 'Submit your applications soon',
        action: 'View deadlines →',
      }
    } else if (stats.wishlist > 0) {
      return {
        title: `${stats.wishlist} Application${stats.wishlist !== 1 ? 's' : ''} in Wishlist`,
        description: 'Start applying to move forward',
        action: 'View wishlist →',
      }
    }
    
    return null
  }, [stats, deadlines])

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Placement Pipeline" title="Applications" />
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
          <PageHeader eyebrow="Placement Pipeline" title="Applications" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="size-12 text-ink-4 mx-auto" />
              <p className="text-ink-3">Failed to load applications</p>
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
        <PageBody>
          {/* Premium Header with integrated actions */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Eyebrow className="mb-2">Placement Pipeline</Eyebrow>
                <h1 className="font-display text-4xl font-semibold text-ink mb-2">
                  Applications
                </h1>
                <p className="text-ink-3 text-lg">{`${total} active applications across ${STAGES.length} stages`}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="ring-hairline bg-surface rounded-md p-0.5 text-xs"
                  role="group"
                  aria-label="View toggle"
                >
                  {VIEW_MODES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      className={cn(
                        'px-3 py-1.5 rounded capitalize transition',
                        view === v
                          ? 'bg-surface-2 text-ink'
                          : 'text-ink-3 hover:text-ink'
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="size-4 mr-1.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1.5 size-2 rounded-full bg-brand" />
                  )}
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="size-4 mr-1.5" />
                  New Application
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {premiumStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-5 hover:ring-1 hover:ring-brand/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="size-10 rounded-lg bg-surface-2 flex items-center justify-center">
                        <stat.icon className="size-5 text-ink-3" />
                      </div>
                      {stat.trend && (
                        <span className={cn(
                          'text-xs font-mono flex items-center gap-0.5',
                          stat.trend > 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          <ArrowUpRight className="size-3" />
                          {Math.abs(stat.trend)}%
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-semibold text-ink font-display tabular-nums mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-ink-3">{stat.label}</div>
                    {stat.detail && (
                      <div className="text-xs text-ink-4 mt-1">{stat.detail}</div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Focus Section */}
            {focusData && (
              <Card className="mt-4 p-5 bg-gradient-to-br from-brand/5 to-accent/5 border-brand/20">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Target className="size-6 text-brand" />
                  </div>
                  <div className="flex-1">
                    <Eyebrow className="mb-1">Today's Focus</Eyebrow>
                    <h3 className="text-lg font-semibold text-ink mb-1">{focusData.title}</h3>
                    <p className="text-sm text-ink-3">{focusData.description}</p>
                    {focusData.action && (
                      <div className="mt-3">
                        <span className="text-xs text-brand font-medium">{focusData.action}</span>
                      </div>
                    )}
                  </div>
                  <Activity className="size-5 text-ink-4" />
                </div>
              </Card>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-4" />
                <input
                  type="text"
                  placeholder="Search company, role, recruiter, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-2 ring-hairline rounded-md pl-10 pr-4 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="createdAt">Created Date</option>
                <option value="company">Company</option>
                <option value="role">Role</option>
                <option value="priority">Priority</option>
                <option value="deadline">Deadline</option>
                <option value="appliedDate">Applied Date</option>
                <option value="package">Package</option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-ink-3 mb-1.5">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">All</option>
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-ink-3 mb-1.5">Stage</label>
                        <select
                          value={filters.currentStage}
                          onChange={(e) => setFilters({ ...filters, currentStage: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">All</option>
                          {STAGES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-ink-3 mb-1.5">Priority</label>
                        <select
                          value={filters.priority}
                          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">All</option>
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-ink-3 mb-1.5">Source</label>
                        <select
                          value={filters.source}
                          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">All</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Company Website">Company Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Job Portal">Job Portal</option>
                          <option value="Campus">Campus</option>
                          <option value="Recruiter">Recruiter</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="size-4 mr-1.5" />
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4"
              >
                <Card className="p-3 flex items-center justify-between">
                  <span className="text-sm text-ink">{selectedIds.length} selected</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleBulkAction('archive')}>
                      <Archive className="size-4 mr-1.5" />
                      Archive
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleBulkAction('delete')}>
                      <Trash2 className="size-4 mr-1.5" />
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          {applications.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-12" />}
              title="No applications yet"
              description="Track every placement application from one place. Start building your pipeline today."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="size-4 mr-1.5" />
                  Add First Application
                </Button>
              }
            />
          ) : view === 'kanban' ? (
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <div
                className="grid gap-4 min-w-[1200px] md:min-w-0"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
              >
                {STAGES.map((stage) => {
                  const stageApps = applications.filter((a) => a.currentStage === stage.value)
                  return (
                    <PremiumKanbanColumn
                      key={stage.value}
                      stage={stage}
                      applications={stageApps}
                      onUpdate={updateMutation.mutate}
                      onDelete={deleteMutation.mutate}
                      onArchive={archiveMutation.mutate}
                    />
                  )
                })}
              </div>
            </div>
          ) : view === 'table' ? (
            <TableView
              applications={applications}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
            />
          ) : (
            <ListView applications={applications} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-ink-3">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} applications
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Create Modal */}
          <AnimatePresence>
            {showCreateForm && (
              <CreateApplicationModal
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreate}
                onClose={() => setShowCreateForm(false)}
                isLoading={createMutation.isPending}
              />
            )}
          </AnimatePresence>
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}

function TableView({ applications, selectedIds, onToggleSelect, onToggleSelectAll }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === applications.length}
                  onChange={onToggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              {['Company', 'Role', 'Stage', 'Priority', 'Status', 'Package', 'Deadline', 'Actions'].map((h) => (
                <th key={h} className="eyebrow px-4 py-3 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-b border-hairline hover:bg-surface-2 transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(app._id)}
                    onChange={() => onToggleSelect(app._id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link to={`/app/applications/${app._id}`} className="text-ink font-medium hover:text-brand transition">
                    {app.company}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-3">{app.role}</td>
                <td className="px-4 py-3">
                  <StagePill stage={app.currentStage}>{getStageLabel(app.currentStage)}</StagePill>
                </td>
                <td className="px-4 py-3">
                  <PriorityPill priority={app.priority}>{app.priority}</PriorityPill>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={app.status === 'active' ? 'success' : 'neutral'}>
                    {getStatusLabel(app.status)}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 text-ink-3">
                  {app.package ? `${app.currency} ${app.package.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-ink-3">
                  {app.deadline ? formatDate(app.deadline) : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link to={`/app/applications/${app._id}`}>
                      <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function ListView({ applications }) {
  return (
    <div className="space-y-2">
      {applications.map((app) => (
        <Link
          key={app._id}
          to={`/app/applications/${app._id}`}
          className="block ring-hairline bg-surface rounded-lg p-4 hover:ring-brand/30 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-ink font-medium">{app.company}</h3>
                <PriorityPill priority={app.priority}>{app.priority}</PriorityPill>
                <StagePill stage={app.currentStage}>{getStageLabel(app.currentStage)}</StagePill>
              </div>
              <p className="text-sm text-ink-3 mb-2">{app.role}</p>
              <div className="flex items-center gap-4 text-xs text-ink-4">
                {app.package && <span>{app.currency} {app.package.toLocaleString()}</span>}
                {app.location && <span>{app.location}</span>}
                {app.workMode && <span>{app.workMode}</span>}
                {app.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(app.deadline)}
                  </span>
                )}
              </div>
            </div>
            <StatusPill tone={app.status === 'active' ? 'success' : 'neutral'}>
              {getStatusLabel(app.status)}
            </StatusPill>
          </div>
        </Link>
      ))}
    </div>
  )
}

function CreateApplicationModal({ formData, setFormData, onSubmit, onClose, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-hairline rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-hairline flex items-center justify-between">
          <Eyebrow>New Application</Eyebrow>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink mb-1.5">Company <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Role <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Job ID</label>
              <input
                type="text"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Package (CTC)</label>
              <input
                type="number"
                value={formData.package || ''}
                onChange={(e) =>
                  setFormData({ ...formData, package: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Company Website">Company Website</option>
                <option value="Referral">Referral</option>
                <option value="Job Portal">Job Portal</option>
                <option value="Campus">Campus</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Current Stage</label>
              <select
                value={formData.currentStage}
                onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Applied Date</label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Recruiter Name</label>
              <input
                type="text"
                value={formData.recruiterName}
                onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Recruiter Email</label>
              <input
                type="email"
                value={formData.recruiterEmail}
                onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isLoading}>
              Create Application
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}