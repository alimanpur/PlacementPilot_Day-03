import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import {
  useInterview,
  useArchiveInterview,
  useCancelInterview,
  useCompleteInterview,
  useAddChecklistItem,
  useToggleChecklistItem,
  useRemoveChecklistItem,
  useUpdateInterviewPreparation,
  useAddInterviewer,
  useRemoveInterviewer,
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

function getTypeLabel(type) {
  const t = INTERVIEW_TYPES.find((t) => t.value === type)
  return t?.label || type?.replace(/_/g, ' ') || 'Unknown'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

function getStatusTone(status) {
  const tones = {
    scheduled: 'accent',
    rescheduled: 'warning',
    completed: 'brand',
    cancelled: 'danger',
    no_show: 'danger',
    pending_feedback: 'warning',
  }
  return tones[status] || 'neutral'
}

export default function InterviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: interview, isLoading, error, refetch } = useInterview(id)
  const archiveMutation = useArchiveInterview()
  const completeMutation = useCompleteInterview()
  const cancelMutation = useCancelInterview()
  const addChecklistMutation = useAddChecklistItem()
  const toggleChecklistMutation = useToggleChecklistItem()
  const removeChecklistMutation = useRemoveChecklistItem()
  const updatePrepMutation = useUpdateInterviewPreparation()
  const addInterviewerMutation = useAddInterviewer()
  const removeInterviewerMutation = useRemoveInterviewer()

  const [activeTab, setActiveTab] = useState('overview')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newInterviewer, setNewInterviewer] = useState({ name: '', email: '', role: '', linkedIn: '' })
  const [prepNotes, setPrepNotes] = useState('')

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Interviews" title="Loading..." />
          <PageBody>
            <div className="grid place-items-center min-h-[400px]">
              <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (error || !interview) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Interviews" title="Not Found" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Interview not found.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/interviews')}>Back to Interviews</Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'preparation', label: 'Preparation' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'interviewers', label: 'Interviewers' },
    { key: 'timeline', label: 'Timeline' },
  ]

  const isUpcoming = ['scheduled', 'rescheduled'].includes(interview.status)

  const handleComplete = () => {
    completeMutation.mutate(interview._id, {
      onSuccess: () => refetch(),
    })
  }

  const handleCancel = () => {
    cancelMutation.mutate({ id: interview._id, data: { reason: '' } }, {
      onSuccess: () => refetch(),
    })
  }

  const handleToggleChecklist = (itemId, completed) => {
    toggleChecklistMutation.mutate({
      id: interview._id,
      data: { itemId, completed: !completed },
    }, { onSuccess: () => refetch() })
  }

  const handleAddChecklist = (e) => {
    e.preventDefault()
    if (!newChecklistItem.trim()) return
    addChecklistMutation.mutate({
      id: interview._id,
      data: { item: newChecklistItem.trim() },
    }, {
      onSuccess: () => {
        setNewChecklistItem('')
        refetch()
      },
    })
  }

  const handleAddInterviewer = (e) => {
    e.preventDefault()
    if (!newInterviewer.name.trim()) return
    addInterviewerMutation.mutate({
      id: interview._id,
      data: newInterviewer,
    }, {
      onSuccess: () => {
        setNewInterviewer({ name: '', email: '', role: '', linkedIn: '' })
        refetch()
      },
    })
  }

  const checkedCount = interview.preparation?.checklist?.filter((c) => c.completed).length || 0
  const totalCount = interview.preparation?.checklist?.length || 0

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow={interview.company}
          title={interview.round}
          backTo="/app/interviews"
          action={
            <div className="flex items-center gap-2">
              {isUpcoming && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleComplete}>Mark Complete</Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => {
                archiveMutation.mutate({ id: interview._id, archived: !interview.archived }, {
                  onSuccess: () => navigate('/app/interviews'),
                })
              }}>
                {interview.archived ? 'Unarchive' : 'Archive'}
              </Button>
            </div>
          }
        />

        <PageBody>
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-surface-2 rounded-lg p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === tab.key
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-4 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <Eyebrow className="mb-4">Interview Details</Eyebrow>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Company</p>
                      <p className="text-ink font-medium">{interview.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Role</p>
                      <p className="text-ink font-medium">{interview.role || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-ink font-medium">{getTypeLabel(interview.type)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Round</p>
                      <p className="text-ink font-medium">{interview.round} (Round {interview.roundNumber || 1})</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Status</p>
                      <StatusPill tone={getStatusTone(interview.status)}>
                        {interview.status.replace(/_/g, ' ')}
                      </StatusPill>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Mode</p>
                      <p className="text-ink font-medium capitalize">{interview.mode?.replace(/_/g, ' ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Date</p>
                      <p className="text-ink font-medium">{formatDate(interview.scheduledDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-ink font-medium">{formatTime(interview.scheduledTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-ink font-medium">{interview.duration} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Timezone</p>
                      <p className="text-ink font-medium">{interview.timezone || 'UTC'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Priority</p>
                      <p className="text-ink font-medium capitalize">{interview.priority || 'medium'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Result</p>
                      <p className="text-ink font-medium capitalize">{interview.result || 'pending'}</p>
                    </div>
                  </div>
                </Card>

                {interview.meetingLink && (
                  <Card>
                    <Eyebrow className="mb-3">Meeting Details</Eyebrow>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Platform</p>
                        <p className="text-ink font-medium capitalize">{interview.meetingPlatform?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Link</p>
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline text-sm break-all">
                          {interview.meetingLink}
                        </a>
                      </div>
                      {interview.officeAddress && (
                        <div>
                          <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Address</p>
                          <p className="text-ink text-sm">{interview.officeAddress}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {interview.notes && (
                  <Card>
                    <Eyebrow className="mb-3">Notes</Eyebrow>
                    <p className="text-ink text-sm whitespace-pre-wrap">{interview.notes}</p>
                  </Card>
                )}

                {interview.tags?.length > 0 && (
                  <Card>
                    <Eyebrow className="mb-3">Tags</Eyebrow>
                    <div className="flex items-center gap-2 flex-wrap">
                      {interview.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-surface-2 text-ink-3 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Recruiter Info */}
                <Card>
                  <Eyebrow className="mb-3">Recruiter</Eyebrow>
                  {interview.recruiterName ? (
                    <div className="space-y-2">
                      <p className="text-ink font-medium">{interview.recruiterName}</p>
                      {interview.recruiterEmail && (
                        <p className="text-sm text-ink-3">{interview.recruiterEmail}</p>
                      )}
                      {interview.recruiterPhone && (
                        <p className="text-sm text-ink-3">{interview.recruiterPhone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-3">No recruiter assigned</p>
                  )}
                </Card>

                {/* Stats Card */}
                <Card>
                  <Eyebrow className="mb-3">Quick Stats</Eyebrow>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-3">Status</span>
                      <StatusPill tone={getStatusTone(interview.status)}>
                        {interview.status.replace(/_/g, ' ')}
                      </StatusPill>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-3">Preparation</span>
                      <span className="text-sm text-ink font-mono">{interview.preparation?.completionProgress || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-3">Interviewers</span>
                      <span className="text-sm text-ink font-mono">{interview.interviewers?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-3">Checklist</span>
                      <span className="text-sm text-ink font-mono">{checkedCount}/{totalCount}</span>
                    </div>
                    {interview.feedback?.decision && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-3">Decision</span>
                        <StatusPill tone={
                          interview.feedback.decision === 'selected' ? 'brand' :
                          interview.feedback.decision === 'rejected' ? 'danger' : 'warning'
                        }>
                          {interview.feedback.decision.replace(/_/g, ' ')}
                        </StatusPill>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Application Info */}
                {interview.applicationId && (
                  <Card>
                    <Eyebrow className="mb-3">Application</Eyebrow>
                    <div className="space-y-2">
                      <p className="text-sm text-ink-3">
                        {interview.applicationId.company} - {interview.applicationId.role}
                      </p>
                      <p className="text-xs text-ink-4">Stage: {interview.applicationId.currentStage?.replace(/_/g, ' ')}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/app/applications/${interview.applicationId._id}`)}
                      >
                        View Application
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Preparation Tab */}
          {activeTab === 'preparation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <Eyebrow className="mb-4">Preparation Checklist</Eyebrow>
                  <form onSubmit={handleAddChecklist} className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add checklist item..."
                      className="flex-1 bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <Button type="submit" variant="primary" size="sm" loading={addChecklistMutation.isPending}>Add</Button>
                  </form>
                  {interview.preparation?.checklist?.length > 0 ? (
                    <div className="space-y-2">
                      {interview.preparation.checklist.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition group">
                          <button
                            onClick={() => handleToggleChecklist(item._id, item.completed)}
                            className={`size-4 rounded border-2 flex-shrink-0 transition-all ${
                              item.completed
                                ? 'bg-brand border-brand'
                                : 'border-ink-4 hover:border-brand'
                            }`}
                          >
                            {item.completed && (
                              <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${item.completed ? 'text-ink-4 line-through' : 'text-ink'}`}>
                            {item.item}
                          </span>
                          <button
                            onClick={() => removeChecklistMutation.mutate({ id: interview._id, itemId: item._id }, { onSuccess: () => refetch() })}
                            className="text-ink-4 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-3 text-center py-4">No checklist items yet. Add your first item above.</p>
                  )}
                </Card>

                <Card>
                  <Eyebrow className="mb-3">Preparation Notes</Eyebrow>
                  <textarea
                    value={interview.preparation?.preparationNotes || ''}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    rows={5}
                    placeholder="Add your preparation notes here..."
                    className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={updatePrepMutation.isPending}
                      onClick={() => updatePrepMutation.mutate({
                        id: interview._id,
                        data: { preparationNotes: prepNotes },
                      }, { onSuccess: () => refetch() })}
                    >
                      Save Notes
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <Eyebrow className="mb-3">DSA Topics</Eyebrow>
                  <div className="flex items-center gap-2 flex-wrap">
                    {interview.preparation?.dsaTopics?.length > 0 ? (
                      interview.preparation.dsaTopics.map((topic, i) => (
                        <span key={i} className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full">{topic}</span>
                      ))
                    ) : (
                      <p className="text-sm text-ink-3">No DSA topics added</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <Eyebrow className="mb-3">System Design Topics</Eyebrow>
                  <div className="flex items-center gap-2 flex-wrap">
                    {interview.preparation?.systemDesignTopics?.length > 0 ? (
                      interview.preparation.systemDesignTopics.map((topic, i) => (
                        <span key={i} className="text-xs bg-purple-500/10 text-purple-500 px-2.5 py-1 rounded-full">{topic}</span>
                      ))
                    ) : (
                      <p className="text-sm text-ink-3">No system design topics added</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <Eyebrow className="mb-3">Behavioral Topics</Eyebrow>
                  <div className="flex items-center gap-2 flex-wrap">
                    {interview.preparation?.behavioralTopics?.length > 0 ? (
                      interview.preparation.behavioralTopics.map((topic, i) => (
                        <span key={i} className="text-xs bg-yellow-500/10 text-yellow-600 px-2.5 py-1 rounded-full">{topic}</span>
                      ))
                    ) : (
                      <p className="text-sm text-ink-3">No behavioral topics added</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="max-w-2xl">
              {interview.feedback?.submittedAt ? (
                <Card>
                  <Eyebrow className="mb-4">Feedback Summary</Eyebrow>
                  <div className="grid grid-cols-2 gap-4">
                    {interview.feedback.rating && (
                      <div>
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Rating</p>
                        <p className="text-ink font-medium">{interview.feedback.rating}/5</p>
                      </div>
                    )}
                    {interview.feedback.difficulty && (
                      <div>
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Difficulty</p>
                        <p className="text-ink font-medium capitalize">{interview.feedback.difficulty.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    {interview.feedback.decision && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Decision</p>
                        <StatusPill tone={
                          interview.feedback.decision === 'selected' ? 'brand' :
                          interview.feedback.decision === 'rejected' ? 'danger' :
                          interview.feedback.decision === 'on_hold' ? 'warning' : 'neutral'
                        }>
                          {interview.feedback.decision.replace(/_/g, ' ')}
                        </StatusPill>
                      </div>
                    )}
                    {interview.feedback.strengths && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Strengths</p>
                        <p className="text-ink text-sm">{interview.feedback.strengths}</p>
                      </div>
                    )}
                    {interview.feedback.weaknesses && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Weaknesses</p>
                        <p className="text-ink text-sm">{interview.feedback.weaknesses}</p>
                      </div>
                    )}
                    {interview.feedback.notes && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-ink text-sm whitespace-pre-wrap">{interview.feedback.notes}</p>
                      </div>
                    )}
                    {interview.feedback.nextRound && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Next Round</p>
                        <p className="text-ink font-medium">{interview.feedback.nextRound}</p>
                      </div>
                    )}
                    {interview.feedback.questionsAsked?.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-ink-4 uppercase tracking-wider mb-1">Questions Asked</p>
                        <ul className="list-disc list-inside space-y-1">
                          {interview.feedback.questionsAsked.map((q, i) => (
                            <li key={i} className="text-sm text-ink">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <p className="text-xs text-ink-4">Submitted {formatDate(interview.feedback.submittedAt)}</p>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-8">
                    <p className="text-ink-3">No feedback submitted yet.</p>
                    <p className="text-sm text-ink-4 mt-1">
                      {interview.status === 'completed'
                        ? 'Complete the feedback form on the interviews page to add feedback.'
                        : 'Complete the interview first before submitting feedback.'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Interviewers Tab */}
          {activeTab === 'interviewers' && (
            <div className="max-w-2xl space-y-6">
              <Card>
                <Eyebrow className="mb-4">Add Interviewer</Eyebrow>
                <form onSubmit={handleAddInterviewer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-ink mb-1">Name *</label>
                    <input
                      type="text"
                      value={newInterviewer.name}
                      onChange={(e) => setNewInterviewer({ ...newInterviewer, name: e.target.value })}
                      placeholder="Interviewer name"
                      required
                      className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1">Email</label>
                    <input
                      type="email"
                      value={newInterviewer.email}
                      onChange={(e) => setNewInterviewer({ ...newInterviewer, email: e.target.value })}
                      placeholder="email@company.com"
                      className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1">Role</label>
                    <input
                      type="text"
                      value={newInterviewer.role}
                      onChange={(e) => setNewInterviewer({ ...newInterviewer, role: e.target.value })}
                      placeholder="e.g. Senior Engineer"
                      className="w-full bg-surface-2 ring-hairline rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div className="flex justify-end sm:col-span-2">
                    <Button type="submit" variant="primary" size="sm" loading={addInterviewerMutation.isPending}>
                      Add Interviewer
                    </Button>
                  </div>
                </form>
              </Card>

              <Card>
                <Eyebrow className="mb-4">Current Interviewers ({interview.interviewers?.length || 0})</Eyebrow>
                {interview.interviewers?.length > 0 ? (
                  <div className="space-y-3">
                    {interview.interviewers.map((iv, i) => (
                      <div key={iv._id || i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                        <div>
                          <p className="text-sm text-ink font-medium">{iv.name}</p>
                          {iv.email && <p className="text-xs text-ink-4">{iv.email}</p>}
                          {iv.role && <p className="text-xs text-ink-4">{iv.role}</p>}
                        </div>
                        <button
                          onClick={() => removeInterviewerMutation.mutate({
                            id: interview._id,
                            interviewerId: iv._id,
                          }, { onSuccess: () => refetch() })}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-3 text-center py-4">No interviewers added yet.</p>
                )}
              </Card>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="max-w-2xl">
              {interview.timeline?.length > 0 ? (
                <Card>
                  <Eyebrow className="mb-4">Activity Timeline</Eyebrow>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-hairline" />
                    <div className="space-y-4">
                      {interview.timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((entry, i) => (
                        <div key={i} className="relative pl-10">
                          <div className={`absolute left-2.5 top-1.5 size-3 rounded-full ring-2 ring-surface ${
                            entry.action === 'scheduled' ? 'bg-brand' :
                            entry.action === 'completed' ? 'bg-green-500' :
                            entry.action === 'cancelled' ? 'bg-red-500' :
                            entry.action === 'rescheduled' ? 'bg-yellow-500' :
                            'bg-ink-4'
                          }`} />
                          <div>
                            <p className="text-sm text-ink">{entry.description || entry.action.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] font-mono text-ink-4 mt-0.5">
                              {new Date(entry.timestamp).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-8 text-ink-3 text-sm">No timeline events yet.</div>
                </Card>
              )}
            </div>
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}