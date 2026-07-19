import { ApplicationRepository } from '../repositories/application.repository.js'
import { NotificationService } from './notification.service.js'
import mongoose from 'mongoose'

export class ApplicationService {
  constructor() {
    this.repository = new ApplicationRepository()
    this.notificationService = new NotificationService()
  }

  async createApplication(userId, data) {
    const application = await this.repository.create(userId, data)

    // Add timeline entry
    await this.repository.addTimelineEntry(userId, application._id, {
      action: 'created',
      description: 'Application created',
    })

    // Create notification for deadline if set
    if (data.deadline) {
      await this.notificationService.createNotification(userId, {
        type: 'deadline',
        title: 'Application Deadline',
        message: `Deadline for ${data.company} - ${data.role} is approaching`,
        applicationId: application._id,
        scheduledFor: new Date(data.deadline),
      })
    }

    return application
  }

  async getApplication(userId, id) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }
    return application
  }

  async getApplications(userId, filters = {}, options = {}) {
    return this.repository.findAll(userId, filters, options)
  }

  async updateApplication(userId, id, data) {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Application not found')
    }

    const updates = { ...data }

    // Track stage change
    if (data.currentStage && data.currentStage !== existing.currentStage) {
      updates.timeline = {
        action: 'stage_changed',
        fromStage: existing.currentStage,
        toStage: data.currentStage,
        description: `Stage changed from ${existing.currentStage.replace(/_/g, ' ')} to ${data.currentStage.replace(/_/g, ' ')}`,
      }

      // Create notification for stage changes
      await this.notificationService.createNotification(userId, {
        type: 'stage_change',
        title: 'Application Stage Updated',
        message: `${existing.company} - ${existing.role} moved to ${data.currentStage.replace(/_/g, ' ')}`,
        applicationId: id,
      })
    }

    // Track status change
    if (data.status && data.status !== existing.status) {
      updates.timeline = {
        ...updates.timeline,
        fromStatus: existing.status,
        toStatus: data.status,
      }
    }

    const application = await this.repository.update(userId, id, updates)

    // Add timeline entry for stage/status changes
    if (updates.timeline) {
      await this.repository.addTimelineEntry(userId, id, updates.timeline)
    }

    return application
  }

  async deleteApplication(userId, id) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.delete(userId, id)
    return { message: 'Application deleted successfully' }
  }

  async archiveApplication(userId, id, archived = true) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.archive(userId, id, archived)
    return { message: archived ? 'Application archived' : 'Application unarchived' }
  }

  async restoreApplication(userId, id) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.restore(userId, id)
    return { message: 'Application restored' }
  }

  async duplicateApplication(userId, id) {
    const application = await this.repository.duplicate(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.addTimelineEntry(userId, application._id, {
      action: 'duplicated',
      description: 'Application duplicated',
    })

    return application
  }

  async bulkAction(userId, ids, action, data = {}) {
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new Error('No valid application IDs provided')
    }

    switch (action) {
      case 'archive':
        await this.repository.bulkArchive(userId, validIds, true)
        break
      case 'restore':
        await this.repository.bulkArchive(userId, validIds, false)
        break
      case 'delete':
        await this.repository.bulkDelete(userId, validIds)
        break
      case 'update_stage':
        if (!data.currentStage) throw new Error('Stage is required')
        await this.repository.bulkUpdate(userId, validIds, { currentStage: data.currentStage })
        break
      case 'update_status':
        if (!data.status) throw new Error('Status is required')
        await this.repository.bulkUpdate(userId, validIds, { status: data.status })
        break
      case 'update_priority':
        if (!data.priority) throw new Error('Priority is required')
        await this.repository.bulkUpdate(userId, validIds, { priority: data.priority })
        break
      default:
        throw new Error('Invalid action')
    }

    return { message: `Bulk ${action} completed successfully` }
  }

  async addNote(userId, id, note) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'note_added',
      description: 'Note added',
    })

    const updated = await this.repository.update(userId, id, { notes: note })
    return updated
  }

  async addAttachment(userId, id, attachment) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'attachment_uploaded',
      description: `Attachment uploaded: ${attachment.name}`,
    })

    const updated = await this.repository.addAttachment(userId, id, attachment)
    return updated
  }

  async removeAttachment(userId, id, attachmentUrl) {
    const application = await this.repository.findById(userId, id)
    if (!application) {
      throw new Error('Application not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'attachment_removed',
      description: 'Attachment removed',
    })

    const updated = await this.repository.removeAttachment(userId, id, attachmentUrl)
    return updated
  }

  async getDashboardStats(userId) {
    const [stats, pipeline, trends] = await Promise.all([
      this.repository.getApplicationStats(userId),
      this.repository.getPipelineSummary(userId),
      this.repository.getMonthlyTrends(userId, 6),
    ])

    return { stats, pipeline, trends }
  }

  async getUpcomingDeadlines(userId, limit = 10) {
    return this.repository.getUpcomingDeadlines(userId, limit)
  }

  async getRecentApplications(userId, limit = 10) {
    return this.repository.getRecentApplications(userId, limit)
  }

  async getCounts(userId) {
    const [statusCounts, stageCounts, priorityCounts] = await Promise.all([
      this.repository.countByStatus(userId),
      this.repository.countByStage(userId),
      this.repository.countByPriority(userId),
    ])

    return { statusCounts, stageCounts, priorityCounts }
  }
}