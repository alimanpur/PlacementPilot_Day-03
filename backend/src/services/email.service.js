import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { logger } from '../lib/logger.js'

let transporter

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST || 'smtp.ethereal.email',
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    })
  }
  return transporter
}

const templates = {
  reset: (data) => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${config.CORS_ORIGIN}/reset?token=${data.token}" style="background: #0070f3; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
      </div>
    `,
  }),

  welcome: (data) => ({
    subject: 'Welcome aboard!',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to PlacementPilot, ${data.name}!</h2>
        <p>Your account is now active. Start tracking your placement journey.</p>
      </div>
    `,
  }),

  securityAlert: (data) => ({
    subject: 'Security Alert',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Security Alert</h2>
        <p>${data.message}</p>
        <p style="color: #666; font-size: 14px;">If this wasn't you, please secure your account immediately.</p>
      </div>
    `,
  }),
}

export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const emailTransporter = getTransporter()
    const emailTemplate = templates[template]

    if (!emailTemplate) {
      throw new Error(`Unknown email template: ${template}`)
    }

    const { subject: templateSubject, html } = emailTemplate(data)

    const mailOptions = {
      from: config.EMAIL_FROM || '"PlacementPilot" <noreply@placementpilot.com>',
      to,
      subject: subject || templateSubject,
      html,
    }

    const info = await emailTransporter.sendMail(mailOptions)
    logger.info('Email sent', { to, template, messageId: info.messageId })
    return info
  } catch (error) {
    logger.error('Email send failed', { error: error.message, to, template })
    return null
  }
}