import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerItem } from '@/components/common/PageTransition'
import {
  useInterviews,
  useCreateInterview,
  useCompleteInterview,
  useCancelInterview,
  useSubmitInterviewFeedback,
  useInterviewDashboardStats,
} from '@/hooks/api'

const INTERVIEW_TYPES = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'recruiter_call', label: 'Recruiter Call' },
  { value: 'online_assessment_review', label: 'Online Assessment Review' },
  { value: 'technical_interview', label: 'Technical Interview' },
  { value: 'live_coding', label: 'Live Coding' },
  { value: 'system_design', label: 'System Design' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'hr', label: 'HR' },
  { value: 'final_round', label: 'Final Round' },
  { value: 'bar_raiser', label: 'Bar Raiser' },
  { value: 'group_discussion', label: 'Group Discussion' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'custom', label: 'Custom' },
]

const INTERVIEW_MODES = [
  { value: 'video_call', label: 'Video Call' },
  { value: 'phone', label: 'Phone' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'online', label: 'Online' },
]

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', tone: 'accent' },
  { value: 'rescheduled', label: 'Rescheduled', tone: 'warning' },
  { value: 'completed', label: 'Completed', tone: 'brand' },
  { value: 'cancelled', label: 'Cancelled', tone: 'danger' },
  { value: 'no_show', label: 'No Show', tone: 'danger' },
  { value: 'pending_feedback', label: 'Pending Feedback', tone: 'warning' },
]

const VIEW_OPTIONS = [
  { value: 'list', label: 'List', icon: '☰' },
  { value: 'kanban', label: 'Kanban', icon: '▦' },
  { value: 'calendar', label: 'Calendar', icon: '📅' },
  { value: 'timeline', label: 'Timeline', icon: '↕' },
]

function getStatusTone(status) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status)
  return opt?.tone || 'neutral'
}

function getTypeLabel(type) {
  const t = INTERVIEW_TYPES.find((t) => t.value === type)
  return t?.label || type?.replace(/_/g, ' ') || 'Unknown'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

function formatDateTime(date, time) {
  if (!date) return '—'
  return `${formatDate(date)} ${time ? formatTime(time) : ''}`
}

// ─── Create Interview Modal ─────────────────────────────────────────
function CreateInterviewModal({ isOpen, onClose }) {
  const createMutation = useCreateInterview()
  const [form, setForm] = useState({
    company: '',
    role: '',
    type: 'technical_interview',
    round: '',
    roundNumber: 1,
    mode: 'video_call',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meetingLink: '',
    meetingPlatform: 'google_meet',
    recruiterName: '',
    recruiterEmail: '',
    notes: '',
    priority: 'medium',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company || !form.round || !form.scheduledDate || !form.scheduledTime) {
      toast.error('Please fill in all required fields')
      return
    }
    createMutation.mutate(form, {
      onSuccess: () => {
        onClose()
        setForm({
          company: '',
          role: '',
          type: 'technical_interview',
          round: '',
          roundNumber: 1,
          mode: 'video_call',
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          meetingLink: '',
          meetingPlatform: 'google_meet',
          recruiterName: '',
          recruiterEmail: '',
          notes: '',
          priority: 'medium',
        })
      },
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface ring-hairline rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-hairline">
            <h2 className="font-display text-xl text-ink">Schedule Interview</h2>
            <p className="text-sm text-ink-3 mt-1">Fill in the details to schedule a new interview</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Company *</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Google"
                  required
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. SDE II"
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Round *</label>
                <input
                  type="text"
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value })}
                  placeholder="e.g. Technical Round 1"
                  required
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Round Number</label>
                <input
                  type="number"
                  value={form.roundNumber}
                  onChange={(e) => setForm({ ...form, roundNumber: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {INTERVIEW_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Date *</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  required
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Time *</label>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  required
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Duration (min)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
                  min="15"
                  step="15"
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Meeting Link</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Recruiter Name</label>
                <input
                  type="text"
                  value={form.recruiterName}
                  onChange={(e) => setForm({ ...form, recruiterName: e.target.value })}
                  placeholder="Recruiter name"
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Recruiter Email</label>
                <input
                  type="email"
                  value={form.recruiterEmail}
                  onChange={(e) => setForm({ ...form, recruiterEmail: e.target.value })}
                  placeholder="recruiter@company.com"
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
                Schedule Interview
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Interview Card ──────────────────────────────────────────────────
function InterviewCard({ interview, onAction }) {
  const navigate = useNavigate()
  const isUpcoming = ['scheduled', 'rescheduled'].includes(interview.status)
  const isPast = ['completed', 'cancelled', 'no_show'].includes(interview.status)

  return (
    <motion.div variants={staggerItem}>
      <Card className="group relative hover:ring-brand/30 transition-all duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusPill tone={getStatusTone(interview.status)}>
                {interview.status.replace(/_/g, ' ')}
              </StatusPill>
              {interview.priority === 'urgent' && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-500">Urgent</span>
              )}
              {interview.priority === 'high' && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-500">High</span>
              )}
            </div>
            <h3 className="font-display text-lg text-ink truncate">{interview.company}</h3>
            <p className="text-sm text-ink-3 mt-0.5">{interview.round}</p>
            {interview.role && (
              <p className="text-xs text-ink-4 mt-0.5">{interview.role}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] font-mono text-ink-4 uppercase tracking-widest">
              {formatDate(interview.scheduledDate)}
            </div>
            <div className="text-sm font-medium text-ink mt-0.5">
              {formatTime(interview.scheduledTime)}
            </div>
            <div className="text-[10px] text-ink-4 mt-0.5">
              {interview.duration} min
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[11px] font-mono text-ink-4 uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded-md">
            {getTypeLabel(interview.type)}
          </span>
          <span className="text-[11px] font-mono text-ink-4 uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded-md">
            {interview.mode?.replace(/_/g, ' ')}
          </span>
          {interview.interviewers?.length > 0 && (
            <span className="text-[11px] font-mono text-ink-4">
              {interview.interviewers.length} interviewer{interview.interviewers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {interview.preparation?.completionProgress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-ink-4 mb-1">
              <span>Preparation</span>
              <span>{interview.preparation.completionProgress}%</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{ width: `${interview.preparation.completionProgress}%` }}
              />
            </div>
          </div>
        )}

        {interview.feedback?.decision && (
          <div className="mt-3 pt-3 border-t border-hairline">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-4">Decision:</span>
              <StatusPill tone={
                interview.feedback.decision === 'selected' ? 'brand' :
                interview.feedback.decision === 'rejected' ? 'danger' :
                interview.feedback.decision === 'on_hold' ? 'warning' : 'neutral'
              }>
                {interview.feedback.decision.replace(/_/g, ' ')}
              </StatusPill>
              {interview.feedback.rating && (
                <span className="text-xs text-ink-4 ml-auto">
                  Rating: {interview.feedback.rating}/5
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-hairline">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/interviews/${interview._id}`)}
          >
            View Details
          </Button>
          {isUpcoming && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction?.('complete', interview)}
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction?.('cancel', interview)}
              >
                Cancel
              </Button>
            </>
          )}
          {isPast && !interview.feedback?.decision && interview.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction?.('feedback', interview)}
            >
              Add Feedback
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ─── List View ───────────────────────────────────────────────────────
function ListView({ interviews, onAction }) {
  if (!interviews?.length) {
    return (
      <Card>
        <div className="text-center py-12 text-ink-3 text-sm">
          No interviews found. Schedule your first interview to get started.
        </div>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
      <Card className="p-0 overflow-hidden min-w-[800px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left">
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Status</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Date</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Company</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Round</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Type</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Mode</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Result</th>
              <th className="eyebrow px-4 md:px-6 py-4 font-normal whitespace-nowrap" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((i) => (
              <tr
                key={i._id}
                className="border-b border-hairline hover:bg-surface-2 transition cursor-pointer"
                onClick={() => onAction?.('view', i)}
              >
                <td className="px-4 md:px-6 py-4">
                  <StatusPill tone={getStatusTone(i.status)}>
                    {i.status.replace(/_/g, ' ')}
                  </StatusPill>
                </td>
                <td className="px-4 md:px-6 py-4 font-mono text-xs text-ink-4 whitespace-nowrap">
                  {formatDateTime(i.scheduledDate, i.scheduledTime)}
                </td>
                <td className="px-4 md:px-6 py-4 text-ink font-medium whitespace-nowrap">{i.company}</td>
                <td className="px-4 md:px-6 py-4 text-ink-2">{i.round}</td>
                <td className="px-4 md:px-6 py-4 text-ink-3 whitespace-nowrap">{getTypeLabel(i.type)}</td>
                <td className="px-4 md:px-6 py-4 text-ink-3 capitalize">{i.mode?.replace(/_/g, ' ')}</td>
                <td className="px-4 md:px-6 py-4">
                  {i.result && i.result !== 'pending' ? (
                    <StatusPill tone={i.result === 'pass' ? 'brand' : i.result === 'fail' ? 'danger' : 'warning'}>
                      {i.result}
                    </StatusPill>
                  ) : (
                    <span className="text-ink-4 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onAction?.('view', i) }}
                      className="text-xs text-brand hover:text-brand-hover transition-colors px-2 py-1"
                    >
                      View
                    </button>
                    {['scheduled', 'rescheduled'].includes(i.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('complete', i) }}
                        className="text-xs text-green-500 hover:text-green-400 transition-colors px-2 py-1"
                      >
                        Done
                      </button>
                    )}
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

// ─── Kanban View ─────────────────────────────────────────────────────
function KanbanView({ interviews, onAction }) {
  const columns = [
    { key: 'scheduled', label: 'Scheduled', tone: 'accent' },
    { key: 'rescheduled', label: 'Rescheduled', tone: 'warning' },
    { key: 'completed', label: 'Completed', tone: 'brand' },
    { key: 'cancelled', label: 'Cancelled', tone: 'danger' },
  ]

  const grouped = useMemo(() => {
    const groups = {}
    columns.forEach((c) => { groups[c.key] = [] })
    interviews?.forEach((i) => {
      if (groups[i.status]) groups[i.status].push(i)
      else groups.scheduled.push(i)
    })
    return groups
  }, [interviews])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((col) => (
        <div key={col.key} className="min-w-[250px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full bg-${col.tone === 'accent' ? 'brand' : col.tone === 'warning' ? 'yellow-500' : col.tone === 'brand' ? 'green-500' : 'red-500'}`} />
              <h3 className="font-display text-sm text-ink">{col.label}</h3>
            </div>
            <span className="text-xs font-mono text-ink-4 bg-surface-2 px-2 py-0.5 rounded-full">
              {grouped[col.key]?.length || 0}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[col.key]?.map((i) => (
              <Card key={i._id} className="p-3 cursor-pointer hover:ring-brand/30 transition-all" onClick={() => onAction?.('view', i)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-sm text-ink truncate">{i.company}</h4>
                    <p className="text-[11px] text-ink-3 mt-0.5 truncate">{i.round}</p>
                  </div>
                  {i.priority === 'urgent' && <span className="text-[10px] text-red-500 flex-shrink-0">!!</span>}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-mono text-ink-4">{formatDate(i.scheduledDate)}</span>
                  <span className="text-[10px] font-mono text-ink-4">{formatTime(i.scheduledTime)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] font-mono text-ink-4 bg-surface-2 px-1.5 py-0.5 rounded">
                    {getTypeLabel(i.type)}
                  </span>
                </div>
              </Card>
            ))}
            {(!grouped[col.key] || grouped[col.key].length === 0) && (
              <div className="text-center py-8 text-xs text-ink-4">
                No interviews
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Calendar View ───────────────────────────────────────────────────
function CalendarView({ interviews, onAction }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthInterviews = useMemo(() => {
    const map = {}
    interviews?.forEach((i) => {
      if (!i.scheduledDate) return
      const d = new Date(i.scheduledDate)
      const key = d.getDate()
      if (!map[key]) map[key] = []
      map[key].push(i)
    })
    return map
  }, [interviews, currentMonth])

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>←</Button>
        <h3 className="font-display text-lg text-ink">{monthName}</h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>→</Button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-hairline rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-surface px-2 py-2 text-[10px] font-mono text-ink-4 text-center uppercase tracking-wider">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-surface-2/50 min-h-[80px] p-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()
          const dayInterviews = monthInterviews[day] || []
          return (
            <div
              key={day}
              className={`min-h-[80px] p-1.5 ${isToday ? 'bg-brand/5 ring-1 ring-brand/30' : 'bg-surface'} hover:bg-surface-2 transition cursor-pointer`}
              onClick={() => dayInterviews.length > 0 && onAction?.('view', dayInterviews[0])}
            >
              <div className={`text-xs font-mono mb-1 ${isToday ? 'text-brand font-bold' : 'text-ink-4'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayInterviews.slice(0, 3).map((iv) => (
                  <div
                    key={iv._id}
                    className="text-[9px] px-1 py-0.5 rounded truncate bg-brand/10 text-brand font-medium"
                    title={`${iv.company} - ${iv.round} ${formatTime(iv.scheduledTime)}`}
                  >
                    {iv.company}
                  </div>
                ))}
                {dayInterviews.length > 3 && (
                  <div className="text-[9px] text-ink-4 px-1">+{dayInterviews.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Timeline View ───────────────────────────────────────────────────
function TimelineView({ interviews, onAction }) {
  if (!interviews?.length) {
    return (
      <Card>
        <div className="text-center py-12 text-ink-3 text-sm">No interviews to show in timeline.</div>
      </Card>
    )
  }

  const sorted = [...interviews].sort((a, b) => new Date(b.scheduledDate || b.createdAt) - new Date(a.scheduledDate || a.createdAt))

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-hairline" />
      <div className="space-y-6">
        {sorted.map((i, idx) => (
          <motion.div
            key={i._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative pl-10"
          >
            <div className={`absolute left-2.5 top-2 size-3 rounded-full ring-2 ring-surface ${
              i.status === 'completed' ? 'bg-green-500' :
              i.status === 'cancelled' ? 'bg-red-500' :
              i.status === 'scheduled' ? 'bg-brand' :
              'bg-ink-4'
            }`} />
            <Card className="cursor-pointer hover:ring-brand/30 transition-all" onClick={() => onAction?.('view', i)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base text-ink">{i.company}</h3>
                    <StatusPill tone={getStatusTone(i.status)}>
                      {i.status.replace(/_/g, ' ')}
                    </StatusPill>
                  </div>
                  <p className="text-sm text-ink-3 mt-0.5">{i.round}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono text-ink-4">{formatDate(i.scheduledDate)}</div>
                  <div className="text-xs font-mono text-ink-4">{formatTime(i.scheduledTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-ink-4">{getTypeLabel(i.type)}</span>
                <span className="text-[11px] text-ink-4">·</span>
                <span className="text-[11px] text-ink-4 capitalize">{i.mode?.replace(/_/g, ' ')}</span>
                {i.feedback?.rating && (
                  <>
                    <span className="text-[11px] text-ink-4">·</span>
                    <span className="text-[11px] text-ink-4">Rating: {i.feedback.rating}/5</span>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Feedback Modal ──────────────────────────────────────────────────
function FeedbackModal({ isOpen, onClose, interview }) {
  const submitFeedbackMutation = useSubmitInterviewFeedback()
  const [form, setForm] = useState({
    rating: 3,
    difficulty: 'medium',
    questionsAsked: '',
    strengths: '',
    weaknesses: '',
    notes: '',
    decision: 'no_decision',
    nextRound: '',
    improvementNotes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!interview?._id) return
    submitFeedbackMutation.mutate({
      id: interview._id,
      data: {
        ...form,
        questionsAsked: form.questionsAsked ? form.questionsAsked.split('\n').filter(Boolean) : [],
      },
    }, {
      onSuccess: () => onClose(),
    })
  }

  if (!isOpen || !interview) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface ring-hairline rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-hairline">
            <h2 className="font-display text-xl text-ink">Submit Feedback</h2>
            <p className="text-sm text-ink-3 mt-1">{interview.company} - {interview.round}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Rating (1-5)</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="very_hard">Very Hard</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Decision</label>
              <select
                value={form.decision}
                onChange={(e) => setForm({ ...form, decision: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="no_decision">No Decision</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
                <option value="further_rounds">Further Rounds</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Questions Asked (one per line)</label>
              <textarea
                value={form.questionsAsked}
                onChange={(e) => setForm({ ...form, questionsAsked: e.target.value })}
                rows={3}
                placeholder="What questions were asked?"
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Strengths</label>
              <textarea
                value={form.strengths}
                onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                rows={2}
                placeholder="What went well?"
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Weaknesses</label>
              <textarea
                value={form.weaknesses}
                onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
                rows={2}
                placeholder="What could be improved?"
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Next Round</label>
              <input
                type="text"
                value={form.nextRound}
                onChange={(e) => setForm({ ...form, nextRound: e.target.value })}
                placeholder="e.g. Final Round"
                className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitFeedbackMutation.isPending}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function Interviews() {
  const [view, setView] = useState('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data: interviewsData, isLoading, error, refetch } = useInterviews({
    page: 1,
    limit: 100,
    status: filterStatus || undefined,
    type: filterType || undefined,
    search: searchQuery || undefined,
    sortBy: 'scheduledDate',
    sortOrder: 'asc',
  })

  const { data: stats } = useInterviewDashboardStats()
  const completeMutation = useCompleteInterview()
  const cancelMutation = useCancelInterview()

  const interviews = interviewsData?.interviews || []

  const handleAction = useCallback((action, interview) => {
    switch (action) {
      case 'view':
        navigate(`/app/interviews/${interview._id}`)
        break
      case 'complete':
        completeMutation.mutate(interview._id)
        break
      case 'cancel':
        cancelMutation.mutate({ id: interview._id, data: { reason: '' } })
        break
      case 'feedback':
        setSelectedInterview(interview)
        setShowFeedbackModal(true)
        break
      default:
        break
    }
  }, [navigate, completeMutation, cancelMutation])

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Debrief loop" title="Interviews" />
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
          <PageHeader eyebrow="Debrief loop" title="Interviews" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load interviews.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>Retry</Button>
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
          eyebrow="Debrief loop"
          title="Interviews"
          action={
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                + Schedule
              </Button>
            </div>
          }
        />

        <PageBody className="space-y-6">
          {/* Stats */}
          {stats?.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Total</p>
                <p className="font-display text-2xl text-ink mt-1">{stats.stats.total}</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Upcoming</p>
                <p className="font-display text-2xl text-brand mt-1">{stats.stats.upcoming}</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Today</p>
                <p className="font-display text-2xl text-green-500 mt-1">{stats.stats.today}</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Completed</p>
                <p className="font-display text-2xl text-ink mt-1">{stats.stats.completed}</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Pass Rate</p>
                <p className="font-display text-2xl text-green-500 mt-1">{stats.stats.passRate}%</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Avg Rating</p>
                <p className="font-display text-2xl text-ink mt-1">{stats.averageRating?.averageRating?.toFixed(1) || '0'}</p>
              </div>
              <div className="bg-surface ring-hairline rounded-xl p-4">
                <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider">Offer Rate</p>
                <p className="font-display text-2xl text-green-500 mt-1">{stats.offerConversion?.conversionRate || 0}%</p>
              </div>
            </div>
          )}

          {/* Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interviews..."
                className="bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand w-48"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">All Types</option>
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1">
              {VIEW_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setView(v.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    view === v.value
                      ? 'bg-surface text-ink shadow-sm'
                      : 'text-ink-4 hover:text-ink'
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Views */}
          {view === 'list' && <ListView interviews={interviews} onAction={handleAction} />}
          {view === 'kanban' && <KanbanView interviews={interviews} onAction={handleAction} />}
          {view === 'calendar' && <CalendarView interviews={interviews} onAction={handleAction} />}
          {view === 'timeline' && <TimelineView interviews={interviews} onAction={handleAction} />}
        </PageBody>

        {/* Modals */}
        <CreateInterviewModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => { setShowFeedbackModal(false); setSelectedInterview(null) }}
          interview={selectedInterview}
        />
      </AppShell>
    </PageTransition>
  )
}