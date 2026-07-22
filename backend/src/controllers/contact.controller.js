import { ContactRepository } from '../repositories/contact.repository.js'
import { sendEmail } from '../services/email.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { config } from '../config/env.js'

const contactRepo = new ContactRepository()

export const submitContact = asyncWrapper(async (req, res) => {
  const { name, email, subject, message } = req.body

  const contact = await contactRepo.create({
    name,
    email,
    subject,
    message,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent') || '',
  })

  // Send email notification
  const emailHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 16px;">
        Received at ${new Date().toLocaleString()}
      </p>
    </div>
  `

  await sendEmail({
    to: config.CONTACT_EMAIL || config.EMAIL_USER || 'aliasgermanpurwala@gmail.com',
    subject: `PlacementPilot Contact: ${subject}`,
    html: emailHtml,
  })

  res.status(201).json({
    success: true,
    message: 'Your message has been sent. We will get back to you soon.',
    data: { contact },
  })
})
