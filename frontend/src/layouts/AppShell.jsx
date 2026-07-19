import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/common/atoms'
import { MobileSidebar } from '@/components/common/MobileSidebar'
import { CommandPalette, useCommandPalette } from '@/components/common/CommandPalette'
import QuickActions from '@/components/common/QuickActions'
import { cn } from '@/lib/utils'
import { primaryNav, secondaryNav, utilityNav } from '@/constants/navigation'
import { useProfile } from '@/hooks/api'

export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()

  return (
    <div className="min-h-dvh bg-base text-ink flex">
      <DesktopSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          onSearchClick={() => setCmdOpen(true)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <QuickActions />
    </div>
  )
}

function DesktopSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { data: profile } = useProfile()

  const userName = profile?.name || 'User'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className="w-64 shrink-0 border-r border-hairline bg-surface hidden lg:flex flex-col sticky top-0 h-dvh"
      aria-label="Main navigation"
    >
      <div className="p-5 border-b border-hairline">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <NavGroup label="Deck" items={primaryNav} pathname={pathname} />
        <NavGroup label="Progress" items={secondaryNav} pathname={pathname} />
        <NavGroup label="Utility" items={utilityNav} pathname={pathname} />
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
    </aside>
  )
}

function NavGroup({ label, items, pathname }) {
  return (
    <div>
      <div className="eyebrow px-3 mb-2" aria-hidden="true">{label}</div>
      <ul role="list" className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.to === '/app'
              ? pathname === '/app'
              : pathname.startsWith(item.to)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.hint ? (
                  <span
                    className="shrink-0 text-[10px] font-mono text-ink-4"
                    aria-label={`Keyboard shortcut: ${item.hint}`}
                  >
                    {item.hint}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Topbar({ onMenuClick, onSearchClick }) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-hairline bg-base/70 backdrop-blur grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden size-8 grid place-items-center rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition"
        aria-label="Open navigation menu"
      >
        <Menu className="size-4" />
      </button>

      <div className="min-w-0 flex items-center">
        <button
          onClick={onSearchClick}
          className="ring-hairline bg-surface rounded-md px-3 py-1.5 text-xs text-ink-3 font-mono flex items-center gap-3 hover:text-ink transition min-w-0 max-w-md w-full"
          aria-label="Open command palette (Ctrl+K)"
        >
          <span className="truncate hidden sm:block">
            Search anything · applications, problems, companies…
          </span>
          <span className="truncate sm:hidden">Search…</span>
          <span className="ml-auto text-ink-4 shrink-0">⌘K</span>
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-[10px] font-mono text-brand uppercase tracking-widest">
          ● Nominal
        </span>
        <Link
          to="/app/notifications"
          className="rounded-md px-2 md:px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2 transition"
          aria-label="Notifications"
        >
          Alerts
        </Link>
        <Link
          to="/"
          className="rounded-md px-2 md:px-3 py-1.5 text-sm text-ink-3 hover:text-ink transition"
        >
          Exit
        </Link>
      </div>
    </header>
  )
}

export function PageHeader({ eyebrow, title, meta, action }) {
  return (
    <div className="border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 md:gap-6">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="eyebrow mb-2" aria-hidden="true">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="font-display text-2xl md:text-4xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {meta ? <p className="text-sm text-ink-3 mt-2 max-w-prose">{meta}</p> : null}
        </div>
        {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
      </div>
    </div>
  )
}

export function PageBody({ children, className }) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10', className)}>
      {children}
    </div>
  )
}
