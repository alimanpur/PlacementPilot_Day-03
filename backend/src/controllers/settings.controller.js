import { SettingsService } from '../services/settings.service.js'
import { asyncWrapper } from '../middlewares/errorHandler.js'
import { UserRepository } from '../repositories/user.repository.js'
import { validate } from '../middlewares/validate.js'
import {
  settingsSchema,
  changePasswordSchema,
  appearanceSchema,
  notificationSchema,
  privacySchema,
  securitySchema,
  productivitySchema,
  integrationSchema,
} from '../validators/settings.validator.js'

const settingsService = new SettingsService()
const userRepo = new UserRepository()

export const getSettings = asyncWrapper(async (req, res) => {
  const settings = await settingsService.getSettings(req.user._id)
  res.json({
    success: true,
    message: 'Settings retrieved',
    data: settings,
  })
})

export const updateSettings = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updateSettings(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Settings updated',
    data: { user: settings },
  })
})

export const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const result = await settingsService.changePassword(req.user._id, currentPassword, newPassword)
  res.json({
    success: true,
    message: 'Password changed successfully',
    data: result,
  })
})

export const getSessions = asyncWrapper(async (req, res) => {
  const sessions = await settingsService.getSessions(req.user._id)
  res.json({
    success: true,
    message: 'Sessions retrieved',
    data: { sessions },
  })
})

export const revokeSessions = asyncWrapper(async (req, res) => {
  const result = await settingsService.revokeSessions(req.user._id)
  res.json({
    success: true,
    message: 'All other sessions revoked',
    data: result,
  })
})

export const deleteAccount = asyncWrapper(async (req, res) => {
  const result = await settingsService.deleteAccount(req.user._id)
  res.json({
    success: true,
    message: 'Account scheduled for deletion',
    data: result,
  })
})

export const updateAppearance = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updateAppearance(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Appearance updated',
    data: settings,
  })
})

export const updateNotifications = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updateNotificationPreferences(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Notification preferences updated',
    data: { user: settings },
  })
})

export const updatePrivacy = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updatePrivacySettings(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Privacy settings updated',
    data: settings,
  })
})

export const updateSecurity = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updateSecuritySettings(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Security settings updated',
    data: settings,
  })
})

export const getLoginHistory = asyncWrapper(async (req, res) => {
  const history = await settingsService.getLoginHistory(req.user._id)
  res.json({
    success: true,
    message: 'Login history retrieved',
    data: { history },
  })
})

export const getSecurityLog = asyncWrapper(async (req, res) => {
  const log = await settingsService.getSecurityLog(req.user._id)
  res.json({
    success: true,
    message: 'Security log retrieved',
    data: { log },
  })
})

export const updateProductivity = asyncWrapper(async (req, res) => {
  const settings = await settingsService.updateProductivitySettings(req.user._id, req.body)
  res.json({
    success: true,
    message: 'Productivity settings updated',
    data: settings,
  })
})

export const getIntegrations = asyncWrapper(async (req, res) => {
  const integrations = await settingsService.getIntegrations(req.user._id)
  res.json({
    success: true,
    message: 'Integrations retrieved',
    data: { integrations },
  })
})

export const updateIntegration = asyncWrapper(async (req, res) => {
  const { key } = req.params
  const integration = await settingsService.updateIntegration(req.user._id, key, req.body)
  res.json({
    success: true,
    message: 'Integration updated',
    data: { integration },
  })
})

export const disconnectIntegration = asyncWrapper(async (req, res) => {
  const { key } = req.params
  const result = await settingsService.disconnectIntegration(req.user._id, key)
  res.json({
    success: true,
    message: 'Integration disconnected',
    data: result,
  })
})

export const exportData = asyncWrapper(async (req, res) => {
  const data = await settingsService.exportAllData(req.user._id)
  res.json({
    success: true,
    message: 'Data exported',
    data,
  })
})

export const clearCache = asyncWrapper(async (req, res) => {
  const result = await settingsService.clearCache()
  res.json({
    success: true,
    message: 'Cache cleared',
    data: result,
  })
})

export const resetPreferences = asyncWrapper(async (req, res) => {
  const settings = await settingsService.resetPreferences(req.user._id)
  res.json({
    success: true,
    message: 'Preferences reset to defaults',
    data: { user: settings },
  })
})

export const deleteArchivedData = asyncWrapper(async (req, res) => {
  const result = await settingsService.deleteArchivedData(req.user._id)
  res.json({
    success: true,
    message: 'Archived data deleted',
    data: result,
  })
})
