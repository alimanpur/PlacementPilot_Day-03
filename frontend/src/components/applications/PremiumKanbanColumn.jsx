import { motion } from 'framer-motion'
import { StagePill } from '@/components/common/atoms'
import { PremiumKanbanCard } from './PremiumKanbanCard'
import { cn, getStageLabel } from '@/lib/utils'
import { Plus, Inbox } from 'lucide-react'

const STAGE_COLORS = {
  wishlist: 'from-neutral-500/10 to-neutral-500/5',
  ready_to_apply: 'from-accent/10 to-accent/5',
  applied: 'from-brand/10 to-brand/5',
  online_assessment: 'from-yellow-500/10 to-yellow-500/5',
  technical_interview: 'from-accent/10 to-accent/5',
  managerial_interview: 'from-accent/10 to-accent/5',
  hr_interview: 'from-accent/10 to-accent/5',
  offer: 'from-green-500/10 to-green-500/5',
  accepted: 'from-green-500/10 to-green-500/5',
  rejected: 'from-red-500/10 to-red-500/5',
  withdrawn: 'from-neutral-500/10 to-neutral-500/5',
}

export function PremiumKanbanColumn({ stage, applications, onUpdate, onDelete, onArchive }) {
  const stageLabel = getStageLabel(stage.value)
  const colorClass = STAGE_COLORS[stage.value] || 'from-surface-2 to-surface'

  return (
    <motion.div
      layout
      className="flex flex-col min-w-[280px] max-w-[320px]"
    >
      {/* Column Header */}
      <div className={cn(
        'rounded-t-xl p-3 mb-2 border border-hairline border-b-0',
        `bg-gradient-to-b ${colorClass}`
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StagePill stage={stage.value}>{stageLabel}</StagePill>
          </div>
          <span className="text-xs font-mono text-ink-4 bg-surface/50 px-2 py-0.5 rounded-full">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-2 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto p-1">
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="size-12 rounded-full bg-surface-2 flex items-center justify-center mb-3">
              <Inbox className="size-6 text-ink-4" />
            </div>
            <p className="text-xs text-ink-3 mb-1">No applications in this stage</p>
            <p className="text-[10px] text-ink-4">Drag applications here or create a new one</p>
          </motion.div>
        ) : (
          applications.map((app) => (
            <PremiumKanbanCard
              key={app._id}
              application={app}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}