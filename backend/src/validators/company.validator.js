import { z } from 'zod'

export const companySchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Company name is required').max(100),
  logo: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  careerPage: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Classification
  industry: z.string().max(100).optional().or(z.literal('')),
  sector: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),

  // Location
  headquarters: z.string().max(200).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  founded: z.number().int().min(1600).max(new Date().getFullYear()).optional().or(z.literal('')),

  // Company Details
  companySize: z.string().max(100).optional().or(z.literal('')),
  companyType: z.enum(['Public', 'Private', 'Startup', 'MNC', 'Government']).optional(),
  stockSymbol: z.string().max(20).optional().or(z.literal('')),

  // Work & Employment
  workModes: z.array(z.enum(['Remote', 'Hybrid', 'Onsite'])).optional(),
  employmentTypes: z.array(z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])).optional(),

  // Status
  hiringStatus: z.enum(['Active', 'Inactive', 'Archived']).optional(),
  active: z.boolean().optional(),

  // User Preferences
  favorite: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  // Tags & Notes
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),

  // Attachments
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['pdf', 'image', 'document', 'other']).optional(),
  })).optional(),

  // Ownership
  owner: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().or(z.literal('')),
})

export const companyUpdateSchema = companySchema.partial()

export const companyIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$|^[a-zA-Z0-9]+$/, 'Invalid company ID'),
})

export const companySearchSchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  hiringStatus: z.enum(['Active', 'Inactive', 'Archived']).optional().or(z.literal('')),
  favorite: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().or(z.literal('')),
  archived: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
})

export const recruiterSchema = z.object({
  name: z.string().min(1, 'Recruiter name is required').max(100),
  role: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  relationshipStatus: z.enum(['Contacted', 'Responded', 'In Conversation', 'Interview Scheduled', 'Offer Extended', 'Closed']).optional(),
  lastContact: z.string().datetime().optional().or(z.literal('')),
  nextFollowUp: z.string().datetime().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export const recruiterUpdateSchema = recruiterSchema.partial()

export const resourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required').max(200),
  type: z.enum(['Interview Experience', 'OA Experience', 'Preparation Notes', 'Important Links', 'PDF', 'Video', 'Job Description', 'Reference Material', 'Other']),
  description: z.string().max(1000).optional().or(z.literal('')),
  content: z.string().max(5000).optional().or(z.literal('')),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Unknown']).optional(),
  round: z.string().max(100).optional().or(z.literal('')),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['pdf', 'image', 'video', 'document', 'other']).optional(),
    size: z.number().optional(),
  })).optional(),
})

export const resourceUpdateSchema = resourceSchema.partial()

export const hiringInfoSchema = z.object({
  minimumCgpa: z.number().min(0).max(10).optional().or(z.literal('')),
  eligibleBranches: z.array(z.string().max(50)).optional(),
  eligibleBatch: z.array(z.string().max(50)).optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Intern + PPO']).optional(),
  internshipDuration: z.string().max(100).optional().or(z.literal('')),
  ppoConversionRate: z.number().min(0).max(100).optional().or(z.literal('')),
  expectedCtc: z.number().min(0).optional().or(z.literal('')),
  historicalCtc: z.array(z.object({
    year: z.number().int(),
    amount: z.number().min(0),
    currency: z.string().optional(),
  })).optional(),
  ctcBreakdown: z.object({
    base: z.number().min(0).optional(),
    variable: z.number().min(0).optional(),
    bonus: z.number().min(0).optional(),
    stock: z.number().min(0).optional(),
    benefits: z.number().min(0).optional(),
  }).optional(),
  bondInformation: z.object({
    hasBond: z.boolean().optional(),
    bondDuration: z.string().max(100).optional().or(z.literal('')),
    bondAmount: z.number().min(0).optional().or(z.literal('')),
    bondDescription: z.string().max(500).optional().or(z.literal('')),
  }).optional(),
  hiringFrequency: z.enum(['Annual', 'Bi-annual', 'Quarterly', 'Monthly', 'As Needed', 'Unknown']).optional(),
  selectionProcess: z.string().max(2000).optional().or(z.literal('')),
  rounds: z.array(z.object({
    name: z.string().max(100),
    type: z.enum(['Online Assessment', 'Technical', 'HR', 'Managerial', 'System Design', 'Behavioral']).optional(),
    duration: z.string().max(100).optional().or(z.literal('')),
    description: z.string().max(500).optional().or(z.literal('')),
  })).optional(),
  oaPlatform: z.string().max(100).optional().or(z.literal('')),
  techStack: z.array(z.string().max(50)).optional(),
  importantSkills: z.array(z.string().max(50)).optional(),
  applicationDeadline: z.string().datetime().optional().or(z.literal('')),
  applicationLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  recruitmentCycle: z.enum(['Summer Internship', 'Winter Internship', 'Full-time', 'Off-campus', 'On-campus', 'Referral']).optional(),
})

export const hiringInfoUpdateSchema = hiringInfoSchema.partial()