import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className }) {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded',
        className,
      )}
      aria-label="PlacementPilot — Go to home"
    >
      <span className="relative inline-grid place-items-center size-6 rounded-sm bg-brand transition-all group-hover:scale-105">
        <span className="size-2 rounded-full bg-base" />
        <span className="absolute inset-0 rounded-sm ring-1 ring-brand/40" />
      </span>
      <span className="font-display font-semibold tracking-tight text-ink">
        PlacementPilot
      </span>
    </Link>
  )
}

export function Eyebrow({ children, className }) {
  return <div className={cn('eyebrow', className)}>{children}</div>
}

export function StatusPill({ tone = 'neutral', children }) {
  const tones = {
    brand: 'bg-brand-soft text-brand',
    accent: 'bg-accent-soft text-accent',
    danger: 'bg-red-500/10 text-red-400',
    neutral: 'bg-surface-2 text-ink-3',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        tones[tone] ?? tones.neutral,
      )}
    >
      <span className="size-1 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children}
    </span>
  )
}

export function Card({ children, className, as: _As = 'div' }) {
  return (
    <_As className={cn('bg-surface ring-hairline rounded-2xl p-6', className)}>
      {children}
    </_As>
  )
}

export function EmptyState({ icon, title, description, action, secondaryAction }) {
  return (
    <div
      className="ring-hairline rounded-2xl bg-surface/40 border border-dashed border-white/5 p-12 text-center"
      role="status"
      aria-label={title}
    >
      <div
        className="mx-auto size-10 rounded-full ring-hairline bg-surface grid place-items-center mb-4 text-lg"
        aria-hidden="true"
      >
        {icon ? <span>{icon}</span> : <span className="size-2 rounded-full bg-ink-4" />}
      </div>
      <h3 className="font-display text-lg font-medium text-ink mb-1">{title}</h3>
      {description ? (
        <p className="text-sm text-ink-3 max-w-sm mx-auto">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex items-center justify-center gap-2">{action}</div> : null}
      {secondaryAction ? (
        <div className="mt-3 flex items-center justify-center">{secondaryAction}</div>
      ) : null}
    </div>
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn('rounded bg-white/[0.06] animate-pulse', className)}
      aria-hidden="true"
    />
  )
}

export function KeyStat({ label, value, delta, tone = 'brand' }) {
  const tones = {
    brand: 'text-brand',
    accent: 'text-accent',
    danger: 'text-red-400',
  }
  return (
    <div>
      <div className="eyebrow mb-2" aria-hidden="true">
        {label}
      </div>
      <div
        className="font-display text-3xl text-ink font-semibold tabular-nums"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </div>
      {delta ? (
        <div className={cn('text-xs mt-1 font-mono', tones[tone] ?? tones.brand)} aria-label={delta}>
          {delta}
        </div>
      ) : null}
    </div>
  )
}

export function PriorityPill({ priority, children }) {
  const tones = {
    low: 'bg-neutral-500/10 text-neutral-400',
    medium: 'bg-accent-soft text-accent',
    high: 'bg-yellow-500/10 text-yellow-400',
    urgent: 'bg-red-500/10 text-red-400',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        tones[priority] ?? tones.medium,
      )}
    >
      <span className="size-1 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children || priority}
    </span>
  )
}

export function StagePill({ stage, children }) {
  const tones = {
    wishlist: 'bg-neutral-500/10 text-neutral-400',
    ready_to_apply: 'bg-accent-soft text-accent',
    applied: 'bg-brand-soft text-brand',
    online_assessment: 'bg-yellow-500/10 text-yellow-400',
    technical_interview: 'bg-accent-soft text-accent',
    managerial_interview: 'bg-accent-soft text-accent',
    hr_interview: 'bg-accent-soft text-accent',
    offer: 'bg-green-500/10 text-green-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    withdrawn: 'bg-neutral-500/10 text-neutral-400',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        tones[stage] ?? tones.neutral,
      )}
    >
      <span className="size-1 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children || stage}
    </span>
  )
}
