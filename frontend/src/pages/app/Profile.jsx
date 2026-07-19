import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { ReadinessDial, ReadinessBars, ConsistencyHeatmap, TrajectoryRow, Spark } from '@/components/charts/instruments'
import {
  useProfile,
  useUpdateProfile,
  useProfileSummary,
  useActivityTimeline,
  useCheckAchievements,
  useProfileAchievements,
  useDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useArchiveDocument,
  useSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from '@/hooks/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  User,
  Award,
  FileText,
  Code2,
  Activity,
  ChevronRight,
  Upload,
  Trash2,
  Archive,
  Plus,
  Edit3,
  Target,
  TrendingUp,
  Flame,
  BookOpen,
  Briefcase,
  Star,
  CheckCircle2,
  X,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'edit', label: 'Edit Profile', icon: Edit3 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'activity', label: 'Activity', icon: Activity },
]

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Enter a valid email').optional(),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50).optional(),
  season: z.string().max(50).optional(),
  school: z.string().max(200).optional(),
  program: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().max(100).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  college: z.string().max(200).optional(),
  degree: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  semester: z.string().max(50).optional(),
  graduationYear: z.string().max(10).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  publicLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
    leetcode: z.string().url().optional().or(z.literal('')),
    codeforces: z.string().url().optional().or(z.literal('')),
    codechef: z.string().url().optional().or(z.literal('')),
    gfg: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

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

function OverviewTab() {
  const { data: summary, isLoading } = useProfileSummary()

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Readiness" value={`${summary?.readiness?.overall || 0}%`} delta="Placement score" tone={summary?.readiness?.overall >= 60 ? 'brand' : 'accent'} />
          <KPICard label="Applications" value={summary?.applications?.total || 0} delta={`${summary?.applications?.offers || 0} offers`} tone="brand" />
          <KPICard label="Interviews" value={summary?.interviews?.total || 0} delta={`${summary?.interviews?.passRate || 0}% pass rate`} tone="accent" />
          <KPICard label="DSA solved" value={summary?.dsa?.totalSolved || 0} delta={`${summary?.dsa?.completionRate || 0}% completion`} tone="brand" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={staggerItem}>
          <Card>
            <Eyebrow className="mb-4">Readiness</Eyebrow>
            <div className="flex flex-col items-center">
              <ReadinessDial value={summary?.readiness?.overall || 0} size={180} />
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card>
            <Eyebrow className="mb-4">Breakdown</Eyebrow>
            <ReadinessBars
              items={[
                { label: 'Coding', value: summary?.readiness?.coding || 0 },
                { label: 'Interview readiness', value: summary?.readiness?.interviewReadiness || 0 },
                { label: 'Goal progress', value: summary?.readiness?.goalReadiness || 0 },
                { label: 'Profile', value: summary?.readiness?.profileScore || 0 },
              ]}
            />
          </Card>
        </motion.div>
      </div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-4">Profile completeness</Eyebrow>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-2">Profile completion</span>
              <span className="font-mono text-ink tabular-nums">{summary?.profileCompleteness || 0}%</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${summary?.profileCompleteness || 0}%` }} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          ['Applications', summary?.applications?.total || 0, 'Applications submitted', 'briefcase'],
          ['Interviews', summary?.interviews?.total || 0, `${summary?.interviews?.passRate || 0}% pass rate`, 'calendar'],
          ['DSA', summary?.dsa?.totalSolved || 0, `${summary?.dsa?.completionRate || 0}% completion`, 'code'],
        ].map(([title, value, delta, icon]) => (
          <motion.div key={title} variants={staggerItem}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  {icon === 'briefcase' && <Briefcase className="size-5" />}
                  {icon === 'calendar' && <BookOpen className="size-5" />}
                  {icon === 'code' && <Code2 className="size-5" />}
                </div>
                <div>
                  <div className="text-xs text-ink-4 uppercase tracking-widest">{title}</div>
                  <div className="text-2xl font-display font-semibold tabular-nums">{value}</div>
                </div>
              </div>
              <div className="text-xs text-ink-3">{delta}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function EditProfileTab() {
  const { data: user, isLoading, refetch } = useProfile()
  const updateMutation = useUpdateProfile()
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      season: '',
      school: '',
      program: '',
      location: '',
      timezone: '',
      headline: '',
      bio: '',
      phone: '',
      college: '',
      degree: '',
      branch: '',
      semester: '',
      graduationYear: '',
      skills: [],
      interests: [],
      languages: [],
      publicLinks: {
        github: '',
        linkedin: '',
        portfolio: '',
        leetcode: '',
        codeforces: '',
        codechef: '',
        gfg: '',
      },
    },
    values: user ? {
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      season: user.season || '',
      school: user.school || '',
      program: user.program || '',
      location: user.location || '',
      timezone: user.timezone || '',
      headline: user.headline || '',
      bio: user.bio || '',
      phone: user.phone || '',
      college: user.college || '',
      degree: user.degree || '',
      branch: user.branch || '',
      semester: user.semester || '',
      graduationYear: user.graduationYear || '',
      skills: user.skills || [],
      interests: user.interests || [],
      languages: user.languages || [],
      publicLinks: {
        github: user.publicLinks?.github || '',
        linkedin: user.publicLinks?.linkedin || '',
        portfolio: user.publicLinks?.portfolio || '',
        leetcode: user.publicLinks?.leetcode || '',
        codeforces: user.publicLinks?.codeforces || '',
        codechef: user.publicLinks?.codechef || '',
        gfg: user.publicLinks?.gfg || '',
      },
    } : undefined,
  })

  const onSubmit = (data) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setEditing(false)
        refetch()
      },
    })
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Eyebrow>Edit profile</Eyebrow>
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit profile'}
          </Button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ink mb-1.5">Full name</label>
                <input {...register('name')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Email</label>
                <input type="email" {...register('email')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Username</label>
                <input {...register('username')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Season</label>
                <input {...register('season')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Headline</label>
                <input {...register('headline')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Software Engineer @ Google" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Phone</label>
                <input {...register('phone')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-ink mb-1.5">Bio</label>
                <textarea {...register('bio')} rows={3} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">School</label>
                <input {...register('school')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Program</label>
                <input {...register('program')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">College</label>
                <input {...register('college')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Degree</label>
                <input {...register('degree')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Branch</label>
                <input {...register('branch')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Semester</label>
                <input {...register('semester')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Graduation Year</label>
                <input {...register('graduationYear')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Location</label>
                <input {...register('location')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Timezone</label>
                <input {...register('timezone')} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" loading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <Eyebrow className="mb-4">Personal</Eyebrow>
                <dl className="space-y-3 text-sm">
                  {[
                    ['Name', user?.name],
                    ['Email', user?.email],
                    ['Username', user?.username],
                    ['Season', user?.season],
                    ['Phone', user?.phone],
                    ['Location', user?.location],
                    ['Timezone', user?.timezone],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-ink text-right">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
              <Card>
                <Eyebrow className="mb-4">Education</Eyebrow>
                <dl className="space-y-3 text-sm">
                  {[
                    ['College', user?.college],
                    ['Degree', user?.degree],
                    ['Branch', user?.branch],
                    ['Semester', user?.semester],
                    ['Graduation', user?.graduationYear],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-ink text-right">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
            {user?.headline && (
              <Card>
                <Eyebrow className="mb-2">Headline</Eyebrow>
                <p className="text-ink">{user.headline}</p>
              </Card>
            )}
            {user?.bio && (
              <Card>
                <Eyebrow className="mb-2">Bio</Eyebrow>
                <p className="text-ink-2 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              </Card>
            )}
            <Card>
              <Eyebrow className="mb-4">Public links</Eyebrow>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['GitHub', user?.publicLinks?.github],
                  ['LinkedIn', user?.publicLinks?.linkedin],
                  ['Portfolio', user?.publicLinks?.portfolio],
                  ['LeetCode', user?.publicLinks?.leetcode],
                  ['Codeforces', user?.publicLinks?.codeforces],
                  ['CodeChef', user?.publicLinks?.codechef],
                  ['GFG', user?.publicLinks?.gfg],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-4">
                    <span className="text-ink-3">{k}</span>
                    {v ? (
                      <a href={`https://${v}`} target="_blank" rel="noopener noreferrer" className="text-ink font-mono text-right truncate hover:text-brand transition">
                        {v}
                      </a>
                    ) : (
                      <span className="text-ink-4 text-right">—</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function AchievementsTab() {
  const { data: achievements, isLoading } = useProfileAchievements()
  const checkMutation = useCheckAchievements()

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-between items-center">
        <div>
          <Eyebrow className="mb-2">Achievements</Eyebrow>
          <p className="text-sm text-ink-3">{achievements?.filter(a => a.unlocked).length || 0} of {achievements?.length || 0} unlocked</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => checkMutation.mutate()}>
          Check new achievements
        </Button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements?.map((a) => (
          <motion.div key={a.key} variants={staggerItem}>
            <Card className={cn('relative overflow-hidden', a.unlocked && 'border-l-4 border-l-brand')}>
              {a.unlocked && (
                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-brand/10 pointer-events-none" aria-hidden="true" />
              )}
              <div className="relative">
                <div className="text-4xl mb-3">{a.icon}</div>
                <StatusPill tone={a.tier === 'gold' ? 'accent' : a.tier === 'silver' ? 'brand' : 'neutral'}>
                  {a.tier}
                </StatusPill>
                <h3 className="font-display text-xl text-ink mt-3">{a.title}</h3>
                <p className="text-sm text-ink-3 mt-1">{a.description}</p>
                {a.unlocked ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-brand">
                    <CheckCircle2 className="size-4" />
                    Unlocked
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-3">Progress</span>
                      <span className="text-ink-4">{a.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-white/20" style={{ width: `${a.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function DocumentsTab() {
  const { data: documents, isLoading } = useDocuments()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const deleteMutation = useDeleteDocument()
  const archiveMutation = useArchiveDocument()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'resume',
    url: '',
    tags: [],
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, { onSuccess: () => { setEditingId(null); setShowForm(false); resetForm() } })
    } else {
      createMutation.mutate(formData, { onSuccess: () => { setShowForm(false); resetForm() } })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'resume', url: '', tags: [] })
    setEditingId(null)
  }

  const startEdit = (doc) => {
    setFormData({ name: doc.name, type: doc.type, url: doc.url, tags: doc.tags || [] })
    setEditingId(doc._id)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-between items-center">
        <Eyebrow>Documents</Eyebrow>
        <Button variant="secondary" size="sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus className="size-4 mr-2" /> Add document
        </Button>
      </motion.div>

      {showForm && (
        <motion.div variants={staggerItem}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink mb-1.5">Name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" required />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="resume">Resume</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="certificate">Certificate</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="transcript">Transcript</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-ink mb-1.5">URL</label>
                  <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => { setShowForm(false); resetForm() }}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">{editingId ? 'Update' : 'Upload'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents?.map((doc) => (
          <motion.div key={doc._id} variants={staggerItem}>
            <Card className={cn(doc.archived && 'opacity-60')}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand/10 rounded-lg text-brand">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{doc.name}</h4>
                    <p className="text-xs text-ink-3 mt-1">{doc.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-ink-4 mt-1 font-mono truncate max-w-[200px]">{doc.url}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(doc)}><Edit3 className="size-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate({ id: doc._id, archived: !doc.archived })}>
                    <Archive className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this document?')) deleteMutation.mutate(doc._id) }}>
                    <Trash2 className="size-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {(!documents || documents.length === 0) && !showForm && (
        <EmptyState title="No documents yet" description="Upload your resume, certificates, or other documents." icon="📄" />
      )}
    </motion.div>
  )
}

function SkillsTab() {
  const { data: skills, isLoading } = useSkills()
  const createMutation = useCreateSkill()
  const updateMutation = useUpdateSkill()
  const deleteMutation = useDeleteSkill()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming Language',
    proficiency: 'Beginner',
    level: 0,
    yearsOfExperience: 0,
    notes: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, { onSuccess: () => { setEditingId(null); setShowForm(false); resetForm() } })
    } else {
      createMutation.mutate(formData, { onSuccess: () => { setShowForm(false); resetForm() } })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', category: 'Programming Language', proficiency: 'Beginner', level: 0, yearsOfExperience: 0, notes: '' })
    setEditingId(null)
  }

  const startEdit = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency || 'Beginner',
      level: skill.level || 0,
      yearsOfExperience: skill.yearsOfExperience || 0,
      notes: skill.notes || '',
    })
    setEditingId(skill._id)
    setShowForm(true)
  }

  const categories = ['Programming Language', 'Framework', 'Database', 'Tool', 'Soft Skill', 'CS Fundamentals', 'Other']

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem} className="flex justify-between items-center">
        <Eyebrow>Skills</Eyebrow>
        <Button variant="secondary" size="sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus className="size-4 mr-2" /> Add skill
        </Button>
      </motion.div>

      {showForm && (
        <motion.div variants={staggerItem}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink mb-1.5">Skill name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" required />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Proficiency</label>
                  <select value={formData.proficiency} onChange={e => setFormData({ ...formData, proficiency: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Level (0-100)</label>
                  <input type="number" min="0" max="100" value={formData.level} onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => { setShowForm(false); resetForm() }}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">{editingId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {categories.map(category => {
        const categorySkills = skills?.filter(s => s.category === category) || []
        if (categorySkills.length === 0) return null
        return (
          <motion.div key={category} variants={staggerItem}>
            <Card>
              <Eyebrow className="mb-4">{category}</Eyebrow>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-ink">{skill.name}</span>
                        <span className="text-xs text-ink-3">{skill.proficiency}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-brand" style={{ width: `${skill.level || 0}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(skill)}><Edit3 className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Remove this skill?')) deleteMutation.mutate(skill._id) }}>
                        <X className="size-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function ActivityTab() {
  const { data: activities, isLoading } = useActivityTimeline(50)

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <Eyebrow className="mb-4">Activity timeline</Eyebrow>
        <p className="text-sm text-ink-3 mb-6">Your recent activity across all modules.</p>
      </motion.div>
      <div className="space-y-4">
        {activities?.map((activity, idx) => (
          <motion.div key={idx} variants={staggerItem}>
            <Card className="flex items-start gap-4">
              <div className="text-2xl mt-0.5">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink">{activity.title}</div>
                <div className="text-sm text-ink-3 mt-0.5">{activity.description}</div>
                <div className="text-xs text-ink-4 mt-2 font-mono">{format(new Date(activity.timestamp), 'MMM d, yyyy · h:mm a')}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      {(!activities || activities.length === 0) && (
        <EmptyState title="No activity yet" description="Your activity will appear here as you use the platform." icon="📊" />
      )}
    </motion.div>
  )
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: user, isLoading } = useProfile()

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Candidate record" title="Profile" />
          <PageBody>
            <div className="grid place-items-center min-h-[400px]">
              <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
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
          eyebrow="Candidate record"
          title={user?.name || 'Profile'}
          meta={user ? `${user.email}${user.school ? ` · ${user.school}` : ''}` : 'Loading...'}
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
          {activeTab === 'edit' && <EditProfileTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'skills' && <SkillsTab />}
          {activeTab === 'activity' && <ActivityTab />}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
