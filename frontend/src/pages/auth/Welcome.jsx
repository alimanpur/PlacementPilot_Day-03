import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { AuthShell } from '@/layouts/AuthShell'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'

const steps = [
  { title: 'Complete your profile', description: 'Add your college, skills, and links.', to: '/app/profile', meta: '2 min' },
  { title: 'Add a target company', description: 'Start tracking your placement pipeline.', to: '/app/companies', meta: '2 min' },
  { title: 'Set a placement goal', description: 'Measure progress toward your dream role.', to: '/app/goals', meta: '3 min' },
  { title: 'Log your first DSA problem', description: 'Begin building coding consistency.', to: '/app/dsa', meta: '5 min' },
  { title: 'Plan today in the Planner', description: 'Schedule tasks linked to your goals.', to: '/app/planner', meta: '3 min' },
]

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <AuthShell
        eyebrow="Cleared for takeoff"
        title="Your deck is live."
        subtitle="Five quick steps get your placement workspace airborne. Skip and we'll guide you from the dashboard."
      >
        <motion.ol
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              variants={staggerItem}
            >
              <button
                type="button"
                onClick={() => navigate(step.to)}
                className="w-full text-left ring-hairline bg-surface rounded-md p-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 cursor-pointer hover:bg-surface-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span
                  className="size-8 rounded-full bg-brand-soft text-brand grid place-items-center font-mono text-xs font-bold shrink-0"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-ink font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-ink-4 mt-0.5">{step.description}</div>
                </div>
                <span className="text-ink-3 shrink-0 flex items-center gap-1 text-xs font-mono" aria-hidden="true">
                  {step.meta} <ArrowRight className="size-3.5" />
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ol>

        <Link
          to="/app"
          className="mt-6 block text-center bg-brand text-[#05130d] px-5 py-3 rounded-md font-semibold hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Enter the dashboard
        </Link>
      </AuthShell>
    </PageTransition>
  )
}
