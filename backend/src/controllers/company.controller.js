import { CompanyService } from '../services/company.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import {
  companySchema,
  companyUpdateSchema,
  companyIdSchema,
  companySearchSchema,
  recruiterSchema,
  recruiterUpdateSchema,
  resourceSchema,
  resourceUpdateSchema,
  hiringInfoSchema,
  hiringInfoUpdateSchema,
} from '../validators/company.validator.js'

const companyService = new CompanyService()

// Company CRUD
export const getAllCompanies = asyncWrapper(async (req, res) => {
  const validation = companySearchSchema.safeParse(req.query)
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: validation.error.errors[0].message,
      data: null,
    })
  }

  const { search, industry, hiringStatus, favorite, priority, archived, tags, page, limit, sort } = validation.data

  const result = await companyService.getCompanies(req.user._id, {
    search,
    industry,
    hiringStatus,
    favorite,
    priority,
    archived,
    tags,
    page: page || 1,
    limit: limit || 20,
    sort: sort || '-createdAt',
  })

  res.json({
    success: true,
    message: 'Companies retrieved',
    data: result,
  })
})

export const getCompany = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const company = await companyService.getCompany(req.user._id, id)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Company retrieved',
    data: { company },
  })
})

export const createCompany = asyncWrapper(async (req, res) => {
  const data = companySchema.parse(req.body)
  const company = await companyService.createCompany(req.user._id, data)

  res.status(201).json({
    success: true,
    message: 'Company added to pipeline',
    data: { company },
  })
})

export const updateCompany = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const data = companyUpdateSchema.parse(req.body)
  const company = await companyService.updateCompany(req.user._id, id, data)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Company updated',
    data: { company },
  })
})

export const deleteCompany = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const company = await companyService.deleteCompany(req.user._id, id)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Company removed',
    data: null,
  })
})

export const archiveCompany = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const { archived = true } = req.body
  const company = await companyService.archiveCompany(req.user._id, id, archived)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: archived ? 'Company archived' : 'Company unarchived',
    data: { company },
  })
})

export const restoreCompany = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const company = await companyService.restoreCompany(req.user._id, id)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Company restored',
    data: { company },
  })
})

export const toggleFavorite = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const company = await companyService.toggleFavorite(req.user._id, id)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: company.favorite ? 'Added to favorites' : 'Removed from favorites',
    data: { company },
  })
})

// Notes
export const addNote = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const { note } = req.body
  const company = await companyService.addNote(req.user._id, id, note)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Note added',
    data: { company },
  })
})

// Attachments
export const addAttachment = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const attachment = req.body
  const company = await companyService.addAttachment(req.user._id, id, attachment)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Attachment added',
    data: { company },
  })
})

export const removeAttachment = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const { url } = req.body
  const company = await companyService.removeAttachment(req.user._id, id, url)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Attachment removed',
    data: { company },
  })
})

// Timeline
export const addTimeline = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const timeline = req.body
  const company = await companyService.addTimeline(req.user._id, id, timeline)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Timeline entry added',
    data: { company },
  })
})

// Recruiters
export const createRecruiter = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const data = recruiterSchema.parse(req.body)
  const recruiter = await companyService.createRecruiter(req.user._id, id, data)

  res.status(201).json({
    success: true,
    message: 'Recruiter added',
    data: { recruiter },
  })
})

export const getRecruiters = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const recruiters = await companyService.getRecruiters(req.user._id, id)

  res.json({
    success: true,
    message: 'Recruiters retrieved',
    data: { recruiters },
  })
})

export const updateRecruiter = asyncWrapper(async (req, res) => {
  const { id, recruiterId } = req.params
  companyIdSchema.parse({ id })
  const data = recruiterUpdateSchema.parse(req.body)
  const recruiter = await companyService.updateRecruiter(req.user._id, recruiterId, data)

  if (!recruiter) {
    return res.status(404).json({
      success: false,
      message: 'Recruiter not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Recruiter updated',
    data: { recruiter },
  })
})

export const deleteRecruiter = asyncWrapper(async (req, res) => {
  const { recruiterId } = req.params
  const recruiter = await companyService.deleteRecruiter(req.user._id, recruiterId)

  if (!recruiter) {
    return res.status(404).json({
      success: false,
      message: 'Recruiter not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Recruiter removed',
    data: null,
  })
})

// Resources
export const createResource = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const data = resourceSchema.parse(req.body)
  const resource = await companyService.createResource(req.user._id, id, data)

  res.status(201).json({
    success: true,
    message: 'Resource added',
    data: { resource },
  })
})

export const getResources = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const { type, round, difficulty, year, search } = req.query
  const resources = await companyService.getResources(req.user._id, id, {
    type,
    round,
    difficulty,
    year,
    search,
  })

  res.json({
    success: true,
    message: 'Resources retrieved',
    data: { resources },
  })
})

export const updateResource = asyncWrapper(async (req, res) => {
  const { resourceId } = req.params
  const data = resourceUpdateSchema.parse(req.body)
  const resource = await companyService.updateResource(req.user._id, resourceId, data)

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Resource updated',
    data: { resource },
  })
})

export const deleteResource = asyncWrapper(async (req, res) => {
  const { resourceId } = req.params
  const resource = await companyService.deleteResource(req.user._id, resourceId)

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Resource removed',
    data: null,
  })
})

// Hiring Info
export const createHiringInfo = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const data = hiringInfoSchema.parse(req.body)
  const hiringInfo = await companyService.createHiringInfo(req.user._id, id, data)

  res.status(201).json({
    success: true,
    message: 'Hiring information added',
    data: { hiringInfo },
  })
})

export const getHiringInfo = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const hiringInfo = await companyService.getHiringInfo(req.user._id, id)

  if (!hiringInfo) {
    return res.status(404).json({
      success: false,
      message: 'Hiring information not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Hiring information retrieved',
    data: { hiringInfo },
  })
})

export const updateHiringInfo = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const data = hiringInfoUpdateSchema.parse(req.body)
  const hiringInfo = await companyService.updateHiringInfo(req.user._id, id, data)

  if (!hiringInfo) {
    return res.status(404).json({
      success: false,
      message: 'Hiring information not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Hiring information updated',
    data: { hiringInfo },
  })
})

export const deleteHiringInfo = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const hiringInfo = await companyService.deleteHiringInfo(req.user._id, id)

  if (!hiringInfo) {
    return res.status(404).json({
      success: false,
      message: 'Hiring information not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Hiring information removed',
    data: null,
  })
})

// Stats
export const getCompanyStats = asyncWrapper(async (req, res) => {
  const stats = await companyService.getStats(req.user._id)
  res.json({
    success: true,
    message: 'Company stats retrieved',
    data: { stats },
  })
})

export const updateCompanyStats = asyncWrapper(async (req, res) => {
  const { id } = companyIdSchema.parse(req.params)
  const company = await companyService.updateCompanyStats(req.user._id, id)

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
      data: null,
    })
  }

  res.json({
    success: true,
    message: 'Company stats updated',
    data: { company },
  })
})

// Favorites & Recent
export const getFavoriteCompanies = asyncWrapper(async (req, res) => {
  const companies = await companyService.getFavoriteCompanies(req.user._id)
  res.json({
    success: true,
    message: 'Favorite companies retrieved',
    data: { companies },
  })
})

export const getRecentCompanies = asyncWrapper(async (req, res) => {
  const { limit = 10 } = req.query
  const companies = await companyService.getRecentCompanies(req.user._id, parseInt(limit))
  res.json({
    success: true,
    message: 'Recent companies retrieved',
    data: { companies },
  })
})

export const getUpcomingFollowUps = asyncWrapper(async (req, res) => {
  const { limit = 10 } = req.query
  const followUps = await companyService.getUpcomingFollowUps(req.user._id, parseInt(limit))
  res.json({
    success: true,
    message: 'Upcoming follow-ups retrieved',
    data: { followUps },
  })
})