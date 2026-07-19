import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center bg-base text-ink px-6">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="eyebrow mb-4">Error / 404</div>
        <h1 className="font-display text-6xl font-semibold tracking-tight mb-3">
          Signal lost.
        </h1>
        <p className="text-ink-3 mb-8 leading-relaxed">
          The route you're looking for isn't on our chart. Return to the tower and pick
          another heading.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            to="/"
            className="bg-brand text-[#05130d] px-5 py-2.5 rounded-md text-sm font-semibold hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Return to base
          </Link>
          <Link
            to="/app"
            className="ring-hairline bg-surface text-ink px-5 py-2.5 rounded-md text-sm font-medium hover:bg-surface-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Go to deck
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
