import { InterviewRepository } from '../repositories/interview.repository.js'
import { ApplicationRepository } from '../repositories/application.repository.js'
import { NotificationService } from './notification.service.js'
import mongoose from 'mongoose'

export class InterviewService {
  constructor() {
    this.repository = new InterviewRepository()
    this.applicationRepository = new ApplicationRepository()
    this.notificationService = new NotificationService()
  }

  async createInterview(userId, data) {
    // Check for scheduling conflicts
    if (data.scheduledDate && data.scheduledTime) {
      const conflicts = await this.repository.checkConflict(
        userId,
        data.scheduledDate,
        data.scheduledTime,
        data.duration || 60,
      )
      if (conflicts.length > 0) {
        const conflict = conflicts[0]
        throw new Error(`Scheduling conflict detected with interview at ${conflict.company} - ${conflict.round} on ${conflict.scheduledDate}`)
      }
    }

    const interview = await this.repository.create(userId, {
      ...data,
      createdBy: userId,
      owner: userId,
    })

    // Add timeline entry
    await this.repository.addTimelineEntry(userId, interview._id, {
      action: 'scheduled',
      toStatus: 'scheduled',
      description: `Interview scheduled: ${data.type.replace(/_/g, ' ')} - ${data.round}`,
    })

    // Update application stage if linked
    if (data.applicationId) {
      await this._updateApplicationStage(userId, data.applicationId, data.type)
    }

    // Create notification
    await this._createInterviewNotification(userId, interview, 'scheduled')

    return interview
  }

  async getInterview(userId, id) {
    const interview = await this.repository.findByIdDetailed(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }
    return interview
  }

  async getInterviews(userId, filters = {}, options = {}) {
    return this.repository.findAll(userId, filters, options)
  }

  async updateInterview(userId, id, data) {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Interview not found')
    }

    // Check for scheduling conflicts if date/time changed
    const dateChanged = data.scheduledDate && data.scheduledDate.toString() !== existing.scheduledDate?.toString()
    const timeChanged = data.scheduledTime && data.scheduledTime !== existing.scheduledTime

    if ((dateChanged || timeChanged) && (data.scheduledDate || existing.scheduledDate) && (data.scheduledTime || existing.scheduledTime)) {
      const conflicts = await this.repository.checkConflict(
        userId,
        data.scheduledDate || existing.scheduledDate,
        data.scheduledTime || existing.scheduledTime,
        data.duration || existing.duration || 60,
        id,
      )
      if (conflicts.length > 0) {
        const conflict = conflicts[0]
        throw new Error(`Scheduling conflict detected with interview at ${conflict.company} - ${conflict.round}`)
      }
    }

    const updates = { ...data, updatedBy: userId }

    // Track status changes
    if (data.status && data.status !== existing.status) {
      await this.repository.addTimelineEntry(userId, id, {
        action: data.status === 'rescheduled' ? 'rescheduled' :
                data.status === 'completed' ? 'completed' :
                data.status === 'cancelled' ? 'cancelled' :
                data.status === 'no_show' ? 'no_show' : 'status_changed',
        fromStatus: existing.status,
        toStatus: data.status,
        description: `Status changed from ${existing.status} to ${data.status}`,
      })

      // Create notification for status changes
      await this._createInterviewNotification(userId, { ...existing.toObject(), ...data }, data.status)
    }

    // Track rescheduling
    if (dateChanged || timeChanged) {
      await this.repository.addTimelineEntry(userId, id, {
        action: 'rescheduled',
        fromStatus: existing.status,
        toStatus: 'rescheduled',
        description: `Rescheduled from ${existing.scheduledDate?.toLocaleDateString()} ${existing.scheduledTime} to ${data.scheduledDate?.toLocaleDateString?.() || existing.scheduledDate?.toLocaleDateString()} ${data.scheduledTime || existing.scheduledTime}`,
      })

      if (existing.status === 'scheduled') {
        updates.status = 'rescheduled'
      }
    }

    const interview = await this.repository.update(userId, id, updates)

    // Update application if linked
    if (data.status === 'completed' && existing.applicationId) {
      await this._updateApplicationOnCompletion(userId, existing.applicationId, data)
    }

    return interview
  }

  async deleteInterview(userId, id) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'deleted',
      fromStatus: interview.status,
      description: 'Interview deleted',
    })

    await this.repository.delete(userId, id)
    return { message: 'Interview deleted successfully' }
  }

  async archiveInterview(userId, id, archived = true) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.archive(userId, id, archived)
    return { message: archived ? 'Interview archived' : 'Interview unarchived' }
  }

  async restoreInterview(userId, id) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.restore(userId, id)
    return { message: 'Interview restored' }
  }

  async duplicateInterview(userId, id) {
    const interview = await this.repository.duplicate(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, interview._id, {
      action: 'duplicated',
      description: 'Interview duplicated',
    })

    return interview
  }

  async rescheduleInterview(userId, id, scheduleData) {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Interview not found')
    }

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      throw new Error(`Cannot reschedule a ${existing.status} interview`)
    }

    // Check for conflicts
    const conflicts = await this.repository.checkConflict(
      userId,
      scheduleData.scheduledDate,
      scheduleData.scheduledTime,
      scheduleData.duration || existing.duration || 60,
      id,
    )
    if (conflicts.length > 0) {
      const conflict = conflicts[0]
      throw new Error(`Scheduling conflict detected with interview at ${conflict.company} - ${conflict.round}`)
    }

    const updates = {
      ...scheduleData,
      status: 'rescheduled',
      updatedBy: userId,
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'rescheduled',
      fromStatus: existing.status,
      toStatus: 'rescheduled',
      description: `Rescheduled from ${existing.scheduledDate?.toLocaleDateString()} ${existing.scheduledTime} to ${new Date(scheduleData.scheduledDate).toLocaleDateString()} ${scheduleData.scheduledTime}`,
    })

    const interview = await this.repository.update(userId, id, updates)

    // Create notification
    await this._createInterviewNotification(userId, interview, 'rescheduled')

    return interview
  }

  async cancelInterview(userId, id, reason = '') {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Interview not found')
    }

    if (existing.status === 'completed') {
      const error = new Error('Cannot cancel a completed interview')
      error.statusCode = 400
      error.code = 'INVALID_INTERVIEW_STATUS'
      throw error
    }

    const updates = {
      status: 'cancelled',
      updatedBy: userId,
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'cancelled',
      fromStatus: existing.status,
      toStatus: 'cancelled',
      description: reason ? `Cancelled: ${reason}` : 'Interview cancelled',
    })

    const interview = await this.repository.update(userId, id, updates)

    // Create notification
    await this._createInterviewNotification(userId, interview, 'cancelled')

    return interview
  }

  async completeInterview(userId, id) {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Interview not found')
    }

    if (existing.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled interview')
    }

    const updates = {
      status: 'completed',
      updatedBy: userId,
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'completed',
      fromStatus: existing.status,
      toStatus: 'completed',
      description: 'Interview completed',
    })

    const interview = await this.repository.update(userId, id, updates)

    // Create notification for feedback reminder
    await this.notificationService.createNotification(userId, {
      type: 'interview',
      title: 'Feedback Required',
      message: `Please submit feedback for ${existing.company} - ${existing.round}`,
      tag: 'interview',
      meta: JSON.stringify({ interviewId: id, company: existing.company, round: existing.round }),
    })

    return interview
  }

  async submitFeedback(userId, id, feedbackData) {
    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Interview not found')
    }

    if (existing.status !== 'completed') {
      const error = new Error('Can only submit feedback for completed interviews')
      error.statusCode = 400
      error.code = 'INVALID_INTERVIEW_STATUS'
      throw error
    }

    const updates = {
      feedback: {
        ...feedbackData,
        submittedAt: new Date(),
      },
      updatedBy: userId,
    }

    // Auto-set result based on decision
    if (feedbackData.decision === 'selected') {
      updates.result = 'pass'
    } else if (feedbackData.decision === 'rejected') {
      updates.result = 'fail'
    } else if (feedbackData.decision === 'on_hold') {
      updates.result = 'hold'
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'feedback_submitted',
      description: `Feedback submitted with decision: ${feedbackData.decision || 'no_decision'}`,
    })

    const interview = await this.repository.update(userId, id, updates)

    // Update application if linked
    if (existing.applicationId) {
      await this._updateApplicationOnFeedback(userId, existing.applicationId, feedbackData)
    }

    return interview
  }

  async addNote(userId, id, note) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'note_added',
      description: 'Note added',
    })

    const updated = await this.repository.update(userId, id, { notes: note })
    return updated
  }

  async addAttachment(userId, id, attachment) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'attachment_uploaded',
      description: `Attachment uploaded: ${attachment.name}`,
    })

    const updated = await this.repository.addAttachment(userId, id, attachment)
    return updated
  }

  async removeAttachment(userId, id, attachmentUrl) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'attachment_removed',
      description: 'Attachment removed',
    })

    const updated = await this.repository.removeAttachment(userId, id, attachmentUrl)
    return updated
  }

  // Preparation Center
  async addChecklistItem(userId, id, item) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    const updated = await this.repository.addChecklistItem(userId, id, item)
    await this.repository.updatePreparationProgress(userId, id)
    return updated
  }

  async toggleChecklistItem(userId, id, itemId, completed) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    const updated = await this.repository.toggleChecklistItem(userId, id, itemId, completed)
    await this.repository.updatePreparationProgress(userId, id)
    return updated
  }

  async removeChecklistItem(userId, id, itemId) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    const updated = await this.repository.removeChecklistItem(userId, id, itemId)
    await this.repository.updatePreparationProgress(userId, id)
    return updated
  }

  async updatePreparation(userId, id, preparationData) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    const updates = {}
    if (preparationData.preparationNotes !== undefined) updates['preparation.preparationNotes'] = preparationData.preparationNotes
    if (preparationData.dsaTopics !== undefined) updates['preparation.dsaTopics'] = preparationData.dsaTopics
    if (preparationData.systemDesignTopics !== undefined) updates['preparation.systemDesignTopics'] = preparationData.systemDesignTopics
    if (preparationData.behavioralTopics !== undefined) updates['preparation.behavioralTopics'] = preparationData.behavioralTopics
    if (preparationData.companyResources !== undefined) updates['preparation.companyResources'] = preparationData.companyResources
    if (preparationData.previousExperiences !== undefined) updates['preparation.previousExperiences'] = preparationData.previousExperiences
    if (preparationData.customNotes !== undefined) updates['preparation.customNotes'] = preparationData.customNotes

    return this.repository.update(userId, id, updates)
  }

  // Interviewers
  async addInterviewer(userId, id, interviewer) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    await this.repository.addTimelineEntry(userId, id, {
      action: 'interviewer_added',
      description: `Interviewer added: ${interviewer.name}`,
    })

    return this.repository.addInterviewer(userId, id, interviewer)
  }

  async removeInterviewer(userId, id, interviewerId) {
    const interview = await this.repository.findById(userId, id)
    if (!interview) {
      throw new Error('Interview not found')
    }

    return this.repository.removeInterviewer(userId, id, interviewerId)
  }

  // Bulk Actions
  async bulkAction(userId, ids, action, data = {}) {
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))

    if (validIds.length === 0) {
      throw new Error('No valid interview IDs provided')
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

  // Calendar & Views
  async getCalendarInterviews(userId, startDate, endDate) {
    return this.repository.getInterviewsByDateRange(userId, startDate, endDate)
  }

  async getUpcomingInterviews(userId, limit = 10) {
    return this.repository.getUpcomingInterviews(userId, limit)
  }

  async getTodayInterviews(userId) {
    return this.repository.getTodayInterviews(userId)
  }

  async getPastInterviews(userId, limit = 10) {
    return this.repository.getPastInterviews(userId, limit)
  }

  async getPendingFeedbackInterviews(userId, limit = 20) {
    return this.repository.getPendingFeedbackInterviews(userId, limit)
  }

  // Dashboard & Analytics
  async getDashboardStats(userId) {
    const [stats, monthlyTrends, typeDistribution, upcomingByCompany, averageRating, offerConversion] = await Promise.all([
      this.repository.getInterviewStats(userId),
      this.repository.getMonthlyTrends(userId, 6),
      this.repository.getTypeDistribution(userId),
      this.repository.getUpcomingByCompany(userId),
      this.repository.getAverageRating(userId),
      this.repository.getOfferConversionRate(userId),
    ])

    return { stats, monthlyTrends, typeDistribution, upcomingByCompany, averageRating, offerConversion }
  }

  async getCompanyStats(userId, companyId) {
    return this.repository.getCompanyInterviewStats(userId, companyId)
  }

  async getApplicationStats(userId, applicationId) {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return { total: 0, completed: 0, passed: 0, upcoming: 0 }
    }
    const stats = await this.repository.getApplicationInterviewStats(userId, applicationId)
    return stats[0] || { total: 0, completed: 0, passed: 0, upcoming: 0 }
  }

  async getCounts(userId) {
    const [statusCounts, typeCounts, resultCounts, decisionCounts] = await Promise.all([
      this.repository.countByStatus(userId),
      this.repository.countByType(userId),
      this.repository.countByResult(userId),
      this.repository.countByDecision(userId),
    ])

    return { statusCounts, typeCounts, resultCounts, decisionCounts }
  }

  async getAnalytics(userId) {
    const [stats, monthlyTrends, typeDistribution, averageRating, averageDifficulty, offerConversion, recruiterStats] = await Promise.all([
      this.repository.getInterviewStats(userId),
      this.repository.getMonthlyTrends(userId, 12),
      this.repository.getTypeDistribution(userId),
      this.repository.getAverageRating(userId),
      this.repository.getAverageDifficulty(userId),
      this.repository.getOfferConversionRate(userId),
      this.repository.getRecruiterStats(userId),
    ])

    return {
      stats,
      monthlyTrends,
      typeDistribution,
      averageRating,
      averageDifficulty,
      offerConversion,
      recruiterStats,
    }
  }

  // Private helpers
  async _updateApplicationStage(userId, applicationId, interviewType) {
    try {
      const application = await this.applicationRepository.findById(userId, applicationId)
      if (!application) return

      let newStage = application.currentStage

      // Map interview type to application stage
      switch (interviewType) {
        case 'phone_screen':
        case 'recruiter_call':
          newStage = 'applied'
          break
        case 'online_assessment_review':
          newStage = 'online_assessment'
          break
        case 'technical_interview':
        case 'live_coding':
        case 'system_design':
          newStage = 'technical_interview'
          break
        case 'managerial':
          newStage = 'managerial_interview'
          break
        case 'hr':
        case 'behavioral':
          newStage = 'hr_interview'
          break
        case 'final_round':
        case 'bar_raiser':
          newStage = 'hr_interview'
          break
        default:
          break
      }

      if (newStage !== application.currentStage) {
        await this.applicationRepository.update(userId, applicationId, { currentStage: newStage })
        await this.applicationRepository.addTimelineEntry(userId, applicationId, {
          action: 'stage_changed',
          fromStage: application.currentStage,
          toStage: newStage,
          description: `Stage updated to ${newStage.replace(/_/g, ' ')} due to scheduled interview`,
        })
      }
    } catch (error) {
      // Don't throw - application update is secondary
      console.error('Failed to update application stage:', error.message)
    }
  }

  async _updateApplicationOnCompletion(userId, applicationId, interviewData) {
    try {
      const application = await this.applicationRepository.findById(userId, applicationId)
      if (!application) return

      // If interview was completed, check if we should update stage
      if (interviewData.feedback?.decision === 'selected') {
        await this.applicationRepository.update(userId, applicationId, { currentStage: 'offer' })
        await this.applicationRepository.addTimelineEntry(userId, applicationId, {
          action: 'stage_changed',
          fromStage: application.currentStage,
          toStage: 'offer',
          description: 'Stage updated to offer based on interview feedback',
        })
      } else if (interviewData.feedback?.decision === 'rejected') {
        await this.applicationRepository.update(userId, applicationId, { currentStage: 'rejected' })
        await this.applicationRepository.addTimelineEntry(userId, applicationId, {
          action: 'stage_changed',
          fromStage: application.currentStage,
          toStage: 'rejected',
          description: 'Application rejected based on interview feedback',
        })
      }
    } catch (error) {
      console.error('Failed to update application on completion:', error.message)
    }
  }

  async _updateApplicationOnFeedback(userId, applicationId, feedbackData) {
    try {
      const application = await this.applicationRepository.findById(userId, applicationId)
      if (!application) return

      if (feedbackData.decision === 'selected') {
        await this.applicationRepository.update(userId, applicationId, { currentStage: 'offer' })
        await this.applicationRepository.addTimelineEntry(userId, applicationId, {
          action: 'stage_changed',
          fromStage: application.currentStage,
          toStage: 'offer',
          description: 'Stage updated to offer based on interview feedback',
        })
      } else if (feedbackData.decision === 'rejected') {
        await this.applicationRepository.update(userId, applicationId, { currentStage: 'rejected' })
        await this.applicationRepository.addTimelineEntry(userId, applicationId, {
          action: 'stage_changed',
          fromStage: application.currentStage,
          toStage: 'rejected',
          description: 'Application rejected based on interview feedback',
        })
      }
    } catch (error) {
      console.error('Failed to update application on feedback:', error.message)
    }
  }

  async _createInterviewNotification(userId, interview, action) {
    try {
      const dateStr = interview.scheduledDate
        ? new Date(interview.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : ''

      let title, message, tag

      switch (action) {
        case 'scheduled':
          title = 'Interview Scheduled'
          message = `${interview.type.replace(/_/g, ' ')} at ${interview.company} on ${dateStr} at ${interview.scheduledTime}`
          tag = 'interview'
          break
        case 'rescheduled':
          title = 'Interview Rescheduled'
          message = `${interview.company} - ${interview.round} moved to ${dateStr} at ${interview.scheduledTime}`
          tag = 'interview'
          break
        case 'cancelled':
          title = 'Interview Cancelled'
          message = `${interview.company} - ${interview.round} has been cancelled`
          tag = 'interview'
          break
        case 'completed':
          title = 'Interview Completed'
          message = `${interview.company} - ${interview.round} completed. Please submit feedback.`
          tag = 'interview'
          break
        default:
          title = 'Interview Update'
          message = `${interview.company} - ${interview.round} status updated`
          tag = 'interview'
      }

      await this.notificationService.createNotification(userId, {
        type: 'interview',
        title,
        message,
        tag,
        meta: JSON.stringify({
          interviewId: interview._id,
          company: interview.company,
          round: interview.round,
          action,
        }),
      })
    } catch (error) {
      console.error('Failed to create notification:', error.message)
    }
  }
}