import { Contact } from '../models/contact.model.js'

export class ContactRepository {
  async create(data) {
    const contact = new Contact(data)
    return contact.save()
  }

  async findAll(filter = {}) {
    return Contact.find({ ...filter, deletedAt: { $ne: null } })
      .sort({ createdAt: -1 })
      .lean()
  }

  async findById(id) {
    return Contact.findOne({ _id: id, deletedAt: { $ne: null } })
  }

  async count() {
    return Contact.countDocuments({ deletedAt: { $ne: null } })
  }
}
