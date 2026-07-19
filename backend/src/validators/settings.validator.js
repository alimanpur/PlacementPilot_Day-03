import { z } from 'zod'

export const settingsSchema = z.object({
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const appearanceSchema = z.object({
  theme: z.enum(['dark', 'night-flight', 'high-contrast']).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  density: z.enum(['compact', 'comfortable']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  animationsEnabled: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
})

export const notificationSchema = z.object({
  interviews: z.boolean().optional(),
  weekly: z.boolean().optional(),
  problems: z.boolean().optional(),
  deadlines: z.boolean().optional(),
  marketing: z.boolean().optional(),
  achievements: z.boolean().optional(),
  reports: z.boolean().optional(),
  reminders: z.boolean().optional(),
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  inApp: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  quietHours: z.object({
    enabled: z.boolean().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
})

export const privacySchema = z.object({
  publicProfile: z.boolean().optional(),
  activityVisibility: z.enum(['public', 'private', 'connections']).optional(),
  achievementVisibility: z.enum(['public', 'private', 'connections']).optional(),
  documentVisibility: z.enum(['public', 'private', 'connections']).optional(),
  analyticsSharing: z.boolean().optional(),
  dataProcessing: z.boolean().optional(),
})

export const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  recoveryEmail: z.string().email().optional().or(z.literal('')),
  securityNotifications: z.boolean().optional(),
})

export const productivitySchema = z.object({
  defaultPlannerView: z.enum(['list', 'calendar', 'kanban']).optional(),
  defaultAnalyticsTab: z.enum(['overview', 'applications', 'companies', 'interviews', 'dsa', 'planner', 'insights', 'reports']).optional(),
  defaultDashboardWidgets: z.array(z.string()).optional(),
  defaultCalendarView: z.enum(['day', 'week', 'month']).optional(),
  autoCreatePlannerTasks: z.boolean().optional(),
  autoCreateInterviewPlans: z.boolean().optional(),
  dsaReminderFrequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  startPage: z.enum(['dashboard', 'applications', 'analytics', 'planner']).optional(),
})

export const integrationSchema = z.object({
  key: z.string(),
  enabled: z.boolean().optional(),
  connected: z.boolean().optional(),
  connectedAt: z.string().optional(),
  settings: z.record(z.any()).optional(),
})
