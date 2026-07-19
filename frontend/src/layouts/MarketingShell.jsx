import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/common/atoms'
import { cn } from '@/lib/utils'
import { marketingNav } from '@/constants/navigation'

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-3">
        {links.map(([label, to]) => {
          const isExternal = to.startsWith('http')
          return (
            <li key={to}>
              {isExternal ? (
                <a
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-2 hover:text-brand transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link to={to} className="text-sm text-ink-2 hover:text-brand transition-colors">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MarketingNav() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-hairline bg-base/80 backdrop-blur">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6">
        <Logo />

        <nav className="hidden md:flex justify-center gap-8 text-sm text-ink-3" aria-label="Main navigation">
          {marketingNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                'hover:text-ink transition-colors',
                location.pathname === n.to && 'text-ink',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3 justify-end">
          <Link
            to="/sign-in"
            className="text-sm font-medium text-ink-2 hover:text-ink hidden sm:inline transition"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="bg-ink text-base px-3 md:px-4 py-2 rounded-md text-sm font-semibold hover:bg-white transition ring-1 ring-white/10"
          >
            Initialize deck
          </Link>
          <button
            className="md:hidden size-8 grid place-items-center text-ink-3 hover:text-ink transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="border-t border-hairline bg-base overflow-hidden md:hidden"
          >
              <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
                {marketingNav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      'block px-3 py-2.5 rounded-md text-sm transition-colors',
                      location.pathname === n.to
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/sign-in"
                  className="block px-3 py-2.5 rounded-md text-sm text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
                >
                  Sign in
                </Link>
              </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="text-sm text-ink-3 mt-4 max-w-xs">
            The operating system for placement preparation. Built for engineers, designers, and
            thinkers on approach.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ['Features', '/features'],
            ['Journey', '/story'],
            ['Pricing', '/pricing'],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ['About', '/about'],
            ['Contact', '/contact'],
            ['GitHub', 'https://github.com/alimanpur/PlacementPilot_Day-03'],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ['Privacy', '/privacy'],
            ['Terms', '/terms'],
            ['FAQ', '/faq'],
          ]}
        />
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-ink-4">
          <span>
            © 2026 PlacementPilot | Aliasger Manpur
          </span>
          <span>
            <span className="text-brand">●</span> All systems operational 
          </span>
        </div>
      </div>
    </footer>
  )
}

export function MarketingShell({ children }) {
  return (
    <div className="min-h-dvh bg-base text-ink">
      <MarketingNav />
      <main className="pt-16">{children}</main>
      <MarketingFooter />
    </div>
  )
}