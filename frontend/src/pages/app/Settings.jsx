import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill } from '@/components/common/atoms'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import {
  useSettings,
  useUpdateSettings,
  useUpdateNotificationPreferences,
  useExportData,
  useDeleteAccount,
  useChangePassword,
  useUpdateAppearance,
  useUpdatePrivacy,
  useUpdateSecurity,
  useUpdateProductivity,
  useIntegrations,
  useClearCache,
  useResetPreferences,
  useDeleteArchivedData,
} from '@/hooks/api'
import { cn } from '@/lib/utils'
import {
  User,
  Palette,
  Bell,
  Shield,
  Zap,
  Database,
  Plug,
  Info,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  X,
  Settings2,
  Eye,
  Github,
  Linkedin,
  Calendar,
  Slack,
} from 'lucide-react'

const SECTIONS = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
]

const integrations = [
  {
    key: 'github',
    label: 'GitHub',
    description: 'Sync your coding profile and repositories',
    icon: Github,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    description: 'Connect your professional profile',
    icon: Linkedin,
  },
  {
    key: 'calendar',
    label: 'Google Calendar',
    description: 'Sync interviews and planner tasks',
    icon: Calendar,
  },
  {
    key: 'slack',
    label: 'Slack',
    description: 'Receive notifications and updates',
    icon: Slack,
  },
]

const generalSchema = z.object({
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
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

function Row({ label, hint, children }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 border-t border-hairline first:border-t-0">
      <div className="min-w-0">
        <div className="text-sm text-ink">{label}</div>
        {hint ? <div className="text-xs text-ink-3 mt-0.5">{hint}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ defaultOn, onChange, disabled }) {
  const [on, setOn] = useState(!!defaultOn)
  return (
    <button
      type="button"
      onClick={() => {
        const next = !on
        setOn(next)
        onChange?.(next)
      }}
      disabled={disabled}
      className={cn(
        'h-6 w-11 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        on ? 'bg-brand' : 'bg-surface-2 ring-1 ring-white/10',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      role="switch"
      aria-checked={on}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 size-5 rounded-full bg-base shadow-sm"
        animate={{ x: on ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function GeneralSection() {
  const { data: settings, isLoading, refetch } = useSettings()
  const updateMutation = useUpdateSettings()
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(generalSchema),
    values: settings || {},
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
      <Card>
        <Eyebrow className="mb-6">General</Eyebrow>
        <div className="text-ink-3">Loading...</div>
      </Card>
    )
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Eyebrow>General</Eyebrow>
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Full name" error={errors.name?.message}>
                <Input error={!!errors.name} {...register('name')} />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <Input type="email" error={!!errors.email} {...register('email')} />
              </FormField>
              <FormField label="Username" error={errors.username?.message}>
                <Input error={!!errors.username} {...register('username')} />
              </FormField>
              <FormField label="Season" error={errors.season?.message}>
                <Input error={!!errors.season} {...register('season')} />
              </FormField>
              <FormField label="Headline" error={errors.headline?.message}>
                <Input error={!!errors.headline} {...register('headline')} />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input error={!!errors.phone} {...register('phone')} />
              </FormField>
              <FormField label="School" error={errors.school?.message}>
                <Input error={!!errors.school} {...register('school')} />
              </FormField>
              <FormField label="Program" error={errors.program?.message}>
                <Input error={!!errors.program} {...register('program')} />
              </FormField>
              <FormField label="College" error={errors.college?.message}>
                <Input error={!!errors.college} {...register('college')} />
              </FormField>
              <FormField label="Degree" error={errors.degree?.message}>
                <Input error={!!errors.degree} {...register('degree')} />
              </FormField>
              <FormField label="Branch" error={errors.branch?.message}>
                <Input error={!!errors.branch} {...register('branch')} />
              </FormField>
              <FormField label="Semester" error={errors.semester?.message}>
                <Input error={!!errors.semester} {...register('semester')} />
              </FormField>
              <FormField label="Graduation Year" error={errors.graduationYear?.message}>
                <Input error={!!errors.graduationYear} {...register('graduationYear')} />
              </FormField>
              <FormField label="Location" error={errors.location?.message}>
                <Input error={!!errors.location} {...register('location')} />
              </FormField>
              <FormField label="Timezone" error={errors.timezone?.message}>
                <Input error={!!errors.timezone} {...register('timezone')} />
              </FormField>
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
              <div>
                <Eyebrow className="mb-4">Personal</Eyebrow>
                <dl className="space-y-3 text-sm">
                  {[
                    ['Name', settings?.name],
                    ['Email', settings?.email],
                    ['Username', settings?.username],
                    ['Season', settings?.season],
                    ['Phone', settings?.phone],
                    ['Location', settings?.location],
                    ['Timezone', settings?.timezone],
                    ['Headline', settings?.headline],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-ink text-right">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <Eyebrow className="mb-4">Education</Eyebrow>
                <dl className="space-y-3 text-sm">
                  {[
                    ['School', settings?.school],
                    ['Program', settings?.program],
                    ['College', settings?.college],
                    ['Degree', settings?.degree],
                    ['Branch', settings?.branch],
                    ['Semester', settings?.semester],
                    ['Graduation', settings?.graduationYear],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-2 gap-4">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-ink text-right">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            {settings?.bio && (
              <div>
                <Eyebrow className="mb-2">Bio</Eyebrow>
                <p className="text-ink-2 leading-relaxed whitespace-pre-wrap">{settings.bio}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function AppearanceSection() {
  const { data: settings, refetch } = useSettings()
  const updateAppearanceMutation = useUpdateAppearance()

  const handleThemeChange = (theme) => {
    updateAppearanceMutation.mutate({ theme }, { onSuccess: () => refetch() })
  }

  const handleToggle = (key, value) => {
    updateAppearanceMutation.mutate({ [key]: value }, { onSuccess: () => refetch() })
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Theme</Eyebrow>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark', description: 'Easy on the eyes' },
            { id: 'night-flight', label: 'Night flight', description: 'Deep blue tones' },
            { id: 'high-contrast', label: 'High contrast', description: 'Maximum clarity' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                'ring-hairline rounded-lg p-4 text-left transition hover:ring-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                settings?.theme === theme.id && 'ring-brand',
              )}
            >
              <div className="h-16 rounded bg-surface-2 mb-3" />
              <div className="text-sm text-ink">{theme.label}</div>
              <div className="text-xs text-ink-3">{theme.description}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <Eyebrow className="mb-6">Preferences</Eyebrow>
        <div className="divide-y divide-hairline">
          <Row label="Sidebar collapsed" hint="Hide the sidebar by default">
            <Toggle defaultOn={settings?.sidebarCollapsed} onChange={(v) => handleToggle('sidebarCollapsed', v)} />
          </Row>
          <Row label="Animations" hint="Enable page transitions and micro-interactions">
            <Toggle defaultOn={settings?.animationsEnabled} onChange={(v) => handleToggle('animationsEnabled', v)} />
          </Row>
          <Row label="Reduced motion" hint="Minimize motion for accessibility">
            <Toggle defaultOn={settings?.reducedMotion} onChange={(v) => handleToggle('reducedMotion', v)} />
          </Row>
        </div>
      </Card>
    </motion.div>
  )
}

function NotificationsSection() {
  const { data: settings, refetch } = useSettings()
  const updateMutation = useUpdateNotificationPreferences()
  const prefs = settings?.notificationPreferences || {}

  const handleChange = (key, value) => {
    updateMutation.mutate({ [key]: value }, { onSuccess: () => refetch() })
  }

  const notificationPrefs = [
    { label: 'Interview reminders', key: 'interviews', description: 'Upcoming interviews and prep tasks' },
    { label: 'Weekly review', key: 'weekly', description: 'Weekly placement progress recap' },
    { label: 'DSA reminders', key: 'problems', description: 'Revision queues and problem sets' },
    { label: 'Deadline nudges', key: 'deadlines', description: 'Application and interview deadlines' },
    { label: 'Achievements', key: 'achievements', description: 'Milestone unlocks and badges' },
    { label: 'Reports', key: 'reports', description: 'Weekly and monthly reports' },
    { label: 'Marketing', key: 'marketing', description: 'Product updates and offers' },
  ]

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Notification channels</Eyebrow>
        <div className="divide-y divide-hairline">
          {notificationPrefs.map((pref) => (
            <Row key={pref.key} label={pref.label} hint={pref.description}>
              <Toggle defaultOn={!!prefs[pref.key]} onChange={(v) => handleChange(pref.key, v)} />
            </Row>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function PrivacySection() {
  const { data: settings, refetch } = useSettings()
  const updateMutation = useUpdatePrivacy()
  const privacy = settings?.privacy || {}

  const handleChange = (key, value) => {
    updateMutation.mutate({ [key]: value }, { onSuccess: () => refetch() })
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Visibility</Eyebrow>
        <div className="divide-y divide-hairline">
          <Row label="Public profile" hint="Allow others to view your profile">
            <Toggle defaultOn={privacy.publicProfile} onChange={(v) => handleChange('publicProfile', v)} />
          </Row>
          <Row label="Activity visibility" hint="Who can see your activity">
            <select
              value={privacy.activityVisibility || 'private'}
              onChange={(e) => handleChange('activityVisibility', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="connections">Connections only</option>
            </select>
          </Row>
          <Row label="Achievement visibility" hint="Who can see your achievements">
            <select
              value={privacy.achievementVisibility || 'private'}
              onChange={(e) => handleChange('achievementVisibility', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="connections">Connections only</option>
            </select>
          </Row>
          <Row label="Document visibility" hint="Who can see your documents">
            <select
              value={privacy.documentVisibility || 'private'}
              onChange={(e) => handleChange('documentVisibility', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="connections">Connections only</option>
            </select>
          </Row>
          <Row label="Analytics sharing" hint="Help improve PlacementPilot with usage data">
            <Toggle defaultOn={privacy.analyticsSharing} onChange={(v) => handleChange('analyticsSharing', v)} />
          </Row>
          <Row label="Data processing" hint="Allow processing of personal data for recommendations">
            <Toggle defaultOn={privacy.dataProcessing} onChange={(v) => handleChange('dataProcessing', v)} />
          </Row>
        </div>
      </Card>
    </motion.div>
  )
}

function SecuritySection() {
  const { data: settings, refetch } = useSettings()
  const updateMutation = useUpdateSecurity()
  const security = settings?.security || {}

  const handleChange = (key, value) => {
    updateMutation.mutate({ [key]: value }, { onSuccess: () => refetch() })
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Security</Eyebrow>
        <div className="divide-y divide-hairline">
          <Row label="Two-factor authentication" hint="Add an extra layer of security">
            <Toggle defaultOn={security.twoFactorEnabled} onChange={(v) => handleChange('twoFactorEnabled', v)} />
          </Row>
          <Row label="Security notifications" hint="Get alerted about suspicious activity">
            <Toggle defaultOn={security.securityNotifications} onChange={(v) => handleChange('securityNotifications', v)} />
          </Row>
          <Row label="Recovery email" hint="Used for account recovery">
            <Input
              className="w-64"
              placeholder="recovery@example.com"
              value={security.recoveryEmail || ''}
              onChange={(e) => handleChange('recoveryEmail', e.target.value)}
            />
          </Row>
        </div>
      </Card>

      <Card className="mt-6">
        <Eyebrow className="mb-6">Change password</Eyebrow>
        <ChangePasswordForm />
      </Card>
    </motion.div>
  )
}

function ChangePasswordForm() {
  const mutation = useChangePassword()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = (data) => {
    mutation.mutate(data, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Current password" error={errors.currentPassword?.message}>
          <Input type="password" error={!!errors.currentPassword} {...register('currentPassword')} />
        </FormField>
        <FormField label="New password" error={errors.newPassword?.message}>
          <Input type="password" error={!!errors.newPassword} {...register('newPassword')} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" loading={isSubmitting}>
          Update password
        </Button>
      </div>
    </form>
  )
}

function ProductivitySection() {
  const { data: settings, refetch } = useSettings()
  const updateMutation = useUpdateProductivity()
  const productivity = settings?.productivity || {}

  const handleChange = (key, value) => {
    updateMutation.mutate({ [key]: value }, { onSuccess: () => refetch() })
  }

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Defaults</Eyebrow>
        <div className="divide-y divide-hairline">
          <Row label="Default planner view" hint="Preferred planner layout">
            <select
              value={productivity.defaultPlannerView || 'list'}
              onChange={(e) => handleChange('defaultPlannerView', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="list">List</option>
              <option value="calendar">Calendar</option>
              <option value="kanban">Kanban</option>
            </select>
          </Row>
          <Row label="Default analytics tab" hint="First tab shown in Analytics">
            <select
              value={productivity.defaultAnalyticsTab || 'overview'}
              onChange={(e) => handleChange('defaultAnalyticsTab', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="overview">Overview</option>
              <option value="applications">Applications</option>
              <option value="interviews">Interviews</option>
              <option value="dsa">DSA</option>
              <option value="planner">Planner</option>
              <option value="insights">Insights</option>
              <option value="reports">Reports</option>
            </select>
          </Row>
          <Row label="Start page" hint="Landing page after login">
            <select
              value={productivity.startPage || 'dashboard'}
              onChange={(e) => handleChange('startPage', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="dashboard">Dashboard</option>
              <option value="applications">Applications</option>
              <option value="analytics">Analytics</option>
              <option value="planner">Planner</option>
            </select>
          </Row>
          <Row label="DSA reminder frequency" hint="How often to remind about revisions">
            <select
              value={productivity.dsaReminderFrequency || 'weekly'}
              onChange={(e) => handleChange('dsaReminderFrequency', e.target.value)}
              className="bg-surface-2 ring-hairline rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Row>
          <Row label="Auto-create planner tasks" hint="Create tasks from interviews and deadlines">
            <Toggle defaultOn={productivity.autoCreatePlannerTasks} onChange={(v) => handleChange('autoCreatePlannerTasks', v)} />
          </Row>
          <Row label="Auto-create interview plans" hint="Generate prep plans for new interviews">
            <Toggle defaultOn={productivity.autoCreateInterviewPlans} onChange={(v) => handleChange('autoCreateInterviewPlans', v)} />
          </Row>
        </div>
      </Card>
    </motion.div>
  )
}

function IntegrationsSection() {
  const { data: integrationsData } = useIntegrations()

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">Connected services</Eyebrow>
        <div className="divide-y divide-hairline">
          {integrations.map((integration) => {
            const connected = integrationsData?.[integration.key]?.connected
            return (
              <div key={integration.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 first:border-t-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand/10 rounded-lg text-brand">
                    <integration.icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-ink font-medium">{integration.label}</div>
                    <div className="text-xs text-ink-3">{integration.description}</div>
                  </div>
                </div>
                <StatusPill tone={connected ? 'brand' : 'neutral'}>
                  {connected ? 'Connected' : 'Not connected'}
                </StatusPill>
              </div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}

function DataSection() {
  const exportMutation = useExportData()
  const clearCacheMutation = useClearCache()
  const resetMutation = useResetPreferences()
  const deleteArchivedMutation = useDeleteArchivedData()

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-6">Export and import</Eyebrow>
          <div className="divide-y divide-hairline">
            <Row label="Export all data" hint="JSON bundle of all your data">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportMutation.mutate()}
                loading={exportMutation.isPending}
              >
                <Download className="size-4 mr-2" /> Export
              </Button>
            </Row>
            <Row label="Import data" hint="Restore from a previous export">
              <Button variant="secondary" size="sm" disabled>
                <Upload className="size-4 mr-2" /> Coming soon
              </Button>
            </Row>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <Eyebrow className="mb-6">Maintenance</Eyebrow>
          <div className="divide-y divide-hairline">
            <Row label="Clear cache" hint="Free up local storage">
              <Button variant="secondary" size="sm" onClick={() => clearCacheMutation.mutate()} loading={clearCacheMutation.isPending}>
                <RefreshCw className="size-4 mr-2" /> Clear
              </Button>
            </Row>
            <Row label="Reset preferences" hint="Restore default settings">
              <Button variant="secondary" size="sm" onClick={() => { if (window.confirm('Reset all preferences to defaults?')) resetMutation.mutate() }} loading={resetMutation.isPending}>
                <Settings2 className="size-4 mr-2" /> Reset
              </Button>
            </Row>
            <Row label="Delete archived data" hint="Permanently remove archived records">
              <Button variant="secondary" size="sm" onClick={() => { if (window.confirm('Delete all archived data?')) deleteArchivedMutation.mutate() }} loading={deleteArchivedMutation.isPending}>
                <Trash2 className="size-4 mr-2" /> Delete
              </Button>
            </Row>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function AboutSection() {
  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card>
        <Eyebrow className="mb-6">About PlacementPilot</Eyebrow>
        <div className="space-y-4 text-sm text-ink-2">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono text-ink">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Build</span>
            <span className="font-mono text-ink">2026.07.18</span>
          </div>
          <div className="flex justify-between">
            <span>Environment</span>
            <span className="font-mono text-ink">Production</span>
          </div>
          <div className="pt-4 border-t border-hairline">
            <p className="text-xs text-ink-3">
              PlacementPilot is your all-in-one placement preparation platform. Track applications, ace interviews, master DSA, and stay organized with the planner.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function DangerZone() {
  const deleteAccountMutation = useDeleteAccount()

  return (
    <motion.div variants={staggerItem} initial="initial" animate="animate">
      <Card className="ring-1 ring-red-500/20">
        <Eyebrow className="mb-6 text-red-400">Danger zone</Eyebrow>
        <div className="divide-y divide-hairline">
          <Row label="Delete account" hint="All records will be purged within 30 days.">
            <Link
              to="/"
              className="bg-red-500/10 text-red-400 ring-1 ring-red-500/30 px-3 py-1.5 rounded-md text-sm hover:bg-red-500/20 transition inline-block"
              onClick={(e) => {
                if (window.confirm('Are you sure? This cannot be undone.')) {
                  deleteAccountMutation.mutate()
                } else {
                  e.preventDefault()
                }
              }}
            >
              Delete account
            </Link>
          </Row>
        </div>
      </Card>
    </motion.div>
  )
}

export default function Settings() {
  const [active, setActive] = useState('general')
  const { isLoading } = useSettings()

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="System configuration" title="Settings" />
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
        <PageHeader eyebrow="System configuration" title="Settings" />
        <PageBody className="grid grid-cols-12 gap-6">
          <nav className="col-span-12 lg:col-span-3" aria-label="Settings sections">
            <ul role="list" className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                      active === s.id
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-2 hover:bg-surface-2',
                    )}
                    aria-current={active === s.id ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <s.icon className="size-4" />
                      {s.label}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 lg:col-span-9">
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
              {active === 'general' && <GeneralSection />}
              {active === 'appearance' && <AppearanceSection />}
              {active === 'notifications' && <NotificationsSection />}
              {active === 'privacy' && <PrivacySection />}
              {active === 'security' && <SecuritySection />}
              {active === 'productivity' && <ProductivitySection />}
              {active === 'integrations' && <IntegrationsSection />}
              {active === 'data' && <DataSection />}
              {active === 'about' && <AboutSection />}
              {active === 'danger' && <DangerZone />}
            </motion.div>
          </div>
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
