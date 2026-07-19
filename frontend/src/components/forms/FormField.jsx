import { cn } from '@/lib/utils'

export function FormField({ label, error, hint, required, children, className }) {
  return (
    <div className={cn('block', className)}>
      <div className="flex justify-between items-baseline mb-2">
        <label className="eyebrow">
          {label}
          {required ? ' *' : ''}
        </label>
        {hint ? <span className="text-[10px] text-ink-4">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        'w-full bg-base ring-hairline rounded-md px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 outline-none transition',
        'focus:ring-2 focus:ring-brand',
        error && 'ring-2 ring-red-500/50',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full bg-base ring-hairline rounded-md px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 outline-none transition resize-none',
        'focus:ring-2 focus:ring-brand',
        error && 'ring-2 ring-red-500/50',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
