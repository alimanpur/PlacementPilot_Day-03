import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState, Skeleton, KeyStat, PriorityPill } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import {
  useCompany,
  useUpdateCompany,
  useAddCompanyNote,
  useCreateRecruiter,
  useDeleteRecruiter,
  useCreateResource,
  useDeleteResource,
  useCreateHiringInfo,
} from '@/hooks/api'

export default function CompanyDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showRecruiterForm, setShowRecruiterForm] = useState(false)
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [showHiringInfoForm, setShowHiringInfoForm] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { data: company, isLoading, error, refetch } = useCompany(id)
  const updateMutation = useUpdateCompany()
  const noteMutation = useAddCompanyNote()
  const recruiterMutation = useCreateRecruiter()
  const deleteRecruiterMutation = useDeleteRecruiter()
  const resourceMutation = useCreateResource()
  const deleteResourceMutation = useDeleteResource()
  const hiringInfoMutation = useCreateHiringInfo()

  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    role: '',
    email: '',
    linkedIn: '',
    phone: '',
    relationshipStatus: 'Contacted',
    notes: '',
  })

  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'Interview Experience',
    description: '',
    content: '',
    url: '',
    tags: '',
    difficulty: 'Unknown',
    round: '',
    year: new Date().getFullYear(),
  })

  const [hiringInfoForm, setHiringInfoForm] = useState({
    minimumCgpa: '',
    eligibleBranches: '',
    eligibleBatch: '',
    employmentType: 'Full-time',
    expectedCtc: '',
    hiringFrequency: 'Unknown',
    selectionProcess: '',
    applicationDeadline: '',
    applicationLink: '',
  })

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    noteMutation.mutate({ id, data: { note: noteText } }, {
      onSuccess: () => {
        setNoteText('')
        setShowNoteForm(false)
      },
    })
  }

  const handleAddRecruiter = (e) => {
    e.preventDefault()
    if (!recruiterForm.name) return
    recruiterMutation.mutate({ companyId: id, data: recruiterForm }, {
      onSuccess: () => {
        setRecruiterForm({
          name: '',
          role: '',
          email: '',
          linkedIn: '',
          phone: '',
          relationshipStatus: 'Contacted',
          notes: '',
        })
        setShowRecruiterForm(false)
      },
    })
  }

  const handleAddResource = (e) => {
    e.preventDefault()
    if (!resourceForm.title) return
    resourceMutation.mutate({ companyId: id, data: resourceForm }, {
      onSuccess: () => {
        setResourceForm({
          title: '',
          type: 'Interview Experience',
          description: '',
          content: '',
          url: '',
          tags: '',
          difficulty: 'Unknown',
          round: '',
          year: new Date().getFullYear(),
        })
        setShowResourceForm(false)
      },
    })
  }

  const handleSaveHiringInfo = (e) => {
    e.preventDefault()
    hiringInfoMutation.mutate({ companyId: id, data: hiringInfoForm }, {
      onSuccess: () => {
        toast.success('Hiring information saved')
      },
    })
  }

  const handleDeleteRecruiter = (recruiterId) => {
    if (window.confirm('Delete this recruiter?')) {
      deleteRecruiterMutation.mutate({ companyId: id, recruiterId })
    }
  }

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Delete this resource?')) {
      deleteResourceMutation.mutate({ companyId: id, resourceId })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'recruiters', label: 'Recruiters' },
    { id: 'resources', label: 'Resources' },
    { id: 'hiring', label: 'Hiring Info' },
    { id: 'timeline', label: 'Timeline' },
  ]

  if (error) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Company Detail" title="Error" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load company details.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (isLoading || !company) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Company Detail" title="Loading..." />
          <PageBody>
            <Skeleton className="h-64 w-full" />
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Company Detail"
          title={company.name}
          meta={company.industry || 'No industry specified'}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id, data: { favorite: !company.favorite } })}>
                {company.favorite ? '★ Favorite' : '☆ Favorite'}
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/app/applications?company=${company._id}`}>View Applications</Link>
              </Button>
            </div>
          }
        />

        <PageBody>
          {/* Stats */}
          {company.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <KeyStat label="Applications" value={company.stats.applications || 0} />
              </Card>
              <Card>
                <KeyStat label="Offers" value={company.stats.offers || 0} />
              </Card>
              <Card>
                <KeyStat label="Interviews" value={company.stats.interviews || 0} />
              </Card>
              <Card>
                <KeyStat label="Success Rate" value={`${company.stats.successRate || 0}%`} />
              </Card>
              <Card>
                <KeyStat label="Offer Rate" value={`${company.stats.offerRate || 0}%`} />
              </Card>
              <Card>
                <KeyStat label="Avg CTC" value={company.stats.averageCtc ? `₹${(company.stats.averageCtc / 100000).toFixed(1)}L` : 'N/A'} />
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <Eyebrow className="mb-4">Company Information</Eyebrow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {company.website && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Website</div>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.careerPage && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Career Page</div>
                      <a href={company.careerPage} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">
                        {company.careerPage}
                      </a>
                    </div>
                  )}
                  {company.linkedIn && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">LinkedIn</div>
                      <a href={company.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">
                        {company.linkedIn}
                      </a>
                    </div>
                  )}
                  {company.headquarters && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Headquarters</div>
                      <div className="text-sm text-ink">{company.headquarters}</div>
                    </div>
                  )}
                  {company.country && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Country</div>
                      <div className="text-sm text-ink">{company.country}</div>
                    </div>
                  )}
                  {company.companySize && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Company Size</div>
                      <div className="text-sm text-ink">{company.companySize}</div>
                    </div>
                  )}
                  {company.companyType && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Company Type</div>
                      <div className="text-sm text-ink">{company.companyType}</div>
                    </div>
                  )}
                  {company.founded && (
                    <div>
                      <div className="text-xs text-ink-3 mb-1">Founded</div>
                      <div className="text-sm text-ink">{company.founded}</div>
                    </div>
                  )}
                </div>
                {company.description && (
                  <div className="mt-4">
                    <div className="text-xs text-ink-3 mb-1">Description</div>
                    <p className="text-sm text-ink">{company.description}</p>
                  </div>
                )}
                {company.tags && company.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-ink-3 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-surface-2 rounded text-xs text-ink-3">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Notes */}
              <Card>
                <Eyebrow className="mb-4">Notes</Eyebrow>
                {company.notes && company.notes.length > 0 ? (
                  <div className="space-y-2">
                    {company.notes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-surface-2 rounded-md">
                        <p className="text-sm text-ink">{note.content}</p>
                        <div className="text-xs text-ink-4 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-3">No notes yet</p>
                )}
                {!showNoteForm ? (
                  <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowNoteForm(true)}>
                    Add Note
                  </Button>
                ) : (
                  <form onSubmit={handleAddNote} className="mt-4">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      rows={3}
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand mb-2"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" size="sm" loading={noteMutation.isPending}>
                        Save
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowNoteForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          )}

          {/* Recruiters Tab */}
          {activeTab === 'recruiters' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {!showRecruiterForm ? (
                <Button variant="primary" size="sm" onClick={() => setShowRecruiterForm(true)}>
                  + Add Recruiter
                </Button>
              ) : (
                <Card>
                  <Eyebrow className="mb-4">Add Recruiter</Eyebrow>
                  <form onSubmit={handleAddRecruiter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={recruiterForm.name}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                        required
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Role</label>
                      <input
                        type="text"
                        value={recruiterForm.role}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, role: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Email</label>
                      <input
                        type="email"
                        value={recruiterForm.email}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">LinkedIn</label>
                      <input
                        type="url"
                        value={recruiterForm.linkedIn}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, linkedIn: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={recruiterForm.phone}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, phone: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Relationship Status</label>
                      <select
                        value={recruiterForm.relationshipStatus}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, relationshipStatus: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="Contacted">Contacted</option>
                        <option value="Responded">Responded</option>
                        <option value="In Conversation">In Conversation</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Offer Extended">Offer Extended</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-ink mb-1.5">Notes</label>
                      <textarea
                        value={recruiterForm.notes}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, notes: e.target.value })}
                        rows={2}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit" variant="primary" size="sm" loading={recruiterMutation.isPending}>
                        Add Recruiter
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowRecruiterForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {company.recruiters && company.recruiters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.recruiters.map((recruiter) => (
                    <Card key={recruiter._id}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-display text-ink">{recruiter.name}</h4>
                          {recruiter.role && <p className="text-sm text-ink-3">{recruiter.role}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecruiter(recruiter._id)}
                        >
                          ×
                        </Button>
                      </div>
                      {recruiter.email && <p className="text-xs text-ink-3">{recruiter.email}</p>}
                      {recruiter.phone && <p className="text-xs text-ink-3">{recruiter.phone}</p>}
                      {recruiter.relationshipStatus && (
                        <div className="mt-2">
                          <StatusPill tone="accent">{recruiter.relationshipStatus}</StatusPill>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState title="No recruiters" description="Add recruiters to track your contacts" />
              )}
            </motion.div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {!showResourceForm ? (
                <Button variant="primary" size="sm" onClick={() => setShowResourceForm(true)}>
                  + Add Resource
                </Button>
              ) : (
                <Card>
                  <Eyebrow className="mb-4">Add Resource</Eyebrow>
                  <form onSubmit={handleAddResource} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Title *</label>
                      <input
                        type="text"
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        required
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-ink mb-1.5">Type</label>
                      <select
                        value={resourceForm.type}
                        onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="Interview Experience">Interview Experience</option>
                        <option value="OA Experience">OA Experience</option>
                        <option value="Preparation Notes">Preparation Notes</option>
                        <option value="Important Links">Important Links</option>
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Job Description">Job Description</option>
                        <option value="Reference Material">Reference Material</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-ink mb-1.5">Description</label>
                      <textarea
                        value={resourceForm.description}
                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                        rows={2}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-ink mb-1.5">Content</label>
                      <textarea
                        value={resourceForm.content}
                        onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })}
                        rows={4}
                        className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="submit" variant="primary" size="sm" loading={resourceMutation.isPending}>
                        Add Resource
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowResourceForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {company.resources && company.resources.length > 0 ? (
                <div className="space-y-3">
                  {company.resources.map((resource) => (
                    <Card key={resource._id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-display text-ink">{resource.title}</h4>
                            <StatusPill tone="neutral">{resource.type}</StatusPill>
                          </div>
                          {resource.description && <p className="text-sm text-ink-3">{resource.description}</p>}
                          {resource.difficulty && (
                            <div className="text-xs text-ink-4 mt-1">Difficulty: {resource.difficulty}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResource(resource._id)}
                        >
                          ×
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState title="No resources" description="Add interview experiences, notes, and other resources" />
              )}
            </motion.div>
          )}

          {/* Hiring Info Tab */}
          {activeTab === 'hiring' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <Eyebrow className="mb-4">Hiring Information</Eyebrow>
                {!showHiringInfoForm ? (
                  <Button variant="secondary" size="sm" onClick={() => setShowHiringInfoForm(true)}>
                    {company.hiringInfo ? 'Edit' : 'Add'} Hiring Info
                  </Button>
                ) : (
                  <form onSubmit={handleSaveHiringInfo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Minimum CGPA</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={hiringInfoForm.minimumCgpa}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, minimumCgpa: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Employment Type</label>
                        <select
                          value={hiringInfoForm.employmentType}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, employmentType: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Intern + PPO">Intern + PPO</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Expected CTC (INR)</label>
                        <input
                          type="number"
                          value={hiringInfoForm.expectedCtc}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, expectedCtc: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Hiring Frequency</label>
                        <select
                          value={hiringInfoForm.hiringFrequency}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, hiringFrequency: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="Annual">Annual</option>
                          <option value="Bi-annual">Bi-annual</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="As Needed">As Needed</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Application Deadline</label>
                        <input
                          type="date"
                          value={hiringInfoForm.applicationDeadline}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, applicationDeadline: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-ink mb-1.5">Application Link</label>
                        <input
                          type="url"
                          value={hiringInfoForm.applicationLink}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, applicationLink: e.target.value })}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-ink mb-1.5">Selection Process</label>
                        <textarea
                          value={hiringInfoForm.selectionProcess}
                          onChange={(e) => setHiringInfoForm({ ...hiringInfoForm, selectionProcess: e.target.value })}
                          rows={3}
                          className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" size="sm" loading={hiringInfoMutation.isPending}>
                        Save
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowHiringInfoForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <Eyebrow className="mb-4">Timeline</Eyebrow>
                {company.timeline && company.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {company.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-surface-2 rounded-md">
                        <div className="text-xs text-ink-4 whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-ink">{event.action}</div>
                          {event.description && <div className="text-xs text-ink-3 mt-1">{event.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No timeline events" description="Timeline events will appear here as you interact with this company" />
                )}
              </Card>
            </motion.div>
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}