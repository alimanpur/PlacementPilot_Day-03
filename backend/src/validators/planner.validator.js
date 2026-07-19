import { z } from 'zod'

export const plannerTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).optional(),
  category: z.enum(['placement', 'interview_prep', 'dsa', 'projects', 'resume', 'applications', 'mock_interview', 'revision', 'personal', 'custom']).optional(),
  estimatedTime: z.number().min(0).optional(),
  actualTime: z.number().min(0).optional(),
  deadline: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  reminder: z.object({
    enabled: z.boolean().optional(),
    date: z.coerce.date().optional(),
  }).optional(),
  repeatRule: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom']).optional(),
  repeatInterval: z.number().min(1).optional(),
  repeatEndDate: z.coerce.date().optional(),
  parentTask: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  checklist: z.array(z.object({
    item: z.string().min(1),
    completed: z.boolean().optional(),
  })).optional(),
  color: z.string().max(7).optional(),
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(5000).optional(),
  calendarEvent: z.object({
    title: z.string().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
    allDay: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  linkedModule: z.enum(['interview', 'application', 'company', 'dsa', 'goal', 'habit', 'none']).optional(),
  linkedId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  linkedType: z.enum(['interview', 'application', 'company', 'dsa_problem', 'dsa_revision', 'dsa_roadmap', 'goal', 'habit', 'none']).optional(),
})

export const plannerHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['dsa', 'applications', 'mock_interview', 'resume', 'projects', 'personal', 'custom']).optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']).optional(),
  frequencyDays: z.array(z.number().min(0).max(6)).optional(),
  target: z.number().min(1).optional(),
  unit: z.string().optional(),
  reminders: z.array(z.object({
    time: z.string(),
    enabled: z.boolean().optional(),
  })).optional(),
  color: z.string().max(7).optional(),
  icon: z.string().max(2).optional(),
  active: z.boolean().optional(),
})

export const plannerGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['daily', 'weekly', 'monthly', 'target_company', 'solved_problems', 'interview', 'application', 'custom']).optional(),
  progress: z.number().min(0).max(100).optional(),
  target: z.number().min(0).optional(),
  current: z.number().min(0).optional(),
  unit: z.string().optional(),
  deadline: z.coerce.date().optional(),
  cadence: z.string().optional(),
  tone: z.enum(['brand', 'accent', 'muted']).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    target: z.number(),
    current: z.number(),
    unit: z.string(),
    completed: z.boolean().optional(),
  })).optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'paused']).optional(),
})

export const plannerSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).optional(),
  category: z.enum(['placement', 'interview_prep', 'dsa', 'projects', 'resume', 'applications', 'mock_interview', 'revision', 'personal', 'custom']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  linkedModule: z.enum(['interview', 'application', 'company', 'dsa', 'goal', 'habit', 'none']).optional(),
  tags: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  overdue: z.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const plannerIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid planner ID'),
})

export const plannerBulkActionSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid planner ID')).min(1, 'At least one ID is required'),
  action: z.enum(['delete', 'complete', 'archive', 'unarchive', 'cancel']),
})
