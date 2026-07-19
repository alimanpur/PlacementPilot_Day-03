import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import {
  Card,
  Eyebrow,
  StatusPill,
  PriorityPill,
  StagePill,
  EmptyState,
} from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import {
  useApplication,
  useUpdateApplication,
  useDeleteApplication,
  useArchiveApplication,
  useDuplicateApplication,
} from '@/hooks/api'
import { formatDate, getStageLabel, getStatusLabel } from '@/lib/utils'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Archive,
  Copy,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  User,
  Mail,
  Linkedin,
  ExternalLink,
  FileText,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  X,
} from 'lucide-react'

export default function ApplicationDetail() {
  const { id } = useParams()
  const [showActions, setShowActions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: application, isLoading, error, refetch } = useApplication(id)
  const updateMutation = useUpdateApplication()
  const deleteMutation = useDeleteApplication()
  const archiveMutation = useArchiveApplication()
  const duplicateMutation = useDuplicateApplication()

  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    if (application) {
      setEditForm({
        company: application.company || '',
        role: application.role || '',
        department: application.department || '',
        jobId: application.jobId || '',
        employmentType: application.employmentType || 'Full-time',
        workMode: application.workMode || 'Onsite',
        location: application.location || '',
        package: application.package || undefined,
        currency: application.currency || 'INR',
        source: application.source || 'Other',
        recruiterName: application.recruiterName || '',
        recruiterEmail: application.recruiterEmail || '',
        recruiterLinkedIn: application.recruiterLinkedIn || '',
        resumeVersion: application.resumeVersion || '',
        coverLetter: application.coverLetter || '',
        portfolioLink: application.portfolioLink || '',
        appliedDate: application.appliedDate || '',
        deadline: application.deadline || '',
        expectedJoining: application.expectedJoining || '',
        reminderDate: application.reminderDate || '',
        priority: application.priority || 'medium',
        currentStage: application.currentStage || 'wishlist',
        status: application.status || 'active',
        notes: application.notes || '',
        tags: application.tags || [],
      })
    }
  }, [application])

  const handleUpdate = (e) => {
    e.preventDefault()
    if (!editForm) return

    updateMutation.mutate(
      { id, data: editForm },
      {
        onSuccess: () => {
          setShowEditModal(false)
          refetch()
        },
      }
    )
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          window.location.href = '/app/applications'
        },
      })
    }
  }

  const handleArchive = () => {
    archiveMutation.mutate(
      { id, archived: !application?.archived },
      {
        onSuccess: () => {
          refetch()
        },
      }
    )
  }

  const handleDuplicate = () => {
    duplicateMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Application duplicated')
      },
    })
  }

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Application Details" title="Loading..." />
          <PageBody>
            <div className="grid place-items-center min-h-[400px]">
              <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (error || !application) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Application Details" title="Not Found" />
          <PageBody>
            <EmptyState
              icon={<AlertCircle className="size-12" />}
              title="Application not found"
              description="The application you're looking for doesn't exist or has been deleted"
              action={
                <Link to="/app/applications">
                  <Button variant="primary" size="sm">
                    Back to Applications
                  </Button>
                </Link>
              }
            />
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Application Details"
          title={application.company}
          meta={application.role}
          action={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="size-4 mr-1.5" />
                Edit
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreVertical className="size-4" />
                </Button>
                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-hairline rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleDuplicate()
                        setShowActions(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-2 transition flex items-center gap-2"
                    >
                      <Copy className="size-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        handleArchive()
                        setShowActions(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-2 transition flex items-center gap-2"
                    >
                      <Archive className="size-4" />
                      {application.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => {
                        handleDelete()
                        setShowActions(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-2 transition flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />

        <PageBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status & Stage */}
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-ink mb-2">Pipeline Status</h2>
                    <div className="flex flex-wrap gap-2">
                      <StagePill stage={application.currentStage}>
                        {getStageLabel(application.currentStage)}
                      </StagePill>
                      <StatusPill tone={application.status === 'active' ? 'success' : 'neutral'}>
                        {getStatusLabel(application.status)}
                      </StatusPill>
                      <PriorityPill priority={application.priority}>
                        {application.priority}
                      </PriorityPill>
                    </div>
                  </div>
                </div>

                {application.timeline && application.timeline.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-ink mb-3">Timeline</h3>
                    <div className="space-y-3">
                      {application.timeline.slice(0, 5).map((event, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0">
                            <Clock className="size-4 text-ink-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-ink">{event.action}</div>
                            {event.description && (
                              <div className="text-xs text-ink-3 mt-0.5">{event.description}</div>
                            )}
                            <div className="text-xs text-ink-4 mt-1">
                              {formatDate(event.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Notes */}
              {application.notes && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-3">Notes</h3>
                  <p className="text-sm text-ink-3 whitespace-pre-wrap">{application.notes}</p>
                </Card>
              )}

              {/* Attachments */}
              {application.attachments && application.attachments.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {application.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-ink-3" />
                          <div>
                            <div className="text-sm text-ink">{attachment.name}</div>
                            <div className="text-xs text-ink-4">{attachment.type}</div>
                          </div>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:text-brand/80 transition"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <h3 className="text-lg font-semibold text-ink mb-4">Details</h3>
                <div className="space-y-3">
                  {application.employmentType && (
                    <div className="flex items-start gap-2 text-sm">
                      <Briefcase className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Employment Type</div>
                        <div className="text-ink">{application.employmentType}</div>
                      </div>
                    </div>
                  )}
                  {application.workMode && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Work Mode</div>
                        <div className="text-ink">{application.workMode}</div>
                      </div>
                    </div>
                  )}
                  {application.location && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Location</div>
                        <div className="text-ink">{application.location}</div>
                      </div>
                    </div>
                  )}
                  {application.package && (
                    <div className="flex items-start gap-2 text-sm">
                      <DollarSign className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Package</div>
                        <div className="text-ink">
                          {application.currency} {application.package.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {application.appliedDate && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Applied Date</div>
                        <div className="text-ink">{formatDate(application.appliedDate)}</div>
                      </div>
                    </div>
                  )}
                  {application.deadline && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="size-4 text-ink-4 mt-0.5" />
                      <div>
                        <div className="text-ink-3">Deadline</div>
                        <div className="text-ink">{formatDate(application.deadline)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recruiter Info */}
              {(application.recruiterName || application.recruiterEmail) && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-4">Recruiter</h3>
                  <div className="space-y-3">
                    {application.recruiterName && (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="size-4 text-ink-4 mt-0.5" />
                        <div>
                          <div className="text-ink-3">Name</div>
                          <div className="text-ink">{application.recruiterName}</div>
                        </div>
                      </div>
                    )}
                    {application.recruiterEmail && (
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="size-4 text-ink-4 mt-0.5" />
                        <div>
                          <div className="text-ink-3">Email</div>
                          <a
                            href={`mailto:${application.recruiterEmail}`}
                            className="text-brand hover:underline"
                          >
                            {application.recruiterEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    {application.recruiterLinkedIn && (
                      <div className="flex items-start gap-2 text-sm">
                        <Linkedin className="size-4 text-ink-4 mt-0.5" />
                        <div>
                          <div className="text-ink-3">LinkedIn</div>
                          <a
                            href={application.recruiterLinkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Tags */}
              {application.tags && application.tags.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-ink mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-surface-2 text-ink-3 text-xs rounded"
                      >
                        <Tag className="size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Edit Modal */}
          <AnimatePresence>
            {showEditModal && editForm && (
              <EditApplicationModal
                formData={editForm}
                setFormData={setEditForm}
                onSubmit={handleUpdate}
                onClose={() => setShowEditModal(false)}
                isLoading={updateMutation.isPending}
              />
            )}
          </AnimatePresence>
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}

function EditApplicationModal({ formData, setFormData, onSubmit, onClose, isLoading }) {
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
          <Eyebrow>Edit Application</Eyebrow>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink transition"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
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
                <option value="wishlist">Wishlist</option>
                <option value="ready_to_apply">Ready to Apply</option>
                <option value="applied">Applied</option>
                <option value="online_assessment">Online Assessment</option>
                <option value="technical_interview">Technical Interview</option>
                <option value="managerial_interview">Managerial Interview</option>
                <option value="hr_interview">HR Interview</option>
                <option value="offer">Offer</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Package (CTC)</label>
              <input
                type="number"
                value={formData.package || ''}
                onChange={(e) =>
                  setFormData({ ...formData, package: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}