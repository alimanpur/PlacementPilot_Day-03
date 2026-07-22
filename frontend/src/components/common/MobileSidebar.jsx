import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Logo } from './atoms'
import { cn } from '@/lib/utils'
import { primaryNav, secondaryNav, utilityNav, NAV_SECTIONS } from '@/constants/navigation'
import { useProfile } from '@/hooks/api'

function NavGroup({ label, items, pathname, onClose }) {
  return (
    <div>
      <div className="eyebrow px-3 mb-2">{label}</div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.to === '/app' ? pathname === '/app' : pathname.startsWith(item.to)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className={cn(
                  'block rounded-md px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MobileSidebar({ open, onClose }) {
  const location = useLocation()
  const { data: profile } = useProfile()

  useEffect(() => {
    onClose()
  }, [location.pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const userName = profile?.name || 'User'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const allNavItems = [...primaryNav, ...secondaryNav, ...utilityNav]
  const mainItems = allNavItems.filter((item) => !item.section)
  const sectionedNav = NAV_SECTIONS.map((section) => ({
    section,
    items: allNavItems.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-hairline flex flex-col lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
            aria-label="Navigation menu"
          >
            <div className="p-5 border-b border-hairline flex items-center justify-between">
              <Logo />
              <button
                onClick={onClose}
                className="size-8 grid place-items-center rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {mainItems.length > 0 && (
                <NavGroup label="Main" items={mainItems} pathname={location.pathname} onClose={onClose} />
              )}
              {sectionedNav.map((group) => (
                <NavGroup key={group.section} label={group.section} items={group.items} pathname={location.pathname} onClose={onClose} />
              ))}
            </nav>
            <div className="p-4 border-t border-hairline">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-brand/20 grid place-items-center text-brand font-mono text-xs font-bold ring-1 ring-brand/20">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-ink truncate">{userName}</div>
                  <div className="text-[10px] font-mono text-ink-4 uppercase tracking-widest">
                    {profile?.email?.split('@')[0] || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
