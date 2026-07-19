import { z } from 'zod'

export const interviewSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID').optional().nullable(),
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID').optional().nullable(),
  role: z.string().optional(),
  type: z.enum([
    'phone_screen',
    'recruiter_call',
    'online_assessment_review',
    'technical_interview',
    'live_coding',
    'system_design',
    'managerial',
    'behavioral',
    'hr',
    'final_round',
    'bar_raiser',
    'group_discussion',
    'case_study',
    'custom',
  ]),
  customTypeLabel: z.string().optional(),
  round: z.string().min(1, 'Round name is required'),
  roundNumber: z.number().int().min(1).optional(),
  mode: z.enum(['online', 'phone', 'onsite', 'video_call']).optional(),
  status: z.enum(['scheduled', 'rescheduled', 'completed', 'cancelled', 'no_show', 'pending_feedback']).optional(),
  scheduledDate: z.string().or(z.date()),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  duration: z.number().int().min(15).optional(),
  timezone: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  meetingPlatform: z.enum(['google_meet', 'zoom', 'teams', 'skype', 'phone', 'in_person', 'other']).optional(),
  officeAddress: z.string().optional(),
  dialIn: z.string().optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().email().optional().or(z.literal('')),
  recruiterPhone: z.string().optional(),
  recruiterLinkedIn: z.string().optional(),
  interviewers: z.array(z.object({
    name: z.string().min(1, 'Interviewer name is required'),
    email: z.string().optional(),
    role: z.string().optional(),
    linkedIn: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  preparation: z.object({
    preparationNotes: z.string().optional(),
    dsaTopics: z.array(z.string()).optional(),
    systemDesignTopics: z.array(z.string()).optional(),
    behavioralTopics: z.array(z.string()).optional(),
    companyResources: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
    previousExperiences: z.array(z.string()).optional(),
    customNotes: z.string().optional(),
  }).optional(),
})

export const interviewUpdateSchema = interviewSchema.partial()

export const interviewIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid interview ID'),
})

export const interviewScheduleSchema = z.object({
  scheduledDate: z.string().or(z.date()),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  duration: z.number().int().min(15).optional(),
  timezone: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  meetingPlatform: z.enum(['google_meet', 'zoom', 'teams', 'skype', 'phone', 'in_person', 'other']).optional(),
  officeAddress: z.string().optional(),
  dialIn: z.string().optional(),
})

export const interviewFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'very_hard']).optional(),
  questionsAsked: z.array(z.string()).optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
  decision: z.enum(['selected', 'rejected', 'on_hold', 'further_rounds', 'no_decision']).optional(),
  nextRound: z.string().optional(),
  improvementNotes: z.string().optional(),
})

export const interviewPreparationChecklistSchema = z.object({
  items: z.array(z.object({
    item: z.string().min(1, 'Checklist item is required'),
    completed: z.boolean().optional(),
  })),
})

export const interviewPreparationItemSchema = z.object({
  item: z.string().min(1, 'Checklist item is required'),
})

export const interviewFilterSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  round: z.string().optional(),
  company: z.string().optional(),
  mode: z.enum(['online', 'phone', 'onsite', 'video_call']).optional(),
  decision: z.enum(['selected', 'rejected', 'on_hold', 'further_rounds', 'no_decision']).optional(),
  result: z.enum(['pass', 'fail', 'hold', 'pending', 'not_applicable']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  search: z.string().optional(),
})

export const interviewAddInterviewerSchema = z.object({
  name: z.string().min(1, 'Interviewer name is required'),
  email: z.string().optional(),
  role: z.string().optional(),
  linkedIn: z.string().optional(),
})

export const interviewBulkActionSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, 'At least one ID is required'),
  action: z.enum(['archive', 'restore', 'delete', 'update_status', 'update_priority']),
  data: z.record(z.any()).optional(),
})