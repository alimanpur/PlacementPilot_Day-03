import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-brand text-[#05130d] ring-1 ring-brand hover:brightness-110 disabled:opacity-50',
  secondary: 'ring-hairline bg-surface text-ink hover:bg-surface-2 disabled:opacity-50',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink disabled:opacity-40',
  danger: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 disabled:opacity-50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-5 py-3 text-base rounded-md',
}

export const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-base disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  )
})
