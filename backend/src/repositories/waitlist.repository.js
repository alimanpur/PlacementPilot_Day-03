import { Waitlist } from '../models/waitlist.model.js'

export class WaitlistRepository {
  async create(data) {
    return Waitlist.create(data)
  }

  async findByEmail(email) {
    return Waitlist.findOne({ email: email.toLowerCase(), deletedAt: null })
  }

  async findAll(filters = {}) {
    const query = { deletedAt: null, ...filters }
    return Waitlist.find(query).sort({ createdAt: -1 })
  }

  async markNotified(id) {
    return Waitlist.findByIdAndUpdate(id, { notified: true }, { new: true })
  }

  async count() {
    return Waitlist.countDocuments({ deletedAt: null })
  }
}
