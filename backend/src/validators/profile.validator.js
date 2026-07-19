import { z } from 'zod'

export const profileSchema = z.object({
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

export const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200),
  type: z.enum(['resume', 'cover_letter', 'certificate', 'portfolio', 'offer_letter', 'transcript', 'other']),
  url: z.string().url('Enter a valid URL'),
  size: z.number().positive().optional(),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  category: z.enum(['Programming Language', 'Framework', 'Database', 'Tool', 'Soft Skill', 'CS Fundamentals', 'Other']),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  level: z.number().min(0).max(100).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})
