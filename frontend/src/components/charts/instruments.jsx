import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Signature instrument: the readiness dial */
export function ReadinessDial({ value, size = 200, label = 'Readiness', stroke = 4 }) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = 45
  const C = 2 * Math.PI * r
  const offset = C * (1 - clamped / 100)

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped.toFixed(1)}%`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth={stroke} className="stroke-white/5" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-brand"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1)' }}
        />
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * 360
          return (
            <line
              key={i}
              x1="50"
              y1="4"
              x2="50"
              y2={i % 3 === 0 ? 8 : 6}
              className="stroke-white/10"
              strokeWidth="0.4"
              transform={`rotate(${angle} 50 50)`}
              aria-hidden="true"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold text-ink leading-none tabular-nums">
          {clamped.toFixed(1)}
        </span>
        <span className="eyebrow mt-2">{label}</span>
      </div>
    </div>
  )
}

/** Consistency heatmap — 12 weeks x 7 days */
export function ConsistencyHeatmap({ data, cols = 14 }) {
  const shade = (v) => {
    if (v <= 0) return 'bg-white/5'
    if (v === 1) return 'bg-brand/20'
    if (v === 2) return 'bg-brand/45'
    if (v === 3) return 'bg-brand/70'
    return 'bg-brand'
  }

  return (
    <div className="space-y-1 w-full overflow-x-auto">
      <div
        className="grid gap-1 min-w-[280px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
        role="img"
        aria-label="Consistency heatmap showing activity over 12 weeks"
      >
        {data.map((v, i) => (
          <motion.div
            key={i}
            className={cn('aspect-square rounded-[3px]', shade(v))}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.004 }}
            title={`Intensity: ${v}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-ink-4 pt-2">
        <span>12 weeks ago</span>
        <div className="flex items-center gap-1" aria-label="Legend: less to more activity">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <span key={v} className={cn('size-2 rounded-[2px]', shade(v))} />
          ))}
          <span>more</span>
        </div>
        <span>today</span>
      </div>
    </div>
  )
}

/** Horizontal trajectory bar row */
export function TrajectoryRow({ code, progress, stage, tone = 'brand' }) {
  const bar = {
    brand: 'bg-brand',
    accent: 'bg-accent',
    muted: 'bg-white/15',
    danger: 'bg-red-500/70',
  }[tone]

  return (
    <div
      className="grid grid-cols-[6rem_minmax(0,1fr)_8rem] items-center gap-4"
      role="row"
      aria-label={`${code}: ${stage} at ${progress}%`}
    >
      <div className="text-xs font-mono text-ink-4 tracking-widest truncate">{code}</div>
      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className={cn('h-full rounded-full', bar)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
      <div className="text-right text-xs text-ink-2 font-medium truncate">{stage}</div>
    </div>
  )
}

/** Sparkline via SVG */
export function Spark({ values, className }) {
  const w = 120
  const h = 32
  const max = Math.max(...values, 1)
  const step = w / (values.length - 1 || 1)
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn('w-full', className)}
      aria-hidden="true"
    >
      <path d={d} fill="none" strokeWidth="1.5" className="stroke-brand" strokeLinecap="round" />
    </svg>
  )
}

/** Readiness breakdown bars */
export function ReadinessBars({ items }) {
  return (
    <div className="space-y-4" role="list" aria-label="Readiness breakdown">
      {items.map((it) => (
        <div key={it.label} role="listitem">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-ink-2">{it.label}</span>
            <span className="font-mono text-ink-3 tabular-nums">{it.value}%</span>
          </div>
          <div
            className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden"
            role="progressbar"
            aria-label={`${it.label}: ${it.value}%`}
            aria-valuenow={it.value}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-brand to-brand/70"
              initial={{ width: 0 }}
              animate={{ width: `${it.value}%` }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
