import { Router } from 'express'
import {
  getSettings,
  updateSettings,
  changePassword,
  getSessions,
  revokeSessions,
  deleteAccount,
  updateAppearance,
  updateNotifications,
  updatePrivacy,
  updateSecurity,
  getLoginHistory,
  getSecurityLog,
  updateProductivity,
  getIntegrations,
  updateIntegration,
  disconnectIntegration,
  exportData,
  clearCache,
  resetPreferences,
  deleteArchivedData,
} from '../controllers/settings.controller.js'
import { authenticate } from '../middlewares/auth.js'
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

const router = Router()

router.use(authenticate)

// Account
router.get('/', getSettings)
router.put('/', validate(settingsSchema), updateSettings)
router.post('/change-password', validate(changePasswordSchema), changePassword)
router.get('/sessions', getSessions)
router.post('/sessions/revoke', revokeSessions)
router.delete('/account', deleteAccount)

// Appearance
router.put('/appearance', validate(appearanceSchema), updateAppearance)

// Notifications
router.put('/notifications', validate(notificationSchema), updateNotifications)

// Privacy
router.put('/privacy', validate(privacySchema), updatePrivacy)

// Security
router.put('/security', validate(securitySchema), updateSecurity)
router.get('/security/login-history', getLoginHistory)
router.get('/security/log', getSecurityLog)

// Productivity
router.put('/productivity', validate(productivitySchema), updateProductivity)

// Integrations
router.get('/integrations', getIntegrations)
router.put('/integrations/:key', validate(integrationSchema), updateIntegration)
router.delete('/integrations/:key', disconnectIntegration)

// Data Management
router.post('/export', exportData)
router.post('/clear-cache', clearCache)
router.post('/reset', resetPreferences)
router.post('/delete-archived', deleteArchivedData)

export { router as settingsRouter }
