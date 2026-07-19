import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/common/atoms'
import { cn } from '@/lib/utils'

export function AuthShell({ title, subtitle, children, footer, eyebrow }) {
  return (
    <div className="min-h-dvh bg-base text-ink grid lg:grid-cols-2">
      <motion.div
        className="flex flex-col p-8 lg:p-12"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
      >
        <Logo />
        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-sm">
            {eyebrow ? (
              <div className="eyebrow mb-3 text-brand" aria-hidden="true">{eyebrow}</div>
            ) : null}
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight">
              {title}
            </h1>
            {subtitle ? <p className="mt-3 text-ink-3">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-sm text-ink-3">{footer}</div> : null}
          </div>
        </div>
        <div className="text-[10px] font-mono text-ink-4 uppercase tracking-widest">
          <Link to="/" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
            ← Return to base
          </Link>
        </div>
      </motion.div>
      <aside className="hidden lg:block relative border-l border-hairline overflow-hidden">
        <AuthArtwork />
      </aside>
    </div>
  )
}

function AuthArtwork() {
  return (
    <motion.div
      className="absolute inset-0 bg-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 grid place-items-center">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/[0.04]"
            style={{ width: `${(i + 1) * 15}%`, aspectRatio: 1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center relative">
          <motion.div
            className="size-3 mx-auto rounded-full bg-brand shadow-[0_0_40px_rgba(16,185,129,0.6)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="mt-8 eyebrow text-brand">Boarding altitude</div>
          <div className="mt-2 font-display text-5xl text-ink tabular-nums">42,000 ft</div>
          <div className="mt-2 eyebrow">Approach vector · 274°</div>
        </div>
      </div>
      <div className="absolute top-6 left-6 eyebrow">PP-OS / v2.4.0</div>
      <div className="absolute top-6 right-6 eyebrow text-brand">● Nominal</div>
      <div className="absolute bottom-6 left-6 eyebrow">Lat 12.9716°N</div>
      <div className="absolute bottom-6 right-6 eyebrow">Lon 77.5946°E</div>
    </motion.div>
  )
}

export function Field({ label, name, type = 'text', placeholder, hint, required, error, register }) {
  return (
    <div className="block">
      <div className="flex justify-between items-baseline mb-2">
        <label htmlFor={name} className="eyebrow">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
        {hint ? <span className="text-[10px] text-ink-4">{hint}</span> : null}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        {...(register ? register(name) : {})}
        className={cn(
          'w-full bg-base rounded-md px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 outline-none transition',
          error
            ? 'ring-2 ring-danger/60 focus:ring-danger'
            : 'ring-hairline focus:ring-2 focus:ring-brand',
        )}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
