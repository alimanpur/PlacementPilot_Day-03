import { CompanyRepository } from '../repositories/company.repository.js'
import { ApplicationRepository } from '../repositories/application.repository.js'
import { InterviewRepository } from '../repositories/interview.repository.js'
import { RecruiterRepository } from '../repositories/recruiter.repository.js'
import { ResourceRepository } from '../repositories/resource.repository.js'
import { HiringInfoRepository } from '../repositories/hiring-info.repository.js'

export class CompanyService {
  constructor() {
    this.companyRepo = new CompanyRepository()
    this.applicationRepo = new ApplicationRepository()
    this.interviewRepo = new InterviewRepository()
    this.recruiterRepo = new RecruiterRepository()
    this.resourceRepo = new ResourceRepository()
    this.hiringInfoRepo = new HiringInfoRepository()
  }

  async createCompany(userId, data) {
    const company = await this.companyRepo.create(userId, data)
    await this.companyRepo.addTimeline(userId, company._id, {
      action: 'Company created',
      description: `Added ${data.name} to pipeline`,
    })
    return company
  }

  async getCompanies(userId, options = {}) {
    return this.companyRepo.findAll(userId, {}, options)
  }

  async getCompany(userId, id) {
    const company = await this.companyRepo.findByIdOrCode(userId, id)
    if (!company) return null

    // Fetch related data
    const [recruiters, resources, hiringInfo, applications, interviews] = await Promise.all([
      this.recruiterRepo.findByCompany(userId, company._id),
      this.resourceRepo.findByCompany(userId, company._id),
      this.hiringInfoRepo.findByCompany(userId, company._id),
      this.applicationRepo.findByCompany(userId, company._id),
      this.interviewRepo.findByCompany(userId, company._id),
    ])

    return {
      ...company.toObject(),
      recruiters,
      resources,
      hiringInfo,
      applications,
      interviews,
    }
  }

  async updateCompany(userId, id, data) {
    const company = await this.companyRepo.update(userId, id, data)
    if (!company) return null

    await this.companyRepo.addTimeline(userId, id, {
      action: 'Company updated',
      description: 'Updated company information',
    })

    return company
  }

  async deleteCompany(userId, id) {
    const company = await this.companyRepo.delete(userId, id)
    return company
  }

  async archiveCompany(userId, id, archived = true) {
    return this.companyRepo.archive(userId, id, archived)
  }

  async restoreCompany(userId, id) {
    return this.companyRepo.restore(userId, id)
  }

  async toggleFavorite(userId, id) {
    return this.companyRepo.toggleFavorite(userId, id)
  }

  async addNote(userId, id, note) {
    const company = await this.companyRepo.addNote(userId, id, note)
    if (!company) return null

    await this.companyRepo.addTimeline(userId, id, {
      action: 'Note added',
      description: 'Added a new note',
    })

    return company
  }

  async addAttachment(userId, id, attachment) {
    return this.companyRepo.addAttachment(userId, id, attachment)
  }

  async removeAttachment(userId, id, attachmentUrl) {
    return this.companyRepo.removeAttachment(userId, id, attachmentUrl)
  }

  async addTimeline(userId, id, timeline) {
    return this.companyRepo.addTimeline(userId, id, timeline)
  }

  // Recruiters
  async createRecruiter(userId, companyId, data) {
    return this.recruiterRepo.create(userId, { ...data, companyId })
  }

  async getRecruiters(userId, companyId) {
    return this.recruiterRepo.findByCompany(userId, companyId)
  }

  async updateRecruiter(userId, id, data) {
    return this.recruiterRepo.update(userId, id, data)
  }

  async deleteRecruiter(userId, id) {
    return this.recruiterRepo.delete(userId, id)
  }

  // Resources
  async createResource(userId, companyId, data) {
    return this.resourceRepo.create(userId, { ...data, companyId })
  }

  async getResources(userId, companyId, filters = {}) {
    return this.resourceRepo.findByCompany(userId, companyId, filters)
  }

  async updateResource(userId, id, data) {
    return this.resourceRepo.update(userId, id, data)
  }

  async deleteResource(userId, id) {
    return this.resourceRepo.delete(userId, id)
  }

  // Hiring Info
  async createHiringInfo(userId, companyId, data) {
    return this.hiringInfoRepo.create(userId, { ...data, companyId })
  }

  async getHiringInfo(userId, companyId) {
    return this.hiringInfoRepo.findByCompany(userId, companyId)
  }

  async updateHiringInfo(userId, companyId, data) {
    return this.hiringInfoRepo.upsertByCompany(userId, companyId, data)
  }

  async deleteHiringInfo(userId, id) {
    return this.hiringInfoRepo.delete(userId, id)
  }

  // Stats
  async getStats(userId) {
    return this.companyRepo.getStats(userId)
  }

  async updateCompanyStats(userId, companyId) {
    return this.companyRepo.updateStats(userId, companyId)
  }

  async getRecentCompanies(userId, limit = 10) {
    return this.companyRepo.findRecent(userId, limit)
  }

  async getFavoriteCompanies(userId) {
    return this.companyRepo.findFavorites(userId)
  }

  async getUpcomingFollowUps(userId, limit = 10) {
    return this.recruiterRepo.findUpcomingFollowUps(userId, limit)
  }
}