import { z } from 'zod'

export const applicationSchema = z.object({
  // Company Information
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional(),
  jobId: z.string().optional(),

  // Employment Details
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']).optional(),
  workMode: z.enum(['Remote', 'Hybrid', 'Onsite']).optional(),
  location: z.string().optional(),
  package: z.number().min(0).optional(),
  currency: z.string().optional(),

  // Source & Recruiter
  source: z.enum(['LinkedIn', 'Company Website', 'Referral', 'Job Portal', 'Campus', 'Recruiter', 'Other']).optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  recruiterLinkedIn: z.string().optional(),

  // Documents
  resumeVersion: z.string().optional(),
  coverLetter: z.string().optional(),
  portfolioLink: z.string().optional(),

  // Important Dates
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  expectedJoining: z.string().optional(),
  reminderDate: z.string().optional(),

  // Pipeline
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  currentStage: z.enum([
    'wishlist',
    'ready_to_apply',
    'applied',
    'online_assessment',
    'technical_interview',
    'managerial_interview',
    'hr_interview',
    'offer',
    'accepted',
    'rejected',
    'withdrawn',
  ]).optional(),
  status: z.enum(['active', 'pending', 'on_hold', 'completed', 'cancelled']).optional(),

  // Additional Information
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Attachments
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(['resume', 'cover_letter', 'offer_letter', 'job_description', 'other']).optional(),
  })).optional(),
})

export const applicationUpdateSchema = applicationSchema.partial()

export const applicationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID'),
})

export const applicationBulkActionSchema = z.object({
  ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID')).min(1, 'At least one ID is required'),
  action: z.enum(['archive', 'restore', 'delete', 'update_stage', 'update_status', 'update_priority']),
  data: z.object({
    currentStage: z.enum([
      'wishlist',
      'ready_to_apply',
      'applied',
      'online_assessment',
      'technical_interview',
      'managerial_interview',
      'hr_interview',
      'offer',
      'accepted',
      'rejected',
      'withdrawn',
    ]).optional(),
    status: z.enum(['active', 'pending', 'on_hold', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  }).optional(),
})

export const applicationFilterSchema = z.object({
  search: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'pending', 'on_hold', 'completed', 'cancelled']).optional(),
  currentStage: z.enum([
    'wishlist',
    'ready_to_apply',
    'applied',
    'online_assessment',
    'technical_interview',
    'managerial_interview',
    'hr_interview',
    'offer',
    'accepted',
    'rejected',
    'withdrawn',
  ]).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  source: z.enum(['LinkedIn', 'Company Website', 'Referral', 'Job Portal', 'Campus', 'Recruiter', 'Other']).optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']).optional(),
  location: z.string().optional(),
  workMode: z.enum(['Remote', 'Hybrid', 'Onsite']).optional(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
  appliedDateFrom: z.string().optional(),
  appliedDateTo: z.string().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
  sortBy: z.enum(['company', 'role', 'priority', 'deadline', 'appliedDate', 'createdAt', 'updatedAt', 'package', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})