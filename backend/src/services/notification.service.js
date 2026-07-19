import mongoose from 'mongoose'
import { Notification } from '../models/notification.model.js'

export class NotificationService {
  async createNotification(userId, data) {
    try {
      const { type, message, applicationId, scheduledFor, ...rest } = data
      
      return await Notification.create({
        title: data.title || 'Notification',
        meta: message || '',
        when: scheduledFor ? new Date(scheduledFor).toLocaleString() : 'Just now',
        tag: this.mapTypeToTag(type),
        userId,
        read: false,
        ...rest,
      })
    } catch (error) {
      // Silently fail - notifications are not critical
      return null
    }
  }

  mapTypeToTag(type) {
    const typeMap = {
      deadline: 'pipeline',
      stage_change: 'pipeline',
      interview: 'interview',
      offer: 'pipeline',
      follow_up: 'pipeline',
    }
    return typeMap[type] || 'system'
  }

  async createDeadlineReminder(userId, applicationId, company, role, deadline) {
    return this.createNotification(userId, {
      type: 'deadline',
      title: 'Application Deadline',
      message: `Deadline for ${company} - ${role} is approaching`,
      applicationId,
      scheduledFor: new Date(deadline),
    })
  }

  async createStageChangeNotification(userId, applicationId, company, role, newStage) {
    return this.createNotification(userId, {
      type: 'stage_change',
      title: 'Application Stage Updated',
      message: `${company} - ${role} moved to ${newStage.replace(/_/g, ' ')}`,
      applicationId,
    })
  }

  async createInterviewReminder(userId, applicationId, company, role, interviewDate) {
    return this.createNotification(userId, {
      type: 'interview',
      title: 'Upcoming Interview',
      message: `Interview scheduled for ${company} - ${role}`,
      applicationId,
      scheduledFor: new Date(interviewDate),
    })
  }

  async createOfferNotification(userId, applicationId, company, role) {
    return this.createNotification(userId, {
      type: 'offer',
      title: 'Offer Received',
      message: `Congratulations! You received an offer from ${company} for ${role}`,
      applicationId,
    })
  }

  async createFollowUpReminder(userId, applicationId, company, role, daysSinceApplied) {
    return this.createNotification(userId, {
      type: 'follow_up',
      title: 'Follow-up Reminder',
      message: `It's been ${daysSinceApplied} days since you applied to ${company}. Consider following up.`,
      applicationId,
    })
  }
}
