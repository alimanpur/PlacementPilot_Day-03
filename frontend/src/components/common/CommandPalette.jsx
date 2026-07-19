import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Code2,
  CalendarDays,
  BarChart3,
  Building2,
  Target,
  Trophy,
  Bell,
  User,
  Settings,
  HelpCircle,
  Home,
  Tag,
  BookOpen,
  Users,
  Mail,
  LogIn,
} from 'lucide-react'
import { primaryNav, secondaryNav, utilityNav, marketingNav } from '@/constants/navigation'

const iconMap = {
  '/app': LayoutDashboard,
  '/app/applications': FileText,
  '/app/dsa': Code2,
  '/app/interviews': CalendarDays,
  '/app/planner': CalendarDays,
  '/app/analytics': BarChart3,
  '/app/companies': Building2,
  '/app/goals': Target,
  '/app/achievements': Trophy,
  '/app/notifications': Bell,
  '/app/profile': User,
  '/app/settings': Settings,
  '/app/help': HelpCircle,
  '/': Home,
  '/features': Tag,
  '/pricing': Tag,
  '/blog': BookOpen,
  '/contact': Mail,
  '/sign-in': LogIn,
  '/story': BookOpen,
}

const allPages = [
  ...primaryNav.map(item => ({ ...item, icon: iconMap[item.to] })),
  ...secondaryNav.map(item => ({ ...item, icon: iconMap[item.to] })),
  ...utilityNav.map(item => ({ ...item, icon: iconMap[item.to] })),
  ...marketingNav.map(item => ({ ...item, icon: iconMap[item.to] })),
  { label: 'Sign In', to: '/sign-in', icon: LogIn, group: 'Auth' },
]

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}

export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSelect = useCallback(
    (to) => {
      navigate(to)
      onClose()
      setSearch('')
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const groups = [...new Set(allPages.map((p) => p.group))]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="dialog"
            className="fixed inset-x-4 top-[15%] z-50 max-w-xl mx-auto"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
          >
            <Command
              className="bg-surface ring-1 ring-hairline rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
              shouldFilter={true}
              label="Command palette"
            >
              <div className="border-b border-hairline px-4 py-3 flex items-center gap-3">
                <svg
                  className="size-4 text-ink-4 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search pages, actions…"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-4 outline-none"
                  autoFocus
                />
                <kbd
                  onClick={onClose}
                  className="text-[10px] font-mono text-ink-4 bg-surface-2 px-1.5 py-0.5 rounded cursor-pointer hover:text-ink"
                >
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto py-2">
                <Command.Empty className="py-10 text-center text-sm text-ink-4">
                  No results found.
                </Command.Empty>

                {groups.map((group) => {
                  const items = allPages.filter((p) => p.group === group)
                  return (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2"
                    >
                      {items.map((page) => {
                        const Icon = page.icon
                        return (
                          <Command.Item
                            key={page.to}
                            value={page.label}
                            onSelect={() => handleSelect(page.to)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-2 cursor-pointer rounded-md mx-2 data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink outline-none"
                          >
                            <Icon className="size-4 text-ink-4 shrink-0" />
                            <span className="flex-1">{page.label}</span>
                            <span className="text-[10px] font-mono text-ink-4">{page.to}</span>
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>

              <div className="border-t border-hairline px-4 py-2 flex items-center gap-4 text-[10px] font-mono text-ink-4">
                <span><kbd className="bg-surface-2 px-1 rounded">↑↓</kbd> navigate</span>
                <span><kbd className="bg-surface-2 px-1 rounded">↵</kbd> open</span>
                <span><kbd className="bg-surface-2 px-1 rounded">esc</kbd> close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
