import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Marketing pages
const Landing = lazy(() => import('@/pages/marketing/Landing'))
const Features = lazy(() => import('@/pages/marketing/Features'))
const Story = lazy(() => import('@/pages/marketing/Story'))
const Pricing = lazy(() => import('@/pages/marketing/Pricing'))
const About = lazy(() => import('@/pages/marketing/About'))
const Contact = lazy(() => import('@/pages/marketing/Contact'))
const Faq = lazy(() => import('@/pages/marketing/Faq'))
const Privacy = lazy(() => import('@/pages/marketing/Privacy'))
const Terms = lazy(() => import('@/pages/marketing/Terms'))

// Auth pages
const SignIn = lazy(() => import('@/pages/auth/SignIn'))
const SignUp = lazy(() => import('@/pages/auth/SignUp'))
const Forgot = lazy(() => import('@/pages/auth/Forgot'))
const Reset = lazy(() => import('@/pages/auth/Reset'))
const Welcome = lazy(() => import('@/pages/auth/Welcome'))

// App pages
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const Applications = lazy(() => import('@/pages/app/Applications'))
const ApplicationDetail = lazy(() => import('@/pages/app/ApplicationDetail'))
const DsaTracker = lazy(() => import('@/pages/app/DsaTracker'))
const Interviews = lazy(() => import('@/pages/app/Interviews'))
const InterviewDetail = lazy(() => import('@/pages/app/InterviewDetail'))
const Planner = lazy(() => import('@/pages/app/Planner'))
const Analytics = lazy(() => import('@/pages/app/Analytics'))
const Companies = lazy(() => import('@/pages/app/Companies'))
const CompanyDetail = lazy(() => import('@/pages/app/CompanyDetail'))
const Goals = lazy(() => import('@/pages/app/Goals'))
const Achievements = lazy(() => import('@/pages/app/Achievements'))
const Notifications = lazy(() => import('@/pages/app/Notifications'))
const Profile = lazy(() => import('@/pages/app/Profile'))
const Settings = lazy(() => import('@/pages/app/Settings'))
const Help = lazy(() => import('@/pages/app/Help'))

// 404
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-dvh bg-base grid place-items-center" aria-label="Loading page">
      <div className="size-2 rounded-full bg-brand animate-pulse" />
    </div>
  )
}

// Protected route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  
  // If no token, redirect to sign in
  if (!token) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}

export default function AppRoutes() {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Root — Landing */}
          <Route path="/" element={<Landing />} />

          {/* Marketing */}
          <Route path="/features" element={<Features />} />
          <Route path="/story" element={<Story />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* App - Protected routes */}
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/app/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
          <Route path="/app/dsa" element={<ProtectedRoute><DsaTracker /></ProtectedRoute>} />
          <Route path="/app/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/app/interviews/:id" element={<ProtectedRoute><InterviewDetail /></ProtectedRoute>} />
          <Route path="/app/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/app/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/app/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
          <Route path="/app/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/app/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/app/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/app/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}