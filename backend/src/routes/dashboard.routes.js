import { Router } from 'express'
import {
  getDashboardOverview,
  getDashboardActivity,
  getDashboardReadiness,
  getDashboardFocus,
  getDashboardQuickActions,
} from '../controllers/dashboard.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

// Main overview endpoint - single call for initial render
router.get('/overview', getDashboardOverview)

// Activity feed
router.get('/activity', getDashboardActivity)

// Readiness breakdown
router.get('/readiness', getDashboardReadiness)

// Today's focus recommendations
router.get('/focus', getDashboardFocus)

// Quick actions based on user state
router.get('/quick-actions', getDashboardQuickActions)

// Legacy endpoint for backward compatibility
router.get('/', getDashboardOverview)

export { router as dashboardRouter }
