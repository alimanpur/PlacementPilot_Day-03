import mongoose from 'mongoose'
import { Interview } from '../models/interview.model.js'
import { safeArray, safeObject, safeNumber } from '../lib/safeData.js'

export class InterviewRepository {
  async create(userId, data) {
    return Interview.create({ ...data, userId })
  }

  async findById(userId, id) {
    return Interview.findOne({ _id: id, userId, deletedAt: null })
  }

  async findByIdDetailed(userId, id) {
    return Interview.findOne({ _id: id, userId, deletedAt: null })
      .populate('companyId', 'name industry logo')
      .populate('applicationId', 'company role currentStage status')
  }

  async findAll(userId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'scheduledDate',
      sortOrder = 'asc',
      search = '',
      status,
      type,
      round,
      company,
      companyId,
      applicationId,
      mode,
      decision,
      result,
      priority,
      startDate,
      endDate,
      archived = false,
    } = options

    const query = { userId, deletedAt: null, archived, ...filters }

    // Filter by status
    if (status) {
      const statuses = status.split(',')
      query.status = { $in: statuses }
    }

    // Filter by type
    if (type) {
      const types = type.split(',')
      query.type = { $in: types }
    }

    // Filter by round
    if (round) {
      query.round = { $regex: round, $options: 'i' }
    }

    // Filter by company
    if (company) {
      query.company = { $regex: company, $options: 'i' }
    }

    // Filter by companyId
    if (companyId) {
      query.companyId = new mongoose.Types.ObjectId(companyId)
    }

    // Filter by applicationId
    if (applicationId) {
      query.applicationId = new mongoose.Types.ObjectId(applicationId)
    }

    // Filter by mode
    if (mode) {
      query.mode = mode
    }

    // Filter by feedback decision
    if (decision) {
      query['feedback.decision'] = decision
    }

    // Filter by result
    if (result) {
      query.result = result
    }

    // Filter by priority
    if (priority) {
      query.priority = priority
    }

    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {}
      if (startDate) query.scheduledDate.$gte = new Date(startDate)
      if (endDate) query.scheduledDate.$lte = new Date(endDate)
    }

    // Global search
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { round: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { recruiterName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'interviewers.name': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ]
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const skip = (page - 1) * limit

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('companyId', 'name industry logo')
        .populate('applicationId', 'company role currentStage status')
        .lean(),
      Interview.countDocuments(query),
    ])

    return {
      interviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(userId, id, data) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { ...data, updatedBy: userId },
      { new: true, runValidators: true },
    )
  }

  async delete(userId, id) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date(), updatedBy: userId },
      { new: true },
    )
  }

  async archive(userId, id, archived = true) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { archived, updatedBy: userId },
      { new: true },
    )
  }

  async restore(userId, id) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { deletedAt: null, archived: false, updatedBy: userId },
      { new: true },
    )
  }

  async duplicate(userId, id) {
    const original = await this.findById(userId, id)
    if (!original) return null

    const { _id, createdAt, updatedAt, timeline, feedback, result, ...rest } = original.toObject()
    const duplicate = await Interview.create({
      ...rest,
      round: `${original.round} (Copy)`,
      status: 'scheduled',
      result: 'pending',
      'feedback.decision': undefined,
      'feedback.rating': undefined,
      'feedback.submittedAt': undefined,
      timeline: [],
      userId,
    })

    return duplicate
  }

  async bulkUpdate(userId, ids, data) {
    return Interview.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { ...data, updatedBy: userId } },
    )
  }

  async bulkDelete(userId, ids) {
    return Interview.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { deletedAt: new Date(), updatedBy: userId } },
    )
  }

  async bulkArchive(userId, ids, archived = true) {
    return Interview.updateMany(
      { _id: { $in: ids }, userId, deletedAt: null },
      { $set: { archived, updatedBy: userId } },
    )
  }

  async addTimelineEntry(userId, id, entry) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { timeline: { ...entry, timestamp: new Date() } }, $set: { updatedBy: userId } },
      { new: true },
    )
  }

  async addAttachment(userId, id, attachment) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { attachments: { ...attachment, uploadedAt: new Date() } }, $set: { updatedBy: userId } },
      { new: true },
    )
  }

  async removeAttachment(userId, id, attachmentUrl) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $pull: { attachments: { url: attachmentUrl } }, $set: { updatedBy: userId } },
      { new: true },
    )
  }

  async addChecklistItem(userId, id, item) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      {
        $push: { 'preparation.checklist': { item, completed: false } },
        $set: { updatedBy: userId },
      },
      { new: true },
    )
  }

  async toggleChecklistItem(userId, id, itemId, completed) {
    const update = completed
      ? { $set: { 'preparation.checklist.$[elem].completed': true, 'preparation.checklist.$[elem].completedAt': new Date() } }
      : { $set: { 'preparation.checklist.$[elem].completed': false, 'preparation.checklist.$[elem].completedAt': null } }

    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      update,
      {
        arrayFilters: [{ 'elem._id': new mongoose.Types.ObjectId(itemId) }],
        new: true,
      },
    )
  }

  async removeChecklistItem(userId, id, itemId) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      {
        $pull: { 'preparation.checklist': { _id: new mongoose.Types.ObjectId(itemId) } },
        $set: { updatedBy: userId },
      },
      { new: true },
    )
  }

  async updatePreparationProgress(userId, id) {
    const interview = await this.findById(userId, id)
    if (!interview || !interview.preparation?.checklist?.length) return interview

    const total = interview.preparation.checklist.length
    const completed = interview.preparation.checklist.filter((item) => item.completed).length
    const progress = Math.round((completed / total) * 100)

    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: { 'preparation.completionProgress': progress, updatedBy: userId } },
      { new: true },
    )
  }

  async addInterviewer(userId, id, interviewer) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $push: { interviewers: interviewer }, $set: { updatedBy: userId } },
      { new: true },
    )
  }

  async removeInterviewer(userId, id, interviewerId) {
    return Interview.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      {
        $pull: { interviewers: { _id: new mongoose.Types.ObjectId(interviewerId) } },
        $set: { updatedBy: userId },
      },
      { new: true },
    )
  }

  // Analytics & Stats
  async getUpcomingInterviews(userId, limit = 10) {
    const now = new Date()
    return safeArray(await Interview.find({
      userId,
      deletedAt: null,
      archived: false,
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'rescheduled'] },
    })
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(limit)
      .populate('companyId', 'name industry logo')
      .populate('applicationId', 'company role currentStage')
      .lean())
  }

  async getTodayInterviews(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return safeArray(await Interview.find({
      userId,
      deletedAt: null,
      archived: false,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'rescheduled'] },
    })
      .sort({ scheduledTime: 1 })
      .populate('companyId', 'name industry logo')
      .populate('applicationId', 'company role currentStage')
      .lean())
  }

  async getPastInterviews(userId, limit = 10) {
    const now = new Date()
    return safeArray(await Interview.find({
      userId,
      deletedAt: null,
      scheduledDate: { $lt: now },
      status: { $in: ['completed', 'cancelled', 'no_show', 'pending_feedback'] },
    })
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .populate('companyId', 'name industry logo')
      .populate('applicationId', 'company role currentStage')
      .lean())
  }

  async getInterviewsByDateRange(userId, startDate, endDate) {
    return Interview.find({
      userId,
      deletedAt: null,
      archived: false,
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: { $in: ['scheduled', 'rescheduled', 'pending_feedback'] },
    })
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .populate('companyId', 'name industry logo')
      .populate('applicationId', 'company role currentStage')
      .lean()
  }

  async getInterviewStats(userId) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalInterviews,
      upcomingCount,
      completedCount,
      totalPassed,
      totalFailed,
      todayCount,
      pendingFeedback,
    ] = await Promise.all([
      Interview.countDocuments({ userId, deletedAt: null }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        archived: false,
        scheduledDate: { $gte: now },
        status: { $in: ['scheduled', 'rescheduled'] },
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        result: 'pass',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        result: 'fail',
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        scheduledDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) },
        status: { $in: ['scheduled', 'rescheduled'] },
      }),
      Interview.countDocuments({
        userId,
        deletedAt: null,
        status: 'completed',
        'feedback.decision': { $exists: false },
      }),
    ])

    return {
      total: totalInterviews,
      upcoming: upcomingCount,
      completed: completedCount,
      passed: totalPassed,
      failed: totalFailed,
      today: todayCount,
      pendingFeedback,
      passRate: completedCount > 0 ? Math.round((totalPassed / completedCount) * 100) : 0,
    }
  }

  async countByStatus(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async countByType(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async countByResult(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$result', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async countByDecision(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$feedback.decision', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async getCompanyInterviewStats(userId, companyId) {
    const match = { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, companyId: new mongoose.Types.ObjectId(companyId) }

    const stats = await Interview.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$result', 'fail'] }, 1, 0] } },
          upcoming: { $sum: { $cond: [{ $in: ['$status', ['scheduled', 'rescheduled']] }, 1, 0] } },
          totalRating: { $sum: '$feedback.rating' },
          ratingCount: { $sum: { $cond: [{ $gt: ['$feedback.rating', 0] }, 1, 0] } },
        },
      },
    ])

    const rounds = await Interview.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$round',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    const decisions = await Interview.aggregate([
      { $match: { ...match, 'feedback.decision': { $exists: true } } },
      {
        $group: {
          _id: '$feedback.decision',
          count: { $sum: 1 },
        },
      },
    ])

    const s = stats[0] || { total: 0, completed: 0, passed: 0, failed: 0, upcoming: 0, totalRating: 0, ratingCount: 0 }

    return {
      total: s.total,
      completed: s.completed,
      passed: s.passed,
      failed: s.failed,
      upcoming: s.upcoming,
      passRate: s.completed > 0 ? Math.round((s.passed / s.completed) * 100) : 0,
      averageRating: s.ratingCount > 0 ? (s.totalRating / s.ratingCount).toFixed(1) : 0,
      rounds,
      decisions,
      averageRounds: rounds.length,
    }
  }

  async getApplicationInterviewStats(userId, applicationId) {
    return Interview.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
          applicationId: new mongoose.Types.ObjectId(applicationId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
          upcoming: { $sum: { $cond: [{ $in: ['$status', ['scheduled', 'rescheduled']] }, 1, 0] } },
        },
      },
    ])
  }

  async getMonthlyTrends(userId, months = 12) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const [scheduled, completed, passed, failed] = await Promise.all([
        Interview.countDocuments({
          userId,
          deletedAt: null,
          createdAt: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          status: 'completed',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          result: 'pass',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
        Interview.countDocuments({
          userId,
          deletedAt: null,
          result: 'fail',
          scheduledDate: { $gte: monthStart, $lt: monthEnd },
        }),
      ])

      data.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        scheduled,
        completed,
        passed,
        failed,
      })
    }

    return data
  }

  async getTypeDistribution(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  async getUpcomingByCompany(userId) {
    const now = new Date()
    return Interview.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deletedAt: null,
          archived: false,
          scheduledDate: { $gte: now },
          status: { $in: ['scheduled', 'rescheduled'] },
        },
      },
      { $group: { _id: '$company', count: { $sum: 1 }, nextDate: { $min: '$scheduledDate' } } },
      { $sort: { nextDate: 1 } },
    ])
  }

  async getRecruiterStats(userId) {
    return Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, recruiterName: { $exists: true, $ne: '' } } },
      { $group: { _id: '$recruiterName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
  }

  async getAverageRating(userId) {
    const result = await Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, status: 'completed', 'feedback.rating': { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' }, count: { $sum: 1 } } },
    ])
    const item = result[0] || {}
    return { average: item.avgRating ? Number(item.avgRating.toFixed(1)) : 0, count: item.count || 0 }
  }

  async getAverageDifficulty(userId) {
    const result = await Interview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, status: 'completed', difficulty: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avg: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                  { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                  { case: { $eq: ['$difficulty', 'hard'] }, then: 3 },
                  { case: { $eq: ['$difficulty', 'very_hard'] }, then: 4 },
                ],
                default: 0,
              },
            },
          },
          count: { $sum: 1 },
        },
      },
    ])
    const item = result[0] || {}
    return { average: item.avg ? Number(item.avg.toFixed(2)) : 0, count: item.count || 0 }
  }

  async getOfferConversionRate(userId) {
    const [completed, selected] = await Promise.all([
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed' }),
      Interview.countDocuments({ userId, deletedAt: null, status: 'completed', 'feedback.decision': 'selected' }),
    ])
    return { completed, selected, rate: completed > 0 ? Math.round((selected / completed) * 100) : 0 }
  }

  async checkConflict(userId, scheduledDate, scheduledTime, duration, excludeId = null) {
    const interviewDate = new Date(scheduledDate)
    const dateStart = new Date(interviewDate.setHours(0, 0, 0, 0))
    const dateEnd = new Date(interviewDate.setHours(23, 59, 59, 999))

    const query = {
      userId,
      deletedAt: null,
      scheduledDate: { $gte: dateStart, $lte: dateEnd },
      status: { $in: ['scheduled', 'rescheduled'] },
    }

    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) }
    }

    const interviews = await Interview.find(query).lean()
    return interviews
  }
}

